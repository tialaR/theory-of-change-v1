# TDM Examples Secondary Intro V1

Status: CANÔNICO

## Consumidor

Rota `/exemplos`, seção com:

- label `PRÉVIA DAS EXPERIÊNCIAS`;
- título `Escolha como visualizar a teoria.`;
- descrição `Dois caminhos visuais, o mesmo sistema: primeiro entenda o fluxo, depois leia o resultado conectado.`

## Referência interna

Reutilizar a mesma geometria editorial do bloco ativo em `/exemplos/visao-do-fluxo`:

- label `Visão do fluxo`;
- título `O caminho antes da leitura final.`;
- descrição correspondente.

## Regras

- label, título e descrição alinhados à esquerda;
- as três peças compartilham a mesma linha inicial;
- `text-align: left`;
- remover centralização por `margin-inline: auto`, `justify-items: center` ou equivalente somente deste intro;
- usar a mesma largura máxima, indentação e ritmo vertical do bloco de referência;
- preservar textos, tipografia, ícone contextual, cards, links e ordem;
- em mobile, ocupar a largura disponível e continuar alinhado à esquerda;
- não duplicar valores: reutilizar classe, mixin ou extrair um primitive compartilhado como `PublicSectionIntro` quando isso reduzir duplicação real.

## Implementação ativa (2026-07-22)

- Consumidor: `ExamplePreviewsSection` → `PublicSection` compact (mesmo primitive de `/exemplos/visao-do-fluxo`).
- Classes canônicas: `.sectionHeader`, `.sectionDescription` em `tdm-public-design-system.module.sass`.
- Removido o header local centrado (`.sectionHeader` com `text-align: center` / `margin-inline: auto`) de `example-previews.module.sass`.
