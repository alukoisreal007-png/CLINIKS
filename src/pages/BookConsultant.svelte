<script>
  import { clinicStore } from '../stores/clinicStore.js';
  import { generateDoctorBrief } from '../lib/aiTriageEngine.js';
  import { 
    Activity, 
    CheckCircle2, 
    ArrowLeft, 
    Clock, 
    Zap, 
    ShieldAlert, 
    Sparkles,
    User,
    Check,
    AlertCircle
  } from 'lucide-svelte';

  $: currentUser = $clinicStore.currentUser;
  $: profile = currentUser?.profile || {};

  // Patient Identity
  let patientName = profile.name || '';
  let hospitalCardNo = profile.hospitalCardNo || 'GH-2026-00831';
  let age = profile.age || '34';
  let gender = profile.gender || 'Female';

  // Clinical Questions
  let complaint = '';
  let onset = 'sudden'; // 'sudden' | 'gradual'
  let duration = '1 to 2 days';
  let painScale = 5;

  // State
  let isSubmitting = false;
  let submittedCase = null;

  const durationOptions = [
    'Less than 6 hours',
    '1 to 2 days',
    '3 to 5 days',
    'More than a week'
  ];

  function handleSubmit() {
    if (!complaint.trim()) {
      alert('Please describe your chief complaint.');
      return;
    }

    isSubmitting = true;

    // Generate guardrailed brief and 1-10 score via optimized engine
    const brief = generateDoctorBrief({
      complaint: complaint.trim(),
      onset,
      duration,
      painScale,
      patient: { name: patientName, age, gender, hospitalCardNo }
    });

    const newPatientEntry = {
      id: `TRG-${Date.now().toString().slice(-4)}`,
      queueNo: String(($clinicStore.triageQueue?.length || 0) + 1).padStart(3, '0'),
      patientName: patientName.trim() || 'Patient',
      hospitalCardNo: hospitalCardNo.trim() || 'GH-2026-00831',
      age: age || '30',
      gender: gender || 'Female',
      complaint: complaint.trim(),
      onset,
      duration,
      painScale,
      submittedAt: 'Just now',
      status: 'PENDING_APPROVAL', // Waiting for doctor review & scheduling
      scheduledTime: null, // To be assigned by doctor using Radial Time Picker
      assignedBadge: null, // e.g. EMG-001 or CHK-014
      assignedSection: null, // 'EMERGENCY' | 'CHECK_UP'
      aiBrief: brief,
      // Backward compatibility fields
      aiTriage: {
        suggestedPriority: brief.isEmergency ? 'HIGH' : (brief.preliminaryScore >= 5 ? 'MODERATE' : 'ROUTINE'),
        urgencyScore: brief.preliminaryScore * 10,
        patientBrief: `${brief.chiefComplaint} ${brief.symptomTimeline}`,
        safetyWarnings: brief.redFlags,
        source: 'CLINIKS_AI_ENGINE'
      }
    };

    // Add to clinic store
    clinicStore.update(state => ({
      ...state,
      triageQueue: [newPatientEntry, ...(state.triageQueue || [])],
      activePatientAppointment: newPatientEntry,
      systemNotification: {
        type: 'success',
        message: 'Pre-consultation brief submitted. Awaiting doctor review & scheduling.'
      }
    }));

    submittedCase = newPatientEntry;
    isSubmitting = false;
  }

  function goToDashboard() {
    clinicStore.setTab('PATIENT_DASHBOARD');
  }

  function resetNewIntake() {
    submittedCase = null;
    complaint = '';
    onset = 'sudden';
    duration = '1 to 2 days';
    painScale = 5;
  }
</script>

<div class="max-w-3xl mx-auto py-8 px-4 sm:px-6 font-sans">
  
  {#if !submittedCase}
    <!-- ========================================================================= -->
    <!-- PATIENT INTAKE FORM (Clean, Calm, Single-Column Layout)                    -->
    <!-- ========================================================================= -->
    <div class="space-y-8 animate-in fade-in duration-150">
      
      <!-- Top Header -->
      <div class="flex items-center justify-between border-b border-slate-200 pb-4">
        <button
          type="button"
          on:click={goToDashboard}
          class="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft class="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        <span class="text-xs font-mono font-medium text-slate-400">
          Stage 1: Pre-Consultation Intake
        </span>
      </div>

      <div class="space-y-2">
        <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Pre-Consultation Symptom Intake
        </h1>
        <p class="text-sm text-slate-600 leading-relaxed">
          Please describe your illness. The AI organizes your symptoms into an organized clinical brief for the doctor to review and schedule your appointment.
        </p>
      </div>

      <!-- Main Form Card -->
      <div class="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-7">
        
        <!-- 1. Patient Demographics Summary -->
        <div class="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
          <div class="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider font-mono">
            <User class="w-4 h-4 text-blue-600" />
            <span>Patient Information</span>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span class="text-slate-400 block text-[11px]">Full Name</span>
              <input
                type="text"
                bind:value={patientName}
                placeholder="Patient Name"
                class="w-full mt-1 p-2 rounded-lg border border-slate-200 bg-white font-medium text-slate-900 text-xs outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <span class="text-slate-400 block text-[11px]">Card Number</span>
              <input
                type="text"
                bind:value={hospitalCardNo}
                placeholder="GH-2026-XXXXX"
                class="w-full mt-1 p-2 rounded-lg border border-slate-200 bg-white font-mono font-medium text-slate-900 text-xs outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <span class="text-slate-400 block text-[11px]">Age (Years)</span>
              <input
                type="number"
                bind:value={age}
                class="w-full mt-1 p-2 rounded-lg border border-slate-200 bg-white font-medium text-slate-900 text-xs outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <span class="text-slate-400 block text-[11px]">Gender</span>
              <select
                bind:value={gender}
                class="w-full mt-1 p-2 rounded-lg border border-slate-200 bg-white font-medium text-slate-900 text-xs outline-none focus:border-blue-500"
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
              </select>
            </div>
          </div>
        </div>

        <!-- 2. Chief Complaint -->
        <div class="space-y-2">
          <label for="intake-complaint" class="block text-xs font-bold text-slate-900 uppercase tracking-wider">
            Chief Complaint &bull; What are you experiencing today? *
          </label>
          <textarea
            id="intake-complaint"
            bind:value={complaint}
            rows="4"
            placeholder="e.g. Severe throbbing headache and high fever since this morning, body aches and feeling dizzy..."
            class="w-full p-4 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm text-slate-900 outline-none leading-relaxed"
          ></textarea>
        </div>

        <!-- 3. Onset: Sudden vs. Gradual -->
        <div class="space-y-2">
          <span class="block text-xs font-bold text-slate-900 uppercase tracking-wider">
            Onset &bull; How quickly did your symptoms start? *
          </span>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              on:click={() => onset = 'sudden'}
              class="p-4 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3
                {onset === 'sudden' ? 'border-blue-500 bg-blue-50/60 ring-1 ring-blue-500' : 'border-slate-200 hover:border-slate-300 bg-white'}"
            >
              <div class="w-8 h-8 rounded-lg {onset === 'sudden' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'} flex items-center justify-center shrink-0 mt-0.5">
                <Zap class="w-4 h-4" />
              </div>
              <div>
                <h4 class="text-sm font-bold text-slate-900">Sudden Onset</h4>
                <p class="text-xs text-slate-500 mt-0.5 leading-snug">
                  Started abruptly within minutes or a few hours. Acute discomfort.
                </p>
              </div>
            </button>

            <button
              type="button"
              on:click={() => onset = 'gradual'}
              class="p-4 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3
                {onset === 'gradual' ? 'border-blue-500 bg-blue-50/60 ring-1 ring-blue-500' : 'border-slate-200 hover:border-slate-300 bg-white'}"
            >
              <div class="w-8 h-8 rounded-lg {onset === 'gradual' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'} flex items-center justify-center shrink-0 mt-0.5">
                <Clock class="w-4 h-4" />
              </div>
              <div>
                <h4 class="text-sm font-bold text-slate-900">Gradual Onset</h4>
                <p class="text-xs text-slate-500 mt-0.5 leading-snug">
                  Developed progressively over several days or weeks.
                </p>
              </div>
            </button>
          </div>
        </div>

        <!-- 4. Duration -->
        <div class="space-y-2">
          <span class="block text-xs font-bold text-slate-900 uppercase tracking-wider">
            Duration &bull; How long have you felt this way? *
          </span>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {#each durationOptions as opt}
              <button
                type="button"
                on:click={() => duration = opt}
                class="py-2.5 px-3 rounded-xl text-xs font-medium border text-center transition-all cursor-pointer
                  {duration === opt ? 'bg-slate-900 text-white border-slate-900 font-bold' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}"
              >
                {opt}
              </button>
            {/each}
          </div>
        </div>

        <!-- 5. Pain / Discomfort Severity Scale (1-10) -->
        <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Discomfort / Pain Severity Scale:
            </span>
            <span class="font-mono text-xs font-bold px-2 py-0.5 rounded bg-white border border-slate-300 text-slate-900">
              {painScale} / 10 &bull; {painScale >= 8 ? 'Severe' : painScale >= 5 ? 'Moderate' : 'Mild'}
            </span>
          </div>

          <input
            type="range"
            min="1"
            max="10"
            bind:value={painScale}
            class="w-full accent-blue-600 cursor-pointer"
          />

          <div class="flex justify-between text-[11px] text-slate-400 font-medium">
            <span>1 (Mild / Minor discomfort)</span>
            <span>5 (Moderate)</span>
            <span>10 (Severe / Worst pain)</span>
          </div>
        </div>

        <!-- Disclaimer -->
        <p class="text-[11px] text-slate-500 leading-relaxed border-t border-slate-100 pt-4">
          * CLINIKS uses artificial intelligence strictly to organize your narrative for the attending physician. The AI does not diagnose illnesses or prescribe medication.
        </p>

        <!-- Submit Button -->
        <div class="pt-2">
          <button
            type="button"
            on:click={handleSubmit}
            disabled={isSubmitting}
            class="w-full py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Sparkles class="w-4 h-4" />
            <span>{isSubmitting ? 'Analyzing & Structuring...' : 'Submit to Doctor for Review & Scheduling'}</span>
          </button>
        </div>

      </div>

    </div>

  {:else}
    <!-- ========================================================================= -->
    <!-- POST-SUBMISSION CONFIRMATION (Shows AI Brief & 1-10 Score)                 -->
    <!-- ========================================================================= -->
    <div class="space-y-6 animate-in fade-in zoom-in-95 duration-150">
      
      <!-- Confirmation Banner -->
      <div class="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <CheckCircle2 class="w-7 h-7" />
          </div>
          <div>
            <h2 class="text-xl font-bold text-slate-900">Pre-Consultation Intake Transmitted</h2>
            <p class="text-xs text-slate-500 font-mono mt-0.5">
              Ref #{submittedCase.id} &bull; Transmitted to Attending Physician Workstation
            </p>
          </div>
        </div>

        <div class="p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs text-slate-800 space-y-1.5 leading-relaxed">
          <div class="font-bold text-blue-900 flex items-center gap-1.5">
            <Clock class="w-4 h-4 text-blue-600" />
            <span>Next Step: Doctor Review &amp; Time Scheduling</span>
          </div>
          <p>
            Dr. Adeleke is reviewing your structured brief. The doctor will verify your urgency score and assign your exact arrival time slot shortly.
          </p>
        </div>

        <!-- The 3 Structured Brief Sections Generated for Doctor -->
        <div class="border border-slate-200 rounded-xl overflow-hidden text-xs">
          
          <div class="bg-slate-100 p-3 border-b border-slate-200 flex items-center justify-between">
            <span class="font-bold uppercase tracking-wider text-slate-700 text-[11px] font-mono">
              AI-Generated Doctor's Brief
            </span>
            <span class="font-mono text-xs font-bold px-2 py-0.5 rounded bg-white border border-slate-300 text-slate-900">
              Preliminary Urgency: {submittedCase.aiBrief.preliminaryScore} / 10
            </span>
          </div>

          <div class="p-4 space-y-4 bg-white">
            <!-- 1. Chief Complaint -->
            <div>
              <span class="text-slate-400 uppercase font-mono text-[10px] block font-bold">1. Chief Complaint:</span>
              <p class="text-slate-900 font-semibold mt-0.5 text-sm">
                "{submittedCase.aiBrief.chiefComplaint}"
              </p>
            </div>

            <!-- 2. Symptom Timeline -->
            <div>
              <span class="text-slate-400 uppercase font-mono text-[10px] block font-bold">2. Symptom Timeline:</span>
              <p class="text-slate-700 font-medium mt-0.5">
                {submittedCase.aiBrief.symptomTimeline}
              </p>
            </div>

            <!-- 3. Red Flags -->
            <div>
              <span class="text-slate-400 uppercase font-mono text-[10px] block font-bold">3. Clinical Red Flags:</span>
              <div class="mt-1 space-y-1">
                {#each submittedCase.aiBrief.redFlags as rf}
                  <p class="text-xs font-medium {submittedCase.aiBrief.isEmergency ? 'text-red-700' : 'text-slate-700'}">
                    &bull; {rf}
                  </p>
                {/each}
              </div>
            </div>
          </div>

        </div>

        <!-- Action Buttons -->
        <div class="flex items-center gap-3 pt-2">
          <button
            type="button"
            on:click={goToDashboard}
            class="flex-1 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer text-center"
          >
            Go to My Dashboard
          </button>
          <button
            type="button"
            on:click={resetNewIntake}
            class="py-3 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
          >
            Submit Another Intake
          </button>
        </div>

      </div>

    </div>
  {/if}

</div>
