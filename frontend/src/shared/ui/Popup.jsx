import { useClickOutside } from '../hooks';

const Popup = ({
  isOpen,
  onClose,
  children,
  className = '',
  position = 'bottom', // 'bottom', 'top', 'left', 'right'
  align = 'start', // 'start', 'center', 'end'
}) => {
  const popupRef = useClickOutside(onClose);

  if (!isOpen) return null;

  // Позиционирование попапа
  const getPositionClasses = () => {
    const baseClasses = 'absolute z-50 bg-surface-elevated dark:bg-dark-surface-elevated border border-border dark:border-dark-border rounded-lg shadow-lg';
    
    switch (position) {
      case 'top':
        return `${baseClasses} bottom-full mb-2`;
      case 'left':
        return `${baseClasses} right-full mr-2`;
      case 'right':
        return `${baseClasses} left-full ml-2`;
      case 'bottom':
      default:
        return `${baseClasses} top-full mt-2`;
    }
  };

  const getAlignClasses = () => {
    switch (align) {
      case 'center':
        return 'left-1/2 transform -translate-x-1/2';
      case 'end':
        return 'right-0';
      case 'start':
      default:
        return 'left-0 right-0';
    }
  };

  return (
    <div 
      ref={popupRef}
      className={`${getPositionClasses()} ${getAlignClasses()} ${className}`}
    >
      {children}
    </div>
  );
};

export { Popup }; 