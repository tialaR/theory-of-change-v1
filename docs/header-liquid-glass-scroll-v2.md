# Header liquid glass scroll v2

## Objetivo

Ajustar o header publico para ter um efeito de vidro mais fisico quando o usuario faz scroll, sem tocar na navegacao e sem tocar em `/canvas`.

## Decisao visual

O v1 estava escuro e plano demais. O v2 troca o bloco chapado por camadas mais parecidas com frosted glass:

- `::after`: superficie principal do vidro, com blur forte, contraste, brilho controlado, highlights radiais e ruido suave.
- `::before`: manchas de luz internas, com brilho branco/prata e mascara para criar profundidade.
- `:hover` quando o header ja esta em scroll: aumenta um pouco blur, brilho e movimento dos highlights.

## Arquivos

- `src/shared/ui/lusion-resend-ds/lusion-resend-ds.tsx`
- `src/shared/ui/lusion-resend-ds/lusion-resend-ds.module.sass`
- `public/static/header-glass-noise.png`

## Regras preservadas

- Header transparente no topo.
- Liquid glass so aparece apos scroll.
- Sem border-bottom.
- Sem radius no header inteiro.
- Sem mudanca em logo, links, CTA, active state ou hover dos links.
- Sem tocar em `/canvas`.
- Sem dependencia nova.

## Backlog

Depois do canvas, reestruturar a arquitetura por features menores, mantendo `theory-of-change-core` como dominio central.
