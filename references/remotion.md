# Remotion integration for edity

## Choose the skill

The official skills are installed under `<home>/.codex/skills/`. Read the named skill's `SKILL.md` before using its workflow; do not load the entire pack for every edit.

| Need | Installed skill |
| --- | --- |
| Route a Remotion task | `remotion-best-practices` |
| Animated typography, icons, arrows, transitions, effects and composition | `remotion-markup` |
| Timed caption display and animation, or SRT import | `remotion-captions` |
| New project or composition when needed | `remotion-create` |
| Preview animation and revise timing | `remotion-studio` |
| Editable elements, positions, sizes and keyframes in Studio | `remotion-interactivity` |
| MP4, stills, selected frames or transparent graphics exports | `remotion-render` |
| Current API guidance | `remotion-docs` |
| Browser media dimensions and durations through Mediabunny | `remotion-multimedia` |
| Geographic animation when relevant | `remotion-maps` |
| Requested dashboard/player integration | `remotion-saas` |
| Necessary or requested dependency updates | `remotion-upgrade` |

These are instructions and references, not a preconfigured renderer. Inspect the current project and available Node/runtime dependencies. Reuse an existing Remotion project when suitable, otherwise create an isolated project for the requested animation. Do not migrate the dashboard, update unrelated dependencies, enable cloud rendering, or buy assets merely because the skills are available.

## Apply User's style

For new edits, read [automatic cartoon animation direction](cartoon-animation-style.md). Select and author relevant character/visual-metaphor scenes proactively, without requiring User to request each one.

- Keep hook and caption text white with subtle contrast treatment. Generic examples with colored highlights, pill captions, title-card boxes, music, or generated narration are not User's defaults. Respect explicit exceptions requested for a particular edit.
- Tie each visual to spoken meaning: reveal formula items on their words, draw arrows between related ideas, and move prompt underlines as the explanation changes. Preserve reading time and keep graphics clear of the face and useful screen content.
- Use frame-driven animation and the timing/easing guidance in remotion-markup. For a stop-motion look, use deliberate held poses and stepped transforms for graphic layers while retaining the source footage and narration timing. Actual photographic stop motion requires image sequences; do not claim simulated movement is photographed stop motion.
- Reuse a small set of coherent entrances, paths, and emphasis treatments. Avoid gratuitous motion and decorative clutter.

## Fit into the existing edit

1. Preserve the approved source selections and source-to-output timeline mapping. Convert the cached word times into the caption format Remotion needs; do not transcribe again just to switch renderers.
2. Author the relevant animated layers or sections. Use editable component structure when useful for revisions. Keep one primary narration track: transparent graphics should not add a duplicate copy of speech.
3. Open Studio when the project can run and inspect short motion previews, especially entrances, exits and scene boundaries. Still frames establish layout but do not establish smooth motion or word-boundary quality.
4. Choose either a full Remotion composition or transparent graphics composited with the existing edit, based on the current project. Keep frame rate, dimensions, duration and audio mapping consistent. Rendering a graphic must not shift or clip a spoken word.
5. Export the requested final MP4 using remotion-render or the existing media pipeline as appropriate. Reuse previews and intermediates; rerender only for a specific defect. Edity's finished-video requests override the upstream preview-only default.
6. Apply edity's verification and delivery workflow. Verify actual exported transitions, captions, narration presence, ending and synchronization; record checks actually performed and any unavailable listening review. Skill installation or a successful render is not proof of editorial quality.
