<script>
  import { clinicStore } from '../stores/clinicStore.js';
  import Card from '../components/atoms/Card.svelte';
  import Button from '../components/atoms/Button.svelte';
  import Badge from '../components/atoms/Badge.svelte';
  import StudentIntakeWizard from '../components/organisms/StudentIntakeWizard.svelte';
  import StaffAssistedIntake from '../components/organisms/StaffAssistedIntake.svelte';
  import { 
    Stethoscope, 
    ArrowRight, 
    ArrowLeft, 
    Calendar, 
    Clock, 
    MapPin, 
    User, 
    FileText, 
    CheckCircle2, 
    HeartPulse, 
    Building2,
    Check,
    Sparkles,
    Shield,
    Lock,
    AlertCircle,
    Users
  } from 'lucide-svelte';

  $: currentUser = $clinicStore.currentUser;
  $: student = currentUser?.profile || {};

  // Mode: Patient Self-Service vs OPD Desk-Assisted (Thesis Section 11 & 13)
  let isDeskAssisted = false;

  // 2-Step Flow:
  // Step 1: "Book a Consultant" Form (Visit type, preferred date)
  // Step 2: "Pre-Questionnaire" Page (AI Voice Assistant with Uiverse Oval & all questions)
  let currentStep = 1;

  // Book a Consultant Form State (Initially unselected so completion is required)
  let visitType = '';
  let preferredDate = '';
  let consultantPreference = 'First Available Attending Physician';
  let patientNotes = '';

  let showValidationErrors = false;

  $: isVisitTypeSelected = !!visitType;
  $: isDateSelected = !!preferredDate;
  
  // Total completed sections (out of 2 required)
  $: completedCount = [isVisitTypeSelected, isDateSelected].filter(Boolean).length;
  $: isBookingComplete = completedCount === 2;

  const visitTypes = [
    {
      id: 'general',
      title: 'General Medical Consultation',
      desc: 'Fever, cough, body pain, malaria symptoms, or general discomfort',
      icon: Stethoscope
    },
    {
      id: 'urgent',
      title: 'Urgent Care / Acute Triage',
      desc: 'Asthma flare-up, severe pain, cuts, sprains, or sudden acute illness',
      icon: HeartPulse
    },
    {
      id: 'refill',
      title: 'Routine Prescription Refill',
      desc: 'Maintenance medication renewal, inhaler refills, or ongoing care',
      icon: FileText
    },
    {
      id: 'clearance',
      title: 'Academic & Sports Clearance',
      desc: 'Faculty medical fitness certificate, sports league health screening',
      icon: CheckCircle2
    }
  ];

  const dates = [
    'Today (Earliest Available)',
    'Tomorrow Morning',
    'Custom Date / Scheduled Follow-up'
  ];

  function handleProceedToQuestionnaire() {
    if (!isBookingComplete) {
      showValidationErrors = true;
      window.scrollTo({ top: 120, behavior: 'smooth' });
      return;
    }
    showValidationErrors = false;
    currentStep = 2;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function tryGoToStep(step) {
    if (step === 2) {
      if (!isBookingComplete) {
        showValidationErrors = true;
        window.scrollTo({ top: 120, behavior: 'smooth' });
        return;
      }
    }
    showValidationErrors = false;
    currentStep = step;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleBackToBooking() {
    currentStep = 1;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleBookingComplete() {
    clinicStore.setTab('STUDENT_DASHBOARD');
  }
</script>

<div class="max-w-4xl mx-auto space-y-6 py-4">

  <!-- 1-Click Mode Toggle: Patient Self-Service vs OPD Staff-Assisted (Thesis Section 11 & 13) -->
  <div class="bg-slate-100 p-2.5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
    <div class="flex items-center gap-2 pl-2">
      <Users class="w-4 h-4 text-[#699FDF]" />
      <span class="font-bold text-slate-800">OPD Intake Mode:</span>
      <span class="text-slate-500 font-mono">
        {isDeskAssisted ? 'Desk-Assisted Walk-In (Clerk/Nurse Tablet)' : 'Patient Self-Service (Smartphone)'}
      </span>
    </div>

    <div class="flex items-center bg-white rounded-xl p-1 border border-slate-200 shadow-2xs">
      <button
        type="button"
        on:click={() => isDeskAssisted = false}
        class="px-3.5 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer { !isDeskAssisted ? 'bg-[#0F172A] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}"
      >
        Self-Service (App)
      </button>
      <button
        type="button"
        on:click={() => isDeskAssisted = true}
        class="px-3.5 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer { isDeskAssisted ? 'bg-[#699FDF] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}"
      >
        Desk-Assisted (Walk-In)
      </button>
    </div>
  </div>

  {#if isDeskAssisted}
    <!-- STAFF-ASSISTED WALK-IN INTAKE -->
    <StaffAssistedIntake />
  {:else}

  <!-- Top Navigation & Stepper Header -->
  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
    <div class="flex items-center gap-3">
      <button
        type="button"
        on:click={() => clinicStore.setTab('STUDENT_DASHBOARD')}
        class="p-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer"
      >
        <ArrowLeft class="w-4 h-4" />
        <span>Back to Dashboard</span>
      </button>

      <div>
        <h2 class="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
          {currentStep === 1 ? 'Book a Consultant' : 'Pre-Consultation Clinical Questionnaire'}
        </h2>
        <p class="text-xs text-slate-600 font-medium">
          Step {currentStep} of 2 &bull; {currentStep === 1 ? 'Booking Details (Required)' : 'AI Clinical Symptom Intake'}
        </p>
      </div>
    </div>

    <!-- Stepper indicator pills -->
    <div class="flex items-center gap-2">
      <button 
        type="button" 
        on:click={() => tryGoToStep(1)}
        class="px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5
          {currentStep === 1 ? 'bg-emerald-700 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}"
      >
        <span class="w-4 h-4 rounded-full {isBookingComplete ? 'bg-emerald-500 text-white' : 'bg-white/20'} flex items-center justify-center text-[10px]">
          {#if isBookingComplete}&check;{:else}1{/if}
        </span>
        <span>Booking Details</span>
      </button>

      <span class="text-slate-400 font-bold">&rarr;</span>

      <button 
        type="button" 
        on:click={() => tryGoToStep(2)}
        title={!isBookingComplete ? "Complete all booking sections to unlock pre-questionnaire" : "Proceed to pre-questionnaire"}
        class="px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5
          {currentStep === 2 
            ? 'bg-emerald-700 text-white shadow-xs cursor-pointer' 
            : isBookingComplete 
              ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300 cursor-pointer' 
              : 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-70'}"
      >
        <span class="w-4 h-4 rounded-full {isBookingComplete ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-700'} flex items-center justify-center text-[10px]">
          {#if !isBookingComplete}
            <Lock class="w-2.5 h-2.5" />
          {:else}
            2
          {/if}
        </span>
        <span>Pre-Questionnaire</span>
      </button>
    </div>
  </div>

  <!-- Verified Student Header Strip -->
  <div class="p-4 rounded-2xl bg-slate-900 text-white flex flex-wrap items-center justify-between gap-4 shadow-sm">
    <div class="flex items-center gap-3">
      <div class="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black">
        {student.name ? student.name.slice(0, 2).toUpperCase() : 'ST'}
      </div>
      <div>
        <p class="text-sm font-extrabold text-white">{student.name || 'Verified Student'}</p>
        <p class="text-xs text-slate-300 font-mono">
          {#if student.matricNo}
            Matric: <strong class="text-emerald-400">{student.matricNo}</strong>
          {/if}
          {#if student.matricNo && student.jajaNo} &bull; {/if}
          {#if student.jajaNo}
            Jaja: <strong class="text-emerald-400">{student.jajaNo}</strong>
          {/if}
          {#if !student.matricNo && !student.jajaNo}
            <span>Student Portal Session</span>
          {/if}
        </p>
      </div>
    </div>
    <div class="text-xs text-slate-300 flex items-center gap-3">
      <span>{student.department ? `${student.department}` : ''}{student.faculty ? ` • ${student.faculty}` : ''}</span>
      <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold {isBookingComplete ? 'bg-emerald-800 text-emerald-200' : 'bg-amber-800 text-amber-200'}">
        {completedCount}/2 Sections Selected
      </span>
    </div>
  </div>

  <!-- ========================================================================= -->
  <!-- STEP 1: DEDICATED "BOOK A CONSULTANT" FORM                                -->
  <!-- ========================================================================= -->
  {#if currentStep === 1}
    <div class="space-y-6 animate-in slide-in-from-left-4 duration-150">
      
      <!-- Validation Error Banner (When user tries to proceed without completing all sections) -->
      {#if showValidationErrors && !isBookingComplete}
        <div class="p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-950 flex items-start gap-3.5 shadow-sm animate-in fade-in duration-200">
          <AlertCircle class="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div class="space-y-1">
            <p class="font-extrabold text-sm text-rose-950">
              Cannot Proceed to Pre-Questionnaire Yet
            </p>
            <p class="text-xs text-rose-800 font-medium">
              Please complete all required sections in the booking details before going to the questionnaire.
              Missing: 
              <span class="font-bold underline">
                {[
                  !isVisitTypeSelected && 'Visit Category',
                  !isDateSelected && 'Consultation Date'
                ].filter(Boolean).join(', ')}
              </span>.
            </p>
          </div>
        </div>
      {/if}

      <!-- Card: Appointment Setup -->
      <Card className="p-6 sm:p-9 shadow-sm border border-slate-200 bg-white space-y-8 rounded-2xl sm:rounded-3xl">
        
        <!-- Header -->
        <div class="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
          <div>
            <span class="text-xs font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Section 1 of 2: Appointment Parameters
            </span>
          </div>
        </div>

        <!-- 1. Visit Type Selection -->
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-sm font-black text-slate-950 uppercase tracking-wider">
                1. Select Consultation Visit Category <span class="text-rose-600 font-black">*</span>
              </h3>
              <p class="text-xs font-semibold text-slate-600 mt-0.5">
                Choose the primary clinical reason for scheduling with university health services.
              </p>
            </div>
            {#if isVisitTypeSelected}
              <span class="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                <Check class="w-3.5 h-3.5 stroke-[3]" /> Completed
              </span>
            {:else if showValidationErrors}
              <span class="text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                Selection Required
              </span>
            {/if}
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {#each visitTypes as vt}
              <button
                type="button"
                on:click={() => { visitType = vt.title; }}
                class="p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3.5
                  {visitType === vt.title 
                    ? 'border-emerald-600 bg-emerald-50/60 shadow-xs ring-1 ring-emerald-600/30' 
                    : showValidationErrors && !visitType 
                      ? 'border-rose-300 hover:border-rose-400 bg-rose-50/10' 
                      : 'border-slate-200 hover:border-slate-300 bg-white'}"
              >
                <div class="p-2.5 rounded-xl {visitType === vt.title ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-700'} shrink-0 mt-0.5">
                  <svelte:component this={vt.icon} class="w-5 h-5" />
                </div>
                <div class="flex-1">
                  <div class="flex items-center justify-between">
                    <p class="text-sm font-extrabold text-slate-950">{vt.title}</p>
                    {#if visitType === vt.title}
                      <Check class="w-4 h-4 text-emerald-700 stroke-[3]" />
                    {/if}
                  </div>
                  <p class="text-xs text-slate-600 font-medium mt-1 leading-relaxed">{vt.desc}</p>
                </div>
              </button>
            {/each}
          </div>
        </div>

        <!-- 2. Consultation Date -->
        <div class="space-y-3 pt-6 border-t border-slate-200">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-sm font-black text-slate-950 uppercase tracking-wider">
                2. Select Consultation Date <span class="text-rose-600 font-black">*</span>
              </h3>
              <p class="text-xs font-semibold text-slate-600 mt-0.5">
                Choose your preferred appointment day with Jaja Health Center.
              </p>
            </div>
            {#if isDateSelected}
              <span class="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                <Check class="w-3.5 h-3.5 stroke-[3]" /> Completed
              </span>
            {:else if showValidationErrors}
              <span class="text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                Selection Required
              </span>
            {/if}
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {#each dates as d}
              <button
                type="button"
                on:click={() => { preferredDate = d; }}
                class="p-4 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between
                  {preferredDate === d 
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold shadow-2xs ring-1 ring-emerald-600/30' 
                    : showValidationErrors && !preferredDate 
                      ? 'border-rose-300 bg-rose-50/10 text-slate-800 font-semibold' 
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-semibold'}"
              >
                <div class="flex items-center gap-2.5">
                  <Calendar class="w-4 h-4 text-emerald-700 shrink-0" />
                  <span class="text-xs sm:text-sm">{d}</span>
                </div>
                {#if preferredDate === d}
                  <Check class="w-4 h-4 text-emerald-700 stroke-[3]" />
                {/if}
              </button>
            {/each}
          </div>
        </div>

        <!-- 3. Optional Pre-Booking Notes -->
        <div class="space-y-2 pt-6 border-t border-slate-200">
          <label for="notes" class="block text-xs font-extrabold text-slate-950 uppercase tracking-wider">
            3. Pre-Booking Notes or Physician Request (Optional)
          </label>
          <input
            id="notes"
            type="text"
            placeholder="e.g. Need follow-up check for lab tests done on Tuesday, or preferred Dr. Adeleke"
            bind:value={patientNotes}
            class="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium placeholder:font-normal placeholder:text-slate-400 text-sm focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10"
          />
        </div>

        <!-- Action Bar: Enforces completion before proceeding -->
        <div class="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div class="text-xs text-slate-600 font-bold">
            {#if isBookingComplete}
              <span class="text-emerald-700 flex items-center gap-1 font-extrabold">
                <CheckCircle2 class="w-4 h-4 text-emerald-600" />
                Both booking details completed. Ready for pre-questionnaire.
              </span>
            {:else}
              <span class="text-slate-500 font-medium">
                Complete both required sections above to proceed to clinical symptom questionnaire.
              </span>
            {/if}
          </div>

          <button
            type="button"
            on:click={handleProceedToQuestionnaire}
            class="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-base shadow-md cursor-pointer inline-flex items-center justify-center gap-2.5 transition-all
              {isBookingComplete 
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white hover:scale-102 active:scale-98 shadow-emerald-700/20' 
                : 'bg-slate-800 hover:bg-slate-900 text-white'}"
          >
            {#if !isBookingComplete}
              <Lock class="w-4 h-4 text-amber-400" />
            {/if}
            <span>Proceed to Pre-Questionnaire</span>
            <ArrowRight class="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

      </Card>

    </div>

  <!-- ========================================================================= -->
  <!-- STEP 2: PRE-QUESTIONNAIRE PAGE (WITH UIVERSE OVAL & AI VOICE ASSISTANT)   -->
  <!-- ========================================================================= -->
  {:else if currentStep === 2}
    <div class="space-y-6 animate-in slide-in-from-right-4 duration-150">
      
      <!-- Booking Context Summary Banner -->
      <div class="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-emerald-950">
        <div class="flex items-center gap-2">
          <CheckCircle2 class="w-4 h-4 text-emerald-700" />
          <span>Booking: <strong>{visitType}</strong> &bull; {preferredDate}</span>
        </div>
        <button
          type="button"
          on:click={handleBackToBooking}
          class="text-emerald-800 hover:text-emerald-950 underline decoration-2 cursor-pointer font-extrabold"
        >
          Edit Booking Details
        </button>
      </div>

      <!-- The Single-Page Pre-Questionnaire Component -->
      <StudentIntakeWizard
        studentProfile={student}
        on:submitted={handleBookingComplete}
      />

    </div>
  {/if}

  {/if}

</div>
