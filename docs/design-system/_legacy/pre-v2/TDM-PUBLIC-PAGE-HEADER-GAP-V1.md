# TDM Public Page Header Gap V1

Status: CANÔNICO

## Objetivo

Criar um respiro vertical consistente entre o header público e o primeiro conteúdo das páginas públicas secundárias, sem alterar a geometria interna dos heroes.

## Rotas

- `/guia-de-aprendizado`
- `/exemplos`
- `/exemplos/visao-do-fluxo`
- `/exemplos/resultado`
- `/referencias`

## Regra

- um único token/mixin/classe compartilhada;
- respiro adicional sugerido: `clamp(2.5rem, 4vw, 4rem)`;
- preferência por `padding-block-start` no wrapper raiz;
- eixo X, width, max-width, padding-inline e componentes internos congelados;
- Home, Canvas e rotas interativas fora do escopo.

## Referência

`references/public-pages-header-gap-reference.png`, usando `/exemplos` como benchmark visual.
