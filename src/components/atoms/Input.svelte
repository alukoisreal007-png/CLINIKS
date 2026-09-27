<script>
  export let value = '';
  export let type = 'text';
  export let placeholder = '';
  export let disabled = false;
  export let id = '';
  export let name = '';
  export let required = false;
  export let className = '';
</script>

<input
  {id}
  {name}
  {type}
  {placeholder}
  {disabled}
  {required}
  bind:value
  class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 font-medium placeholder:font-normal placeholder:text-slate-400 text-sm transition-all duration-200 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10 disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed {className}"
  on:input
  on:change
  on:focus
  on:blur
/>
