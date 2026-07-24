# TDM Component Contract V2

## Anatomia

Cada componente possui:

```text
component-name/
├── component-name.tsx
├── component-name.module.sass
├── component-name.types.ts      opcional
├── use-component-name.ts        somente quando há lógica reutilizável
├── component-name.utils.ts      somente para funções puras
├── component-name.test.tsx      quando crítico
└── index.ts
```

## Responsabilidades

- visual: layout e renderização;
- controller/hook: estado, teclado, browser APIs e efeitos;
- utils: transformação pura;
- feature: composição e regra contextual;
- shared: primitive sem conhecimento de domínio.

Não criar arquivo auxiliar por ritual. Extrair quando reduz responsabilidade ou permite teste/reuso real.

## Props

Variantes independentes, seguindo a lógica de component properties:

```tsx
<TdmButton variant="primary" size="md" tone="neutral" />
```

Evitar props híbridas como `style="primary-large-danger"`.

## JSX

- sem ternário aninhado;
- derive estados antes do return;
- extraia subcomponentes pequenos quando uma ramificação representar uma unidade visual;
- nomes como `isMenuOpen`, `hasLeadingIcon`, `isExportDisabled`;
- não detectar ícone por regex do texto da label;
- conteúdo e acessibilidade explícitos.

## Duplicação

O detector agrupa candidatos por família. A existência de dois arquivos com nomes diferentes não prova duplicação, mas exige decisão:

1. mesmo papel e comportamento: migrar para o canônico;
2. papel diferente: documentar a diferença no catálogo;
3. especialização de feature: compor o primitive, não copiá-lo.

## Menu canônico

`TdmMenu`:

- material do header público;
- borda em quatro lados;
- hover sem background;
- ícone à esquerda em todos os itens do grupo;
- teclado completo;
- lógica da ação fornecida pelo consumidor;
- não conhece PDF, DOCX, PNG ou SVG.
