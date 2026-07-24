# TDM Migration Map V1

## Onda 0: fundação

- instalar contrato, preview e gates;
- criar `TdmMenu` e `TdmStatusScreen`;
- publicar tokens de menu, status e etapas;
- registrar baseline shrink-only.

## Onda 1: ações

- `PublicButton` -> adapter temporário de `TdmButton` -> remoção;
- `PublicIconButton` -> adapter temporário de `TdmIconButton` -> remoção;
- menus locais -> `TdmMenu`;
- tooltips paralelos -> `TdmTooltip`.

## Onda 2: frame das rotas

- header público único;
- header de workspace único;
- route gutters e section rhythm;
- loading, error e 404;
- card do Guia;
- backgrounds externos dos workspaces.

## Onda 3: arquitetura

Prioridade por risco:

1. `lusion-resend-ds.tsx`;
2. `public-pages.tsx`;
3. `public-experience.tsx`;
4. `result-experience.tsx`;
5. `flow-vision-interactive-workspace.tsx`;
6. `result-view.tsx`.

Cada extração preserva comportamento e não toca no motor protegido.

## Onda 4: performance

- isolar libs de exportação;
- reduzir Client boundaries editoriais;
- route-level loading;
- imports dinâmicos medidos;
- remover `three` quando o último consumidor real sair.

## Onda 5: limpeza

- zero consumidores;
- QA funcional;
- screenshot aprovado;
- gates verdes;
- remover componente legado;
- remover token sem consumidor;
- mover ou apagar docs antigas após decisões absorvidas pelo contrato V2.
