import { useEffect, useRef, useState } from 'react';

export function useActiveGuideStep(stepCount: number) {
  const [activeIndex, setActiveIndex] = useState(0);
  const stepRefs = useRef<Array<HTMLElement | null>>([]);

  useEffect(() => {
    const elements = stepRefs.current.filter((element): element is HTMLElement => Boolean(element));
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((first, second) => second.intersectionRatio - first.intersectionRatio);

        const leadingEntry = visibleEntries[0];
        if (!leadingEntry) return;

        const nextIndex = elements.indexOf(leadingEntry.target as HTMLElement);
        if (nextIndex >= 0) setActiveIndex(nextIndex);
      },
      { rootMargin: '-40% 0px -40% 0px', threshold: [0, 0.2, 0.45, 0.7, 1] }
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [stepCount]);

  const setStepRef = (index: number) => (element: HTMLElement | null) => {
    stepRefs.current[index] = element;
  };

  return { activeIndex, setStepRef };
}
