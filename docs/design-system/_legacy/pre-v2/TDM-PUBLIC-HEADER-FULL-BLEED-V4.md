# TDM Public Header Full-Bleed V4

## Status
CANÔNICO após validação humana.

## Objetivo
Aplicar a superfície visual do header público em toda a largura do viewport, mantendo o conteúdo interno no mesmo container, com os mesmos espaçamentos e o mesmo comportamento de aparição após scroll.

## Arquitetura obrigatória

O header possui duas responsabilidades distintas:

1. **Shell full-bleed**
   - ocupa `inset-inline: 0` e o topo completo do viewport;
   - recebe background, blur e border-bottom;
   - cobre também as áreas laterais e a área superior/safe-area;
   - possui o z-index já adotado pelo header ativo;
   - não altera o fluxo ou as medidas dos filhos.

2. **Container interno preservado**
   - mantém `max-width`, `padding-inline`, altura, alinhamentos, gaps e breakpoints existentes;
   - contém logo, navegação e CTA;
   - não recebe background, border, glow ou shadow próprios.

## Superfície homologada

```sass
background: rgba(7, 8, 9, 0.76)
border-bottom: 0.0625rem solid rgba(255, 255, 255, 0.05)
box-shadow: none
backdrop-filter: blur(1.25rem) saturate(120%)
-webkit-backdrop-filter: blur(1.25rem) saturate(120%)
```

A superfície deve existir somente no shell externo. A borda deve percorrer 100% do eixo X.

## Comportamento congelado

- no topo, o header continua oculto;
- após o limiar de scroll atual, aparece;
- ao retornar ao topo, volta ao estado previsto pela implementação atual;
- observer, sentinel, threshold, timing e easing permanecem inalterados;
- logo, links, CTA, foco, navegação por teclado e responsividade permanecem inalterados.

## Remoção de legado

Eliminar do consumidor ativo qualquer camada visual antiga que tente vestir o header em paralelo:

- background no container interno;
- pseudo-elementos `::before` ou `::after` decorativos antigos;
- reflexos, glows, gradientes, máscaras e imagens de fundo do header anterior;
- wrappers duplicados de superfície;
- shadows ou borders legadas;
- elementos posicionados acima do header sem função semântica.

Não manter código morto comentado. Não esconder o legado com outra camada.

## Artefato observado no overscroll

No vídeo de referência, ao tensionar o scroll no topo, aparece uma forma branca no centro superior, atrás/acima do header. Isso não pertence ao header novo.

A correção deve:

1. identificar a origem real no DOM/CSS;
2. remover a camada ou regra legada;
3. garantir que conteúdo da hero permaneça abaixo do plano do header;
4. manter o shell do header isolado e com pintura recortada;
5. não desabilitar o overscroll nativo como atalho para esconder o problema.

Pode-se usar `isolation: isolate` e `overflow: clip` no shell somente quando compatível com o DOM real e sem cortar foco ou conteúdo do próprio header.

## Critérios de aceite

- fundo cobre 100% da largura, sem faixas transparentes laterais;
- fundo cobre toda a área superior do header;
- border-bottom atravessa o viewport inteiro;
- container interno conserva coordenadas e espaçamentos anteriores;
- nenhum elemento branco aparece ao puxar o scroll no topo;
- somente uma superfície/header ativo existe no runtime;
- zero overflow horizontal;
- nenhuma alteração em conteúdo, rotas, Canvas ou domínio.
