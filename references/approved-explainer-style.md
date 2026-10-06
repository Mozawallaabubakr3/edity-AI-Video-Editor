# User’s approved explainer defaults — 2026-10-05

Read this before planning new talking-head AI/building-in-public explainers. User explicitly asked to make the completed Council edit the starting point for future videos. Later briefs override these defaults; do not import the Council topic or exact timing into unrelated videos.

## Approved baseline

- Default spoken narration and its matching picture to **1.1× source speed**, preserving pitch (e.g. `atempo=1.1` for audio and `setpts=(PTS-STARTPTS)/1.1` for picture). Apply once, not on top of an already sped-up export. Recompute word timing, captions, screen actions and every animation cue through the actual cuts and speed change. Preserve source-conscious output resolution.
- Open immediately with the speaker and an animation above their head. No automatic opening title or title card. Preserve “Chat” and the whole opening thought when spoken.
- Introduce the named topic/skill with a big, legible, colorful impact title **on the spoken name**: short anticipation, fast scale impact, modest overshoot/settle and purposeful rays/underline. The Council title is an example; use the new video’s actual subject. Colored topic titles are allowed. Spoken captions remain white with dark shadow/outline. Use dark instructional text for readability on white.
- White animation backgrounds by default. A drawn setting may replace white when the environment tells the story. No decorative overlay boxes, caption pills or fake browser framing. A meaningful illustrated computer is allowed for a typing demonstration, but must never imply an actual installation or result was recorded or completed.
- Maintain active, fluid visual storytelling across explanatory sections: characters enter, move, interact, change pose, exchange objects, write, type and revise. Static slides with a bobbing icon are insufficient. Smooth per-frame movement is the default; stepped/stop-motion motion is only for a specific request.
- Match the **action**, not just the subject, to narration. “Fight” means sparring at that word; “spin up agents” means agents appearing at that phrase; “paste/install” means visible typing; “disagree” means an objection; “changed their mind” means an actual revision; “recommendation” means the combined output. These are examples, not a mandatory repeated storyboard.
- Use short overlapping eased drop exits and rise entrances between different scenes (the approved timeline uses about six frames at 30 fps). Keep the background stable and avoid blank holds. Do not replay long entrances on every small action; continue the action when possible.
- Cover reading glances with relevant full-screen animation, including pauses, layout transitions and the complete ending. Reintroduce the speaker when looking up naturally. Do not claim gaze correction or distort the face.

## Cuts that preserve speech without dead air

Use the cached word transcript as an index, not ground truth for waveform boundaries. Remove actual silence, repeated takes and false starts while preserving complete words, meaning, qualifiers, useful examples and the final sentence. A roughly 0.15–0.25-second conversational gap can be a useful starting point; use the performance to decide, not a rigid target. Do not add long padding to every sentence just to hide a cut.

Inspect waveform energy **and** source context around joins. Keep trailing syllables and initial consonants; use tiny fades in quiet handles to prevent clicks. Never shorten a word to hit a nominal transcript timestamp. If a detected gap is really a trailing word or breath, keep it continuous. Where subjective listening is unavailable, report that limit and use conservative handles; energy thresholds do not prove semantic accuracy.

Lessons from this edit:
- The ASR ended “Council” and “recommendation” before their actual audio ended. Trimming to those timestamps clipped the tails. Extending to quieter samples or preserving the entire tiny gap fixed this.
- ASR assigned “open” a 26.26–27.78-second span although voice began near 27.56. Silence hidden **inside** a word span survived ordinary pause removal. Check implausibly long word durations against the waveform, correct timing and remove only confirmed silence. Never reuse this exact source timestamp on new footage.
- Reducing pauses and then changing speed requires one shared source-to-output map for video, audio, captions and scene anchors. Keep the final outro complete.

## First-pass review

Before the main export, check a short motion preview and representative frames: opening, named-topic impact, a verb/action beat, an installation/demo beat, a scene transition, and ending. Check that actions land on the relevant words at the **final** playback speed; that no reading glance leaks through; and that white captions are legible and clear of face/content. Stills alone do not prove fluid motion. Keep claims about checks honest.

Reuse analysis, existing assets and intermediates. Export one final; re-render for a specific discovered defect. No additional music or SFX without a request. A prior challenge’s music and timer rules were project-specific, not defaults. Revisions keep all approved work except the requested changes and necessary retiming.

## Saved production reference

Approved final and self-contained media/project snapshot:
`<home>/Documents/Codex/2026-10-02/her/outputs/council-video/approved-reference-2026-10-05/`

`approved-final.mp4` is the approved 45.27-second, 1.1× version. The snapshot includes Remotion source, pinned package metadata, composed source media/narration, cached transcript, cut map, animation anchors, verification record, Council-specific editing scripts and a SHA-256 manifest. Original raw footage remains at the path in `source.json`; dependencies are not bundled. To resume the old project, use the pinned package versions and its saved public media. Do not run the historical pipeline blindly against a new video.

Reusable original React/SVG components are bundled at `assets/council-motion/`: `Art.tsx`, `Scenes.tsx`, `ActionScenes.tsx`, and `Impact.tsx`. Copy compatible components into a new Remotion project, retain their local imports, and adapt scene content and clocks to the new narration. `ActionScenes.tsx` accepts frame overrides for speech-anchored timing. They are working production examples, not a universal automatic character-rig system. They contain no official Codex logo.

The final approved edit governs these preferences, superseding earlier drafts with static slides, dark generic backgrounds, slow transitions, clipped word tails, or 1.2× narration. This baseline should reduce repeated corrections; it does not guarantee identical quality without footage-specific editorial work.
