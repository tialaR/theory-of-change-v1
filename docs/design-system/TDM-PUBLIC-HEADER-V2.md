# TDM Public Header v2

## Contrato visual

### Topo da página

A carcaça não deve ser percebida:

```sass
background: transparent
border-color: transparent
box-shadow: none
backdrop-filter: none
-webkit-backdrop-filter: none
```

Logo, links e CTA permanecem visíveis e na mesma posição.

### Após scroll

```sass
background: rgba(7, 7, 8, 0.88)
backdrop-filter: blur(1rem)
-webkit-backdrop-filter: blur(1rem)
border: 0.0625rem solid rgba(255, 255, 255, 0.11)
border-radius: 0.875rem
box-shadow: none
```

O estado não deve usar `opacity` no wrapper. A transparência pertence somente ao background.

## Geometria

A geometria deve permanecer idêntica nos dois estados:

- mesma largura;
- mesma altura;
- mesmo padding;
- mesma posição dos links;
- mesma posição da logo;
- mesma posição do CTA.

Somente estas propriedades podem transicionar:

- background-color;
- border-color;
- backdrop-filter;
- border-radius.

Duração: `0.16s`.

Easing: `cubic-bezier(.2, .7, .2, 1)`.

## Estrutura DOM

Esperado:

```text
PublicLayout
  HeaderSentinel
  PublicHeader
    PublicHeaderShell
      Brand
      Navigation
      HeaderAction
  PageContent
```

Regras:

- exatamente um `<header>`;
- sentinel fora do elemento sticky;
- um único `IntersectionObserver`;
- nenhum listener de scroll por frame;
- nenhum segundo shell legado;
- nenhuma página pública renderiza seu próprio header.

## Stacking

- header root acima do hero e do conteúdo;
- hero não pode ter z-index superior ao header;
- ancestrais do header não podem usar `opacity`, `filter` ou `transform` que criem stacking context concorrente;
- o header não deve usar `mix-blend-mode`.

## Diagnóstico do resultado atual

A captura homologada como defeituosa mostra quatro sinais:

1. A carcaça já está visível no topo, contrariando o estado transparente.
2. O background está transparente demais, deixando a escultura do hero legível através do shell.
3. A escultura do hero cruza visualmente o header, indicando z-index ou stacking context incorreto.
4. A borda e o shell existem, mas não usam a densidade visual do preview com `rgba(7, 7, 8, 0.88)`.

Causas prováveis a confirmar no DevTools:

- classe de estado invertida ou `isScrolled` inicializado incorretamente;
- CSS var do background sobrescrita por seletor legado;
- `opacity` aplicada ao header ou ancestral;
- hero com z-index superior;
- dois wrappers de header ativos;
- sentinel dentro do sticky header;
- regra antiga em `lusion-resend-ds.module.sass` competindo com o novo módulo.

## Checklist de correção

1. Contar `<header>` no DOM. Resultado esperado: `1`.
2. Listar imports de headers e remover o legado do JSX.
3. Confirmar sentinel antes do header.
4. Confirmar `isScrolled=false` no topo.
5. Remover `opacity`, `mix-blend-mode`, gradients e shadows do shell.
6. Aplicar o background aprovado somente no estado scrolled.
7. Definir z-index canônico no root do header.
8. Reduzir z-index do hero para abaixo do header.
9. Manter padding idêntico nos dois estados.
10. Validar topo, scroll, retorno ao topo, mobile e reduced motion.
