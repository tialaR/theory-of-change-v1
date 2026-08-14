# TDM Design System Contract v1

## 1. Objetivo

Estabelecer uma fonte de verdade executável para UI, motion e arquitetura visual da aplicação TDM.

A direção visual combina:

- TMD-first: simplicidade, precisão, superfícies silenciosas e hierarquia direta;
- Apple HIG: clareza, legibilidade, alinhamento, área de interação e preservação de proporção;
- Material Design: papéis explícitos de ação, estados previsíveis e tokens em camadas;
- Figma: componente principal como fonte das instâncias, variantes controladas e redução de overrides locais.

As referências orientam decisões. Elas não autorizam copiar marcas ou layouts literalmente.

## 2. Fontes canônicas

A ordem de precedência é:

1. comportamento funcional existente e testes;
2. componente canônico ativo no repositório;
3. documentação deste diretório;
4. preview HTML homologado;
5. referências externas.

Quando documentação e runtime divergirem, o agente deve parar, registrar a divergência e pedir decisão. Não deve improvisar uma terceira solução.

## 3. Mapa conhecido do projeto

Rotas públicas ativas identificadas no último snapshot auditado:

- `/` -> HomePage;
- `/guia-de-aprendizado` -> GuideExperiencePage;
- `/exemplos` -> ExamplesPage;
- `/exemplos/visao-do-fluxo` -> FlowPage;
- `/exemplos/visao-do-fluxo/interativo` -> FlowVisionInteractiveWorkspace / FlowVisionDiagram;
- `/exemplos/resultado` -> ResultPage;
- `/exemplos/resultado/interativo` -> ResultExperience / ResultDiagram;
- `/referencias` -> ReferencesPage.

Rotas do motor do canvas, congeladas fora de rodadas específicas:

- `/canvas`;
- `/exemplos/canvas`;
- `/canvas/resultado`;
- `/canvas/tdm-command-preview`.

Componentes públicos conhecidos:

- `src/features/theory-of-change/components/public-pages/public-pages.tsx`;
- `src/features/theory-of-change/components/public-pages/public-pages.module.sass`;
- `src/shared/ui/tdm-public-design-system/tdm-public-design-system.tsx`;
- `src/shared/ui/tdm-public-design-system/tdm-public-design-system.module.sass`;
- `src/shared/ui/tdm-context-label/tdm-context-label.tsx`;
- `src/features/theory-of-change/components/public-experience/example-previews/*`;
- `src/features/theory-of-change/components/public-pages/home-brand-logo/*`.

Prévias públicas conhecidas:

- `flow-draft-preview.tsx`;
- `flow-draft-preview.module.sass`;
- `result-draft-preview.tsx`;
- `theory-draft-preview.tsx`;
- `theory-draft-preview.module.sass`;
- `dedicated-example-preview.tsx`;
- `example-previews.module.sass`.

O repositório atual sempre prevalece para confirmar nomes e consumidores.

## 4. Camadas de tokens

### 4.1 Referência

Valores concretos sem papel de produto:

- neutral;
- violet;
- blue;
- amber;
- green;
- spacing;
- radius;
- typography;
- border;
- duration;
- easing.

### 4.2 Sistema semântico

Papéis reutilizáveis:

- surface-page;
- surface-raised;
- surface-overlay;
- content-primary;
- content-secondary;
- content-muted;
- border-subtle;
- border-hover;
- action-primary;
- action-secondary;
- focus-ring;
- stage-input;
- stage-activity;
- stage-output;
- stage-outcome;
- risk;
- hypothesis.

### 4.3 Componente

Tokens por família:

- public-header;
- public-action;
- public-icon-button;
- public-preview-frame;
- public-card;
- context-label;
- canvas-card;
- canvas-action;
- field;
- tooltip;
- result-column.

Component tokens devem mapear para system tokens. Valores concretos não devem ser repetidos em consumidores.

## 5. Regras globais

- Sass Modules obrigatórios para estilos de componentes.
- Unidades dimensionais em `rem`, exceto valores sem unidade e geometria SVG.
- Nenhum `!important` novo.
- Nenhum override corretivo acumulado no fim de arquivos.
- Nenhum componente React deve detectar `pathname` para escolher roupa visual.
- Nenhuma mudança visual pode alterar callback, href, type, disabled, loading, store ou domínio.
- Nenhum componente público novo pode ser importado pelo motor do canvas sem aprovação explícita.
- Imagens preservam aspect ratio e não usam `transform: scale()` como correção estrutural.
- Background, borda e shadow pertencem ao primitive ou wrapper canônico, não ao consumidor.

## 6. Ações públicas

Preview obrigatório:

`docs/design-system/previews/tdm-public-actions-header-v2.html`

Política:

- uma ação principal preenchida por contexto;
- ações complementares textuais sem borda;
- exportações compactas com hairline;
- icon buttons autônomos com hairline;
- CTA do header textual e compacto;
- sem gradiente ornamental;
- sem shadow ornamental;
- sem scale em hover;
- focus-visible obrigatório;
- área interativa mínima equivalente a `2.75rem`.

## 7. Header público

Contrato detalhado (comportamento/geometria):

`docs/design-system/TDM-PUBLIC-HEADER-V2.md`

Superfície scrolled (decisão posterior V3):

`docs/design-system/TDM-PUBLIC-HEADER-V3.md`

Princípios:

- exatamente um `<header>` público no DOM;
- exatamente uma navegação pública;
- topo visualmente transparente;
- após scroll, superfície V3 (`rgba(7, 8, 9, 0.76)` + blur/saturate + border-bottom only);
- shell e conteúdo mantêm a mesma geometria em ambos os estados;
- nunca aplicar `opacity` ao header inteiro;
- o hero nunca pode ficar acima do header;
- remover legado do JSX, nunca esconder com CSS.

## 7.1 Guided Story (Home)

Contrato:

`docs/design-system/TDM-GUIDED-STORY-V1.md`

Preview:

`docs/design-system/previews/tdm-guided-story-v7-validated.html`

Consumidor: `HomeOnboardingPreview` → `guided-story.tsx` na seção PRÉVIA GUIADA de `/`.

## 8. Prévias animadas

Preview obrigatório:

`docs/design-system/previews/tdm-public-example-previews-v2-existing-motion.html`

Política:

- motion existente preservado;
- mesmo frame externo para Fluxo e Resultado;
- mesmo aspect ratio, padding e viewport interno;
- animação não pode ser recriada pelo wrapper;
- paths, fases, duração, easing e reduced motion permanecem no componente animado;
- superfície simples, uma borda, zero sombra ornamental.

## 9. Motion

Todo motion deve declarar:

- elemento;
- gatilho;
- duração;
- easing;
- loop ou estado final;
- função comunicada;
- comportamento em reduced motion.

Regras:

- loops apenas quando comunicam fluxo contínuo;
- hover não deve causar layout shift;
- animações de borda não podem bloquear pointer events;
- motion decorativo deve ser removível por `prefers-reduced-motion`;
- não substituir motion homologado durante refino de container.

## 10. Acessibilidade

- controles interativos com alvo mínimo de `2.75rem`;
- foco visível sem alterar geometria;
- icon buttons com nome acessível;
- texto e background com contraste medido;
- informação não pode depender somente de cor;
- zoom de navegador em 200% sem overflow horizontal;
- reduced motion e reduced transparency devem ser testados quando aplicáveis;
- ordem de foco deve seguir a ordem visual.

## 11. Proibições

- dois headers concorrentes;
- primitive público duplicado por página;
- cards e previews com backgrounds locais concorrentes;
- `display: none` para esconder legado ativo;
- tokens globais alterados para corrigir uma única rota;
- `scale()` para compensar wrapper incorreto;
- motion recriado em HTML e copiado para o app;
- valor visual espalhado em vários módulos;
- migração visual junto com refatoração de domínio.

## 12. Referências oficiais

- Cursor Rules: https://cursor.com/docs/rules
- Apple UI Design Dos and Don'ts: https://developer.apple.com/design/tips/
- Apple Human Interface Guidelines: https://developer.apple.com/design/human-interface-guidelines/
- Material Web Buttons: https://material-web.dev/components/button/
- Material Web Theming: https://material-web.dev/theming/material-theming/
- Figma Guide to Components: https://help.figma.com/hc/en-us/articles/360038662654-Guide-to-components-in-Figma
- TMD: https://tdm.com/
- TMD About and Philosophy: https://tdm.com/about
