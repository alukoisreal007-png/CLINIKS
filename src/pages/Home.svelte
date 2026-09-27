<script>
  import { clinicStore } from '../stores/clinicStore.js';
  import { 
    Activity, 
    Stethoscope, 
    User, 
    ShieldCheck, 
    Clock, 
    ArrowRight, 
    CheckCircle2, 
    Check, 
    AlertTriangle, 
    Zap, 
    Calendar,
    Sparkles,
    FileText
  } from 'lucide-svelte';

  $: queue = $clinicStore.triageQueue || [];
  $: emergencyCount = queue.filter(q => q.assignedSection === 'EMERGENCY' || q.aiBrief?.preliminaryScore >= 8 || q.aiTriage?.suggestedPriority === 'HIGH').length;
  $: checkUpCount = queue.filter(q => q.assignedSection === 'CHECK_UP' || (q.aiBrief && q.aiBrief.preliminaryScore < 8 && q.assignedSection !== 'EMERGENCY') || (!q.assignedSection && q.aiTriage?.suggestedPriority !== 'HIGH')).length;
  $: awaitingCount = queue.filter(q => q.status === 'PENDING_APPROVAL' || !q.scheduledTime).length;

  function openPatientIntake() {
    clinicStore.setTab('BOOK_CONSULTANT');
  }

  function openClinicianWorkstation() {
    if (!$clinicStore.currentUser || $clinicStore.currentUser.role !== 'CLINICIAN') {
      clinicStore.loginAsClinician();
    }
    clinicStore.setTab('CLINICIAN_DASHBOARD');
  }
</script>

<div class="w-full bg-white text-slate-900 font-sans">
  
  <!-- ========================================================================= -->
  <!-- 1. HERO SECTION & PRIMARY WORKSTATION LAUNCHPAD                           -->
  <!-- ========================================================================= -->
  <section class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
    
    <!-- Top Calm Header -->
    <div class="text-center max-w-3xl mx-auto space-y-4">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200">
        <span class="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
        <span>CLINIKS &bull; Outpatient Decision Support &amp; Scheduling</span>
      </div>

      <h1 class="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
        Outpatient Care, Streamlined Before the Doctor's Door.
      </h1>

      <p class="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
        Collect symptoms upstream, structure clinical briefs with guardrailed AI, and schedule exact arrival times using the collision-guarded radial clock.
      </p>
    </div>

    <!-- The 2 Primary Gateway Cards (Clean, Uncluttered, Prominent) -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
      
      <!-- CARD 1: PATIENT INTAKE -->
      <div class="bg-white rounded-2xl border-2 border-slate-200 hover:border-blue-500 hover:shadow-lg p-7 transition-all flex flex-col justify-between space-y-6 group">
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div class="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold border border-blue-200">
              <User class="w-6 h-6" />
            </div>
            <span class="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-mono">
              Patient Portal
            </span>
          </div>

          <div>
            <h3 class="text-xl sm:text-2xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
              Pre-Consultation Intake
            </h3>
            <p class="text-sm text-slate-600 mt-2 leading-relaxed">
              Describe your chief complaint, onset (sudden vs. gradual), duration, and pain level. The AI structures your intake into a standardized doctor brief.
            </p>
          </div>

          <ul class="space-y-2 text-xs text-slate-700 font-medium pt-2">
            <li class="flex items-center gap-2">
              <CheckCircle2 class="w-4 h-4 text-blue-600 shrink-0" />
              <span>Sudden vs. gradual onset differentiation</span>
            </li>
            <li class="flex items-center gap-2">
              <CheckCircle2 class="w-4 h-4 text-blue-600 shrink-0" />
              <span>Standardized 1–10 discomfort severity scale</span>
            </li>
            <li class="flex items-center gap-2">
              <CheckCircle2 class="w-4 h-4 text-blue-600 shrink-0" />
              <span>Instant transmission to clinician queue</span>
            </li>
          </ul>
        </div>

        <button
          type="button"
          on:click={openPatientIntake}
          class="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <span>Begin Patient Intake</span>
          <ArrowRight class="w-4 h-4" />
        </button>
      </div>

      <!-- CARD 2: CLINICIAN WORKSTATION -->
      <div class="bg-white rounded-2xl border-2 border-slate-200 hover:border-slate-800 hover:shadow-lg p-7 transition-all flex flex-col justify-between space-y-6 group">
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div class="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">
              <Stethoscope class="w-6 h-6 text-blue-400" />
            </div>
            <span class="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 border border-slate-200 font-mono">
              Attending Clinicians
            </span>
          </div>

          <div>
            <h3 class="text-xl sm:text-2xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
              Clinician Workstation &amp; Scheduler
            </h3>
            <p class="text-sm text-slate-600 mt-2 leading-relaxed">
              Review the 3-part AI brief, verify or adjust the 1–10 urgency score, and set arrival times using the Radial Clock Dial with hard collision protection.
            </p>
          </div>

          <ul class="space-y-2 text-xs text-slate-700 font-medium pt-2">
            <li class="flex items-center gap-2">
              <CheckCircle2 class="w-4 h-4 text-slate-900 shrink-0" />
              <span>3-part brief: Chief Complaint, Timeline, Red Flags</span>
            </li>
            <li class="flex items-center gap-2">
              <CheckCircle2 class="w-4 h-4 text-slate-900 shrink-0" />
              <span>Radial gauge clock dial with collision blocker</span>
            </li>
            <li class="flex items-center gap-2">
              <CheckCircle2 class="w-4 h-4 text-slate-900 shrink-0" />
              <span>Emergency Section (EMG) vs. Check-Up (CHK) badges</span>
            </li>
          </ul>
        </div>

        <button
          type="button"
          on:click={openClinicianWorkstation}
          class="w-full py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <span>Open Clinician Workstation</span>
          <ArrowRight class="w-4 h-4" />
        </button>
      </div>

    </div>

    <!-- Live Queue Metrics Summary Strip -->
    <div class="bg-slate-50 rounded-2xl border border-slate-200 p-5 sm:p-6 max-w-4xl mx-auto">
      <div class="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
        <div class="flex items-center gap-2">
          <Activity class="w-4 h-4 text-blue-600" />
          <h4 class="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono">
            Live OPD Queue Status
          </h4>
        </div>
        <span class="text-xs font-mono text-slate-500 font-medium">Hospital Wing A</span>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
        <div class="p-3 bg-white rounded-xl border border-slate-200/80">
          <span class="text-xs text-slate-500 block font-medium">Total Queued</span>
          <strong class="text-xl font-black text-slate-900 font-mono">{queue.length}</strong>
        </div>

        <div class="p-3 bg-white rounded-xl border border-red-200">
          <span class="text-xs text-red-700 block font-medium">Emergency Section</span>
          <strong class="text-xl font-black text-red-600 font-mono">{emergencyCount}</strong>
        </div>

        <div class="p-3 bg-white rounded-xl border border-blue-200">
          <span class="text-xs text-blue-700 block font-medium">Check-Up Section</span>
          <strong class="text-xl font-black text-blue-600 font-mono">{checkUpCount}</strong>
        </div>

        <div class="p-3 bg-white rounded-xl border border-amber-200">
          <span class="text-xs text-amber-700 block font-medium">Awaiting Schedule</span>
          <strong class="text-xl font-black text-amber-600 font-mono">{awaitingCount}</strong>
        </div>
      </div>
    </div>

  </section>

  <!-- ========================================================================= -->
  <!-- 2. THE 4-STEP PIPELINE EXPLANATION                                        -->
  <!-- ========================================================================= -->
  <section class="w-full bg-slate-50 border-t border-slate-200 py-16 sm:py-20">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      
      <div class="text-center max-w-2xl mx-auto space-y-3">
        <span class="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
          System Workflow Balance
        </span>
        <h2 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          How the 4-Step Pipeline Works
        </h2>
        <p class="text-sm text-slate-600 leading-relaxed">
          Clear separation of responsibilities between upstream AI intake structuring and human clinician authority.
        </p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        <!-- Step 1 -->
        <div class="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-3">
          <div class="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 font-black flex items-center justify-center text-sm font-mono border border-blue-200">
            01
          </div>
          <h3 class="text-base font-bold text-slate-900">Pre-Consultation Intake</h3>
          <p class="text-xs text-slate-600 leading-relaxed">
            Patient submits chief complaint, sudden vs. gradual onset, duration, and 1–10 pain severity.
          </p>
          <span class="inline-block text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
            Handled by: Patient / Attendant
          </span>
        </div>

        <!-- Step 2 -->
        <div class="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-3">
          <div class="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 font-black flex items-center justify-center text-sm font-mono border border-blue-200">
            02
          </div>
          <h3 class="text-base font-bold text-slate-900">AI Structuring &amp; Scoring</h3>
          <p class="text-xs text-slate-600 leading-relaxed">
            Extracts Chief Complaint, Timeline, and Red Flags into a concise brief with a preliminary 1–10 score (<250 tokens).
          </p>
          <span class="inline-block text-[11px] font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
            Handled by: Guardrailed AI
          </span>
        </div>

        <!-- Step 3 -->
        <div class="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-3">
          <div class="w-9 h-9 rounded-xl bg-slate-900 text-white font-black flex items-center justify-center text-sm font-mono">
            03
          </div>
          <h3 class="text-base font-bold text-slate-900">Doctor Radial Scheduling</h3>
          <p class="text-xs text-slate-600 leading-relaxed">
            Attending doctor reviews brief, verifies score, and picks arrival time using the radial clock dial with hard conflict blocker.
          </p>
          <span class="inline-block text-[11px] font-mono text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
            Handled by: Doctor (Sole Authority)
          </span>
        </div>

        <!-- Step 4 -->
        <div class="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-3">
          <div class="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 font-black flex items-center justify-center text-sm font-mono border border-emerald-200">
            04
          </div>
          <h3 class="text-base font-bold text-slate-900">Queue Section Badging</h3>
          <p class="text-xs text-slate-600 leading-relaxed">
            System assigns badge to Emergency Section (EMG-XXX) if score ≥ 8, or Check-Up Section (CHK-XXX) if score 1–7.
          </p>
          <span class="inline-block text-[11px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
            Automated Routing
          </span>
        </div>

      </div>

      <!-- Strict Clinical Governance Band -->
      <div class="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="flex items-start gap-3 max-w-2xl">
          <ShieldCheck class="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div class="space-y-0.5">
            <h4 class="text-sm font-bold text-slate-900">Clinical Decision Support Standard</h4>
            <p class="text-xs text-slate-600 leading-relaxed">
              The AI never autonomously diagnoses illnesses or prescribes medication. All clinical priorities, diagnosis, and scheduling decisions remain under the authority of licensed healthcare professionals.
            </p>
          </div>
        </div>

        <button
          type="button"
          on:click={openClinicianWorkstation}
          class="shrink-0 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
        >
          Launch Workstation
        </button>
      </div>

    </div>
  </section>

</div>
