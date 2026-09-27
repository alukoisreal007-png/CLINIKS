<script>
  import { onDestroy } from 'svelte';
  import { clinicStore } from '../../stores/clinicStore.js';
  import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-svelte';

  $: notification = $clinicStore.systemNotification;

  let timer;

  $: if (notification) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      clinicStore.clearNotification();
    }, 5000);
  }

  onDestroy(() => {
    clearTimeout(timer);
  });

  function dismiss() {
    clearTimeout(timer);
    clinicStore.clearNotification();
  }
</script>

{#if notification}
  <div class="fixed top-4 right-4 z-50 max-w-md w-full animate-in slide-in-from-top-2 duration-200">
    <div class="p-4 rounded-xl shadow-lg border flex items-start gap-3 backdrop-blur-md
      {notification.type === 'success' ? 'bg-emerald-50/95 border-emerald-200 text-emerald-900' : ''}
      {notification.type === 'warning' ? 'bg-amber-50/95 border-amber-200 text-amber-900' : ''}
      {notification.type === 'error' ? 'bg-rose-50/95 border-rose-200 text-rose-900' : ''}
      {!notification.type || notification.type === 'info' ? 'bg-slate-900/95 border-slate-800 text-white' : ''}"
    >
      <div class="shrink-0 mt-0.5">
        {#if notification.type === 'success'}
          <CheckCircle2 class="w-5 h-5 text-emerald-600" />
        {:else if notification.type === 'warning'}
          <AlertTriangle class="w-5 h-5 text-amber-600" />
        {:else}
          <Info class="w-5 h-5 text-teal-400" />
        {/if}
      </div>
      <div class="flex-1 text-sm font-medium pr-2">
        {notification.message}
      </div>
      <button
        type="button"
        on:click={dismiss}
        class="shrink-0 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
      >
        <X class="w-4 h-4" />
      </button>
    </div>
  </div>
{/if}
