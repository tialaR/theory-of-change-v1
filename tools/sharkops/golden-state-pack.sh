#!/usr/bin/env bash
set -euo pipefail
ROOT="$(pwd)"
PROJECT_NAME="$(basename "$ROOT")"
STAMP="${TDM_GOLDEN_STAMP:-$(date +"%Y%m%d-%H%M%S")}"
OUTPUT_DIR="${1:-$HOME/Downloads}"
ZIP_PATH="$OUTPUT_DIR/${PROJECT_NAME}-GOLDEN-STATE-$STAMP.zip"
SHA_PATH="$ZIP_PATH.sha256.txt"
MANIFEST_PATH="$ZIP_PATH.manifest.json"

mkdir -p "$OUTPUT_DIR"
rm -f "$ZIP_PATH" "$SHA_PATH" "$MANIFEST_PATH"

echo "[GOLDEN STATE] proving terminal architecture closeout"
npm run check:tdm:final-architecture:wave11

echo "[GOLDEN STATE] running mandatory Final Regression Armor"
npm run check:tdm:final-regression:armor

echo "[GOLDEN STATE] proving Golden State contract"
npm run check:tdm:golden-state

echo "[GOLDEN STATE] proving terminal SharkOps governance"
npm run shark:verify

GIT_HEAD="unknown"
GIT_DIRTY="unknown"
if command -v git >/dev/null 2>&1 && git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  GIT_HEAD="$(git rev-parse HEAD 2>/dev/null || printf unknown)"
  if [ -n "$(git status --porcelain 2>/dev/null)" ]; then GIT_DIRTY="true"; else GIT_DIRTY="false"; fi
fi

cd "$(dirname "$ROOT")"
zip -qr "$ZIP_PATH" "$PROJECT_NAME" \
  -x "$PROJECT_NAME/node_modules/*" \
     "$PROJECT_NAME/.next/*" \
     "$PROJECT_NAME/playwright-report/*" \
     "$PROJECT_NAME/test-results/*" \
     "$PROJECT_NAME/.git/*" \
     "$PROJECT_NAME/.patch-backups/*" \
     "$PROJECT_NAME/.shark/*" \
     "$PROJECT_NAME/.tdm-patches/*" \
     "$PROJECT_NAME/.tdm-backups/*" \
     "$PROJECT_NAME/.tdm-integration/*/references/*" \
     "$PROJECT_NAME/docs/references/*.mov" \
     "$PROJECT_NAME/docs/references/**/*.mov" \
     "$PROJECT_NAME/docs/references/*.mp4" \
     "$PROJECT_NAME/docs/references/**/*.mp4" \
     "$PROJECT_NAME/docs/references/*.webm" \
     "$PROJECT_NAME/docs/references/**/*.webm" \
     "$PROJECT_NAME/docs/references/*.png" \
     "$PROJECT_NAME/docs/references/**/*.png" \
     "$PROJECT_NAME/docs/references/*.jpg" \
     "$PROJECT_NAME/docs/references/**/*.jpg" \
     "$PROJECT_NAME/docs/references/*.jpeg" \
     "$PROJECT_NAME/docs/references/**/*.jpeg" \
     "$PROJECT_NAME/docs/design-system/*.png" \
     "$PROJECT_NAME/docs/design-system/**/*.png" \
     "*.DS_Store"

ZIP_SHA="$(shasum -a 256 "$ZIP_PATH" | awk '{print $1}')"
printf '%s  %s\n' "$ZIP_SHA" "$ZIP_PATH" | tee "$SHA_PATH"
GENERATED_AT="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
node - "$MANIFEST_PATH" "$PROJECT_NAME" "$ZIP_PATH" "$ZIP_SHA" "$GENERATED_AT" "$GIT_HEAD" "$GIT_DIRTY" <<'NODE'
const fs=require('fs');
const [out,project,zip,sha,generatedAt,gitHead,gitDirty]=process.argv.slice(2);
const data={
  version:1,
  snapshotId:'GOLDEN-STATE-v1',
  project,
  generatedAt,
  source:'SO-014 Wave 11 Final Architecture Closeout',
  regressionArmor:'PASS before packaging',
  terminalSharkOps:'PASS before packaging',
  archive:zip,
  sha256:sha,
  git:{head:gitHead,dirty:gitDirty==='true'?true:gitDirty==='false'?false:'unknown'}
};
fs.writeFileSync(out,JSON.stringify(data,null,2)+'\n');
NODE

echo
echo "PASS: TDM Golden State Snapshot generated"
echo "ZIP: $ZIP_PATH"
echo "SHA: $SHA_PATH"
echo "MANIFEST: $MANIFEST_PATH"
