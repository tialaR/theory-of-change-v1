# Header liquid glass scroll v3

Patch visual do header publico.

## Objetivo

Corrigir o efeito v2 que ainda parecia uma faixa preta com cortes laterais visiveis.

## Estrategia

- Mantem o header transparente no topo.
- Ativa o liquid glass somente quando `data-scrolled="true"`.
- Usa `::after` com overlay PNG em `100vw + 12rem` para evitar cortes laterais.
- Usa `::before` com caustics/brilho e fade vertical para efeito de vidro mais fisico.
- Usa assets em `public/static`.
- Nao altera links, CTA, logo, rotas nem canvas.

## Assets

- `public/static/header-glass-panel-v3.png`
- `public/static/header-glass-caustics-v3.png`
- `public/static/header-glass-noise-v3.png`

## Arquivos alterados

- `src/shared/ui/lusion-resend-ds/lusion-resend-ds.tsx`, somente se o listener antigo de scroll ainda existir.
- `src/shared/ui/lusion-resend-ds/lusion-resend-ds.module.sass`.

## Depois do canvas

Ainda existe backlog arquitetural para quebrar `features/theory-of-change` em features menores e reduzir DS duplicado.
