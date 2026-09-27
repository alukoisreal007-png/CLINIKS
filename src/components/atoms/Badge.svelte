<script>
  export let variant = 'default'; // 'default' | 'urgent' | 'moderate' | 'routine' | 'approved' | 'neutral'
  export let size = 'md'; // 'sm' | 'md'
  export let className = '';

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 font-semibold',
    md: 'text-xs px-2.5 py-1 font-semibold'
  };

  const variantStyles = {
    default: 'bg-slate-100 text-slate-800 border border-slate-300 font-semibold',
    urgent: 'bg-[#DC2626] text-white border border-red-700 font-bold shadow-2xs',
    emergency: 'bg-[#DC2626] text-white border border-red-700 font-bold shadow-2xs',
    moderate: 'bg-[#D97706] text-white border border-amber-700 font-bold shadow-2xs',
    routine: 'bg-slate-700 text-white border border-slate-800 font-bold',
    approved: 'bg-[#0F172A] text-white border border-slate-800 font-bold',
    clinical: 'bg-[#699FDF] text-white border border-blue-600 font-bold',
    neutral: 'bg-slate-100 text-slate-800 border border-slate-300 font-medium'
  };
</script>

<span class="inline-flex items-center gap-1.5 rounded-md uppercase tracking-wider font-mono text-[10px] {sizeStyles[size] || sizeStyles.md} {variantStyles[variant] || variantStyles.default} {className}">
  <slot />
</span>
