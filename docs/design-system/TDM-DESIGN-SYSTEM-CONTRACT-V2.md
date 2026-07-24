# TDM Design System Contract V2

Status: canônico e bloqueante para todas as rotas fora de `/canvas`.

## 1. Regra-mãe

A aplicação tem uma única gramática visual e uma única implementação canônica por função.

Ordem de precedência:

1. comportamento funcional homologado no runtime;
2. catálogo visual `previews/tdm-ds-foundation-v2.html`;
3. componente canônico registrado neste contrato;
4. tokens canônicos;
5. documentação oficial de plataforma;
6. referências externas de linguagem visual.

Referências não viram nomes de produto. `Resend`, `Apple`, `Material` e `Figma` não podem aparecer em novos tokens, componentes, pastas ou variants.

## 2. Escopo

Inclui as rotas públicas, o Guia, Referências e os shells das experiências interativas.

Exclui:

- `/canvas` e derivados;
- timeline do Guia;
- lógica e geometria interna das prévias animadas;
- React Flow interno das experiências interativas;
- conexões, nodes, seleção, zoom, exportação e motion homologado desses containers.

Consulte `TDM-NON-CANVAS-SCOPE-V1.md`.

## 3. Design

A direção combina:

- Apple HIG: clareza, hierarquia, controles familiares, alvos de toque e consistência;
- Material: papéis semânticos, estados previsíveis e tokens em referência, sistema e componente;
- Figma: um componente principal, propriedades independentes e variants previsíveis;
- Resend-first: precisão, superfícies silenciosas, coerência entre marca, produto e código.

O código é a fonte de verdade executável. O preview é a fonte de verdade visual.

## 4. Uma família por função

| Função | Canônico |
|---|---|
| Botão | `TdmButton` |
| Icon button | `TdmIconButton` |
| Menu/dropdown | `TdmMenu` |
| Tooltip | `TdmTooltip` |
| Superfície | `TdmSurface` |
| Campo | `TdmField` |
| Status de rota | `TdmStatusScreen` |
| Label contextual | `TdmContextLabel` |
| Kicker | `TdmKicker` |
| Card público | `TdmPublicFeatureCard` |

Um componente semelhante não nasce como novo arquivo. Primeiro amplia-se o canônico com uma propriedade independente e semanticamente nomeada.

## 5. Tokens

A hierarquia é obrigatória:

`reference -> system -> component -> consumer`

Consumidores não definem valores concretos de cor, espaço, radius, shadow, font-size ou motion.

As cores das etapas são fixas:

- Insumos: `#8B7CFF`;
- Atividades: `#49B3FF`;
- Produtos: `#F2A65A`;
- Resultados: `#37C893`.

Variações soft, border e glow derivam dos quatro accents. Não existe uma segunda paleta de etapa.

## 6. Código

Obrigatório:

- TypeScript estrito;
- Sass Module para estilos de componentes;
- componentes de apresentação recebem dados e callbacks;
- lógica de interação reutilizável vive em hook ou controller da mesma família;
- `app/` concentra roteamento, layouts e estados de rota;
- Server Component por padrão;
- `'use client'` somente na menor ilha que precisa de state, efeitos, eventos ou API do navegador;
- imports públicos de feature passam por `index.ts`;
- `src/shared` nunca importa `src/features`;
- nomes booleanos e condicionais são semânticos.

Proibido em código novo:

- `!important`;
- cor literal fora dos arquivos de tokens;
- ternário aninhado no JSX;
- regra visual em `style={{...}}`;
- `transition: all`;
- componente equivalente a primitive existente;
- lógica visual baseada em `pathname`;
- arquivo TSX novo acima de 300 linhas;
- Sass Module novo acima de 500 linhas;
- crescimento de God Component legado;
- componente de rota marcado como Client sem justificativa arquitetural.

## 7. Comportamento

Refatoração visual não altera:

- callback;
- href;
- ordem funcional;
- disabled/loading;
- dados;
- store;
- domínio;
- exportação;
- seleção;
- React Flow;
- motion homologado.

## 8. Estados e acessibilidade

- alvo interativo mínimo de `2.75rem`;
- foco visível sem layout shift;
- icon button sempre com nome acessível;
- menu com Escape, click outside, setas, Home, End e restauração de foco;
- tooltip curto e não persistente;
- reduced motion respeitado;
- contraste e zoom de 200% verificados;
- `loading.tsx`, `error.tsx`, `global-error.tsx` e `not-found.tsx` usam o mesmo status system.

## 9. Performance

- libs pesadas entram apenas na rota ou ação que as usa;
- exportadores PDF, DOCX e imagem devem ser carregados sob demanda;
- componentes Client não devem puxar uma árvore editorial inteira para o bundle;
- boundaries de Suspense precisam representar unidades percebidas pelo usuário;
- não adicionar memoização ou effects como decoração arquitetural;
- calcular dados derivados durante render quando possível;
- imports dinâmicos não podem alterar comportamento homologado.

## 10. Migração

A dívida existente é registrada em baseline shrink-only:

- pode diminuir;
- não pode aumentar;
- arquivo novo é validado no modo estrito;
- componente legado só é removido após zero consumidores e QA funcional.

O gate é executado pelo terminal, VS Code, Cursor e GitHub Actions. A IDE não define o contrato.
