import { useEffect, useRef, useState } from 'react';

export function useSidebarHeroState() {
  const contentRef = useRef<HTMLDivElement | null>(null);
  const heroFormShellRef = useRef<HTMLDivElement | null>(null);
  const scrollRafRef = useRef<number | null>(null);
  const isHeroCompactRef = useRef(false);
  const [isSidebarScrolled, setIsSidebarScrolled] = useState(false);
  const [isHeroCompact, setIsHeroCompact] = useState(false);

  useEffect(() => {
    const contentElement = contentRef.current;
    if (!contentElement) return;

    const update = () => {
      const scrollTop = contentElement.scrollTop;
      setIsSidebarScrolled(scrollTop > 8);
      const shouldCompact = isHeroCompactRef.current ? scrollTop > 4 : scrollTop > 10;
      if (shouldCompact === isHeroCompactRef.current) return;

      if (shouldCompact && typeof document !== 'undefined' && heroFormShellRef.current?.contains(document.activeElement)) {
        (document.activeElement as HTMLElement | null)?.blur();
      }
      isHeroCompactRef.current = shouldCompact;
      setIsHeroCompact(shouldCompact);
    };

    const handleScroll = () => {
      if (scrollRafRef.current !== null) return;
      scrollRafRef.current = window.requestAnimationFrame(() => {
        scrollRafRef.current = null;
        update();
      });
    };

    update();
    contentElement.addEventListener('scroll', handleScroll, { passive: true });
    heroFormShellRef.current?.addEventListener('focusin', update);
    heroFormShellRef.current?.addEventListener('focusout', update);

    return () => {
      contentElement.removeEventListener('scroll', handleScroll);
      heroFormShellRef.current?.removeEventListener('focusin', update);
      heroFormShellRef.current?.removeEventListener('focusout', update);
      if (scrollRafRef.current !== null) window.cancelAnimationFrame(scrollRafRef.current);
    };
  }, []);

  return { contentRef, heroFormShellRef, isSidebarScrolled, isHeroCompact };
}
