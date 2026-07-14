# Header GlassSurface v9

## Investigacao curta

O efeito nao aparecia corretamente porque as tentativas anteriores misturavam tres problemas:

1. Altura do header ainda estava no padrao antigo, entao o GlassSurface nao usava a area de 90px do exemplo.
2. As props do anexo nao estavam travadas no uso final do header, especialmente height, xChannel e yChannel.
3. Os overrides para remover borda tambem apagavam parte da leitura optica do componente, deixando o resultado parecido com uma faixa escura comum.

## Decisao

- Manter GlassSurface como shared UI.
- Usar module.sass.
- Usar exatamente as props do anexo no header.
- Header transparente no topo.
- GlassSurface visivel somente quando data-scrolled=true.
- Sem tocar em /canvas.
