#!/usr/bin/env bash
# Resizes team photos from 2048x2048 to 400x400 (2.5x the 160px display size).
# Requires ImageMagick (magick command).
set -euo pipefail

TEAM_DIR="$(dirname "$0")/public/images/team"

for f in "$TEAM_DIR"/*.png; do
  echo "Compressing $(basename "$f")..."
  magick "$f" -resize 400x400^ -gravity center -extent 400x400 -quality 85 "$f"
done

echo "Done. Sizes after compression:"
du -sh "$TEAM_DIR"/*.png
