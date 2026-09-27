<script>
  import Card from '../atoms/Card.svelte';
  import Badge from '../atoms/Badge.svelte';
  import Button from '../atoms/Button.svelte';
  import UrgencyBadge from '../molecules/UrgencyBadge.svelte';
  import { 
    Clock, 
    MapPin, 
    CheckCircle2, 
    AlertCircle, 
    Stethoscope, 
    FileText, 
    Printer,
    Sparkles
  } from 'lucide-svelte';

  export let appointment;

  function printSlip() {
    window.print();
  }
</script>

<Card className="p-5 sm:p-7 border border-emerald-200/80 bg-white shadow-xs rounded-2xl sm:rounded-3xl">
  <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-100 pb-4 mb-4">
    <div>
      <div class="flex items-center gap-2 mb-1.5">
        <span class="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
          Active Visit
        </span>
        <UrgencyBadge priority={appointment.aiTriage?.suggestedPriority} size="sm" />
      </div>
      <h3 class="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
        {appointment.studentName}
      </h3>
      <p class="text-xs text-slate-600 mt-0.5">
        Matric: <span class="font-bold text-slate-800">{appointment.matricNo}</span> &bull; 
        Jaja File: <span class="font-bold text-slate-800">{appointment.jajaNo}</span> &bull; 
        Case: <span class="font-mono font-bold text-emerald-700">#{appointment.id}</span>
      </p>
    </div>

    <!-- Live Status Pill -->
    <div class="flex items-center gap-2">
      {#if appointment.status === 'APPROVED' || appointment.status === 'OVERRIDDEN'}
        <div class="px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-300 text-xs font-bold flex items-center gap-1.5 shadow-2xs">
          <CheckCircle2 class="w-3.5 h-3.5 text-emerald-600" />
          <span>Consultant Approved</span>
        </div>
      {:else}
        <div class="px-3 py-1.5 rounded-full bg-amber-50 text-amber-900 border border-amber-300 text-xs font-bold flex items-center gap-1.5 animate-pulse">
          <AlertCircle class="w-3.5 h-3.5 text-amber-600" />
          <span>Awaiting Consultant Sign-Off</span>
        </div>
      {/if}
    </div>
  </div>

  <!-- Key Clinical Details & Room Dispatch -->
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
    <!-- ROOM NUMBER -->
    <div class="p-3.5 rounded-xl border border-emerald-200/80 bg-emerald-50/30">
      <div class="flex items-center gap-1.5 text-emerald-800 mb-1">
        <MapPin class="w-3.5 h-3.5" />
        <span class="text-[11px] font-bold uppercase tracking-wider">Assigned Room</span>
      </div>
      <p class="text-base sm:text-lg font-bold text-slate-900">
        {appointment.assignedRoom || appointment.aiTriage?.suggestedRoom || 'Triage Holding Area'}
      </p>
      <p class="text-xs text-slate-500 mt-0.5">
        {appointment.status === 'APPROVED' ? 'Doctor confirmed. Please head here now.' : 'Tentatively assigned by AI engine.'}
      </p>
    </div>

    <!-- APPOINTMENT TIME & SESSION -->
    <div class="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
      <div class="flex items-center gap-1.5 text-slate-700 mb-1">
        <Clock class="w-3.5 h-3.5 text-emerald-600" />
        <span class="text-[11px] font-bold uppercase tracking-wider">Time Slot</span>
      </div>
      <p class="text-base sm:text-lg font-bold text-slate-900">
        {appointment.assignedSession || appointment.aiTriage?.recommendedSession || 'Immediate Stat'}
      </p>
      <p class="text-xs text-slate-500 mt-0.5">Submitted {appointment.submittedAt}</p>
    </div>

    <!-- CONSULTANT REVIEW STATUS -->
    <div class="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 sm:col-span-2 lg:col-span-1">
      <div class="flex items-center gap-1.5 text-slate-700 mb-1">
        <Stethoscope class="w-3.5 h-3.5 text-emerald-600" />
        <span class="text-[11px] font-bold uppercase tracking-wider">Consultant Review</span>
      </div>
      <p class="text-xs sm:text-sm font-medium text-slate-800 leading-snug">
        {appointment.clinicianNotes || 'Attending consultant is reviewing the clinical brief.'}
      </p>
    </div>
  </div>

  <!-- AI Patient Brief & Safety Rules Summary -->
  {#if appointment.aiTriage}
    <div class="p-4 sm:p-5 rounded-xl bg-slate-950 text-white space-y-2 mb-4 shadow-sm border border-slate-800">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-1.5">
          <Sparkles class="w-3.5 h-3.5 text-emerald-400" />
          <span class="text-[11px] font-bold tracking-wider text-emerald-300 uppercase">AI Clinical Brief &amp; Safety</span>
        </div>
        <span class="text-xs font-mono font-bold bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800">
          Urgency: {appointment.aiTriage.urgencyScore}/100
        </span>
      </div>
      <p class="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
        {appointment.aiTriage.patientBrief}
      </p>
      {#if appointment.aiTriage.safetyWarnings?.length}
        <div class="pt-1 flex flex-wrap gap-1.5">
          {#each appointment.aiTriage.safetyWarnings as warning}
            <span class="text-[11px] font-semibold text-rose-200 bg-rose-950/80 px-2.5 py-0.5 rounded border border-rose-800">
              ⚠️ {warning}
            </span>
          {/each}
        </div>
      {/if}
    </div>
  {/if}

  <!-- Footer Actions -->
  <div class="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100">
    <span class="text-xs text-slate-500">
      Need assistance? Visit the Nursing Desk in Central Lobby.
    </span>
    <Button variant="outline" size="sm" on:click={printSlip} className="w-full sm:w-auto font-semibold text-slate-700 border-slate-200 hover:bg-slate-50">
      <Printer class="w-3.5 h-3.5 mr-1.5 text-slate-600" />
      <span>Print Visit Slip</span>
    </Button>
  </div>
</Card>
