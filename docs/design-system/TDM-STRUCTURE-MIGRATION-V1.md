# TDM Structure Migration V1

## Objetivo

Consolidar a segunda onda do Design System fora de `/canvas` sem redesenhar as rotas aprovadas.

## Alterações

- mantém a timeline do Guia e troca somente a superfície dos cards da direita;
- fixa as quatro cores de etapa nos tokens canônicos;
- remove valores cromáticos do TypeScript do Guia;
- extrai dados, hook de observação e card para a pasta `learning-guide`;
- reduz `public-experience.tsx` de 359 para 191 linhas;
- remove o módulo Sass legado de 981 linhas e o card antigo após migração;
- introduz tokens semânticos de rota e Guia;
- preserva a geometria aprovada do shell público, agora consumindo tokens de rota;
- padroniza loading, error e 404;
- adiciona boundaries explícitas a todas as rotas auditadas;
- mantém intocados `/canvas`, a timeline e os containers internos dos diagramas interativos.

## Contrato visual do card do Guia

- placa traseira graphite;
- card frontal deslocado para baixo e para a direita;
- uma borda hairline por camada;
- radius amplo, sem neon;
- acento semântico discreto no canto inferior direito;
- hover com elevação curta, sem layout shift;
- conteúdo, ordem e motion de entrada preservados.

## Estado das rotas

Todas as nove rotas registradas pelo gate passam a declarar `loading.tsx` e `error.tsx` no segmento auditado. A página `not-found.tsx` continua global e usa a mesma família visual.

## Zonas protegidas

- `src/app/canvas/**`;
- timeline e scheduler do Guia;
- componentes internos das prévias e diagramas interativos;
- lógica de seleção, conexão, zoom, motion e exportação.
