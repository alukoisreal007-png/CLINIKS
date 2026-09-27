<script>
  import { clinicStore } from '../stores/clinicStore.js';
  import QuickVitalsModal from '../components/organisms/QuickVitalsModal.svelte';
  import { 
    HeartPulse, 
    Thermometer, 
    Activity, 
    Search, 
    Filter, 
    Clock, 
    CheckCircle2, 
    AlertTriangle, 
    UserCheck, 
    ArrowRight,
    Sparkles,
    ShieldAlert,
    Stethoscope
  } from 'lucide-svelte';

  let searchQuery = '';
  let filterStatus = 'ALL'; // 'ALL' | 'PENDING_VITALS' | 'VITALS_RECORDED' | 'CRITICAL'
  let activeVitalsPatient = null;

  $: queue = $clinicStore.triageQueue || [];

  // Vitals Metrics
  $: awaitingCount = queue.filter(p => !p.vitalsRecorded).length;
  $: completedCount = queue.filter(p => p.vitalsRecorded).length;
  $: criticalCount = queue.filter(p => p.vitals?.hasCriticalVital || p.aiTriage?.suggestedPriority === 'HIGH').length;

  // Filtered Queue
  $: filteredQueue = queue.filter(patient => {
    // Search match
    const q = searchQuery.toLowerCase().trim();
    const matchSearch = !q || 
      patient.patientName?.toLowerCase().includes(q) ||
      patient.hospitalCardNo?.toLowerCase().includes(q) ||
      patient.queueNo?.includes(q) ||
      patient.complaint?.toLowerCase().includes(q);

    if (!matchSearch) return false;

    // Filter status match
    if (filterStatus === 'PENDING_VITALS') return !patient.vitalsRecorded;
    if (filterStatus === 'VITALS_RECORDED') return !!patient.vitalsRecorded;
    if (filterStatus === 'CRITICAL') return patient.vitals?.hasCriticalVital || patient.aiTriage?.suggestedPriority === 'HIGH';

    return true;
  });

  function openVitalsModal(patient) {
    activeVitalsPatient = patient;
  }

  function closeVitalsModal() {
    activeVitalsPatient = null;
  }

  function markReadyForDoctor(patientId) {
    clinicStore.update(state => ({
      ...state,
      triageQueue: state.triageQueue.map(p => p.id === patientId ? { ...p, readyForDoctor: true } : p),
      systemNotification: {
        type: 'success',
        message: 'Patient marked ready. Attending physician queue notified.'
      }
    }));
  }

  function goToClinicianHub() {
    clinicStore.setTab('CLINICIAN_DASHBOARD');
  }
</script>

<div class="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
  <div class="max-w-7xl mx-auto space-y-6">

    <!-- Top Persistent Station Banner (Midnight Blue) -->
    <div class="bg-[#0F172A] text-white rounded-2xl p-6 sm:p-7 shadow-md border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
      <div class="space-y-2">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-[#699FDF] text-xs font-mono font-bold border border-[#699FDF]/30">
          <HeartPulse class="w-3.5 h-3.5" />
          <span>Stage 3 &bull; Outpatient Nursing Triage Station</span>
        </div>
        <h1 class="text-2xl sm:text-3xl font-black tracking-tight text-white">
          OPD Vital Signs &amp; Triage Station
        </h1>
        <p class="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
          Records blood pressure, temperature, pulse rate, oxygen saturation, and body weight before the patient enters the consultation room.
        </p>
      </div>

      <!-- Quick Link to Doctor Hub -->
      <div class="flex items-center gap-3 shrink-0">
        <button
          type="button"
          on:click={goToClinicianHub}
          class="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all inline-flex items-center gap-2 cursor-pointer"
        >
          <Stethoscope class="w-4 h-4 text-[#699FDF]" />
          <span>Open Doctor's Hub</span>
        </button>
      </div>
    </div>

    <!-- Metrics Cards (High Information Density) -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      
      <!-- Card 1: Awaiting Vitals (Warm Ochre) -->
      <div class="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-1">
        <div class="flex items-center justify-between">
          <span class="text-[11px] font-bold uppercase font-mono text-slate-400">Awaiting Vitals</span>
          <span class="w-2.5 h-2.5 rounded-full bg-[#D97706] animate-pulse"></span>
        </div>
        <div class="text-3xl font-black text-[#D97706]">{awaitingCount}</div>
        <p class="text-[11px] text-slate-500">Patients in waiting bay</p>
      </div>

      <!-- Card 2: Vitals Completed (Clinical Blue) -->
      <div class="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-1">
        <div class="flex items-center justify-between">
          <span class="text-[11px] font-bold uppercase font-mono text-slate-400">Vitals Recorded</span>
          <CheckCircle2 class="w-4 h-4 text-[#699FDF]" />
        </div>
        <div class="text-3xl font-black text-[#699FDF]">{completedCount}</div>
        <p class="text-[11px] text-slate-500">Sent to doctor's queue</p>
      </div>

      <!-- Card 3: Critical Red Flag Vitals (Ruby Red) -->
      <div class="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-1">
        <div class="flex items-center justify-between">
          <span class="text-[11px] font-bold uppercase font-mono text-slate-400">Critical / Urgent</span>
          <ShieldAlert class="w-4 h-4 text-[#DC2626]" />
        </div>
        <div class="text-3xl font-black text-[#DC2626]">{criticalCount}</div>
        <p class="text-[11px] text-slate-500">Fast-track required</p>
      </div>

      <!-- Card 4: Triage Efficiency (Thesis Benchmark) -->
      <div class="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-1">
        <div class="flex items-center justify-between">
          <span class="text-[11px] font-bold uppercase font-mono text-slate-400">Average Intake</span>
          <Clock class="w-4 h-4 text-[#699FDF]" />
        </div>
        <div class="text-3xl font-black text-slate-900">2.8 min</div>
        <p class="text-[11px] text-emerald-600 font-medium">vs 35.4m manual baseline</p>
      </div>

    </div>

    <!-- Search & Filter Controls -->
    <div class="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
      
      <!-- Search Input -->
      <div class="relative w-full md:w-80">
        <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Search class="w-4 h-4" />
        </div>
        <input
          type="text"
          bind:value={searchQuery}
          placeholder="Search by patient, card #, or complaint..."
          class="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 focus:border-[#699FDF] focus:ring-1 focus:ring-[#699FDF] text-xs outline-none text-slate-900 bg-slate-50/50"
        />
      </div>

      <!-- Filter Buttons -->
      <div class="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
        <button
          type="button"
          on:click={() => filterStatus = 'ALL'}
          class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer {filterStatus === 'ALL' ? 'bg-[#0F172A] text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}"
        >
          All ({queue.length})
        </button>
        <button
          type="button"
          on:click={() => filterStatus = 'PENDING_VITALS'}
          class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer {filterStatus === 'PENDING_VITALS' ? 'bg-[#D97706] text-white' : 'bg-amber-50 hover:bg-amber-100 text-[#D97706] border border-amber-200'}"
        >
          Awaiting Vitals ({awaitingCount})
        </button>
        <button
          type="button"
          on:click={() => filterStatus = 'VITALS_RECORDED'}
          class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer {filterStatus === 'VITALS_RECORDED' ? 'bg-[#699FDF] text-white' : 'bg-blue-50 hover:bg-blue-100 text-[#699FDF] border border-blue-200'}"
        >
          Recorded ({completedCount})
        </button>
        <button
          type="button"
          on:click={() => filterStatus = 'CRITICAL'}
          class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer {filterStatus === 'CRITICAL' ? 'bg-[#DC2626] text-white' : 'bg-red-50 hover:bg-red-100 text-[#DC2626] border border-red-200'}"
        >
          Critical ({criticalCount})
        </button>
      </div>

    </div>

    <!-- Triage Table -->
    <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-100/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">
              <th class="py-3 px-4">Queue #</th>
              <th class="py-3 px-4">Patient Information</th>
              <th class="py-3 px-4">Chief Complaint</th>
              <th class="py-3 px-4">Priority Flag</th>
              <th class="py-3 px-4">Vital Signs Status</th>
              <th class="py-3 px-4 text-right">Triage Action</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-xs">
            {#each filteredQueue as patient (patient.id)}
              <tr class="hover:bg-blue-50/30 transition-colors {patient.vitals?.hasCriticalVital ? 'bg-red-50/20' : ''}">
                
                <!-- Queue # -->
                <td class="py-3.5 px-4 font-mono font-black text-slate-900 text-sm">
                  #{patient.queueNo}
                </td>

                <!-- Patient Details -->
                <td class="py-3.5 px-4">
                  <div class="font-bold text-slate-900 text-sm">{patient.patientName}</div>
                  <div class="text-[11px] text-slate-500 font-mono mt-0.5">
                    {patient.hospitalCardNo} &bull; {patient.age} yrs ({patient.gender})
                  </div>
                </td>

                <!-- Complaint -->
                <td class="py-3.5 px-4 max-w-xs">
                  <div class="line-clamp-2 text-slate-700 leading-relaxed font-medium">
                    "{patient.complaint}"
                  </div>
                  <div class="text-[10px] text-slate-400 mt-1">
                    Pain: <strong class="text-slate-700">{patient.painScale}/10</strong> &bull; {patient.duration}
                  </div>
                </td>

                <!-- Priority -->
                <td class="py-3.5 px-4">
                  {#if patient.aiTriage?.suggestedPriority === 'HIGH'}
                    <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-red-100 text-[#DC2626] border border-red-300">
                      Emergency
                    </span>
                  {:else if patient.aiTriage?.suggestedPriority === 'MODERATE'}
                    <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-[#D97706] border border-amber-300">
                      Moderate
                    </span>
                  {:else}
                    <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-slate-100 text-slate-700 border border-slate-200">
                      Routine
                    </span>
                  {/if}
                </td>

                <!-- Vitals Summary Badges -->
                <td class="py-3.5 px-4">
                  {#if patient.vitalsRecorded && patient.vitals}
                    <div class="space-y-1">
                      <div class="flex flex-wrap items-center gap-1 font-mono text-[11px]">
                        <span class="px-1.5 py-0.5 rounded {patient.vitals.hasCriticalVital ? 'bg-red-100 text-red-800 font-bold' : 'bg-slate-100 text-slate-800 font-semibold'}">
                          BP: {patient.vitals.bp}
                        </span>
                        <span class="px-1.5 py-0.5 rounded {patient.vitals.temperature >= 37.8 ? 'bg-amber-100 text-amber-900 font-bold' : 'bg-slate-100 text-slate-800'}">
                          {patient.vitals.temperature}°C {patient.vitals.temperature >= 37.8 ? '🔥' : ''}
                        </span>
                        <span class="px-1.5 py-0.5 rounded {patient.vitals.spo2 <= 94 ? 'bg-red-100 text-red-800 font-bold' : 'bg-slate-100 text-slate-800'}">
                          {patient.vitals.spo2}% SpO2
                        </span>
                        <span class="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                          {patient.vitals.pulse} bpm
                        </span>
                      </div>
                      <div class="text-[10px] text-slate-400">
                        By {patient.vitals.nurseName?.split(' ')[0]} at {patient.vitals.recordedAt}
                      </div>
                    </div>
                  {:else}
                    <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-[#D97706] border border-amber-300">
                      <span class="w-1.5 h-1.5 rounded-full bg-[#D97706] animate-ping"></span>
                      <span>Pending Vitals Intake</span>
                    </span>
                  {/if}
                </td>

                <!-- Action Button -->
                <td class="py-3.5 px-4 text-right">
                  {#if !patient.vitalsRecorded}
                    <button
                      type="button"
                      on:click={() => openVitalsModal(patient)}
                      class="px-4 py-2 rounded-xl bg-[#699FDF] hover:bg-[#5289CC] text-white font-bold text-xs shadow-xs transition-all cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <Activity class="w-3.5 h-3.5" />
                      <span>Take Vitals</span>
                    </button>
                  {:else}
                    <div class="inline-flex items-center gap-2">
                      <button
                        type="button"
                        on:click={() => openVitalsModal(patient)}
                        class="px-3 py-1.5 rounded-lg border border-slate-300 hover:border-slate-400 bg-white text-slate-700 font-medium text-xs transition-colors cursor-pointer"
                      >
                        Edit
                      </button>

                      {#if !patient.readyForDoctor}
                        <button
                          type="button"
                          on:click={() => markReadyForDoctor(patient.id)}
                          class="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors cursor-pointer inline-flex items-center gap-1"
                        >
                          <CheckCircle2 class="w-3.5 h-3.5" />
                          <span>Ready</span>
                        </button>
                      {:else}
                        <span class="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                          With Doctor
                        </span>
                      {/if}
                    </div>
                  {/if}
                </td>

              </tr>
            {:else}
              <tr>
                <td colspan="6" class="py-12 text-center text-slate-400 space-y-2">
                  <HeartPulse class="w-8 h-8 text-slate-300 mx-auto" />
                  <p class="font-medium text-sm">No patients found matching the selected filter.</p>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>

  </div>
</div>

<!-- Active Modal -->
{#if activeVitalsPatient}
  <QuickVitalsModal
    patient={activeVitalsPatient}
    on:close={closeVitalsModal}
  />
{/if}
