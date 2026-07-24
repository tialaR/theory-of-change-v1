# TDM Public Section Rhythm V1

Status: CANÔNICO

## Objetivo

Separar visualmente as experiências públicas consecutivas usando espaço no eixo Y, sem adicionar divisores, superfícies, cards ou ornamentos.

## Rotas consumidoras

- `/`
- `/exemplos`
- `/exemplos/visao-do-fluxo`
- `/exemplos/resultado`
- `/referencias`

`/guia-de-aprendizado` mantém apenas o contrato de respiro entre header e primeiro conteúdo já homologado. Canvas e rotas interativas ficam fora deste contrato.

## Regra estrutural

- aplicar o espaço somente entre seções semânticas irmãs;
- não alterar gaps internos de hero, intro, cards, grids ou CTAs;
- usar um único token semântico no DS público;
- valor de referência: `clamp(6rem, 9vw, 9rem)` em desktop/tablet;
- mobile pode reduzir semanticamente para `clamp(4.5rem, 14vw, 5.5rem)`;
- o espaço deve aparecer uma única vez, sem soma de margins locais;
- preferir `margin-block-start` na seção posterior ou um stack compartilhado com `gap`;
- não usar `<br>`, spacer vazio, border, background ou pseudo-elemento como separador.

## Resultado visual

Cada capítulo público deve ser reconhecido como uma experiência independente. O final de uma composição não pode colar no eyebrow ou título da composição seguinte.

## Benchmark ativo

Na rota `/exemplos/visao-do-fluxo`, o bloco secundário com label `Visão do fluxo` e título `O caminho antes da leitura final.` é a referência de intro editorial alinhada à esquerda.

## Implementação ativa (2026-07-22)

- Token: `--tdm-public-section-gap` em `_tdm-public-action.sass` (`clamp(6rem, 9vw, 9rem)`; mobile `clamp(4.5rem, 14vw, 5.5rem)` via `@media (max-width: 48rem)` em `_tdm-tokens.sass`).
- Prop: `PublicShell sectionRhythm` → `data-section-rhythm` + `.shellInner_sectionRhythm`.
- Capítulos: `data-public-chapter="true"` em `PublicHero`, `PublicSection`, `PublicFooter` e wrappers semânticos (`resultLayout` / `resultChapter` / `#examples-experiences`).
- Espaço aplicado uma vez: `.shellInner_sectionRhythm > [data-public-chapter] ~ [data-public-chapter] { margin-block-start: var(--tdm-public-section-gap) }`.
- Padding/margin locais de seção, hero (block-end) e footer (margin-top) normalizados a zero sob o ritmo para evitar soma.
- Rotas: `/`, `/exemplos`, `/exemplos/visao-do-fluxo`, `/exemplos/resultado`, `/referencias`. Fora: `/guia-de-aprendizado`, Canvas, interativos.
