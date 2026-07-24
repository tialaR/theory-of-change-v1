# TDM Non-Canvas Scope V1

## Pode mudar

- tokens;
- primitives e adapters;
- header público e headers dos workspaces;
- cards à direita da timeline do Guia;
- botões, icon buttons, menus e tooltips;
- shells externos, backgrounds, gutters e spacing;
- logos, heroes, footers e enquadramento de rota;
- loading, error, global error e 404;
- Server/Client boundaries;
- imports, divisão de arquivos e responsabilidades;
- nomes internos contendo referências externas;
- componentes duplicados após migração dos consumidores.

## Não pode mudar nesta fase

- qualquer arquivo da rota `/canvas`;
- timeline do Guia;
- scheduler da narrativa guiada;
- interior das prévias animadas de Fluxo e Resultado;
- geometria e motion homologados das conexões;
- React Flow interno das rotas interativas;
- nodes, edges, seleção, zoom, viewport e exportação;
- composição interna que já exigiu validação frame a frame.

## Regra para áreas sensíveis

O shell pode receber background, header e controles canônicos. O motor visual interno é tratado como uma caixa preta.

Alteração intencional em arquivo protegido exige:

```bash
TDM_ALLOW_PROTECTED=1 npm run check:tdm:v2:protected
```

A variável não substitui QA. Ela apenas registra que o bloqueio foi conscientemente ultrapassado.
