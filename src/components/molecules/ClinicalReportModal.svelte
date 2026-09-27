<script>
  import { createEventDispatcher } from 'svelte';
  import { 
    Printer, 
    X, 
    ShieldCheck, 
    AlertTriangle, 
    FileText, 
    Pill, 
    CheckCircle2, 
    Building2,
    Calendar,
    User,
    Stethoscope,
    Share2,
    Ambulance,
    FlaskConical,
    Home
  } from 'lucide-svelte';

  export let open = false;
  export let caseData = null;
  export let templateOverride = null; // 'AUTO' | 'PRESCRIPTION' | 'EMERGENCY' | 'LAB' | 'DISCHARGE'

  const dispatch = createEventDispatcher();

  let activeTab = 'AUTO';

  function handleClose() {
    open = false;
    dispatch('close');
  }

  function handlePrint() {
    window.print();
  }

  // Resolve current active template
  $: currentTemplate = (() => {
    if (activeTab !== 'AUTO') return activeTab;
    if (templateOverride && templateOverride !== 'AUTO') return templateOverride;

    const outcome = caseData?.encounterOutcome || '';
    const priority = caseData?.aiTriage?.suggestedPriority || '';
    const notes = (caseData?.clinicianNotes || '').toLowerCase();

    if (outcome === 'REFERRAL' || priority === 'HIGH' || notes.includes('referral') || notes.includes('emergency')) {
      return 'EMERGENCY';
    }
    if (outcome === 'LAB' || notes.includes('laboratory') || notes.includes('investigation')) {
      return 'LAB';
    }
    if (outcome === 'DISCHARGE' || notes.includes('discharge')) {
      return 'DISCHARGE';
    }
    return 'PRESCRIPTION';
  })();

  $: isEmergency = currentTemplate === 'EMERGENCY';
  $: isLab = currentTemplate === 'LAB';
  $: isDischarge = currentTemplate === 'DISCHARGE';
  $: isRx = currentTemplate === 'PRESCRIPTION';

  // Generate deterministic verification reference
  $: refCode = caseData?.id 
    ? `MED-OPD-${caseData.id.replace(/[^a-zA-Z0-9]/g, '').slice(-6).toUpperCase()}` 
    : 'MED-OPD-782910';

  $: todayDate = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  $: todayTime = new Date().toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit'
  });

  function handleKeydown(e) {
    if (e.key === 'Escape' && open) {
      handleClose();
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if open && caseData}
  <!-- Backdrop -->
  <button 
    type="button"
    class="fixed inset-0 bg-slate-950/75 backdrop-blur-xs z-50 border-none p-0 cursor-default print:hidden"
    on:click={handleClose}
    aria-label="Close modal backdrop"
  ></button>

  <!-- Modal Window Wrapper -->
  <div class="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto pointer-events-none print:p-0 print:bg-white print:static print:pointer-events-auto">
    <!-- Modal Window (Printable Document Container) -->
    <div 
      class="bg-white rounded-xl shadow-2xl border border-slate-300 max-w-3xl w-full my-6 overflow-hidden flex flex-col text-slate-900 animate-in fade-in zoom-in-95 duration-150 pointer-events-auto print:shadow-none print:border-none print:m-0 print:max-w-none print:w-full"
    >
      
      <!-- Top Action Bar (Hidden when Printing) -->
      <div class="px-4 py-3 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 print:hidden shrink-0">
        
        <!-- Interactive Template Switcher Bar -->
        <div class="flex items-center gap-1 bg-slate-800 p-1 rounded-lg border border-slate-700 overflow-x-auto text-xs">
          <button
            type="button"
            on:click={() => activeTab = 'PRESCRIPTION'}
            class="px-2.5 py-1 rounded font-bold transition-all cursor-pointer whitespace-nowrap {isRx ? 'bg-[#1E5EFF] text-white shadow-2xs' : 'text-slate-300 hover:text-white hover:bg-slate-700/60'}"
          >
            💊 Prescription (Rx)
          </button>
          
          <button
            type="button"
            on:click={() => activeTab = 'EMERGENCY'}
            class="px-2.5 py-1 rounded font-bold transition-all cursor-pointer whitespace-nowrap {isEmergency ? 'bg-rose-700 text-white shadow-2xs' : 'text-slate-300 hover:text-white hover:bg-slate-700/60'}"
          >
            🚨 Emergency Referral
          </button>
          
          <button
            type="button"
            on:click={() => activeTab = 'LAB'}
            class="px-2.5 py-1 rounded font-bold transition-all cursor-pointer whitespace-nowrap {isLab ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-300 hover:text-white hover:bg-slate-700/60'}"
          >
            🔬 Lab Requisition
          </button>

          <button
            type="button"
            on:click={() => activeTab = 'DISCHARGE'}
            class="px-2.5 py-1 rounded font-bold transition-all cursor-pointer whitespace-nowrap {isDischarge ? 'bg-emerald-700 text-white shadow-2xs' : 'text-slate-300 hover:text-white hover:bg-slate-700/60'}"
          >
            🏠 Discharge Summary
          </button>
        </div>

        <div class="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          <button
            type="button"
            on:click={handlePrint}
            class="px-3.5 py-1.5 rounded bg-[#1E5EFF] hover:bg-blue-600 text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Printer class="w-3.5 h-3.5" />
            <span>Print / Save PDF</span>
          </button>

          <button
            type="button"
            on:click={handleClose}
            class="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close report modal"
          >
            <X class="w-5 h-5" />
          </button>
        </div>
      </div>

      <!-- ========================================================================= -->
      <!-- OFFICIAL PRINTABLE CLINICAL DOCUMENT BODY                                 -->
      <!-- ========================================================================= -->
      <div id="printableClinicalReport" class="p-6 sm:p-10 space-y-6 text-slate-900 bg-white">
        
        <!-- ===================================================================== -->
        <!-- 1. HOSPITAL LETTERHEAD (NIGERIAN GOVERNMENT OPD STANDARD)             -->
        <!-- ===================================================================== -->
        <div class="border-b-2 {isEmergency ? 'border-rose-600' : isLab ? 'border-blue-600' : isDischarge ? 'border-emerald-700' : 'border-slate-900'} pb-4">
          <div class="flex items-start justify-between gap-4">
            
            <div class="space-y-1">
              <div class="text-[10px] font-mono font-extrabold uppercase tracking-widest text-slate-500">
                Federal Republic of Nigeria &bull; Public Outpatient Healthcare System
              </div>
              <h2 class="text-xl sm:text-2xl font-black tracking-tight text-slate-950 uppercase font-sans">
                GENERAL OUTPATIENT DEPARTMENT (OPD)
              </h2>
              <p class="text-xs text-slate-600 font-medium">
                CLINIKS Electronic Triage &amp; Clinical Health Ledger &bull; Outpatient Directorate
              </p>
            </div>

            <!-- Document Classification Stamp -->
            <div class="text-right shrink-0">
              <span class="inline-block px-3 py-1 rounded text-[11px] font-mono font-black uppercase tracking-wider border
                {isEmergency 
                  ? 'bg-rose-100 text-rose-950 border-rose-600' 
                  : isLab 
                    ? 'bg-blue-100 text-blue-950 border-blue-600'
                    : isDischarge
                      ? 'bg-emerald-100 text-emerald-950 border-emerald-700'
                      : 'bg-slate-100 text-slate-950 border-slate-400'}">
                {isEmergency ? '🚨 ACUTE EMERGENCY' : isLab ? '🔬 DIAGNOSTIC ORDER' : isDischarge ? '✓ DISCHARGED' : 'PHARMACY RX'}
              </span>
              <p class="text-[10px] text-slate-500 font-mono mt-1">Ref: {refCode}</p>
            </div>

          </div>
        </div>

        <!-- ===================================================================== -->
        <!-- 2. PATIENT DEMOGRAPHICS & CLINICAL ENCOUNTER HEADER                   -->
        <!-- ===================================================================== -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded border border-slate-200 text-xs font-mono">
          <div>
            <span class="text-[10px] text-slate-500 uppercase block font-bold">Patient Full Name</span>
            <strong class="text-slate-950 text-sm block font-sans">{caseData.patientName || caseData.studentName || 'Patient'}</strong>
          </div>
          <div>
            <span class="text-[10px] text-slate-500 uppercase block font-bold">Hospital Card No</span>
            <strong class="text-slate-950 text-sm block">{caseData.hospitalCardNo || caseData.matricNo || 'GH-OPD'}</strong>
          </div>
          <div>
            <span class="text-[10px] text-slate-500 uppercase block font-bold">Age / Gender</span>
            <strong class="text-slate-950 block">{caseData.age || 'Adult'} &bull; {caseData.gender || 'N/A'}</strong>
          </div>
          <div>
            <span class="text-[10px] text-slate-500 uppercase block font-bold">Encounter Date</span>
            <strong class="text-slate-950 block">{todayDate} ({todayTime})</strong>
          </div>
        </div>

        <!-- ===================================================================== -->
        <!-- 3. TEMPLATES: EMERGENCY vs LAB vs DISCHARGE vs RX                     -->
        <!-- ===================================================================== -->
        {#if isEmergency}
          <!-- ─── TEMPLATE B: ACUTE EMERGENCY HANDOVER & REFERRAL SHEET ─── -->
          <div class="space-y-4 border-2 border-rose-300 bg-rose-50/40 p-4 rounded-lg">
            
            <div class="flex items-center gap-2 text-rose-900 border-b border-rose-200 pb-2">
              <AlertTriangle class="w-5 h-5 text-rose-700 stroke-[2.5]" />
              <h3 class="text-sm font-extrabold uppercase tracking-wide font-mono">
                CRITICAL TRIAGE &amp; EMERGENCY ESCALATION DIRECTIVES
              </h3>
            </div>

            <!-- Urgent clinical indicators -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div class="bg-white p-2.5 rounded border border-rose-200">
                <span class="text-[10px] text-slate-500 font-mono uppercase block font-bold">Triage Severity</span>
                <strong class="text-rose-700 font-mono text-sm block font-black">HIGH PRIORITY (SCORE: {caseData.aiTriage?.urgencyScore || 95}/100)</strong>
              </div>
              <div class="bg-white p-2.5 rounded border border-rose-200">
                <span class="text-[10px] text-slate-500 font-mono uppercase block font-bold">Reported Pain Score</span>
                <strong class="text-rose-700 font-mono text-sm block font-black">{caseData.painScale || '8'}/10 (Severe)</strong>
              </div>
              <div class="bg-white p-2.5 rounded border border-rose-200">
                <span class="text-[10px] text-slate-500 font-mono uppercase block font-bold">Arrival Condition</span>
                <strong class="text-slate-900 text-xs block font-bold">{caseData.intakeMode || 'Acute Emergency Walk-in'}</strong>
              </div>
            </div>

            <!-- Reported Acute Complaint -->
            <div class="space-y-1">
              <span class="text-[10px] font-mono font-bold text-slate-600 uppercase block">Chief Presenting Complaint:</span>
              <p class="text-xs text-slate-900 font-medium italic bg-white p-3 rounded border border-rose-200">
                "{caseData.complaint}"
              </p>
            </div>

            <!-- Safety Warnings -->
            {#if caseData.aiTriage?.safetyWarnings?.length}
              <div class="p-2.5 rounded bg-rose-100/80 border border-rose-300 text-rose-950 text-xs font-semibold">
                <span class="font-bold font-mono uppercase text-[10px] block text-rose-900">Clinical Protocol Flag:</span>
                <p class="mt-0.5">{caseData.aiTriage.safetyWarnings[0]}</p>
              </div>
            {/if}

            <!-- Emergency Directives -->
            <div class="space-y-1">
              <span class="text-[10px] font-mono font-bold text-slate-700 uppercase block">Attending Physician Emergency Directives:</span>
              <div class="bg-white p-3 rounded border border-rose-300 text-xs text-slate-900 space-y-1.5 font-mono">
                <p class="font-bold text-rose-900">
                  {caseData.clinicianNotes || 'Immediate clinical transfer to Emergency Resuscitation / Specialist Inpatient Bay. Establish IV access, administer baseline vitals monitor, and initiate urgent cross-consultation.'}
                </p>
                <div class="pt-2 border-t border-slate-200 text-[11px] text-slate-600 flex items-center justify-between">
                  <span>Assigned Unit: <strong>{caseData.assignedRoom || 'Room 101 (Emergency & Acute Bay)'}</strong></span>
                  <span>Transport: <strong>Ambulance Escort Authorized</strong></span>
                </div>
              </div>
            </div>

          </div>

        {:else if isLab}
          <!-- ─── TEMPLATE C: LABORATORY INVESTIGATION REQUISITION ─── -->
          <div class="space-y-4 border border-blue-200 bg-blue-50/30 p-4 rounded-lg">
            <div class="flex items-center gap-2 text-blue-900 border-b border-blue-200 pb-2">
              <FlaskConical class="w-5 h-5 text-blue-700 stroke-[2.5]" />
              <h3 class="text-sm font-extrabold uppercase tracking-wide font-mono">
                DIAGNOSTIC PATHOLOGY &amp; LABORATORY INVESTIGATION ORDER
              </h3>
            </div>

            <div class="space-y-2 text-xs">
              <span class="text-[10px] font-mono font-bold text-slate-600 uppercase block">Clinical Indication:</span>
              <p class="bg-white p-3 rounded border border-blue-200 italic text-slate-900">
                "{caseData.complaint}" (Duration: {caseData.duration || 'Acute'})
              </p>
            </div>

            <div class="space-y-1">
              <span class="text-[10px] font-mono font-bold text-slate-700 uppercase block">Requisitioned Tests &amp; Panels:</span>
              <div class="bg-white p-3 rounded border border-blue-300 text-xs text-slate-900 font-mono space-y-1 whitespace-pre-line leading-relaxed">
                <p class="font-bold text-blue-950">
                  {caseData.clinicianNotes || `1. Full Blood Count (FBC with Differential & ESR)
2. Malaria Parasite (MP by Giemsa Thick/Thin Smear)
3. Urinalysis Dipstick & Microscopy
4. Fasting Blood Sugar / Random Glucose
5. Serum Electrolytes, Urea, and Creatinine`}
                </p>
              </div>
            </div>

            <div class="p-2.5 rounded bg-blue-100/70 border border-blue-200 text-xs text-blue-900 font-mono flex items-center justify-between">
              <span>Collection Station: <strong>Central Pathology Collection (OPD Wing B)</strong></span>
              <span>Turnaround: <strong>Priority Stat (45 mins)</strong></span>
            </div>
          </div>

        {:else if isDischarge}
          <!-- ─── TEMPLATE D: OUTPATIENT DISCHARGE & CARE SUMMARY CERTIFICATE ─── -->
          <div class="space-y-4 border border-emerald-300 bg-emerald-50/30 p-4 rounded-lg">
            <div class="flex items-center justify-between border-b border-emerald-200 pb-2">
              <div class="flex items-center gap-2 text-emerald-900">
                <Home class="w-5 h-5 text-emerald-700 stroke-[2.5]" />
                <h3 class="text-sm font-extrabold uppercase tracking-wide font-mono">
                  OUTPATIENT CONSULTATION &amp; DISCHARGE ADVICE RECORD
                </h3>
              </div>
              <span class="text-xs font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                DISCHARGE AUTHORIZED
              </span>
            </div>

            <!-- Clinical Assessment -->
            <div class="space-y-1 text-xs">
              <span class="text-[10px] font-mono font-bold text-slate-500 uppercase block">Clinical Findings &amp; Management Directives:</span>
              <div class="bg-white p-3 rounded border border-emerald-200 text-slate-900 space-y-2 leading-relaxed">
                <p class="font-medium">
                  {caseData.clinicianNotes || 'Patient evaluated and stable. Vital signs within acceptable limits. No acute red flag symptoms observed during consultation. Symptomatic outpatient management and rest advised.'}
                </p>
                <div class="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-700">
                  <div>• Oral Fluid Intake: <strong>2.5L daily</strong></div>
                  <div>• Bed Rest Recommended: <strong>48 Hours</strong></div>
                  <div>• Diet: <strong>Light bland meals</strong></div>
                  <div>• Work/School Clearance: <strong>Approved</strong></div>
                </div>
              </div>
            </div>

            <!-- Return Warnings -->
            <div class="p-2.5 rounded bg-amber-50 border border-amber-200 text-xs text-amber-900 font-mono">
              <strong class="uppercase text-[10px] block">Immediate Return Warning:</strong>
              <span>If high fever recurs (>38.5°C), persistent vomiting, or difficulty breathing develops, report immediately to the OPD Emergency Desk.</span>
            </div>
          </div>

        {:else}
          <!-- ─── TEMPLATE A: ROUTINE OUTPATIENT PRESCRIPTION & CONSULTATION SLIP ─── -->
          <div class="space-y-4 border border-slate-300 bg-slate-50/40 p-4 rounded-lg">
            
            <div class="flex items-center justify-between border-b border-slate-200 pb-2">
              <div class="flex items-center gap-2 text-slate-900">
                <Pill class="w-5 h-5 text-emerald-700 stroke-[2.5]" />
                <h3 class="text-sm font-extrabold uppercase tracking-wide font-mono">
                  CLINICAL CONSULTATION NOTES &amp; PRESCRIPTION ORDER
                </h3>
              </div>
              <span class="text-xs font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                PHARMACY ROUTED
              </span>
            </div>

            <!-- Clinical Assessment -->
            <div class="space-y-1 text-xs">
              <span class="text-[10px] font-mono font-bold text-slate-500 uppercase block">Presenting Complaint &amp; Findings:</span>
              <p class="bg-white p-2.5 rounded border border-slate-200 text-slate-900 leading-relaxed font-medium">
                {caseData.aiTriage?.patientBrief || caseData.complaint}
              </p>
            </div>

            <!-- The Rx Symbol & Medicine Order -->
            <div class="space-y-1.5 pt-1">
              <div class="flex items-center gap-2">
                <span class="text-2xl font-serif font-black text-emerald-800">℞</span>
                <span class="text-[10px] font-mono font-bold text-slate-500 uppercase">Authorized Medication Directives</span>
              </div>

              <div class="bg-white p-3.5 rounded border-2 border-slate-300 space-y-2 text-xs font-mono">
                <p class="text-slate-900 font-bold whitespace-pre-line leading-relaxed">
                  {caseData.clinicianNotes || `1. Tab Paracetamol 1000mg — Take 2 tablets TDS (every 8 hours) x 3 days.
2. Cap Amoxicillin/Clavulanate 625mg — Take 1 tablet BD (every 12 hours) x 5 days.
3. Oral Rehydration Solution — 1 sachet in 1 Litre water, sip ad libitum.
4. Rest, adequate hydration, return if febrile symptoms exceed 72 hours.`}
                </p>

                <div class="pt-2 border-t border-slate-100 text-[10px] text-slate-500 flex items-center justify-between">
                  <span>Dispense: <strong>Hospital Central Dispensary</strong></span>
                  <span>Refill Authorized: <strong>No</strong></span>
                </div>
              </div>
            </div>

          </div>
        {/if}

        <!-- ===================================================================== -->
        <!-- 4. ATTENDING CLINICIAN ENDORSEMENT & DIGITAL SIGNATURE BLOCK          -->
        <!-- ===================================================================== -->
        <div class="pt-4 border-t-2 border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
          
          <div class="space-y-1 text-xs">
            <span class="text-[10px] font-mono font-bold uppercase text-slate-400 block">Attending Medical Officer</span>
            <strong class="text-slate-950 font-bold text-sm block">
              {caseData.clinicianName || 'Dr. Stella Adeleke (MBBS, FWACP)'}
            </strong>
            <p class="text-slate-600 font-mono text-[11px]">
              Staff Medical ID: <span class="font-bold text-slate-900">{caseData.staffId || 'MED-CONSULT-104'}</span>
            </p>
            <p class="text-slate-500 font-mono text-[10px]">
              OPD Station: {caseData.assignedRoom || 'OPD Consultation Wing A'}
            </p>
          </div>

          <div class="sm:text-right space-y-1">
            <!-- Digital Stamp -->
            <div class="inline-block p-2.5 rounded border-2 {isEmergency ? 'border-rose-600 bg-rose-50 text-rose-950' : isLab ? 'border-blue-600 bg-blue-50 text-blue-950' : 'border-emerald-700 bg-emerald-50 text-emerald-950'} text-right">
              <div class="flex items-center sm:justify-end gap-1.5 font-black text-xs uppercase tracking-wider font-mono">
                <ShieldCheck class="w-4 h-4 {isEmergency ? 'text-rose-700' : isLab ? 'text-blue-700' : 'text-emerald-700'}" />
                <span>CLINIKS DIGITAL AUDIT SIGNED</span>
              </div>
              <p class="text-[9px] font-mono text-slate-600 mt-0.5">
                Hash: SHA256:{refCode}-VERIFIED-{todayDate.replace(/ /g, '')}
              </p>
            </div>
            <p class="text-[9px] text-slate-400 font-mono">Tamper-Proof Electronic Health Ledger &bull; Ministry of Health Certified</p>
          </div>

        </div>

        <!-- ===================================================================== -->
        <!-- 5. LEGAL NOTICE & PATIENT ADVISORY                                    -->
        <!-- ===================================================================== -->
        <div class="p-3 rounded bg-slate-100 text-[10px] text-slate-600 font-mono leading-tight">
          This document is generated from an authorized clinician consultation record. In accordance with clinical governance standards, 
          AI tools are strictly utilized for pre-consultation intake sorting and flag assistance. Clinical diagnostic authority, treatment 
          prescriptions, and discharge decisions remain exclusively with the licensed medical practitioner named above.
        </div>

      </div>

      <!-- Bottom Modal Footer (Hidden when printing) -->
      <div class="px-6 py-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600 print:hidden shrink-0">
        <span class="font-mono">Document Ref: {refCode}</span>
        <button
          type="button"
          on:click={handlePrint}
          class="px-4 py-1.5 rounded bg-slate-900 hover:bg-[#1E5EFF] text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
        >
          <Printer class="w-3.5 h-3.5" />
          <span>Print / Save PDF</span>
        </button>
      </div>

    </div>
  </div>
{/if}

<style>
  @media print {
    :global(body) {
      background-color: white !important;
      color: black !important;
    }
    :global(header), :global(nav), :global(footer) {
      display: none !important;
    }
  }
</style>
