#!/bin/sh
set -eu
npm run check:tdm:canvas-armor
printf '%s\n' 'PASS: SO-002 Canvas Armor is active.'
