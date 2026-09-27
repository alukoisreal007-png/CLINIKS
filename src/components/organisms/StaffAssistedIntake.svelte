<script>
  import { createEventDispatcher } from 'svelte';
  import { clinicStore } from '../../stores/clinicStore.js';
  import { 
    UserPlus, 
    Sparkles, 
    Printer, 
    CheckCircle2, 
    AlertCircle, 
    Clock, 
    FileText, 
    ShieldCheck, 
    RefreshCw, 
    ArrowRight,
    Users,
    Activity,
    QrCode
  } from 'lucide-svelte';

  const dispatch = createEventDispatcher();

  // Walk-in Patient Form State
  let patientName = '';
  let hospitalCardNo = '';
  let age = '';
  let gender = 'Female';
  let phone = '';
  let arrivalMode = 'STAFF_ASSISTED';
  let primaryLanguage = 'English';
  let complaint = '';
  let painScale = 4;
  let duration = '1 to 2 days';
  let clerkNotes = '';
  let clerkName = 'Records Clerk Ibrahim Danjuma';

  // Submission / Ticket State
  let isSubmitting = false;
  let issuedTicket = null;
  let showTicketModal = false;

  // Quick symptom chips for Nigerian OPD
  const symptomPresets = [
    { label: 'High Fever & Chills (Malaria)', complaint: 'High-grade fever since yesterday with severe chills, headache, and generalized joint pains.', pain: 7 },
    { label: 'Acute Abdominal Pain', complaint: 'Sudden onset severe cramping lower abdominal pain, vomiting, and inability to tolerate oral fluids.', pain: 8 },
    { label: 'Asthma Exacerbation', complaint: 'Acute breathlessness, chest tightness, and wheezing. Inhaler finished 2 days ago.', pain: 6 },
    { label: 'Blunt Trauma / Laceration', complaint: 'Fall injury with deep laceration on right forearm, active minor bleeding and acute swelling.', pain: 7 },
    { label: 'Hypertensive Urgency / Headache', complaint: 'Severe occipital throbbing headache, blurred vision, and dizziness. Known hypertensive.', pain: 8 },
    { label: 'Routine PUD / Refill', complaint: 'Routine follow-up visit for peptic ulcer medication refill. Mild epigastric discomfort.', pain: 2 }
  ];

  function applyPreset(preset) {
    complaint = preset.complaint;
    painScale = preset.pain;
  }

  function generateCardNo() {
    const randomSeq = Math.floor(10000 + Math.random() * 90000);
    hospitalCardNo = `GH-2026-${randomSeq}`;
  }

  function handleSubmit() {
    if (!patientName.trim()) {
      alert('Please enter patient full name.');
      return;
    }

    if (!hospitalCardNo.trim()) {
      generateCardNo();
    }

    if (!complaint.trim()) {
      alert('Please enter the patient chief complaint.');
      return;
    }

    isSubmitting = true;

    const intakePayload = {
      patientName: patientName.trim(),
      hospitalCardNo: hospitalCardNo.trim(),
      age: age || '30',
      gender: gender,
      phone: phone || 'N/A',
      intakeMode: 'STAFF_ASSISTED',
      complaint: complaint.trim(),
      painScale: Number(painScale),
      duration: duration,
      answers: [
        `Arrival: Walk-in registered by ${clerkName}`,
        `Primary Language: ${primaryLanguage}`,
        `Intake Mode: Staff-Assisted Walk-In Desk`,
        `Clerk Notes: ${clerkNotes || 'Registered at OPD reception desk'}`
      ]
    };

    // Submit to store
    const newEntry = clinicStore.submitStudentIntake(intakePayload);
    issuedTicket = newEntry;
    showTicketModal = true;
    isSubmitting = false;
  }

  function handlePrintTicket() {
    window.print();
  }

  function resetFormForNextPatient() {
    patientName = '';
    hospitalCardNo = '';
    age = '';
    gender = 'Female';
    phone = '';
    complaint = '';
    painScale = 4;
    duration = '1 to 2 days';
    clerkNotes = '';
    showTicketModal = false;
    issuedTicket = null;
    generateCardNo();
  }
</script>

<div class="space-y-6">
  
  <!-- Desk-Assisted Mode Banner -->
  <div class="bg-[#0F172A] text-white rounded-2xl p-5 sm:p-6 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
    <div class="flex items-center gap-3">
      <div class="w-11 h-11 rounded-xl bg-blue-500/20 text-[#699FDF] flex items-center justify-center border border-[#699FDF]/30 shrink-0">
        <Users class="w-6 h-6" />
      </div>
      <div>
        <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-[#699FDF] text-[10px] font-mono font-bold">
          Thesis Section 11 &bull; Digital Literacy / Non-Smartphone Intake
        </div>
        <h2 class="text-lg sm:text-xl font-bold text-white mt-0.5">
          OPD Reception Desk-Assisted Intake Mode
        </h2>
        <p class="text-xs text-slate-300">
          Clerk or triage nurse enters complaints on behalf of walk-in patients without smartphones.
        </p>
      </div>
    </div>

    <div class="text-right shrink-0">
      <span class="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-600/50">
        Active Desk: Reception Bay 01
      </span>
    </div>
  </div>

  <!-- Intake Form Card -->
  <div class="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
    
    <div class="border-b border-slate-100 pb-4">
      <h3 class="text-base font-bold text-slate-900">Patient Identity &amp; Registration</h3>
      <p class="text-xs text-slate-500">Collect or verify official hospital card details.</p>
    </div>

    <!-- Identity Fields Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
      
      <!-- Full Name -->
      <div class="space-y-1">
        <label for="staff-patient-name" class="block font-bold text-slate-700 uppercase tracking-wider text-[11px]">
          Patient Full Name *
        </label>
        <input
          id="staff-patient-name"
          type="text"
          bind:value={patientName}
          placeholder="e.g. Chinedu Okafor"
          class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-[#699FDF] focus:ring-1 focus:ring-[#699FDF] outline-none text-slate-900 font-medium"
        />
      </div>

      <!-- Hospital Card Number + Auto-generator -->
      <div class="space-y-1">
        <div class="flex items-center justify-between">
          <label for="staff-card-no" class="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
            Hospital Card No. *
          </label>
          <button
            type="button"
            on:click={generateCardNo}
            class="text-[10px] text-[#699FDF] hover:underline font-mono font-bold cursor-pointer"
          >
            [ Auto-Gen ]
          </button>
        </div>
        <div class="flex gap-2">
          <input
            id="staff-card-no"
            type="text"
            bind:value={hospitalCardNo}
            placeholder="GH-2026-XXXXX"
            class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-[#699FDF] font-mono text-slate-900 font-bold outline-none"
          />
        </div>
      </div>

      <!-- Age & Gender -->
      <div class="grid grid-cols-2 gap-2">
        <div class="space-y-1">
          <label for="staff-age" class="block font-bold text-slate-700 uppercase tracking-wider text-[11px]">
            Age (Yrs)
          </label>
          <input
            id="staff-age"
            type="number"
            bind:value={age}
            placeholder="34"
            min="1"
            max="120"
            class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-[#699FDF] text-slate-900 font-medium outline-none"
          />
        </div>
        <div class="space-y-1">
          <label for="staff-gender" class="block font-bold text-slate-700 uppercase tracking-wider text-[11px]">
            Gender
          </label>
          <select
            id="staff-gender"
            bind:value={gender}
            class="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:border-[#699FDF] text-slate-900 font-medium outline-none bg-white"
          >
            <option value="Female">Female</option>
            <option value="Male">Male</option>
          </select>
        </div>
      </div>

      <!-- Contact Phone -->
      <div class="space-y-1">
        <label for="staff-phone" class="block font-bold text-slate-700 uppercase tracking-wider text-[11px]">
          Contact Phone (SMS Queue Alerts)
        </label>
        <input
          id="staff-phone"
          type="tel"
          bind:value={phone}
          placeholder="0803 XXX XXXX"
          class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-[#699FDF] text-slate-900 outline-none font-mono"
        />
      </div>

      <!-- Arrival Mode -->
      <div class="space-y-1">
        <label for="staff-arrival-mode" class="block font-bold text-slate-700 uppercase tracking-wider text-[11px]">
          Arrival Mode
        </label>
        <select
          id="staff-arrival-mode"
          bind:value={arrivalMode}
          class="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:border-[#699FDF] text-slate-900 outline-none bg-white font-medium"
        >
          <option value="STAFF_ASSISTED">Walk-in Alone (Assisted Intake)</option>
          <option value="BROUGHT_IN">Brought in by Family / Colleague</option>
          <option value="REFERRED">Departmental / Clinic Referral</option>
          <option value="AMBULANCE">Emergency Ambulance / Police</option>
        </select>
      </div>

      <!-- Primary Language -->
      <div class="space-y-1">
        <label for="staff-lang" class="block font-bold text-slate-700 uppercase tracking-wider text-[11px]">
          Preferred Communication
        </label>
        <select
          id="staff-lang"
          bind:value={primaryLanguage}
          class="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:border-[#699FDF] text-slate-900 outline-none bg-white font-medium"
        >
          <option value="English">English</option>
          <option value="Nigerian Pidgin">Nigerian Pidgin</option>
          <option value="Hausa">Hausa</option>
          <option value="Yoruba">Yoruba</option>
          <option value="Igbo">Igbo</option>
        </select>
      </div>

    </div>

    <!-- Quick Symptom Presets -->
    <div class="pt-2 space-y-2">
      <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
        1-Click OPD Clinical Presentation Presets:
      </span>
      <div class="flex flex-wrap gap-2">
        {#each symptomPresets as preset}
          <button
            type="button"
            on:click={() => applyPreset(preset)}
            class="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-[#699FDF] border border-slate-200 transition-colors cursor-pointer"
          >
            {preset.label}
          </button>
        {/each}
      </div>
    </div>

    <!-- Chief Complaint Textarea -->
    <div class="space-y-1">
      <label for="staff-complaint" class="block font-bold text-slate-700 uppercase tracking-wider text-[11px]">
        Chief Complaint &amp; Reported Symptoms *
      </label>
      <textarea
        id="staff-complaint"
        bind:value={complaint}
        rows="3"
        placeholder="Type patient's description of illness in their own words..."
        class="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-[#699FDF] focus:ring-1 focus:ring-[#699FDF] outline-none text-xs text-slate-900 bg-slate-50/50 leading-relaxed"
      ></textarea>
    </div>

    <!-- Severity & Duration -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
      
      <!-- Pain Scale -->
      <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
        <div class="flex justify-between items-center">
          <span class="font-bold text-slate-800 text-[11px] uppercase">Reported Pain / Distress:</span>
          <span class="font-bold font-mono px-2 py-0.5 rounded text-xs {painScale >= 8 ? 'bg-red-100 text-red-700' : painScale >= 5 ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-800'}">
            {painScale} / 10 &bull; {painScale >= 8 ? 'Severe / Acute' : painScale >= 5 ? 'Moderate' : 'Mild'}
          </span>
        </div>
        <input
          type="range"
          min="1"
          max="10"
          bind:value={painScale}
          class="w-full accent-[#699FDF] cursor-pointer"
        />
        <div class="flex justify-between text-[10px] text-slate-400">
          <span>1 (Mild)</span>
          <span>5 (Moderate)</span>
          <span>10 (Unbearable)</span>
        </div>
      </div>

      <!-- Duration -->
      <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
        <span class="font-bold text-slate-800 text-[11px] uppercase block">Symptom Duration:</span>
        <div class="grid grid-cols-2 gap-1.5">
          {#each ['Less than 6 hours', '1 to 2 days', '3 to 5 days', 'More than a week'] as d}
            <button
              type="button"
              on:click={() => duration = d}
              class="py-1.5 px-2 rounded-lg text-[11px] font-medium transition-colors cursor-pointer border {duration === d ? 'bg-[#0F172A] text-white border-[#0F172A]' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'}"
            >
              {d}
            </button>
          {/each}
        </div>
      </div>

    </div>

    <!-- Action Bar -->
    <div class="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div class="text-[11px] text-slate-500">
        Officer on Duty: <strong class="text-slate-800">{clerkName}</strong> &bull; Registration Desk 01
      </div>

      <button
        type="button"
        on:click={handleSubmit}
        disabled={isSubmitting}
        class="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#699FDF] hover:bg-[#5289CC] text-white font-black text-sm shadow-md transition-all cursor-pointer inline-flex items-center justify-center gap-2 hover:scale-102 active:scale-98"
      >
        <CheckCircle2 class="w-5 h-5 stroke-[2.5]" />
        <span>Issue Queue Ticket &amp; Admit Patient</span>
      </button>
    </div>

  </div>

</div>

<!-- PHYSICAL QUEUE TICKET MODAL -->
{#if showTicketModal && issuedTicket}
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs font-sans">
    <div class="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 sm:p-8 space-y-6 text-slate-900 animate-in fade-in zoom-in-95 duration-150">
      
      <!-- Ticket Header -->
      <div class="text-center border-b-2 border-dashed border-slate-300 pb-5 space-y-1">
        <div class="text-xs font-bold tracking-widest text-slate-500 uppercase">
          Federal Ministry of Health &bull; General Hospital
        </div>
        <h3 class="text-base font-extrabold text-slate-900">
          OUTPATIENT DEPARTMENT CLINIC TICKET
        </h3>
        <p class="text-xs text-slate-500 font-mono">Wing A &bull; Emergency &amp; Routine Triage</p>
      </div>

      <!-- Large Queue Number Token -->
      <div class="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-center space-y-1">
        <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400">Queue Number</span>
        <div class="text-5xl font-black text-[#0F172A] tracking-tight">
          #{issuedTicket.queueNo}
        </div>
        <div class="pt-2">
          {#if issuedTicket.aiTriage?.suggestedPriority === 'HIGH'}
            <span class="px-3 py-1 rounded-full text-xs font-black uppercase bg-red-100 text-[#DC2626] border border-red-300">
              Emergency Priority
            </span>
          {:else if issuedTicket.aiTriage?.suggestedPriority === 'MODERATE'}
            <span class="px-3 py-1 rounded-full text-xs font-bold uppercase bg-amber-100 text-[#D97706] border border-amber-300">
              Moderate Priority
            </span>
          {:else}
            <span class="px-3 py-1 rounded-full text-xs font-bold uppercase bg-slate-100 text-slate-700 border border-slate-200">
              Routine Priority
            </span>
          {/if}
        </div>
      </div>

      <!-- Ticket Data Breakdown -->
      <div class="space-y-2 text-xs divide-y divide-slate-100 font-mono">
        <div class="flex justify-between py-1.5">
          <span class="text-slate-500">Patient:</span>
          <span class="font-bold text-slate-900">{issuedTicket.patientName}</span>
        </div>
        <div class="flex justify-between py-1.5">
          <span class="text-slate-500">Card No:</span>
          <span class="font-bold text-slate-900">{issuedTicket.hospitalCardNo}</span>
        </div>
        <div class="flex justify-between py-1.5">
          <span class="text-slate-500">Assigned Room:</span>
          <span class="font-bold text-slate-900">{issuedTicket.assignedRoom || 'Triage Waiting Bay 1'}</span>
        </div>
        <div class="flex justify-between py-1.5">
          <span class="text-slate-500">Admit Time:</span>
          <span class="font-bold text-slate-900">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>

      <!-- Instructions -->
      <div class="p-3.5 rounded-xl bg-blue-50/80 border border-blue-200 text-[11px] text-slate-700 space-y-1">
        <div class="font-bold text-[#0F172A]">Patient Instructions:</div>
        <p>
          Please proceed to the <strong>Nursing Triage Station (Station 03)</strong> to have your vital signs recorded before your consultation.
        </p>
      </div>

      <!-- Actions -->
      <div class="flex items-center gap-3 pt-2">
        <button
          type="button"
          on:click={handlePrintTicket}
          class="flex-1 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
        >
          <Printer class="w-4 h-4" />
          <span>Print Physical Slip</span>
        </button>

        <button
          type="button"
          on:click={resetFormForNextPatient}
          class="flex-1 py-3 px-4 rounded-xl bg-[#699FDF] hover:bg-[#5289CC] text-white font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
        >
          <UserPlus class="w-4 h-4" />
          <span>Next Patient</span>
        </button>
      </div>

    </div>
  </div>
{/if}
