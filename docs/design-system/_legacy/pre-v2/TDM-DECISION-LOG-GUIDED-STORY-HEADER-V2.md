# Decision Log — Guided Story, Header, Public Gap e Copyright V2

Homologação: 2026-07-22

## Decisões homologadas

1. Guided Story V7 é a referência visual e comportamental canônica.
2. Header público mantém seu comportamento atual de aparecer somente após scroll.
3. Estado visível do header recebe somente background noir translúcido e border-bottom sutil.
4. Cinco rotas públicas secundárias recebem o mesmo respiro adicional no eixo Y via `--tdm-public-header-content-gap` + `PublicShell headerContentGap`.
5. `/exemplos` é o benchmark visual do espaçamento.
6. Footer preserva a descrição de marca existente e recebe uma faixa final de copyright.
7. Copyright contém somente marca, ano dinâmico, reserva de direitos e descrição funcional já sustentada pelo produto.
8. Nenhum link ou dado jurídico inexistente deve ser criado.

## Arquivos canônicos desta extensão

- `docs/design-system/TDM-PUBLIC-PAGE-HEADER-GAP-V1.md`
- `docs/design-system/TDM-PUBLIC-FOOTER-COPYRIGHT-V1.md`
- `src/shared/styles/tdm/_tdm-public-action.sass` (`--tdm-public-header-content-gap`)
- `src/shared/ui/lusion-resend-ds/lusion-resend-ds.tsx` / `.module.sass`
