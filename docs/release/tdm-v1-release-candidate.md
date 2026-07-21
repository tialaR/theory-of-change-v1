# TDM V1 — Release Candidate

Documento factual do estado canônico após a Fase 5A (fechamento técnico). Sem redesign.

## 1. Escopo da V1

- Construtor de Teoria da Mudança (canvas + resultado + intérprete).
- Experiências públicas: home, exemplos, guia e referências.
- Design System canônico `--tdm-*` com primitivos `tdm-*` e motion global com `prefers-reduced-motion`.
- Gates automáticos do Design System com baseline congelada.
- Fora de escopo da V1 RC: redesign visual, limpeza tipográfica residual, consolidação final do tooltip ancorado, redução massiva da baseline CSS.

## 2. Rotas canônicas

| Rota | Papel |
| --- | --- |
| `/` | Home / entrada |
| `/canvas` | Editor React Flow |
| `/canvas/resultado` | Resultado a partir do canvas |
| `/exemplos` | Hub de exemplos |
| `/exemplos/visao-do-fluxo` | Visão estática do fluxo |
| `/exemplos/visao-do-fluxo/interativo` | Fluxo interativo |
| `/exemplos/resultado` | Resultado de exemplo |
| `/exemplos/resultado/interativo` | Resultado interativo + inspector |
| `/guia-de-aprendizado` | Guia público |
| `/referencias` | Referências |

Rotas auxiliares existentes (não são o núcleo do RC, mas devem buildar): `/canvas/resend-command-preview`, `/exemplos/canvas`, `/exemplos/fluxo`.

## 3. Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Sass modules
- `@xyflow/react` (React Flow)
- `motion` (MotionConfig + reduced motion)
- ESLint (`eslint-config-next`)

## 4. Design System canônico

Fonte de verdade em `src/shared/styles/tdm/`:

- `_tdm-tokens.sass`, `_tdm-color.sass`, `_tdm-foreground.sass`
- `_tdm-surface.sass`, `_tdm-border.sass`, `_tdm-shadow.sass`
- `_tdm-radius.sass`, `_tdm-focus.sass`, `_tdm-cta.sass`
- `_tdm-icon.sass`, `_tdm-motion.sass`
- `_tdm-spacing.sass`, `_tdm-font.sass`, `_tdm-measure.sass`

Bootstrap via `src/shared/styles/_tokens.sass` e `src/app/globals.sass`.

## 5. Tokens

Contrato público: variáveis CSS `--tdm-*` (cor, superfície, borda, sombra, raio, foco, tipografia, espaçamento, motion, CTA, ícone).

Hardcodes e aliases locais remanescentes estão cobertos pela baseline do gate (`TDM-DS-003`, `TDM-DS-012`) e são débito pós-RC (Fase 5B).

## 6. Primitivos

| Pacote | Caminho |
| --- | --- |
| `TdmButton` | `src/shared/ui/tdm-button/` |
| `TdmIconButton` | `src/shared/ui/tdm-icon-button/` |
| `TdmField` | `src/shared/ui/tdm-field/` |
| `TdmSurface` | `src/shared/ui/tdm-surface/` |
| `TdmTooltip` | `src/shared/ui/tdm-tooltip/` |
| `TdmMotionProvider` | `src/shared/motion/tdm-motion/` |

Paralelo ainda ativo (débito): `src/shared/ui/tooltip/tdm-anchored-tooltip.*` (baseline `TDM-DS-009` / `TDM-DS-010`).

## 7. Acessibilidade

- Foco canônico via tokens `--tdm-focus-*`.
- Controles interativos devem expor labels/`aria-*` nos primitivos e superfícies migradas.
- Navegação por teclado nas rotas canônicas faz parte do smoke test (Tab, Shift+Tab, Enter, Space, Escape quando aplicável).

## 8. Reduced motion

- `TdmMotionProvider` usa `MotionConfig reducedMotion="user"`.
- Tokens de motion em `_tdm-motion.sass`.
- Smoke test deve validar `prefers-reduced-motion: reduce`.

## 9. Gates

- Script: `scripts/check-tdm-design-system.mjs`
- Baseline: `scripts/tdm-design-system-baseline.json`
- Docs: `docs/design-system/tdm-design-system-gates.md`
- O gate falha em violações novas; avisos de baseline obsoleta/apertável não bloqueiam o exit code, mas devem ser tratados em 5B.

## 10. Comandos de validação

```bash
npm run check:tdm-ds
npx tsc --noEmit
npm run build
npm run lint
npm run check:tdm
git diff --check
```

## 11. Débitos conhecidos

1. `npm run lint` falha no HEAD e no working tree com erros `react-hooks/set-state-in-effect` e `react-hooks/refs` em arquivos pré-existentes (edge marker editor, result preview, glass surfaces, result-view paths, anchored tooltip). Correção exige refactor de sincronização de estado/refs — fora da política mecânica da Fase 5A.
2. Warnings ESLint pré-existentes: `ColorBends` exhaustive-deps; `home-brand-logo` `@next/next/no-img-element`; `tdm-sidebar` ref cleanup.
3. Baseline DS com ~3207 violações autorizadas (especificidade, hardcodes, tipografia, loops decorativos, aliases). Sem entradas obsoletas na revisão 5A; remoção planejada na Fase 5B.
4. `TdmAnchoredTooltip` ainda vive em `shared/ui/tooltip` e é consumido por canvas docks / sidebar.
5. Canvas `/canvas`: warning React Flow `#004` (parent sem altura efetiva). `.canvasArea`/`.flowFrame` medem altura 0 apesar do `.shell` a 100vh — débito pré-existente de layout (regras de shell/área inalteradas vs HEAD). Bloqueia QA automatizado de criar/arrastar/conectar nodes. Correção é layout → Fase 5B (fora da 5A).
6. `favicon.ico` 404 (pré-existente, cosmético).
7. Screenshots de fase (`docs/phase-3a-*`, `docs/phase-3b-*`, `docs/phase-3c-*`) são artefatos de validação; não fazem parte do runtime.

## 12. Critérios de aprovação (RC)

- Gates DS: exit 0 (sem novas violações).
- TypeScript: `tsc --noEmit` exit 0.
- Build: `next build` exit 0; rotas canônicas presentes.
- Lint: preferência exit 0; se não, apenas débitos pré-existentes documentados sem regressão introduzida pela migração DS.
- QA manual/smoke das rotas canônicas sem erro de console novo, sem hydration mismatch e sem regressão React Flow (ids/handles/edges).
- Nenhum caminho canônico ignorado pelo Git.

## 13. Arquivos que não devem voltar

- `src/shared/ui/experience/**`
- `src/shared/ui/resend-ds/**`
- `src/shared/ui/resend-experience/**`
- `src/shared/ui/icon-button/**`
- `src/shared/ui/surface/**`
- `src/shared/ui/glass-surface/**`
- `src/shared/ui/tooltip/tooltip.tsx` / `tooltip.module.sass` (legado simples; distinto do anchored tooltip)
- `src/features/theory-of-change/components/public-experience/**` (duplicata removida)

## 14. Checklist manual de smoke test

- [ ] `/` carrega; CTA leva ao canvas/exemplos
- [ ] `/canvas`: criar, editar, salvar, cancelar, duplicar, deletar, selecionar, arrastar, conectar, pan, zoom, enquadrar
- [ ] Sidebar / command dock / process dock abrem e fecham
- [ ] `/canvas/resultado` e retorno ao canvas
- [ ] Intérprete: abrir/fechar, accordions, export actions existentes
- [ ] `/exemplos` e as quatro rotas derivadas
- [ ] Foco visível; Tab / Shift+Tab; Escape onde aplicável
- [ ] Zoom 100% / 125% / 150% sem overflow horizontal crítico
- [ ] `prefers-reduced-motion: reduce`
- [ ] Console sem erro novo; sem 404 de asset; sem hydration mismatch
