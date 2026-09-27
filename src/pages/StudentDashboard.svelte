<script>
  import { clinicStore } from '../stores/clinicStore.js';
  import QueueStatusCard from '../components/organisms/QueueStatusCard.svelte';
  import StudentIntakeWizard from '../components/organisms/StudentIntakeWizard.svelte';
  import { ShieldCheck, LogOut, ClipboardList } from 'lucide-svelte';

  $: currentUser = $clinicStore.currentUser;
  $: patient = currentUser?.profile || {};
  $: activeAppointment = $clinicStore.activePatientAppointment;

  // After intake is submitted show queue status, otherwise show the intake wizard
  $: showQueue = !!activeAppointment;
</script>

<div class="space-y-6 sm:space-y-8 max-w-2xl mx-auto">

  <!-- ── HEADER ── -->
  <div class="relative overflow-hidden rounded-2xl sm:rounded-3xl p-5 sm:p-7 bg-gradient-to-br from-emerald-950 via-teal-950 to-slate-950 text-white border border-emerald-800/40 shadow-sm">
    <div class="relative z-10 flex items-start justify-between gap-4">
      <div class="space-y-1.5">
        <div class="flex items-center gap-2.5 flex-wrap">
          <h2 class="text-2xl sm:text-3xl font-extrabold tracking-tight">{patient.name || 'Patient'}</h2>
          <span class="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 inline-flex items-center gap-1.5">
            <ShieldCheck class="w-3.5 h-3.5 stroke-[2.5]" />
            OPD Registered
          </span>
        </div>

        <!-- Patient identifiers -->
        <div class="flex flex-wrap gap-2 pt-1 text-xs text-emerald-100">
          {#if patient.hospitalCardNo}
            <span class="bg-white/10 px-2.5 py-1 rounded-lg border border-white/15">
              Card No: <strong class="text-white">{patient.hospitalCardNo}</strong>
            </span>
          {/if}
          {#if patient.age}
            <span class="bg-white/10 px-2.5 py-1 rounded-lg border border-white/15">
              Age: <strong class="text-white">{patient.age}</strong>
            </span>
          {/if}
          {#if patient.gender}
            <span class="bg-white/10 px-2.5 py-1 rounded-lg border border-white/15">
              <strong class="text-white">{patient.gender}</strong>
            </span>
          {/if}
        </div>

        <p class="text-xs text-emerald-200/70 font-medium pt-0.5">
          {showQueue ? 'Your pre-consultation intake has been submitted.' : 'Please complete your pre-consultation intake below.'}
        </p>
      </div>

      <!-- Logout -->
      <button
        type="button"
        on:click={() => clinicStore.logout()}
        class="shrink-0 flex items-center gap-1.5 text-xs font-semibold text-emerald-300 hover:text-white transition-colors cursor-pointer"
      >
        <LogOut class="w-4 h-4" />
        <span class="hidden sm:inline">Exit</span>
      </button>
    </div>
  </div>

  <!-- ── STEP INDICATOR ── -->
  <div class="flex items-center gap-3">
    <!-- Step 1 -->
    <div class="flex items-center gap-2">
      <span class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black {showQueue ? 'bg-emerald-600 text-white' : 'bg-emerald-600 text-white'}">
        {showQueue ? '✓' : '1'}
      </span>
      <span class="text-xs font-bold {showQueue ? 'text-emerald-700' : 'text-slate-900'}">Pre-Consultation Intake</span>
    </div>
    <div class="flex-1 h-0.5 {showQueue ? 'bg-emerald-400' : 'bg-slate-200'} rounded-full"></div>
    <!-- Step 2 -->
    <div class="flex items-center gap-2">
      <span class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black {showQueue ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-400'}">
        2
      </span>
      <span class="text-xs font-bold {showQueue ? 'text-slate-900' : 'text-slate-400'}">Queue Status</span>
    </div>
    <div class="flex-1 h-0.5 bg-slate-200 rounded-full"></div>
    <!-- Step 3 -->
    <div class="flex items-center gap-2">
      <span class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black bg-slate-200 text-slate-400">3</span>
      <span class="text-xs font-bold text-slate-400">Consultation</span>
    </div>
  </div>

  <!-- ── MAIN CONTENT: Queue Status OR Intake Wizard ── -->
  {#if showQueue}
    <!-- Queue Status (after intake submitted) -->
    <QueueStatusCard appointment={activeAppointment} />
  {:else}
    <!-- Intake Wizard (before submission) -->
    <StudentIntakeWizard
      studentProfile={patient}
      on:submitted={() => {}}
    />
  {/if}

</div>
