import { useState } from 'react';
import type { TdmSidebarFeatureProps } from './tdm-sidebar.types';
import { TdmSidebarHero } from './tdm-sidebar-hero';
import { TdmSidebarPanels } from './tdm-sidebar-panels';
import { useSidebarHeroState } from './use-sidebar-hero-state';

export function TdmSidebarContent(props: Omit<TdmSidebarFeatureProps, 'isOpen'>) {
  const [theoryDescription, setTheoryDescription] = useState('');
  const hero = useSidebarHeroState();

  return (
    <>
      <TdmSidebarHero
        theoryName={props.theoryName}
        theoryDescription={theoryDescription}
        isScrolled={hero.isSidebarScrolled}
        isCompact={hero.isHeroCompact}
        formRef={hero.heroFormShellRef}
        onTheoryNameChange={props.onTheoryNameChange}
        onTheoryDescriptionChange={setTheoryDescription}
      />
      <TdmSidebarPanels props={props} contentRef={hero.contentRef} />
    </>
  );
}
