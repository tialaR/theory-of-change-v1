# TDM UI Consolidation Migration V1

## Objetivo

Eliminar adapters e implementações públicas duplicadas sem alterar a aparência ou o comportamento aprovado das rotas fora do Canvas.

## Decisões

- `TdmButton` é o único primitive de botão fora do Canvas.
- `TdmIconButton` é o único primitive de icon button fora do Canvas.
- `TdmMenu`, `TdmTooltip` e `TdmSurface` são consumidos pelos barrels canônicos.
- Ícones, variantes e ações são declarados semanticamente pelo consumidor. Texto visível não determina comportamento.
- `PublicButton` e `PublicIconButton` foram removidos após migração de consumidores.
- Componentes sem rota, import ou consumidor foram removidos com backup pelo instalador.

## Zonas preservadas

- `/canvas` e derivados;
- timeline e scheduler do Guia;
- geometria e motion das prévias;
- diagramas internos, conexões, seleção, zoom e exportação das experiências interativas.

## Duplicações adiadas

As implementações abaixo permanecem somente por estarem ligadas a zonas sensíveis ou ao Canvas:

- `TdmAnchoredTooltip`;
- `result-view/tdm-glass-surface`;
- `result-view/liquid-glass/glass-surface`.

Elas geram aviso e não podem ganhar novas réplicas.

## Porta

```bash
npm run check:tdm:v2:consolidation
npm run check:tdm:v2:all
```

O mesmo gate é executado no terminal, Cursor, VS Code e GitHub Actions.
