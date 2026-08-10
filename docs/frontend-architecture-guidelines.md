# Diretrizes de Arquitetura Frontend

## Rotas públicas vs canvas

### Rotas públicas (DS novo)

```
/
/guia-de-aprendizado
/exemplos
/exemplos/resultado
/exemplos/resultado/interativo
/referencias
```

Implementadas em `src/features/theory-of-change/components/public-pages/`, consumindo `src/shared/ui/tdm-public-design-system/`.

Cada rota em `src/app/*/page.tsx` importa apenas o componente de página correspondente — sem lógica de negócio na camada de rota.

### Canvas arquiteturalmente protegido

```
/canvas
```

O Canvas atual é uma arquitetura modular protegida por contratos e gates. Mudanças devem respeitar ADR-008, ADR-006, ADR-007 e os closeouts SharkOps. React Flow é adapter/rendering boundary; Domain, Application, Engine, Infrastructure, Server e UI possuem ownership explícito. Não realizar refactor amplo nem mover regras para componentes/hooks sem uma decisão arquitetural e gate correspondente.

## Estrutura de pastas

```
src/
  app/                          # Rotas Next.js (thin pages)
  shared/ui/tdm-public-design-system/   # DS público independente
  features/theory-of-change/
    components/public-pages/    # Páginas públicas + TheoryFlowBoard
    data/example-theory.ts      # Dados do exemplo (lógica preservada)
    domain/                     # Tipos e estágios TDM
```

## Superfícies de Canvas — não reutilizar automaticamente em rotas públicas

Estes módulos pertencem ao canvas/result-view legado:

- `src/shared/ui/tdm-ds/`
- `src/shared/ui/tdm-experience/`
- `src/shared/ui/experience/`
- `src/features/theory-of-change/components/public-experience/`
- `src/features/theory-of-change/components/public-experience/`

## Scroll global

`src/app/globals.sass` define `overflow: hidden` no body para o canvas. Rotas públicas isolam via:

1. `data-public-page="true"` no shell
2. Classe `public-page-scroll` no body (efeito em `PublicShell`)
3. Regra CSS `body:has([data-public-page='true'])` como fallback

## Lógica de negócio preservada

- Estágios: Insumos → Atividades → Produtos → Resultados
- Conexões com badges R (risco) e H (hipótese)
- Dados de exemplo em `example-theory.ts`
- Helpers de diagrama em `result-experience-data.ts`

## TheoryFlowBoard

Componente reutilizável para preview e workspace interativo:

- Colunas por estágio
- Clique em card → foco em ancestrais + descendentes no fluxo causal
- Cards não relacionados ficam com opacidade reduzida
- Setas com badges R/H via `getEdgeBadges`

## Dependências

Não adicionar dependências sem aprovação. Motion e Sass já disponíveis no projeto.

## Build

Toda alteração deve passar em `npm run build` sem erros de TypeScript.
