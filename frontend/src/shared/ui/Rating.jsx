import { useCallback, useMemo, useState } from 'react';

const StarIcon = ({ filled }) => (
  <svg
    className={`w-6 h-6 ${filled ? 'text-primary-600' : 'text-text-muted dark:text-dark-text-muted'}`}
    fill={filled ? 'currentColor' : 'none'}
    stroke="currentColor"
    viewBox="0 0 20 20"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={filled ? 0 : 1.5}
      d="M19.9477 7.55686C19.816 7.13427 19.4568 6.83508 19.0335 6.79511L13.2601 6.24816L10.9784 0.673859C10.81 0.264321 10.4267 0 10 0C9.57337 0 9.18991 0.264321 9.02252 0.673859L6.74084 6.24816L0.966519 6.79511C0.543233 6.83587 0.184799 7.13507 0.0523506 7.55686C-0.0793348 7.97946 0.0422796 8.44298 0.362414 8.73596L4.72665 12.7293L3.43985 18.6434C3.34571 19.0782 3.50745 19.5279 3.85322 19.7887C4.03908 19.9296 4.25743 20 4.47655 20C4.66485 20 4.8533 19.9478 5.0216 19.8427L10 16.7364L14.9775 19.8427C15.3427 20.0704 15.8018 20.0495 16.1468 19.7887C16.4926 19.5279 16.6543 19.0782 16.5602 18.6434L15.2734 12.7293L19.6376 8.73596C19.9576 8.44298 20.0794 7.98041 19.9477 7.55686Z"
    />
  </svg>
);

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const Rating = ({
  value,
  onChange,
  editable = false,
  max = 5,
  className = '',
  ariaLabel = 'Оценка в звёздах',
}) => {
  const [hoverValue, setHoverValue] = useState(null);

  const activeValue = useMemo(() => {
    if (hoverValue == null) return clamp(Number(value) || 0, 0, max);
    return clamp(Number(hoverValue) || 0, 0, max);
  }, [value, hoverValue, max]);

  const handleClick = useCallback(
    (next) => {
      if (!editable) return;
      if (typeof onChange === 'function') onChange(next);
    },
    [editable, onChange]
  );

  const handleKeyDown = useCallback(
    (event, currentIndex) => {
      if (!editable) return;
      const key = event.key;
      if (key === ' ' || key === 'Enter') {
        event.preventDefault();
        handleClick(currentIndex + 1);
        return;
      }
      if (key === 'ArrowRight' || key === 'ArrowUp') {
        event.preventDefault();
        const next = clamp((value || 0) + 1, 1, max);
        if (typeof onChange === 'function') onChange(next);
        return;
      }
      if (key === 'ArrowLeft' || key === 'ArrowDown') {
        event.preventDefault();
        const next = clamp((value || 0) - 1, 1, max);
        if (typeof onChange === 'function') onChange(next);
        return;
      }
    },
    [editable, value, max, onChange, handleClick]
  );

  return (
    <div
      className={`inline-flex items-center gap-1 ${className}`}
      role="radiogroup"
      aria-label={ariaLabel}
    >
      {Array.from({ length: max }).map((_, index) => {
        const starNumber = index + 1;
        const filled = starNumber <= activeValue;
        return (
          <button
            key={index}
            type="button"
            role="radio"
            aria-checked={starNumber === clamp(value || 0, 0, max)}
            aria-label={`${starNumber} из ${max}`}
            tabIndex={editable ? 0 : -1}
            className={`inline-flex items-center justify-center w-8 h-8 transition-transform ${
              editable ? 'cursor-pointer hover:scale-105 active:scale-95' : 'cursor-default'
            }`}
            onMouseEnter={() => editable && setHoverValue(starNumber)}
            onMouseLeave={() => editable && setHoverValue(null)}
            onFocus={() => editable && setHoverValue(starNumber)}
            onBlur={() => editable && setHoverValue(null)}
            onClick={() => handleClick(starNumber)}
            onKeyDown={(e) => handleKeyDown(e, index)}
          >
            <StarIcon filled={filled} />
          </button>
        );
      })}
    </div>
  );
};

export { Rating }; 