#!/usr/bin/env bash
set -euo pipefail
npm run check:tdm:god-slayer:wave01
npm run check:tdm:canvas-continuity
npm run check:tdm:canvas-armor
npm run shark:verify
