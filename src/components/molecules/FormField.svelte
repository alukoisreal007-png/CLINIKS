<script>
  export let label = '';
  export let id = '';
  export let required = false;
  export let helpText = '';
  export let error = '';
  export let className = '';
</script>

<div class="space-y-1.5 {className}">
  {#if label}
    <div class="flex items-center justify-between">
      <label for={id} class="block text-xs font-semibold text-slate-700">
        {label}
        {#if required}
          <span class="text-rose-500 font-bold ml-0.5">*</span>
        {/if}
      </label>
      <slot name="extra" />
    </div>
  {/if}

  <slot />

  {#if helpText && !error}
    <p class="text-xs text-slate-500">{helpText}</p>
  {/if}

  {#if error}
    <p class="text-xs text-rose-600 font-medium">{error}</p>
  {/if}
</div>
