/* eslint-disable @next/next/no-img-element */
'use client';

import type { CSSProperties } from 'react';
import { BRAND_MARK_SRC, chapterProgressFill, chapters, clamp } from './guided-story-data';
import { GuidedStoryScenes } from './guided-story-scenes';
import { ChapterTextSwap, IconNext, IconPause, IconPlay, IconPrev, IconReplay, cx } from './guided-story-shared';
import { useGuidedStory } from './use-guided-story';
import styles from './home-onboarding-preview.module.sass';

export function HomeOnboardingPreview({ density = 'default' }: { density?: 'default' | 'embedded' }) {
  const {
    reducedMotion, rootRef, panRef, sizerRef, canvasRef, cardRefs, setRootRef,
    elapsed, paused, canPan, chapterIndex, chapter, layouts, badges,
    goToChapter, togglePause, replay, sceneState,
  } = useGuidedStory();
  const footerStatus = `${String(chapterIndex).padStart(2, '0')} / 06`;

  return (
    <section ref={rootRef} className={cx(styles.storySection, density === 'embedded' && styles.densityEmbedded, reducedMotion && styles.reducedMotion)} aria-label="Experiência completa do TDM Construtor">
      <div className={styles.storyShell}>
        <div className={styles.storyHeader}>
          <div className={styles.storyCopy}><ChapterTextSwap swapKey={chapterIndex} className={styles.storyCopySwap}><span className={styles.chapterKicker}>{chapter.label}</span><h2><span key={chapterIndex} className={styles.chapterTitleReveal}>{chapter.title}</span></h2></ChapterTextSwap></div>
          <div className={styles.storyControls} aria-label="Controles da narrativa">
            <button className={styles.controlBtn} type="button" aria-label="Capítulo anterior" title="Capítulo anterior" onClick={() => goToChapter(chapterIndex - 1)}><IconPrev /></button>
            <button className={styles.controlBtn} type="button" aria-label={paused ? 'Continuar narrativa' : 'Pausar narrativa'} title={paused ? 'Continuar' : 'Pausar'} onClick={togglePause}>{paused ? <IconPlay /> : <IconPause />}</button>
            <button className={styles.controlBtn} type="button" aria-label="Próximo capítulo" title="Próximo capítulo" onClick={() => goToChapter(chapterIndex + 1)}><IconNext /></button>
            <button className={styles.controlBtn} type="button" aria-label="Reiniciar narrativa" title="Reiniciar" onClick={replay}><IconReplay /></button>
          </div>
        </div>
        <div ref={panRef} className={cx(styles.storyPan, canPan && styles.canPan)}><div ref={sizerRef} className={styles.storySizer}><div ref={canvasRef} className={styles.storyCanvas}><GuidedStoryScenes state={sceneState} layouts={layouts} badges={badges} cardRefs={cardRefs} setRootRef={setRootRef} /></div></div></div>
        <footer className={styles.storyFooter}>
          <div className={styles.footerMain}><img className={styles.footerIcon} src={BRAND_MARK_SRC} alt="" width={252} height={262} /><div className={styles.footerCopy}><ChapterTextSwap swapKey={chapterIndex} className={styles.footerCopySwap}><h3>{chapter.footerTitle}</h3><p>{chapter.footerDescription}</p></ChapterTextSwap></div><span className={styles.footerStatus}>{footerStatus}</span></div>
          <nav className={styles.chapterNav} aria-label="Capítulos da narrativa">{chapters.map((item, index) => { const fill = chapterProgressFill(elapsed, index); return <button key={item.label} type="button" className={cx(styles.chapterStep, index === chapterIndex && styles.active)} style={{ '--fill': clamp(fill, 0, 1).toFixed(4) } as CSSProperties} onClick={() => goToChapter(index)}><span>{String(index).padStart(2, '0')}</span><b>{item.label}</b></button>; })}</nav>
        </footer>
      </div>
    </section>
  );
}
