import {
  PublicFooter,
  PublicHeader,
  PublicHero,
  PublicShell
} from '@/shared/ui/tdm-public-layout';
import { ExamplePreviewsSection } from './public-page-dependencies';
import { ContextLabelLayoutGridIcon } from '@/shared/ui/tdm-context-label';
import { TdmButton } from '@/shared/ui/tdm-button';
import { TdmEyeIcon } from '@/shared/ui/tdm-icons';
import { TdmKicker } from '@/shared/ui/tdm-kicker';

export function ExamplesPage() {
  return (
    <PublicShell headerContentGap sectionRhythm>
      <PublicHeader />
      <PublicHero
        compact
        kicker={
          <TdmKicker icon={ContextLabelLayoutGridIcon}>
            EXEMPLOS
          </TdmKicker>
        }
        title="Explore exemplos guiados."
        description="Veja prévias animadas da teoria antes de abrir a experiência completa."
        actions={
          <TdmButton
            href="#examples-experiences"
            recipe="public"
            leadingIcon={<TdmEyeIcon />}
          >
            Ver exemplos
          </TdmButton>
        }
      />
      <div id="examples-experiences" data-public-chapter="true">
        <ExamplePreviewsSection />
      </div>
      <PublicFooter />
    </PublicShell>
  );
}
