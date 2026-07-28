# CTAs, icon buttons e header públicos v2

## Objetivo

Unificar a hierarquia visual das ações nas rotas públicas do TDM: uma primária preenchida por contexto, secundárias textuais sem borda, exportações e icon buttons com hairline, e header transparente no topo com carcaça flutuante após scroll.

## Escopo

Rotas e superfícies públicas, incluindo:

- `/`
- `/guia-de-aprendizado`
- `/exemplos`
- `/exemplos/visao-do-fluxo`
- `/exemplos/resultado`
- `/referencias`
- demais consumidores públicos de `PublicHeader`, `PublicButton` e `PublicIconButton`

## Denylist do canvas

Nenhum destes caminhos pode receber `PublicButton`, `PublicIconButton` ou a roupa pública v2:

- `/canvas`
- componentes internos do canvas
- sidebar do canvas
- nodes
- edges
- React Flow
- `/exemplos/canvas` ou qualquer rota que reutilize o motor do canvas
- estilos feature-scoped do canvas

## Hierarquia das ações

Cada página ou contexto principal deve ter:

- no máximo uma ação principal preenchida (`primary`)
- demais ações textuais sem borda (`text` ou `textCompact`)

### Por rota

| Rota | Primária | Secundárias | Exceções |
| --- | --- | --- | --- |
| `/` | Criar teoria (`primary`, `size="hero"`) | Ver exemplo (`text`) | — |
| `/guia-de-aprendizado` | Header: Criar teoria (`textCompact`) | — | Header transparente → flutuante |
| `/exemplos` | Ver exemplos (`primary`) | Abrir nos cards (texto do card) | — |
| `/exemplos/visao-do-fluxo` | Abrir experiência interativa (`primary`) | Voltar para exemplos (`text`) | — |
| `/exemplos/resultado` | Abrir visualização interativa (`primary`) | Voltar (`text`) | Exportar PDF/PNG/SVG (`exportCompact`) |
| `/referencias` | Ver guia (`primary`) | Abrir → nos cards | — |
| Header público | — | Criar teoria (`textCompact`) | Sem borda |

## Variantes permitidas

`PublicButton`:

- `primary`
- `text`
- `textCompact`
- `exportCompact`

`PublicIconButton`: único primitive para botões autônomos só com ícone fora do canvas.

Deprecated nas rotas públicas:

- CTA textual outlined genérico (secundária com borda para navegação comum)

## Tokens

Definidos em `src/shared/styles/tdm/_tdm-public-action.sass` e publicados via `_tdm-tokens.sass`.

Unidades canônicas em `rem`. Consumidores não devem repetir literais de cor ou medida.

Famílias principais:

- `--tdm-public-action-*` (gerais, padrão, hero, compact)
- `--tdm-public-text-action-*`
- `--tdm-public-header-action-*`
- `--tdm-public-icon-button-*`
- `--tdm-public-header-shell-*`
- cores `--tdm-public-action-primary-*`, `--tdm-public-action-line*`, `--tdm-public-action-text*`

## Estados

### `primary`

- Repouso: fundo claro, texto escuro, uma borda, `box-shadow: none`
- Hover: só clareia fundo e borda; sem scale; sem sombra
- Press: fundo discretamente mais escuro; sem mudança geométrica
- Focus-visible: outline `0.125rem`, offset `0.1875rem`
- Disabled: opacidade reduzida; `disabled` / `aria-disabled` preservados

### `text` / `textCompact`

- Fundo sempre transparente; `border: 0`
- Altura clicável `2.75rem` (header compacta usa tokens próprios)
- Hover altera somente cor; setas podem deslocar `0.125rem`
- Sem scale; sem background cinza; foco visível obrigatório

### `exportCompact`

- Fundo transparente; uma hairline; altura mínima `2.75rem`
- Sem formato de chip; hover discreto; sem sombra

### `PublicIconButton`

- Quadrado `2.75rem`; fundo transparente; hairline neutra
- Ícone centralizado; `aria-label` obrigatório
- Hover discreto; sem glow; sem efeito bolha; sem sombra ornamental

## Acessibilidade

- Preservar `href`, `onClick`, `type`, `disabled`, `loading`, `aria-label`, `target`, `rel`
- Não trocar `<Link>` por `<button>` ou vice-versa
- Focus-visible obrigatório em todas as variantes
- Icon buttons exigem `aria-label`
- Respeitar `prefers-reduced-motion` nas transições do header e das ações

## Comportamento do header

### Topo

- `background: transparent`
- `border-color: transparent`
- `backdrop-filter: none`
- `box-shadow: none`
- aparência de que a carcaça não existe
- conteúdo permanece visível e na mesma posição

### Após scroll

- `background: rgba(7, 7, 8, 0.88)` via token
- `backdrop-filter: blur(1rem)`
- borda `0.0625rem solid` via token de linha
- `border-radius: 0.875rem`
- `padding: 0.875rem 1rem`
- sem sombra ornamental

### Transição

- duração `0.16s`
- easing `cubic-bezier(0.2, 0.7, 0.2, 1)`
- propriedades: `background-color`, `border-color`, `backdrop-filter`, `border-radius`
- sem alteração brusca de largura; sem movimento dos links; sem layout shift

### Implementação

- `IntersectionObserver` + sentinel no topo
- sem listener de scroll por frame
- sem pathname, provider ou context global
- wrapper externo preserva altura/posição; só a carcaça interna muda

## Header único e remoção do legado

- Somente um `PublicHeader` pode ser renderizado por página pública.
- Header legado deve ser removido do JSX — esconder com CSS é proibido (`display: none`, `opacity: 0`, `visibility: hidden`, `z-index` negativo, media query ou pathname para “ocultar” um segundo header).
- No topo: carcaça transparente; após scroll: carcaça TMD-first flutuante.
- Nenhum header público pode ser criado diretamente por páginas — use `PublicHeader` de `@/shared/ui/tdm-public-design-system`.
- Não reintroduzir blocos Sass legados que pintem `.header` com fundo opaco, `border-bottom` full-bleed ou sombra ornamental em paralelo à `.headerShell`.

## Mapa de migração por rota

| Rota | Texto | Arquivo | Primitive antigo | Variante nova | Href / callback |
| --- | --- | --- | --- | --- | --- |
| `/` | Criar teoria | `public-pages.tsx` | `PublicButton` → `TdmButton` | `primary` + `hero` | `/canvas` |
| `/` | Ver exemplo | `public-pages.tsx` | `PublicButton` ghost | `text` | `/exemplos/resultado` |
| Header | Criar teoria | `tdm-public-design-system.tsx` | `TdmButton` tertiary | `textCompact` | `/canvas` |
| `/exemplos` | Ver exemplos | `public-pages.tsx` | `PublicButton` primary | `primary` | `#examples-experiences` |
| `/exemplos/visao-do-fluxo` | Abrir experiência interativa | `example-overview-card.tsx` | `TdmButton` primary | `primary` | `/exemplos/visao-do-fluxo/interativo` |
| `/exemplos/visao-do-fluxo` | Voltar para exemplos | `example-overview-card.tsx` | `TdmButton` tertiary | `text` | `/exemplos` |
| `/exemplos/resultado` | Abrir visualização interativa | `example-overview-card.tsx` | `TdmButton` primary | `primary` | `/exemplos/resultado/interativo` |
| `/exemplos/resultado` | Voltar para exemplos | `example-overview-card.tsx` | `TdmButton` tertiary | `text` | `/exemplos` |
| `/exemplos/resultado` | Exportar PDF/PNG/SVG | `public-pages.tsx` | `TdmButton` secondary | `exportCompact` | `type="button"` |
| `/referencias` | Ver guia | `public-pages.tsx` | `PublicButton` primary | `primary` | `/guia-de-aprendizado` |
| Interactive (legado) | Zoom ± | `public-pages.tsx` | `<button class="toolBtn">` | `PublicIconButton` | callbacks locais |
| Interactive (legado) | Centralizar / Reiniciar / Fechar | `public-pages.tsx` | toolBtn / Link | `text` | callbacks / `/exemplos/visao-do-fluxo` |

## Exemplos corretos

```tsx
<PublicButton href="/canvas" variant="primary" size="hero">
  Criar teoria
</PublicButton>

<PublicButton href="/exemplos/resultado" variant="text">
  Ver exemplo
</PublicButton>

<PublicButton type="button" variant="exportCompact">
  Exportar PDF
</PublicButton>

<PublicButton href="/canvas" variant="textCompact">
  Criar teoria
</PublicButton>

<PublicIconButton aria-label="Aumentar zoom" onClick={onZoomIn}>
  <PlusIcon />
</PublicIconButton>
```

## Exemplos proibidos

```tsx
{/* outlined textual genérico em rota pública */}
<PublicButton variant="secondary">Ver exemplo</PublicButton>

{/* nova roupa local em cima do primitivo */}
<button className={styles.legacyCta}>Criar teoria</button>

{/* icon button sem aria-label */}
<PublicIconButton onClick={onClose}>
  <CloseIcon />
</PublicIconButton>

{/* import público dentro do canvas */}
import { PublicButton } from '@/shared/ui/public-button';
```

## Preview HTML

`docs/design-system/previews/tdm-public-actions-header-v2.html`

## Comando do gate

```bash
npm run check:tdm-public-ui
```
