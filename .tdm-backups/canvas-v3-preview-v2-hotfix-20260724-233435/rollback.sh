#!/usr/bin/env bash
set -euo pipefail
PROJECT_ROOT="/Users/tialarocha/Documents/CHANGE-THEORY/theory-of-change-v1"
BACKUP_ROOT="/Users/tialarocha/Documents/CHANGE-THEORY/theory-of-change-v1/.tdm-backups/canvas-v3-preview-v2-hotfix-20260724-233435"
rm -rf "$PROJECT_ROOT/src/app/canvas-v3"
rm -rf "$PROJECT_ROOT/src/app/canvas-v2"
rm -rf "$PROJECT_ROOT/src/features/theory-of-change/canvas-v2"
if [ -d "$BACKUP_ROOT/src/app/canvas-v3" ]; then
  cp -R "$BACKUP_ROOT/src/app/canvas-v3" "$PROJECT_ROOT/src/app/canvas-v3"
fi
if [ -d "$BACKUP_ROOT/src/app/canvas-v2" ]; then
  cp -R "$BACKUP_ROOT/src/app/canvas-v2" "$PROJECT_ROOT/src/app/canvas-v2"
fi
if [ -d "$BACKUP_ROOT/src/features/theory-of-change/canvas-v2" ]; then
  mkdir -p "$PROJECT_ROOT/src/features/theory-of-change"
  cp -R "$BACKUP_ROOT/src/features/theory-of-change/canvas-v2" "$PROJECT_ROOT/src/features/theory-of-change/canvas-v2"
fi
if [ -f "$BACKUP_ROOT/cta-files.txt" ]; then
  while IFS= read -r relative; do
    [ -n "$relative" ] || continue
    if [ -f "$BACKUP_ROOT/$relative" ]; then
      mkdir -p "$PROJECT_ROOT/$(dirname "$relative")"
      cp "$BACKUP_ROOT/$relative" "$PROJECT_ROOT/$relative"
    fi
  done < "$BACKUP_ROOT/cta-files.txt"
fi
rm -rf "$PROJECT_ROOT/.next"
echo "Rollback concluido."
