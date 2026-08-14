# Padrão do Intérprete da Teoria — v2.1

## Status

Esta versão **substitui a v2.0** e corrige a matriz de riscos e hipóteses da V1.

## Finalidade

Este documento define o padrão editorial, visual e técnico do componente **Intérprete da teoria**.

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
- Metadados: etapas, conexões, riscos e hipóteses derivados do escopo atual.

## Modos

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
- não usar IA, aleatoriedade, impactos ou conteúdo inventado.

## Perfil documental inspirado na ABNT

### Interface

- Inter;
- fundo cinza muito escuro, sem preto puro;
- texto em cinza-claro;
- largura de leitura até 68ch;
- leitura contínua, sem paginação simulada.

### Exportação futura

- A4;
- margens: 3 cm superior/esquerda e 2 cm inferior/direita;
- Arial 12 pt;
- entrelinhas 1,5;
- texto justificado;
- recuo inicial de 1,25 cm;
- legendas, fontes e notas em 10 pt e espaço simples;
- paginação no canto superior direito.

## Fluxograma simplificado

Estrutura obrigatória:

```text
INSUMOS → ATIVIDADES → PRODUTOS → RESULTADOS
            RISCO         RISCO        HIPÓTESE
```

Ou, em disposição vertical:

```text
INSUMOS
  ↓ RISCO
ATIVIDADES
  ↓ RISCO
PRODUTOS
  ↓ HIPÓTESE
RESULTADOS
```

Regras:

- quatro blocos principais;
- retângulos simples e setas unidirecionais;
- nunca renderizar `RISCO / HIPÓTESE`;
- não inserir descrições, detalhes ou notas dentro da figura;
- preto, branco e cinza por padrão;
- acentos de etapa mínimos somente na interface;
- nunca depender apenas de cor;
- preferir SVG semântico;
- adicionar texto alternativo.

Identificação:

`Figura 1 – Encadeamento simplificado da teoria da mudança`

Fonte:

`Fonte: elaboração própria com base nos dados da teoria e na estrutura metodológica do FGV EESP CLEAR.`

## Estrutura exportável

1. título da teoria;
2. metadados;
3. introdução;
4. fluxograma simplificado;
5. narrativa integral;
6. riscos e hipóteses somente nas conexões permitidas;
7. referências FGV EESP CLEAR.

## Referências metodológicas principais

- FGV EESP CLEAR. *Infográfico: Teoria da mudança*. 2021.
- LIMA, Lycia; SOUZA, André Portela. *Guia CLEAR: monitoramento e avaliação de políticas públicas: do diagnóstico à decisão*. 2025.
- FGV EESP CLEAR. *Da teoria à mudança: adaptações do Primeira Infância Melhor a partir de ações de monitoramento e avaliação*. 2024.

## Base normativa interna

- ABNT NBR 14724:2024;
- ABNT NBR 10520:2023;
- ABNT NBR 6023:2018.
