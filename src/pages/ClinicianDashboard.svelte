<script>
  import { clinicStore } from '../stores/clinicStore.js';
  import ClinicianTriageQueue from '../components/organisms/ClinicianTriageQueue.svelte';
  import { 
    Stethoscope, 
    AlertTriangle, 
    Clock, 
    CheckCircle2, 
    Users,
    ShieldAlert,
    Building2,
    IdCard
  } from 'lucide-svelte';

  $: currentUser = $clinicStore.currentUser;
  $: clinician = currentUser?.profile || {};
  $: queue = $clinicStore.triageQueue || [];

  $: emergencyCount = queue.filter(q => 
    q.assignedSection === 'EMERGENCY' || 
    (q.aiBrief?.preliminaryScore >= 8) || 
    (q.aiTriage?.suggestedPriority === 'HIGH')
  ).length;

  $: checkUpCount = queue.filter(q => 
    q.assignedSection === 'CHECK_UP' || 
    (q.aiBrief && q.aiBrief.preliminaryScore < 8 && q.assignedSection !== 'EMERGENCY') ||
    (!q.assignedSection && q.aiTriage?.suggestedPriority !== 'HIGH')
  ).length;

  $: awaitingCount = queue.filter(q => 
    q.status === 'PENDING_APPROVAL' || !q.scheduledTime
  ).length;
</script>

<div class="space-y-4">
  <!-- ========================================================================= -->
  <!-- PERSISTENT ANCHORED CLINICAL TOP-BAR (Epic / Cerner Enterprise Standard)  -->
  <!-- Stays anchored while scrolling through patient queue                      -->
  <!-- ========================================================================= -->
  <div class="sticky top-18 z-20 bg-[#0F172A] border border-slate-800 shadow-md rounded-xl p-3 sm:p-4 text-white font-sans">
    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
      
      <!-- Doctor Clinical Identity & Workstation Station -->
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-[#699FDF] font-extrabold shrink-0">
          <Stethoscope class="w-5 h-5 stroke-[2.2]" />
        </div>
        
        <div>
          <div class="flex items-center gap-2 flex-wrap">
            <h2 class="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2">
              {clinician.name ? (clinician.name.toLowerCase().startsWith('dr') ? clinician.name : `Dr. ${clinician.name}`) : 'Dr. Stella Adeleke'}
            </h2>
            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/40 font-mono">
              <span class="w-1.5 h-1.5 rounded-full bg-[#699FDF] animate-pulse"></span>
              ACTIVE CLINICAL DUTY
            </span>
          </div>

          <div class="flex items-center gap-2 text-xs text-slate-300 font-mono mt-0.5">
            <span>{clinician.office || 'General OPD Wing A'}</span>
            {#if clinician.staffId}
              <span>&bull;</span>
              <span>ID: <strong class="text-white">{clinician.staffId}</strong></span>
            {/if}
          </div>
        </div>
      </div>

      <!-- Persistent Anchored Live Hospital Metrics Strip -->
      <div class="flex items-center gap-2 sm:gap-3 flex-wrap">
        
        <!-- Metric 1: Total Queue -->
        <div class="flex items-center gap-2 bg-slate-800/90 px-3 py-1.5 rounded-lg border border-slate-700/80">
          <Users class="w-3.5 h-3.5 text-slate-400" />
          <div class="leading-none">
            <span class="text-[9px] uppercase tracking-wider text-slate-400 block font-bold">Total Queue</span>
            <span class="text-sm font-extrabold text-white font-mono">{queue.length}</span>
          </div>
        </div>

        <!-- Metric 2: Emergency Section (Ruby Red) -->
        <div class="flex items-center gap-2 px-3 py-1.5 rounded-lg border {emergencyCount > 0 ? 'bg-red-950/80 border-red-500 text-red-200' : 'bg-slate-800/90 border-slate-700/80 text-slate-400'}">
          <AlertTriangle class="w-3.5 h-3.5 {emergencyCount > 0 ? 'text-red-400' : 'text-slate-500'}" />
          <div class="leading-none">
            <span class="text-[9px] uppercase tracking-wider block font-bold {emergencyCount > 0 ? 'text-red-300' : 'text-slate-400'}">Emergency Section</span>
            <span class="text-sm font-extrabold font-mono {emergencyCount > 0 ? 'text-red-400' : 'text-slate-300'}">{emergencyCount}</span>
          </div>
        </div>

        <!-- Metric 3: Check-Up Section (Clinical Blue) -->
        <div class="flex items-center gap-2 bg-slate-800/90 px-3 py-1.5 rounded-lg border border-slate-700/80">
          <CheckCircle2 class="w-3.5 h-3.5 text-[#699FDF]" />
          <div class="leading-none">
            <span class="text-[9px] uppercase tracking-wider text-slate-400 block font-bold">Check-Up Section</span>
            <span class="text-sm font-extrabold text-white font-mono">{checkUpCount}</span>
          </div>
        </div>

        <!-- Metric 4: Awaiting Doctor Review (Warm Ochre) -->
        <div class="flex items-center gap-2 px-3 py-1.5 rounded-lg border {awaitingCount > 0 ? 'bg-amber-950/80 border-amber-500 text-amber-200' : 'bg-slate-800/90 border-slate-700/80 text-slate-400'}">
          <Clock class="w-3.5 h-3.5 {awaitingCount > 0 ? 'text-amber-400' : 'text-slate-500'}" />
          <div class="leading-none">
            <span class="text-[9px] uppercase tracking-wider block font-bold {awaitingCount > 0 ? 'text-amber-300' : 'text-slate-400'}">Awaiting Schedule</span>
            <span class="text-sm font-extrabold font-mono {awaitingCount > 0 ? 'text-amber-400' : 'text-slate-300'}">{awaitingCount}</span>
          </div>
        </div>

      </div>

    </div>
  </div>

  <!-- CLINICIAN TRIAGE QUEUE & WORKSPACE -->
  <div class="space-y-3">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 px-1">
      <div>
        <h3 class="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <span>Outpatient Triage Workstation</span>
          <span class="text-xs font-normal text-slate-500 font-mono">Press [Enter] on table to review top urgent case</span>
        </h3>
      </div>
    </div>

    <ClinicianTriageQueue />
  </div>
</div>
