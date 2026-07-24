export const TDM_CONTRACT_VERSION = '2.0.0';

export const routeEntries = [
  { route: '/', entry: 'src/app/page.tsx', kind: 'public' },
  { route: '/guia-de-aprendizado', entry: 'src/app/guia-de-aprendizado/page.tsx', kind: 'public-guide' },
  { route: '/exemplos', entry: 'src/app/exemplos/page.tsx', kind: 'public' },
  { route: '/exemplos/fluxo', entry: 'src/app/exemplos/fluxo/page.tsx', kind: 'public-alias' },
  { route: '/exemplos/visao-do-fluxo', entry: 'src/app/exemplos/visao-do-fluxo/page.tsx', kind: 'public' },
  { route: '/exemplos/visao-do-fluxo/interativo', entry: 'src/app/exemplos/visao-do-fluxo/interativo/page.tsx', kind: 'workspace' },
  { route: '/exemplos/resultado', entry: 'src/app/exemplos/resultado/page.tsx', kind: 'public' },
  { route: '/exemplos/resultado/interativo', entry: 'src/app/exemplos/resultado/interativo/page.tsx', kind: 'workspace' },
  { route: '/referencias', entry: 'src/app/referencias/page.tsx', kind: 'public' }
];

export const excludedRoots = [
  'src/app/canvas',
  'src/app/exemplos/canvas',
  'src/features/theory-of-change/components/canvas',
  'src/features/theory-of-change/components/sidebar',
  'src/features/theory-of-change/components/edge',
  'src/features/theory-of-change/components/node'
];

export const protectedVisualFiles = [
  'src/features/theory-of-change/components/public-pages/guided-story.tsx',
  'src/features/theory-of-change/components/public-pages/guided-story-scheduler.ts',
  'src/features/theory-of-change/components/resend-public/example-previews/flow-draft-preview.tsx',
  'src/features/theory-of-change/components/resend-public/example-previews/flow-draft-preview.module.sass',
  'src/features/theory-of-change/components/resend-public/example-previews/result-draft-preview.tsx',
  'src/features/theory-of-change/components/resend-public/example-previews/resend-draft-preview.tsx',
  'src/features/theory-of-change/components/resend-public/example-previews/resend-draft-preview.module.sass',
  'src/features/theory-of-change/components/resend-public/example-previews/example-preview-motion.ts',
  'src/features/theory-of-change/components/result-view/experience/flow-vision-diagram.tsx',
  'src/features/theory-of-change/components/result-view/experience/flow-vision-node-card.tsx',
  'src/features/theory-of-change/components/result-view/experience/flow-vision-node-card.module.sass',
  'src/features/theory-of-change/components/result-view/experience/result-diagram.tsx',
  'src/features/theory-of-change/components/result-view/result-connections-layer/result-connections-layer.tsx',
  'src/features/theory-of-change/components/result-view/result-connections-layer/result-connections-layer.module.sass',
  'src/features/theory-of-change/components/result-view/result-node-card/result-node-card.tsx',
  'src/features/theory-of-change/components/result-view/result-node-card/result-node-card.module.sass',
  'src/features/theory-of-change/components/result-view/result-stage-column/result-stage-column.tsx',
  'src/features/theory-of-change/components/result-view/result-stage-column/result-stage-column.module.sass'
];

export const canonicalComponentFamilies = {
  button: ['src/shared/ui/tdm-button/tdm-button.tsx'],
  iconButton: ['src/shared/ui/tdm-icon-button/tdm-icon-button.tsx'],
  menu: ['src/shared/ui/tdm-menu/tdm-menu.tsx'],
  tooltip: ['src/shared/ui/tdm-tooltip/tdm-tooltip.tsx'],
  surface: ['src/shared/ui/tdm-surface/tdm-surface.tsx'],
  field: ['src/shared/ui/tdm-field/tdm-field.tsx'],
  contextLabel: ['src/shared/ui/tdm-context-label/tdm-context-label.tsx'],
  kicker: ['src/shared/ui/tdm-kicker/tdm-kicker.tsx'],
  featureCard: ['src/shared/ui/tdm-public-feature-card/tdm-public-feature-card.tsx'],
  statusScreen: ['src/shared/ui/tdm-status-screen/tdm-status-screen.tsx']
};

export const legacyComponentFamilies = {
  button: [],
  iconButton: [],
  tooltip: [
    'src/shared/ui/tooltip/tdm-anchored-tooltip.tsx'
  ],
  surface: [
    'src/features/theory-of-change/components/result-view/tdm-glass-surface.tsx',
    'src/features/theory-of-change/components/result-view/liquid-glass/glass-surface.tsx'
  ]
};

export const tokenDefinitionFiles = [
  'src/shared/styles/tdm/_tdm-color.sass',
  'src/shared/styles/tdm/_tdm-surface.sass',
  'src/shared/styles/tdm/_tdm-border.sass',
  'src/shared/styles/tdm/_tdm-radius.sass',
  'src/shared/styles/tdm/_tdm-shadow.sass',
  'src/shared/styles/tdm/_tdm-icon.sass',
  'src/shared/styles/tdm/_tdm-focus.sass',
  'src/shared/styles/tdm/_tdm-motion.sass',
  'src/shared/styles/tdm/_tdm-font.sass',
  'src/shared/styles/tdm/_tdm-foreground.sass',
  'src/shared/styles/tdm/_tdm-spacing.sass',
  'src/shared/styles/tdm/_tdm-measure.sass',
  'src/shared/styles/tdm/_tdm-cta.sass',
  'src/shared/styles/tdm/_tdm-public-action.sass',
  'src/shared/styles/tdm/_tdm-route.sass',
  'src/shared/styles/tdm/_tdm-guide.sass',
  'src/shared/styles/tdm/_tdm-tokens.sass'
];

export const heavyDependencies = [
  '@react-pdf/renderer',
  '@xyflow/react',
  'docx',
  'html-to-image',
  'motion'
];

export const strictThresholds = {
  componentLines: 300,
  styleLines: 500,
  hooks: 14,
  states: 8,
  callbacks: 12,
  ternaries: 10,
  nestedTernaries: 0,
  important: 0,
  staticInlineStyles: 0,
  hardcodedColors: 0
};

export const activeDesignSystemDocs = [
  'docs/design-system/TDM-DESIGN-SYSTEM-CONTRACT-V2.md',
  'docs/design-system/TDM-NON-CANVAS-SCOPE-V1.md',
  'docs/design-system/TDM-TOKEN-CONTRACT-V2.md',
  'docs/design-system/TDM-COMPONENT-CONTRACT-V2.md',
  'docs/design-system/TDM-ARCHITECTURE-CONTRACT-V1.md',
  'docs/design-system/TDM-ROUTE-FRAME-CONTRACT-V1.md',
  'docs/design-system/TDM-MIGRATION-MAP-V1.md',
  'docs/design-system/TDM-OFFICIAL-REFERENCES-V1.md',
  'docs/design-system/TDM-ACTIONS-MIGRATION-V1.md',
  'docs/design-system/TDM-ACTIONS-HOTFIX-V1.1.md',
  'docs/design-system/TDM-STRUCTURE-MIGRATION-V1.md',
  'docs/design-system/TDM-ARCHITECTURE-MIGRATION-V1.md',
  'docs/design-system/TDM-CONSOLIDATION-MIGRATION-V1.md',
  'docs/design-system/TDM-PERFORMANCE-BOUNDARIES-V1.md',
  'docs/design-system/previews/tdm-ds-foundation-v2.html',
  'docs/design-system/previews/tdm-actions-migration-v1.html',
  'docs/design-system/previews/tdm-structure-migration-v1.html',
  'docs/design-system/previews/tdm-architecture-migration-v1.html',
  'docs/design-system/previews/tdm-consolidation-migration-v1.html',
  'docs/design-system/previews/tdm-performance-boundaries-v1.html'
];
