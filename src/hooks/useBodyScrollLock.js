import { useEffect } from 'react';

/**
 * Custom hook to lock body scroll when a modal/overlay is open
 * @param {boolean} isLocked - Whether to lock the body scroll
 */
const useBodyScrollLock = (isLocked = true) => {
  useEffect(() => {
    if (!isLocked) return;

    // Store original overflow value
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;

    // Get scrollbar width to prevent layout shift
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    // Lock scroll
    document.body.style.overflow = 'hidden';
    
    // Add padding to prevent layout shift when scrollbar disappears
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    // Cleanup function
    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, [isLocked]);
};

export default useBodyScrollLock;
