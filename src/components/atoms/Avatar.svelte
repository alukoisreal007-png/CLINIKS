<script>
  export let name = 'User';
  export let size = 'md'; // 'sm' | 'md' | 'lg'
  export let variant = 'teal'; // 'teal' | 'slate' | 'rose'
  export let className = '';

  const getInitials = (n) => {
    if (!n) return 'U';
    const parts = n.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return n.slice(0, 2).toUpperCase();
  };

  const sizeStyles = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-12 h-12 text-base'
  };

  const variantStyles = {
    teal: 'bg-teal-100 text-teal-800 border-teal-200',
    slate: 'bg-slate-100 text-slate-800 border-slate-200',
    rose: 'bg-rose-100 text-rose-800 border-rose-200'
  };
</script>

<div class="inline-flex items-center justify-center rounded-full font-bold border select-none {sizeStyles[size] || sizeStyles.md} {variantStyles[variant] || variantStyles.teal} {className}">
  {getInitials(name)}
</div>
