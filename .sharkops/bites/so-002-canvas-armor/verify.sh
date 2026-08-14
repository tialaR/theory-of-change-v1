#!/bin/sh
set -eu
npm run shark:verify
npm run shark:so-002:verify
printf '%s\n' 'PASS: SO-002 static and continuity armor verified.'
