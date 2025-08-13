import { useCallback, useEffect, useRef } from "react";

/**
 * Кросс-платформенный хук автопрокрутки карусели.
 * Хук не обращается к DOM напрямую и использует переданный контроллер.
 * Контроллер должен реализовать интерфейс:
 * - getScrollLeft(): number
 * - getScrollWidth(): number
 * - scrollBy(dx: number, behavior?: 'auto' | 'smooth'): void
 * - scrollTo(left: number, behavior?: 'auto' | 'smooth'): void
 * - addEventListener(event: 'scroll', handler: (e) => void): void
 * - removeEventListener(event: 'scroll', handler: (e) => void): void
 */
export const useAutoCarousel = ({ step, intervalMs, enabled = true, loop = true }) => {
  const controllerRef = useRef(null);
  const isPausedRef = useRef(false);

  const attach = useCallback((controller) => {
    controllerRef.current = controller;
  }, []);

  const pause = useCallback(() => {
    isPausedRef.current = true;
  }, []);

  const resume = useCallback(() => {
    isPausedRef.current = false;
  }, []);

  useEffect(() => {
    const controller = controllerRef.current;
    if (!enabled || !controller) return undefined;

    const handleScrollLoop = () => {
      if (!loop) return;
      const half = controller.getScrollWidth() / 2;
      if (controller.getScrollLeft() >= half) {
        const resetTo = controller.getScrollLeft() - half;
        controller.scrollTo(resetTo, 'auto');
      }
    };

    const id = setInterval(() => {
      if (isPausedRef.current) return;
      controller.scrollBy(step, 'smooth');
      handleScrollLoop();
    }, intervalMs);

    const onScroll = () => handleScrollLoop();
    controller.addEventListener('scroll', onScroll);

    return () => {
      clearInterval(id);
      controller.removeEventListener('scroll', onScroll);
    };
  }, [enabled, intervalMs, step, loop]);

  return { attach, pause, resume };
}; 