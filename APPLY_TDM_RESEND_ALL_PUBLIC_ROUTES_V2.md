# TDM Resend Experience DS v2

Este ZIP migra as rotas públicas para o novo pacote DS/experiência inspirado em Resend + Apple Noir + Material/HIG, sem tocar em `/canvas`.

## Rotas cobertas

- `/`
- `/guia-de-aprendizado`
- `/exemplos`
- `/exemplos/resultado`
- `/exemplos/resultado/interativo`
- `/referencias`

## Não alterado por intenção

- `/canvas`
- React Flow principal
- sidebar do canvas
- nodes/edges do editor
- drag/drop
- package.json

## Aplicar

```bash
cd /Users/tialarocha/Documents/CHANGE-THEORY/theory-of-change-v1
unzip -o ~/Downloads/tdm-resend-experience-all-public-routes-v2.zip -d .
rm -rf .next
npm run build
npm run dev
```

## Validar

- http://localhost:3000/
- http://localhost:3000/guia-de-aprendizado
- http://localhost:3000/exemplos
- http://localhost:3000/exemplos/resultado
- http://localhost:3000/exemplos/resultado/interativo
- http://localhost:3000/referencias

## Validação feita no sandbox

- `npx tsc --noEmit --pretty false --ignoreDeprecations 6.0` passou.
- `npx sass` passou nos Sass Modules alterados/criados.
- `next build --webpack` iniciou compilação, mas excedeu o timeout do sandbox antes de terminar. Valide o build final no Mac.
