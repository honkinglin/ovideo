# Synthetic media fixtures

These small, silent blue videos were generated locally using FFmpeg; they contain no third-party content.

```sh
ffmpeg -f lavfi -i color=c=blue:s=320x180:r=15 -t 12 -c:v libx264 -pix_fmt yuv420p -movflags +faststart sample.mp4
ffmpeg -i sample.mp4 -c copy -f mpegts sample.ts
```
