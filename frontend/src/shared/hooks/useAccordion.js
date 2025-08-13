import { useCallback, useState } from "react";

/**
 * Кросс-платформенный хук для управления аккордеоном.
 * Не использует DOM/ARIA и подходит для Web и RN.
 */
export const useAccordion = ({ initialIndex = null } = {}) => {
  const [openIndex, setOpenIndex] = useState(initialIndex);

  const isOpen = useCallback((index) => openIndex === index, [openIndex]);

  const toggle = useCallback((index) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  }, []);

  return { openIndex, isOpen, toggle };
}; 