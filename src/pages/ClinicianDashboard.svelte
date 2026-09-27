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

  $: urgentCount = queue.filter(q => q.aiTriage?.suggestedPriority === 'HIGH').length;
  $: pendingCount = queue.filter(q => q.status === 'PENDING_APPROVAL').length;
  $: approvedCount = queue.filter(q => q.status === 'APPROVED' || q.status === 'OVERRIDDEN').length;
</script>

<div class="space-y-4">
  <!-- ========================================================================= -->
  <!-- PERSISTENT ANCHORED CLINICAL TOP-BAR (Epic / Cerner Enterprise Standard)  -->
  <!-- Stays anchored while scrolling through patient queue                      -->
  <!-- ========================================================================= -->
  <div class="sticky top-18 z-20 bg-[#0F172A] border border-slate-800 shadow-md rounded-xl p-3 sm:p-4 text-white">
    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
      
      <!-- Doctor Clinical Identity & Workstation Station -->
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-[#699FDF]/20 border border-[#699FDF]/40 flex items-center justify-center text-[#699FDF] font-extrabold shrink-0">
          <Stethoscope class="w-5 h-5 stroke-[2.2]" />
        </div>
        
        <div>
          <div class="flex items-center gap-2 flex-wrap">
            <h2 class="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2">
              {clinician.name ? (clinician.name.toLowerCase().startsWith('dr') ? clinician.name : `Dr. ${clinician.name}`) : 'Dr. Stella Adeleke'}
            </h2>
            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[#699FDF]/20 text-blue-300 border border-[#699FDF]/40 font-mono">
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

        <!-- Metric 2: High Urgency Flag (Ruby Red) -->
        <div class="flex items-center gap-2 px-3 py-1.5 rounded-lg border {urgentCount > 0 ? 'bg-red-950/80 border-[#DC2626] text-red-200' : 'bg-slate-800/90 border-slate-700/80 text-slate-400'}">
          <AlertTriangle class="w-3.5 h-3.5 {urgentCount > 0 ? 'text-[#DC2626] animate-bounce' : 'text-slate-500'}" />
          <div class="leading-none">
            <span class="text-[9px] uppercase tracking-wider block font-bold {urgentCount > 0 ? 'text-red-300' : 'text-slate-400'}">High Urgency</span>
            <span class="text-sm font-extrabold font-mono {urgentCount > 0 ? 'text-[#DC2626]' : 'text-slate-300'}">{urgentCount}</span>
          </div>
        </div>

        <!-- Metric 3: Pending Doctor Review (Warm Ochre) -->
        <div class="flex items-center gap-2 px-3 py-1.5 rounded-lg border {pendingCount > 0 ? 'bg-amber-950/80 border-[#D97706] text-amber-200' : 'bg-slate-800/90 border-slate-700/80 text-slate-400'}">
          <Clock class="w-3.5 h-3.5 {pendingCount > 0 ? 'text-[#D97706]' : 'text-slate-500'}" />
          <div class="leading-none">
            <span class="text-[9px] uppercase tracking-wider block font-bold {pendingCount > 0 ? 'text-amber-300' : 'text-slate-400'}">Awaiting Doctor</span>
            <span class="text-sm font-extrabold font-mono {pendingCount > 0 ? 'text-[#D97706]' : 'text-slate-300'}">{pendingCount}</span>
          </div>
        </div>

        <!-- Metric 4: Completed Consultations -->
        <div class="flex items-center gap-2 bg-slate-800/90 px-3 py-1.5 rounded-lg border border-slate-700/80">
          <CheckCircle2 class="w-3.5 h-3.5 text-[#699FDF]" />
          <div class="leading-none">
            <span class="text-[9px] uppercase tracking-wider text-slate-400 block font-bold">Consulted</span>
            <span class="text-sm font-extrabold text-white font-mono">{approvedCount}</span>
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
