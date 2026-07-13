# tdm-fix-duplicate-example-preview-import-v13

Patch cirurgico para corrigir o build error:

`the name ExamplePreviewsSection is defined multiple times`

Ele remove imports duplicados de `ExamplePreviewsSection` em:

`src/features/theory-of-change/components/resend-public/public-experience.tsx`

Nao toca em `/canvas`, nao muda layout e nao altera logica.

## Aplicar

```bash
cd /Users/tialarocha/Documents/CHANGE-THEORY/theory-of-change-v1
unzip -o ~/Downloads/tdm-fix-duplicate-example-preview-import-v13.zip -d .
node scripts/fix-duplicate-example-preview-import-v13.cjs
rm -rf .next
npm run build
npm run dev
```
