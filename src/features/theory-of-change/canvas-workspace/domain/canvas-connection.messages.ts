export const CANVAS_CONNECTION_MESSAGES = {
  sameStage: 'Conecte etapas diferentes para representar uma relação causal.',
  backward: 'A conexão precisa seguir o fluxo causal da esquerda para a direita.',
  skipStage: 'A conexão deve passar pela próxima etapa causal antes de avançar.',
  outcomeSource: 'Resultado encerra esta cadeia causal e não pode iniciar outra conexão.'
} as const;
