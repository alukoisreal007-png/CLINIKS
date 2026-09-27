<script>
  import { onMount } from 'svelte';
  import { networkStatusStore, toggleSimulatedOffline, forceSyncNow, getOfflineAuditLog } from '../../lib/offlineSync.js';
  import { Wifi, WifiOff, RefreshCw, Database, ShieldCheck, ChevronDown, CheckCircle2, AlertTriangle } from 'lucide-svelte';

  let isOpen = false;
  let isSyncing = false;
  let syncFeedback = '';

  $: status = $networkStatusStore;
  $: isEffectivelyOnline = status.isOnline && !status.isSimulatedOffline;

  async function handleForceSync() {
    isSyncing = true;
    syncFeedback = '';
    const res = await forceSyncNow();
    isSyncing = false;
    if (res.success) {
      syncFeedback = `Successfully synchronized with central server at ${res.timestamp}`;
    } else {
      syncFeedback = res.message;
    }
    setTimeout(() => { syncFeedback = ''; }, 4000);
  }

  function handleToggleMode() {
    toggleSimulatedOffline();
  }

  function closeDropdown() {
    isOpen = false;
  }
</script>

<div class="relative inline-block text-left">
  <!-- Trigger Pill -->
  <button
    type="button"
    on:click={() => isOpen = !isOpen}
    class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer border {isEffectivelyOnline ? 'bg-slate-800/80 text-slate-200 border-slate-700 hover:border-[#699FDF]' : 'bg-amber-950/80 text-amber-300 border-amber-600/70 hover:border-amber-400'}"
    title="Hospital Connectivity & OPD Cache Status"
  >
    {#if isEffectivelyOnline}
      <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
      <span class="hidden sm:inline font-mono">OPD Cache: Synced</span>
      <span class="sm:hidden font-mono">Synced</span>
    {:else}
      <span class="w-2 h-2 rounded-full bg-[#D97706] animate-ping"></span>
      <span class="hidden sm:inline font-mono text-amber-300">⚡ Offline Mode (Cache Active)</span>
      <span class="sm:hidden font-mono text-amber-300">⚡ Offline</span>
    {/if}
    <ChevronDown class="w-3.5 h-3.5 text-slate-400" />
  </button>

  <!-- Modal / Dropdown Card -->
  {#if isOpen}
    <button
      type="button"
      class="fixed inset-0 z-40 bg-transparent w-full h-full cursor-default border-none p-0 m-0"
      on:click={closeDropdown}
      aria-label="Close offline status panel"
    ></button>

    <div class="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-[#0F172A] border border-slate-700 shadow-2xl p-5 z-50 text-white space-y-4 font-sans animate-in fade-in zoom-in-95 duration-150">
      
      <!-- Header -->
      <div class="flex items-center justify-between border-b border-slate-800 pb-3">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg {isEffectivelyOnline ? 'bg-blue-500/20 text-[#699FDF]' : 'bg-amber-500/20 text-[#D97706]'} flex items-center justify-center">
            {#if isEffectivelyOnline}
              <Wifi class="w-4 h-4" />
            {:else}
              <WifiOff class="w-4 h-4" />
            {/if}
          </div>
          <div>
            <h4 class="text-sm font-bold text-slate-100">Local OPD Storage Engine</h4>
            <p class="text-[11px] text-slate-400 font-mono">Thesis Section 11 Resilience</p>
          </div>
        </div>
        <span class="text-[10px] px-2 py-0.5 rounded font-mono font-semibold {isEffectivelyOnline ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/50' : 'bg-amber-950 text-amber-300 border border-amber-600/50'}">
          {isEffectivelyOnline ? 'ONLINE' : 'LOCAL CACHE'}
        </span>
      </div>

      <!-- Metrics Grid -->
      <div class="grid grid-cols-2 gap-2 text-xs">
        <div class="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
          <span class="text-slate-400 block text-[10px] uppercase font-mono">Cached Patients</span>
          <span class="text-base font-black text-[#699FDF]">{status.itemCount || 14} in Local DB</span>
        </div>
        <div class="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
          <span class="text-slate-400 block text-[10px] uppercase font-mono">Last Synced</span>
          <span class="text-xs font-bold text-slate-200">{status.lastSyncedAt || 'Just now'}</span>
        </div>
      </div>

      <!-- Status Explanation -->
      <div class="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-300 space-y-1.5 leading-relaxed">
        <div class="flex items-center gap-1.5 text-slate-200 font-semibold">
          <ShieldCheck class="w-4 h-4 text-[#699FDF]" />
          <span>Zero-Data-Loss Local Caching</span>
        </div>
        <p>
          All triage queues, vitals logs, and doctor approvals persist in browser storage (`localStorage`). If hospital internet or power supply cuts out, the clinical team can continue admitting and triaging patients uninterrupted.
        </p>
      </div>

      <!-- Feedback Banner -->
      {#if syncFeedback}
        <div class="p-2.5 rounded-lg bg-blue-950/80 border border-[#699FDF]/40 text-[#699FDF] text-xs font-mono">
          {syncFeedback}
        </div>
      {/if}

      <!-- Action Buttons -->
      <div class="space-y-2 pt-1 border-t border-slate-800">
        <button
          type="button"
          on:click={handleToggleMode}
          class="w-full py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 {status.isSimulatedOffline ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-amber-600/30 hover:bg-amber-600/40 text-amber-200 border border-amber-600/50'}"
        >
          {#if status.isSimulatedOffline}
            <Wifi class="w-3.5 h-3.5" />
            <span>Restore Live Network (Exit Simulation)</span>
          {:else}
            <WifiOff class="w-3.5 h-3.5" />
            <span>Simulate Hospital Network Dropout</span>
          {/if}
        </button>

        <button
          type="button"
          on:click={handleForceSync}
          disabled={isSyncing || status.isSimulatedOffline}
          class="w-full py-2 px-3 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <RefreshCw class="w-3.5 h-3.5 {isSyncing ? 'animate-spin' : ''}" />
          <span>{isSyncing ? 'Synchronizing...' : 'Force Sync with Central Hospital Server'}</span>
        </button>
      </div>

    </div>
  {/if}
</div>
