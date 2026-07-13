# TDM Home Guided Preview Refinement v1

Patch cirúrgico para refinar somente a prévia guiada da rota `/`.

## O que o script faz

- Localiza o componente real da prévia guiada da Home por marcadores de texto.
- Substitui esse componente por uma versão Motion com ciclo lento, entre ~52s e ~55s.
- Cria/atualiza o Sass Module local do componente.
- Mantém a alteração limitada ao componente encontrado e seu Sass.
- Cria backup automático em `tdm-backups/home-preview-refinement-v1-*`.

## Antes de aplicar, commitar a fase atual

```bash
cd /Users/tialarocha/Documents/CHANGE-THEORY/theory-of-change-v1

rm -rf .next
npm run build

git status --short
git add src/app src/features src/shared
git diff --cached --stat
git commit -m "style: refine public experience shell"
```

## Aplicar o patch

Depois de baixar o ZIP em `~/Downloads`:

```bash
cd /Users/tialarocha/Documents/CHANGE-THEORY/theory-of-change-v1

unzip -o ~/Downloads/tdm-home-preview-refinement-v1.zip -d .
node tdm-home-preview-refinement-v1/scripts/apply-home-guided-preview-refinement-v1.cjs

rm -rf .next
npm run build
npx next dev --webpack
```

## Commit do patch da Home

```bash
cd /Users/tialarocha/Documents/CHANGE-THEORY/theory-of-change-v1

git status --short
git add src/app src/features src/shared
git diff --cached --stat
git commit -m "refactor: slow down home guided preview animation"
```

## PR para dev

```bash
git branch --show-current
BRANCH=$(git branch --show-current)
git push -u origin "$BRANCH"

gh pr create \
  --base dev \
  --head "$BRANCH" \
  --title "Refine public guided preview experience" \
  --body "## Summary
- Refines the Home guided preview animation with a slower Motion timeline.
- Improves stage/card scale inside the preview container.
- Adds step-by-step connection animation and animated text scenes.

## Validation
- npm run build

## Scope
- Home guided preview only.
- Canvas untouched."
```

Se não tiver GitHub CLI:

```bash
git push -u origin $(git branch --show-current)
```

Depois abre o link do GitHub para criar o PR para `dev`.

## Depois do merge na dev

```bash
cd /Users/tialarocha/Documents/CHANGE-THEORY/theory-of-change-v1

git checkout dev
git pull --ff-only origin dev
git checkout -b refine-canvas-experience
npx next dev --webpack
```

## Observações

Se o script abortar, ele não alterou nada. Nesse caso, rode:

```bash
rg -n "PRÉVIA GUIADA|Veja a teoria ganhar forma|Comece pelas etapas|O fluxo agora vira leitura|Do rascunho à leitura final|HomeOnboardingPreview|onboarding" src/app src/features
```

E envie o resultado para ajustar o local exato do componente.
