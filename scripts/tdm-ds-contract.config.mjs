export const contractConfig = {
  requiredFiles: [
    'docs/design-system/TDM-DESIGN-SYSTEM-CONTRACT-V1.md',
    'docs/design-system/TDM-PUBLIC-HEADER-V2.md',
    'docs/design-system/TDM-VISUAL-QA-MATRIX-V1.md',
    'docs/design-system/previews/tdm-public-actions-header-v2.html',
    'docs/design-system/previews/tdm-public-example-previews-v2-existing-motion.html',
    '.cursor/rules/00-tdm-design-system-router.mdc',
    '.cursor/rules/10-tdm-public-ui.mdc',
    '.cursor/rules/20-tdm-canvas-freeze.mdc',
    '.cursor/rules/30-tdm-motion.mdc',
    '.cursor/rules/40-tdm-tokens-components.mdc',
  ],

  // O Cursor deve preencher estes caminhos após a auditoria do repositório atual.
  canonicalPublicHeaderModule: 'src/shared/ui/lusion-resend-ds/lusion-resend-ds.tsx',
  canonicalPublicHeaderStyleModule: 'src/shared/ui/lusion-resend-ds/lusion-resend-ds.module.sass',
  legacyPublicHeaderModules: [
    'src/features/theory-of-change/components/floating-header/floating-header.tsx',
  ],
  canonicalPublicButtonModule: 'src/shared/ui/public-button/public-button.tsx',
  canonicalPublicIconButtonModule: 'src/shared/ui/public-icon-button/public-icon-button.tsx',
  canonicalExamplePreviewFrameModule: 'src/features/theory-of-change/components/resend-public/example-previews/example-preview-frame.tsx',

  canvasDenylistRoots: [
    'src/features/theory-of-change/components/canvas',
    'src/features/theory-of-change/components/sidebar',
    'src/features/theory-of-change/components/node',
    'src/features/theory-of-change/components/edge',
    'src/app/canvas',
    'src/app/exemplos/canvas',
  ],

  publicUiRoots: [
    'src/shared/ui',
    'src/features/theory-of-change/components/public-pages',
    'src/features/theory-of-change/components/resend-public',
  ],
};
