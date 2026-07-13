# TDM Fix Example Preview Sass v12

Corrige de forma definitiva o arquivo:

`src/features/theory-of-change/components/resend-public/example-previews/example-previews.module.sass`

O patch sobrescreve o Sass com uma versao valida para sintaxe indented `.sass`, mantendo os nomes de classes usados pelos componentes.

## Aplicar

```bash
cd /Users/tialarocha/Documents/CHANGE-THEORY/theory-of-change-v1
unzip -o ~/Downloads/tdm-fix-example-preview-sass-v12.zip -d .
node scripts/fix-example-preview-sass-v12.cjs
rm -rf .next
npm run build
```
