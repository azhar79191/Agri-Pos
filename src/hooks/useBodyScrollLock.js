import { useEffect } from 'react';

let locks = 0;
let originalOverflow = '';
let originalPaddingRight = '';

/** Keep scrolling locked until the last stacked dialog or overlay closes. */
export default function useBodyScrollLock(isLocked = true) {
  useEffect(() => {
    if (!isLocked) return;
    if (locks === 0) {
      originalOverflow = document.body.style.overflow;
      originalPaddingRight = document.body.style.paddingRight;
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      const padding = parseFloat(window.getComputedStyle(document.body).paddingRight) || 0;
      document.body.style.overflow = 'hidden';
      if (scrollbarWidth > 0) document.body.style.paddingRight = `${padding + scrollbarWidth}px`;
    }
    locks += 1;
    return () => {
      locks -= 1;
      if (locks === 0) {
        document.body.style.overflow = originalOverflow;
        document.body.style.paddingRight = originalPaddingRight;
      }
    };
  }, [isLocked]);
}
