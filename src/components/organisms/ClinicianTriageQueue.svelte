<script>
  import { clinicStore } from '../../stores/clinicStore.js';
  import { clinicRooms, timeSlots } from '../../data/mockData.js';
  import UrgencyBadge from '../molecules/UrgencyBadge.svelte';
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
    Edit3
  } from 'lucide-svelte';

  $: queue = $clinicStore.triageQueue || [];

  // View state: selectedPatient is null -> Full Patient List; selectedPatient is object -> Clinical Workstation
  let selectedPatient = null;

  // Search & Filter state for Patient List Table
  let searchQuery = '';
  let priorityFilter = 'ALL'; // 'ALL' | 'HIGH' | 'MODERATE' | 'ROUTINE' | 'PENDING'
  let sortBy = 'URGENCY'; // 'URGENCY' | 'TIME' | 'NAME'

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

  // Filtered and Sorted Patients
  $: filteredPatients = queue.filter(item => {
    if (priorityFilter === 'PENDING' && item.status !== 'PENDING_APPROVAL') return false;
    if (priorityFilter === 'HIGH' && item.aiTriage?.suggestedPriority !== 'HIGH') return false;
    if (priorityFilter === 'MODERATE' && item.aiTriage?.suggestedPriority !== 'MODERATE') return false;
    if (priorityFilter === 'ROUTINE' && item.aiTriage?.suggestedPriority !== 'ROUTINE') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const name = (item.patientName || item.studentName || '').toLowerCase();
      const card = (item.hospitalCardNo || item.matricNo || '').toLowerCase();
      const complaint = (item.complaint || '').toLowerCase();
      return name.includes(q) || card.includes(q) || complaint.includes(q);
    }
    return true;
  }).sort((a, b) => {
    if (sortBy === 'URGENCY') {
      return (b.aiTriage?.urgencyScore || 0) - (a.aiTriage?.urgencyScore || 0);
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
    assignedRoom = p.assignedRoom || p.aiTriage?.suggestedRoom || clinicRooms[0];
    assignedSession = p.assignedSession || p.aiTriage?.recommendedSession || timeSlots[0];
    doctorNotes = p.clinicianNotes || '';
    saveFeedbackMessage = '';
  }

  function handleBackToList() {
    selectedPatient = null;
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
      notes: doctorNotes || 'Patient called into consulting room by attending physician.'
    });
    saveFeedbackMessage = `Patient ${selectedPatient.patientName} called to ${assignedRoom}!`;
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
        const topCase = filteredPatients.find(p => p.aiTriage?.suggestedPriority === 'HIGH') || filteredPatients[0];
        if (topCase) handleSelectPatient(topCase);
      } else if (e.key === '/') {
        e.preventDefault();
        const searchInput = document.getElementById('clinicianSearchInput');
        if (searchInput) searchInput.focus();
      }
    } else {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleBackToList();
      }
    }
  }
</script>

<svelte:window on:keydown={handleGlobalKeydown} />

<!-- ========================================================================= -->
<!-- 1. FULL PATIENT LIST WINDOW (Enterprise EHR Dense Standard)               -->
<!-- ========================================================================= -->
{#if !selectedPatient}
  <div class="bg-white rounded-lg border border-slate-300 shadow-xs overflow-hidden text-slate-900 animate-in fade-in duration-100">
    
    <!-- Top Action & Search Bar (Dense, Structured) -->
    <div class="p-3 sm:p-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white">
      
      <!-- Title & Live Counter -->
      <div class="flex items-center gap-2.5">
        <h3 class="text-base font-bold tracking-tight text-slate-900">OPD Patient Triage Queue</h3>
        <span class="px-2 py-0.5 rounded bg-blue-100 text-blue-900 text-[11px] font-mono font-bold border border-blue-200">
          {queue.length} Total
        </span>
      </div>

      <!-- Controls: Search bar, Filters, Sort -->
      <div class="flex flex-wrap items-center gap-2.5">
        
        <!-- Search Input with Keyboard Indicator -->
        <div class="relative min-w-[220px] sm:min-w-[280px]">
          <Search class="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="clinicianSearchInput"
            type="text"
            bind:value={searchQuery}
            placeholder="Search patient, card, complaint (Press '/')..."
            class="w-full pl-8 pr-12 py-1.5 rounded border border-slate-300 bg-slate-50 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#699FDF] focus:bg-white shadow-2xs font-medium"
          />
          <span class="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-400 bg-slate-200/80 px-1.5 py-0.5 rounded border border-slate-300 pointer-events-none">/</span>
        </div>

        <!-- Sort Dropdown -->
        <div class="flex items-center gap-1.5 text-xs text-slate-600">
          <span class="text-slate-500 font-semibold text-[11px]">Sort:</span>
          <select
            bind:value={sortBy}
            class="py-1.5 px-2 rounded border border-slate-300 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#699FDF] cursor-pointer shadow-2xs"
          >
            <option value="URGENCY">Urgency (High first)</option>
            <option value="NAME">Name (A-Z)</option>
            <option value="DEFAULT">Arrival Order</option>
          </select>
        </div>

      </div>
    </div>

    <!-- Filter Pills Bar (High-Contrast Structured Buttons) -->
    <div class="px-3 sm:px-4 py-2 bg-slate-100/90 border-b border-slate-200 flex items-center justify-between gap-2 overflow-x-auto text-xs">
      <div class="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          on:click={() => priorityFilter = 'ALL'}
          class="px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer {priorityFilter === 'ALL' ? 'bg-[#699FDF] text-white shadow-2xs' : 'text-slate-700 hover:text-slate-950 hover:bg-slate-200'}"
        >
          All ({queue.length})
        </button>
        <button
          type="button"
          on:click={() => priorityFilter = 'PENDING'}
          class="px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer {priorityFilter === 'PENDING' ? 'bg-[#D97706] text-white shadow-2xs' : 'text-slate-700 hover:text-amber-900 hover:bg-amber-100'}"
        >
          Awaiting Review ({queue.filter(q => q.status === 'PENDING_APPROVAL').length})
        </button>
        <button
          type="button"
          on:click={() => priorityFilter = 'HIGH'}
          class="px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer {priorityFilter === 'HIGH' ? 'bg-[#DC2626] text-white shadow-2xs' : 'text-slate-700 hover:text-red-900 hover:bg-red-100'}"
        >
          High Urgency ({queue.filter(q => q.aiTriage?.suggestedPriority === 'HIGH').length})
        </button>
        <button
          type="button"
          on:click={() => priorityFilter = 'MODERATE'}
          class="px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer {priorityFilter === 'MODERATE' ? 'bg-[#D97706] text-white shadow-2xs' : 'text-slate-700 hover:text-amber-900 hover:bg-amber-100'}"
        >
          Moderate ({queue.filter(q => q.aiTriage?.suggestedPriority === 'MODERATE').length})
        </button>
        <button
          type="button"
          on:click={() => priorityFilter = 'ROUTINE'}
          class="px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer {priorityFilter === 'ROUTINE' ? 'bg-[#0F172A] text-white shadow-2xs' : 'text-slate-700 hover:text-slate-950 hover:bg-slate-200'}"
        >
          Routine ({queue.filter(q => q.aiTriage?.suggestedPriority === 'ROUTINE').length})
        </button>
      </div>

      <span class="text-[11px] text-slate-500 font-mono shrink-0 hidden sm:inline">
        [Enter] = Open Top Case &bull; [Esc] = Return
      </span>
    </div>

    <!-- Patient Table (High Density, Enterprise Clinical Layout) -->
    <div class="overflow-x-auto">
      <table class="w-full text-left border-collapse text-xs">
        <thead>
          <tr class="border-b-2 border-slate-300 bg-slate-100 text-slate-800 font-extrabold uppercase tracking-wider text-[11px] font-mono">
            <th class="py-3 px-3 sm:px-4 w-14 text-center">Queue #</th>
            <th class="py-3 px-3 sm:px-4">Patient Identity &amp; Card</th>
            <th class="py-3 px-3">Triage Priority</th>
            <th class="py-3 px-3">Chief Complaint &amp; Vitals</th>
            <th class="py-3 px-3">Arrival Mode</th>
            <th class="py-3 px-3">Check-in</th>
            <th class="py-3 px-3">Clinical Status</th>
            <th class="py-3 px-3 sm:px-4 text-right">Action</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-200">
          {#if filteredPatients.length === 0}
            <tr>
              <td colspan="8" class="text-center py-12 text-slate-600 font-bold text-sm">
                No patients match the search or filter criteria.
              </td>
            </tr>
          {:else}
            {#each filteredPatients as patient}
              <tr 
                on:click={() => handleSelectPatient(patient)}
                class="border-b border-slate-200/90 hover:bg-blue-50/80 hover:border-l-4 hover:border-l-[#699FDF] transition-all cursor-pointer group bg-white"
              >
                <!-- Queue Number -->
                <td class="py-3 px-3 sm:px-4 text-center font-mono font-black text-slate-900 text-xs align-middle">
                  <span class="inline-block px-1.5 py-0.5 rounded bg-slate-100 text-slate-900 font-black border border-slate-300">
                    #{patient.queueNo || patient.id?.slice(-3)}
                  </span>
                </td>

                <!-- Basic Info (Avatar, Name, Card Number) -->
                <td class="py-3 px-3 sm:px-4 align-middle">
                  <div class="flex items-center gap-2.5">
                    <div class="relative shrink-0">
                      <div class="w-8 h-8 rounded bg-slate-100 text-slate-950 font-black flex items-center justify-center text-xs border border-slate-300">
                        {patient.patientName ? patient.patientName.charAt(0) : 'P'}
                      </div>
                      <span class="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-white
                        {patient.aiTriage?.suggestedPriority === 'HIGH' ? 'bg-[#DC2626]' : patient.aiTriage?.suggestedPriority === 'MODERATE' ? 'bg-[#D97706]' : 'bg-slate-500'}">
                      </span>
                    </div>
                    <div>
                      <p class="font-bold text-slate-950 group-hover:text-[#699FDF] transition-colors text-sm leading-tight">
                        {patient.patientName || patient.studentName || 'Patient'}
                      </p>
                      <p class="text-xs text-slate-600 font-medium font-mono mt-0.5">
                        Card: <strong class="text-slate-900 font-bold">{patient.hospitalCardNo || patient.matricNo || 'GH-OPD'}</strong> &bull; Age {patient.age || 'N/A'} ({patient.gender || 'N/A'})
                      </p>
                    </div>
                  </div>
                </td>

                <!-- Urgency Badge -->
                <td class="py-3 px-3 align-middle">
                  <UrgencyBadge priority={patient.aiTriage?.suggestedPriority} size="sm" />
                </td>

                <!-- Chief Complaint & Severity -->
                <td class="py-3 px-3 max-w-xs align-middle">
                  <p class="text-xs text-slate-900 font-medium line-clamp-1 leading-snug">
                    "{patient.complaint}"
                  </p>
                  <p class="text-[11px] text-slate-600 font-mono mt-0.5">
                    Pain: <strong class="text-slate-950 font-bold">{patient.painScale || '?'}/10</strong> &bull; Duration: <strong class="text-slate-800 font-semibold">{patient.duration || 'N/A'}</strong>
                  </p>

                  <!-- Vitals Indicators from Nurse Station -->
                  {#if patient.vitalsRecorded && patient.vitals}
                    <div class="flex flex-wrap items-center gap-1 mt-1 font-mono text-[10px]">
                      <span class="px-1.5 py-0.5 rounded {patient.vitals.hasCriticalVital ? 'bg-red-100 text-red-800 font-bold' : 'bg-blue-50 text-blue-900 font-medium border border-blue-200'}">
                        BP: {patient.vitals.bp}
                      </span>
                      <span class="px-1.5 py-0.5 rounded {patient.vitals.temperature >= 37.8 ? 'bg-amber-100 text-amber-900 font-bold' : 'bg-slate-100 text-slate-800'}">
                        {patient.vitals.temperature}°C
                      </span>
                      <span class="px-1.5 py-0.5 rounded {patient.vitals.spo2 <= 94 ? 'bg-red-100 text-red-800 font-bold' : 'bg-slate-100 text-slate-800'}">
                        {patient.vitals.spo2}% SpO2
                      </span>
                    </div>
                  {:else}
                    <span class="inline-block mt-1 text-[10px] font-mono text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                      Nursing Vitals Pending
                    </span>
                  {/if}
                </td>

                <!-- Arrival Mode -->
                <td class="py-3 px-3 align-middle">
                  <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 text-slate-800 text-[11px] font-semibold border border-slate-300 whitespace-nowrap">
                    <span>{arrivalLabels[patient.intakeMode]?.icon || '🚶'}</span>
                    <span>{arrivalLabels[patient.intakeMode]?.text || 'Self Walk-in'}</span>
                  </span>
                </td>

                <!-- Waiting Time -->
                <td class="py-3 px-3 text-slate-700 font-mono font-medium text-xs whitespace-nowrap align-middle">
                  {patient.submittedAt || 'Just now'}
                </td>

                <!-- Status -->
                <td class="py-3 px-3 whitespace-nowrap align-middle">
                  {#if patient.status === 'APPROVED'}
                    <span class="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-emerald-950 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-400">
                      ✓ IN CONSULT
                    </span>
                  {:else if patient.status === 'OVERRIDDEN'}
                    <span class="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-purple-950 bg-purple-100 px-2 py-0.5 rounded border border-purple-400">
                      OVERRIDDEN
                    </span>
                  {:else}
                    <span class="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-amber-950 bg-amber-100 px-2 py-0.5 rounded border border-amber-400">
                      <span class="w-1.5 h-1.5 rounded-full bg-[#D97706] animate-pulse"></span>
                      AWAITING DOCTOR
                    </span>
                  {/if}
                </td>

                <!-- Action Button on Hover -->
                <td class="py-3 px-3 sm:px-4 text-right whitespace-nowrap align-middle">
                  <button
                    type="button"
                    class="px-3 py-1.5 rounded bg-[#0F172A] group-hover:bg-[#699FDF] text-white font-bold text-xs transition-colors inline-flex items-center gap-1 cursor-pointer shadow-2xs border border-transparent"
                  >
                    <span>Review Case</span>
                    <ChevronRight class="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            {/each}
          {/if}
        </tbody>
      </table>
    </div>

    <!-- Table Footer with stats -->
    <div class="px-4 py-2 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-600">
      <span class="font-mono">Showing <strong>{filteredPatients.length}</strong> of <strong>{queue.length}</strong> OPD entries</span>
      <span class="font-medium text-slate-500 text-[11px]">CLINIKS Clinical Decision Station &bull; Outpatient Healthcare Service</span>
    </div>

  </div>
{/if}

<!-- ========================================================================= -->
<!-- 2. CLINICAL WORKSTATION / PATIENT DETAIL (Exact 3-Panel + Authority Zone) -->
<!-- ========================================================================= -->
{#if selectedPatient}
  <div class="space-y-3 text-slate-900 animate-in fade-in duration-100 pb-28">
    
    <!-- Top Navigation Bar & Doctor Feedback Toast -->
    <div class="flex items-center justify-between gap-3 bg-white p-3 rounded-lg border border-slate-300 shadow-2xs">
      <div class="flex items-center gap-2 text-xs font-semibold">
        <button
          type="button"
          on:click={handleBackToList}
          class="text-[#699FDF] hover:text-blue-800 font-bold flex items-center gap-1 cursor-pointer hover:underline"
        >
          <ArrowLeft class="w-3.5 h-3.5" />
          <span>Queue Table [Esc]</span>
        </button>
        <span class="text-slate-300 font-bold">/</span>
        <span class="text-slate-900 font-bold">{selectedPatient.patientName || selectedPatient.studentName}</span>
      </div>

      <div class="flex items-center gap-2">
        {#if saveFeedbackMessage}
          <span class="text-xs font-bold text-blue-900 bg-blue-100 px-2.5 py-0.5 rounded border border-blue-200 animate-in fade-in">
            {saveFeedbackMessage}
          </span>
        {/if}

        <button
          type="button"
          on:click={handleCallPatient}
          class="px-3.5 py-1.5 rounded bg-[#699FDF] hover:bg-[#5289CC] text-white text-xs font-bold transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
        >
          <Stethoscope class="w-3.5 h-3.5 text-white" />
          <span>Call to Room</span>
        </button>
      </div>
    </div>

    <!-- 3-COLUMN WORKSTATION LAYOUT -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
      
      <!-- =================================================================== -->
      <!-- PANEL 1 (LEFT 3 COLS): QUEUE SIDEBAR (Quick Switch Between Patients)-->
      <!-- =================================================================== -->
      <div class="lg:col-span-3 bg-white rounded-lg border border-slate-300 p-3 shadow-2xs space-y-2.5">
        <div class="flex items-center justify-between border-b border-slate-200 pb-2">
          <span class="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">Live Patient Queue</span>
          <span class="text-[10px] font-mono font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
            {queue.length} Active
          </span>
        </div>

        <div class="space-y-1 max-h-[640px] overflow-y-auto">
          {#each queue as item}
            <button
              type="button"
              on:click={() => handleSelectPatient(item)}
              class="w-full text-left p-2 rounded border transition-all cursor-pointer flex items-center gap-2
                {selectedPatient.id === item.id 
                  ? 'border-[#699FDF] bg-blue-50 ring-1 ring-[#699FDF]/40 shadow-2xs' 
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'}"
            >
              <span class="w-2 h-2 rounded-full shrink-0
                {item.aiTriage?.suggestedPriority === 'HIGH' ? 'bg-[#DC2626]' : item.aiTriage?.suggestedPriority === 'MODERATE' ? 'bg-[#D97706]' : 'bg-slate-400'}">
              </span>
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between gap-1">
                  <p class="text-xs font-bold text-slate-900 truncate">
                    {item.patientName || 'Patient'}
                  </p>
                  <span class="text-[10px] font-mono text-slate-500">#{item.queueNo || item.id?.slice(-3)}</span>
                </div>
                <p class="text-[10px] text-slate-500 truncate font-mono">
                  {item.hospitalCardNo || 'Card: GH-OPD'} &bull; {item.submittedAt || 'Waiting'}
                </p>
              </div>
            </button>
          {/each}
        </div>
      </div>

      <!-- =================================================================== -->
      <!-- PANEL 2 (CENTER 5.5 COLS): THE PATIENT BRIEF & PRE-CONSULTATION CORE-->
      <!-- =================================================================== -->
      <div class="lg:col-span-5 space-y-3">
        
        <!-- Quick-Access Patient Summary (Core Identity at Top) -->
        <div class="bg-white rounded-lg border border-slate-300 p-4 shadow-2xs space-y-3">
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-center gap-3">
              <div class="w-11 h-11 rounded bg-blue-50 text-[#699FDF] font-bold text-lg flex items-center justify-center border border-blue-200 shrink-0">
                {selectedPatient.patientName ? selectedPatient.patientName.charAt(0) : 'P'}
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <h4 class="text-base font-bold text-slate-900">
                    {selectedPatient.patientName || selectedPatient.studentName}
                  </h4>
                  <span class="text-[10px] font-mono font-bold bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded border border-slate-300">
                    QUEUE #{selectedPatient.queueNo || selectedPatient.id?.slice(-3)}
                  </span>
                </div>
                <p class="text-xs text-slate-500 font-mono mt-0.5">
                  Card: <strong class="text-slate-800">{selectedPatient.hospitalCardNo || 'GH-OPD'}</strong> &bull;
                  Age: <strong class="text-slate-800">{selectedPatient.age || 'Adult'}</strong> &bull;
                  Gender: <strong class="text-slate-800">{selectedPatient.gender || 'N/A'}</strong>
                </p>
              </div>
            </div>

            <UrgencyBadge priority={selectedPatient.aiTriage?.suggestedPriority} size="sm" />
          </div>

          <!-- Urgency & Triage Visual Alert Flags -->
          {#if selectedPatient.aiTriage?.safetyWarnings?.length}
            <div class="p-2.5 rounded bg-red-50 border border-red-300 text-red-950 text-xs font-medium space-y-1">
              <div class="flex items-center gap-1.5 font-bold text-[#DC2626] uppercase tracking-wider text-[10px] font-mono">
                <ShieldAlert class="w-3.5 h-3.5 text-[#DC2626]" />
                <span>Urgent Clinical Protocol Alert:</span>
              </div>
              {#each selectedPatient.aiTriage.safetyWarnings as warning}
                <p class="text-xs font-semibold leading-normal">• {warning}</p>
              {/each}
            </div>
          {/if}
        </div>

        <!-- Structured Pre-Consultation Notes / Chief Complaints -->
        <div class="bg-white rounded-lg border border-slate-300 p-4 shadow-2xs space-y-3">
          <div class="flex items-center justify-between border-b border-slate-200 pb-2">
            <div class="flex items-center gap-1.5">
              <Sparkles class="w-3.5 h-3.5 text-[#699FDF]" />
              <h5 class="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono">
                Structured Pre-Consultation Intake
              </h5>
            </div>
            <span class="text-[10px] font-mono text-slate-500">AI-Organized Intake</span>
          </div>

          <!-- Narrative Patient Brief -->
          <div class="p-3 rounded bg-slate-50 border border-slate-200 space-y-1">
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-500 block font-mono">Clinical Summary:</span>
            <p class="text-xs text-slate-900 leading-relaxed font-medium">
              {selectedPatient.aiTriage?.patientBrief || selectedPatient.complaint}
            </p>
          </div>

          <!-- Verbatim Chief Complaint & Pain Score -->
          <div class="space-y-2 text-xs">
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-500 block font-mono">Reported Chief Complaint:</span>
            <p class="text-xs text-slate-900 italic bg-white p-2.5 rounded border border-slate-200 leading-relaxed">
              "{selectedPatient.complaint}"
            </p>

            <div class="grid grid-cols-2 gap-2 pt-1 font-mono">
              <div class="p-2 rounded bg-slate-50 border border-slate-200">
                <span class="text-[10px] uppercase font-bold text-slate-500 block">Pain Severity</span>
                <strong class="text-xs {selectedPatient.painScale >= 7 ? 'text-[#DC2626]' : selectedPatient.painScale >= 4 ? 'text-[#D97706]' : 'text-slate-900'} font-bold">{selectedPatient.painScale || 'N/A'}/10</strong>
                <span class="text-[10px] text-slate-500 font-medium">({selectedPatient.painScale >= 7 ? 'Severe' : selectedPatient.painScale >= 4 ? 'Moderate' : 'Mild'})</span>
              </div>
              <div class="p-2 rounded bg-slate-50 border border-slate-200">
                <span class="text-[10px] uppercase font-bold text-slate-500 block">Symptom Duration</span>
                <strong class="text-xs text-slate-900 font-bold">{selectedPatient.duration || 'Not specified'}</strong>
              </div>
            </div>
          </div>

          <!-- Screening Vitals / Questions -->
          {#if selectedPatient.answers?.length}
            <div class="space-y-1 pt-1 text-xs border-t border-slate-200">
              <span class="text-[10px] font-bold uppercase tracking-wider text-slate-500 block font-mono">Targeted Safety Screening:</span>
              <div class="space-y-1">
                {#each selectedPatient.answers as answer}
                  <p class="p-2 rounded bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium">
                    • {answer}
                  </p>
                {/each}
              </div>
            </div>
          {/if}
        </div>

        <!-- Stage 3 Nurse Vitals Panel (Thesis Stage 3) -->
        <div class="bg-white rounded-lg border border-slate-300 p-4 shadow-2xs space-y-3">
          <div class="flex items-center justify-between border-b border-slate-200 pb-2">
            <div class="flex items-center gap-1.5">
              <Activity class="w-3.5 h-3.5 text-[#699FDF]" />
              <h5 class="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono">
                Stage 3: Nursing Vitals Observation
              </h5>
            </div>
            <span class="text-[10px] font-mono font-bold {selectedPatient.vitalsRecorded ? 'text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300' : 'text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-300'}">
              {selectedPatient.vitalsRecorded ? 'Vitals Completed' : 'Awaiting Triage Nurse'}
            </span>
          </div>

          {#if selectedPatient.vitalsRecorded && selectedPatient.vitals}
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
              <div class="p-2 rounded bg-slate-50 border border-slate-200">
                <span class="text-[9px] uppercase font-bold text-slate-500 block">Blood Pressure</span>
                <strong class="text-xs {selectedPatient.vitals.hasCriticalVital ? 'text-red-700' : 'text-slate-900'}">{selectedPatient.vitals.bp}</strong>
              </div>
              <div class="p-2 rounded bg-slate-50 border border-slate-200">
                <span class="text-[9px] uppercase font-bold text-slate-500 block">Temperature</span>
                <strong class="text-xs {selectedPatient.vitals.temperature >= 37.8 ? 'text-amber-800' : 'text-slate-900'}">{selectedPatient.vitals.temperature}°C</strong>
              </div>
              <div class="p-2 rounded bg-slate-50 border border-slate-200">
                <span class="text-[9px] uppercase font-bold text-slate-500 block">Oxygen (SpO2)</span>
                <strong class="text-xs {selectedPatient.vitals.spo2 <= 94 ? 'text-red-700' : 'text-slate-900'}">{selectedPatient.vitals.spo2}%</strong>
              </div>
              <div class="p-2 rounded bg-slate-50 border border-slate-200">
                <span class="text-[9px] uppercase font-bold text-slate-500 block">Heart Rate</span>
                <strong class="text-xs text-slate-900">{selectedPatient.vitals.pulse} bpm</strong>
              </div>
            </div>

            <div class="flex items-center justify-between text-[10px] text-slate-500 pt-1">
              <span>Recorded by: <strong class="text-slate-700">{selectedPatient.vitals.nurseName}</strong></span>
              <span>{selectedPatient.vitals.recordedAt}</span>
            </div>
          {:else}
            <p class="text-xs text-slate-600 bg-amber-50/60 p-2.5 rounded border border-amber-200/60 leading-relaxed">
              Vitals not yet recorded for this patient. Patient is currently queued at Station 03 (Nursing Triage).
            </p>
          {/if}
        </div>

      </div>

      <!-- =================================================================== -->
      <!-- PANEL 3 (RIGHT 3.5 COLS): RECORDS, ACTIVE FILES & DOCTOR'S NOTES   -->
      <!-- =================================================================== -->
      <div class="lg:col-span-3.5 space-y-3">
        
        <!-- Doctor's Quick Notes & Impressions -->
        <div class="bg-white rounded-lg border border-slate-300 p-4 shadow-2xs space-y-2.5">
          <div class="flex items-center justify-between border-b border-slate-200 pb-2">
            <h5 class="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono">Physician Directives</h5>
            <span class="text-[10px] text-[#699FDF] font-bold font-mono">Attending Clinician</span>
          </div>

          <!-- Medical Alert / Allergies Note -->
          <div class="p-2 rounded bg-slate-50 border border-slate-200 text-xs space-y-0.5">
            <span class="text-[10px] uppercase font-bold text-slate-500 block font-mono">Allergies &amp; Chronic Profile:</span>
            <p class="font-medium text-slate-900 text-xs">
              {selectedPatient.answers?.find(a => a.toLowerCase().includes('medication')) || 'No drug allergies or chronic comorbidities declared on intake.'}
            </p>
          </div>

          <!-- Notes Textarea -->
          <div class="space-y-1">
            <label for="doctor-notes-input" class="text-[10px] font-bold text-slate-500 uppercase tracking-wider block font-mono">
              Clinical Observations &amp; Directives:
            </label>
            <textarea
              id="doctor-notes-input"
              rows="3"
              bind:value={doctorNotes}
              placeholder="Enter clinical examination notes, vitals taken, treatment directives..."
              class="w-full p-2 rounded border border-slate-300 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#699FDF] shadow-2xs font-medium"
            ></textarea>
          </div>

          <button
            type="button"
            on:click={handleSaveDoctorNotes}
            class="w-full py-1.5 rounded bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer shadow-2xs flex items-center justify-center gap-1.5"
          >
            <Save class="w-3.5 h-3.5" />
            <span>Save Clinical Notes</span>
          </button>
        </div>

        <!-- Recent Medical History & Active Records -->
        <div class="bg-white rounded-lg border border-slate-300 p-4 shadow-2xs space-y-2.5">
          <h5 class="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono border-b border-slate-200 pb-2">
            Historical Outpatient Encounters
          </h5>

          <div class="space-y-2 text-xs">
            <div class="p-2.5 rounded bg-slate-50 border border-slate-200 space-y-0.5">
              <div class="flex items-center justify-between">
                <strong class="text-slate-900 text-xs">Previous OPD Encounter</strong>
                <span class="text-[10px] text-slate-500 font-mono">14 Oct 2025</span>
              </div>
              <p class="text-slate-700 text-[11px]">Acute Pharyngitis &bull; Managed &amp; Discharged</p>
            </div>

            <div class="p-2.5 rounded bg-slate-50 border border-slate-200 space-y-0.5">
              <div class="flex items-center justify-between">
                <strong class="text-slate-900 text-xs">Hospital Card Issued</strong>
                <span class="text-[10px] text-slate-500 font-mono">03 Mar 2024</span>
              </div>
              <p class="text-slate-700 text-[11px]">Card {selectedPatient.hospitalCardNo || 'GH-OPD'} registered at Central Records.</p>
            </div>
          </div>
        </div>

        <!-- Lab Results & Encounter PDFs -->
        <div class="bg-white rounded-lg border border-slate-300 p-3 shadow-2xs space-y-2">
          <h5 class="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono">
            Files &amp; Requisitions
          </h5>
          <div class="space-y-1.5 text-xs">
            <button
              type="button"
              on:click={() => showClinicalReportModal = true}
              class="w-full p-2 rounded bg-slate-50 hover:bg-blue-50/70 border border-slate-200 flex items-center justify-between cursor-pointer transition-colors text-left"
            >
              <div class="flex items-center gap-2">
                <FileText class="w-3.5 h-3.5 text-[#699FDF]" />
                <span class="font-medium text-slate-900 text-xs truncate max-w-[170px]">Official_Prescription_Slip.pdf</span>
              </div>
              <span class="text-[10px] text-[#699FDF] font-mono font-bold">View / Print</span>
            </button>
            <button
              type="button"
              on:click={() => showClinicalReportModal = true}
              class="w-full p-2 rounded bg-slate-50 hover:bg-blue-50/70 border border-slate-200 flex items-center justify-between cursor-pointer transition-colors text-left"
            >
              <div class="flex items-center gap-2">
                <FileCheck class="w-3.5 h-3.5 text-[#699FDF]" />
                <span class="font-medium text-slate-900 text-xs">Official_Triage_Record.pdf</span>
              </div>
              <span class="text-[10px] text-emerald-700 font-bold font-mono">Verified</span>
            </button>
          </div>
        </div>

      </div>

    </div>

    <!-- ========================================================================= -->
    <!-- FLOATING ACTION BAR: CLINICIAN ACTION CONTROLS (THE AUTHORITY ZONE)       -->
    <!-- ========================================================================= -->
    <div class="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-300 shadow-2xl p-3 animate-in slide-in-from-bottom-2 duration-100">
      <div class="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        
        <!-- Left: Room Assignment & Active Patient -->
        <div class="flex items-center gap-3">
          <div class="hidden sm:block">
            <p class="text-[10px] uppercase font-bold text-slate-500 tracking-wider font-mono">Active Consultation</p>
            <p class="text-xs font-bold text-slate-900">{selectedPatient.patientName} (#{selectedPatient.queueNo})</p>
          </div>

          <div class="flex items-center gap-2">
            <label for="floating-room" class="text-xs font-bold text-slate-700 shrink-0">Room:</label>
            <select
              id="floating-room"
              bind:value={assignedRoom}
              class="text-xs font-semibold py-1 px-2.5 rounded border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-[#699FDF] shadow-2xs"
            >
              {#each clinicRooms as room}
                <option value={room}>{room}</option>
              {/each}
            </select>
          </div>
        </div>

        <!-- Center: 4 Prominent Clinical Routing Controls (Authority Zone) -->
        <div class="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            on:click={() => encounterOutcome = 'LAB'}
            class="px-2.5 py-1.5 rounded text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5
              {encounterOutcome === 'LAB' ? 'bg-[#699FDF] text-white shadow-xs' : 'bg-slate-100 hover:bg-slate-200 text-slate-800'}"
            title="Order Laboratory / Diagnostic Investigation"
          >
            <FlaskConical class="w-3.5 h-3.5" />
            <span>Send to Lab</span>
          </button>

          <button
            type="button"
            on:click={() => encounterOutcome = 'PRESCRIPTION'}
            class="px-2.5 py-1.5 rounded text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5
              {encounterOutcome === 'PRESCRIPTION' ? 'bg-[#699FDF] text-white shadow-xs' : 'bg-slate-100 hover:bg-slate-200 text-slate-800'}"
            title="Send to Pharmacy with Prescriptions"
          >
            <Pill class="w-3.5 h-3.5" />
            <span>Send to Pharmacy</span>
          </button>

          <button
            type="button"
            on:click={() => encounterOutcome = 'DISCHARGE'}
            class="px-2.5 py-1.5 rounded text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5
              {encounterOutcome === 'DISCHARGE' ? 'bg-emerald-700 text-white shadow-xs' : 'bg-slate-100 hover:bg-slate-200 text-slate-800'}"
            title="Discharge Patient with Advice"
          >
            <Home class="w-3.5 h-3.5" />
            <span>Discharge</span>
          </button>

          <button
            type="button"
            on:click={() => encounterOutcome = 'REFERRAL'}
            class="px-2.5 py-1.5 rounded text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5
              {encounterOutcome === 'REFERRAL' ? 'bg-[#DC2626] text-white shadow-xs' : 'bg-slate-100 hover:bg-slate-200 text-slate-800'}"
            title="Refer to Specialist Hospital / Unit"
          >
            <Ambulance class="w-3.5 h-3.5" />
            <span>Emergency Referral</span>
          </button>
        </div>

        <!-- Right: Primary Clinician Authority Sign-Off Button -->
        <div class="flex items-center gap-2">
          <button
            type="button"
            on:click={handleCompleteEncounter}
            class="w-full sm:w-auto px-4 py-1.5 rounded bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Check class="w-3.5 h-3.5 text-[#699FDF] stroke-[3]" />
            <span>{isSavingOutcome ? 'Signing...' : 'Clinician Sign-Off & Complete'}</span>
          </button>
        </div>

      </div>
    </div>

  </div>

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
