# Canvas V4 — baseline e direção arquitetural

A rota `/canvas-v4` nasce como cópia integral e isolada de `/canvas/tdm-command-preview-v2`.
A preview original e `/canvas-v3` permanecem intactas.

## Decisão de produto

A V4 preserva o visual e a hierarquia da preview V2. As regras de domínio da rota `/canvas` devem ser portadas em etapas posteriores sem reconstruir ou empobrecer a experiência visual.

## Contratos funcionais aprovados

- O canvas começa vazio.
- O usuário pode criar Insumo, Atividade, Produto ou Resultado em qualquer ordem.
- Conexões válidas: Insumo -> Atividade -> Produto -> Resultado.
- Tentativas inválidas não alteram o estado e geram feedback transitório humanizado.
- Risco: somente em Insumo -> Atividade e Atividade -> Produto.
- Hipótese: somente em Produto -> Resultado.
- Conexões são criadas por drag entre handles do React Flow.
- Cards alternam entre leitura e formulário no próprio node.
- Sidebar reflete o item selecionado e nunca cria novos cards.
- Criação de cards fica no painel compacto de drag and drop.
- Undo, redo, histórico e salvar são operações explícitas.
- Scroll horizontal e vertical permanecem funcionais, com barras invisíveis.

## Fronteiras sugeridas

- `app/canvas-v4/page.tsx`: Server Component da rota.
- `features/theory-of-change/canvas-v4/ui`: componentes visuais burros.
- `features/theory-of-change/canvas-v4/application`: casos de uso e comandos.
- `features/theory-of-change/canvas-v4/domain`: regras causais e contratos.
- `features/theory-of-change/canvas-v4/infrastructure`: repository local e futura API/MSW.
- `app/canvas-v4/actions.ts`: Server Actions simuladas para salvar/carregar.

## Componentes da experiência

- CanvasV4Shell
- CanvasV4Header
- TheoryNameField
- StageDragPalette
- TheoryFlowCanvas
- TheoryNode
- TheoryNodeToolbar
- TheoryNodeForm
- TheoryConnectionEdge
- ConnectionQualifier
- SelectionSidebar
- CanvasActionBar
- HistoryPanel
- GuidePanel
- ExamplesPanel
- ResultPreviewTrigger
- ContextualToastRegion
- CanvasLoadingSkeleton

## Regra de ouro

A preview V2 é a referência visual. Novas regras entram como adaptação de domínio e interação, nunca como redesign paralelo.
