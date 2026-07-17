# Padrão de apresentação documental do Intérprete da Teoria - v2.2

## Status

Esta versão complementa o padrão semântico `tdm-clear-interpreter-standard-v2.1.md` e passa a ser a fonte de verdade da apresentação documental em tela e exportação.

## Objetivo

Transformar a narrativa do Intérprete da Teoria em uma superfície documental profissional, auditável e adequada para leitura prolongada, sem alterar o motor narrativo, os dados, a câmera ou o diagrama de resultados.

## Princípio de separação

### Camada de interface

Inclui supporting pane, toolbar, botões, menu, foco e scroll. Continua seguindo o Design System da aplicação.

### Camada documental

Inclui cabeçalho, metadados, introdução, figura, narrativa, riscos, hipóteses e referências. Deve ser opaca, estável e visualmente separada dos controles.

## Escopo semântico V1 preservado

1. Insumos.
2. Atividades.
3. Produtos.
4. Resultados.
5. Conexões.
6. Riscos.
7. Hipóteses.

Matriz obrigatória:

- Insumos para Atividades: somente risco.
- Atividades para Produtos: somente risco.
- Produtos para Resultados: somente hipótese.

Não introduzir impactos, indicadores, monitoramento, avaliação, dados inventados ou causalidade inexistente.

## Contrato de apresentação

```ts
type TheoryDocumentPresentation = 'screen' | 'export';
```

A mesma árvore semântica deve atender aos dois modos.

## Perfil screen

- Superfície off-white opaca: direção `#f7f7f4`.
- Texto principal: direção `#242426`.
- Documento sem blur, backdrop-filter, glow, gradiente ou tint de etapa.
- Fonte do documento: Arial, Helvetica, sans-serif.
- Controles da aplicação continuam em Inter.
- Corpo: `0.9375rem`, peso 400, line-height 1.7.
- Largura de leitura: até 66ch.
- Texto alinhado à esquerda.
- Recuo de primeira linha: 1.5rem somente nos parágrafos adequados.
- Um único owner de scroll vertical.

## Cabeçalho

Ordem:

1. `INTÉRPRETE DA TEORIA`.
2. `Narrativa da teoria` ou `Narrativa do fluxo selecionado`.
3. Metadados derivados do escopo atual.
4. Divisor hairline.
5. Introdução.

Espaçamentos:

- kicker para título: 0.5rem;
- título para metadados: 0.5rem;
- metadados para divisor: 1.25rem;
- divisor para introdução: 1.5rem.

## Corpo narrativo

- Agrupar descrição, detalhes e notas em blocos textuais coerentes.
- Não retornar para labels burocráticos de campos.
- Não inserir divisor entre parágrafos do mesmo raciocínio.
- Preservar integralmente os textos e o motor determinístico já aprovado.

## Divisão documental

Divisores apenas entre grandes unidades:

1. cabeçalho;
2. introdução;
3. figura;
4. narrativa;
5. referências.

Não criar páginas A4 rígidas na sidebar. A sensação documental vem de respiro, agrupamento, títulos e hairlines.

## Figura

Estrutura semântica:

- `figure`;
- `figcaption` acima;
- frame com borda fina e padding;
- nota estrutural abaixo;
- fonte metodológica abaixo da nota.

Título macro:

`Figura 1 - Encadeamento simplificado da teoria da mudança`

Título scoped:

`Figura 1 - Encadeamento simplificado do fluxo selecionado`

Fonte:

`Fonte: elaboração própria com base nos dados da teoria e na estrutura metodológica do FGV EESP CLEAR.`

Fluxograma:

```text
INSUMOS -> ATIVIDADES -> PRODUTOS -> RESULTADOS
             RISCO          RISCO         HIPÓTESE
```

O fluxograma deve permanecer compreensível em escala de cinza e não reproduzir os cards do diagrama principal.

## Riscos e hipóteses

Apresentar como notas editoriais, sem aparência de card:

- filete fino à esquerda;
- label pequena;
- texto integral;
- sem fundo cromático dominante;
- sem ícone grande;
- sem indentação de primeira linha.

## Referências

No documento macro, incluir apenas referências metodológicas FGV EESP CLEAR já aprovadas no padrão v2.1. O modo scoped pode omitir a lista na interface para reduzir ruído.

## Perfil export

- Papel A4.
- Margens: 3 cm superior e esquerda; 2 cm inferior e direita.
- Fonte Arial 12 pt, como decisão institucional do produto.
- Entrelinhas 1,5.
- Texto justificado.
- Recuo de primeira linha de 1,25 cm.
- Legendas, fontes, paginação e notas em 10 pt.
- Referências com espaçamento simples.
- Fundo branco e texto preto.
- Paginação em algarismos arábicos no canto superior direito.
- Controles da aplicação não aparecem.

## Quebras de página

Evitar separar:

- legenda e figura;
- figura e fonte;
- label e conteúdo de risco;
- label e conteúdo de hipótese;
- heading e primeiro parágrafo.

Não proteger seções enormes quando isso gerar páginas vazias.

## Princípios Apple HIG adotados

- Hierarquia por tamanho, peso e cor.
- Poucos pesos tipográficos.
- Corpo em Regular.
- Títulos em Semibold.
- Evitar Light e Thin.
- Conteúdo legível em diferentes escalas.
- Controles separados visualmente do conteúdo.
- Efeitos subordinados à leitura.

## Proteções

Não alterar nesta rodada:

- rail;
- menu de exportação;
- largura do supporting pane;
- câmera;
- zoom;
- pan;
- cards;
- colunas;
- grid;
- edges;
- markers R/H;
- spotlight;
- seleção;
- motor narrativo;
- dados;
- fixtures;
- lógica de exportação.

## Fontes principais

- Apple. Human Interface Guidelines: Typography.
- Apple. Human Interface Guidelines: Materials.
- Apple. Human Interface Guidelines: Layout.
- Instituto Federal de Brasília. Manual de Normalização de Trabalhos Acadêmicos, atualizado segundo a NBR 14724:2024.
- FGV EESP CLEAR. Infográfico: Teoria da mudança.
- FGV EESP CLEAR. Guia CLEAR: monitoramento e avaliação de políticas públicas.
- FGV EESP CLEAR. Da teoria à mudança: adaptações do Primeira Infância Melhor.
