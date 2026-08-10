#!/usr/bin/env bash
set -euo pipefail
ROOT="$(pwd)"
PROJECT_NAME="$(basename "$ROOT")"
STAMP="${TDM_HANDOFF_STAMP:-$(date +"%Y%m%d-%H%M%S")}" 
OUTPUT_DIR="${1:-$HOME/Downloads}"
ZIP_PATH="$OUTPUT_DIR/${PROJECT_NAME}-SHARKOPS-HANDOFF-$STAMP.zip"
SHA_PATH="$ZIP_PATH.sha256.txt"
mkdir -p "$OUTPUT_DIR"
rm -f "$ZIP_PATH" "$SHA_PATH"
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
shasum -a 256 "$ZIP_PATH" | tee "$SHA_PATH"
echo
echo "PASS: SharkOps handoff package generated"
echo "ZIP: $ZIP_PATH"
echo "SHA: $SHA_PATH"
