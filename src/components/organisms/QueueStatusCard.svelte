<script>
  import { clinicStore } from '../../stores/clinicStore.js';
  import ClinicalReportModal from '../molecules/ClinicalReportModal.svelte';
  import { 
    Clock, 
    ShieldCheck, 
    AlertTriangle, 
    CheckCircle2, 
    ChevronDown, 
    ChevronUp, 
    Activity, 
    FileText,
    Pill,
    FlaskConical,
    Home,
    Ambulance,
    ArrowRight,
    MapPin,
    Stethoscope,
    Printer
  } from 'lucide-svelte';

  export let appointment = null;
  let showReportModal = false;
  let simulatedOutcome = null; // null | 'PRESCRIPTION' | 'EMERGENCY' | 'LAB' | 'DISCHARGE' | 'CALLED_TO_ROOM'

  // ─── MOCK DATA (used when no real intake has been submitted yet) ───
  const MOCK = {
    id: 'TRG-0071',
    queueNo: '007',
    patientName: 'Adaeze Okonkwo',
    hospitalCardNo: 'GH-2024-00831',
    age: '34',
    gender: 'Female',
    submittedAt: 'Just now',
    complaint: 'I have had a severe headache and high fever since this morning. I also feel very weak and my body is aching all over.',
    duration: '1 to 2 days',
    painScale: 7,
    intakeMode: 'SELF_WALKIN',
    aiTriage: {
      suggestedPriority: 'MODERATE',
      urgencyScore: 65,
      patientBrief: 'Patient reports severe headache and high fever ongoing for 1–2 days with generalised body aches and weakness. Pain level 7/10.',
      safetyWarnings: ['Elevated discomfort or functional impairment. Same-day clinical assessment indicated.'],
      suggestedRoom: 'Room 104 (General Physician 1)',
      recommendedSession: 'Morning Session (11:00 AM)',
      source: 'LOCAL_OPTIMISTIC_HEURISTIC'
    },
    status: 'PENDING_APPROVAL',
    assignedRoom: 'Room 104 (General Physician 1)',
    assignedSession: 'Morning Session (11:00 AM)',
    answers: [
      'Breathing: No breathing issues',
      'Neck / Neuro: No neck stiffness',
      'Oral Fluids: Can tolerate fluids',
      'Mobility: Can bear weight',
      'Additional Notes: None'
    ]
  };

  // Base appointment from store or props
  $: rawAppt = appointment || $clinicStore.activePatientAppointment || MOCK;

  // Resolved active appointment applying any test simulation
  $: appt = (() => {
    if (!simulatedOutcome) return rawAppt;

    if (simulatedOutcome === 'CALLED_TO_ROOM') {
      return {
        ...rawAppt,
        status: 'APPROVED',
        clinicianNotes: '',
        assignedRoom: 'Room 101 (Emergency & Acute Bay)',
        assignedSession: 'Immediate Examination Slot'
      };
    }
    if (simulatedOutcome === 'PRESCRIPTION') {
      return {
        ...rawAppt,
        status: 'APPROVED',
        encounterOutcome: 'PRESCRIPTION',
        clinicianNotes: `1. Tab Paracetamol 1000mg TDS x 3 days.
2. Cap Amoxicillin/Clavulanate 625mg BD x 5 days.
3. Oral Rehydration Solution — 1 sachet daily in 1L clean water.
Patient advised on rest and hydration.`,
        assignedRoom: 'Room 104 (General Physician 1)'
      };
    }
    if (simulatedOutcome === 'LAB') {
      return {
        ...rawAppt,
        status: 'APPROVED',
        encounterOutcome: 'LAB',
        clinicianNotes: `1. Full Blood Count (FBC/ESR)
2. Malaria Parasite (MP by Giemsa Thick Smear)
3. Urinalysis Dipstick & Microscopy
Patient referred to Central Pathology Collection window.`,
        assignedRoom: 'Room 104 (General Physician 1)'
      };
    }
    if (simulatedOutcome === 'DISCHARGE') {
      return {
        ...rawAppt,
        status: 'APPROVED',
        encounterOutcome: 'DISCHARGE',
        clinicianNotes: `Patient examined and assessed stable. Symptomatic home care authorized. Bed rest 48 hours and oral fluid intake 2.5L daily. Return to clinic if fever recurs.`,
        assignedRoom: 'Room 104 (General Physician 1)'
      };
    }
    if (simulatedOutcome === 'EMERGENCY') {
      return {
        ...rawAppt,
        status: 'APPROVED',
        encounterOutcome: 'REFERRAL',
        aiTriage: {
          ...rawAppt.aiTriage,
          suggestedPriority: 'HIGH',
          urgencyScore: 95
        },
        clinicianNotes: `Acute emergency transfer order. High-grade fever with meningeal warning signs. Emergency ambulance transport authorized to State Specialist Hospital Trauma Centre.`,
        assignedRoom: 'Room 101 (Emergency & Nebulization Bay)'
      };
    }
    return rawAppt;
  })();

  $: priority = appt?.aiTriage?.suggestedPriority || 'ROUTINE';
  $: showDetail = false;

  // Determine consultation state
  $: isCalledToRoom = appt?.status === 'APPROVED' && (!appt.clinicianNotes || appt.clinicianNotes.trim() === '') && !appt.encounterOutcome;
  $: isCompleted = appt?.status === 'APPROVED' && (!!appt.clinicianNotes || !!appt.encounterOutcome);
  $: outcomeType = appt?.encounterOutcome || (
    (appt?.clinicianNotes || '').toLowerCase().includes('prescription') ? 'PRESCRIPTION' :
    (appt?.clinicianNotes || '').toLowerCase().includes('laboratory') ? 'LAB' :
    (appt?.clinicianNotes || '').toLowerCase().includes('referral') || appt?.aiTriage?.suggestedPriority === 'HIGH' ? 'REFERRAL' :
    'DISCHARGE'
  );

  // Priority display config
  const priorityConfig = {
    HIGH: {
      bg: 'bg-red-50',
      border: 'border-red-300',
      badge: 'bg-[#DC2626] text-white',
      dot: 'bg-[#DC2626]',
      label: 'HIGH URGENCY',
      icon: AlertTriangle,
      wait: '~5 – 10 minutes',
      message: 'Please stay nearby. An emergency nurse or physician will summon you immediately.',
    },
    MODERATE: {
      bg: 'bg-amber-50',
      border: 'border-amber-300',
      badge: 'bg-[#D97706] text-white',
      dot: 'bg-[#D97706]',
      label: 'MODERATE URGENCY',
      icon: Activity,
      wait: '~15 – 25 minutes',
      message: 'Please remain in the waiting area. A clinician will call your queue ticket shortly.',
    },
    ROUTINE: {
      bg: 'bg-slate-50',
      border: 'border-slate-300',
      badge: 'bg-[#0F172A] text-white',
      dot: 'bg-slate-500',
      label: 'ROUTINE OPD',
      icon: CheckCircle2,
      wait: '~30 – 45 minutes',
      message: 'Your pre-consultation information has been logged. Please wait for room assignment.',
    },
  };

  $: cfg = priorityConfig[priority] || priorityConfig.ROUTINE;

  // Intake mode labels
  const intakeModeLabels = {
    SELF_WALKIN: 'Self walk-in',
    STAFF_ASSISTED: 'Staff-assisted',
    REFERRED: 'Referred by clinic',
    BROUGHT_IN: 'Brought in by someone',
  };
</script>

<div class="space-y-4 max-w-2xl mx-auto">

  <!-- ── DEMO SIMULATION BAR (Allows user to inspect all outcomes instantly) ── -->
  <div class="bg-[#0F172A] text-white p-2.5 rounded-xl border border-slate-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-xs">
    <div class="flex items-center gap-1.5 font-mono text-[10px] text-slate-400">
      <span class="w-2 h-2 rounded-full bg-[#699FDF] animate-pulse"></span>
      <span class="font-bold uppercase tracking-wider text-slate-300">Test Outcome Views:</span>
    </div>
    <div class="flex items-center gap-1 overflow-x-auto">
      <button 
        type="button" 
        on:click={() => simulatedOutcome = 'CALLED_TO_ROOM'}
        class="px-2 py-1 rounded text-[10px] font-bold cursor-pointer transition-colors {simulatedOutcome === 'CALLED_TO_ROOM' ? 'bg-[#699FDF] text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'}"
      >
        📞 Call In
      </button>
      <button 
        type="button" 
        on:click={() => simulatedOutcome = 'PRESCRIPTION'}
        class="px-2 py-1 rounded text-[10px] font-bold cursor-pointer transition-colors {simulatedOutcome === 'PRESCRIPTION' ? 'bg-[#699FDF] text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'}"
      >
        💊 Rx
      </button>
      <button 
        type="button" 
        on:click={() => simulatedOutcome = 'EMERGENCY'}
        class="px-2 py-1 rounded text-[10px] font-bold cursor-pointer transition-colors {simulatedOutcome === 'EMERGENCY' ? 'bg-[#DC2626] text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'}"
      >
        🚨 Emergency
      </button>
      <button 
        type="button" 
        on:click={() => simulatedOutcome = 'LAB'}
        class="px-2 py-1 rounded text-[10px] font-bold cursor-pointer transition-colors {simulatedOutcome === 'LAB' ? 'bg-[#699FDF] text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'}"
      >
        🔬 Lab
      </button>
      <button 
        type="button" 
        on:click={() => simulatedOutcome = 'DISCHARGE'}
        class="px-2 py-1 rounded text-[10px] font-bold cursor-pointer transition-colors {simulatedOutcome === 'DISCHARGE' ? 'bg-emerald-700 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'}"
      >
        🏠 Discharge
      </button>
      {#if simulatedOutcome}
        <button 
          type="button" 
          on:click={() => simulatedOutcome = null}
          class="px-1.5 py-1 text-[10px] text-slate-400 hover:text-white cursor-pointer underline"
        >
          Reset
        </button>
      {/if}
    </div>
  </div>

  <!-- ========================================================================= -->
  <!-- 1. LIVE CASE STATUS BANNER: CALLED INTO ROOM vs COMPLETED vs WAITING      -->
  <!-- ========================================================================= -->
  {#if isCalledToRoom}
    <!-- STATE A: PROCEED TO CONSULTING ROOM IMMEDIATELY -->
    <div class="rounded-2xl bg-blue-600 text-white p-5 sm:p-6 shadow-xl border-2 border-blue-400 animate-in zoom-in-95 duration-200">
      <div class="flex items-start gap-4">
        <div class="w-12 h-12 rounded-xl bg-white text-[#1E5EFF] flex items-center justify-center font-black text-xl shrink-0 shadow-md">
          <Stethoscope class="w-6 h-6 stroke-[2.5]" />
        </div>
        <div class="space-y-1.5 flex-1">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-white animate-ping"></span>
            <span class="text-xs font-mono font-black uppercase tracking-widest text-blue-100">
              CLINICIAN WAITING &bull; PROCEED NOW
            </span>
          </div>
          <h3 class="text-xl sm:text-2xl font-black tracking-tight text-white">
            Please Walk into {appt.assignedRoom || 'Consulting Room 101'}
          </h3>
          <p class="text-xs sm:text-sm text-blue-100 font-medium">
            Attending physician is ready to examine you for session: <strong>{appt.assignedSession || 'Immediate Session'}</strong>.
            Please carry your hospital folder card <strong>({appt.hospitalCardNo})</strong>.
          </p>
        </div>
      </div>
    </div>

  {:else if isCompleted}
    <!-- STATE B: CONSULTATION FINISHED & OFFICIAL DISPOSITION READY -->
    <div class="rounded-2xl overflow-hidden shadow-lg border-2 
      {outcomeType === 'EMERGENCY' || outcomeType === 'REFERRAL' 
        ? 'border-rose-400 bg-rose-950 text-white' 
        : outcomeType === 'LAB' 
          ? 'border-blue-400 bg-slate-900 text-white' 
          : outcomeType === 'DISCHARGE'
            ? 'border-teal-500 bg-slate-900 text-white'
            : 'border-emerald-500 bg-emerald-950 text-white'}">
      
      <!-- Top header bar -->
      <div class="px-5 py-3.5 flex items-center justify-between border-b 
        {outcomeType === 'EMERGENCY' || outcomeType === 'REFERRAL' ? 'border-rose-800 bg-rose-900/60' : 'border-slate-800 bg-slate-950/60'}">
        <div class="flex items-center gap-2">
          {#if outcomeType === 'EMERGENCY' || outcomeType === 'REFERRAL'}
            <AlertTriangle class="w-4 h-4 text-rose-400 stroke-[2.5]" />
            <span class="text-xs font-mono font-black uppercase tracking-wider text-rose-300">
              🚨 EMERGENCY REFERRAL &amp; ESCALATION ORDER
            </span>
          {:else if outcomeType === 'LAB'}
            <FlaskConical class="w-4 h-4 text-blue-400 stroke-[2.5]" />
            <span class="text-xs font-mono font-black uppercase tracking-wider text-blue-300">
              🔬 DIAGNOSTIC PATHOLOGY REQUISITION ACTIVE
            </span>
          {:else if outcomeType === 'DISCHARGE'}
            <Home class="w-4 h-4 text-emerald-400 stroke-[2.5]" />
            <span class="text-xs font-mono font-black uppercase tracking-wider text-emerald-300">
              🏠 OUTPATIENT CONSULTATION COMPLETE &bull; DISCHARGED
            </span>
          {:else}
            <Pill class="w-4 h-4 text-emerald-400 stroke-[2.5]" />
            <span class="text-xs font-mono font-black uppercase tracking-wider text-emerald-300">
              💊 PHARMACY PRESCRIPTION AUTHORIZED &bull; READY
            </span>
          {/if}
        </div>
        <span class="text-[10px] font-mono font-bold bg-white/10 px-2 py-0.5 rounded border border-white/20">
          LEDGER SIGNED
        </span>
      </div>

      <!-- Main card body -->
      <div class="p-5 sm:p-6 space-y-4">
        
        <!-- Case Summary Headline -->
        <div>
          <h3 class="text-lg sm:text-xl font-black tracking-tight text-white">
            {#if outcomeType === 'EMERGENCY' || outcomeType === 'REFERRAL'}
              Emergency Handover &amp; Paramedic Transfer Initiated
            {:else if outcomeType === 'LAB'}
              Proceed to Laboratory Specimen Collection
            {:else if outcomeType === 'DISCHARGE'}
              Clinical Encounter Complete &bull; Cleared to Proceed Home
            {:else}
              Prescription Slip Authorized &bull; Ready for Pharmacy Pickup
            {/if}
          </h3>
          <p class="text-xs sm:text-sm text-slate-300 font-medium mt-1 leading-relaxed">
            {#if outcomeType === 'EMERGENCY' || outcomeType === 'REFERRAL'}
              Attending physician has flagged acute symptoms requiring specialized trauma/inpatient evaluation. An ambulance transfer and paramedic handover sheet have been authorized.
            {:else if outcomeType === 'LAB'}
              Diagnostic pathology tests have been ordered. Take your verified requisition slip to Central Pathology (OPD Wing B) for rapid analysis.
            {:else if outcomeType === 'DISCHARGE'}
              Your physical assessment is complete. Follow the doctor's home hydration, medication, and rest advice. Return immediately if red-flag symptoms arise.
            {:else}
              Your medications have been digitally endorsed and routed to the Central Hospital Pharmacy Dispensary. Show your hospital card at the dispensing counter.
            {/if}
          </p>
        </div>

        <!-- Next Action Step Box -->
        <div class="p-3.5 rounded-xl bg-white/10 border border-white/15 text-xs font-mono space-y-1">
          <div class="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Next Step for Patient:</div>
          <p class="text-white font-bold text-xs sm:text-sm flex items-center gap-1.5">
            <ArrowRight class="w-4 h-4 text-emerald-400 shrink-0" />
            {#if outcomeType === 'EMERGENCY' || outcomeType === 'REFERRAL'}
              <span>Remain in {appt.assignedRoom || 'Room 101'}. Paramedic nursing escort is on the way.</span>
            {:else if outcomeType === 'LAB'}
              <span>Proceed to Laboratory Collection Window (OPD Wing B).</span>
            {:else if outcomeType === 'DISCHARGE'}
              <span>Outpatient clearance complete. Rest 48 hours &amp; maintain 2.5L fluids daily.</span>
            {:else}
              <span>Proceed to Central Pharmacy Dispensary (Wing A) with Card: {appt.hospitalCardNo}.</span>
            {/if}
          </p>
        </div>

        <!-- Action Button: Open Official Printable Document -->
        <div class="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div class="text-xs text-slate-400 font-mono">
            Signed by: <strong class="text-white">Dr. Stella Adeleke (FWACP)</strong> &bull; Ref: <span class="text-emerald-400">#MED-OPD-782910</span>
          </div>

          <button
            type="button"
            on:click={() => showReportModal = true}
            class="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-md"
          >
            <FileText class="w-4 h-4" />
            <span>
              {#if outcomeType === 'EMERGENCY' || outcomeType === 'REFERRAL'}
                View Emergency Handover Sheet (PDF)
              {:else if outcomeType === 'LAB'}
                View Lab Requisition Slip (PDF)
              {:else if outcomeType === 'DISCHARGE'}
                View Official Discharge Summary (PDF)
              {:else}
                View Official Prescription Slip (Rx PDF)
              {/if}
            </span>
          </button>
        </div>

      </div>

    </div>
  {/if}

  <!-- ========================================================================= -->
  <!-- 2. QUEUE TICKET NUMBER CARD (Always displays patient's queue card)        -->
  <!-- ========================================================================= -->
  <div class="rounded-2xl border-2 {cfg.border} {cfg.bg} overflow-hidden shadow-xs">

    <!-- Priority Header Bar -->
    <div class="px-4 py-3 flex items-center justify-between gap-4 border-b {cfg.border}">
      <div class="flex items-center gap-2.5">
        <span class="relative flex h-2.5 w-2.5">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full {cfg.dot} opacity-60"></span>
          <span class="relative inline-flex rounded-full h-2.5 w-2.5 {cfg.dot}"></span>
        </span>
        <span class="text-xs font-mono font-bold uppercase tracking-wider {cfg.badge.includes('rose') ? 'text-rose-900' : cfg.badge.includes('amber') ? 'text-amber-900' : 'text-slate-800'}">
          {cfg.label}
        </span>
      </div>
      <span class="text-[11px] px-2 py-0.5 rounded font-mono font-bold {cfg.badge}">
        TRIAGE SCORE: {appt.aiTriage?.urgencyScore || 0} / 100
      </span>
    </div>

    <!-- Queue Number & Status -->
    <div class="px-5 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <div class="flex items-center gap-1.5 mb-1">
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <p class="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">System-Issued OPD Queue Ticket</p>
        </div>
        <p class="text-6xl sm:text-7xl font-black text-slate-900 leading-none tracking-tight font-mono">
          #{appt.queueNo || appt.id?.slice(-3) || '001'}
        </p>
        <p class="text-[11px] text-slate-500 font-mono pt-1">
          Intake: {appt.submittedAt || 'Just now'} &bull; Station: {appt.assignedRoom || 'Room 101'}
        </p>
      </div>

      <!-- Wait time or Consulted Status -->
      <div class="sm:text-right space-y-1.5 sm:max-w-xs">
        {#if isCompleted}
          <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-emerald-100 text-emerald-900 border border-emerald-300 font-mono font-bold text-xs">
            <CheckCircle2 class="w-4 h-4 text-emerald-700" />
            <span>Encounter Completed</span>
          </div>
          <p class="text-xs text-slate-600 font-medium">
            Clinical directives authorized by attending physician.
          </p>
        {:else if isCalledToRoom}
          <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-blue-100 text-blue-900 border border-blue-300 font-mono font-bold text-xs animate-pulse">
            <Stethoscope class="w-4 h-4 text-blue-700" />
            <span>Called into Room</span>
          </div>
          <p class="text-xs text-slate-600 font-medium">
            Please proceed to {appt.assignedRoom}.
          </p>
        {:else}
          <div class="flex sm:justify-end items-center gap-2">
            <Clock class="w-4 h-4 text-slate-400" />
            <span class="text-xs font-bold text-slate-700 font-mono">Est. Wait: <span class="text-slate-900">{cfg.wait}</span></span>
          </div>
          <p class="text-xs text-slate-600 leading-relaxed font-medium">
            {cfg.message}
          </p>
        {/if}
      </div>
    </div>

    <!-- Patient identity strip -->
    <div class="px-5 py-2.5 bg-white/70 border-t {cfg.border} flex flex-wrap gap-2.5 items-center text-xs font-mono">
      <span class="font-bold text-slate-900 font-sans">{appt.patientName || 'Patient'}</span>
      {#if appt.hospitalCardNo}
        <span class="bg-white border border-slate-300 px-2 py-0.5 rounded text-slate-700">
          Card: {appt.hospitalCardNo}
        </span>
      {/if}
      {#if appt.age}
        <span class="bg-white border border-slate-300 px-2 py-0.5 rounded text-slate-700">
          Age: {appt.age}
        </span>
      {/if}
      {#if appt.gender}
        <span class="bg-white border border-slate-300 px-2 py-0.5 rounded text-slate-700">
          {appt.gender}
        </span>
      {/if}
      {#if appt.intakeMode}
        <span class="bg-white border border-slate-300 px-2 py-0.5 rounded text-slate-600">
          {intakeModeLabels[appt.intakeMode] || appt.intakeMode}
        </span>
      {/if}
    </div>
  </div>

  <!-- ── COMPLAINT SUMMARY CARD ── -->
  <div class="rounded-xl border border-slate-300 bg-white shadow-2xs overflow-hidden">
    <div class="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
      <h3 class="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">Reported Complaint Summary</h3>
      <span class="text-[11px] font-mono text-slate-400">AI-Organized Intake</span>
    </div>
    <div class="px-4 py-3.5 space-y-3">

      <!-- Patient brief -->
      <p class="text-xs text-slate-800 leading-relaxed font-medium italic bg-slate-50 p-2.5 rounded border border-slate-200">
        "{appt.aiTriage?.patientBrief || appt.complaint}"
      </p>

      <!-- Pain + Duration chips -->
      <div class="flex flex-wrap gap-2 text-xs font-mono">
        <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded border
          {appt.painScale >= 8 ? 'bg-rose-50 border-rose-300 text-rose-900 font-bold' : appt.painScale >= 5 ? 'bg-amber-50 border-amber-300 text-amber-950 font-bold' : 'bg-slate-100 border-slate-300 text-slate-800'}">
          Pain Level: {appt.painScale}/10
          {#if appt.painScale >= 8}(Severe){:else if appt.painScale >= 5}(Moderate){:else}(Mild){/if}
        </span>
        <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-slate-300 bg-slate-100 text-slate-700">
          Duration: {appt.duration || 'Not specified'}
        </span>
      </div>

      <!-- Safety flags -->
      {#if appt.aiTriage?.safetyWarnings?.length}
        <div class="p-2.5 rounded bg-amber-50 border border-amber-200 flex items-start gap-2">
          <AlertTriangle class="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <p class="text-xs text-amber-900 font-semibold leading-relaxed">
            {appt.aiTriage.safetyWarnings[0]}
          </p>
        </div>
      {/if}

      <!-- Toggle extra details -->
      <button
        type="button"
        on:click={() => showDetail = !showDetail}
        class="flex items-center gap-1 text-xs font-bold text-blue-700 hover:text-blue-900 cursor-pointer transition-colors"
      >
        {#if showDetail}
          <ChevronUp class="w-3.5 h-3.5" /> Hide intake questionnaire
        {:else}
          <ChevronDown class="w-3.5 h-3.5" /> View intake questionnaire answers
        {/if}
      </button>

      {#if showDetail}
        <div class="pt-2 space-y-1 border-t border-slate-200">
          {#each (appt.answers || []) as ans}
            <p class="text-xs text-slate-700 font-medium">• {ans}</p>
          {/each}
        </div>
      {/if}
    </div>
  </div>

  <!-- ── REASSURANCE FOOTER ── -->
  <div class="flex items-start gap-3 p-3.5 rounded-xl bg-slate-100 border border-slate-300 text-xs text-slate-700">
    <ShieldCheck class="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
    <div class="leading-relaxed">
      <strong>Clinical Authority Standard:</strong> CLINIKS supports healthcare professionals by structuring pre-consultation intake. 
      All diagnosis, room routing, prescription orders, and discharge authorizations remain exclusively in clinician hands.
    </div>
  </div>

</div>

<!-- Clinical Report Modal with Deterministic Template & Interactive Switcher -->
<ClinicalReportModal
  bind:open={showReportModal}
  caseData={appt}
/>
