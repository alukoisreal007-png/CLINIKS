<script>
  import { clinicStore } from '../stores/clinicStore.js';
  import { 
    Activity, 
    Stethoscope, 
    User, 
    ShieldCheck, 
    Clock, 
    ArrowRight, 
    Lock, 
    FileText,
    HeartPulse,
    AlertCircle,
    CheckCircle2,
    Check,
    FileCheck,
    Shield,
    Users,
    ClipboardList,
    Layers,
    ChevronRight,
    Calendar,
    MapPin,
    AlertTriangle
  } from 'lucide-svelte';

  $: currentUser = $clinicStore.currentUser;

  function goToDashboard() {
    if (currentUser?.role === 'CLINICIAN') {
      clinicStore.setTab('CLINICIAN_DASHBOARD');
    } else {
      clinicStore.setTab('PATIENT_DASHBOARD');
    }
  }

  function goToAuth(role = 'PATIENT') {
    if (currentUser) {
      goToDashboard();
      return;
    }
    clinicStore.setAuthRole(role);
  }
</script>

<div class="w-full space-y-0 text-slate-900 bg-white">

  <!-- Active Session Sticky Notification Strip for Logged-In User -->
  {#if currentUser}
    <aside aria-label="Session status" class="w-full bg-[#0F172A] border-b border-slate-800 text-white py-3 px-4 shadow-sm sticky top-16 z-30 animate-in slide-in-from-top-2 duration-150">
      <div class="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
        <div class="flex items-center gap-2.5 font-bold">
          <span class="w-2.5 h-2.5 rounded-full bg-[#699FDF] animate-ping"></span>
          <span>Active Session: Logged in as <strong class="text-white">{currentUser.profile?.name || 'User'}</strong> ({currentUser.role === 'CLINICIAN' ? 'Clinician Portal' : 'Patient Portal'})</span>
        </div>
        <button
          type="button"
          on:click={goToDashboard}
          class="px-4 py-1.5 rounded-xl bg-[#699FDF] hover:bg-[#5289CC] text-white font-bold text-xs transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-sm hover:scale-102 active:scale-98"
        >
          <span>Back to Dashboard</span>
          <ArrowRight class="w-3.5 h-3.5 stroke-[3]" />
        </button>
      </div>
    </aside>
  {/if}

  <!-- ========================================================================= -->
  <!-- 1. HERO SECTION                                                           -->
  <!-- ========================================================================= -->
  <section class="w-full bg-white border-b border-slate-200 py-20 sm:py-28">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
      <!-- Tagline -->
      <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 text-[#2563EB] text-xs sm:text-sm font-semibold mb-6 border border-blue-200/80">
        <span class="w-2 h-2 rounded-full bg-[#699FDF] animate-pulse"></span>
        Nigerian Government OPD &bull; Clinical Triage &amp; Intake
      </div>

      <!-- Main Headline (from thesis title) -->
      <h1 class="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#0F172A] mb-6 leading-tight">
        AI-Assisted Outpatient Care for Nigerian Government Hospitals.
      </h1>

      <!-- Sub-copy (from thesis executive summary) -->
      <p class="text-lg sm:text-xl text-slate-600 mb-8 leading-relaxed max-w-3xl">
        Government hospitals face high patient demand and constrained clinical capacity. CLINIKS moves information-gathering upstream — so before a patient reaches the doctor, their complaint is already collected, structured, and ready to read.
      </p>

      <!-- Action Area -->
      {#if currentUser}
        <div class="p-6 rounded-2xl bg-blue-50/60 border-2 border-blue-200 max-w-md w-full text-center space-y-3 shadow-sm animate-in fade-in duration-200">
          <div class="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-blue-900">
            <span class="w-2.5 h-2.5 rounded-full bg-[#699FDF] animate-ping"></span>
            <span>Active Session</span>
          </div>
          <p class="text-sm font-bold text-slate-800">
            Welcome back, <strong class="text-slate-950">{currentUser.profile?.name || 'User'}</strong> ({currentUser.role === 'CLINICIAN' ? 'Clinician' : 'Patient'}).
          </p>
          <button
            type="button"
            on:click={goToDashboard}
            class="w-full px-8 py-3.5 rounded-xl bg-[#699FDF] hover:bg-[#5289CC] text-white font-black text-base shadow-sm transition-all cursor-pointer inline-flex items-center justify-center gap-2 hover:scale-102 active:scale-98"
          >
            <span>Back to Dashboard</span>
            <ArrowRight class="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>
      {:else}
        <div class="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
          <button
            type="button"
            on:click={() => goToAuth('PATIENT')}
            class="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#699FDF] hover:bg-[#5289CC] text-white font-bold text-base text-center shadow-sm transition-all cursor-pointer inline-flex items-center justify-center gap-2"
          >
            Patient Portal &rarr;
          </button>
          <button
            type="button"
            on:click={() => goToAuth('CLINICIAN')}
            class="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white font-bold text-base text-center border border-slate-700 transition-all cursor-pointer inline-flex items-center justify-center gap-2"
          >
            Clinician Portal
          </button>
        </div>
      {/if}

      <!-- Stats from thesis (Rivers State study) -->
      <div class="mt-10 pt-8 border-t border-slate-200 flex flex-wrap items-center justify-center gap-6 sm:gap-10">
        <div class="text-center">
          <div class="text-3xl font-black text-[#0F172A]">86.7 min</div>
          <div class="text-xs text-slate-500 font-medium mt-0.5">Average OPD idle/wait time</div>
        </div>
        <div class="text-center">
          <div class="text-3xl font-black text-[#0F172A]">12.6 min</div>
          <div class="text-xs text-slate-500 font-medium mt-0.5">Average doctor consultation time</div>
        </div>
        <div class="text-center">
          <div class="text-3xl font-black text-[#699FDF]">3.86</div>
          <div class="text-xs text-slate-500 font-medium mt-0.5">Doctors per 10,000 Nigerians (WHO)</div>
        </div>
      </div>
      <p class="text-xs text-slate-400 mt-3">Source: Kemdirim et al., Nigerian Medical Journal 2022 · WHO 2022</p>
    </div>
  </section>



  <!-- ========================================================================= -->
  <!-- 2. TWO PORTALS                                                            -->
  <!-- ========================================================================= -->
  <section class="w-full py-20 sm:py-28 bg-slate-50 border-b border-slate-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center max-w-3xl mx-auto mb-14 space-y-3">
        <h2 class="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0F172A] tracking-tight">
          Two portals. One coordinated OPD.
        </h2>
        <p class="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
          Clear, structured workflows connecting patients with attending clinicians in Nigerian government outpatient departments.
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-stretch">
        <!-- Card 1: Patient Portal -->
        <div id="for-patients" class="bg-white rounded-2xl p-8 sm:p-10 border border-slate-200 shadow-sm flex flex-col justify-between hover:border-[#699FDF] transition-all">
          <div class="space-y-6">
            <div class="flex items-center justify-between">
              <div class="w-12 h-12 rounded-xl bg-blue-50 text-[#699FDF] flex items-center justify-center border border-blue-200">
                <User class="w-6 h-6" />
              </div>
              <span class="text-xs font-semibold px-3 py-1 rounded-full bg-blue-50 text-[#2563EB] border border-blue-200/60 font-mono">
                For OPD Patients
              </span>
            </div>

            <div>
              <h3 class="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Patient Portal</h3>
              <p class="text-base text-slate-600 mt-2 leading-relaxed">
                Complete a guided pre-consultation questionnaire before seeing the doctor — by voice or touch, even on a basic smartphone.
              </p>
            </div>

            <ul class="space-y-4 pt-2 text-base text-slate-700">
              <li class="flex items-start gap-3">
                <CheckCircle2 class="w-5 h-5 text-[#699FDF] shrink-0 mt-0.5" />
                <span class="leading-relaxed">Describe your symptoms by voice or text — no typing skill required</span>
              </li>
              <li class="flex items-start gap-3">
                <CheckCircle2 class="w-5 h-5 text-[#699FDF] shrink-0 mt-0.5" />
                <span class="leading-relaxed">AI organizes your complaint into a structured patient brief</span>
              </li>
              <li class="flex items-start gap-3">
                <CheckCircle2 class="w-5 h-5 text-[#699FDF] shrink-0 mt-0.5" />
                <span class="leading-relaxed">See your queue number and estimated wait time</span>
              </li>
              <li class="flex items-start gap-3">
                <CheckCircle2 class="w-5 h-5 text-[#699FDF] shrink-0 mt-0.5" />
                <span class="leading-relaxed">Works offline-first — no stable internet required</span>
              </li>
              <li class="flex items-start gap-3">
                <CheckCircle2 class="w-5 h-5 text-[#699FDF] shrink-0 mt-0.5" />
                <span class="leading-relaxed">Staff can complete the intake on your behalf if needed</span>
              </li>
            </ul>
          </div>

          <div class="pt-8 flex justify-center">
            <button
              type="button"
              on:click={() => goToAuth('PATIENT')}
              class="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#699FDF] hover:bg-[#5289CC] text-white font-bold text-base text-center shadow-sm transition-all cursor-pointer inline-flex items-center justify-center gap-2"
            >
              <span>Open Patient Portal</span>
              <ArrowRight class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- Card 2: Clinician Command Hub -->
        <div id="for-clinics" class="bg-white rounded-2xl p-8 sm:p-10 border border-slate-200 shadow-sm flex flex-col justify-between hover:border-[#699FDF] transition-all">
          <div class="space-y-6">
            <div class="flex items-center justify-between">
              <div class="w-12 h-12 rounded-xl bg-slate-900 text-[#699FDF] flex items-center justify-center border border-slate-800">
                <Stethoscope class="w-6 h-6 text-[#699FDF]" />
              </div>
              <span class="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-800 border border-slate-200 font-mono">
                For Healthcare Workers
              </span>
            </div>

            <div>
              <h3 class="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Clinician Command Hub</h3>
              <p class="text-base text-slate-600 mt-2 leading-relaxed">
                Healthcare workers review structured patient summaries ahead of time to accelerate triage.
              </p>
            </div>

            <!-- Bullet list -->
            <ul class="space-y-4 pt-2 text-base text-slate-700">
              <li class="flex items-start gap-3">
                <CheckCircle2 class="w-5 h-5 text-[#699FDF] shrink-0 mt-0.5" />
                <span class="leading-relaxed">Review AI-generated patient summaries</span>
              </li>
              <li class="flex items-start gap-3">
                <CheckCircle2 class="w-5 h-5 text-[#699FDF] shrink-0 mt-0.5" />
                <span class="leading-relaxed">Confirm or reclassify triage priority</span>
              </li>
              <li class="flex items-start gap-3">
                <CheckCircle2 class="w-5 h-5 text-[#699FDF] shrink-0 mt-0.5" />
                <span class="leading-relaxed">Manage emergency, urgent, and routine queues</span>
              </li>
              <li class="flex items-start gap-3">
                <CheckCircle2 class="w-5 h-5 text-[#699FDF] shrink-0 mt-0.5" />
                <span class="leading-relaxed">Inspect relevant student medical history</span>
              </li>
              <li class="flex items-start gap-3">
                <CheckCircle2 class="w-5 h-5 text-[#699FDF] shrink-0 mt-0.5" />
                <span class="leading-relaxed">Complete and digitally sign medical reports</span>
              </li>
            </ul>
          </div>

          <div class="pt-8 flex justify-center">
            <button
              type="button"
              on:click={() => goToAuth('CLINICIAN')}
              class="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#699FDF] hover:bg-[#5289CC] text-white font-bold text-base text-center shadow-sm transition-all cursor-pointer inline-flex items-center justify-center gap-2"
            >
              <span>Open Clinician Hub</span>
              <ArrowRight class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ========================================================================= -->
  <!-- 3. IMPORTANT CLINICAL AUTHORITY MESSAGE (DEEP MIDNIGHT BRAND BAND)        -->
  <!-- ========================================================================= -->
  <section class="w-full py-20 sm:py-28 bg-[#0F172A] text-white border-y border-slate-800">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      <!-- Title & Main Rule -->
      <div class="text-center space-y-4">
        <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 text-[#699FDF] text-xs sm:text-sm font-medium border border-[#699FDF]/20">
          <ShieldCheck class="w-4 h-4 text-[#699FDF]" />
          <span>Clinical Governance &amp; Safety Standard</span>
        </div>
        <h2 class="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
          AI assists. Clinicians decide.
        </h2>
        <p class="text-xl sm:text-2xl font-bold text-[#699FDF]">
          CLINIKS does not replace healthcare workers.
        </p>
        <p class="text-base sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
          AI is used to collect, organize, summarize, and flag information from the patient's pre-consultation responses. Clinical diagnosis and treatment remain strictly in the hands of the attending physician.
        </p>
      </div>

      <!-- The 6 Final Authorities (from thesis Section 8) -->
      <div class="bg-slate-800/80 rounded-2xl p-6 sm:p-8 border border-slate-700/80 space-y-4 max-w-5xl mx-auto">
        <h3 class="text-xs font-semibold uppercase tracking-wider text-slate-400 text-center">
          The healthcare professional retains final authority over:
        </h3>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3.5 pt-2 text-center text-sm sm:text-base font-semibold text-slate-100">
          <div class="p-3.5 rounded-xl bg-[#0F172A] border border-slate-700/80">Clinical triage</div>
          <div class="p-3.5 rounded-xl bg-[#0F172A] border border-slate-700/80">Diagnosis</div>
          <div class="p-3.5 rounded-xl bg-[#0F172A] border border-slate-700/80">Treatment</div>
          <div class="p-3.5 rounded-xl bg-[#0F172A] border border-slate-700/80">Referral</div>
          <div class="p-3.5 rounded-xl bg-[#0F172A] border border-slate-700/80">Medical-report approval</div>
          <div class="p-3.5 rounded-xl bg-[#0F172A] border border-slate-700/80">Follow-up decisions</div>
        </div>
      </div>

      <!-- Thesis Section 7: Proposed Future-State Process -->
      <div class="space-y-4 max-w-5xl mx-auto">
        <h4 class="text-xs font-semibold uppercase tracking-wider text-slate-400 text-center">
          Proposed Future-State Process (Thesis Section 7)
        </h4>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5 text-center text-xs">
          <div class="p-3 rounded-xl bg-slate-800 border border-slate-700 font-semibold text-slate-200">
            Patient reports complaint
          </div>
          <div class="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 font-normal text-slate-400">
            AI collects &amp; structures
          </div>
          <div class="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 font-normal text-slate-400">
            Urgency indicators surfaced
          </div>
          <div class="p-3 rounded-xl bg-slate-800 border border-slate-700 font-semibold text-slate-200">
            Clinician reviews brief
          </div>
          <div class="p-3 rounded-xl bg-blue-950 border border-[#699FDF]/50 font-bold text-[#699FDF]">
            Clinical decision
          </div>
        </div>
        <p class="text-xs text-slate-500 text-center pt-1">
          "The system is intended to support, not replace, the clinician. The clinician remains responsible for clinical assessment, diagnosis and treatment decisions." — Thesis Section 7
        </p>
      </div>
    </div>
  </section>

  <!-- ========================================================================= -->
  <!-- 4. PRODUCT DASHBOARD PREVIEW (REALISTIC LIVE DASHBOARD IN THE MIDDLE)     -->
  <!-- ========================================================================= -->
  <section id="product-preview" class="w-full py-16 sm:py-24 bg-white border-b border-slate-200">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <div class="text-center max-w-3xl mx-auto space-y-3">
        <span class="text-xs font-bold uppercase tracking-wider text-[#0F172A] bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
          Live Product View
        </span>
        <h2 class="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
          Realistic Dashboard Preview
        </h2>
        <p class="text-base sm:text-lg text-slate-600 font-medium">
          See exactly how patients track their visits and queue status in real time.
        </p>
      </div>

      <!-- STUDENT DASHBOARD PREVIEW -->
      <div class="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        
        <!-- Patient Profile Header -->
        <div class="flex justify-between items-start mb-6">
          <div>
            <h3 class="text-xl sm:text-2xl font-semibold text-slate-900">Adaeze Okonkwo</h3>
            <p class="text-sm text-slate-500 mt-0.5">Card: GH-2024-00831 &bull; Age 34 &bull; Female</p>
          </div>
          <span class="px-3 py-1 bg-amber-50 text-[#D97706] rounded-full text-xs font-bold border border-amber-300">
            Moderate Priority
          </span>
        </div>

        <!-- Queue Status Card -->
        <div class="bg-slate-50 rounded-xl p-4 sm:p-5 mb-6 border border-slate-100">
          <div class="flex justify-between items-center mb-2">
            <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Queue Status</span>
            <span class="text-xs text-[#699FDF] font-bold">Est. wait ~25 mins</span>
          </div>
          <div class="text-lg sm:text-xl font-bold text-slate-800">
            Queue No. 007 <span class="text-sm sm:text-base font-normal text-slate-500">· OPD Wing A</span>
          </div>
          <p class="text-xs text-slate-500 mt-1">Complaint: Severe headache and high fever since morning, body aches.</p>
        </div>

        <!-- Patient Brief strip -->
        <div class="border-t border-slate-100 pt-5">
          <div class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">AI-Structured Patient Brief</div>
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <div class="text-sm sm:text-base font-medium text-slate-900">Headache · Fever · Generalised body aches</div>
              <div class="text-xs sm:text-sm text-slate-500 mt-0.5">Pain: 7/10 · Duration: 1–2 days · No red flags</div>
            </div>
            <span class="text-xs font-bold text-[#D97706] bg-amber-50 border border-amber-200 px-3 py-1 rounded-md self-start sm:self-auto">
              Awaiting Clinician
            </span>
          </div>
        </div>

      </div>
    </div>
  </section>

  <!-- ========================================================================= -->
  <!-- 5. HOW IT WORKS (STUDENT JOURNEY & PROBLEM OVERVIEW)                       -->
  <!-- ========================================================================= -->
  <section id="how-it-works" class="w-full py-20 sm:py-28 bg-slate-50 border-b border-slate-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      
      <!-- Problem Cards (from thesis Section 5 — Where friction appears) -->
      <div class="space-y-6">
        <div class="text-center max-w-3xl mx-auto space-y-3">
          <span class="text-xs font-semibold px-3 py-1 rounded-full bg-blue-50 text-[#0F172A] border border-blue-200">
            Nigerian OPD Context
          </span>
          <h2 class="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Government OPDs are overwhelmed. Information shouldn't make it worse.
          </h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          <div class="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2">
            <h3 class="font-bold text-slate-900 text-lg flex items-center gap-2">
              <Clock class="w-4 h-4 text-[#699FDF]" />
              86.7 minutes waiting
            </h3>
            <p class="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
              Average idle and waiting time in Nigerian public OPDs — across registration, nursing, and clinician queues.
            </p>
          </div>

          <div class="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2">
            <h3 class="font-bold text-slate-900 text-lg flex items-center gap-2">
              <ClipboardList class="w-4 h-4 text-[#699FDF]" />
              12.6 minutes to consult
            </h3>
            <p class="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
              The doctor has less than 13 minutes per patient — yet must reconstruct the full history from scratch every time.
            </p>
          </div>

          <div class="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2">
            <h3 class="font-bold text-slate-900 text-lg flex items-center gap-2">
              <Layers class="w-4 h-4 text-[#699FDF]" />
              Fragmented multi-stage flow
            </h3>
            <p class="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
              Patients move through registration, nursing, consultation, lab, and pharmacy — each adding wait time and coordination overhead.
            </p>
          </div>
        </div>

        <!-- Connection Strip (thesis Section 7) -->
        <div class="p-4 rounded-xl bg-slate-100 border border-slate-200 text-center text-xs sm:text-sm font-semibold text-slate-800">
          CLINIKS owns the pre-consultation boundary: Patient arrives &rarr; Information collected &rarr; Brief structured &rarr; Urgency flagged &rarr; Clinician reviews &rarr; Consultation begins
        </div>
      </div>

      <!-- 7-Stage OPD Patient Journey (from thesis Section 4) -->
      <div class="space-y-8 pt-6 border-t border-slate-200">
        <div class="text-center max-w-5xl mx-auto space-y-4">
          <span class="text-xs font-bold uppercase tracking-wider text-[#0F172A] bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            OPD Patient Journey · Thesis Section 4
          </span>
          <h3 class="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            From arrival to completion — one connected OPD workflow.
          </h3>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <!-- 01 -->
          <div class="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
            <span class="font-mono text-sm font-black text-[#699FDF]">01</span>
            <h4 class="font-extrabold text-slate-900 text-lg">Patient arrives</h4>
            <p class="text-sm text-slate-600 leading-relaxed">
              Patient enters the outpatient system and begins their hospital journey at the OPD.
            </p>
          </div>

          <!-- 02 -->
          <div class="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
            <span class="font-mono text-sm font-black text-[#699FDF]">02</span>
            <h4 class="font-extrabold text-slate-900 text-lg">Registration / records</h4>
            <p class="text-sm text-slate-600 leading-relaxed">
              Identity and administrative information are collected. Hospital card or folder number is issued or retrieved.
            </p>
          </div>

          <!-- 03 — CLINIKS intervention point -->
          <div class="p-6 sm:p-7 rounded-2xl bg-blue-50/60 border-2 border-[#699FDF] shadow-2xs space-y-3">
            <span class="font-mono text-sm font-black text-[#699FDF]">03 ← CLINIKS</span>
            <h4 class="font-extrabold text-slate-900 text-lg">Pre-consultation intake</h4>
            <p class="text-sm text-slate-600 leading-relaxed">
              Patient describes their complaint by voice or touch. CLINIKS structures it and surfaces urgency indicators.
            </p>
          </div>

          <!-- 04 -->
          <div class="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
            <span class="font-mono text-sm font-black text-[#699FDF]">04</span>
            <h4 class="font-extrabold text-slate-900 text-lg">Queue & waiting</h4>
            <p class="text-sm text-slate-600 leading-relaxed">
              Patient sees their queue number and estimated wait. Nurse reviews urgency flags and organizes flow.
            </p>
          </div>

          <!-- 05 -->
          <div class="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
            <span class="font-mono text-sm font-black text-[#699FDF]">05</span>
            <h4 class="font-extrabold text-slate-900 text-lg">Clinical encounter</h4>
            <p class="text-sm text-slate-600 leading-relaxed">
              Clinician receives the structured patient brief, reviews it, confirms triage priority, then calls the patient in.
            </p>
          </div>

          <!-- 06 -->
          <div class="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
            <span class="font-mono text-sm font-black text-[#699FDF]">06</span>
            <h4 class="font-extrabold text-slate-900 text-lg">Investigation / treatment</h4>
            <p class="text-sm text-slate-600 leading-relaxed">
              Where required, the patient proceeds to laboratory, pharmacy, or referral. Clinician records the outcome.
            </p>
          </div>

          <!-- 07 -->
          <div class="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
            <span class="font-mono text-sm font-black text-[#699FDF]">07</span>
            <h4 class="font-extrabold text-slate-900 text-lg">Completion</h4>
            <p class="text-sm text-slate-600 leading-relaxed">
              Patient completes all relevant services and leaves, or continues to another stage of care.
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ========================================================================= -->
  <!-- 6. MEDICAL REPORT FEATURE                                                 -->
  <!-- ========================================================================= -->
  <section id="medical-reports" class="w-full py-20 sm:py-28 bg-white border-b border-slate-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      <div class="text-center max-w-3xl mx-auto space-y-3">
        <span class="text-xs font-semibold px-3 py-1 rounded-full bg-blue-50 text-[#0F172A] border border-blue-200">
          Official Documentation
        </span>
        <h2 class="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
          Your verified medical report, available when you need it.
        </h2>
        <p class="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
          After a consultation is completed, the clinician can generate and digitally sign an official medical/attendance report from the verified consultation record.
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <!-- Left: What Patient Can Do & System Contents -->
        <div class="lg:col-span-5 space-y-6">
          <div class="bg-slate-50 p-6 sm:p-7 rounded-2xl border border-slate-200 space-y-4">
            <h3 class="font-bold text-slate-900 text-sm tracking-wide">Patients Can:</h3>
            <ul class="space-y-3 text-xs text-slate-800 font-medium">
              <li class="flex items-center gap-2.5">
                <Check class="w-4 h-4 text-[#699FDF] shrink-0" />
                <span>View their structured consultation summary</span>
              </li>
              <li class="flex items-center gap-2.5">
                <Check class="w-4 h-4 text-[#699FDF] shrink-0" />
                <span>Access previous visit records</span>
              </li>
              <li class="flex items-center gap-2.5">
                <Check class="w-4 h-4 text-[#699FDF] shrink-0" />
                <span>Download a clinician-signed copy</span>
              </li>
              <li class="flex items-center gap-2.5">
                <Check class="w-4 h-4 text-[#699FDF] shrink-0" />
                <span>Share report where required for referral or employer</span>
              </li>
            </ul>
          </div>

          <!-- Included Information List -->
          <div class="bg-slate-50 p-6 sm:p-7 rounded-2xl border border-slate-200 space-y-3">
            <h3 class="font-bold text-slate-900 text-sm tracking-wide">The system includes:</h3>
            <div class="grid grid-cols-2 gap-2.5 text-xs text-slate-800 font-medium">
              <div>&bull; Patient name &amp; card no.</div>
              <div>&bull; Age &amp; gender</div>
              <div>&bull; Date of consultation</div>
              <div>&bull; OPD facility name</div>
              <div>&bull; Chief complaint summary</div>
              <div>&bull; Clinician-approved notes</div>
              <div>&bull; Outcome / next steps</div>
              <div>&bull; Clinician designation</div>
              <div>&bull; Digital signature</div>
              <div>&bull; Unique verification reference</div>
            </div>
          </div>
        </div>

        <!-- Right: Official Report Document Preview -->
        <div class="lg:col-span-7 bg-white rounded-2xl p-6 sm:p-8 border-2 border-slate-200 shadow-sm space-y-6">
          <!-- Document Header -->
          <div class="text-center border-b-2 border-[#0F172A] pb-4">
            <div class="text-xs font-bold tracking-widest text-[#0F172A] uppercase">Government Hospital OPD · CLINIKS</div>
            <h4 class="text-base font-extrabold text-slate-900 mt-1">OFFICIAL CLINICAL CONSULTATION RECORD</h4>
            <div class="text-xs text-slate-700 font-medium mt-1">Ref: MED-REP-2025-081 &bull; Clinician-Verified</div>
          </div>

          <!-- Data Grid -->
          <div class="grid grid-cols-2 gap-3.5 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div><strong class="text-sm font-bold text-slate-900 block">Patient Name:</strong> <span class="text-xs text-slate-800 font-medium">Adaeze Okonkwo</span></div>
            <div><strong class="text-sm font-bold text-slate-900 block">Hospital Card No:</strong> <span class="text-xs text-slate-800 font-medium">GH-2024-00831</span></div>
            <div><strong class="text-sm font-bold text-slate-900 block">Age / Gender:</strong> <span class="text-xs text-slate-800 font-medium">34 · Female</span></div>
            <div><strong class="text-sm font-bold text-slate-900 block">OPD Facility:</strong> <span class="text-xs text-slate-800 font-medium">General OPD Wing A</span></div>
            <div><strong class="text-sm font-bold text-slate-900 block">Date:</strong> <span class="text-xs text-slate-800 font-medium">27 Sep 2026</span></div>
            <div><strong class="text-sm font-bold text-slate-900 block">Clinician:</strong> <span class="text-xs text-slate-800 font-medium">Dr. Stella Adeleke (FWACP)</span></div>
          </div>

          <!-- Clinical Info & Notes -->
          <div class="space-y-2">
            <div class="text-sm font-bold text-slate-900">Clinician Notes &amp; Outcome:</div>
            <p class="text-xs text-slate-800 font-medium bg-slate-50 p-3.5 rounded-lg border border-slate-200 leading-relaxed">
              Febrile illness with headache and myalgia. Patient assessed and managed. Prescribed antipyretics and analgesics. Advised rest and oral fluids. Follow up if symptoms persist beyond 48 hours.
            </p>
          </div>

          <!-- Digital Signature -->
          <div class="flex items-center justify-between pt-3 border-t border-slate-200">
            <div>
              <div class="text-sm font-bold text-slate-900">Digitally Signed by Clinician</div>
              <div class="text-xs text-slate-700 font-mono font-medium mt-0.5">Verification Ref: #8f9b2...e41c</div>
            </div>
            <div class="px-3 py-1.5 rounded-lg border border-[#699FDF] bg-blue-50 text-[#0F172A] font-black text-xs uppercase tracking-wide">
              VERIFIED
            </div>
          </div>

          <!-- Workflow note -->
          <div class="p-4 rounded-xl bg-slate-100 border border-slate-200 space-y-2">
            <div class="text-sm font-bold text-slate-900">Important:</div>
            <div class="text-xs text-slate-800 font-medium leading-relaxed">
              AI drafts/structures &rarr; Clinician reviews &rarr; Clinician edits if needed &rarr; Clinician signs &rarr; Record becomes official
            </div>
            <div class="text-xs text-slate-700 font-medium pt-1">
              * CLINIKS does not independently issue, approve, or sign any clinical record.
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ========================================================================= -->
  <!-- ========================================================================= -->
  <!-- 7. TRIAGE & QUEUE MANAGEMENT                                              -->
  <!-- ========================================================================= -->
  <!-- ========================================================================= -->
  <!-- 7. TRIAGE & QUEUE MANAGEMENT                                              -->
  <!-- ========================================================================= -->
  <section id="triage" class="w-full py-20 sm:py-28 bg-slate-50 border-b border-slate-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      <div class="text-center max-w-3xl mx-auto space-y-3">
        <span class="text-xs font-semibold px-3 py-1 rounded-full bg-blue-50 text-[#0F172A] border border-blue-200">
          Triage Protocols
        </span>
        <h2 class="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
          Every patient. The right level of attention.
        </h2>
        <p class="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
          The patient's pre-consultation responses provide the information needed for the healthcare team to quickly understand the case. The system flags information and proposes a priority level — which the clinician must confirm or override.
        </p>
      </div>

      <!-- Priority Level Scale — using strict clinical color coding -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
        <div class="p-8 rounded-2xl bg-white border border-slate-200/90 border-l-4 border-l-[#DC2626] shadow-2xs space-y-3">
          <h3 class="text-2xl font-black text-[#DC2626] tracking-tight">
            Emergency
          </h3>
          <p class="text-base text-slate-600 font-normal leading-relaxed">
            Immediate clinical attention
          </p>
        </div>

        <div class="p-8 rounded-2xl bg-white border border-slate-200/90 border-l-4 border-l-[#DC2626]/80 shadow-2xs space-y-3">
          <h3 class="text-2xl font-black text-[#DC2626] tracking-tight">
            Urgent
          </h3>
          <p class="text-base text-slate-600 font-normal leading-relaxed">
            Prompt assessment
          </p>
        </div>

        <div class="p-8 rounded-2xl bg-white border border-slate-200/90 border-l-4 border-l-[#D97706] shadow-2xs space-y-3">
          <h3 class="text-2xl font-black text-[#D97706] tracking-tight">
            Standard
          </h3>
          <p class="text-base text-slate-600 font-normal leading-relaxed">
            Normal consultation queue
          </p>
        </div>

        <div class="p-8 rounded-2xl bg-white border border-slate-200/90 border-l-4 border-l-[#0F172A] shadow-2xs space-y-3">
          <h3 class="text-2xl font-black text-[#0F172A] tracking-tight">
            Routine
          </h3>
          <p class="text-base text-slate-600 font-normal leading-relaxed">
            Routine / follow-up workflow
          </p>
        </div>
      </div>

      <!-- Clinical Authority Callout — pure whitespace, crisp black text -->
      <div class="p-8 sm:p-10 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-6 max-w-5xl mx-auto">
        <div class="space-y-2">
          <h4 class="font-black text-slate-950 text-xl tracking-tight">Clinical Authority Note</h4>
          <p class="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
            The AI assists with preliminary flagging, but the final triage status is determined or confirmed by an authorized healthcare professional according to the clinic's approved protocol.
          </p>
        </div>

        <!-- Clinician actions -->
        <div class="pt-5 border-t border-slate-200 space-y-3">
          <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider block">The clinician can:</span>
          <div class="flex flex-wrap items-center gap-2.5 sm:gap-3 text-sm font-bold text-slate-900">
            <span class="px-4 py-2 rounded-xl border border-slate-200 bg-slate-50">Confirm</span>
            <span class="text-slate-400 font-normal">&rarr;</span>
            <span class="px-4 py-2 rounded-xl border border-slate-200 bg-slate-50">Change</span>
            <span class="text-slate-400 font-normal">&rarr;</span>
            <span class="px-4 py-2 rounded-xl border border-slate-200 bg-slate-50">Escalate</span>
            <span class="text-slate-400 font-normal">&rarr;</span>
            <span class="px-4 py-2 rounded-xl border border-slate-200 bg-slate-50">De-escalate</span>
            <span class="text-slate-400 font-normal">&rarr;</span>
            <span class="px-4 py-2 rounded-xl border border-slate-200 bg-slate-50">Refer</span>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ========================================================================= -->
  <!-- 8. SECURITY & PRIVACY                                                     -->
  <!-- ========================================================================= -->
  <section id="security-privacy" class="w-full py-20 sm:py-28 bg-white border-b border-slate-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      <div class="text-center max-w-3xl mx-auto space-y-3">
        <span class="text-xs font-semibold px-3 py-1 rounded-full bg-blue-50 text-[#0F172A] border border-blue-200">
          Privacy &amp; Governance
        </span>
        <h2 class="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
          Your health information deserves protection.
        </h2>
        <p class="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
          Built with role-based access and verified healthcare governance standards.
        </p>
      </div>

      <!-- 4 Compact Security Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
        <div class="p-6 sm:p-7 rounded-2xl bg-slate-50 border border-slate-200/80 shadow-2xs space-y-3">
          <div class="w-10 h-10 rounded-xl bg-blue-50 text-[#699FDF] flex items-center justify-center font-bold border border-blue-200">
            <Lock class="w-5 h-5" />
          </div>
          <h3 class="font-bold text-slate-900 text-base">Secure Access</h3>
          <p class="text-sm text-slate-600 leading-relaxed font-normal">
            Patients and healthcare workers access information according to their role.
          </p>
        </div>

        <div class="p-6 sm:p-7 rounded-2xl bg-slate-50 border border-slate-200/80 shadow-2xs space-y-3">
          <div class="w-10 h-10 rounded-xl bg-blue-50 text-[#699FDF] flex items-center justify-center font-bold border border-blue-200">
            <User class="w-5 h-5" />
          </div>
          <h3 class="font-bold text-slate-900 text-base">Patient Records</h3>
          <p class="text-sm text-slate-600 leading-relaxed font-normal">
            Patients can access their own authorized consultation records securely.
          </p>
        </div>

        <div class="p-6 sm:p-7 rounded-2xl bg-slate-50 border border-slate-200/80 shadow-2xs space-y-3">
          <div class="w-10 h-10 rounded-xl bg-blue-50 text-[#699FDF] flex items-center justify-center font-bold border border-blue-200">
            <Stethoscope class="w-5 h-5" />
          </div>
          <h3 class="font-bold text-slate-900 text-base">Clinician Control</h3>
          <p class="text-sm text-slate-600 leading-relaxed font-normal">
            Clinical decisions remain under authorized healthcare professionals.
          </p>
        </div>

        <div class="p-6 sm:p-7 rounded-2xl bg-slate-50 border border-slate-200/80 shadow-2xs space-y-3">
          <div class="w-10 h-10 rounded-xl bg-blue-50 text-[#699FDF] flex items-center justify-center font-bold border border-blue-200">
            <FileText class="w-5 h-5" />
          </div>
          <h3 class="font-bold text-slate-900 text-base">Verified Documents</h3>
          <p class="text-sm text-slate-600 leading-relaxed font-normal">
            Official medical reports require clinician review and digital signature.
          </p>
        </div>
      </div>
    </div>
  </section>

  <!-- ========================================================================= -->
  <!-- 9. FINAL CTA (RICH MIDNIGHT BLUE BANNER)                                   -->
  <!-- ========================================================================= -->
  <section class="w-full py-20 sm:py-28 bg-[#0F172A] text-white text-center border-t border-slate-800">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      <h2 class="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
        Your clinic visit starts before you enter the consultation room.
      </h2>
      <p class="text-lg sm:text-xl text-slate-300 leading-relaxed max-w-2xl mx-auto font-normal">
        Walk in, register, and describe your complaint in minutes. The clinician will already know your story before they call your name.
      </p>

      <div class="pt-4">
        {#if currentUser}
          <button
            type="button"
            on:click={goToDashboard}
            class="bg-[#699FDF] hover:bg-[#5289CC] text-white font-black text-base px-8 py-3.5 rounded-xl shadow-lg transition-all inline-flex items-center gap-2 cursor-pointer hover:scale-102 active:scale-98"
          >
            <span>Back to Dashboard</span>
            <ArrowRight class="w-4 h-4 stroke-[2.5]" />
          </button>
        {:else}
          <button
            type="button"
            on:click={() => goToAuth('PATIENT')}
            class="bg-[#699FDF] hover:bg-[#5289CC] text-white font-bold text-base px-8 py-3.5 rounded-xl shadow-lg transition-all inline-flex items-center gap-2 cursor-pointer"
          >
            <span>Open Patient Portal</span>
            <ArrowRight class="w-4 h-4" />
          </button>
        {/if}
      </div>
    </div>
  </section>

  <!-- ========================================================================= -->
  <!-- 10. FOOTER                                                                -->
  <!-- ========================================================================= -->
  <footer class="w-full bg-slate-950 text-slate-400 border-t border-slate-800 pt-16 pb-12 text-xs">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
        <!-- Col 1: Brand & Positioning -->
        <div class="space-y-4">
          <div class="flex items-center gap-2">
            <span class="text-2xl font-black tracking-tight text-white uppercase font-sans">cliniks</span>
            <div class="w-7 h-7 rounded-lg bg-[#699FDF] flex items-center justify-center text-white">
              <Activity class="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <p class="text-xs text-slate-400 leading-relaxed">
            AI-assisted pre-consultation platform for Nigerian government outpatient hospitals. Collects and structures patient information before the clinical encounter — so clinicians can focus on medicine.
          </p>
        </div>

        <!-- Col 2: For Patients -->
        <div class="space-y-3">
          <h4 class="font-bold text-white text-xs uppercase tracking-wider">For Patients</h4>
          <ul class="space-y-2 text-slate-400">
            <li><button type="button" on:click={() => goToAuth('PATIENT')} class="hover:text-white transition-colors cursor-pointer">Start Pre-Consultation</button></li>
            <li><button type="button" on:click={() => goToAuth('PATIENT')} class="hover:text-white transition-colors cursor-pointer">Voice Symptom Intake</button></li>
            <li><button type="button" on:click={() => goToAuth('PATIENT')} class="hover:text-white transition-colors cursor-pointer">Check Queue Status</button></li>
            <li><button type="button" on:click={() => goToAuth('PATIENT')} class="hover:text-white transition-colors cursor-pointer">View Consultation Record</button></li>
          </ul>
        </div>

        <!-- Col 3: For Healthcare Workers -->
        <div class="space-y-3">
          <h4 class="font-bold text-white text-xs uppercase tracking-wider">For Healthcare Workers</h4>
          <ul class="space-y-2 text-slate-400">
            <li><button type="button" on:click={() => goToAuth('CLINICIAN')} class="hover:text-white transition-colors cursor-pointer">Clinician Dashboard</button></li>
            <li><button type="button" on:click={() => goToAuth('CLINICIAN')} class="hover:text-white transition-colors cursor-pointer">Review Patient Briefs</button></li>
            <li><button type="button" on:click={() => goToAuth('CLINICIAN')} class="hover:text-white transition-colors cursor-pointer">Manage OPD Queue</button></li>
            <li><button type="button" on:click={() => goToAuth('CLINICIAN')} class="hover:text-white transition-colors cursor-pointer">Record Consultation Outcome</button></li>
          </ul>
        </div>

        <!-- Col 4: OPD Context -->
        <div class="space-y-3">
          <h4 class="font-bold text-white text-xs uppercase tracking-wider">About CLINIKS</h4>
          <div class="space-y-1.5 text-xs text-slate-400">
            <p><strong class="text-slate-300">Nigerian Government OPD</strong></p>
            <p>Pre-consultation AI · Human-led triage · Clinician-signed records</p>
            <p class="pt-2 text-[11px] text-[#699FDF] font-mono">
              All clinical decisions: attending physician
            </p>
          </div>
        </div>
      </div>

      <!-- Legal & Attribution -->
      <div class="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
        <div>
          &copy; 2026 CLINIKS. All rights reserved.
        </div>
        <div class="flex items-center gap-4">
          <span>Clinician-Led Decisions</span>
          <span>&bull;</span>
          <span>Secure Patient Records</span>
          <span>&bull;</span>
          <span>AI-Assisted Workflow</span>
        </div>
      </div>
    </div>
  </footer>

</div>
