#!/usr/bin/env bash
# Builds final CrazyGames preview MP4s:
#  - trims the loading portion from the raw Playwright webm
#  - prepends 1 frame of the matching static cover
#  - H264 yuv420p, no audio, +faststart, 15-20s total
set -euo pipefail
cd "$(dirname "$0")/.."

build() {
  local raw=$1 cover=$2 out=$3 w=$4 h=$5 trim=$6 dur=$7
  ffmpeg -y -v error \
    -loop 1 -framerate 30 -t 0.034 -i "$cover" \
    -ss "$trim" -t "$dur" -i "$raw" \
    -filter_complex "[0:v]scale=${w}:${h},setsar=1,fps=30[c];[1:v]scale=${w}:${h},setsar=1,fps=30[g];[c][g]concat=n=2:v=1:a=0[v]" \
    -map "[v]" -an -c:v libx264 -preset medium -crf 20 -pix_fmt yuv420p \
    -movflags +faststart "$out"
  echo "built $out"
}

# raw is 19.3s with ~2.3s of loading at the head; keep 16.5s of gameplay.
build marketing/raw/gameplay-landscape.webm marketing/cover-16x9.png marketing/video-landscape.mp4 1920 1080 2.5 16.5
build marketing/raw/gameplay-portrait.webm  marketing/cover-2x3.png  marketing/video-portrait.mp4  800 1200 2.5 16.5

for f in marketing/video-landscape.mp4 marketing/video-portrait.mp4; do
  ffprobe -v error -select_streams v:0 \
    -show_entries stream=width,height,codec_name,pix_fmt -show_entries format=duration \
    -of default=noprint_wrappers=1 "$f" | sed "s|^|$f |"
done
