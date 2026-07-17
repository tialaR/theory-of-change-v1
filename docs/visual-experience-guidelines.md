# Diretrizes de Experiência Visual

## Fonte canônica de identidade visual e movimento

O padrão obrigatório está em:

`docs/resend-visual-motion-standard.md`

- Resend é a principal referência de disciplina visual para UI de produto.
- Lusion pode continuar como referência ambiental limitada a heros e
  composições editoriais específicas.
- Lusion não governa movimento de componentes.
- Movimento de produto segue o padrão TDM Resend.
- Cores da TDM permanecem como identidade semântica própria.
- Não copiar marca, conteúdo ou assets do Resend.

## DS público: `lusion-resend-ds`

Rotas públicas usam exclusivamente o design system em `src/shared/ui/lusion-resend-ds/`. Não reutilizar componentes visuais do DS antigo (`resend-ds`, `experience`, `resend-experience`) nas páginas públicas.

### Referências visuais

| Área | Referência | Lógica replicada |
|------|-----------|------------------|
| Home `/` | [Lusion Labs About](https://labs.lusion.co/about) | Hero dark imersivo, composição central, tipografia editorial (referência ambiental; motion de produto segue TDM Resend) |
| Rotas internas | Páginas de produto estilo SaaS dark | Header fino, grid/dots, seções amplas, cards com borda fina, CTAs pill, scroll narrativo |

Não copiar marcas, logos, textos ou assets proprietários.

### Tipografia pública

Seções públicas devem seguir o padrão tipográfico: kicker uppercase com tracking, título prata/cinza premium, descrição cinza suave, hierarquia controlada e cards com título forte + descrição secundária. Mixins reutilizáveis em `src/features/theory-of-change/components/resend-public/_public-typography.sass`.

### Tokens obrigatórios

Definidos em `lusion-resend-ds.module.sass`:

- `noir`, `graphite`, `smoke`, `ash` — fundos
- `white`, `muted`, `body-muted` — texto
- `border`, `card-border`, `card-bg` — superfícies
- `green`, `green-soft`, `glow` — acento
- `grid-dot` — grade de fundo
- `hero-title` — escala do título principal

Paleta: fundo quase preto, texto branco/cinza, verde só como acento. Sem roxo/azul/laranja como identidade nas rotas públicas.

### Exceção: `/guia-de-aprendizado`

- Usar `PublicShell` com `tone="silver"` para remover o glow verde global.
- Kicker, linha do tempo e brilhos decorativos em branco/prata translúcido com gradiente reluzente.
- Cores por etapa (não como identidade global):
  - Fundamentos / conexões / leitura final: branco/prata
  - Insumos: violeta/lilás
  - Atividades: azul
  - Produtos: âmbar/laranja
  - Resultados: verde/menta
- Timeline: linha fina branco/prata, bolinhas por passo, bolinha ativa com brilho e cor da etapa.
- Cards da direita: glass/noir, maiores, com título, descrição, recomendação e exemplo.
- Hero sem botão, sem ícone decorativo; título em escala menor que a home.

### Unidades

- Usar `rem` para espaçamento, radius, fonte, gaps, padding, margin e dimensões de UI.
- Usar `clamp()` para responsividade.
- Evitar `px`, exceto hairline borders (1px), SVG/canvas e detalhes técnicos inevitáveis.

### Scroll

- Todas as rotas públicas têm scroll vertical normal.
- Usar `min-height`, nunca `height: 100vh`/`100dvh` em wrappers de página com conteúdo maior que a tela.
- Não usar `overflow: hidden` no body das rotas públicas.
- Classe `public-page-scroll` no body (aplicada por `PublicShell`) libera scroll quando o canvas trava o body globalmente.

### Motion

- Biblioteca: `motion/react`
- Movimento intencional; entrada única; estado final estático
- Easing padrão: `[0.22, 1, 0.36, 1]`
- Sem loops decorativos; sem `linear`; sem pulsação; sem glow animado
- Usar `useReducedMotion` — com preferência ativa, mostrar o estado final imediatamente
- Toda animação de `opacity` deve ter `initial={{ opacity: 0 }}` (ou valor numérico explícito) — nunca `undefined`
- Consultar o documento canônico: `docs/resend-visual-motion-standard.md`

### Quando usar cada componente

| Componente | Uso |
|-----------|-----|
| `PublicHero` | Abertura de página, título editorial |
| `PublicSection` | Blocos narrativos com eyebrow + título |
| `PublicCard` | Conteúdo em blocos fechados |
| `PublicMockup` | Prévias de interface |
| `PublicTimeline` | Guia passo a passo com scroll |
| `PublicCodePanel` | Blocos técnicos / estrutura |
| `TheoryFlowBoard` | Fluxo causal com colunas, setas, badges R/H |

### Exceção: `/canvas`

A rota `/canvas` permanece com o DS antigo e será migrada por último. Não alterar visual do canvas nesta fase.

### Conteúdo

- UI em PT-BR
- Sem palavras em inglês na interface pública
- Textos curtos, quebrados em cards e seções
