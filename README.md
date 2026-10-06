# edity-AI-Video-Editor

A local editing desk and media CLI for talking videos, screen demonstrations, synchronized captions and export review.

Created as a source snapshot on October 6, 2026 from Abubakr Mozawalla’s working project and approved Obsidian documentation. The repository describes a personal prototype; it does not claim client results or measured application throughput.

## Architecture

`scripts/media.py` inspects media, transcribes/caches word timing, maps narration cuts and captions, composes screen demonstrations, renders and verifies MP4 streams. `scripts/dashboard.py` serves the local editing desk; `scripts/launch.py` starts it. `SKILL.md` and `references/` hold the creative workflow, approved style and Remotion routing. `assets/council-motion/` contains reusable original animation examples.

Workflow: footage + brief → cached inspection/transcript → editorial cut map → caption timing + demonstrations → animation beats → representative previews → MP4 export → stream/timing review.

## Use

Install the Python requirements into a virtual environment. Media work also needs FFmpeg, and agent-driven editing needs a configured Codex installation. See `SKILL.md` and `references/dashboard.md` for commands and workflow. The source contains no personal footage, transcripts, approved video archive, API key or account session. Some narration/editing choices require human review; this is not a universal automatic editor.

## Export boundaries

The snapshot includes actual implementation code and configuration examples. Databases, applicant information, resumes, account sessions, machine-specific deployment files, emails, prospect records, raw footage and generated media are excluded. Private working copies remain separate.
