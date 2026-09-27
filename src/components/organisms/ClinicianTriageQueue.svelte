<script>
  import { clinicStore } from '../../stores/clinicStore.js';
  import { clinicRooms, timeSlots } from '../../data/mockData.js';
  import UrgencyBadge from '../molecules/UrgencyBadge.svelte';
  import RadialTimePicker from '../molecules/RadialTimePicker.svelte';
  import ClinicalReportModal from '../molecules/ClinicalReportModal.svelte';
  import { 
    Search,
    Filter,
    ArrowLeft,
    Check, 
    X, 
    AlertTriangle, 
    Clock, 
    MapPin, 
    User, 
    Sparkles, 
    CheckCircle2,
    FlaskConical,
    Pill,
    Home,
    Ambulance,
    ShieldAlert, 
    Stethoscope,
    FileText,
    ChevronRight,
    ArrowUpDown,
    Calendar,
    Save,
    FileCheck,
    Send,
    Edit3,
    Activity,
    Zap
  } from 'lucide-svelte';

  $: queue = $clinicStore.triageQueue || [];

  // View state: selectedPatient is null -> Full Patient List; selectedPatient is object -> Clinical Workstation
  let selectedPatient = null;

  // Search & Filter state for Patient List Table
  let searchQuery = '';
  let sectionFilter = 'ALL'; // 'ALL' | 'EMERGENCY' | 'CHECK_UP' | 'AWAITING'
  let sortBy = 'URGENCY'; // 'URGENCY' | 'TIME' | 'NAME'

  // Editable Brief State
  let editableComplaint = '';
  let editableTimeline = '';
  let selectedUrgencyScore = 5;
  let showSchedulerModal = false;

  // Clinician Encounter Action State (The Authority Zone)
  let doctorNotes = '';
  let assignedRoom = clinicRooms[0];
  let assignedSession = timeSlots[0];
  let encounterOutcome = 'DISCHARGE'; // 'LAB' | 'PRESCRIPTION' | 'DISCHARGE' | 'REFERRAL'
  let isSavingOutcome = false;
  let saveFeedbackMessage = '';
  let showClinicalReportModal = false;

  const arrivalLabels = {
    SELF_WALKIN: { icon: '🚶', text: 'Self Walk-in' },
    STAFF_ASSISTED: { icon: '🩺', text: 'Staff-Assisted' },
    REFERRED: { icon: '📋', text: 'Referred from Unit' },
    BROUGHT_IN: { icon: '👥', text: 'Accompanied' }
  };

  // Section Counts
  $: emergencyCount = queue.filter(q => 
    q.assignedSection === 'EMERGENCY' || 
    (q.aiBrief?.preliminaryScore >= 8) || 
    (q.aiTriage?.suggestedPriority === 'HIGH')
  ).length;

  $: checkUpCount = queue.filter(q => 
    q.assignedSection === 'CHECK_UP' || 
    (q.aiBrief && q.aiBrief.preliminaryScore < 8 && q.assignedSection !== 'EMERGENCY') ||
    (!q.assignedSection && q.aiTriage?.suggestedPriority !== 'HIGH')
  ).length;

  $: awaitingCount = queue.filter(q => 
    q.status === 'PENDING_APPROVAL' || !q.scheduledTime
  ).length;

  // Filtered and Sorted Patients
  $: filteredPatients = queue.filter(item => {
    const isEmg = item.assignedSection === 'EMERGENCY' || (item.aiBrief?.preliminaryScore >= 8) || (item.aiTriage?.suggestedPriority === 'HIGH');
    const isChk = item.assignedSection === 'CHECK_UP' || (!isEmg && item.assignedSection !== 'EMERGENCY');

    if (sectionFilter === 'AWAITING' && item.status !== 'PENDING_APPROVAL' && item.scheduledTime) return false;
    if (sectionFilter === 'EMERGENCY' && !isEmg) return false;
    if (sectionFilter === 'CHECK_UP' && !isChk) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const name = (item.patientName || item.studentName || '').toLowerCase();
      const card = (item.hospitalCardNo || item.matricNo || '').toLowerCase();
      const complaint = (item.complaint || '').toLowerCase();
      const badge = (item.assignedBadge || '').toLowerCase();
      return name.includes(q) || card.includes(q) || complaint.includes(q) || badge.includes(q);
    }
    return true;
  }).sort((a, b) => {
    if (sortBy === 'URGENCY') {
      const scoreA = a.aiBrief?.preliminaryScore || (a.aiTriage?.urgencyScore ? Math.round(a.aiTriage.urgencyScore / 10) : 5);
      const scoreB = b.aiBrief?.preliminaryScore || (b.aiTriage?.urgencyScore ? Math.round(b.aiTriage.urgencyScore / 10) : 5);
      return scoreB - scoreA;
    }
    if (sortBy === 'NAME') {
      const nameA = a.patientName || a.studentName || '';
      const nameB = b.patientName || b.studentName || '';
      return nameA.localeCompare(nameB);
    }
    return 0;
  });

  // Keep selectedPatient synchronized with store updates
  $: if (selectedPatient) {
    const updated = queue.find(q => q.id === selectedPatient.id);
    if (updated) {
      selectedPatient = updated;
    }
  }

  function handleSelectPatient(p) {
    selectedPatient = p;
    editableComplaint = p.aiBrief?.chiefComplaint || p.complaint || '';
    editableTimeline = p.aiBrief?.symptomTimeline || `Onset: ${p.onset || 'gradual'}. Duration: ${p.duration || '1-2 days'}. Discomfort: ${p.painScale || 5}/10`;
    selectedUrgencyScore = p.aiBrief?.preliminaryScore || (p.aiTriage?.urgencyScore ? Math.round(p.aiTriage.urgencyScore / 10) : 5);
    assignedRoom = p.assignedRoom || p.aiTriage?.suggestedRoom || clinicRooms[0];
    assignedSession = p.assignedSession || p.aiTriage?.recommendedSession || timeSlots[0];
    doctorNotes = p.clinicianNotes || '';
    saveFeedbackMessage = '';
  }

  function handleBackToList() {
    selectedPatient = null;
    showSchedulerModal = false;
  }

  function handleScheduleConfirm(event) {
    const { time, isImmediate, section, score } = event.detail;
    const finalScore = score !== undefined ? score : selectedUrgencyScore;

    clinicStore.schedulePatient(selectedPatient.id, {
      scheduledTime: time,
      score: finalScore,
      section: section,
      room: assignedRoom,
      notes: doctorNotes,
      briefEdits: {
        chiefComplaint: editableComplaint,
        symptomTimeline: editableTimeline,
        redFlags: selectedPatient.aiBrief?.redFlags || selectedPatient.aiTriage?.safetyWarnings || ['None detected (stable profile)']
      }
    });

    showSchedulerModal = false;
    saveFeedbackMessage = `Scheduled for ${time}. Badge issued to ${section === 'EMERGENCY' ? 'Emergency' : 'Check-Up'} Section!`;
    setTimeout(() => saveFeedbackMessage = '', 4000);
  }

  function handleScoreSelect(val) {
    selectedUrgencyScore = val;
  }

  function handleSaveDoctorNotes() {
    if (!selectedPatient) return;
    clinicStore.approveTriage(selectedPatient.id, {
      room: assignedRoom,
      session: assignedSession,
      notes: doctorNotes
    });
    saveFeedbackMessage = 'Clinical notes saved.';
    setTimeout(() => saveFeedbackMessage = '', 3000);
  }

  function handleCallPatient() {
    if (!selectedPatient) return;
    clinicStore.approveTriage(selectedPatient.id, {
      room: assignedRoom,
      session: assignedSession,
      notes: doctorNotes || 'Patient summoned into consulting room by attending physician.'
    });
    saveFeedbackMessage = `Patient ${selectedPatient.patientName} summoned to ${assignedRoom}!`;
    setTimeout(() => saveFeedbackMessage = '', 3000);
  }

  function handleCompleteEncounter() {
    if (!selectedPatient) return;
    isSavingOutcome = true;
    const outcomeLabel = {
      LAB: 'Sent to Laboratory / Diagnostic Orders Placed',
      PRESCRIPTION: 'Sent to Pharmacy / Prescription Authorized',
      DISCHARGE: 'Outpatient Care Complete / Discharged with Advice',
      REFERRAL: 'Specialist Referral Initiated'
    }[encounterOutcome] || 'Consultation Completed';

    const note = doctorNotes 
      ? `[${outcomeLabel}] ${doctorNotes}`
      : `[${outcomeLabel}] Patient assessed and managed by attending physician in ${assignedRoom}.`;

    clinicStore.approveTriage(selectedPatient.id, {
      room: assignedRoom,
      session: assignedSession,
      notes: note
    });

    setTimeout(() => {
      isSavingOutcome = false;
      saveFeedbackMessage = `Encounter signed & recorded (${outcomeLabel}).`;
      showClinicalReportModal = true;
      setTimeout(() => saveFeedbackMessage = '', 3500);
    }, 300);
  }

  // Keyboard navigation shortcuts
  function handleGlobalKeydown(e) {
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) {
      if (e.key === 'Escape') {
        document.activeElement.blur();
      }
      return;
    }

    if (!selectedPatient) {
      if (e.key === 'Enter') {
        e.preventDefault();
        const topCase = filteredPatients.find(p => (p.aiBrief?.preliminaryScore >= 8) || (p.aiTriage?.suggestedPriority === 'HIGH')) || filteredPatients[0];
        if (topCase) handleSelectPatient(topCase);
      } else if (e.key === '/') {
        e.preventDefault();
        const searchInput = document.getElementById('clinicianSearchInput');
        if (searchInput) searchInput.focus();
      }
    } else {
      if (e.key === 'Escape') {
        e.preventDefault();
        if (showSchedulerModal) {
          showSchedulerModal = false;
        } else {
          handleBackToList();
        }
      }
    }
  }
</script>

<svelte:window on:keydown={handleGlobalKeydown} />

<!-- ========================================================================= -->
<!-- 1. FULL PATIENT LIST WINDOW (Clean Medical EHR Standard)                  -->
<!-- ========================================================================= -->
{#if !selectedPatient}
  <div class="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden text-slate-900 animate-in fade-in duration-100 font-sans">
    
    <!-- Top Search & Controls Bar -->
    <div class="p-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white">
      
      <!-- Title & Queue Counter -->
      <div class="flex items-center gap-2.5">
        <h3 class="text-base font-bold tracking-tight text-slate-900">OPD Patient Triage &amp; Scheduling</h3>
        <span class="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 text-xs font-mono font-bold border border-slate-200">
          {queue.length} Active
        </span>
      </div>

      <!-- Controls: Search & Sort -->
      <div class="flex flex-wrap items-center gap-3">
        <!-- Search -->
        <div class="relative min-w-[220px] sm:min-w-[280px]">
          <Search class="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="clinicianSearchInput"
            type="text"
            bind:value={searchQuery}
            placeholder="Search patient, badge, complaint ('/')..."
            class="w-full pl-8 pr-10 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white font-medium"
          />
          <span class="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-400 bg-slate-200/60 px-1.5 py-0.5 rounded pointer-events-none">/</span>
        </div>

        <!-- Sort -->
        <div class="flex items-center gap-1.5 text-xs text-slate-600">
          <span class="text-slate-500 font-semibold text-[11px]">Sort:</span>
          <select
            bind:value={sortBy}
            class="py-1.5 px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="URGENCY">Urgency Score (10 → 1)</option>
            <option value="NAME">Name (A-Z)</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Section Filter Tabs -->
    <div class="px-4 py-2 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between gap-2 overflow-x-auto text-xs">
      <div class="flex items-center gap-2 shrink-0">
        <button
          type="button"
          on:click={() => sectionFilter = 'ALL'}
          class="px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer {sectionFilter === 'ALL' ? 'bg-[#0F172A] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'}"
        >
          All Patients ({queue.length})
        </button>

        <button
          type="button"
          on:click={() => sectionFilter = 'AWAITING'}
          class="px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 {sectionFilter === 'AWAITING' ? 'bg-amber-600 text-white shadow-xs' : 'text-amber-800 hover:bg-amber-100'}"
        >
          <Clock class="w-3 h-3" />
          <span>Awaiting Schedule ({awaitingCount})</span>
        </button>

        <button
          type="button"
          on:click={() => sectionFilter = 'EMERGENCY'}
          class="px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 {sectionFilter === 'EMERGENCY' ? 'bg-red-600 text-white shadow-xs' : 'text-red-700 hover:bg-red-100'}"
        >
          <Zap class="w-3 h-3" />
          <span>Emergency Section ({emergencyCount})</span>
        </button>

        <button
          type="button"
          on:click={() => sectionFilter = 'CHECK_UP'}
          class="px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 {sectionFilter === 'CHECK_UP' ? 'bg-blue-600 text-white shadow-xs' : 'text-blue-700 hover:bg-blue-100'}"
        >
          <Activity class="w-3 h-3" />
          <span>Check-Up Section ({checkUpCount})</span>
        </button>
      </div>

      <span class="text-[11px] text-slate-400 font-mono shrink-0 hidden sm:inline">
        [Enter] = Open Top Urgent &bull; [Esc] = Return
      </span>
    </div>

    <!-- Patient Table -->
    <div class="overflow-x-auto">
      <table class="w-full text-left border-collapse text-xs">
        <thead>
          <tr class="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[11px] font-mono">
            <th class="py-3 px-4 w-28">Badge / Ref</th>
            <th class="py-3 px-4">Patient Identity</th>
            <th class="py-3 px-3 text-center w-28">Urgency Score</th>
            <th class="py-3 px-3">Chief Complaint</th>
            <th class="py-3 px-3">Scheduled Time</th>
            <th class="py-3 px-3">Section</th>
            <th class="py-3 px-4 text-right">Action</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          {#if filteredPatients.length === 0}
            <tr>
              <td colspan="7" class="text-center py-12 text-slate-500 font-medium text-xs">
                No patients match the search or filter criteria.
              </td>
            </tr>
          {:else}
            {#each filteredPatients as patient}
              {@const score = patient.aiBrief?.preliminaryScore || (patient.aiTriage?.urgencyScore ? Math.round(patient.aiTriage.urgencyScore / 10) : 5)}
              {@const isEmg = patient.assignedSection === 'EMERGENCY' || score >= 8}
              <tr 
                on:click={() => handleSelectPatient(patient)}
                class="border-b border-slate-100 hover:bg-blue-50/50 hover:border-l-4 hover:border-l-blue-600 transition-all cursor-pointer group bg-white"
              >
                <!-- Badge / Queue Number -->
                <td class="py-3 px-4 font-mono font-bold align-middle">
                  {#if patient.assignedBadge}
                    <span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold font-mono border
                      {patient.assignedBadge.startsWith('EMG') ? 'bg-red-100 text-red-800 border-red-200' : 'bg-blue-100 text-blue-800 border-blue-200'}">
                      {patient.assignedBadge}
                    </span>
                  {:else}
                    <span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono text-slate-600 bg-slate-100 border border-slate-200">
                      #{patient.queueNo || patient.id?.slice(-3)}
                    </span>
                  {/if}
                </td>

                <!-- Patient Identity & Card -->
                <td class="py-3 px-4 align-middle">
                  <div>
                    <p class="font-bold text-slate-900 group-hover:text-blue-600 transition-colors text-xs leading-tight">
                      {patient.patientName || patient.studentName || 'Patient'}
                    </p>
                    <p class="text-[11px] text-slate-500 font-mono mt-0.5">
                      Card: <strong class="text-slate-700">{patient.hospitalCardNo || 'GH-OPD'}</strong> &bull; {patient.age || 'Adult'}y ({patient.gender || 'N/A'})
                    </p>
                  </div>
                </td>

                <!-- Urgency Score (1-10) -->
                <td class="py-3 px-3 align-middle text-center">
                  <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-mono font-bold text-xs border
                    {score >= 8 ? 'bg-red-50 text-red-700 border-red-200' : score >= 5 ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-50 text-slate-700 border-slate-200'}">
                    <span class="text-sm font-extrabold">{score}</span>
                    <span class="text-[10px] text-slate-400">/10</span>
                  </div>
                </td>

                <!-- Chief Complaint -->
                <td class="py-3 px-3 max-w-xs align-middle">
                  <p class="text-xs text-slate-900 font-medium line-clamp-1">
                    "{patient.complaint}"
                  </p>
                  <p class="text-[10px] text-slate-500 font-mono mt-0.5">
                    Duration: {patient.duration || 'N/A'} &bull; Pain: {patient.painScale || '?'}/10
                  </p>
                </td>

                <!-- Scheduled Time -->
                <td class="py-3 px-3 align-middle font-mono text-xs whitespace-nowrap">
                  {#if patient.scheduledTime}
                    <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
                      <Clock class="w-3 h-3 text-emerald-600" />
                      <span>{patient.scheduledTime}</span>
                    </span>
                  {:else}
                    <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-semibold text-[11px]">
                      <Clock class="w-3 h-3 text-amber-600" />
                      <span>Awaiting Schedule</span>
                    </span>
                  {/if}
                </td>

                <!-- Section -->
                <td class="py-3 px-3 align-middle whitespace-nowrap">
                  {#if isEmg}
                    <span class="inline-flex items-center gap-1 text-[11px] font-bold text-red-800 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                      Emergency
                    </span>
                  {:else}
                    <span class="inline-flex items-center gap-1 text-[11px] font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      Check-Up
                    </span>
                  {/if}
                </td>

                <!-- Action Button -->
                <td class="py-3 px-4 text-right whitespace-nowrap align-middle">
                  <button
                    type="button"
                    class="px-3 py-1.5 rounded-lg bg-slate-900 group-hover:bg-blue-600 text-white font-bold text-xs transition-colors inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>Review &amp; Schedule</span>
                    <ChevronRight class="w-3 h-3" />
                  </button>
                </td>
              </tr>
            {/each}
          {/if}
        </tbody>
      </table>
    </div>

    <!-- Footer -->
    <div class="px-4 py-2.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500 font-mono">
      <span>Showing <strong>{filteredPatients.length}</strong> of <strong>{queue.length}</strong> OPD entries</span>
      <span>CLINIKS &bull; Decision Support &amp; Scheduling Engine</span>
    </div>

  </div>
{/if}

<!-- ========================================================================= -->
<!-- 2. CLINICAL WORKSTATION / PATIENT DETAIL & RADIAL SCHEDULER               -->
<!-- ========================================================================= -->
{#if selectedPatient}
  {@const currentScore = selectedUrgencyScore}
  {@const isEmergencyTier = currentScore >= 8}
  <div class="space-y-4 text-slate-900 animate-in fade-in duration-100 pb-28 font-sans">
    
    <!-- Top Navigation Header -->
    <div class="flex items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
      <div class="flex items-center gap-2 text-xs font-semibold">
        <button
          type="button"
          on:click={handleBackToList}
          class="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 cursor-pointer"
        >
          <ArrowLeft class="w-4 h-4" />
          <span>Patient Queue [Esc]</span>
        </button>
        <span class="text-slate-300 font-bold">/</span>
        <span class="text-slate-900 font-bold">{selectedPatient.patientName || selectedPatient.studentName}</span>
      </div>

      <div class="flex items-center gap-2">
        {#if saveFeedbackMessage}
          <span class="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200 animate-in fade-in">
            {saveFeedbackMessage}
          </span>
        {/if}

        <button
          type="button"
          on:click={handleCallPatient}
          class="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
        >
          <Stethoscope class="w-3.5 h-3.5 text-white" />
          <span>Summon to Room</span>
        </button>
      </div>
    </div>

    <!-- Main 3-Column Layout -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
      
      <!-- =================================================================== -->
      <!-- PANEL 1 (LEFT 3 COLS): QUEUE SWITCHER                               -->
      <!-- =================================================================== -->
      <div class="lg:col-span-3 bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs space-y-3">
        <div class="flex items-center justify-between border-b border-slate-100 pb-2">
          <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">Queue Roster</span>
          <span class="text-[11px] font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
            {queue.length} Total
          </span>
        </div>

        <div class="space-y-1.5 max-h-[600px] overflow-y-auto">
          {#each queue as item}
            {@const itemScore = item.aiBrief?.preliminaryScore || (item.aiTriage?.urgencyScore ? Math.round(item.aiTriage.urgencyScore / 10) : 5)}
            <button
              type="button"
              on:click={() => handleSelectPatient(item)}
              class="w-full text-left p-2.5 rounded-lg border transition-all cursor-pointer flex items-center gap-2.5
                {selectedPatient.id === item.id 
                  ? 'border-blue-500 bg-blue-50/60 ring-1 ring-blue-500 shadow-xs' 
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'}"
            >
              <span class="w-2.5 h-2.5 rounded-full shrink-0
                {itemScore >= 8 ? 'bg-red-600' : itemScore >= 5 ? 'bg-amber-500' : 'bg-slate-400'}">
              </span>
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between gap-1">
                  <p class="text-xs font-bold text-slate-900 truncate">
                    {item.patientName || 'Patient'}
                  </p>
                  <span class="text-[10px] font-mono font-bold text-slate-500">{item.assignedBadge || `#${item.queueNo || item.id?.slice(-3)}`}</span>
                </div>
                <div class="flex items-center justify-between text-[10px] text-slate-500 font-mono mt-0.5">
                  <span class="truncate">{item.scheduledTime || 'Unscheduled'}</span>
                  <span>{itemScore}/10</span>
                </div>
              </div>
            </button>
          {/each}
        </div>
      </div>

      <!-- =================================================================== -->
      <!-- PANEL 2 (CENTER 5.5 COLS): 3-PART AI BRIEF & 1-10 URGENCY SCORING   -->
      <!-- =================================================================== -->
      <div class="lg:col-span-5 space-y-4">
        
        <!-- Patient Identity Banner -->
        <div class="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-center gap-3">
              <div class="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 font-extrabold text-lg flex items-center justify-center border border-blue-200 shrink-0">
                {selectedPatient.patientName ? selectedPatient.patientName.charAt(0) : 'P'}
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <h4 class="text-base font-bold text-slate-900">
                    {selectedPatient.patientName || selectedPatient.studentName}
                  </h4>
                  {#if selectedPatient.assignedBadge}
                    <span class="text-[11px] font-mono font-bold px-2 py-0.5 rounded border
                      {selectedPatient.assignedBadge.startsWith('EMG') ? 'bg-red-100 text-red-800 border-red-300' : 'bg-blue-100 text-blue-800 border-blue-300'}">
                      {selectedPatient.assignedBadge}
                    </span>
                  {/if}
                </div>
                <p class="text-xs text-slate-500 font-mono mt-0.5">
                  Card: <strong class="text-slate-800">{selectedPatient.hospitalCardNo || 'GH-OPD'}</strong> &bull;
                  Age: <strong class="text-slate-800">{selectedPatient.age || 'Adult'}</strong> &bull;
                  Gender: <strong class="text-slate-800">{selectedPatient.gender || 'N/A'}</strong>
                </p>
              </div>
            </div>

            <!-- Assigned Section Badge -->
            <div class="text-right">
              <span class="inline-block text-xs font-bold px-2.5 py-1 rounded-lg border font-mono
                {isEmergencyTier ? 'bg-red-50 text-red-700 border-red-300' : 'bg-blue-50 text-blue-700 border-blue-300'}">
                {isEmergencyTier ? 'Emergency Section' : 'Check-Up Section'}
              </span>
            </div>
          </div>
        </div>

        <!-- ================================================================= -->
        <!-- THE 3 AI-STRUCTURED BRIEF SECTIONS (Guaranteed Contract)         -->
        <!-- ================================================================= -->
        <div class="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div class="flex items-center justify-between border-b border-slate-100 pb-2">
            <div class="flex items-center gap-1.5">
              <Sparkles class="w-4 h-4 text-blue-600" />
              <h5 class="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono">
                Standardized Clinical Brief (AI Structured)
              </h5>
            </div>
            <span class="text-[10px] font-mono text-slate-400">Low-Context Engine</span>
          </div>

          <!-- Section 1: Chief Complaint (Editable) -->
          <div class="space-y-1.5">
            <div class="flex items-center justify-between">
              <label for="doctor-chief-complaint" class="text-[11px] font-bold text-slate-700 uppercase tracking-wider font-mono">
                1. Chief Complaint:
              </label>
              <span class="text-[10px] text-slate-400 font-mono">Click to edit</span>
            </div>
            <textarea
              id="doctor-chief-complaint"
              rows="2"
              bind:value={editableComplaint}
              class="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:bg-white focus:border-blue-500 font-medium leading-relaxed outline-none"
            ></textarea>
          </div>

          <!-- Section 2: Symptom Timeline (Editable) -->
          <div class="space-y-1.5">
            <div class="flex items-center justify-between">
              <label for="doctor-symptom-timeline" class="text-[11px] font-bold text-slate-700 uppercase tracking-wider font-mono">
                2. Symptom Timeline &amp; Onset:
              </label>
              <span class="text-[10px] text-slate-400 font-mono">Click to edit</span>
            </div>
            <input
              id="doctor-symptom-timeline"
              type="text"
              bind:value={editableTimeline}
              class="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:bg-white focus:border-blue-500 font-medium outline-none"
            />
          </div>

          <!-- Section 3: Red Flags (Danger Signs Pattern Match) -->
          <div class="space-y-1.5">
            <span class="text-[11px] font-bold text-slate-700 uppercase tracking-wider font-mono block">
              3. Red Flags &amp; Danger Signs:
            </span>
            <div class="space-y-1">
              {#if selectedPatient.aiBrief?.redFlags?.length}
                {#each selectedPatient.aiBrief.redFlags as flag}
                  <div class="p-2.5 rounded-lg text-xs font-semibold flex items-start gap-2
                    {flag.toLowerCase().includes('no red flags') || flag.toLowerCase().includes('stable')
                      ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' 
                      : 'bg-red-50 text-red-950 border border-red-300'}">
                    {#if flag.toLowerCase().includes('no red flags') || flag.toLowerCase().includes('stable')}
                      <CheckCircle2 class="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    {:else}
                      <ShieldAlert class="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    {/if}
                    <span>{flag}</span>
                  </div>
                {/each}
              {:else if selectedPatient.aiTriage?.safetyWarnings?.length}
                {#each selectedPatient.aiTriage.safetyWarnings as warning}
                  <div class="p-2.5 rounded-lg text-xs font-semibold bg-red-50 text-red-950 border border-red-300 flex items-start gap-2">
                    <ShieldAlert class="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <span>{warning}</span>
                  </div>
                {/each}
              {:else}
                <div class="p-2.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-900 border border-emerald-200 flex items-center gap-2">
                  <CheckCircle2 class="w-4 h-4 text-emerald-600" />
                  <span>No red flags detected (stable profile)</span>
                </div>
              {/if}
            </div>
          </div>

          <!-- Strict Guardrail Disclaimer -->
          <div class="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-500 leading-relaxed font-sans">
            <strong>Decision-Support Notice:</strong> The AI engine provides pattern organization only. It does not diagnose medical conditions or prescribe drugs. Clinical assessment and final triage remain under physician authority.
          </div>
        </div>

        <!-- ================================================================= -->
        <!-- PRELIMINARY URGENCY SCORE (1-10) WITH 1-CLICK CLINICIAN OVERRIDE  -->
        <!-- ================================================================= -->
        <div class="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
          <div class="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <h5 class="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono">
                Urgency Score &bull; Scale 1 to 10
              </h5>
              <p class="text-[11px] text-slate-500">Clinician can adjust or verify the 1–10 score:</p>
            </div>
            <div class="text-right">
              <span class="text-xl font-black font-mono {isEmergencyTier ? 'text-red-600' : 'text-blue-600'}">
                {selectedUrgencyScore} / 10
              </span>
            </div>
          </div>

          <!-- 1-10 Number Selector Buttons -->
          <div class="grid grid-cols-10 gap-1 pt-1 font-mono text-xs">
            {#each [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as val}
              <button
                type="button"
                on:click={() => handleScoreSelect(val)}
                class="py-2 rounded-lg font-bold transition-all cursor-pointer text-center
                  {selectedUrgencyScore === val 
                    ? (val >= 8 ? 'bg-red-600 text-white shadow-xs' : 'bg-blue-600 text-white shadow-xs')
                    : (val >= 8 ? 'bg-red-50 text-red-800 hover:bg-red-100' : 'bg-slate-100 text-slate-700 hover:bg-slate-200')}"
              >
                {val}
              </button>
            {/each}
          </div>

          <div class="flex justify-between text-[10px] text-slate-400 font-mono pt-0.5">
            <span>1-4: Routine Check-Up</span>
            <span>5-7: Priority Check-Up</span>
            <span class="text-red-600 font-bold">8-10: Emergency Section</span>
          </div>
        </div>

      </div>

      <!-- =================================================================== -->
      <!-- PANEL 3 (RIGHT 3.5 COLS): RADIAL SCHEDULER & ENCOUNTER CONTROLS     -->
      <!-- =================================================================== -->
      <div class="lg:col-span-4 space-y-4">
        
        <!-- Clinical Time Scheduler Card -->
        <div class="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div class="flex items-center justify-between border-b border-slate-100 pb-2">
            <div class="flex items-center gap-1.5">
              <Clock class="w-4 h-4 text-blue-600" />
              <h5 class="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono">
                Scheduled Arrival Time
              </h5>
            </div>
            <span class="text-[10px] font-mono text-slate-400">Radial Clock</span>
          </div>

          <!-- Current Time Status -->
          <div class="p-3.5 rounded-xl border {selectedPatient.scheduledTime ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'} space-y-1">
            <span class="text-[10px] uppercase font-bold text-slate-500 font-mono block">Status:</span>
            <div class="flex items-center justify-between">
              <span class="text-base font-black font-mono {selectedPatient.scheduledTime ? 'text-emerald-950' : 'text-amber-950'}">
                {selectedPatient.scheduledTime || 'Unscheduled (Action Required)'}
              </span>
              {#if selectedPatient.scheduledTime}
                <span class="text-[10px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded font-mono">
                  CONFIRMED
                </span>
              {/if}
            </div>
          </div>

          <!-- Open Radial Scheduler Modal Button -->
          <button
            type="button"
            on:click={() => showSchedulerModal = true}
            class="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-2"
          >
            <Clock class="w-4 h-4" />
            <span>{selectedPatient.scheduledTime ? 'Modify Scheduled Slot' : 'Pick Time on Radial Clock'}</span>
          </button>
        </div>

        <!-- Physician Directives & Notes -->
        <div class="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
          <div class="flex items-center justify-between border-b border-slate-100 pb-2">
            <h5 class="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono">Physician Directives</h5>
            <span class="text-[10px] text-blue-600 font-bold font-mono">Attending Clinician</span>
          </div>

          <!-- Room Assignment Dropdown -->
          <div class="space-y-1">
            <label for="doctor-room-select" class="text-[10px] font-bold text-slate-500 uppercase tracking-wider block font-mono">
              Assigned Consulting Room:
            </label>
            <select
              id="doctor-room-select"
              bind:value={assignedRoom}
              class="w-full p-2 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-900 focus:border-blue-500 outline-none cursor-pointer"
            >
              {#each clinicRooms as room}
                <option value={room}>{room}</option>
              {/each}
            </select>
          </div>

          <!-- Notes Textarea -->
          <div class="space-y-1">
            <label for="doctor-notes-field" class="text-[10px] font-bold text-slate-500 uppercase tracking-wider block font-mono">
              Examination Notes / Directives:
            </label>
            <textarea
              id="doctor-notes-field"
              rows="3"
              bind:value={doctorNotes}
              placeholder="Enter examination directives, treatment notes, prescriptions..."
              class="w-full p-2.5 rounded-lg border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 font-medium outline-none"
            ></textarea>
          </div>

          <button
            type="button"
            on:click={handleSaveDoctorNotes}
            class="w-full py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Save class="w-3.5 h-3.5" />
            <span>Save Clinical Directives</span>
          </button>
        </div>

        <!-- Documentation & PDF view -->
        <div class="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-2">
          <h5 class="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono">Official PDF Records</h5>
          <div class="space-y-1.5 text-xs">
            <button
              type="button"
              on:click={() => showClinicalReportModal = true}
              class="w-full p-2 rounded-lg bg-slate-50 hover:bg-blue-50 border border-slate-200 flex items-center justify-between cursor-pointer transition-colors text-left"
            >
              <div class="flex items-center gap-2">
                <FileText class="w-3.5 h-3.5 text-blue-600" />
                <span class="font-medium text-slate-900 text-xs truncate max-w-[170px]">Official_Prescription_Slip.pdf</span>
              </div>
              <span class="text-[10px] text-blue-600 font-mono font-bold">Print Slip</span>
            </button>
          </div>
        </div>

      </div>

    </div>

    <!-- ========================================================================= -->
    <!-- FLOATING ACTION BAR: CLINICIAN ROUTING & FINAL SIGN-OFF                   -->
    <!-- ========================================================================= -->
    <div class="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-xl p-3">
      <div class="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        
        <div class="flex items-center gap-3">
          <div class="hidden sm:block">
            <p class="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-mono">Selected Case</p>
            <p class="text-xs font-bold text-slate-900">{selectedPatient.patientName} ({selectedPatient.assignedBadge || `#${selectedPatient.queueNo}`})</p>
          </div>
          <div class="text-xs font-mono font-bold px-2.5 py-1 rounded-lg border {isEmergencyTier ? 'bg-red-50 text-red-800 border-red-200' : 'bg-blue-50 text-blue-800 border-blue-200'}">
            Score: {selectedUrgencyScore}/10 &bull; {isEmergencyTier ? 'Emergency Section' : 'Check-Up Section'}
          </div>
        </div>

        <!-- 4 Routing Controls -->
        <div class="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            on:click={() => encounterOutcome = 'LAB'}
            class="px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5
              {encounterOutcome === 'LAB' ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}"
          >
            <FlaskConical class="w-3.5 h-3.5" />
            <span>Send to Lab</span>
          </button>

          <button
            type="button"
            on:click={() => encounterOutcome = 'PRESCRIPTION'}
            class="px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5
              {encounterOutcome === 'PRESCRIPTION' ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}"
          >
            <Pill class="w-3.5 h-3.5" />
            <span>Send to Pharmacy</span>
          </button>

          <button
            type="button"
            on:click={() => encounterOutcome = 'DISCHARGE'}
            class="px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5
              {encounterOutcome === 'DISCHARGE' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}"
          >
            <Home class="w-3.5 h-3.5" />
            <span>Discharge</span>
          </button>

          <button
            type="button"
            on:click={() => encounterOutcome = 'REFERRAL'}
            class="px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5
              {encounterOutcome === 'REFERRAL' ? 'bg-red-600 text-white shadow-xs' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}"
          >
            <Ambulance class="w-3.5 h-3.5" />
            <span>Emergency Referral</span>
          </button>
        </div>

        <!-- Primary Sign-Off -->
        <button
          type="button"
          on:click={handleCompleteEncounter}
          class="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Check class="w-4 h-4 text-emerald-400 stroke-[3]" />
          <span>{isSavingOutcome ? 'Signing...' : 'Clinician Sign-Off & Complete'}</span>
        </button>

      </div>
    </div>

  </div>

  <!-- ========================================================================= -->
  <!-- RADIAL TIME PICKER MODAL (Hard Conflict Blocker Included)                 -->
  <!-- ========================================================================= -->
  {#if showSchedulerModal}
    <div class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
      <RadialTimePicker
        currentPatient={selectedPatient}
        existingAppointments={queue}
        preliminaryScore={selectedUrgencyScore}
        on:confirm={handleScheduleConfirm}
        on:close={() => showSchedulerModal = false}
      />
    </div>
  {/if}

  {#if selectedPatient}
    <ClinicalReportModal
      bind:open={showClinicalReportModal}
      caseData={{
        ...selectedPatient,
        clinicianNotes: doctorNotes || selectedPatient.clinicianNotes,
        assignedRoom: assignedRoom,
        encounterOutcome: encounterOutcome
      }}
    />
  {/if}
{/if}
