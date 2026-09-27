<script>
  export let variant = 'primary'; // 'primary' | 'secondary' | 'outline' | 'danger' | 'success' | 'ghost'
  export let size = 'md'; // 'sm' | 'md' | 'lg'
  export let type = 'button';
  export let disabled = false;
  export let loading = false;
  export let className = '';

  const baseStyles = 'inline-flex items-center justify-center font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none rounded-xl';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2.5 gap-2',
    lg: 'text-base px-6 py-3.5 gap-2.5'
  };

  const variantStyles = {
    primary: 'bg-[#699FDF] hover:bg-[#5289CC] text-white shadow-xs focus-visible:ring-[#699FDF] active:scale-[0.98]',
    secondary: 'bg-[#0F172A] hover:bg-slate-800 text-white shadow-xs focus-visible:ring-[#0F172A] active:scale-[0.98]',
    outline: 'border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 focus-visible:ring-[#699FDF] active:scale-[0.98]',
    danger: 'bg-[#DC2626] hover:bg-red-700 text-white shadow-xs focus-visible:ring-[#DC2626] active:scale-[0.98]',
    warning: 'bg-[#D97706] hover:bg-amber-700 text-white shadow-xs focus-visible:ring-[#D97706] active:scale-[0.98]',
    success: 'bg-[#0F172A] hover:bg-slate-800 text-white shadow-xs active:scale-[0.98]',
    ghost: 'hover:bg-slate-100 text-slate-700 hover:text-slate-950 focus-visible:ring-slate-300'
  };
</script>

<button
  {type}
  {disabled}
  class="{baseStyles} {sizeStyles[size] || sizeStyles.md} {variantStyles[variant] || variantStyles.primary} {className}"
  on:click
>
  {#if loading}
    <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  {/if}
  <slot />
</button>
