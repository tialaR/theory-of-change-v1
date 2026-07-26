'use client';

import { useState } from 'react';
import { ComponentsTab } from './components-tab';
import { ExperienceTab } from './experience-tab';
import { ReferencesTab } from './references-tab';
import { StatesTab } from './states-tab';
import { TypographyTab } from './typography-tab';
import { TABS, type LabTab } from './resend-command-preview.shared';
import styles from './resend-command-preview.module.sass';

export default function ResendCommandPreviewPage() {
  const [tab, setTab] = useState<LabTab>('experiencia');

  return (
    <main className={styles.page}>
      <nav className={styles.labSwitch} aria-label="Resend Command Visual Lab">
        <div className={styles.labSwitchBrand}>
          <span className={styles.labSwitchDot} />
          <span className={styles.labSwitchName}>Resend Command Visual Lab</span>
        </div>
        <div className={styles.labTabs} role="tablist">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={tab === item.id}
              className={styles.labTab}
              data-active={tab === item.id ? 'true' : undefined}
              onClick={() => setTab(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </nav>

      <div className={styles.labBody}>
        {tab === 'experiencia' && <ExperienceTab />}
        {tab === 'componentes' && <ComponentsTab />}
        {tab === 'estados' && <StatesTab />}
        {tab === 'tipografia' && <TypographyTab />}
        {tab === 'referencias' && <ReferencesTab />}
      </div>
    </main>
  );
}
