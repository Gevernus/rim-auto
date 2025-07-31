import { forwardRef } from 'react';

const Input = forwardRef(({
  type = 'text',
  label,
  error,
  placeholder,
  className = '',
  required = false,
  disabled = false,
  ...props
}, ref) => {
  const baseClasses = 'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors';
  const errorClasses = error ? 'border-error' : 'border-border dark:border-dark-border hover:border-gray-300 dark:hover:border-gray-600';
  const disabledClasses = disabled ? 'bg-surface dark:bg-dark-surface cursor-not-allowed' : 'bg-white dark:bg-dark-surface';
  
  const inputClasses = `${baseClasses} ${errorClasses} ${disabledClasses} ${className}`;

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-text-secondary dark:text-text-muted mb-2">
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}
      <input
        ref={ref}
        type={type}
        placeholder={placeholder}
        className={inputClasses}
        disabled={disabled}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-error">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export { Input }; 