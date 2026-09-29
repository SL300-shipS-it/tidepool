#!/bin/bash
# Shrink photos for the game: max 1200px on the long side, JPEG quality 75, in place.
# Usage: tools/optimize_photos.sh assets/photos/*.jpg   (converts HEIC/PNG to .jpg alongside)
set -e
for f in "$@"; do
  case "$f" in
    *.jpg|*.jpeg|*.JPG|*.JPEG) out="$f" ;;
    *) out="${f%.*}.jpg" ;;
  esac
  sips -s format jpeg -s formatOptions 75 -Z 1200 "$f" --out "$out" >/dev/null
  echo "$(du -h "$out" | cut -f1)  $out"
done
