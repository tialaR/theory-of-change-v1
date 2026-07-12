# Patch: resultado interativo sem scroll horizontal + glass interno

Escopo alterado:

- `src/features/theory-of-change/components/result-view/experience/result-experience.module.sass`

O patch adiciona overrides escopados em `.interactiveExperience` para:

- impedir scroll horizontal no container da visualizacao interativa;
- usar `box-sizing: border-box` nos wrappers do diagrama;
- fazer as 4 colunas caberem no container usando `rem` e `clamp`;
- manter scroll somente vertical quando houver muitos itens;
- aplicar grid/background diretamente no viewport para nao aparecer area vazia ao rolar;
- reforcar o efeito interno liquid glass em colunas e cards via variaveis do `GlassSurface` existente;
- manter cor de cada etapa apenas nos acentos, bordas, glows, bolinhas, contadores e pills;
- preservar logica, dados, conexoes, toolbar, tradutor, rotas e `/canvas`.

Comandos:

```bash
cd /Users/tialarocha/Documents/CHANGE-THEORY/theory-of-change-v1
unzip -o ~/Downloads/tdm-interactive-glass-fit-v7.zip -d .
rm -rf .next
npm run build
npm run dev
```

Validar:

- http://localhost:3000/exemplos/resultado/interativo

Observacao de validacao local aqui: `npx tsc --noEmit --pretty false` passou. `next build` compilou e terminou TypeScript, mas travou na etapa `Collecting page data` neste sandbox depois de alguns minutos, entao nao considerei como build completo validado aqui.
