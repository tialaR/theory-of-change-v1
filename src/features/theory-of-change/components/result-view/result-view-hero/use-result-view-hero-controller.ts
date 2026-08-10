import { useEffect, useState, type RefObject } from 'react';
import { HERO_COMPACT_SCROLL_THRESHOLD } from '../result-view-utils';

export function useResultViewHeroController({
  viewRef,
  isComplete
}: {
  viewRef: RefObject<HTMLElement | null>;
  isComplete: boolean;
}) {
  const [isHeroCompact, setIsHeroCompact] = useState(false);

  useEffect(() => {
    const root = viewRef.current;

    if (!root) {
      return;
    }

    const handleScroll = () => {
      setIsHeroCompact(root.scrollTop > HERO_COMPACT_SCROLL_THRESHOLD);
    };

    handleScroll();
    root.addEventListener('scroll', handleScroll, { passive: true });
    return () => root.removeEventListener('scroll', handleScroll);
  }, [isComplete, viewRef]);

  return { isHeroCompact };
}
