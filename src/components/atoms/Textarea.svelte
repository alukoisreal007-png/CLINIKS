<script>
  export let value = '';
  export let placeholder = '';
  export let rows = 4;
  export let disabled = false;
  export let id = '';
  export let name = '';
  export let required = false;
  export let className = '';
</script>

<textarea
  {id}
  {name}
  {rows}
  {placeholder}
  {disabled}
  {required}
  bind:value
  class="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 text-sm transition-all duration-200 focus:outline-none focus:border-teal-600 focus:ring-3 focus:ring-teal-600/10 disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed resize-y {className}"
  on:input
  on:change
  on:focus
  on:blur
></textarea>
