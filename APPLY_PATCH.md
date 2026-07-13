# TDM interactive visual fit v8

Escopo: somente `src/features/theory-of-change/components/result-view/experience/result-experience.module.sass`.

Objetivo:
- remover overflow horizontal da rota `/exemplos/resultado/interativo`;
- reduzir a moldura externa para linha fina;
- fazer colunas caberem no container usando `rem`, `clamp`, `box-sizing` e grid fluido;
- suavizar o visual de pilula/metalico;
- reforcar o efeito interno liquid glass nos cards e colunas sem alterar logica.

Aplicar:

```bash
cd /Users/tialarocha/Documents/CHANGE-THEORY/theory-of-change-v1
unzip -o ~/Downloads/tdm-interactive-visual-fit-v8.zip -d .
rm -rf .next
npm run build
npm run dev
```

Validar:

```bash
http://localhost:3000/exemplos/resultado/interativo
```
