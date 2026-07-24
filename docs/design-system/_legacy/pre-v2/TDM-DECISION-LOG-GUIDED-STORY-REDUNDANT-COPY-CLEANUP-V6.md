# Decision Log: Guided Story Redundant Copy Cleanup V6

## Decisão

Textos auxiliares internos de cena foram removidos por redundância.

Mantidos: header dinâmico de capítulo, cards, conexões, risco, hipótese, footer interno, navegação e pill "Quatro funções, uma leitura contínua".

Removido na cena final: "Leitura concluída, fluxo em repouso".

Lógica e temporização: preservadas sem alteração.

## Contexto

Os seis `scene-note` internos repetiam informação já presente no header dinâmico de cada capítulo. O pill final "Leitura concluída, fluxo em repouso" duplicava o estado de repouso já comunicado pela narrativa estática da Síntese.

## Escopo

- Rota: `/`
- Componente ativo: `HomeOnboardingPreview` (`guided-story.tsx`)
- Fora do escopo: HTML de referência isolado, Canvas, React Flow, stores e domínio

## Textos removidos

1. A cadeia completa já está visível
2. As passagens ganham significado
3. A síntese abre espaço para o detalhe
4. Cada coluna revela elementos da mesma natureza
5. A leitura causal avança da esquerda para a direita
6. Síntese final em repouso
7. Leitura concluída, fluxo em repouso (pill final da cena Síntese)

## Texto preservado

- Quatro funções, uma leitura contínua (pill da cena Etapas)

## Auditoria de acoplamento

Os nós removidos eram markup puramente visual. Nenhum seletor `scene-note` ou pill final era consultado por `querySelector`, `ref`, medição, sentinela ou estado da animação.

## Geometria

Remoção no JSX sem compensações de layout. Coordenadas de cards, conexões, `viewBox` e containers principais permanecem intactos.
