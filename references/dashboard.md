# Local dashboard

The dashboard uses Python's standard HTTP server on `127.0.0.1`, a per-process token, same-origin requests, and project directories under the chosen data root. It does not expose a network listener on other interfaces. Media are stored on this Mac. Codex reasoning uses the signed-in account and may send inspected frames/text to the model; this is not fully offline editing. No footage is uploaded by the dashboard to a media-hosting service.

Start using `python scripts/dashboard.py --data /absolute/path/to/projects --port 8777`. The companion `Launch edity.command` in the delivered output folder starts the installed skill using the configured local runtime. Restarting the dashboard preserves projects, source footage, transcripts, plans, and outputs. A running edit interrupted by shutdown is marked interrupted on restart.

Dependencies: `imageio-ffmpeg`, `av`, `numpy`, `faster-whisper`. A separate local virtual environment avoids changing system Python. First transcription downloads the chosen Whisper model, then reuses it. FFmpeg must include libass and libx264. Codex CLI must be on PATH (the launcher also detects the bundled desktop CLI); authenticate with your usual Codex login if needed.

Flow: create a project → upload talking video(s) and screen recording(s) → choose the primary narration → enter a brief and optional exact hook → Edit with edity. A job runs `codex exec` in the project directory with workspace-write isolation, the skill instructions, and the saved request. The UI disables conflicting edits during a job and allows stopping it. Model/CLI failures retain the project and show the error. A revision is another brief against the existing project; the existing edit must be preserved except requested changes. Export uses the current `plan.json` when one exists; it is disabled until there is a plan.

Project files:
- `project.json`: name, uploads, user brief, selected primary file, job status.
- `request.md`: saved user request for Codex.
- `transcript.json`, `plan.json`: cached analysis and deterministic final timeline.
- `previews/`: representative composition frames.
- `final.mp4`, `final.verification.json`: export and technical verification.
- `review.json`: actual checks and any remaining limitations, written by the editing agent.
- `job.log`, `result.md`: progress and agent result.

The server cannot itself infer screen actions from a start offset. The editing agent inspects footage and writes a plan before the media engine renders. The UI never equates process success with a quality-reviewed video: it exposes the final artifact, verification, review and agent result separately. Testing with synthetic clips verifies machinery, not editing quality on User's real footage.
