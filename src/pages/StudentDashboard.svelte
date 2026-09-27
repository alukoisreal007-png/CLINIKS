<script>
  import { clinicStore } from '../stores/clinicStore.js';
  import QueueStatusCard from '../components/organisms/QueueStatusCard.svelte';
  import BookConsultant from './BookConsultant.svelte';
  import { ShieldCheck, LogOut, User, Activity, Clock } from 'lucide-svelte';

  $: currentUser = $clinicStore.currentUser;
  $: patient = currentUser?.profile || {};
  $: activeAppointment = $clinicStore.activePatientAppointment;

  // After intake is submitted show queue status, otherwise show the clean single-column intake form
  $: showQueue = !!activeAppointment;

  function handleStartNewIntake() {
    clinicStore.update(s => ({ ...s, activePatientAppointment: null }));
  }
</script>

<div class="space-y-6 max-w-3xl mx-auto font-sans text-slate-900 py-4">

  <!-- Top Patient Header (Calm Medical Standard) -->
  <div class="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs flex items-center justify-between gap-4">
    <div class="flex items-center gap-3.5">
      <div class="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg border border-blue-200 shrink-0">
        <User class="w-6 h-6 text-blue-600" />
      </div>
      <div>
        <div class="flex items-center gap-2 flex-wrap">
          <h2 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {patient.name || 'Outpatient Portal'}
          </h2>
          <span class="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1 font-mono">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
            OPD Enrolled
          </span>
        </div>
        <p class="text-xs text-slate-500 font-mono mt-0.5">
          Card: <strong class="text-slate-800">{patient.hospitalCardNo || 'GH-2026-00831'}</strong> &bull;
          Age: <strong class="text-slate-800">{patient.age || 'Adult'}</strong> &bull;
          Gender: <strong class="text-slate-800">{patient.gender || 'Female'}</strong>
        </p>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex items-center gap-2">
      {#if showQueue}
        <button
          type="button"
          on:click={handleStartNewIntake}
          class="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
        >
          New Intake
        </button>
      {/if}
      <button
        type="button"
        on:click={() => clinicStore.logout()}
        class="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer flex items-center gap-1"
      >
        <LogOut class="w-3.5 h-3.5" />
        <span class="hidden sm:inline">Exit</span>
      </button>
    </div>
  </div>

  <!-- ── 4-STAGE PIPELINE INDICATOR ── -->
  <div class="grid grid-cols-4 gap-2 text-center text-xs font-mono">
    <div class="p-2 rounded-xl border {showQueue ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-bold' : 'bg-blue-50 border-blue-400 text-blue-900 font-black ring-1 ring-blue-400'}">
      <span class="block text-[10px] text-slate-400">1. Intake</span>
      <span>{showQueue ? '✓ Submitted' : 'In Progress'}</span>
    </div>
    <div class="p-2 rounded-xl border {showQueue ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-bold' : 'bg-slate-50 border-slate-200 text-slate-400'}">
      <span class="block text-[10px] text-slate-400">2. AI Brief</span>
      <span>{showQueue ? '✓ Structured' : 'Pending'}</span>
    </div>
    <div class="p-2 rounded-xl border {activeAppointment?.scheduledTime ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-bold' : (showQueue ? 'bg-amber-50 border-amber-300 text-amber-900 font-bold animate-pulse' : 'bg-slate-50 border-slate-200 text-slate-400')}">
      <span class="block text-[10px] text-slate-400">3. Radial Time</span>
      <span>{activeAppointment?.scheduledTime ? activeAppointment.scheduledTime : (showQueue ? 'Awaiting Doctor' : 'Pending')}</span>
    </div>
    <div class="p-2 rounded-xl border {activeAppointment?.assignedBadge ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-bold' : 'bg-slate-50 border-slate-200 text-slate-400'}">
      <span class="block text-[10px] text-slate-400">4. Badge</span>
      <span>{activeAppointment?.assignedBadge || 'Pending'}</span>
    </div>
  </div>

  <!-- ── MAIN CONTENT: Queue Status OR BookConsultant Intake ── -->
  {#if showQueue}
    <QueueStatusCard appointment={activeAppointment} />
  {:else}
    <BookConsultant />
  {/if}

</div>
