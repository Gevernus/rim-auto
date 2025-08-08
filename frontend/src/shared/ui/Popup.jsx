import { useClickOutside } from '../hooks';
import { useEffect, useState } from 'react';

const Popup = ({
  isOpen,
  onClose,
  children,
  className = '',
  position = 'bottom', // 'bottom', 'top', 'left', 'right'
  align = 'start', // 'start', 'center', 'end'
  mobileFullScreen = false, // Новый проп для мобильного полноэкранного режима
}) => {
  const popupRef = useClickOutside(onClose);
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Определяем мобильное устройство
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isOpen && mobileFullScreen && isMobile) {
      // Небольшая задержка для анимации
      const timer = setTimeout(() => setIsVisible(true), 10);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [isOpen, mobileFullScreen, isMobile]);

  if (!isOpen) return null;

  // Мобильный полноэкранный режим (только на мобильных)
  if (mobileFullScreen && isMobile) {
    return (
      <div className="fixed inset-0 z-50">
        {/* Затемнение фона */}
        <div 
          className="absolute inset-0 bg-black opacity-50 transition-opacity duration-300"
          onClick={onClose}
        />
        
        {/* Попап снизу */}
        <div 
          ref={popupRef}
          className={`absolute bottom-0 left-0 right-0 p-4 mb-20 bg-surface dark:bg-dark-surface border-t border-border rounded-t-lg dark:border-dark-border transition-transform duration-300 ease-out ${
            isVisible ? 'translate-y-0' : 'translate-y-full'
          }`}
        >
          {children}
        </div>
      </div>
    );
  }

  // Позиционирование попапа для десктопа
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
        return 'left-0';
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