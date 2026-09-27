<script>
  import { clinicStore } from '../../stores/clinicStore.js';
  import Navbar from '../organisms/Navbar.svelte';
  import NotificationBanner from '../molecules/NotificationBanner.svelte';
  import { Activity } from 'lucide-svelte';

  $: activeTab = $clinicStore.activeTab;
</script>

<div class="min-h-screen bg-slate-50 flex flex-col text-slate-900 selection:bg-teal-100 selection:text-teal-900">
  <Navbar />
  <NotificationBanner />

  {#if activeTab === 'HOME' || activeTab === 'AUTH'}
    <main class="flex-1 w-full">
      <slot />
    </main>
  {:else}
    <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <slot />
    </main>
  {/if}

  {#if activeTab !== 'HOME' && activeTab !== 'AUTH'}
    <footer class="mt-auto border-t border-slate-200 bg-white py-6">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div class="flex items-center gap-2">
          <Activity class="w-4 h-4 text-teal-700" />
          <span class="font-bold text-slate-800">CLINIKS</span>
          <span>&bull; University Student Health &amp; Triage Service</span>
        </div>
        <div class="flex items-center gap-4">
          <span>Emergency Desk: Ext. 222</span>
          <span>Tamper-Proof Electronic Health Ledger</span>
        </div>
      </div>
    </footer>
  {/if}
</div>
