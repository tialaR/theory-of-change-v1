#!/usr/bin/env bash
set -euo pipefail
npm run check:tdm:visual-foundation:wave01
npm run check:tdm:canvas-armor
npm run check:tdm:canvas-continuity
npm run shark:verify
