# TDM Canvas Wave 05: React Flow real

Esta mordida substitui o renderer manual pelo componente oficial `ReactFlow`, custom nodes com Handles reais e custom edges com controles ancorados. A rota App Router permanece fina e Server Component; o motor interativo é carregado como ilha client dinâmica com fallback estável.

## Contratos executáveis

- `check-react-flow.mjs`: impede retorno do renderer manual, regra causal duplicada e God Components.
- `check-ownership.mjs`: garante app fino, colocation e fronteiras da feature.
- `check.mjs`: protege hashes visuais, artefatos, persistência e estado do gate.
- Playwright do patch: captura a rota homologada antes da aplicação e compara após o cutover.

## Fora desta mordida

A Onda 06 fecha o transporte server-authoritative: MSW em Node via `instrumentation.ts`, handlers compartilhados, duas personas fictícias, Server Actions e migração completa das strings do Canvas para next-intl.
