# TDM Route Frame Contract V1

## Rotas públicas

```text
Public shell
├── Public header
├── Page hero
├── Main content
│   ├── Section
│   └── Section
└── Public footer
```

Compartilham:

- header height;
- gutter responsivo;
- largura máxima;
- gap entre header e conteúdo;
- ritmo entre seções;
- tipografia;
- background;
- footer;
- loading/error/404.

## Workspaces interativos

```text
Workspace shell
├── Workspace header
├── protected interactive viewport
├── canonical controls
└── canonical overlays
```

O viewport interno é caixa preta nesta fase. Header, tooltip, icon button, menu, sidebar externa e background usam o DS.

## Guia

- timeline preservada;
- conteúdo e ordem preservados;
- somente o container dos cards à direita migra para o card/surface canônico;
- card não cria uma nova paleta, blur, radius ou motion local.

## Spacing

Spacing descreve relação:

- `control-gap` para itens do mesmo grupo;
- `content-gap` para título, texto e ações;
- `section-gap` para blocos irmãos;
- `route-gutter` para viewport;
- `header-content-gap` para início da rota.

Nenhuma rota cria seu próprio sistema de gaps.
