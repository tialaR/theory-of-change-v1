# TDM Architecture Contract V1

## App Router

`src/app` contém somente:

- rotas;
- layouts;
- metadata;
- loading;
- error/global-error;
- not-found;
- route handlers quando existirem;
- composição mínima de feature.

Páginas e layouts permanecem Server Components por padrão.

## Feature-based

Destino recomendado:

```text
src/
├── app/
├── shared/
│   ├── ui/
│   ├── styles/tdm/
│   ├── lib/
│   └── hooks/
└── features/
    ├── public-home/
    ├── learning-guide/
    ├── examples/
    ├── flow-vision/
    ├── result-experience/
    └── references/
```

Cada feature exporta sua API por `index.ts`. Não importar internals de outra feature.

## Client boundaries

Use Client Component apenas para:

- eventos;
- state;
- efeitos;
- browser APIs;
- bibliotecas que exigem DOM.

Um primitive Client não obriga toda a página a receber `'use client'`. Server Components podem compor pequenas ilhas Client.

## God Components

Limites de criação:

- TSX: 300 linhas;
- Sass Module: 500 linhas;
- state: 8;
- hooks: 14;
- callbacks: 12.

Legado acima do limite não pode crescer. A redução acontece por caracterização, extração de controller/hook e componentes de apresentação, sem refatoração visual e de domínio no mesmo commit.

## Performance

Carregar sob demanda:

- `@react-pdf/renderer`;
- `docx`;
- `html-to-image`;
- workspaces React Flow quando não aparecem no primeiro viewport;
- experiências narrativas pesadas quando fora da rota inicial.

Regras:

- import dinâmico no ponto de uso;
- fallback com significado visual;
- não esconder layout shift com spinner genérico;
- medir antes e depois;
- preservar o motor interno protegido.

## React

- Effects apenas para sincronização externa;
- eventos executam lógica causada por interação;
- valores derivados são calculados durante render;
- `lazy` fora do corpo do componente;
- Suspense envolve uma unidade percebida pelo usuário;
- props e state formam fluxo previsível de cima para baixo.
