<script>
  import Badge from '../atoms/Badge.svelte';

  export let priority = 'ROUTINE'; // 'HIGH' | 'MODERATE' | 'ROUTINE' | 'APPROVED'
  export let size = 'md'; // 'sm' | 'md'

  $: normalized = (priority || 'ROUTINE').toUpperCase();
</script>

{#if normalized === 'HIGH' || normalized === 'URGENT'}
  <Badge variant="urgent" {size}>
    <span class="relative flex h-2 w-2 mr-1">
      <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
      <span class="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
    </span>
    HIGH URGENCY
  </Badge>
{:else if normalized === 'MODERATE'}
  <Badge variant="moderate" {size}>
    <span class="inline-flex rounded-full h-1.5 w-1.5 bg-slate-950 mr-1"></span>
    MODERATE
  </Badge>
{:else if normalized === 'ROUTINE'}
  <Badge variant="routine" {size}>
    <span class="inline-flex rounded-full h-1.5 w-1.5 bg-slate-300 mr-1"></span>
    ROUTINE
  </Badge>
{:else if normalized === 'APPROVED'}
  <Badge variant="approved" {size}>
    <span class="inline-flex rounded-full h-1.5 w-1.5 bg-white mr-1"></span>
    APPROVED
  </Badge>
{:else}
  <Badge variant="default" {size}>
    {priority}
  </Badge>
{/if}
