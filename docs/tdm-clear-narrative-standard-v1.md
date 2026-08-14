# Padrão de narrativa TDM CLEAR - V1

**Escopo V1:** Insumos → Atividades → Produtos → Resultados, com riscos e hipóteses nas conexões. Impactos e demais camadas do método ficam fora desta versão.

## Decisão central

A narrativa não repete cards nem lista campos. Ela explica o encadeamento causal como documento profissional, usando somente os dados existentes no projeto.

- **Macro:** sem seleção, narra a teoria inteira.
- **Scoped:** com seleção, narra apenas o caminho relacionado.
- Sem IA, sem fatos inventados, sem impactos.
- Preserva título, descrição, detalhes, notas, conexões, riscos e hipóteses.

## Fundamentos adotados

A FGV CLEAR apresenta a TdM como um encadeamento causal estruturado. Insumos viabilizam atividades; atividades geram produtos; produtos conduzem a resultados. Riscos e hipóteses são elos invisíveis que qualificam ou ameaçam as passagens entre etapas.

A V1 adapta deliberadamente o método completo ao modelo atual da aplicação e termina em **Resultados**.

## Modos de saída

### Macro

1. Introdução geral com contagens reais.
2. Percurso de todas as raízes e caminhos válidos.
3. Ramificações e convergências explicitadas.
4. Riscos e hipóteses apresentados junto à conexão correspondente.
5. Componentes desconectados em uma seção curta “Outros caminhos da teoria”.

### Scoped

1. Situa o elemento selecionado.
2. Inclui origem e desdobramentos necessários para entender o caminho.
3. Conexão selecionada mostra origem, destino, riscos e hipóteses.
4. Marcador R/H abre no ponto narrativo correspondente.

## Motor determinístico

1. Normalizar texto: trim, pontuação, capitalização e remoção de duplicações exatas.
2. Construir grafo dirigido com nodes e edges reais.
3. Identificar raízes, terminais, ramificações, convergências e componentes desconectados.
4. Gerar `TheoryNarrativeDocumentViewModel` fora do JSX.
5. Integrar descrição, detalhes e notas em frases editoriais.
6. Inserir riscos e hipóteses após a transição correta.
7. Omitir campos vazios e nunca inventar dados.

## Templates por etapa

### Insumo
- Ligação: `O fluxo parte do insumo “{title}”.`
- Descrição: `Esse recurso é descrito como {description}.`
- Detalhes: `Em termos operacionais, {details}.`
- Notas: `Como observação complementar, {notes}.`

### Atividade
- Ligação: `Com esses recursos, a teoria prevê a atividade “{title}”.`
- Descrição: `A atividade consiste em {description}.`
- Detalhes: `Na execução, {details}.`
- Notas: `A nota associada registra {notes}.`

### Produto
- Ligação: `A realização dessa atividade entrega o produto “{title}”.`
- Descrição: `Essa entrega corresponde a {description}.`
- Detalhes: `O detalhamento indica {details}.`
- Notas: `Como registro adicional, {notes}.`

### Resultado
- Ligação: `A partir desse produto, a teoria espera alcançar o resultado “{title}”.`
- Descrição: `A mudança esperada é {description}.`
- Detalhes: `Em termos de efeito, {details}.`
- Notas: `A observação final destaca {notes}.`

## Riscos e hipóteses

Matriz exclusiva por transição — ver `docs/tdm-clear-interpreter-standard-v2.1.md`:

| Transição | Permitido |
|---|---|
| Insumos → Atividades | somente risco |
| Atividades → Produtos | somente risco |
| Produtos → Resultados | somente hipótese |

- Risco: `Nesta ligação, foi registrado o seguinte risco: {text}.`
- Hipótese: `Esta passagem depende da seguinte hipótese: {text}.`
- Não afirmar que hipótese causou risco nem que risco gerou uma etapa.
- Não narrar condição fora da transição autorizada; dados inválidos antigos são ignorados na apresentação.

## Ramificações e convergências

- Ramificação: `A partir de “{node}”, o fluxo se desdobra em {count} caminhos.`
- Convergência: `Os caminhos se encontram em “{node}”, que...`
- Componentes desconectados não recebem relação inventada.

## Regras editoriais

- Linguagem profissional, direta e explicativa.
- Uma ideia principal por parágrafo.
- Sem labels repetidos de Descrição/Detalhes/Notas.
- Sem repetição desnecessária do título.
- Sem impactos, indicadores, público-alvo ou evidências inventadas.
- Preferir “prevê”, “conduz a”, “contribui para” e “espera alcançar”.
- Preservar o conteúdo completo e remover apenas duplicações literais.

## ViewModel

```ts
type TheoryNarrativeDocumentViewModel = {
  mode: 'macro' | 'scoped';
  title: string;
  metadata: {
    stagesCount: number;
    connectionsCount: number;
  };
  introduction: string[];
  sections: Array<
    | NarrativeStageSection
    | NarrativeTransitionSection
    | NarrativeBranchSection
    | NarrativeRiskSection
    | NarrativeHypothesisSection
  >;
};
```

## Fontes principais

| Domínio | Prioridade | Uso |
|---|---|---|
| `fgvclear.org` | Primária | Método, cadeia causal, componentes, riscos/hipóteses e exemplos de encadeamento. |
| `gov.br/mec` | Oficial de contexto | Terminologia institucional e descrição oficial de programas. |
| `todospelaeducacao.org.br` | Aplicação analítica | Estrutura de análise executiva de desenho de política. |
| `revistaes.com.br` | Editorial secundária | Exemplo de narrativa de resumo executivo, sem autoridade metodológica. |

## Referências

1. https://fgvclear.org/infografico-teoria-da-mudanca/
2. https://fgvclear.org/website/wp-content/uploads/guia-clear-monitoramento-e-avaliacao.pdf
3. https://fgvclear.org/website/wp-content/uploads/pim-2024-dateoriaamudanca.pdf
4. https://www.gov.br/mec/pt-br/pe-de-meia/pe-de-meia
5. https://todospelaeducacao.org.br/wordpress/wp-content/uploads/2024/04/analise-pe-de-meia-todos-pela-educacao-abr-2024.pdf
6. https://revistaes.com.br/resumo-executivo/analise-do-impacto-do-programa-pe-de-meia-na-retencao-escolar-em-sao-paulo

## Governança

Este documento é o baseline da V1. Impactos, indicadores, públicos, objetivos, evidências ou avaliação formal só entram após nova decisão de produto e revisão metodológica.
