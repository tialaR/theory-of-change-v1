# Prévias públicas animadas v2 (motion existente)

## Objetivo

Unificar a moldura visual das prévias animadas nas rotas públicas do TDM — superfície Resend-first simples — sem alterar a animação já aprovada.

## Componentes cobertos

- Visão do fluxo (`FlowDraftPreview`)
- Leitura executiva / Resultado conectado (`ResultDraftPreview` → `ResendDraftPreview`)
- Orquestrador de página (`DedicatedExamplePreview`)
- Moldura compartilhada (`ExamplePreviewFrame`)

## Arquivos canônicos

- `src/features/theory-of-change/components/resend-public/example-previews/example-preview-frame.tsx`
- `src/features/theory-of-change/components/resend-public/example-previews/example-preview-frame.module.sass`
- `src/features/theory-of-change/components/resend-public/example-previews/example-preview-frame.types.ts`
- `src/features/theory-of-change/components/resend-public/example-previews/dedicated-example-preview.tsx`
- `src/features/theory-of-change/components/resend-public/example-previews/flow-draft-preview.tsx`
- `src/features/theory-of-change/components/resend-public/example-previews/resend-draft-preview.tsx`
- `src/features/theory-of-change/components/resend-public/example-previews/result-draft-preview.tsx`

## Motion preservado

A animação atual está aprovada. Não alterar:

- duração, easing, repeat, repeatType, delay, stagger
- strokeDashoffset / strokeDasharray
- opacity timing, keyframes, variants, MotionConfig
- useInView / viewport amount
- paths, coordenadas, quantidade/ordem/conteúdo dos nodes
- cores das etapas
- reduced motion

O HTML de preview define apenas moldura, superfície, borda, padding, viewport e alinhamento — não a animação.

## Wrapper compartilhado

API mínima:

```tsx
type ExamplePreviewFrameProps = {
  children: React.ReactNode
  density?: 'compact' | 'detailed'
  className?: string
  ariaLabel: string
}
```

O wrapper controla somente:

- surface, border, radius, padding
- aspect-ratio, overflow
- alinhamento interno / viewport
- responsividade

Não coloca lógica de animação. Os componentes filhos permanecem responsáveis pelo motion.

## Superfície Resend-first

- uma única superfície
- uma única borda
- sem gradiente ornamental, radial, brilho, glow, bolha
- sem sombra ornamental / sombra interna que simule segunda borda
- sem pseudo-elemento ornamental
- `box-shadow: none`
- hover máximo: mudança mínima de `border-color` (sem translate/scale/background)

## Tokens

Definidos em `src/shared/styles/tdm/_tdm-public-action.sass` e consumidos pela moldura via `var(--tdm-public-preview-*)`.

| Token | Valor de referência |
| --- | --- |
| `--tdm-public-preview-surface` | `rgba(10, 10, 11, 0.88)` |
| `--tdm-public-preview-border` | `rgba(255, 255, 255, 0.11)` |
| `--tdm-public-preview-border-hover` | `rgba(255, 255, 255, 0.16)` |
| `--tdm-public-preview-radius` | `1rem` |
| `--tdm-public-preview-padding` | `1.25rem` |
| `--tdm-public-preview-padding-compact` | `1rem` |
| `--tdm-public-preview-aspect-ratio` | `1520 / 660` |
| `--tdm-public-preview-transition` | `0.16s cubic-bezier(0.2, 0.7, 0.2, 1)` |

Todas as unidades novas em `rem`. Não introduzir `px` nos Sass Modules novos.

## Dimensões e alinhamento

Os dois componentes devem compartilhar:

- mesma largura externa
- mesmo aspect-ratio
- mesmo padding externo
- mesmo viewport interno
- mesmo alinhamento horizontal e vertical
- mesmo comportamento responsivo
- mesma distância da animação até as bordas

Preferir viewport interno com:

- `display: grid`
- `place-items: center`
- `inline-size: 100%` / `block-size: 100%`
- `min-inline-size: 0` / `min-block-size: 0`

SVG: `inline-size`/`block-size` 100%, `display: block`, `preserveAspectRatio` consistente.

Proibido para encaixe:

- `transform: scale()`
- zoom
- margem negativa
- `position: absolute` corretivo
- padding diferente por página
- override local no consumidor

## compact vs detailed

- `compact` — Visão do fluxo (conteúdo internamente mais enxuto)
- `detailed` — Leitura executiva / Resultado

A densidade não altera a régua do container (padding, aspect-ratio, borda, superfície).

## Responsividade

- moldura `inline-size: 100%`
- padding reduz para `1rem` abaixo de `48rem`
- aspect-ratio preservado

## Reduced motion

Preservar o comportamento já aprovado nos componentes de animação (`useReducedMotion`, media queries existentes). A moldura apenas encurta a transição de borda.

## Exemplos proibidos

```tsx
{/* moldura local duplicada */}
<div className={styles.myOwnFrame}>
  <FlowDraftPreview />
</div>

{/* background/borda locais no consumidor */}
<div style={{ background: '#111', border: '0.0625rem solid #333' }}>
  <ResultDraftPreview />
</div>

{/* scale para “encaixar” */}
<svg style={{ transform: 'scale(0.92)' }} />
```

## Denylist do canvas

Nenhum destes caminhos pode importar `ExamplePreviewFrame` nem a roupa pública de prévia:

- `/canvas`
- `/exemplos/canvas`
- React Flow
- nodes / edges / handles
- sidebar do canvas
- componentes internos do motor do canvas

## Preview HTML

`docs/design-system/previews/tdm-public-example-previews-v2-existing-motion.html`

## Comando do gate

```bash
npm run check:tdm-public-ui
```
