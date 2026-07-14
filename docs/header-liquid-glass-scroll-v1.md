# Header liquid glass no scroll

## Objetivo

Aplicar o efeito de liquid glass blur no header publico somente apos o usuario iniciar scroll.

## Decisao

O header publico real esta em:

- `src/shared/ui/lusion-resend-ds/lusion-resend-ds.tsx`
- `src/shared/ui/lusion-resend-ds/lusion-resend-ds.module.sass`

A estrutura de navegacao, logo, links, CTA e rotas escondidas foi preservada. O ajuste e visual.

## Como o efeito funciona

- Estado inicial: header transparente, sem vidro pesado.
- Estado com scroll: `data-scrolled="true"` ativa duas camadas:
  - `::after`: vidro fumê com textura granulada, blur, saturacao e contraste.
  - `::before`: brilho/distorcao suave com blur forte e mascara.

A textura usada fica em:

- `public/static/texture-btn.png`

## Regras preservadas

- Sem border-bottom.
- Sem bordas laterais.
- Sem radius no header inteiro.
- Sem vazamento de cores.
- Sem alteracao de navegacao.
- Sem tocar em `/canvas`.

## Backlog futuro

Depois do canvas, reestruturar a arquitetura por features menores:

- `features/home`
- `features/public-header`
- `features/examples`
- `features/guide`
- `features/result-experience`
- `features/flow-vision`
- `features/canvas`
- `features/theory-of-change-core`
