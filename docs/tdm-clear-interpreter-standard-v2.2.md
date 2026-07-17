# Padrão do Intérprete da Teoria — v2.2

## Status

Esta versão **substitui a v2.1** como fonte de verdade da **apresentação documental** e da **exportação**.

A v2.1 permanece arquivada para histórico semântico da matriz e do motor narrativo.

A v2.2 **não altera** o motor semântico aprovado: preserva escopo V1, matriz risco/hipótese, regras macro/scoped e fontes FGV EESP CLEAR.

## Finalidade

Este documento define o padrão editorial, visual e técnico do componente **Intérprete da teoria** em modo documento, incluindo perfis `screen` e `export`, figura documental e exportação PDF/DOCX.

## Escopo da V1

A V1 contempla somente:

1. insumos;
2. atividades;
3. produtos;
4. resultados;
5. conexões;
6. riscos;
7. hipóteses.

Não introduzir impactos, indicadores, objetivos, público-alvo, monitoramento ou avaliação.

## Matriz obrigatória de riscos e hipóteses

A associação é exclusiva por transição:

| Transição | Permitido | Proibido |
|---|---|---|
| `INSUMOS → ATIVIDADES` | somente **RISCO** | hipótese; risco/hipótese |
| `ATIVIDADES → PRODUTOS` | somente **RISCO** | hipótese; risco/hipótese |
| `PRODUTOS → RESULTADOS` | somente **HIPÓTESE** | risco; risco/hipótese |

Regras absolutas:

- não existe hipótese entre Insumos e Atividades;
- não existe hipótese entre Atividades e Produtos;
- não existe risco entre Produtos e Resultados;
- não existe combinação `RISCO / HIPÓTESE` na mesma conexão;
- nenhuma outra combinação é válida na V1;
- dados antigos incompatíveis devem ser ignorados na apresentação e reportados;
- não migrar nem apagar dados automaticamente sem decisão de produto.

## Cabeçalho

- Kicker: `INTÉRPRETE DA TEORIA`.
- Sem seleção: `Narrativa da teoria`.
- Com seleção: `Narrativa do fluxo selecionado`.
- Metadados: etapas, conexões, riscos e hipóteses derivados do escopo atual (singular/plural corretos).

Espaçamentos mínimos de tela:

- kicker → título: `0.5rem`
- título → metadados: `0.5rem`
- metadados → introdução: `1.5rem`
- introdução → figura: `1.5rem`

Delimitação documental sob o cabeçalho:

- `border-bottom: 0.0625rem solid rgba(20, 20, 22, 0.12)`
- `padding-bottom: 1.25rem`

## Modos narrativos

### Macro

Narra a teoria completa, todos os caminhos, ramificações, convergências e somente os riscos/hipóteses válidos pela matriz.

### Scoped

Narra somente o caminho relacionado ao card, conexão, risco ou hipótese selecionado.

## Regras narrativas

- usar apenas dados existentes;
- preservar título, descrição, detalhes e notas;
- adicionar somente conectores editoriais determinísticos;
- omitir campos vazios;
- deduplicar textos literalmente iguais;
- inserir risco ou hipótese somente na transição autorizada;
- não usar IA, aleatoriedade, impactos ou conteúdo inventado;
- um único motor narrativo para tela e exportação.

## Perfis de apresentação

Contrato explícito:

```ts
type TheoryDocumentPresentation =
  | 'screen'
  | 'export';
```

### Perfil `screen`

- superfície documental clara (`#f7f7f5`);
- texto escuro (`rgba(22, 22, 24, 0.92)`);
- Inter;
- largura limitada pelo supporting pane atual;
- leitura contínua com scroll;
- controles de exportação e fechar visíveis;
- divisores apenas entre grandes unidades documentais;
- sem páginas A4 rígidas;
- sem números de página falsos;
- `text-align: start`;
- tipografia de leitura:

```sass
font-family: var(--font-inter), Inter, ui-sans-serif, system-ui
font-size: 0.9375rem
line-height: 1.65
max-width: 68ch
```

### Perfil `export`

- página branca;
- texto preto;
- Arial 12 pt;
- medidas físicas A4;
- controles removidos;
- estrutura apropriada para PDF e DOCX;
- paginação real quando a tecnologia de exportação a suportar;
- `text-align: justify`.

Medidas documentais de exportação:

```text
Formato: A4
Margem superior: 3 cm
Margem esquerda: 3 cm
Margem inferior: 2 cm
Margem direita: 2 cm
Fonte: Arial 12 pt
Entrelinhas: 1,5
Texto: justificado
Recuo da primeira linha: 1,25 cm
Legendas e fontes: 10 pt
Referências: espaçamento simples
```

## Estrutura documental na tela

```text
Cabeçalho
────────────
Introdução

Figura
────────────
Narrativa

Riscos e hipóteses (notas documentais)
────────────
Referências (macro)
```

Não criar páginas A4 de altura fixa no supporting pane.

Não gerar espaços vazios para simular quebra de página.

## Bloco da figura

Estrutura:

```tsx
<figure>
  <figcaption>…</figcaption>
  <div className="figureFrame">{/* fluxograma SVG */}</div>
  <p>Visão estrutural…</p>
  <p>Fonte: … FGV EESP CLEAR.</p>
</figure>
```

- Macro: `Figura 1 – Encadeamento simplificado da teoria da mudança`
- Scoped: `Figura 1 – Encadeamento simplificado do fluxo selecionado`

Quadro:

```sass
border: 0.0625rem solid rgba(20, 20, 22, 0.14)
border-radius: 0.375rem
padding: 1.25rem
background: rgba(255, 255, 255, 0.56)
```

## Fluxograma simplificado

Estrutura obrigatória:

```text
INSUMOS → ATIVIDADES → PRODUTOS → RESULTADOS
            RISCO         RISCO        HIPÓTESE
```

Regras:

- quatro blocos principais;
- retângulos simples e setas unidirecionais;
- nunca renderizar `RISCO / HIPÓTESE`;
- não inserir descrições, detalhes ou notas dentro da figura;
- monocromático ou com cor mínima;
- nunca depender apenas de cor;
- SVG semântico com texto alternativo.

Fonte:

`Fonte: elaboração própria com base nos dados da teoria e na estrutura metodológica do FGV EESP CLEAR.`

## Risco e hipótese na apresentação

Notas documentais (não cards):

```text
Risco
Nesta ligação, foi registrado o seguinte risco: “…”

Hipótese
Esta passagem depende da seguinte hipótese: “…”
```

Visual:

- filete fino à esquerda;
- fundo quase imperceptível;
- sem ícone grande;
- sem alerta vermelho/laranja;
- sem recuo de parágrafo de corpo.

## Referências

No documento macro (tela e exportação), ao final:

```text
REFERÊNCIAS
```

Incluir somente:

- FGV EESP CLEAR. *Infográfico: Teoria da mudança*. 2021.
- LIMA, Lycia; SOUZA, André Portela. *Guia CLEAR: monitoramento e avaliação de políticas públicas: do diagnóstico à decisão*. 2025.
- FGV EESP CLEAR. *Da teoria à mudança: adaptações do Primeira Infância Melhor a partir de ações de monitoramento e avaliação*. 2024.

No preview scoped da tela, a seção pode ser omitida.

Na exportação scoped, incluir apenas a referência metodológica necessária (Infográfico CLEAR).

## Toolbar e exportação

Ordem no header do supporting pane:

```text
[ Exportar ] [ Fechar ]
```

Menu:

```text
Exportar fluxo selecionado
  PDF
  DOCX

Exportar teoria completa
  PDF
  DOCX
```

Sem seleção válida, omitir o grupo “fluxo selecionado”.

### PDF

Estratégia atual: superfície dedicada de impressão (`window.print` em janela isolada), sem chrome da aplicação.

- gera PDF real via “Salvar como PDF” do navegador;
- A4 e margens documentais;
- figura SVG vetorial embutida;
- não captura screenshot da sidebar.

### DOCX

Bloqueio técnico enquanto não houver biblioteca aprovada para `.docx` real.

Não aceitar:

- HTML renomeado para `.docx`;
- texto puro renomeado;
- `.doc` falso;
- captura de imagem em DOCX vazio.

Dependência mínima recomendada (pendente de aprovação): `docx`.

### Nomes de arquivo

Macro:

```text
<slug-da-teoria>-narrativa-completa.pdf
<slug-da-teoria>-narrativa-completa.docx
```

Scoped:

```text
<slug-da-teoria>-fluxo-<slug>.pdf
<slug-da-teoria>-fluxo-<slug>.docx
```

## Acessibilidade

- `article` para o documento;
- `header` documental;
- `figure` / `figcaption`;
- headings em ordem;
- botão de exportação com `aria-label`;
- menu navegável por teclado;
- Escape fecha o menu sem fechar o pane;
- foco restaurado ao botão;
- texto alternativo do fluxograma;
- contraste adequado em escala de cinza;
- estados de loading e erro anunciados (`aria-live`).

## Performance

- exportação somente após ação explícita;
- não reconstruir ViewModel documental em scroll, zoom, pan ou hover;
- supporting pane não atualiza a câmera do workspace.

## Limitações técnicas

1. Não há biblioteca PDF no `package.json`; PDF depende do diálogo de impressão do navegador.
2. Não há biblioteca DOCX; a ação permanece indisponível/marcada como pendente.
3. O supporting pane não é uma folha A4 literal; a sensação documental vem de tipografia, divisores e figura.

## Base normativa interna

- ABNT NBR 14724:2024;
- ABNT NBR 10520:2023;
- ABNT NBR 6023:2018.
