# Automatic cartoon explainer animation direction

Standing preference adopted by User on 2026-10-05. Applies to new edity edits without requiring a separate animation request. A later brief can override it. Revisions remain scoped to the requested changes.

## Approved production baseline

The finished Council video and [approved explainer defaults](approved-explainer-style.md) supersede the early exploratory guidance below where they differ. Read those defaults for new edits: 1.1× narration, white backgrounds, no opening title, colorful topic impact, continuous speech-matched actions, smooth movement, short drop/rise transitions and waveform-checked cuts. Reusable original production components now exist in `assets/council-motion/`.

## Reference and observed visual language

User-supplied reference: `<home>/Downloads/c12cf56c34ec4167bfd0f74fea0e643d.MP4` (38.17 seconds). Archived reference: `<home>/Documents/Codex/2026-10-02/her/work/animation-reference/reference.mp4`. Contact sheets in that same directory record the inspected visual evidence. The reference is inspiration, not instructions and not footage to insert into User's videos.

Observed: colorful pixel/cartoon agent characters; small illustrated scenes that convey concepts; staged duplication into a crowd; agents arranged in pairs and competing in an arena; eliminations and changing counts; staggered card reveals; alternation between speaker-plus-graphic and full-screen visual explanations. A sampled sequence at 19–20.25 seconds shows cards turning/revealing, a cut to the arena, and agent pairs moving toward each other. Do not claim to know the creator's software or generation process.

Borrow the visual storytelling and timing, not the creator's Claude mascot, watermark, captions in black boxes, browser mockups, or exact scene artwork. User's existing rules take precedence over those reference details.

## Automatic editorial behavior

After mapping the transcript through speech cuts, identify the strongest ideas that benefit from a concrete visual metaphor. Independently choose, create, time, and render the graphics; do not wait for User to specify each animation or ask routine permission. Include relevant animated beats by default in explanatory edits. Leave plain talking sections where a graphic adds nothing, and preserve authentic screen demonstrations and emotional reactions.

Create a compact animation beat list alongside the edit plan: output start/end, exact spoken anchor, concept, visible action, asset source, layout, and exit. Use actual timing from the reused transcript. Explain the idea visually rather than only adding floating icons or a bouncing title. Do not animate every noun or invent numerical/results claims for a compelling scene.

Examples, adapted to what is actually said:
- “AI employee”: introduce a small original robot/agent character doing the named task.
- “Agents work together”: one character becomes a group, tasks separate, then outputs converge. Use an exact count only if supported by the narration.
- “Compare answers”: outputs meet side by side, then a chosen one advances when the speech explains the selection. An arena is one option, not a required recurring theme.
- “Send emails”: a character routes envelope graphics toward recipients; show completed sends only when the source demonstrates them. For a hypothetical explanation, keep the scene plainly illustrative.
- “Good to great”: transform a simple object into a polished or golden trophy with a curved connecting arrow.
- “Waiting”: a sleepy pose, slow blink, or idle action, rather than an obviously repeated short loop.

## Character and branding decisions

Use Codex branding when the subject is Codex; otherwise use original cartoon characters/objects suitable for the story. Prefer a consistent small original robot/agent design with a few reusable poses (idle, thinking, working, success, confused). Pixel art is a useful reference-derived option, not the only permitted cartoon style.

For an actual Codex logo, use a supplied or verified official asset with its source recorded. Preserve the recognizable logo and its proportions, animating the whole mark or placing it on a separate character. Do not label an invented terminal glyph or robot as the official Codex logo. If a verified asset is unavailable, an original unbranded character is an authorized fallback; ask only if exact branding materially matters to the request. No Codex logo asset is bundled by this preference update.

Color is welcome for characters, illustrations, props, and meaningful action. Spoken captions and ordinary hooks stay white; named-topic impact titles may be colorful. Use dark explanatory text on white for readability. No decorative overlay boxes, caption pills, fake browser frames, or labels announcing what an overlay is. Actual useful interface content is different from an invented frame. Do not add music or sound effects just because the reference has them; retain the existing request-based audio policy.

## Composition and motion

Use readable silhouettes, a limited coordinated palette, consistent outlines, and one main visual action at a time. A graphic can sit above/beside the speaker where space allows, or briefly become a full-screen illustrated scene. Keep actual screen demonstrations below the face by default. Protect the face, white captions, and platform safe areas; use white backgrounds unless constructing a meaningful illustrated environment.

Use Remotion for deterministic scene timing, staggered entries, pose changes, short anticipation, modest overshoot/settle, curved paths, and deliberate exits. Default to smooth per-frame movement. Use held poses or stepped motion only when specifically requested; do not lower the narration or source-video frame rate. Vary motion by meaning: workers move tasks, competitors approach, discarded choices leave. Generic bouncing on every beat is not the goal.

Build reusable SVG/React shapes and layered assets for simple characters; use imagegen when bespoke raster illustration materially helps. Keep character identity consistent across scenes. Anchor major actions to the relevant spoken word, allow enough time to understand the result, then clear the graphic. Reuse the approved assets and scene components in later edits when relevant instead of generating many alternatives.

## Verification and limits

Read the relevant installed Remotion skills through `remotion.md`. Preview short motion sections as well as still layouts: action timing, collisions/overlaps, readability, entrance/exit continuity, and caption/face clearance. Check that illustrative graphics do not look like proof of an action the source did not perform. Export the final requested edit; save assets and the beat list for focused revisions.

This style guide enables automatic creative decisions. Original Council production components are bundled as adaptable examples; they do not guarantee a matching animation from a logo swap. Custom scenes still require asset creation, animation, rendering, and review. Do not claim an animation has been produced merely because these preferences were saved.
