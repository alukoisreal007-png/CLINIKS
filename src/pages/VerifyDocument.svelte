<script>
  import { onMount } from 'svelte';
  import { verifyDocument, SAMPLE_CODES } from '../lib/verification.js';
  import { clinicStore } from '../stores/clinicStore.js';
  import { 
    ShieldCheck, 
    ShieldAlert, 
    Search, 
    FileText, 
    CheckCircle2, 
    AlertTriangle, 
    Printer, 
    ArrowLeft, 
    QrCode, 
    Lock, 
    Clock, 
    Building2, 
    UserCheck,
    Hash
  } from 'lucide-svelte';

  let inputCode = 'CLIN-RX-2026-0814';
  let searchResult = null;
  let hasSearched = false;

  onMount(() => {
    // Perform initial verification with default code
    performVerification();
  });

  function performVerification() {
    if (!inputCode.trim()) return;
    searchResult = verifyDocument(inputCode.trim());
    hasSearched = true;
  }

  function handleSelectSample(code) {
    inputCode = code;
    performVerification();
  }

  function handlePrintCertificate() {
    window.print();
  }

  function goHome() {
    clinicStore.setTab('HOME');
  }
</script>

<div class="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
  <div class="max-w-4xl mx-auto space-y-8">
    
    <!-- Top Nav / Back -->
    <div class="flex items-center justify-between">
      <button
        type="button"
        on:click={goHome}
        class="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
      >
        <ArrowLeft class="w-4 h-4" />
        <span>Return to Homepage</span>
      </button>

      <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-blue-50 text-[#0F172A] border border-blue-200">
        <Lock class="w-3.5 h-3.5 text-[#699FDF]" />
        <span>Public Verification Service</span>
      </span>
    </div>

    <!-- Header Section -->
    <div class="text-center space-y-3">
      <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#0F172A] text-[#699FDF] shadow-md border border-slate-700 mx-auto">
        <ShieldCheck class="w-8 h-8" />
      </div>
      <h1 class="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
        Document Verification Portal
      </h1>
      <p class="text-sm sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
        Confirm the authentic clinician signature, issuing hospital OPD, and cryptographic validity of any CLINIKS medical slip or report.
      </p>
    </div>

    <!-- Search Input Box -->
    <div class="bg-white rounded-2xl border border-slate-200 p-5 sm:p-7 shadow-sm space-y-5">
      <form on:submit|preventDefault={performVerification} class="space-y-4">
        <label for="doc-code" class="block text-xs font-bold text-slate-700 uppercase tracking-wider">
          Enter Reference Number or SHA-256 Digest
        </label>
        
        <div class="flex flex-col sm:flex-row gap-3">
          <div class="relative flex-1">
            <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search class="w-5 h-5" />
            </div>
            <input
              id="doc-code"
              type="text"
              bind:value={inputCode}
              placeholder="e.g. CLIN-RX-2026-0814 or SHA256:MED-OPD-782910..."
              class="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 focus:border-[#699FDF] focus:ring-2 focus:ring-[#699FDF]/20 outline-none text-sm font-mono transition-all text-slate-900 bg-slate-50/50"
            />
          </div>
          
          <button
            type="submit"
            class="px-7 py-3 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white font-bold text-sm transition-all cursor-pointer inline-flex items-center justify-center gap-2 shadow-sm"
          >
            <span>Verify Document</span>
          </button>
        </div>
      </form>

      <!-- Sample Quick Chips -->
      <div class="pt-4 border-t border-slate-100 space-y-2">
        <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
          Quick Test Verification Codes (Section 4 & 9):
        </span>
        <div class="flex flex-wrap gap-2">
          <button
            type="button"
            on:click={() => handleSelectSample(SAMPLE_CODES.RX)}
            class="px-2.5 py-1 rounded-lg text-xs font-mono font-medium bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors cursor-pointer"
          >
            Prescription Slip (Rx)
          </button>
          <button
            type="button"
            on:click={() => handleSelectSample(SAMPLE_CODES.REFERRAL)}
            class="px-2.5 py-1 rounded-lg text-xs font-mono font-medium bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-colors cursor-pointer"
          >
            Emergency Referral
          </button>
          <button
            type="button"
            on:click={() => handleSelectSample(SAMPLE_CODES.LAB)}
            class="px-2.5 py-1 rounded-lg text-xs font-mono font-medium bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition-colors cursor-pointer"
          >
            Laboratory Order
          </button>
          <button
            type="button"
            on:click={() => handleSelectSample(SAMPLE_CODES.DISCHARGE)}
            class="px-2.5 py-1 rounded-lg text-xs font-mono font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer"
          >
            Discharge Summary
          </button>
          <button
            type="button"
            on:click={() => handleSelectSample(SAMPLE_CODES.CONSULTATION)}
            class="px-2.5 py-1 rounded-lg text-xs font-mono font-medium bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            Attendance Report (SHA256)
          </button>
          <button
            type="button"
            on:click={() => handleSelectSample(SAMPLE_CODES.TAMPERED)}
            class="px-2.5 py-1 rounded-lg text-xs font-mono font-medium bg-amber-50 text-[#D97706] border border-amber-300 hover:bg-amber-100 transition-colors cursor-pointer"
          >
            Simulate Tampered Slip
          </button>
        </div>
      </div>
    </div>

    <!-- Verification Result -->
    {#if hasSearched && searchResult}
      {#if searchResult.isValid}
        <!-- POSITIVE VERIFICATION CARD -->
        <div class="bg-white rounded-2xl border-2 border-emerald-500/60 shadow-lg p-6 sm:p-8 space-y-6 relative overflow-hidden">
          
          <!-- Top Authenticity Banner -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <CheckCircle2 class="w-7 h-7" />
              </div>
              <div>
                <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-wider">
                  Authentic &amp; Verified
                </div>
                <h3 class="text-xl font-black text-slate-900 mt-1">{searchResult.documentType}</h3>
                <p class="text-xs text-slate-500 font-mono mt-0.5">Ref: {searchResult.referenceCode}</p>
              </div>
            </div>

            <button
              type="button"
              on:click={handlePrintCertificate}
              class="px-4 py-2 rounded-xl border border-slate-300 hover:border-slate-400 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all inline-flex items-center gap-2 cursor-pointer self-start sm:self-auto"
            >
              <Printer class="w-4 h-4" />
              <span>Print Certificate</span>
            </button>
          </div>

          <!-- Document Metadata Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span class="text-slate-400 uppercase font-mono text-[10px] block">Attending Clinician</span>
              <div class="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <UserCheck class="w-4 h-4 text-[#699FDF]" />
                <span>{searchResult.clinicianName}</span>
              </div>
              <p class="text-[11px] text-slate-500 font-mono">{searchResult.clinicianRegNo}</p>
            </div>

            <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span class="text-slate-400 uppercase font-mono text-[10px] block">Issuing Healthcare Facility</span>
              <div class="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <Building2 class="w-4 h-4 text-[#699FDF]" />
                <span>{searchResult.facility}</span>
              </div>
              <p class="text-[11px] text-slate-500">Government Outpatient Directorate</p>
            </div>

            <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span class="text-slate-400 uppercase font-mono text-[10px] block">Signing Timestamp</span>
              <div class="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <Clock class="w-4 h-4 text-[#699FDF]" />
                <span>{searchResult.signedAt}</span>
              </div>
              <p class="text-[11px] text-slate-500 font-mono">UTC+01:00 (West Africa Time)</p>
            </div>
          </div>

          <!-- Patient Identity Mask (Privacy Preservation) -->
          <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div class="space-y-0.5">
              <span class="text-slate-400 uppercase font-mono text-[10px] block">Patient Confidentiality Shield</span>
              <div class="text-slate-900 font-bold">
                Patient: <span class="font-mono text-slate-700">{searchResult.patientName}</span> &bull; Card: <span class="font-mono text-slate-700">{searchResult.hospitalCardNo}</span>
              </div>
            </div>
            <span class="text-[11px] text-slate-500 italic">
              * Names partially masked in compliance with patient data privacy.
            </span>
          </div>

          <!-- Clinical Outcome / Directives -->
          <div class="p-4 rounded-xl bg-blue-50/70 border border-blue-200 space-y-2 text-xs">
            <span class="font-bold text-[#0F172A] block uppercase font-mono text-[11px]">Certified Clinical Directive:</span>
            <p class="text-slate-800 leading-relaxed font-medium">
              {searchResult.actionNotes}
            </p>
          </div>

          <!-- Cryptographic Digest Stamp -->
          <div class="pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11px] text-slate-500 font-mono">
            <div class="flex items-center gap-2">
              <Hash class="w-4 h-4 text-slate-400" />
              <span class="break-all">{searchResult.sha256Hash}</span>
            </div>
            <div class="px-2.5 py-1 rounded bg-slate-100 border border-slate-200 font-bold text-slate-700 uppercase tracking-widest shrink-0">
              SHA-256 MATCHED
            </div>
          </div>

        </div>
      {:else}
        <!-- NEGATIVE / TAMPERED WARNING CARD -->
        <div class="bg-red-50 rounded-2xl border-2 border-[#DC2626] p-6 sm:p-8 space-y-5 text-[#DC2626]">
          <div class="flex items-start gap-4">
            <div class="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
              <ShieldAlert class="w-7 h-7 text-[#DC2626]" />
            </div>
            <div class="space-y-1">
              <h3 class="text-xl font-black text-red-900">Unverified or Tampered Record</h3>
              <p class="text-xs text-red-700 font-mono">Provided Reference: {searchResult.referenceCode || inputCode}</p>
            </div>
          </div>

          <p class="text-sm text-red-800 leading-relaxed font-medium">
            {searchResult.reason}
          </p>

          <div class="p-4 rounded-xl bg-white/80 border border-red-200 text-xs text-slate-700 space-y-1.5 leading-relaxed">
            <div class="font-bold text-red-900">Verification Protocol Notice:</div>
            <p>
              Under the Federal Ministry of Health Clinical Governance standard, all legitimate medical reports and slips issued by attending clinicians at General Hospital OPD must carry a valid cryptographic hash matching our registered consultation ledger.
            </p>
          </div>
        </div>
      {/if}
    {/if}

  </div>
</div>
