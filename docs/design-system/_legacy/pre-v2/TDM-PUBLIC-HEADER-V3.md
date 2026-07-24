# TMD Public Header v3

## Decisão homologada

O comportamento atual do header é preservado:

- usuário no topo, sem scroll: header não aparece;
- usuário iniciou scroll: header aparece;
- usuário retornou ao topo: header volta ao estado oculto atual.

Esta rodada não recria o comportamento. Ela troca somente a superfície visual do estado já visível.

## Consumidor ativo conhecido

Mapeamento histórico a confirmar no repositório atual:

- `src/shared/ui/lusion-resend-ds/lusion-resend-ds.tsx`
- `src/shared/ui/lusion-resend-ds/lusion-resend-ds.module.sass`

O agente deve confirmar o consumidor ativo antes de editar.

## Superfície do estado visível após scroll

Usar exatamente a roupa do último preview homologado:

```sass
background: rgba(7, 8, 9, 0.76)
border-top: 0
border-right: 0
border-left: 0
border-bottom: 0.0625rem solid rgba(255, 255, 255, 0.05)
box-shadow: none
backdrop-filter: blur(1.25rem) saturate(120%)
-webkit-backdrop-filter: blur(1.25rem) saturate(120%)
```

Não adicionar gradiente, borda externa completa, glow, sombra, ruído, radius novo ou opacidade no wrapper inteiro.

## Geometria congelada

Preservar sem nenhuma alteração:

- largura;
- altura;
- min-height;
- padding;
- margin;
- gap;
- alinhamento;
- posição da logo;
- tamanho da logo;
- posição e tamanho dos links;
- posição e tamanho do CTA;
- breakpoints;
- safe areas;
- active states;
- foco;
- hit areas;
- z-index atual, salvo bug comprovado independente desta rodada.

## DOM e comportamento congelados

- não criar novo header;
- não criar novo sentinel;
- não criar novo `IntersectionObserver`;
- não criar listener de scroll;
- não mudar threshold ou rootMargin;
- não alterar estado inicial;
- não trocar nomes, links, hrefs ou componentes internos;
- não mover elementos entre wrappers;
- não aplicar `display: none` se o comportamento atual usa outra estratégia;
- não alterar a animação de entrada e saída existente.

A implementação ideal desta rodada é uma alteração restrita ao Sass Module do header. TSX só pode ser alterado se o mapeamento provar que a classe visual do estado scrolled não está exposta, e mesmo assim sem alterar a lógica.

## Aceite

1. No topo, o header continua ausente.
2. Após scroll, surge no mesmo momento e posição atuais.
3. A superfície visível usa o background e a border-bottom homologados.
4. Logo, navegação e CTA não se movem um pixel entre antes e depois.
5. Ao retornar ao topo, o estado oculto atual é restaurado.
6. Desktop e mobile preservam a geometria anterior.
