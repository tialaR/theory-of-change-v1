# TDM Architecture Migration V1

## Objetivo

Reduzir os dois maiores God Components da camada pública sem alterar a experiência visual aprovada, o comportamento das rotas ou as zonas sensíveis.

## Resultado

### Design System público

O antigo arquivo único de layout público foi substituído pela família canônica:

- `src/shared/ui/tdm-public-layout/public-shell.tsx`
- `src/shared/ui/tdm-public-layout/public-header.tsx`
- `src/shared/ui/tdm-public-layout/public-content.tsx`
- `src/shared/ui/tdm-public-layout/public-reveal.tsx`
- `src/shared/ui/tdm-public-layout/public-timeline.tsx`
- `src/shared/ui/tdm-public-layout/public-home-orb.tsx`
- `src/shared/ui/tdm-public-layout/public-layout.types.ts`
- `src/shared/ui/tdm-public-layout/index.ts`

Cada arquivo possui uma responsabilidade explícita. Componentes estáticos permanecem compatíveis com Server Components; comportamento de scroll, pathname e motion fica em ilhas Client.

### Páginas públicas

O agregador único de páginas foi substituído por componentes de rota independentes:

- `home-page.tsx`
- `examples-page.tsx`
- `flow-page.tsx`
- `result-page.tsx`
- `references-page.tsx`
- `interactive-page.tsx`
- `guide-page.tsx`

Dados, ícones e travessia de relações foram extraídos para módulos puros e testáveis.

## Preservado

- `/canvas` e derivados;
- timeline ativa de `/guia-de-aprendizado`;
- scheduler da história guiada;
- geometria e motion das prévias;
- diagramas internos das experiências interativas;
- seleção, zoom, conexões e exportação dos workspaces;
- DOM e classes CSS do layout público.

## Ajuste funcional já aprovado

A rota pública `/exemplos/resultado` não renderiza mais a linha antiga de exportações PDF, PNG e SVG. As exportações continuam disponíveis nos workspaces apropriados.

## Porta arquitetural

`npm run check:tdm:v2:architecture` bloqueia:

- retorno dos antigos God Components;
- imports do caminho visual legado;
- Client Components em páginas estáticas;
- crescimento acima dos limites SRP;
- nomes de referências externas dentro do componente canônico;
- overrides de prioridade no novo DS público.

## Compatibilidade temporária

`GuidePage` e `InteractivePage` continuam exportados, mas não possuem rota ativa. O gate os registra como warning até uma rodada de remoção comprovada por zero consumidores.
