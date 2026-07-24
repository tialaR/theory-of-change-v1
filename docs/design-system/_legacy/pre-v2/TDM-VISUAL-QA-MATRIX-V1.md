# TDM Visual QA Matrix v1

## Viewports mínimos

- desktop amplo: `90rem x 56.25rem`;
- desktop médio: `64rem x 48rem`;
- mobile: `24.375rem x 52.75rem`.

## Rotas públicas

### `/`

- header no topo transparente;
- header após scroll com superfície homologada;
- hero não invade header;
- CTA principal e ação textual seguem preview;
- cards públicos usam primitive canônico;
- motion sem layout shift.

### `/guia-de-aprendizado`

- header único;
- timeline e cards alinhados;
- labels contextuais usam `TdmContextLabel`;
- motion não altera altura dos cards;
- navegação por teclado completa.

### `/exemplos`

- cards de entrada com mesma altura;
- ação principal única;
- previews não criam overflow;
- header único.

### `/exemplos/visao-do-fluxo`

- frame canônico;
- motion existente intacto;
- padding equilibrado;
- CTA principal e voltar preservados.

### `/exemplos/resultado`

- frame canônico;
- colunas centralizadas;
- exportações compactas;
- CTA principal e voltar preservados.

### `/referencias`

- header único;
- hierarquia editorial;
- links com foco visível;
- nenhum CTA outlined legado.

## Rotas interativas

### `/exemplos/visao-do-fluxo/interativo`

- não reutilizar preview editorial como motor;
- cards, edges e intérprete preservados;
- foco e teclado;
- sem alterações vindas do wrapper público de preview.

### `/exemplos/resultado/interativo`

- resultado canônico intacto;
- exports funcionais;
- motion e seleção preservados.

## Canvas congelado

Nas rodadas públicas, apenas provar ausência de diff em:

- `src/features/theory-of-change/components/canvas/**`;
- `src/features/theory-of-change/components/sidebar/**`;
- `src/features/theory-of-change/components/node/**`;
- `src/features/theory-of-change/components/edge/**`.

## Estados obrigatórios por componente

- rest;
- hover;
- active/pressed;
- focus-visible;
- disabled;
- loading, quando existir;
- reduced motion;
- zoom 200%;
- teclado.

## Evidências mínimas

- screenshot de cada rota no desktop;
- screenshot do header no topo;
- screenshot do header após scroll;
- screenshot das prévias Fluxo e Resultado;
- gravação curta do motion homologado;
- relatório dos estilos computados dos primitives canônicos;
- `git diff --check`;
- TypeScript;
- build;
- gates do DS.
