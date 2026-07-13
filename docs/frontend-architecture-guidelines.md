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

Implementadas em `src/features/theory-of-change/components/public-pages/`, consumindo `src/shared/ui/lusion-resend-ds/`.

Cada rota em `src/app/*/page.tsx` importa apenas o componente de página correspondente — sem lógica de negócio na camada de rota.

### Rota preservada (DS antigo)

```
/canvas
```

Não alterar: React Flow principal, nodes/edges, sidebar, drag/drop, lógica de criação/edição.

## Estrutura de pastas

```
src/
  app/                          # Rotas Next.js (thin pages)
  shared/ui/lusion-resend-ds/   # DS público independente
  features/theory-of-change/
    components/public-pages/    # Páginas públicas + TheoryFlowBoard
    data/example-theory.ts      # Dados do exemplo (lógica preservada)
    domain/                     # Tipos e estágios TDM
```

## DS antigo — não usar em rotas públicas

Estes módulos pertencem ao canvas/result-view legado:

- `src/shared/ui/resend-ds/`
- `src/shared/ui/resend-experience/`
- `src/shared/ui/experience/`
- `src/features/theory-of-change/components/resend-public/`
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
