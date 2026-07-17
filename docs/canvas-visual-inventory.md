# Inventário visual do `/canvas`

Documento read-only para preparar o **Resend Command Canvas** pass sem loop de remendos.

**Escopo:** rota `src/app/canvas/page.tsx` → `TdmCanvas` → `TdmCanvasInner` + sidebar direita.  
**Fora de escopo funcional:** alteração de lógica React Flow, domain, utils de criação/layout, stores implícitos de estado.

**Regra de ouro do próximo patch**

| Pode | Não pode |
|------|----------|
| Sass modules listados como “sim” na coluna visual | Handlers, `nodeTypes`/`edgeTypes`, domain, utils de fluxo |
| Tokens visuais locais / classes CSS | Assinaturas de props, `useNodesState`/`useEdgesState`, regras de conexão |
| Ajuste de hover/sombra/raio **sem** mudar layout box model crítico | `transform`/`scale` que alterem hit-area de Handles / drag |

**Árvore de montagem (canvas ativo)**

```
/canvas (page.tsx)
└── TdmCanvas (ReactFlowProvider)
    └── TdmCanvasInner
        ├── shell (grid: canvasArea | sidebar)
        ├── sidebarToggleButton
        ├── canvasArea
        │   ├── TdmToastViewport
        │   └── flowFrame
        │       ├── emptyState (se nodes.length === 0)
        │       └── ReactFlow
        │           ├── TdmConnectionGuide   ← Stage Plate (top-left)
        │           ├── TdmCanvasCommandDock ← atalhos inferiores esq.
        │           ├── Background (dots)
        │           ├── Controls             ← left rail zoom
        │           └── MiniMap
        └── TdmSidebar
            ├── header / heroCard / TheoryHeaderForm
            ├── V1StageActionSection         ← Agora
            ├── progressCard + timeline
            ├── V1CanvasOrganizationAccordion
            ├── V1BlockFormsPanel (Criar / Editar)
            ├── context edge/marker (condicional)
            ├── QuickShortcutsCard
            └── V1FinalResultCard
```

`FloatingHeader` (`floating-header.tsx`) **existe mas não está montado** em `/canvas` hoje.

---

## 1. Mapa de componentes do canvas

| Área visual | Componente TSX | Arquivo Sass | Classes principais | Responsabilidade | Pode alterar visual? | Não pode alterar lógica? |
|-------------|----------------|--------------|--------------------|------------------|----------------------|---------------------------|
| **Background do canvas** | `TdmCanvasInner` + RF `Background` | `canvas/tdm-canvas.module.sass` | `.shell`, `.flowFrame`, `:global(.react-flow__background)`, `--xy-background-pattern-dots-*` | Fundo noir, vignette, grid SVG, dots do RF | **Sim** (cores/opacidade/gradientes do `.flowFrame`) | **Sim** — não tocar props `gap`/`size`/`variant` se isso for tratado como layout de snap; preferir só CSS |
| **Stage Plate / toolbar superior** | `TdmConnectionGuide` | `canvas/tdm-connection-guide.module.sass` | `.panel`, `.shell`, `.shellExpanded`, `.compactRow`, `.stageDot`, `.stageTitle`, `.toggleButton`, `.expandedBlock`, `.counters`, `.counter`, `.helpText` | Indicador de etapa ativa + contadores + ajuda expansível (Panel top-left) | **Sim** | **Sim** — não alterar `STAGE_ACCENTS` mapping de etapa→cor **em lógica de contagem**; só aparência do shell |
| **Left rail / controles laterais** | RF `Controls` em `TdmCanvasInner` | `canvas/tdm-canvas.module.sass` | `.controls`, `:global(.react-flow__controls)`, `:global(.react-flow__controls-button)` | Zoom +/− / fit | **Sim** | **Sim** — não remover `Controls` nem `showInteractive`; posição via CSS ok |
| **Minimap** | RF `MiniMap` + `CANVAS_DS_MINIMAP` | `canvas/tdm-canvas.module.sass` | `.minimap`, `:global(.react-flow__minimap)` | Miniatura dos nós por cor de etapa | **Sim** (chrome do minimap) | **Sim** — manter `nodeColor`/`nodeStrokeColor` ligados a stage; trocar hex só se manter semântica de etapa |
| **Node/card do canvas** | `node/tdm-node.tsx` (`TdmNode`) | `node/tdm-node.module.sass` | `.node`, `.nodeWrapper`, `.compactBody`, `.nodeCard`, `.stage`, `.title`, `.description`, `.input\|.activity\|.output\|.outcome`, `.selected`, `.editing` | Card compacto + editor inline | **Sim** | **Sim** — não mudar `Handle` placement rules, `data.stage`, contexto de interaction |
| **Handles** | `Handle` em `tdm-node.tsx` | `node/tdm-node.module.sass` | `.handle`, `.connectionTarget` | Portas source/target | **Sim** (tamanho/borda/cor) | **Sim** — manter `Position.Left/Right`, `canReceive`/`canSend` |
| **Edges/linhas** | `edge/tdm-theory-edge.tsx` | `edge/tdm-theory-edge.module.sass` (+ stroke de `domain/tdm-connection-theme.ts`) | `.edge`, `.selected`, `.hovered`, `.animated` | Bezier + dash + stroke por `connectionKind` | **Sim** (classes CSS) | **Sim** — não alterar `getBezierPath`, `getConnectionStrokeColor`, dash/width constants sem decisão de produto |
| **Marcadores R/H** | `TdmTheoryEdge` labels | `edge/tdm-theory-edge.module.sass` | `.marker`, `.markerRisk`, `.markerHypothesis`, `.markerPreview*`, `.cta`, `.labelLayer` | Badges Risco/Hipótese + CTA add + preview | **Sim** | **Sim** — `canCreateRisk`/`canCreateHypothesis` e `resolveMarkerType` protegidos |
| **Modal de risco** | `TdmEdgeMarkerEditor` (`markerType="risk"`) via `EdgeLabelRenderer` | `edge/tdm-edge-marker-editor.module.sass` | `.editor`, `.eyebrow`, `.title`, `.textarea`, `.primary`, `.danger`, `.ghost` | Editor flutuante sobre a edge | **Sim** | **Sim** — `onSave`/`onDelete`/`onCancel` e validação de texto vazia |
| **Modal de hipótese** | mesmo `TdmEdgeMarkerEditor` (`markerType="hypothesis"`) | idem | idem | Idem para hipótese | **Sim** | **Sim** |
| **Sidebar direita** | `sidebar/tdm-sidebar.tsx` (`TdmSidebar`) | `sidebar/tdm-sidebar.module.sass` | `.sidebar`, `.open`, `.closed`, `.surface`, `.content`, `.card` | Coluna de trabalho / guia | **Sim** | **Sim** — callbacks (`onAdvance`, `onOrganize`, `blockForms`, drag) |
| **Header da sidebar** | `TdmSidebar` header + `TheoryHeaderForm` | `tdm-sidebar.module.sass` + `theory-header-form.module.sass` | `.header`, `.headerScrolled`, `.heroCard`, `.heroGlowTop/Bottom`, `.heroSpecular`, `.heroTitle`, `.heroFormShell` | Branding “Construtor…” + nome da teoria | **Sim** | **Sim** — não quebrar `onTheoryNameChange` / hide sidebar |
| **Seção Agora** | `V1StageActionSection` em `v1-preserved-sidebar-sections.tsx` | `tdm-sidebar.module.sass` | `.sectionKicker` (“AGORA”), `.stageActionCard`, `.stageActionInnerPanel`, `.dragCard`, `.dragIcon` | Drag do bloco da etapa atual | **Sim** | **Sim** — `onStageDragStart` + payload de drag |
| **Etapas da teoria / timeline** | timeline em `TdmSidebar` + `V1TheoryProgressHeader` | `tdm-sidebar.module.sass` | `.progressCard`, `.progressHeader*`, `.timeline`, `.stageAccordion`, `.stageSummary`, `.stageColorBar`, `.stageDot`, `.stageCountBadge`, `.stageBody`, `.workflowAdvanceButton` | Progresso + accordion por etapa + avançar | **Sim** | **Sim** — `getStageStatus`, `stageCreation`, `onAdvance`, contagens |
| **Criar bloco** | `CreateBlockForm` / accordion em sidebar | `tdm-sidebar.module.sass` + `form-field/tdm-form-field.module.sass` | `.blockFormsPanel`, `.blockFormGroup`, `.sidebarAccordion*`, form classes | Draft + submit criar | **Sim** | **Sim** — `blockForms.create.*` |
| **Editar bloco** | `EditBlockForm` + editor inline no node | sidebar sass + `tdm-node.module.sass` (`.nodeEdit*`) | `.nodeEditForm`, `.nodeEditActions`, edit accordion | Edição lateral + inline | **Sim** | **Sim** — `updateNodeById`, delete/duplicate |
| **Formulários** | `form-field/tdm-form-field.tsx` (+ actions) | `tdm-form-field.module.sass`, `tdm-form-actions.module.sass` | `.form`, `.field`, `.formInput`, `.formTextarea`, `.nodeEditActionButton*` | Campos compartilhados | **Sim** | **Sim** — contrato `draft` / `onDraftChange` |
| **Organização do canvas** | `V1CanvasOrganizationAccordion` + dock actions | `tdm-sidebar.module.sass` + `tdm-canvas-command-dock.module.sass` | `.canvasOrganization*`, `.alignmentPreview*`, dock `.button` | Prévia + “Organizar” / fit / colunas / fluxo | **Sim** | **Sim** — `layoutNodesByStage` / `layoutNodesByFlow` / `fitView` |
| **Atalhos rápidos** | `QuickShortcutsCard` em `tdm-sidebar.tsx` | `tdm-sidebar.module.sass` | `.quickShortcutsCard`, `.quickShortcutsGrid`, `.quickShortcutBtn*` | Links/ações rápidas (ex.: restaurar) | **Sim** | **Sim** — handlers de restore / navegação |
| **Resultado da sua teoria** | `V1FinalResultCard` (+ sculptures opcionais) | `tdm-sidebar.module.sass` (+ `final-result-glass-sculpture.module.sass`) | `.resultCard`, `.finalResult*`, `.finalResultCta`, `.finalResultHeadlineLead` | CTA para ver resultado | **Sim** | **Sim** — `canViewTdmResult` / `onViewResult` / `openResultView` |
| **Action bar do card selecionado** | toolbar em `tdm-node.tsx` | `tdm-node.module.sass` | `.nodeToolbar`, `.nodeToolbarButton`, `.nodeToolbarButtonDanger`, `.nodeToolbarDivider` | Fechar / Editar / Duplicar / Deletar | **Sim** | **Sim** — wiring `toolbarNodeId`, callbacks delete/duplicate/edit |
| **Command dock (atalhos no canvas)** | `TdmCanvasCommandDock` | `tdm-canvas-command-dock.module.sass` | `.panel`, `.dock`, `.button`, `.buttonActive`, `.divider` | Fit / colunas / fluxo / guia / limpar | **Sim** | **Sim** — callbacks do dock |
| **Toast contextual** | `TdmToastViewport` | toast sass (fora do patch visual principal, mas no shell) | — | Feedback de fluxo | Opcional | **Sim** |
| **Tela ResultView** (modo `viewMode==='result'`) | `result-view/result-view.tsx` | `result-view.module.sass` + liquid-glass | — | Substitui o shell do canvas | Fora do pass Command Canvas (rota mental distinta) | Lógica de disponibilidade em `utils/tdm-result.ts` |

### Legenda das colunas finais

- **Pode alterar visual?** = Sass / tipografia / sombra / raio / tokens de cor **sem** mudar comportamento.
- **Não pode alterar lógica?** = manter handlers, domain, tipos e wiring; se a resposta é “Sim”, o próximo patch **não** deve editar a lógica desses arquivos além de classNames CSS.

---

## 2. Mapa de estilos problemáticos

Alvos prioritários para o Resend Command pass (lista por sintoma → onde aparece).

### `border-radius: 999` / pill

| Onde | Arquivo | Notas |
|------|---------|--------|
| Progress ring / badges / chips | `sidebar/tdm-sidebar.module.sass` (~682, ~827, ~992) | Pills em progresso / dots |
| Orb / sculpture atmosférica | `sidebar/change-theory-orb.module.sass`, `theory-change-sculpture.module.sass`, `final-result-glass-sculpture.module.sass` | Glow blobs `999rem` |
| Floating header (não montado) | `floating-header/floating-header.module.sass` | `999px` — legado |

**Handles** usam `border-radius: 50%` (aceitável para porta circular; não tratar como “pill CTA”).

### Glow colorido

| Onde | Arquivo |
|------|---------|
| `--node-glow` por etapa | `node/tdm-node.module.sass` (`$node-stage-*-glow`) |
| Hero glows da sidebar | `.heroGlowTop`, `.heroGlowBottom` em `tdm-sidebar.module.sass` |
| Orb com accent glow | `change-theory-orb` + `theme.glow` |
| Logo / liquid glass | `logo-animated-sprite`, `liquid-glass-logo-infinite-loop` (`drop-shadow` / shell glow) |
| Final result SVG glows | `final-result-glass-sculpture.tsx` + sass |
| Theory sculpture radial glow | `theory-change-sculpture.tsx` |

### Box-shadow colorido (accent / stage)

| Onde | Arquivo |
|------|---------|
| Node selected ring via `color-mix(... var(--node-accent) ...)` | `tdm-node.module.sass` `.selected`, focus de inputs |
| Form focus stage-tinted | `tdm-form-field.module.sass` |
| Sidebar stage cards / advance / mixins com glow de etapa | `tdm-sidebar.module.sass` + mixins em `_tokens.sass` (`0 0 … color-mix(stage-accent)`) |
| Orb shadow tinted | `change-theory-orb.module.sass` |

Shadows **neutras** (preto/branco inset) em dock/controls/minimap são DS noir — preferir manter; o problema é shadow **com cor de etapa** em chrome neutro.

### Background chapado com cor de etapa

| Onde | Arquivo | Correto? |
|------|---------|----------|
| `.node::after` barra de accent | `tdm-node.module.sass` | **OK** (marcação de etapa) |
| Primary CTA inline `color-mix(node-accent 78%)` | `.nodeEditActionButtonPrimary` | **Duvidoso** — CTA chapado por etapa |
| `.stageColorBar` + `.stageDot` lit | `tdm-sidebar.module.sass` | **OK** na timeline |
| Accordion/body tint `color-mix(stage-accent …)` | stages atuais / bloqueadas | Revisar intensidade |
| Minimap fills | `CANVAS_DS_MINIMAP` em `tdm-canvas-inner.tsx` | **OK** (mapa semântico) |
| Alignment preview blocks `.previewInput` etc. | sidebar organization | **OK** se só prévia de etapas |

### Hover que altera layout

| Onde | Efeito |
|------|--------|
| `.node:hover` | `transform: translateY(-0.0625rem)` |
| `.sidebarToggleButton:hover` | `translateY(-0.0625rem)` |
| `.marker:hover` | `translateY(-0.0625rem)` |
| Command dock `whileHover={{ scale: 1.03 }}` | **escala** — risco de layout/hit |
| Quick shortcut `whileHover={{ y: -1 }}` | micro layout shift |
| Alignment preview `whileHover={{ scale: 1.008 / 1.03 }}` | escala |
| Node toolbar icon hover | `translateY` no ícone |

Preferir hover de **cor/opacity/border** sem `scale`/`translateY` no pass Resend.

### `text-shadow`

**Nenhum uso** encontrado em `components/{canvas,node,edge,form-field,sidebar}` no momento do inventário.

### Borda lateral muito forte

| Onde | Classe |
|------|--------|
| Node accent bar | `.node::after` (`background: var(--node-accent)`, opacity 0.72) |
| Timeline | `.stageColorBar` |
| Hint / detalle | `.contextualHint` usa `border-left: 0.125rem` |

### CTA chapado

| Onde |
|------|
| `.nodeEditActionButtonPrimary` (fundo stage-tinted) |
| `.workflowAdvanceButton` + `TdmButton variant="primary"` |
| `.finalResultCta` |
| `.sidebarCta*` / mixins `+ds-sidebar-cta` |
| Edge `.cta` (mais contida — dashed) |

### Form pesado

| Onde |
|------|
| Inline editor `.nodeEditForm` (muitos campos + ações + sombra elevação) |
| Sidebar create/edit accordions dentro de `.blockFormsPanel` |
| Marker editor `.editor` com textarea + 3 botões |
| Focus ring colorido por `--stage-accent` / `--node-accent` em inputs |

### Overflow / sobreposição

| Onde | Risco |
|------|-------|
| `.nodeToolbar` `z-index: 999` | sobrescreve edges/labels |
| Marker preview `z-index: 11` / editor `12` | ok relativo à edge; colide com toolbar se nó próximo |
| `.shell` / `.flowFrame` / `.sidebar` `overflow: hidden` | clip de tooltips/docks |
| Command dock / Controls ambos bottom-left | possível **sobreposição espacial** (dock + zoom stack) |
| Sidebar toggle `z-index: 20` vs sidebar `18` | ok |
| Node `.editing` `overflow: visible` | formulário pode vazar sob outros nós |

---

## 3. Mapa de cores

### Paletas em conflito (importante)

Existem **duas famílias** de cores de etapa no código do canvas:

| Família | Hex | Onde |
|---------|-----|------|
| **Canvas DS V1 (local)** | `#a78bfa` / `#60a5fa` / `#f6b35d` / `#5ee0b5` | `tdm-canvas.module.sass`, `tdm-node.module.sass`, `tdm-connection-guide.tsx` `STAGE_ACCENTS`, `CANVAS_DS_MINIMAP`, `tdm-sidebar.tsx` `CANVAS_DS_STAGE`, `v1-preserved-sidebar-sections` |
| **Domain / tokens DS** | `#8B7CFF` / `#49B3FF` / `#F2A65A` / `#37C893` | `domain/tdm-theme.ts`, `domain/tdm-connection-theme.ts` (strokes), `$ds-stage-*` em `_tokens.sass` |
| **Danger** | `#fb7185` | canvas `$danger`, toolbar danger, marker risk tints |
| **Legacy accent global** | `$color-accent: #a78bfa` | `shared/styles/_tokens.sass` |

Strokes de edge usam a família **domain** (`#8B7CFF`, `#5EB8E8`, `#3DBF9A`), enquanto nodes/sidebar UI usam família **a78bfa**. O próximo pass visual deve **unificar** sem mudar `getConnectionKind`.

### Inventário por hex pedido

#### `#a78bfa` (insumos / accent)

| Uso | Arquivo | Correto como etapa? |
|-----|---------|---------------------|
| `$stage-inputs` / node accent | `tdm-node.module.sass`, `tdm-canvas.module.sass` | **Sim** |
| Guide + minimap + sidebar `CANVAS_DS_STAGE.input` | canvas/sidebar TSX | **Sim** |
| Fallback focus form `--stage-accent, #a78bfa` | `tdm-form-field.module.sass` | **Parcial** — ok se campo é de etapa; incorreto se form neutro herda default lilás |
| `$color-accent` global | `_tokens.sass` | **Incorreto como identidade global** se vazar para chrome neutro |
| Previews públicos | `resend-public/example-previews/*` | Fora de `/canvas` runtime |

#### `#60a5fa` (atividades)

| Uso | Correto? |
|-----|----------|
| Stage activity em node/canvas/sidebar/guide/minimap | **Sim** |
| Em chrome neutro (docks, controls, surfaces) | **Não encontrado** como fill chapado — bom |

#### `#f6b35d` (produtos)

| Uso | Correto? |
|-----|----------|
| Stage output em node/canvas/sidebar/guide/minimap | **Sim** |

#### `#5ee0b5` (resultados + hipótese tint)

| Uso | Correto? |
|-----|----------|
| Stage outcome | **Sim** |
| Marker hypothesis borders (`rgba(94, 224, 181, …)`) | **Sim** (semântica hipótese ≠ etapa, mas verde deliberado) |

#### `#fb7185` (danger / risco)

| Uso | Correto? |
|-----|----------|
| Toolbar delete, `$danger`, marker risk borders | **Sim** (semântica risco/perigo) |
| Em botões neutros do dock/controls | **Não** |

### Similar purple / blue / green / orange

| Hex / token | Família | Uso |
|-------------|---------|-----|
| `#8B7CFF`, `$ds-stage-input` | domain | theme + edge stroke input→activity |
| `#49B3FF`, `$ds-stage-activity` | domain | theme |
| `#F2A65A`, `$ds-stage-output` | domain | theme |
| `#37C893`, `$ds-stage-outcome` | domain | theme |
| `#5EB8E8`, `#3DBF9A` | connection strokes | edges |
| Crystal tints `rgba(150,116,255…)` etc. | `tdm-theme.ts` | sculptures / crystal (sidebar legado) |

### Uso correto vs incorreto (regra operacional)

**Correto (cor de etapa)**

- Barra lateral do node, label de stage, dots/counters do guide, timeline `stageColorBar`, minimap node fill, drag preview da etapa, alignment preview columns.

**Incorreto (componente neutro não deveria tingir com etapa)**

- Background do **shell / flowFrame / dock / controls / minimap chrome**
- Sombras glow coloridas no **hero** se o hero for branding neutro
- CTA primary “chapado” com accent de etapa em ações genéricas (Salvar?) — preferir prata/branco Resend
- Focus ring de formulário com fallback `#a78bfa` quando o formulário não tem estágio
- `$color-accent` global lilás fora de contexto de etapa

---

## 4. Mapa de lógica protegida

Arquivos/funções que o próximo patch visual **não deve alterar** (exceto className CSS / props puramente visuais do RF Background se inevitável).

### React Flow state & registrations

| Item | Arquivo |
|------|---------|
| `useNodesState` / `useEdgesState` / `useReactFlow` | `tdm-canvas-inner.tsx` |
| `nodeTypes` / `edgeTypes` | exportados em `tdm-canvas-inner.tsx` → `tdm` → `TdmNode` / `TdmTheoryEdge` |
| `defaultEdgeOptions`, snap grid, zoom limits, fit options | `tdm-canvas-inner.tsx` |
| `ReactFlowProvider` wrapper | `tdm-canvas.tsx` |
| `flowNodes` / `flowEdges` derivados (data flags toolbar/editor) | `tdm-canvas-inner.tsx` |

### Handlers (não editar corpo)

`fitCanvasToVisibleArea`, `centerNodes`, `organizeFlow`, `clearCanvasSelection`, `toggleGuideExpanded`, `openNodeEditor`, `cancelNodeEditor`, `updateNodeById`, `deleteNodeById`, `duplicateNodeById`, `deleteMarkerFromEdge`, `saveMarkerOnEdge`, `saveMarkerOnSelectedEdge`, `deleteMarkerFromSelectedEdge`, `advanceStage`, `handleCreateNode`, `handleSaveSelectedNode`, `handleStageDragStart`, `handleDragOver`, `handleDrop`, `isValidConnection`, `handleConnect`, `handleConnectStart`, `handleConnectEnd`, `handlePaneClick`, `handleFlowBackgroundClick`, `handleNodeClick`, `handleNodeDoubleClick`, `handleEdgeClick`, `handleCloseToolbar`, `openResultView`, keyboard handler.

### Criação / edição / delete / duplicar

| Util / ponto | Arquivo |
|--------------|---------|
| `createNode` | `utils/create-node.ts` |
| `createEdge` | `utils/create-edge.ts` |
| Placement | `utils/node-placement.ts` |
| Stage creation machine | `utils/stage-creation.ts` |
| Interaction provider | `TdmNodeInteractionProvider` em `tdm-node.tsx` |

### Drag / drop / conexões

| Item | Arquivo |
|------|---------|
| `isAllowedTdmConnection`, `getConnectionKind`, risk/hypothesis rules | `domain/tdm-connection-rules.ts` |
| Stroke/dash widths | `domain/tdm-connection-theme.ts` |
| Guide copy | `domain/tdm-theory-guide.ts` |
| Drop/create on canvas | handlers em `tdm-canvas-inner.tsx` |

### Risco / hipótese

| Item | Arquivo |
|------|---------|
| `TdmEdgeMarkerEditor` save validation | `tdm-edge-marker-editor.tsx` |
| Marker resolve + editor open state | `tdm-theory-edge.tsx` + `markerEditorEdgeId` state |
| Sidebar context add risk/hypothesis/delete edge | `tdm-sidebar.tsx` / context wiring em inner |

### “Stores”

Não há Zustand dedicado. Estado é **local React** em `TdmCanvasInner`. Qualquer refactor de store está **fora** do pass visual.

### Domain & types

| Arquivo | Motivo |
|---------|--------|
| `domain/tdm-types.ts` | modelo Node/Edge/Draft/Marker |
| `domain/tdm-stages.ts` | order/labels |
| `domain/tdm-theme.ts` | theme API (unificação de cor pode **ler** daqui num patch posterior, sem mudar assinaturas) |
| `domain/tdm-connection-rules.ts` | regras de negócio |
| `domain/tdm-connection-theme.ts` | stroke mapping |
| `domain/tdm-theory-guide.ts` | conteúdo do guide |
| `data/example-theory.ts` | fixture |
| `utils/layout-nodes-by-stage.ts`, `layout-nodes-by-flow.ts` | organização |
| `utils/tdm-result.ts` | gate do resultado |
| `utils/tdm-edge-editor-position.ts` | posicionamento do modal |

### Resultado / navegação

- `viewMode` + `ResultView` mount em `tdm-canvas-inner.tsx`
- Rota auxiliar `/canvas/resultado` (`canvas-resultado-page`) — fora do shell principal; não misturar no primeiro pass.

---

## 5. Recomendação de ordem de ataque

Pass curto, **só visual**, na ordem atomic design — cada etapa fecha QA antes da próxima.

### 1) Átomos

1. Unificar tokens de etapa (escolher família `#a78bfa…` **ou** `#8B7CFF…` e aplicar em Sass locais + guide/minimap constants **sem** tocar rules).
2. Neutralizar surfaces: `--xy-*`, `.flowFrame`, dock/controls chrome (sem glow colorido).
3. Handles, markers R/H (borda/fill), form focus (sem fallback lilás em campo neutro).
4. Remover/ atenuar `scale`/`translateY` em hovers de átomos (botões dock, markers).

### 2) Moléculas

1. Node card (barra accent OK; CTA Salvar → neutro/glass).
2. Node toolbar action bar.
3. Connection guide Stage Plate shell.
4. Edge marker editor modal (risk/hypothesis) — chrome, não copy.
5. Form fields / form actions.

### 3) Organismos

1. Command dock + Controls stacking (evitar overlap).
2. MiniMap chrome.
3. Sidebar header/hero (reduzir glow pill).
4. Seção Agora + timeline + advance CTA.
5. Criar/Editar blocos + Organization accordion.
6. Quick shortcuts + Resultado CTA card.

### 4) QA

- [ ] Criar / editar / duplicar / deletar nó
- [ ] Conectar etapas válidas / rejeitar inválidas
- [ ] Adicionar / editar / remover risco e hipótese
- [ ] Drag da seção Agora
- [ ] Fit / colunas / fluxo / guia / limpar seleção
- [ ] Avançar etapa + abrir resultado quando elegível
- [ ] Toolbar do card não cobre handles de forma inutilizável
- [ ] Nenhum hover com `scale` deslocando hit-area
- [ ] Stage colors só em semântica de etapa; chrome neutro

---

## Índice rápido de arquivos (onde mexer no pass)

| Prioridade visual | Path |
|-------------------|------|
| Alta | `components/canvas/tdm-canvas.module.sass` |
| Alta | `components/canvas/tdm-connection-guide.module.sass` |
| Alta | `components/canvas/tdm-canvas-command-dock.module.sass` |
| Alta | `components/node/tdm-node.module.sass` |
| Alta | `components/edge/tdm-theory-edge.module.sass` |
| Alta | `components/edge/tdm-edge-marker-editor.module.sass` |
| Alta | `components/form-field/tdm-form-field.module.sass` |
| Alta | `components/form-field/tdm-form-actions.module.sass` |
| Alta | `components/sidebar/tdm-sidebar.module.sass` |
| Média | `components/sidebar/theory-header-form.module.sass` |
| Média | hex literals em `tdm-connection-guide.tsx` / `CANVAS_DS_*` (só valores, não lógica) |
| Baixa / legado | sculptures/orb/logo glows (se ainda renderizados no resultado card) |
| Não montado | `floating-header/*` |

| Protegido | Path |
|-----------|------|
| Orchestrator | `tdm-canvas-inner.tsx` (handlers/state) |
| Domain | `domain/*` |
| Utils fluxo | `utils/create-*.ts`, `layout-*.ts`, `stage-creation.ts`, `node-placement.ts`, `tdm-result.ts` |
| Types | `domain/tdm-types.ts` |

---

## Critérios de aceite deste documento

- [x] Nenhum arquivo de código alterado nesta tarefa
- [x] Nenhum Sass alterado
- [x] Apenas `docs/canvas-visual-inventory.md` criado
- [x] Mostra exatamente onde mexer (área → TSX → Sass → classes)
- [x] Separa visual de lógica protegida
- [x] Build não requerido

*Inventário gerado para o pass Resend Command Canvas — atualizar este doc somente se a árvore de componentes mudar.*
