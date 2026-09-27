<script>
  export let label = '';
  export let selected = false;
  export let variant = 'default'; // 'default' | 'danger'
  export let className = '';
</script>

<button
  type="button"
  on:click
  class="px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-150 cursor-pointer select-none text-left
    {selected 
      ? (variant === 'danger' ? 'bg-rose-600 text-white border-rose-600 shadow-sm' : 'bg-teal-700 text-white border-teal-700 shadow-sm') 
      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 hover:border-slate-300'} {className}"
>
  {label}
</button>
