# Edit plan and reusable media commands

Run with Python containing `imageio-ffmpeg`, `av`, `numpy`, and `faster-whisper`. `EDITY_FFMPEG` may point to an FFmpeg binary with libx264 and libass. Scripts use argument arrays, never shell interpolation of media names. The bundled imageio FFmpeg is the fallback. All paths below are relative to the directory containing the plan unless absolute.

```json
{
  "width": 720,
  "height": 1280,
  "fps": 30,
  "crf": 18,
  "segments": [
    {"source":"assets/talking.mp4","in":0,"out":4,"caption_y":0.82},
    {"source":"assets/talking.mp4","in":4.5,"out":10,"screen":{"source":"assets/screen.mp4","in":8,"out":13.5,"crop":[100,40,1200,700]},"caption_y":0.56},
    {"source":"assets/talking.mp4","in":10,"out":13,"caption_y":0.82}
  ],
  "hook":{"text":"Actual demonstrated claim","start":0,"end":3,"y":0.09},
  "captions":[{"start":0.2,"end":1.4,"text":"Chat, here is how","x":0.47,"y":0.82}],
  "animations":[]
}
```

This is a schema example, not a usable plan for arbitrary footage. Choose real cut times, hook wording, and cues from the supplied recordings.

Each segment keeps a primary video/audio interval and optionally a screen interval. Reuse the same primary source across cuts; additional talking takes can be separate sources. Primary speech is never sped up. The screen interval is retimed linearly to the segment duration. Split segments at matched actions for piecewise alignment. `crop` is `[x,y,width,height]` in unrotated source pixels; account for orientation before selecting it. All final text times use the concatenated OUTPUT timeline in seconds. Crops and text positions require visual review.

Built-in composition: black 9:16 canvas, face fitted without upscaling between 14–82% height when solo; between 14–54% when paired; screen fitted between 60–90%. Black empty areas are canvas letterboxing, not decorative containers. Default captions sit at 82% when solo and 56% when paired; override individual cue positions for content and platform. The top remains available for the hook. If this fit is poor for source framing, modify composition deliberately rather than obscuring the face or stretching footage. Output dimensions can differ from 9:16 when requested.

Commands (`$EDITY` denotes this skill directory; substitute its absolute path):

```sh
python "$EDITY/scripts/media.py" inspect talking.mp4
python "$EDITY/scripts/media.py" transcribe talking.mp4 transcript.json --model small.en --language en
python "$EDITY/scripts/media.py" sync anchors.json
python "$EDITY/scripts/media.py" captions transcript.json plan.json
python "$EDITY/scripts/media.py" preview plan.json previews/frame --times 0.5 6 9.6 11.5
python "$EDITY/scripts/media.py" render plan.json final.mp4
python "$EDITY/scripts/media.py" verify final.mp4
```

- `inspect`: duration, codecs, dimensions, FPS, audio streams through PyAV.
- `transcribe`: local CPU int8 Whisper, word timings, media-hash cache, no VAD speech removal. First use downloads model weights; footage stays local for transcription. The source-language flag is configurable. Validate transcription manually against sound/context.
- `sync`: input list of `{ "narration": seconds, "screen": seconds }` anchors chosen by inspected content. Returns consecutive source intervals and speed factors. It does not detect content automatically. Screen retiming is constrained to 0.25–4x; choose/split action ranges when outside that range.
- `captions`: remaps word timings through source cuts into short phrases, rejects cuts inside words, writes only the plan's captions. Run once after cuts are chosen, then correct the cue text/timing/positions. The Python remapping function accepts the plan directory as its third argument and compares canonical source paths. For multiple narration sources, remap per source and assemble global output times; helper intentionally rejects mismatched transcript sources.
- `preview`: generates individual JPEG frames using the exact render graph; select actual layout boundaries, not only arbitrary percentages. Does not encode a full preview video.
- `render`: common A/V trims, 5 ms audio edge fades, muted screen sources, piecewise screen timing, ASS white captions/hook/optional text animations, H.264/AAC MP4 with faststart. Writes a verification report and renders to a temporary output before replacing the final file. No music/effects or beauty processing.
- `verify`: checks one video/one audio stream, expected duration during render, full decode without corruption, nonzero audio samples. Does not assert that humans are lip-synced or captions are semantically correct.

A justified “Comment below” animation is an entry in `animations` with `text`, `start`, `end`, optional `x`,`y`, and `animate:true`. All text remains white with a brief fade, no boxes. Escape markup is neutralized in user text. More involved explanatory animations should be created only when supported by narration, then inserted as a real screen source.

For revisions, preserve an earlier plan and keep valid transcript/proxies. Change only requested fields. Reuse final output if plan/media are unchanged and no defect needs correction. `review.json` should describe actual visual/audio checks, timestamps, any limitations, and the current plan hash; do not fabricate a blanket pass.
