# TMD Guided Story v1

## Status

Fonte visual homologada para integração na Home pública.

Referência obrigatória:

- `references/tdm-guided-story-v7-validated.html`

## Escopo de integração

Integrar somente o bloco narrativo da experiência, equivalente à seção `story-section` da referência.

Não transportar para a aplicação:

- o header global demonstrativo do HTML;
- o hero externo do HTML;
- os cards de princípios externos;
- o footer global demonstrativo do HTML;
- estilos globais da página de demonstração.

A aplicação já possui shell, header, hero, footer, tokens e rotas próprios.

## Narrativa canônica

1. Prévia
2. Etapas
3. Passagens
4. Colunas
5. Detalhamento
6. Encadeamento
7. Síntese

A experiência deve terminar em repouso. Não existe reinício automático nem loop infinito.

## Conteúdo aprovado da Prévia

Título do capítulo:

`Prévia`

Texto do footer narrativo:

`A experiência estabelece a jornada com interação e proporciona a organização de recursos, ações, entregas e mudanças esperadas em uma narrativa causal.`

O header narrativo usa somente dot + nome da etapa. Os números 00 a 06 não aparecem nesse header.

A navegação inferior e o contador de progresso podem preservar a numeração existente, pois a remoção validada se refere exclusivamente ao header das etapas.

## Marca

A logo deve ser sempre a logo homologada presente na referência.

Quando a experiência precisar somente do ícone:

- extrair o ícone da mesma logo homologada;
- não reconstruir o desenho;
- não usar outro asset semelhante;
- não adicionar neon, glow ou alteração cromática.

Antes de reutilizar assets existentes da aplicação, comparar visualmente com a referência. Um nome semelhante não comprova equivalência.

## Comportamento

- conteúdo legível em todo momento;
- nenhuma conexão invade ou perfura cards;
- cada conexão termina com respiro visual;
- transições lentas o bastante para leitura;
- controles de voltar, reproduzir/pausar, avançar e reiniciar preservados;
- navegação direta entre capítulos preservada;
- um único agendador de tempo ativo;
- limpeza de timers ao pausar, trocar capítulo e desmontar;
- sem `setInterval`;
- sem `requestAnimationFrame` manual;
- sem loops de animação;
- reduced motion mostra conteúdo completo sem deslocamentos narrativos.

## Arquitetura

A integração deve usar React 19, Next.js App Router, TypeScript e Sass Module existentes.

Proibido:

- iframe;
- `dangerouslySetInnerHTML`;
- injetar o HTML completo na rota;
- copiar CSS global da referência;
- criar um segundo Design System;
- criar um segundo header ou footer global;
- modificar domínio, stores, canvas, React Flow ou progressão.

Preferir preservar a API do componente ativo da Home. Se o consumidor ativo for `home-onboarding-preview`, refatorar internamente ou substituí-lo no mesmo ponto de composição, sem alterar a geometria das seções vizinhas.

## Responsividade

- desktop mantém visão integral;
- telas estreitas preservam acesso ao conteúdo sem ocultação definitiva;
- scroll horizontal interno é permitido quando já previsto pela referência;
- barras nativas não podem dominar visualmente;
- nenhum texto funcional pode ser cortado;
- controles permanecem alcançáveis por teclado e toque.
