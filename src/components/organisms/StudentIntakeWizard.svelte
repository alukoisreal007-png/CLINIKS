<script>
  import { createEventDispatcher, onMount, onDestroy } from 'svelte';
  import { clinicStore } from '../../stores/clinicStore.js';
  import Button from '../atoms/Button.svelte';
  import Card from '../atoms/Card.svelte';
  import Badge from '../atoms/Badge.svelte';
  import { 
    Sparkles, 
    Send, 
    CheckCircle2, 
    AlertCircle, 
    Clock, 
    HeartPulse, 
    Volume2,
    ArrowRight,
    Activity,
    ShieldCheck,
    Check
  } from 'lucide-svelte';
  import VoiceMicButton from '../atoms/VoiceMicButton.svelte';

  export let studentProfile;
  const dispatch = createEventDispatcher();

  // Unified Form State (All questions & answer boxes on one single page)
  let complaint = '';
  let painScale = 3;
  let duration = 'Today (few hours)';
  let breathingDifficulty = 'No breathing issues';
  let neckStiffness = 'No neck stiffness';
  let fluidsTolerated = 'Can tolerate fluids';
  let weightBearing = 'Can bear weight';
  let medicationsNotes = '';
  let intakeMode = 'SELF_WALKIN';  // OPD arrival mode

  // Voice Assistant & Uiverse Oval State
  let isVoiceActive = false;
  let isAiSpeaking = false;
  let isListening = false;
  let currentAiMessage = 'Tap the oval to start voice consultation with the AI assistant.';
  let liveTranscript = '';
  let currentVoiceStep = 0; // 0: Idle, 1: Complaint, 2: Pain, 3: Duration, 4: Safety, 5: Mode, 6: Completed
  let recognition = null;
  let speechSynthAvailable = false;
  let recognitionAvailable = false;

  // Options
  const durations = [
    'Less than 6 hours',
    '1 to 2 days',
    '3 to 5 days',
    'More than a week'
  ];

  const arrivalModes = [
    { value: 'SELF_WALKIN',      icon: '🚶', label: 'Self walk-in',            sub: 'I came on my own' },
    { value: 'STAFF_ASSISTED',   icon: '🩺', label: 'Staff-assisted intake',   sub: 'Nurse or records clerk helping me' },
    { value: 'REFERRED',         icon: '📋', label: 'Referred from clinic',    sub: 'Another clinic or department sent me' },
    { value: 'BROUGHT_IN',       icon: '🤝', label: 'Brought in by someone',   sub: 'Family member, friend, or colleague' },
  ];

  onMount(() => {
    if (typeof window !== 'undefined') {
      speechSynthAvailable = 'speechSynthesis' in window;
      const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRec) {
        recognitionAvailable = true;
        recognition = new SpeechRec();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          isListening = true;
        };

        recognition.onresult = (event) => {
          let text = '';
          for (let i = 0; i < event.results.length; ++i) {
            text += event.results[i][0].transcript;
          }
          liveTranscript = text;
        };

        recognition.onerror = (e) => {
          console.warn('Speech recognition error:', e.error);
          isListening = false;
        };

        recognition.onend = () => {
          isListening = false;
          if (liveTranscript.trim()) {
            processStudentVoiceResponse(liveTranscript.trim());
          }
        };
      }
    }
  });

  onDestroy(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (recognition) {
      try {
        recognition.stop();
      } catch (e) {}
    }
  });

  function speak(text, onEnd) {
    currentAiMessage = text;
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.onstart = () => {
        isAiSpeaking = true;
      };
      utterance.onend = () => {
        isAiSpeaking = false;
        if (onEnd) onEnd();
      };
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => {
        if (onEnd) onEnd();
      }, 2000);
    }
  }

  function startListening() {
    if (!recognition) return;
    liveTranscript = '';
    try {
      recognition.start();
    } catch (e) {
      // If already started
    }
  }

  function handleVoiceToggle() {
    if (isVoiceActive) {
      // Starting Voice Guided Mode
      currentVoiceStep = 1;
      const studentName = studentProfile?.name ? studentProfile.name.split(' ')[0] : 'there';
      speak(
        `Hello ${studentName}. I am your clinical triage assistant. Please tell me what symptoms or health concern you are experiencing right now.`,
        () => {
          startListening();
        }
      );
    } else {
      // Turning off Voice
      currentVoiceStep = 0;
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (recognition) {
        try { recognition.stop(); } catch (e) {}
      }
      isAiSpeaking = false;
      isListening = false;
      currentAiMessage = 'Voice Assistant Inactive. You can type directly in the boxes below or tap the oval to resume.';
    }
  }

  function processStudentVoiceResponse(text) {
    if (currentVoiceStep === 1) {
      // Step 1: Chief Complaint
      if (text.length < 5) {
        speak('Could you describe your main symptom in a little more detail for the doctor?', () => {
          startListening();
        });
        return;
      }
      complaint = text;
      currentVoiceStep = 2;
      speak('Thank you. On a scale of 1 to 10, how severe is your pain or discomfort right now?', () => {
        startListening();
      });
    } else if (currentVoiceStep === 2) {
      // Step 2: Pain Scale
      const match = text.match(/\b(10|[1-9])\b/);
      if (match) {
        painScale = parseInt(match[0], 10);
      } else {
        if (text.toLowerCase().includes('severe') || text.toLowerCase().includes('terrible') || text.toLowerCase().includes('emergency')) {
          painScale = 9;
        } else if (text.toLowerCase().includes('moderate') || text.toLowerCase().includes('bad')) {
          painScale = 6;
        } else {
          painScale = 3;
        }
      }
      currentVoiceStep = 3;
      speak('Got that. How long have you felt this way? For example: less than six hours, one to two days, or over a week?', () => {
        startListening();
      });
    } else if (currentVoiceStep === 3) {
      // Step 3: Duration
      const lower = text.toLowerCase();
      if (lower.includes('hour') || lower.includes('today') || lower.includes('morning')) {
        duration = 'Less than 6 hours';
      } else if (lower.includes('day') || lower.includes('yesterday')) {
        duration = '1 to 2 days';
      } else if (lower.includes('week') || lower.includes('month')) {
        duration = 'More than a week';
      } else {
        duration = '3 to 5 days';
      }

      currentVoiceStep = 4;
      speak('Are you experiencing any shortness of breath, chest tightness, or neck stiffness?', () => {
        startListening();
      });
    } else if (currentVoiceStep === 4) {
      // Step 4: Safety screening
      const lower = text.toLowerCase();
      if (lower.includes('yes') || lower.includes('breath') || lower.includes('chest') || lower.includes('wheez')) {
        breathingDifficulty = 'Shortness of breath / Chest tightness reported';
      }
      if (lower.includes('neck') || lower.includes('stiff') || lower.includes('light')) {
        neckStiffness = 'Neck stiffness / Photophobia reported';
      }
      medicationsNotes = text;

      currentVoiceStep = 5;
      speak('And finally, how did you arrive today? For example: did you walk in on your own, were you brought by someone, or were you referred by another department?', () => {
        startListening();
      });
    } else if (currentVoiceStep === 5) {
      // Step 5: Arrival mode
      const lower = text.toLowerCase();
      if (lower.includes('staff') || lower.includes('nurse') || lower.includes('clerk') || lower.includes('assisted')) {
        intakeMode = 'STAFF_ASSISTED';
      } else if (lower.includes('refer') || lower.includes('sent') || lower.includes('department')) {
        intakeMode = 'REFERRED';
      } else if (lower.includes('brought') || lower.includes('family') || lower.includes('friend')) {
        intakeMode = 'BROUGHT_IN';
      } else {
        intakeMode = 'SELF_WALKIN';
      }

      currentVoiceStep = 6;
      // Step 6: Warm reassurance and auto-submit
      const patientName = studentProfile?.name ? studentProfile.name.split(' ')[0] : 'there';
      speak(
        `Thank you, ${patientName}. You are going to be fine. All your clinical answers have been recorded and sent to the clinician. You will receive a reply with your queue number and consultation room shortly.`,
        () => {
          setTimeout(() => {
            submitIntake();
          }, 1200);
        }
      );
    }
  }

  function submitIntake() {
    if (!complaint.trim()) {
      alert('Please provide your symptoms or chief concern before submitting.');
      return;
    }

    const formattedAnswers = [
      `Breathing: ${breathingDifficulty}`,
      `Neck / Neuro: ${neckStiffness}`,
      `Oral Fluids: ${fluidsTolerated}`,
      `Mobility: ${weightBearing}`,
      `Additional Notes: ${medicationsNotes || 'None'}`
    ];

    clinicStore.submitStudentIntake({
      patientName: studentProfile?.name || 'Patient',
      hospitalCardNo: studentProfile?.hospitalCardNo || studentProfile?.matricNo || '',
      complaint: complaint,
      duration: duration,
      painScale: painScale,
      answers: formattedAnswers,
      intakeMode: intakeMode
    });

    dispatch('submitted');
  }
</script>

<div class="space-y-6 max-w-4xl mx-auto">

  <!-- ========================================================================= -->
  <!-- 1. AI VOICE INTERVIEW HEADER WITH UIVERSE.IO OVAL TOGGLE                  -->
  <!-- ========================================================================= -->
  <div class="p-5 sm:p-6 rounded-3xl relative overflow-hidden transition-colors duration-200 border {isVoiceActive ? 'bg-slate-950 text-white border-slate-800 shadow-xl' : 'bg-slate-100 text-slate-900 border-slate-300 shadow-xs'}">
    <!-- Subtle background radial glow (visible when voice active) -->
    <div class="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none transition-opacity duration-200 {isVoiceActive ? 'opacity-100' : 'opacity-0'}"></div>

    <div class="flex items-center justify-between gap-4 w-full relative z-10">
      <h3 class="text-base sm:text-2xl font-black tracking-tight shrink-0 transition-colors duration-200 {isVoiceActive ? 'text-white' : 'text-slate-950'}">
        Pre-Consultation Clinical Intake
      </h3>

      <!-- Uiverse.io Voice Oval at far end of the bar -->
      <div class="shrink-0 flex items-center">
        <div class="toggle-cont">
          <input 
            class="toggle-input" 
            id="voice-toggle" 
            type="checkbox" 
            bind:checked={isVoiceActive} 
            on:change={handleVoiceToggle} 
          />
          <label class="toggle-label" for="voice-toggle" title={isVoiceActive ? "Voice Assistant Active (Click to disable)" : "Click to activate Voice Assistant"}>
            <div class="cont-icon">
              <span class="sparkle" style="--width: 2; --deg: 45; --duration: 15;"></span>
              <span class="sparkle" style="--width: 3; --deg: 90; --duration: 25;"></span>
              <span class="sparkle" style="--width: 2.5; --deg: 135; --duration: 20;"></span>
              <span class="sparkle" style="--width: 1.5; --deg: 180; --duration: 18;"></span>
              <span class="sparkle" style="--width: 3.5; --deg: 225; --duration: 30;"></span>
              <span class="sparkle" style="--width: 2; --deg: 270; --duration: 22;"></span>
              <span class="sparkle" style="--width: 1.8; --deg: 315; --duration: 16;"></span>
              <span class="sparkle" style="--width: 2.2; --deg: 360; --duration: 24;"></span>
              
              <!-- Voice Microphone Icon inside oval -->
              <svg class="icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
              </svg>
            </div>
          </label>
        </div>
      </div>
    </div>
  </div>

  <!-- ========================================================================= -->
  <!-- 2. UNIFIED QUESTIONNAIRE FORM (ALL QUESTIONS & ANSWER BOXES TOGETHER)     -->
  <!-- ========================================================================= -->
  <Card className="p-6 sm:p-9 shadow-sm border-2 border-slate-200/90 bg-white space-y-8">
    
    <!-- Question 1: Chief Complaint -->
    <div class="space-y-3">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <label for="complaint-box" class="block text-sm font-extrabold text-slate-950 uppercase tracking-wider">
          1. What symptoms or health concern are you experiencing? <span class="text-rose-600 font-black">*</span>
        </label>
        
        <div class="flex items-center gap-3">
          {#if complaint}
            <span class="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Recorded
            </span>
          {/if}
          <VoiceMicButton 
            on:transcript={(e) => {
              const text = e.detail.text?.trim();
              if (text && !complaint.endsWith(text)) {
                complaint = complaint ? `${complaint.trim()} ${text}` : text;
              }
            }}
            label="Voice Dictate"
          />
        </div>
      </div>

      <textarea
        id="complaint-box"
        rows="4"
        placeholder="e.g. I have a high fever and headache that started this morning, accompanied by cold chills. It hurts when I swallow."
        bind:value={complaint}
        class="w-full px-4 py-3 rounded-2xl border-2 border-slate-300 bg-white text-slate-950 font-bold placeholder:font-normal placeholder:text-slate-400 text-sm sm:text-base transition-all focus:outline-none focus:border-emerald-600 focus:ring-3 focus:ring-emerald-600/10"
      ></textarea>
    </div>

    <!-- Question 2: Pain Scale (1 - 10) -->
    <div class="space-y-3 pt-4 border-t border-slate-200">
      <div class="flex justify-between items-center">
        <label for="pain-range" class="block text-sm font-extrabold text-slate-950 uppercase tracking-wider">
          2. Pain / Discomfort Intensity (Scale 1 – 10)
        </label>
        <span class="text-xs font-black px-3 py-1 rounded-full {painScale >= 8 ? 'bg-rose-100 text-rose-900 border border-rose-300' : painScale >= 5 ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-emerald-100 text-emerald-900 border border-emerald-300'}">
          Level {painScale}/10: {painScale >= 8 ? 'Severe / Acute Emergency' : painScale >= 5 ? 'Moderate' : 'Mild'}
        </span>
      </div>

      <input
        id="pain-range"
        type="range"
        min="1"
        max="10"
        bind:value={painScale}
        class="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
      />

      <div class="flex items-center justify-between gap-1 pt-1">
        {#each [1,2,3,4,5,6,7,8,9,10] as num}
          <button
            type="button"
            on:click={() => painScale = num}
            class="w-8 h-8 rounded-lg text-xs font-black transition-all cursor-pointer
              {painScale === num 
                ? (num >= 8 ? 'bg-rose-600 text-white' : num >= 5 ? 'bg-amber-600 text-white' : 'bg-emerald-600 text-white') 
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}"
          >
            {num}
          </button>
        {/each}
      </div>
    </div>

    <!-- Question 3: Duration -->
    <div class="space-y-3 pt-4 border-t border-slate-200">
      <span class="block text-sm font-extrabold text-slate-950 uppercase tracking-wider">
        3. How long have you felt these symptoms?
      </span>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {#each durations as d}
          <button
            type="button"
            on:click={() => duration = d}
            class="px-4 py-3 rounded-xl border text-xs sm:text-sm font-bold text-center transition-all cursor-pointer
              {duration === d 
                ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs' 
                : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-300'}"
          >
            {d}
          </button>
        {/each}
      </div>
    </div>

    <!-- Question 4: Targeted Safety Checks -->
    <div class="space-y-4 pt-4 border-t border-slate-200">
      <div>
        <h4 class="text-sm font-extrabold text-slate-950 uppercase tracking-wider">
          4. Key Clinical Safety Screening
        </h4>
        <p class="text-xs font-semibold text-slate-600 mt-0.5">
          Helps doctors rapidly prioritize acute respiratory, neurological, or trauma risks.
        </p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <!-- Breathing check -->
        <div class="p-3.5 rounded-xl border-2 border-slate-200 bg-slate-50 space-y-2">
          <span class="text-xs font-extrabold text-slate-900 block">Shortness of breath or chest tightness?</span>
          <div class="flex gap-2">
            <button
              type="button"
              on:click={() => breathingDifficulty = 'No breathing issues'}
              class="flex-1 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer
                {breathingDifficulty === 'No breathing issues' ? 'bg-white text-emerald-800 border-emerald-500 shadow-xs' : 'bg-slate-100 text-slate-600'}"
            >
              No issues
            </button>
            <button
              type="button"
              on:click={() => breathingDifficulty = 'Yes, difficulty breathing / wheezing'}
              class="flex-1 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer
                {breathingDifficulty !== 'No breathing issues' ? 'bg-rose-600 text-white border-rose-600 shadow-xs' : 'bg-slate-100 text-slate-600'}"
            >
              Yes, trouble breathing
            </button>
          </div>
        </div>

        <!-- Neck Stiffness / Meningeal check -->
        <div class="p-3.5 rounded-xl border-2 border-slate-200 bg-slate-50 space-y-2">
          <span class="text-xs font-extrabold text-slate-900 block">Stiff neck or room light hurting eyes?</span>
          <div class="flex gap-2">
            <button
              type="button"
              on:click={() => neckStiffness = 'No neck stiffness'}
              class="flex-1 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer
                {neckStiffness === 'No neck stiffness' ? 'bg-white text-emerald-800 border-emerald-500 shadow-xs' : 'bg-slate-100 text-slate-600'}"
            >
              No stiffness
            </button>
            <button
              type="button"
              on:click={() => neckStiffness = 'Yes, neck stiff & light hurts'}
              class="flex-1 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer
                {neckStiffness !== 'No neck stiffness' ? 'bg-rose-600 text-white border-rose-600 shadow-xs' : 'bg-slate-100 text-slate-600'}"
            >
              Yes, neck stiff / light hurts
            </button>
          </div>
        </div>

        <!-- Fluid intake -->
        <div class="p-3.5 rounded-xl border-2 border-slate-200 bg-slate-50 space-y-2">
          <span class="text-xs font-extrabold text-slate-900 block">Can you keep water / fluids down?</span>
          <div class="flex gap-2">
            <button
              type="button"
              on:click={() => fluidsTolerated = 'Can tolerate fluids'}
              class="flex-1 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer
                {fluidsTolerated === 'Can tolerate fluids' ? 'bg-white text-emerald-800 border-emerald-500 shadow-xs' : 'bg-slate-100 text-slate-600'}"
            >
              Yes, drinking OK
            </button>
            <button
              type="button"
              on:click={() => fluidsTolerated = 'Unable to keep fluids down (vomiting)'}
              class="flex-1 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer
                {fluidsTolerated !== 'Can tolerate fluids' ? 'bg-amber-600 text-white border-amber-600 shadow-xs' : 'bg-slate-100 text-slate-600'}"
            >
              Unable to keep fluids
            </button>
          </div>
        </div>

        <!-- Weight bearing -->
        <div class="p-3.5 rounded-xl border-2 border-slate-200 bg-slate-50 space-y-2">
          <span class="text-xs font-extrabold text-slate-900 block">Can you walk on the affected leg / ankle?</span>
          <div class="flex gap-2">
            <button
              type="button"
              on:click={() => weightBearing = 'Can bear weight'}
              class="flex-1 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer
                {weightBearing === 'Can bear weight' ? 'bg-white text-emerald-800 border-emerald-500 shadow-xs' : 'bg-slate-100 text-slate-600'}"
            >
              Can walk
            </button>
            <button
              type="button"
              on:click={() => weightBearing = 'Cannot bear weight / Severe limping'}
              class="flex-1 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer
                {weightBearing !== 'Can bear weight' ? 'bg-amber-600 text-white border-amber-600 shadow-xs' : 'bg-slate-100 text-slate-600'}"
            >
              Cannot put weight
            </button>
          </div>
        </div>
      </div>

      <!-- Additional note for current medications -->
      <div class="space-y-1.5 pt-1">
        <label for="med-notes" class="block text-xs font-extrabold text-slate-900 uppercase tracking-wider">
          Current medications, allergies, or extra notes (optional):
        </label>
        <input
          id="med-notes"
          type="text"
          placeholder="e.g. Taking Paracetamol. Allergic to Penicillin. Living at Kuti Hall."
          bind:value={medicationsNotes}
          class="w-full px-4 py-2.5 rounded-xl border-2 border-slate-300 bg-white text-slate-950 font-bold placeholder:font-normal placeholder:text-slate-400 text-sm focus:outline-none focus:border-emerald-600"
        />
      </div>
    </div>

    <!-- Question 5: Arrival / Intake Mode -->
    <div class="space-y-3 pt-4 border-t border-slate-200">
      <span class="block text-sm font-extrabold text-slate-950 uppercase tracking-wider">
        5. How are you coming in today?
      </span>
      <p class="text-xs font-semibold text-slate-500 -mt-1">Helps staff prepare the right intake path for you.</p>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {#each arrivalModes as mode}
          <button
            type="button"
            on:click={() => intakeMode = mode.value}
            class="p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between
              {intakeMode === mode.value
                ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-extrabold shadow-2xs ring-1 ring-emerald-600/30'
                : 'border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-semibold'}"
          >
            <div class="flex items-center gap-2.5">
              <span class="text-lg">{mode.icon}</span>
              <div>
                <span class="text-xs sm:text-sm block">{mode.label}</span>
                <span class="text-xs text-slate-500 font-normal">{mode.sub}</span>
              </div>
            </div>
            {#if intakeMode === mode.value}
              <Check class="w-4 h-4 text-emerald-700 stroke-[3] shrink-0" />
            {/if}
          </button>
        {/each}
      </div>
    </div>

    <!-- Reassurance Banner & Final Submission -->
    <div class="pt-6 border-t-2 border-slate-200 space-y-4">
      <div class="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 leading-relaxed font-semibold flex items-start gap-3">
        <ShieldCheck class="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
        <div>
          <strong>You are going to be fine.</strong> Your information is structured and sent directly to the attending clinician. The hospital system will automatically generate and issue your official OPD Queue Number immediately upon submission.
        </div>
      </div>

      <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="text-xs text-slate-500 font-medium text-center sm:text-left">
          Patient: <span class="font-bold text-slate-800">{studentProfile?.name || 'Verified Patient'}</span>
          {#if studentProfile?.hospitalCardNo || studentProfile?.matricNo}
            &bull; Card No: <span class="font-bold text-slate-800">{studentProfile?.hospitalCardNo || studentProfile?.matricNo}</span>
          {/if}
        </div>

        <button
          type="button"
          on:click={submitIntake}
          class="w-full sm:w-auto px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-base shadow-md cursor-pointer inline-flex items-center justify-center gap-2 transition-all hover:scale-102 active:scale-98"
        >
          <span>Submit Pre-Consultation to Clinician</span>
          <ArrowRight class="w-5 h-5 stroke-[2.5]" />
        </button>
      </div>
    </div>

  </Card>

</div>

<!-- ========================================================================= -->
<!-- 3. UIVERSE.IO COMPONENT STYLING BY MUHAMMADHASANN                         -->
<!-- ========================================================================= -->
<style>
  /* From Uiverse.io by MuhammadHasann */ 
  .toggle-cont {
    --primary: #10b981;
    --second: #059669;
    --light: #f8fafc;
    --dark: #121212;
    --gray: #414344;

    position: relative;
    z-index: 10;

    display: inline-flex;
    align-items: center;
    justify-content: center;

    width: fit-content;
    height: 66px;

    border-radius: 9999px;
  }

  /* Inactive (light & dull) state */
  .toggle-cont:not(:has(.toggle-input:checked)) {
    --light: #475569;
    --dark: #e2e8f0;
    --gray: #cbd5e1;
  }

  .toggle-cont:not(:has(.toggle-input:checked)) .toggle-label {
    border: 1px solid #cbd5e1;
    border-bottom: 0;
  }

  .toggle-cont:not(:has(.toggle-input:checked)) .toggle-label::before {
    background-color: #e2e8f0;
    border: 1px solid #cbd5e1;
    border-bottom: 0;
  }

  .toggle-cont:not(:has(.toggle-input:checked)) .toggle-label .cont-icon {
    border: 1px solid #cbd5e1;
    border-bottom: 0;
    background-image: radial-gradient(
      circle at 50% 0%,
      #f8fafc 0%,
      #cbd5e1 100%
    );
    box-shadow: inset 0 -0.15rem 0.15rem #94a3b8,
      inset 0 0 0.4rem 0.2rem #e2e8f0;
  }

  .toggle-cont .toggle-input {
    display: none;
  }

  .toggle-cont .toggle-label {
    --gap: 5px;
    --width: 50px;

    cursor: pointer;

    position: relative;
    display: inline-flex;
    align-items: center;

    padding: 0.5rem;
    width: calc((var(--width) + var(--gap)) * 2);
    height: 50px;
    background-color: var(--dark);

    border: 1px solid #777777;
    border-bottom: 0;

    border-radius: 9999px;
    box-sizing: content-box;
    transition: all 0.3s ease-in-out;
  }
  .toggle-label::before {
    content: "";

    position: absolute;
    z-index: -10;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

    width: calc(100% + 1.5rem);
    height: calc(100% + 1.5rem);
    background-color: var(--gray);

    border: 1px solid #777777;
    border-bottom: 0;
    border-radius: 9999px;

    transition: all 0.3s ease-in-out;
  }
  .toggle-label::after {
    content: "";

    position: absolute;
    z-index: -10;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

    width: 100%;
    height: 100%;
    background-image: radial-gradient(
      circle at 50% -100%,
      rgb(16, 185, 129) 0%,
      rgba(12, 12, 12, 1) 80%
    );

    border-radius: 9999px;
  }

  .toggle-cont .toggle-label .cont-icon {
    position: relative;

    display: flex;
    justify-content: center;
    align-items: center;

    width: var(--width);
    height: 50px;
    background-image: radial-gradient(
      circle at 50% 0%,
      #666666 0%,
      var(--gray) 100%
    );

    border: 1px solid #aaaaaa;
    border-bottom: 0;
    border-radius: 9999px;
    box-shadow: inset 0 -0.15rem 0.15rem var(--primary),
      inset 0 0 0.5rem 0.75rem var(--second);

    transition: transform 0.3s ease-in-out;
  }

  .cont-icon {
    overflow: clip;
    position: relative;
  }

  .cont-icon .sparkle {
    position: absolute;
    top: 50%;
    left: 50%;

    display: block;

    width: calc(var(--width) * 1px);
    aspect-ratio: 1;
    background-color: var(--light);

    border-radius: 50%;
    transform-origin: 50% 50%;
    rotate: calc(1deg * var(--deg));
    transform: translate(-50%, -50%);
    animation: sparkle calc(100s / var(--duration)) linear
      calc(0s / var(--duration)) infinite;
  }

  @keyframes sparkle {
    to {
      width: calc(var(--width) * 0.5px);
      transform: translate(2000%, -50%);
    }
  }

  .cont-icon .icon {
    width: 1.25rem;
    height: 1.25rem;
    color: var(--light);
  }

  .toggle-cont:has(.toggle-input:checked) {
    --checked: true;
  }

  /* Support both container styles and direct checked state */
  .toggle-cont .toggle-input:checked + .toggle-label,
  .toggle-cont:has(.toggle-input:checked) .toggle-label {
    background-color: #41434400;

    border: 1px solid #059669;
    border-bottom: 0;
  }

  .toggle-cont .toggle-input:checked + .toggle-label::before,
  .toggle-cont:has(.toggle-input:checked) .toggle-label::before {
    box-shadow: 0 1rem 2.5rem -1.5rem #10b981;
  }

  .toggle-cont .toggle-input:checked + .toggle-label .cont-icon,
  .toggle-cont:has(.toggle-input:checked) .toggle-label .cont-icon {
    overflow: visible;

    background-image: radial-gradient(
      circle at 50% 0%,
      #047857 0%,
      var(--primary) 100%
    );

    border: 1px solid var(--primary);
    border-bottom: 0;

    transform: translateX(calc((var(--gap) * 2) + 100%)) rotate(-225deg);
  }

  .toggle-cont .toggle-input:checked + .toggle-label .cont-icon .sparkle,
  .toggle-cont:has(.toggle-input:checked) .toggle-label .cont-icon .sparkle {
    z-index: -10;

    width: calc(var(--width) * 1.5px);
    background-color: #a7f3d0;

    animation: sparkle calc(100s / var(--duration)) linear
      calc(10s / var(--duration)) infinite;
  }

  @container style(--checked: true) {
    .toggle-cont .toggle-label {
      background-color: #41434400;

      border: 1px solid #059669;
      border-bottom: 0;
    }

    .toggle-cont .toggle-label::before {
      box-shadow: 0 1rem 2.5rem -1.5rem #10b981;
    }

    .toggle-cont .toggle-label .cont-icon {
      overflow: visible;

      background-image: radial-gradient(
        circle at 50% 0%,
        #047857 0%,
        var(--primary) 100%
      );

      border: 1px solid var(--primary);
      border-bottom: 0;

      transform: translateX(calc((var(--gap) * 2) + 100%)) rotate(-225deg);
    }

    .toggle-cont .toggle-label .cont-icon .sparkle {
      z-index: -10;

      width: calc(var(--width) * 1.5px);
      background-color: #a7f3d0;

      animation: sparkle calc(100s / var(--duration)) linear
        calc(10s / var(--duration)) infinite;
    }

    @keyframes sparkle {
      to {
        width: calc(var(--width) * 1px);
        transform: translate(5000%, -50%);
      }
    }
  }
</style>
