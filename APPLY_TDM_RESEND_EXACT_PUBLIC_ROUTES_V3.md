# TDM Resend Exact Public Routes V3

Este pacote substitui a experiência visual das rotas públicas pelo novo DS inspirado diretamente nos vídeos de referência, deixando `/canvas` intocado.

## Rotas alteradas

- `/`
- `/guia-de-aprendizado`
- `/exemplos`
- `/exemplos/resultado`
- `/exemplos/resultado/interativo`
- `/referencias`

## Intocado

- `/canvas`
- React Flow principal
- sidebar do canvas
- nodes/edges do editor
- drag/drop
- `package.json`

## Aplicar

```bash
cd /Users/tialarocha/Documents/CHANGE-THEORY/theory-of-change-v1
unzip -o ~/Downloads/tdm-resend-exact-public-routes-v3.zip -d .
rm -rf .next
npm run build
npm run dev
```

## Preview

- http://localhost:3000/
- http://localhost:3000/guia-de-aprendizado
- http://localhost:3000/exemplos
- http://localhost:3000/exemplos/resultado
- http://localhost:3000/exemplos/resultado/interativo
- http://localhost:3000/referencias

## Validação no sandbox

- `npx tsc --noEmit --pretty false --ignoreDeprecations 6.0`: passou
- Sass modules novos: passaram
- `npm run build`: compilou, typecheck passou, gerou 15/15 páginas e listou as rotas; o processo do container estourou timeout depois da etapa de otimização final, mas não exibiu erro de build.
