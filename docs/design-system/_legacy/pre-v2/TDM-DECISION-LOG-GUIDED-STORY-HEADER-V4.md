# Decision Log — Public Header Full-Bleed V4

## Decisões homologadas nesta rodada

1. Guided Story V7, copyright, respiro inicial, intro de `/exemplos` e ritmo vertical público permanecem congelados.
2. A superfície scrolled do header público (`rgba(7, 8, 9, 0.76)`, blur, border-bottom) passa do container interno para o **shell externo sticky** full-bleed.
3. `shellInner` deixa de limitar a largura do header; a medida editorial `min(76rem, calc(100% - var(--tdm-space-8)))` permanece nos filhos de conteúdo e em `.headerShell` / `.headerBar`.
4. O artefato branco no overscroll vinha da hero (`HomeBrandLogo` / título com shine) atravessando faixas transparentes do header inset (padding-top do `<header>` + gutters laterais fora de `.headerShell`). A correção pinta o shell inteiro e remove a superfície legada do container interno.
5. Sentinel, `IntersectionObserver`, threshold, timing, easing, logo, nav, CTA, Canvas e domínio não mudam.

## Data

2026-07-22
