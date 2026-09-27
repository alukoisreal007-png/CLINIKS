<script>
  import { createEventDispatcher, onMount } from 'svelte';
  import { clinicStore } from '../../stores/clinicStore.js';
  import { clinicRooms, timeSlots } from '../../data/mockData.js';
  import UrgencyBadge from '../molecules/UrgencyBadge.svelte';
  import { 
    Bell, 
    X, 
    Clock, 
    AlertTriangle, 
    Check, 
    MapPin, 
    Sparkles, 
    ShieldAlert, 
    Stethoscope,
    FlaskConical,
    Pill,
    Home,
    Ambulance,
    ArrowRight,
    User,
    CheckCircle2,
    Calendar,
    FileCheck,
    Send
  } from 'lucide-svelte';

  export let open = false;

  const dispatch = createEventDispatcher();

  $: queue = $clinicStore.triageQueue || [];
  $: pendingRequests = queue.filter(q => q.status === 'PENDING_APPROVAL');
  $: displayList = pendingRequests.length > 0 ? pendingRequests : queue.slice(0, 6);

  // Slide-over drawer state
  let drawerPatient = null;
  let drawerRoom = clinicRooms[0];
  let drawerSession = timeSlots[0];
  let drawerOutcome = 'DISCHARGE'; // 'LAB' | 'PRESCRIPTION' | 'DISCHARGE' | 'REFERRAL'
  let drawerNotes = '';
  let isSubmitting = false;

  function handleCloseDropdown() {
    open = false;
    dispatch('close');
  }

  function handleOpenDrawer(patient) {
    drawerPatient = patient;
    drawerRoom = patient.assignedRoom || patient.aiTriage?.suggestedRoom || clinicRooms[0];
    drawerSession = patient.assignedSession || patient.aiTriage?.recommendedSession || timeSlots[0];
    drawerNotes = patient.clinicianNotes || '';
    handleCloseDropdown();
  }

  function handleCloseDrawer() {
    drawerPatient = null;
  }

  function handleCallPatientToRoom() {
    if (!drawerPatient) return;
    clinicStore.approveTriage(drawerPatient.id, {
      room: drawerRoom,
      session: drawerSession,
      notes: drawerNotes || `Patient called into ${drawerRoom} for consultation.`
    });
    handleCloseDrawer();
  }

  function handleCompleteDrawerEncounter() {
    if (!drawerPatient) return;
    isSubmitting = true;
    const outcomeLabel = {
      LAB: 'Laboratory Investigation Ordered',
      PRESCRIPTION: 'Prescription Issued',
      DISCHARGE: 'Discharged with Advice',
      REFERRAL: 'Specialist Referral Initiated'
    }[drawerOutcome] || 'Consultation Completed';

    const note = drawerNotes 
      ? `[${outcomeLabel}] ${drawerNotes}`
      : `[${outcomeLabel}] Patient consulted in ${drawerRoom}.`;

    clinicStore.approveTriage(drawerPatient.id, {
      room: drawerRoom,
      session: drawerSession,
      notes: note
    });

    setTimeout(() => {
      isSubmitting = false;
      handleCloseDrawer();
    }, 250);
  }

  function handleKeydown(e) {
    if (e.key === 'Escape') {
      if (drawerPatient) handleCloseDrawer();
      else if (open) handleCloseDropdown();
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<!-- ========================================================================= -->
<!-- 1. STREAMLINED NOTIFICATION DROPDOWN (ACTIVITY FEED)                      -->
<!-- ========================================================================= -->
{#if open}
  <!-- Backdrop for click-away -->
  <button 
    type="button"
    class="fixed inset-0 z-40 w-full h-full cursor-default bg-transparent border-none p-0 m-0" 
    on:click={handleCloseDropdown}
    aria-label="Close notification popover"
  ></button>

  <!-- Sharp, structured notification popover -->
  <div 
    class="absolute right-0 top-full mt-2 z-50 w-80 sm:w-96 bg-white rounded-lg shadow-xl border border-slate-300 overflow-hidden animate-in fade-in zoom-in-95 duration-100 text-slate-900"
  >
    <!-- Streamlined Header with Clear Contextual Hierarchy -->
    <div class="px-4 py-3 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
      <div class="flex items-center gap-2">
        <Bell class="w-4 h-4 text-[#1E5EFF] stroke-[2.5]" />
        <h4 class="text-xs font-bold uppercase tracking-wider text-white">Inbound Triage Feed</h4>
      </div>
      <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded {pendingRequests.length > 0 ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-300'}">
        {pendingRequests.length} pending review
      </span>
    </div>

    <!-- Compact Activity Feed List -->
    <div class="max-h-[380px] overflow-y-auto divide-y divide-slate-100">
      {#if displayList.length === 0}
        <div class="p-6 text-center space-y-1.5">
          <CheckCircle2 class="w-6 h-6 text-slate-400 mx-auto" />
          <p class="text-xs font-bold text-slate-800">No Inbound Requests</p>
          <p class="text-[11px] text-slate-500">Live patient pre-consultation intakes will queue here.</p>
        </div>
      {:else}
        {#each displayList as patient}
          <div class="p-3 hover:bg-slate-50 transition-colors flex items-center justify-between gap-3">
            
            <!-- Left: Urgency Dot + Patient Identity, Card, and Issue Snippet -->
            <div class="flex items-start gap-2.5 min-w-0 flex-1">
              <div class="relative shrink-0 mt-0.5">
                <div class="w-8 h-8 rounded bg-slate-100 text-slate-800 font-bold text-xs flex items-center justify-center border border-slate-200">
                  {patient.patientName ? patient.patientName.charAt(0) : 'P'}
                </div>
                <span class="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full
                  {patient.aiTriage?.suggestedPriority === 'HIGH' ? 'bg-rose-600 ring-1 ring-white' : patient.aiTriage?.suggestedPriority === 'MODERATE' ? 'bg-amber-500' : 'bg-slate-400'}">
                </span>
              </div>

              <div class="min-w-0 flex-1">
                <div class="flex items-center justify-between gap-1">
                  <p class="text-xs font-bold text-slate-900 truncate">
                    {patient.patientName || patient.studentName || 'Patient'}
                  </p>
                  <span class="text-[10px] text-slate-400 font-mono">#{patient.queueNo || patient.id?.slice(-3)}</span>
                </div>

                <div class="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono">
                  <span>Card: {patient.hospitalCardNo || 'GH-OPD'}</span>
                  <span>&bull;</span>
                  <span>{patient.submittedAt || 'Just now'}</span>
                </div>

                <!-- Patient Reported Issue / Complaint -->
                <p class="text-[11px] text-slate-700 font-medium line-clamp-1 mt-0.5 italic">
                  <span class="text-slate-500 font-bold not-italic text-[10px] uppercase font-mono">Issue:</span> "{patient.complaint}"
                </p>
              </div>
            </div>

            <!-- Right: Compact Urgency Flag + Single "Review" Action Button -->
            <div class="flex items-center gap-2 shrink-0">
              <span class="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border
                {patient.aiTriage?.suggestedPriority === 'HIGH' 
                  ? 'bg-rose-50 text-rose-800 border-rose-300' 
                  : patient.aiTriage?.suggestedPriority === 'MODERATE' 
                    ? 'bg-amber-50 text-amber-900 border-amber-300' 
                    : 'bg-slate-100 text-slate-700 border-slate-200'}">
                {patient.aiTriage?.suggestedPriority === 'HIGH' ? 'URGENT' : patient.aiTriage?.suggestedPriority || 'ROUTINE'}
              </span>

              <button
                type="button"
                on:click={() => handleOpenDrawer(patient)}
                class="px-2.5 py-1 bg-slate-900 hover:bg-[#1E5EFF] text-white text-[11px] font-bold rounded cursor-pointer transition-colors shadow-2xs"
              >
                Review
              </button>
            </div>

          </div>
        {/each}
      {/if}
    </div>

    <!-- Feed Footer -->
    <div class="px-3.5 py-2 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500">
      <span>Auto-refreshing OPD Intake Stream</span>
      <span class="font-mono">ESC to dismiss</span>
    </div>
  </div>
{/if}

<!-- ========================================================================= -->
<!-- 2. CLINICAL SLIDE-OVER DRAWER (REPLACES CLUTTERED DROPDOWN MINI-CARDS)     -->
<!-- ========================================================================= -->
{#if drawerPatient}
  <!-- Backdrop -->
  <button 
    type="button"
    class="fixed inset-0 bg-slate-950/50 backdrop-blur-xs z-50 transition-opacity animate-in fade-in duration-150 border-none p-0 cursor-default"
    on:click={handleCloseDrawer}
    aria-label="Close drawer backdrop"
  ></button>

  <!-- Slide-Over Panel -->
  <div 
    class="fixed inset-y-0 right-0 z-50 w-full max-w-xl bg-white shadow-2xl border-l border-slate-300 flex flex-col animate-in slide-in-from-right duration-200 text-slate-900"
  >
    <!-- Drawer Header -->
    <div class="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded bg-[#1E5EFF] text-white flex items-center justify-center font-bold text-sm">
          #{drawerPatient.queueNo || drawerPatient.id?.slice(-3)}
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h3 class="text-base font-extrabold text-white">
              {drawerPatient.patientName || drawerPatient.studentName || 'Patient Encounter'}
            </h3>
            <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold
              {drawerPatient.aiTriage?.suggestedPriority === 'HIGH' ? 'bg-rose-600 text-white' : drawerPatient.aiTriage?.suggestedPriority === 'MODERATE' ? 'bg-amber-500 text-slate-950' : 'bg-slate-700 text-white'}">
              {drawerPatient.aiTriage?.suggestedPriority || 'ROUTINE'}
            </span>
          </div>
          <p class="text-xs text-slate-300 font-mono mt-0.5">
            Card: {drawerPatient.hospitalCardNo || 'GH-OPD'} &bull; Age {drawerPatient.age || 'N/A'} ({drawerPatient.gender || 'N/A'})
          </p>
        </div>
      </div>

      <button
        type="button"
        on:click={handleCloseDrawer}
        class="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors cursor-pointer"
        aria-label="Close drawer"
      >
        <X class="w-5 h-5" />
      </button>
    </div>

    <!-- Drawer Body (Structured Clinical Intake Information) -->
    <div class="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
      
      <!-- Critical Red Flag Banner if Present -->
      {#if drawerPatient.aiTriage?.safetyWarnings?.length}
        <div class="p-3.5 rounded bg-rose-50 border border-rose-300 text-rose-900 text-xs flex items-start gap-2.5">
          <ShieldAlert class="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
          <div>
            <strong class="font-bold block text-rose-950 uppercase tracking-wide text-[10px]">Critical Hazard Alert:</strong>
            <p class="mt-0.5 font-medium">{drawerPatient.aiTriage.safetyWarnings[0]}</p>
          </div>
        </div>
      {/if}

      <!-- Section 1: Chief Complaint & Vitals -->
      <div class="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-3">
        <span class="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Reported Chief Complaint</span>
        <p class="text-sm font-semibold text-slate-900 italic bg-white p-3 rounded border border-slate-200">
          "{drawerPatient.complaint}"
        </p>

        <div class="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200 text-xs">
          <div>
            <span class="text-[10px] text-slate-500 block uppercase">Pain Severity</span>
            <strong class="text-slate-900 font-mono text-sm">{drawerPatient.painScale || 'N/A'} / 10</strong>
          </div>
          <div>
            <span class="text-[10px] text-slate-500 block uppercase">Duration</span>
            <strong class="text-slate-900 font-mono text-sm">{drawerPatient.duration || 'N/A'}</strong>
          </div>
          <div>
            <span class="text-[10px] text-slate-500 block uppercase">Arrival Mode</span>
            <strong class="text-slate-900 text-sm">{drawerPatient.intakeMode || 'Self Walk-in'}</strong>
          </div>
        </div>
      </div>

      <!-- Section 2: AI Pre-Consultation Intake Answers -->
      {#if drawerPatient.answers && drawerPatient.answers.length > 0}
        <div class="space-y-2">
          <span class="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Patient Intake Q&amp;A Responses</span>
          <div class="space-y-1.5">
            {#each drawerPatient.answers as ans, idx}
              <div class="p-2.5 rounded bg-white border border-slate-200 text-xs">
                <span class="font-bold text-slate-700 block text-[11px]">Intake Query {idx + 1}</span>
                <p class="text-slate-900 mt-0.5 font-medium">{ans}</p>
              </div>
            {/each}
          </div>
        </div>
      {/if}

      <!-- Section 3: Clinician Consultation Controls (The Authority Zone) -->
      <div class="p-4 rounded-lg bg-slate-900 text-white space-y-4">
        <div class="flex items-center justify-between border-b border-slate-800 pb-2">
          <div class="flex items-center gap-1.5 text-xs font-bold text-blue-400 uppercase tracking-wider">
            <Stethoscope class="w-4 h-4" />
            <span>Clinician Authority Sign-Off</span>
          </div>
          <span class="text-[10px] text-slate-400 font-mono">Room &amp; Encounter Routing</span>
        </div>

        <!-- Room & Session assignment -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label for="drawerRoomSelect" class="block text-[10px] text-slate-400 uppercase font-bold mb-1">
              Assigned Consulting Suite
            </label>
            <select
              id="drawerRoomSelect"
              bind:value={drawerRoom}
              class="w-full py-2 px-2.5 rounded bg-slate-800 border border-slate-700 text-white text-xs font-medium focus:outline-none focus:border-[#1E5EFF] cursor-pointer"
            >
              {#each clinicRooms as room}
                <option value={room}>{room}</option>
              {/each}
            </select>
          </div>

          <div>
            <label for="drawerSessionSelect" class="block text-[10px] text-slate-400 uppercase font-bold mb-1">
              Consultation Slot
            </label>
            <select
              id="drawerSessionSelect"
              bind:value={drawerSession}
              class="w-full py-2 px-2.5 rounded bg-slate-800 border border-slate-700 text-white text-xs font-medium focus:outline-none focus:border-[#1E5EFF] cursor-pointer"
            >
              {#each timeSlots as slot}
                <option value={slot}>{slot}</option>
              {/each}
            </select>
          </div>
        </div>

        <!-- Encounter Outcome Selector -->
        <div>
          <span class="block text-[10px] text-slate-400 uppercase font-bold mb-1.5">
            Initial Encounter Decision
          </span>
          <div class="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              on:click={() => drawerOutcome = 'DISCHARGE'}
              class="p-2 rounded border text-left cursor-pointer transition-colors
                {drawerOutcome === 'DISCHARGE' ? 'bg-[#1E5EFF] text-white border-blue-400 font-bold' : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'}"
            >
              <div class="flex items-center gap-1.5">
                <Home class="w-3.5 h-3.5" />
                <span>Outpatient / Discharge</span>
              </div>
            </button>

            <button
              type="button"
              on:click={() => drawerOutcome = 'PRESCRIPTION'}
              class="p-2 rounded border text-left cursor-pointer transition-colors
                {drawerOutcome === 'PRESCRIPTION' ? 'bg-[#1E5EFF] text-white border-blue-400 font-bold' : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'}"
            >
              <div class="flex items-center gap-1.5">
                <Pill class="w-3.5 h-3.5" />
                <span>Pharmacy Rx</span>
              </div>
            </button>

            <button
              type="button"
              on:click={() => drawerOutcome = 'LAB'}
              class="p-2 rounded border text-left cursor-pointer transition-colors
                {drawerOutcome === 'LAB' ? 'bg-[#1E5EFF] text-white border-blue-400 font-bold' : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'}"
            >
              <div class="flex items-center gap-1.5">
                <FlaskConical class="w-3.5 h-3.5" />
                <span>Lab Investigation</span>
              </div>
            </button>

            <button
              type="button"
              on:click={() => drawerOutcome = 'REFERRAL'}
              class="p-2 rounded border text-left cursor-pointer transition-colors
                {drawerOutcome === 'REFERRAL' ? 'bg-[#1E5EFF] text-white border-blue-400 font-bold' : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'}"
            >
              <div class="flex items-center gap-1.5">
                <Ambulance class="w-3.5 h-3.5" />
                <span>Specialist Referral</span>
              </div>
            </button>
          </div>
        </div>

        <!-- Attending Doctor Notes -->
        <div>
          <label for="drawerNotesTextarea" class="block text-[10px] text-slate-400 uppercase font-bold mb-1">
            Clinical Instructions &amp; Triage Notes
          </label>
          <textarea
            id="drawerNotesTextarea"
            bind:value={drawerNotes}
            rows="3"
            placeholder="Type clinical review observations, prescriptions, or differential diagnosis..."
            class="w-full p-2.5 rounded bg-slate-800 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-[#1E5EFF]"
          ></textarea>
        </div>

      </div>

    </div>

    <!-- Drawer Footer Actions -->
    <div class="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
      <button
        type="button"
        on:click={handleCloseDrawer}
        class="px-4 py-2 rounded border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold cursor-pointer transition-colors"
      >
        Close Drawer
      </button>

      <div class="flex items-center gap-2">
        <button
          type="button"
          on:click={handleCallPatientToRoom}
          class="px-3.5 py-2 rounded bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold cursor-pointer transition-colors inline-flex items-center gap-1.5 shadow-2xs"
        >
          <User class="w-3.5 h-3.5 text-blue-400" />
          <span>Call into Room</span>
        </button>

        <button
          type="button"
          on:click={handleCompleteDrawerEncounter}
          disabled={isSubmitting}
          class="px-4 py-2 rounded bg-[#1E5EFF] hover:bg-blue-700 text-white text-xs font-bold cursor-pointer transition-colors inline-flex items-center gap-1.5 shadow-xs disabled:opacity-50"
        >
          <FileCheck class="w-4 h-4" />
          <span>{isSubmitting ? 'Signing...' : 'Sign & Record Encounter'}</span>
        </button>
      </div>
    </div>

  </div>
{/if}
