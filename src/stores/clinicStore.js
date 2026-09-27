import { writable } from 'svelte/store';
import { initialPatientProfile, initialImmutableRecords, initialTriageQueue, initialConsultantMessages, clinicRooms, timeSlots } from '../data/mockData.js';
import { loadCachedQueue, saveCachedQueue, recordLocalChange } from '../lib/offlineSync.js';

// Local storage key helper
const STORAGE_KEY = 'cliniks_state_v1';

function createClinicStore() {
  // Load persisted state if exists or use defaults
  const cachedQueue = loadCachedQueue();
  let initial = {
    currentUser: null, // User must fill login/signup to access their dashboard
    activeTab: 'HOME', // 'HOME' | 'AUTH' | 'PATIENT_DASHBOARD' | 'CLINICIAN_DASHBOARD' | 'NURSE_STATION' | 'VERIFY'
    authRole: 'PATIENT', // 'PATIENT' | 'CLINICIAN'
    triageQueue: (cachedQueue && cachedQueue.length > 0) ? cachedQueue : initialTriageQueue,
    immutableRecords: initialImmutableRecords,
    consultantMessages: initialConsultantMessages,
    activePatientAppointment: null,
    systemNotification: null,
    authToken: null
  };

  const store = writable(initial);
  const { subscribe, set, update } = store;

  // Auto-sync every state change with localStorage for offline resilience (Thesis Section 11)
  store.subscribe(state => {
    if (state && Array.isArray(state.triageQueue)) {
      saveCachedQueue(state.triageQueue);
    }
  });

  return {
    subscribe,
    set,
    update,

    setTab: (tab) => {
      update(state => ({ ...state, activeTab: tab }));
    },

    setAuthRole: (role) => {
      update(state => ({ ...state, authRole: role, activeTab: 'AUTH' }));
    },

    loginAsPatient: (patientData) => {
      // Async exchange credentials for JWT token
      if (typeof window !== 'undefined') {
        fetch('http://127.0.0.1:3001/api/auth/login-patient', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(patientData)
        })
          .then(res => res.json())
          .then(data => {
            if (data?.token) {
              update(s => ({ ...s, authToken: data.token }));
            }
          })
          .catch(() => {});
      }

      update(state => ({
        ...state,
        currentUser: {
          role: 'PATIENT',
          profile: {
            ...initialPatientProfile,
            ...state.currentUser?.profile,
            ...patientData
          }
        },
        activeTab: 'PATIENT_DASHBOARD',
        systemNotification: { type: 'success', message: 'Welcome, ' + (patientData.name || 'Patient') + '. Please complete your pre-consultation intake.' }
      }));
    },

    // Legacy alias — keep so any existing call to loginAsStudent still works
    loginAsStudent: (data) => clinicStore.loginAsPatient(data),

    loginAsClinician: (staffData) => {
      // Async exchange credentials for Clinician JWT token
      if (typeof window !== 'undefined') {
        fetch('http://127.0.0.1:3001/api/auth/login-clinician', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(staffData || {})
        })
          .then(res => res.json())
          .then(data => {
            if (data?.token) {
              update(s => ({ ...s, authToken: data.token }));
            }
          })
          .catch(() => {});
      }

      update(state => ({
        ...state,
        currentUser: {
          role: 'CLINICIAN',
          profile: {
            name: staffData?.name || 'Attending Physician',
            title: staffData?.title || 'Attending Clinical Consultant',
            staffId: staffData?.staffId || '',
            jajaOffice: staffData?.office || 'Clinic Wing A',
            avatar: staffData?.avatar || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300'
          }
        },
        activeTab: 'CLINICIAN_DASHBOARD',
        systemNotification: { type: 'success', message: 'Clinician triage portal authenticated.' }
      }));
    },

    logout: () => {
      update(state => ({
        ...state,
        currentUser: null,
        activeTab: 'HOME',
        systemNotification: null
      }));
    },

    markMessageAsRead: (id) => {
      update(state => ({
        ...state,
        consultantMessages: (state.consultantMessages || []).map(m => m.id === id ? { ...m, unread: false } : m)
      }));
    },

    markAllMessagesAsRead: () => {
      update(state => ({
        ...state,
        consultantMessages: (state.consultantMessages || []).map(m => ({ ...m, unread: false }))
      }));
    },

    updateStudentAvatar: (newAvatar) => {
      update(state => ({
        ...state,
        currentUser: state.currentUser ? {
          ...state.currentUser,
          profile: {
            ...state.currentUser.profile,
            avatar: newAvatar
          }
        } : null
      }));
    },

    // Dynamic AI Triage Engine (Seamless Offline-First + Real LLM Backend Sync)
    submitStudentIntake: (intakeData) => {
      let priority = 'ROUTINE';
      let urgencyScore = 25;
      let safetyWarnings = [];
      let suggestedRoom = 'Room 108 (General Consultation & Refills)';
      let suggestedSession = 'Afternoon Slot (1:30 PM)';

      const textToAnalyze = `${intakeData.complaint} ${intakeData.answers?.join(' ')}`.toLowerCase();

      // Rule-based clinical triage red-flags
      const criticalKeywords = ['chest pain', 'shortness of breath', 'difficulty breathing', 'stiff neck', 'high fever', 'unconscious', 'fainted', 'convulsion', 'heavy bleeding', 'severe allergic', 'anaphylaxis', 'suicidal'];
      const moderateKeywords = ['fracture', 'sprained', 'twisted ankle', 'vomiting', 'food poisoning', 'burn', 'deep cut', 'migraine', 'severe pain', 'asthma'];

      const hasCritical = criticalKeywords.some(kw => textToAnalyze.includes(kw)) || intakeData.painScale >= 8;
      const hasModerate = moderateKeywords.some(kw => textToAnalyze.includes(kw)) || intakeData.painScale >= 5;

      if (hasCritical) {
        priority = 'HIGH';
        urgencyScore = 95;
        safetyWarnings.push('CRITICAL RISK: Potential acute emergency requiring urgent physician evaluation.');
        if (textToAnalyze.includes('breath') || textToAnalyze.includes('asthma') || textToAnalyze.includes('chest')) {
          suggestedRoom = 'Room 102 (Emergency & Nebulization Bay)';
        } else {
          suggestedRoom = 'Room 101 (Isolation & Acute Triage)';
        }
        suggestedSession = 'Immediate Stat (Within 10 Mins)';
      } else if (hasModerate) {
        priority = 'MODERATE';
        urgencyScore = 65;
        safetyWarnings.push('Elevated discomfort or functional impairment. Same-day clinical assessment indicated.');
        suggestedRoom = 'Room 204 (Orthopedic & Minor Procedures)';
        suggestedSession = 'Morning Session (11:00 AM)';
      } else {
        priority = 'ROUTINE';
        urgencyScore = 20;
        safetyWarnings.push('Stable non-emergency profile.');
        suggestedRoom = 'Room 108 (General Consultation & Refills)';
        suggestedSession = 'Afternoon Slot (2:00 PM)';
      }

      // System strictly and sequentially issues the official OPD queue number
      let nextSeq = 1;
      let currentState;
      const unsub = subscribe(s => currentState = s);
      unsub();

      if (currentState?.triageQueue?.length > 0) {
        const parsedNums = currentState.triageQueue
          .map(item => parseInt(item.queueNo, 10))
          .filter(n => !isNaN(n));
        if (parsedNums.length > 0) {
          nextSeq = Math.max(...parsedNums) + 1;
        } else {
          nextSeq = currentState.triageQueue.length + 1;
        }
      }
      const systemAssignedQueueNo = String(nextSeq).padStart(3, '0');

      const newTriageEntry = {
        id: `TRG-${Date.now().toString().slice(-4)}`,
        queueNo: systemAssignedQueueNo,
        patientName: intakeData.patientName || intakeData.studentName || 'Patient',
        hospitalCardNo: intakeData.hospitalCardNo || intakeData.matricNo || '',
        age: intakeData.age || '',
        gender: intakeData.gender || '',
        intakeMode: intakeData.intakeMode || 'SELF_WALKIN',
        contactPhone: intakeData.contactPhone || '',
        presentationType: intakeData.presentationType || 'Walk-in alone',
        primaryLanguage: intakeData.primaryLanguage || 'English',
        clerkSignature: intakeData.clerkSignature || 'Triage Desk Nurse / OPD Clerk',
        submittedAt: 'Just now',
        complaint: intakeData.complaint,
        duration: intakeData.duration || 'Not specified',
        painScale: intakeData.painScale || 3,
        answers: intakeData.answers || [],
        aiTriage: {
          suggestedPriority: priority,
          urgencyScore: urgencyScore,
          patientBrief: `Patient reports: "${intakeData.complaint}". Pain level ${intakeData.painScale}/10. Duration: ${intakeData.duration}. Additional clinical responses: ${intakeData.answers?.length ? intakeData.answers.join('; ') : 'None provided'}.`,
          safetyWarnings: safetyWarnings,
          suggestedRoom: suggestedRoom,
          recommendedSession: suggestedSession,
          source: 'LOCAL_OPTIMISTIC_HEURISTIC'
        },
        status: 'PENDING_APPROVAL',
        clinicianNotes: '',
        assignedRoom: suggestedRoom,
        assignedSession: suggestedSession
      };

      // Optimistic instant client update
      update(state => ({
        ...state,
        triageQueue: [newTriageEntry, ...state.triageQueue],
        activePatientAppointment: newTriageEntry,
        systemNotification: {
          type: 'success',
          message: 'Intake submitted! Initial triage: ' + priority + ' priority. Syncing with clinical server...'
        }
      }));

      // Async sync with real backend / LLM if server is running
      if (typeof window !== 'undefined') {
        fetch('http://127.0.0.1:3001/api/triage/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(intakeData)
        })
          .then(res => res.json())
          .then(data => {
            if (data?.success && data?.case) {
              update(state => ({
                ...state,
                triageQueue: state.triageQueue.map(c => c.id === newTriageEntry.id ? data.case : c),
                activePatientAppointment: state.activePatientAppointment?.id === newTriageEntry.id ? data.case : state.activePatientAppointment,
                systemNotification: {
                  type: 'success',
                  message: `Intake verified by ${data.case.aiTriage?.source || 'Server'} (${data.case.aiTriage?.suggestedPriority} Priority).`
                }
              }));
            }
          })
          .catch(() => {
            // Local mode remains active silently
          });
      }

      return newTriageEntry;
    },

    // Clinician 1-Click Approval
    approveTriage: (triageId, options = {}) => {
      // Async sync with backend
      if (typeof window !== 'undefined') {
        fetch(`http://127.0.0.1:3001/api/triage/${triageId}/approve`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(options)
        }).catch(() => {});
      }

      update(state => {
        const updatedQueue = state.triageQueue.map(item => {
          if (item.id === triageId) {
            return {
              ...item,
              status: 'APPROVED',
              assignedRoom: options.room || item.assignedRoom || item.aiTriage.suggestedRoom,
              assignedSession: options.session || item.assignedSession || item.aiTriage.recommendedSession,
              clinicianNotes: options.notes || 'AI Triage reviewed and verified by attending consultant.',
              encounterOutcome: options.outcome || item.encounterOutcome || (options.notes?.includes('Prescription') ? 'PRESCRIPTION' : options.notes?.includes('Laboratory') ? 'LAB' : options.notes?.includes('Referral') ? 'REFERRAL' : 'DISCHARGE')
            };
          }
          return item;
        });

        // Also update patient active appointment if it matches
        let updatedAppt = state.activePatientAppointment;
        if (updatedAppt && updatedAppt.id === triageId) {
          const approvedItem = updatedQueue.find(i => i.id === triageId);
          updatedAppt = approvedItem;
        }

        return {
          ...state,
          triageQueue: updatedQueue,
          activePatientAppointment: updatedAppt,
          systemNotification: { type: 'success', message: `Case ${triageId} APPROVED. Room assigned & notification dispatched to patient.` }
        };
      });
    },

    // Clinician Override
    overrideTriage: (triageId, { newPriority, room, session, notes }) => {
      // Async sync with backend
      if (typeof window !== 'undefined') {
        fetch(`http://127.0.0.1:3001/api/triage/${triageId}/override`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ newPriority, room, session, notes })
        }).catch(() => {});
      }

      update(state => {
        const updatedQueue = state.triageQueue.map(item => {
          if (item.id === triageId) {
            return {
              ...item,
              status: 'OVERRIDDEN',
              aiTriage: {
                ...item.aiTriage,
                suggestedPriority: newPriority
              },
              assignedRoom: room,
              assignedSession: session,
              clinicianNotes: notes || 'Clinician adjusted priority and instructions after secondary assessment.'
            };
          }
          return item;
        });

        let updatedAppt = state.activePatientAppointment;
        if (updatedAppt && updatedAppt.id === triageId) {
          updatedAppt = updatedQueue.find(i => i.id === triageId);
        }

        return {
          ...state,
          triageQueue: updatedQueue,
          activePatientAppointment: updatedAppt,
          systemNotification: { type: 'warning', message: `Case ${triageId} OVERRIDDEN by Clinician. Dispatched with revised instructions.` }
        };
      });
    },

    // Clinician Radial Scheduler & Badge Issuance (Emergency vs Check-Up)
    schedulePatient: (triageId, { scheduledTime, score, section, room, notes, briefEdits }) => {
      recordLocalChange('SCHEDULE_PATIENT', { triageId, scheduledTime, score, section });
      update(state => {
        const numericScore = Number(score) || 5;
        const isEmg = section === 'EMERGENCY' || numericScore >= 8;
        const targetSection = isEmg ? 'EMERGENCY' : 'CHECK_UP';
        const prefix = isEmg ? 'EMG' : 'CHK';
        const count = state.triageQueue.filter(p => p.assignedSection === targetSection || p.assignedBadge?.startsWith(prefix)).length;
        const badge = `${prefix}-${String(count + 1).padStart(3, '0')}`;

        const updatedQueue = state.triageQueue.map(item => {
          if (item.id === triageId) {
            return {
              ...item,
              status: 'APPROVED',
              scheduledTime: scheduledTime,
              assignedSection: targetSection,
              assignedBadge: badge,
              assignedRoom: room || item.assignedRoom || (isEmg ? 'Room 101 (Emergency & Acute Bay)' : 'Room 104 (General Physician 1)'),
              clinicianNotes: notes || item.clinicianNotes || ' Urgency verified and arrival time scheduled by attending clinician.',
              aiBrief: {
                ...item.aiBrief,
                chiefComplaint: briefEdits?.chiefComplaint || item.aiBrief?.chiefComplaint || item.complaint,
                symptomTimeline: briefEdits?.symptomTimeline || item.aiBrief?.symptomTimeline || `Duration: ${item.duration}. Pain: ${numericScore}/10`,
                redFlags: briefEdits?.redFlags || item.aiBrief?.redFlags || (item.aiTriage?.safetyWarnings?.length ? item.aiTriage.safetyWarnings : ['None detected']),
                preliminaryScore: numericScore,
                suggestedSection: targetSection
              },
              aiTriage: {
                ...item.aiTriage,
                urgencyScore: numericScore * 10,
                suggestedPriority: numericScore >= 8 ? 'HIGH' : numericScore >= 5 ? 'MODERATE' : 'ROUTINE'
              }
            };
          }
          return item;
        });

        let updatedAppt = state.activePatientAppointment;
        if (updatedAppt && updatedAppt.id === triageId) {
          updatedAppt = updatedQueue.find(i => i.id === triageId);
        }

        return {
          ...state,
          triageQueue: updatedQueue,
          activePatientAppointment: updatedAppt,
          systemNotification: {
            type: 'success',
            message: `Patient scheduled for ${scheduledTime} (${targetSection === 'EMERGENCY' ? 'Emergency Section' : 'Check-Up Section'}, Badge ${badge}).`
          }
        };
      });
    },

    // Save Patient Vitals (Thesis Stage 3)
    savePatientVitals: (patientId, vitalsData) => {
      recordLocalChange('SAVE_VITALS', { patientId, vitalsData });
      update(state => {
        const updatedQueue = state.triageQueue.map(item => {
          if (item.id === patientId) {
            let revisedPriority = item.aiTriage?.suggestedPriority;
            let warnings = [...(item.aiTriage?.safetyWarnings || [])];

            if (vitalsData.hasCriticalVital) {
              revisedPriority = 'HIGH';
              warnings.push(`CRITICAL VITALS: ${vitalsData.bp}, Temp: ${vitalsData.temperature}°C, SpO2: ${vitalsData.spo2}%.`);
            }

            return {
              ...item,
              vitals: vitalsData,
              vitalsRecorded: true,
              aiTriage: {
                ...item.aiTriage,
                suggestedPriority: revisedPriority,
                safetyWarnings: Array.from(new Set(warnings))
              }
            };
          }
          return item;
        });

        return {
          ...state,
          triageQueue: updatedQueue,
          systemNotification: {
            type: vitalsData.hasCriticalVital ? 'warning' : 'success',
            message: `Vitals recorded for patient. ${vitalsData.hasCriticalVital ? '⚠️ Critical vital signs escalated for physician.' : 'Ready for consultation.'}`
          }
        };
      });
    },

    // Mark Patient Ready for Doctor
    markPatientReadyForDoctor: (patientId) => {
      recordLocalChange('MARK_READY_FOR_DOCTOR', { patientId });
      update(state => ({
        ...state,
        triageQueue: state.triageQueue.map(p => p.id === patientId ? { ...p, readyForDoctor: true } : p),
        systemNotification: {
          type: 'success',
          message: 'Patient marked ready for consultation.'
        }
      }));
    },

    // Clear alert
    clearNotification: () => {
      update(state => ({ ...state, systemNotification: null }));
    }
  };
}

export const clinicStore = createClinicStore();
