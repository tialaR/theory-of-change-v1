# FASE 5B.10 — LOGO CANÔNICA + FIELDS DO CANVAS + RISCO/HIPÓTESE + INSPECTOR DE CONEXÃO

## ORDEM DIRETA

Execute a implementação completa. Não responda com plano, proposta ou lista de possibilidades.

Este pacote é uma correção incremental sobre a Fase 5B.9. Preserve o que já funciona e corrija exclusivamente os consumidores ativos descritos aqui.

Use obrigatoriamente:

- `assets/tmd-construtor-header-canonical.png`
- `references/01-connection-inspector-actions.png`
- `references/02-create-block-fields-low-visibility.png`
- `references/03-sidebar-hero-fields-thick-double-shell.png`
- `references/04-risk-editor-thick-field-broken-actions.png`

A implementação deve respeitar Next.js 16 App Router, React 19, React Flow, Motion, feature-based architecture, Sass Modules, SRP, KISS, DRY, SOLID e os tokens TDM existentes.

Não instalar dependências. Não alterar domínio, stores, regras causais, ids de nodes, ids de edges, handles, rotas, exportações ou `TdmContextLabel`.

Não criar componentes com sufixos `V2`, `New`, `Fixed`, `Final`, `Premium` ou `Alternative`.

Não usar:

- `!important`;
- `transition: all`;
- CSS global para corrigir consumidor local;
- overrides soltos no final de módulos Sass;
- wrapper visual em volta de outro field visual;
- botão em formato de pílula;
- ícones gigantes;
- glow, blur, brightness, contrast, drop-shadow ou pseudo-elemento luminoso na marca.

Não fazer commit, push, PR ou tag.

---

# 1. PRÉ-VOO E CONSUMIDORES ATIVOS

Antes de editar, execute e registre no relatório:

```bash
git branch --show-current
git status --short
git diff --name-status
git diff --check

grep -R -n "tmd-construtor-header\|tmd-construtor-clean\|HomeBrandLogo\|brandText" src public
grep -R -n "CRIAR NOVO\|Criar novo\|Nome do bloco\|Detalhes complementares do bloco\|Notas de apoio" src/features src/shared
grep -R -n "Sua teoria da mudança\|Descrição (opcional)" src/features src/shared
grep -R -n "Editar risco\|Editar hipótese\|Risco desta passagem\|Hipótese desta passagem\|Adicionar risco\|Adicionar hipótese" src/features
grep -R -n "Editar conexão\|Conexão válida\|Ação semântica permitida\|Excluir conexão" src/features
grep -R -n "TdmField\|TdmInput\|TdmTextarea\|controlShell" src/shared src/features/theory-of-change
```

Não presuma que o primeiro arquivo encontrado é o consumidor ativo. Siga os imports desde as rotas e registre a cadeia real.

Faça backup local fora do repositório:

```bash
git diff > /tmp/tdm-5b10-before.patch
git status --short > /tmp/tdm-5b10-before-status.txt
```

---

# 2. LOTE A — LOGO CORRETA, GRANDE E LEGÍVEL NO HEADER

## Asset obrigatório

Copie:

```text
assets/tmd-construtor-header-canonical.png
```

para:

```text
public/assets/brand/tmd-construtor-header-canonical.png
```

Esse arquivo já está recortado rente ao conteúdo útil. Não use novamente o PNG antigo com área transparente enorme e não use o asset com glow da rodada anterior.

## Consumidor ativo esperado

```text
src/shared/ui/lusion-resend-ds/lusion-resend-ds.tsx
src/shared/ui/lusion-resend-ds/lusion-resend-ds.module.sass
```

Confirme pelo import real antes de editar.

## Implementação obrigatória

- Renderizar o asset exato com `next/image`.
- Manter o link da marca para `/`.
- `alt="TMD Construtor"`.
- A marca precisa ser reconhecida imediatamente, sem ficar microscópica.
- Geometria desktop:

```text
inline-size: clamp(12.5rem, 14vw, 15rem)
block-size: auto
max-block-size: 2.75rem
object-fit: contain
object-position: left center
```

- O wrapper deve ser somente layout, sem background próprio, sem glow, sem recorte artificial e sem padding exagerado.
- Remover do consumidor ativo qualquer:

```text
filter
mix-blend-mode
box-shadow
drop-shadow
blur
brightness
contrast
opacity menor que 1
pseudo-elemento luminoso
```

- Não reconstruir a marca em texto ou SVG.
- Não renderizar `TDM` separado ao lado.
- Não deslocar a navegação central nem o CTA do header.
- Preservar foco visível no link da marca.

## Aceite visual

- símbolo, wordmark e “CONSTRUTOR” legíveis ao primeiro olhar;
- sem halo criado por CSS;
- sem retângulo preto;
- sem espaço transparente desperdiçado em volta;
- sem reduzir a marca para caber por causa do tamanho original de 1536×1024.

---

# 3. LOTE B — PADRÃO CANÔNICO DE FIELD PARA TODO O CANVAS

## Objetivo

Padronizar os estados visualmente ativos dos fields de:

1. formulário “Criar novo bloco” da Sidebar;
2. formulário “Editar bloco” no node do Canvas;
3. título e descrição da teoria no hero da Sidebar;
4. formulário flutuante de risco e hipótese;
5. formulário de edição de risco e hipótese na Sidebar.

Todos devem parecer o mesmo sistema. Um field, uma superfície, uma borda.

## Regra estrutural obrigatória

O wrapper semântico pode existir para label, erro, adornments e layout, porém deve ser visualmente transparente.

Apenas o elemento interativo real pode possuir:

- background;
- borda;
- radius;
- estado de foco.

É proibido exibir:

- input dentro de outro input;
- uma borda no wrapper e outra no input;
- um container escuro externo envolvendo uma segunda superfície escura interna;
- ring azul genérico do navegador ou token legado.

## Implementação recomendada

Centralize o padrão no primitivo canônico já existente, preferencialmente:

```text
src/shared/ui/tdm-field/tdm-field.module.sass
src/shared/ui/tdm-field/tdm-field.tsx
```

Ajuste consumidores somente quando houver regra de densidade específica. Não crie uma biblioteca paralela.

## Estado sem foco

A borda deve ser uma hairline visual menor que 1px, com branco opaco em gradiente sutil.

Use o próprio field, não um wrapper visível. Exemplo de técnica permitida:

```sass
border: 0.5px solid transparent
background:
  linear-gradient(var(--tdm-surface-input), var(--tdm-surface-input)) padding-box,
  linear-gradient(180deg, rgba(255, 255, 255, 0.24), rgba(255, 255, 255, 0.08)) border-box
```

Adapte aos tokens existentes. Não introduza hex local quando já houver token.

Resultado esperado:

- field claramente visível antes do foco;
- fundo escuro sólido, sem sumir no painel;
- hairline branca discreta;
- sem aparência de glass exagerado;
- sem borda grossa.

## Estado `:focus-visible`

- manter espessura hairline;
- substituir a borda branca opaca pela cor de accent do contexto;
- não adicionar ring grosso externo;
- não mudar tamanho ou provocar layout shift;
- não usar azul genérico se o contexto possui accent de etapa;
- contraste suficiente para localizar o foco imediatamente.

Use `:focus-visible`, não `:focus` indiscriminado.

## Estado hover

- aumentar discretamente a opacidade da hairline;
- não acender toda a superfície;
- não transformar o field em CTA.

## Tipografia e densidade

Nos forms do Canvas:

```text
label: 0.75rem a 0.8125rem
input/textarea: 0.875rem
placeholder: 0.875rem
line-height input: 1.25rem
line-height textarea: 1.375rem
clear glyph: 0.875rem a 1rem
hit target do clear: mínimo 2.25rem
```

- Scroll de textarea deve continuar funcional.
- Scrollbar deve ficar invisível.
- Sem overflow horizontal.
- Sem textos gigantes.
- Sem uppercase forçado em CTAs.

## Consumidores prováveis

Rastreie os ativos, incluindo:

```text
src/shared/ui/tdm-field/**
src/features/theory-of-change/components/sidebar/theory-header-form.*
src/features/theory-of-change/components/sidebar/tdm-sidebar.*
src/features/theory-of-change/components/canvas/tdm-canvas-node-form/**
src/features/theory-of-change/components/canvas/tdm-edge-marker-editor.*
```

A referência `02-create-block-fields-low-visibility.png` mostra o problema de baixa visibilidade.
A referência `03-sidebar-hero-fields-thick-double-shell.png` mostra a dupla camada e a borda grossa.
A referência `04-risk-editor-thick-field-broken-actions.png` mostra a mesma regressão no editor de risco.

---

# 4. LOTE C — FORMULÁRIOS FLUTUANTES DE RISCO E HIPÓTESE

## Cabeçalho obrigatório

No Canvas, o formulário flutuante deve exibir somente:

### Risco

```text
[ícone de alerta] Risco
```

### Hipótese

```text
[ícone de informação ou hipótese] Hipótese
```

Remover do cabeçalho flutuante:

```text
Risco desta passagem
Hipótese desta passagem
Por que esta conexão pode falhar?
Por que esta conexão deve funcionar?
```

Não adicionar novos textos substitutos.

## CTA obrigatório em modo de criação

```text
Adicionar risco
Adicionar hipótese
```

Não usar `Salvar risco` ou `Salvar hipótese` no formulário de criação flutuante.

Se existir modo real de edição de marcador já salvo, preserve a distinção semântica:

```text
Salvar risco
Salvar hipótese
```

somente no modo de edição existente.

## Visual obrigatório

- remover aparência de bolha transparente;
- remover pill buttons;
- superfície opaca e compacta com tokens TDM;
- radius canônico `md` ou `lg`, nunca `round`;
- textarea usando o padrão de field do Lote B;
- CTA com altura canônica, sem cápsula;
- ícone de fechar pequeno e alinhado;
- sem sombras excessivas;
- sem blur que permita os cards de trás competirem com o formulário.

Preservar toda a lógica de criação, validação, fechamento, edge selecionada e persistência.

---

# 5. LOTE D — SIDEBAR: EDITOR DE RISCO E HIPÓTESE

## Fields

Aplicar o mesmo field canônico do Lote B:

- hairline branca opaca sem foco;
- accent sem opacidade no `focus-visible`;
- uma única camada visual;
- sem borda grossa;
- sem wrapper parecendo outro input.

## Espaçamento vertical

Na composição do editor, deve existir separação visual consistente entre:

1. título “Editar risco” ou “Editar hipótese”;
2. resumo da conexão;
3. label do field;
4. field;
5. ações.

Use tokens de spacing. Não encoste os blocos e não crie vazios gigantes.

---

# 6. LOTE E — RESUMO DA CONEXÃO NÃO PODE PARECER INPUT

A caixa que mostra:

```text
Nova atividade → Novo produto
```

ou qualquer origem/destino não é um input.

## Estrutura obrigatória

- elemento semântico de resumo, não field;
- background transparente;
- uma única hairline branca discreta;
- radius canônico;
- `display: grid` ou `flex` com alinhamento central;
- origem à esquerda;
- destino à direita;
- seta central maior no eixo X e fina no stroke;
- textos centralizados verticalmente;
- nenhuma affordance de edição;
- nenhuma superfície interna.

Geometria sugerida:

```sass
display: grid
grid-template-columns: minmax(0, 1fr) 2.5rem minmax(0, 1fr)
align-items: center
gap: 0.75rem
padding: 0.875rem 1rem
border: 0.5px solid rgba(255, 255, 255, 0.18)
background: transparent
```

Seta:

```text
largura visual: 1.75rem a 2rem
stroke: 1.25 a 1.5
sem círculo ou container próprio
```

A origem e o destino não podem quebrar o layout dos CTAs abaixo.

---

# 7. LOTE F — INSPECTOR “EDITAR CONEXÃO” COM BAIXO CUSTO COGNITIVO

A referência `01-connection-inspector-actions.png` mostra:

- ícones gigantes;
- texto quebrando;
- ações apertadas;
- CTA parecendo mosaico;
- hierarquia confusa.

Corrija o consumidor ativo, sem criar outra versão.

## Ordem visual obrigatória

1. header com ícone pequeno + `Editar conexão`;
2. resumo origem → destino do Lote E;
3. status com ícone check pequeno + frase principal;
4. apoio secundário curto;
5. grid de duas ações.

## Status

Preserve o significado atual, mas reduza o parágrafo para leitura rápida. Não exiba o texto como bloco corrido gigante.

Estrutura visual:

```text
[check] Conexão válida
        Você pode documentar o risco desta passagem.
```

ou:

```text
[check] Conexão válida
        Você pode documentar a hipótese desta passagem.
```

Não usar “Ação semântica permitida:” como rótulo técnico visível ao usuário.

## CTAs

Grid:

```sass
display: grid
grid-template-columns: repeat(2, minmax(0, 1fr))
gap: 0.75rem
```

Cada CTA:

```text
altura mínima: 2.75rem
radius: md
ícone: 1rem a 1.125rem
texto: 0.875rem
font-weight: 500
uma linha sempre que houver espaço
```

Ações de adicionar:

```text
[PlusIcon] Adicionar risco
[PlusIcon] Adicionar hipótese
```

Estado repouso:

- texto neutro;
- ícone neutro;
- borda neutra;
- background transparente ou superfície muito discreta.

Hover e `focus-visible`:

- ícone, texto e borda ganham destaque juntos;
- sem aumentar espessura;
- sem layout shift;
- sem glow.

Ação de excluir:

```text
[TrashIcon] Excluir conexão
```

Estado repouso:

- texto neutro;
- ícone neutro;
- borda neutra.

Hover e `focus-visible`:

- ícone danger;
- texto danger;
- borda danger;
- background danger-soft discreto;
- sem vermelho permanente.

É proibido:

- ícone maior que o texto em escala visual;
- ícone ocupando metade do botão;
- texto em duas linhas por falta de layout;
- CTA em formato pill;
- CTA destructive vermelho em repouso.

---

# 8. PRESERVAÇÃO FUNCIONAL

Não alterar:

- criação e edição de blocos;
- seleção e drag dos nodes;
- conexões React Flow;
- regras de risco e hipótese;
- abertura e fechamento dos editores;
- persistência dos textos;
- atalhos;
- Sidebar aberta/fechada;
- exportações DOCX, PDF, PNG e SVG;
- rotas públicas;
- cards de `/exemplos` nesta rodada.

Não reintroduzir `nodrag` ou `nopan` no wrapper inteiro do formulário do node. Inputs, textareas e botões continuam protegidos, mas a área neutra do formulário deve continuar permitindo seleção e drag em um gesto.

---

# 9. QA VISUAL OBRIGATÓRIO

Validar no navegador em viewport desktop.

## `/`

- logo canônica grande e legível;
- sem glow CSS;
- sem imagem antiga;
- menu e CTA não deslocados.

## `/canvas`

### Hero da Sidebar

- título e descrição com uma única camada;
- hairline visível sem foco;
- accent fino no foco;
- sem ring azul grosso.

### Criar bloco

- todos os fields visíveis antes do foco;
- accent fino no foco;
- placeholder legível;
- tipografia compacta;
- scrollbars invisíveis.

### Editar bloco no node

- mesmo padrão visual;
- drag em um gesto na área neutra;
- fields continuam editáveis.

### Risco e hipótese flutuantes

- cabeçalho somente ícone + título;
- CTA `Adicionar risco` ou `Adicionar hipótese`;
- sem pílula;
- sem bolha transparente;
- field com padrão canônico.

### Sidebar de risco/hipótese

- borda hairline;
- foco pelo accent;
- resumo de conexão não parece input;
- origem/destino com seta longa e fina;
- espaço correto entre seções.

### Inspector de conexão

- header escaneável;
- status curto;
- PlusIcon e TrashIcon em escala correta;
- CTAs não quebram;
- excluir só fica danger no hover/focus-visible;
- adicionar só ganha destaque no hover/focus-visible.

Capture screenshots depois da implementação com estes nomes:

```text
docs/phase-5b10-canvas-field-and-connection-polish/after-header-logo.png
docs/phase-5b10-canvas-field-and-connection-polish/after-sidebar-hero-fields.png
docs/phase-5b10-canvas-field-and-connection-polish/after-create-block-fields.png
docs/phase-5b10-canvas-field-and-connection-polish/after-node-edit-fields.png
docs/phase-5b10-canvas-field-and-connection-polish/after-risk-floating-form.png
docs/phase-5b10-canvas-field-and-connection-polish/after-hypothesis-floating-form.png
docs/phase-5b10-canvas-field-and-connection-polish/after-risk-sidebar-editor.png
docs/phase-5b10-canvas-field-and-connection-polish/after-connection-inspector.png
```

Screenshot de código ou componente isolado não substitui screenshot do runtime ativo.

---

# 10. GATES

Execute:

```bash
git diff --check
npx tsc --noEmit
npm run build
npm run check:tdm-ds
npm run lint
```

Também execute:

```bash
grep -R -n "transition: all\|!important" \
  src/shared/ui/tdm-field \
  src/features/theory-of-change/components/sidebar \
  src/features/theory-of-change/components/canvas

grep -R -n "drop-shadow\|brightness\|mix-blend-mode\|filter:" \
  src/shared/ui/lusion-resend-ds

grep -R -n "Risco desta passagem\|Hipótese desta passagem\|Ação semântica permitida" \
  src/features/theory-of-change
```

Resultado obrigatório nos consumidores ativos:

- zero `!important` novo;
- zero `transition: all` novo;
- zero filtro/glow na logo;
- zero “Risco desta passagem” e “Hipótese desta passagem” no editor flutuante;
- zero “Ação semântica permitida” no inspector ativo.

Se o lint global falhar somente por dívida pré-existente, execute lint dirigido nos arquivos alterados e registre ambos os resultados sem maquiar a falha global.

---

# 11. RELATÓRIO FINAL OBRIGATÓRIO

Entregue exatamente:

1. cadeia rota → consumidor ativo de cada correção;
2. arquivos criados e alterados;
3. caminho final do asset da logo;
4. dimensões visuais da logo no runtime;
5. onde o padrão único de field foi centralizado;
6. como o wrapper visual duplicado foi removido;
7. estados idle, hover e focus-visible dos fields;
8. textos finais dos forms de risco e hipótese;
9. estrutura final do resumo origem → destino;
10. estrutura e estados finais dos CTAs do inspector;
11. prova de drag em um gesto no node em modo formulário;
12. screenshots exigidos;
13. resultado de cada gate;
14. pendências reais, sem chamar item não implementado de concluído;
15. confirmação de que não houve commit, push, PR ou tag.

A fase só termina quando o consumidor ativo estiver visualmente corrigido no navegador.
