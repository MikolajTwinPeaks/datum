#!/usr/bin/env bash
# Build Datum and deploy the static site to the gh-pages branch (GitHub Pages).
# Requires: gh authenticated (repo scope). Run from the repo root: ./deploy.sh
set -euo pipefail
export PATH="/opt/homebrew/bin:$PATH"

cd "$(dirname "$0")"
REMOTE="https://github.com/MikolajTwinPeaks/datum.git"

echo "→ building"
npm run build

echo "→ publishing dist to gh-pages"
cd dist
touch .nojekyll
rm -rf .git
git init -q -b gh-pages
git add -A
git -c user.email="mikolaj.okula@gmail.com" -c user.name="Mikołaj Okuła" \
  commit -q -m "Deploy $(date -u +%Y-%m-%dT%H:%M:%SZ)"
git push -f "https://x-access-token:$(gh auth token)@github.com/MikolajTwinPeaks/datum.git" gh-pages

echo "→ done: https://mikolajtwinpeaks.github.io/datum/"
