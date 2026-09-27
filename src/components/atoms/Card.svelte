<script>
  export let className = '';
  export let hoverable = false;

  $: hasCustomBg = className.includes('bg-');
</script>

<div class="{hasCustomBg ? '' : 'bg-white'} rounded-2xl border border-slate-200/90 shadow-xs {hoverable ? 'hover:shadow-md hover:border-slate-300 transition-all duration-200' : ''} {className}">
  <slot />
</div>
