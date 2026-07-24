# TDM Performance Boundaries V1

## Objetivo

Reduzir JavaScript e CSS enviados fora das rotas que realmente precisam deles, sem alterar comportamento, geometria ou aparência das zonas visuais protegidas.

## Decisões desta rodada

1. `PublicShell` volta a ser Server Component.
2. A alteração de classe no `body` fica em uma client island mínima e sem UI.
3. O CSS global do React Flow sai do root layout e pertence somente às rotas Canvas.
4. Exportadores de PNG, SVG, PDF e DOCX são carregados apenas quando o usuário solicita exportação.
5. O barrel geral de exportação deixa de ser importado por componentes client-side.
6. `three` e `@types/three` são removidos por ausência comprovada de consumidores.
7. O Bundle Analyzer nativo do Turbopack passa a fazer parte do fluxo oficial.

## Zonas preservadas

- timeline do Guia;
- scheduler da narrativa guiada;
- geometria e conteúdo interno das prévias;
- conexões, seleção e câmera das experiências interativas;
- comportamento do Canvas.

## Comandos

```bash
npm run check:tdm:v2:performance
npm run analyze:bundle
npm run analyze:bundle:output
```

O último comando grava a análise estática em `.next/diagnostics/analyze`.

## Contrato

- dependência pesada não pode entrar no carregamento inicial apenas por conveniência de barrel;
- biblioteca acionada por clique deve usar importação dinâmica quando isso não alterar a experiência;
- um efeito de navegador não transforma uma árvore estática inteira em Client Component;
- CSS de biblioteca específica de workspace não pertence ao root layout;
- nova dependência precisa de consumidor real, justificativa e impacto documentado;
- `loading.tsx` e `error.tsx` devem existir onde a rota possui carregamento ou falha significativa, sem criar boundaries decorativas.

## Referências oficiais

- Next.js App Router, Server e Client Components: https://nextjs.org/docs/app/getting-started/server-and-client-components
- Next.js Lazy Loading: https://nextjs.org/docs/app/guides/lazy-loading
- Next.js Package Bundling: https://nextjs.org/docs/app/guides/package-bundling
- Next.js CSS: https://nextjs.org/docs/app/getting-started/css
- React Suspense: https://react.dev/reference/react/Suspense
- React lazy: https://react.dev/reference/react/lazy
