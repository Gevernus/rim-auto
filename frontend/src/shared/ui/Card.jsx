const Card = ({
  children,
  className = '',
  padding = 'md',
  shadow = 'md',
  hover = false,
  ...props
}) => {
  const baseClasses = 'bg-surface-elevated border border-border dark:bg-dark-surface-elevated dark:border-dark-border rounded-lg transition-colors';
  
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };
  
  const shadows = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
  };
  
  const hoverClasses = hover ? 'hover:shadow-lg transition-shadow duration-200 cursor-pointer' : '';
  
  const classes = `${baseClasses} ${paddings[padding]} ${shadows[shadow]} ${hoverClasses} ${className}`;

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

export { Card }; 