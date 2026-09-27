<script>
  import Card from '../atoms/Card.svelte';

  export let title = '';
  export let value = '0';
  export let subtitle = '';
  export let icon = null;
  export let trend = '';
  export let className = '';
</script>

<Card className="p-4 sm:p-5 border border-slate-200 bg-white rounded-2xl shadow-xs {className}">
  <div class="flex items-start justify-between">
    <div class="space-y-1">
      <p class="text-xs font-bold text-slate-500 uppercase tracking-wider">{title}</p>
      <div class="flex items-baseline gap-2">
        <h4 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{value}</h4>
        {#if trend}
          <span class="text-xs font-bold text-emerald-700">{trend}</span>
        {/if}
      </div>
      {#if subtitle}
        <p class="text-xs text-slate-500 font-medium mt-0.5">{subtitle}</p>
      {/if}
    </div>
    {#if icon}
      <div class="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 shrink-0">
        <svelte:component this={icon} class="w-5 h-5 stroke-[2]" />
      </div>
    {/if}
  </div>
</Card>
