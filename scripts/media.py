#!/usr/bin/env python3
"""Edity's deterministic media engine. See references/edit-plan.md."""
import argparse, hashlib, json, math, os, shutil, subprocess, sys
from pathlib import Path


def ffmpeg():
    override = os.environ.get('EDITY_FFMPEG')
    if override:
        return override
    if shutil.which('ffmpeg'):
        return shutil.which('ffmpeg')
    import imageio_ffmpeg
    return imageio_ffmpeg.get_ffmpeg_exe()


def run(args, **kwargs):
    result = subprocess.run([str(x) for x in args], capture_output=True, text=True, **kwargs)
    if result.returncode:
        raise RuntimeError(result.stderr[-6000:] or result.stdout[-2000:])
    return result


def read(path):
    return json.loads(Path(path).read_text())


def save(path, data):
    Path(path).parent.mkdir(parents=True, exist_ok=True)
    temp = Path(str(path) + '.tmp')
    temp.write_text(json.dumps(data, indent=2, ensure_ascii=False))
    temp.replace(path)


def fingerprint(path):
    h = hashlib.sha256()
    with open(path, 'rb') as f:
        for block in iter(lambda: f.read(1024 * 1024), b''):
            h.update(block)
    return h.hexdigest()


def probe(path):
    import av
    with av.open(str(path)) as c:
        streams = []
        for s in c.streams:
            d = {'type': s.type, 'codec': s.codec_context.name if s.codec_context else None}
            if s.type == 'video' and s.codec_context:
                d.update(width=s.width, height=s.height, fps=float(s.average_rate or 30))
            if s.type == 'audio' and s.codec_context:
                d.update(sample_rate=s.sample_rate, channels=s.codec_context.channels)
            d['duration'] = float(s.duration * s.time_base) if s.duration is not None else None
            streams.append(d)
        return {'path': str(Path(path).resolve()), 'duration': c.duration / av.time_base if c.duration else max((s['duration'] or 0 for s in streams), default=0), 'streams': streams}


def transcribe(source, output, model='small.en', language='en'):
    """Cache by actual media content and transcription settings, never by filename alone."""
    key = {'sha256': fingerprint(source), 'model': model, 'language': language, 'vad_filter': False}
    if Path(output).exists():
        existing = read(output)
        if existing.get('cache_key') == key:
            return existing
        raise ValueError('Transcript exists for different media/settings. Choose a new output path; preserve prior analysis.')
    from faster_whisper import WhisperModel
    model_location = model
    cache = os.environ.get('EDITY_MODEL_CACHE')
    if cache:
        snapshots = Path(cache) / ('models--Systran--faster-whisper-' + model) / 'snapshots'
        cached = sorted(snapshots.glob('*/model.bin'))
        if cached:
            model_location = str(cached[-1].parent)
    segments, info = WhisperModel(model_location, device='cpu', compute_type='int8', download_root=os.environ.get('EDITY_MODEL_CACHE')).transcribe(str(source), language=language, word_timestamps=True, vad_filter=False)
    result = {'cache_key': key, 'source': str(Path(source).resolve()), 'language': info.language, 'segments': []}
    for s in segments:
        result['segments'].append({'start': s.start, 'end': s.end, 'text': s.text.strip(), 'words': [{'start': w.start, 'end': w.end, 'text': w.word.strip()} for w in (s.words or [])]})
    save(output, result)
    return result


def num(v, name, lo=0):
    if not isinstance(v, (int, float)) or isinstance(v, bool) or not math.isfinite(v) or v < lo:
        raise ValueError(f'{name} must be a finite number >= {lo}')
    return float(v)


def source_path(root, name):
    return (root / name).resolve()


def validate(plan, root):
    width, height = plan.get('width', 720), plan.get('height', 1280)
    for x in (width, height):
        if not isinstance(x, int) or x < 144 or x > 3840 or x % 2:
            raise ValueError('Output dimensions must be even integers between 144 and 3840')
    fps = num(plan.get('fps', 30), 'fps', 1)
    if fps > 60:
        raise ValueError('fps must be <= 60')
    if not plan.get('segments'):
        raise ValueError('An edit plan needs at least one segment')
    sources, offset = {}, 0
    for i, segment in enumerate(plan['segments']):
        source = source_path(root, segment['source'])
        if source not in sources:
            sources[source] = probe(source)
        meta = sources[source]
        if not any(s['type'] == 'video' for s in meta['streams']) or not any(s['type'] == 'audio' for s in meta['streams']):
            raise ValueError(f'Segment {i}: primary narration must contain video and audio')
        start, end = num(segment['in'], 'in'), num(segment['out'], 'out')
        if end <= start or end > meta['duration'] + .05:
            raise ValueError(f'Segment {i}: invalid narration trim')
        if segment.get('screen'):
            screen = segment['screen']
            p = source_path(root, screen['source'])
            if p not in sources:
                sources[p] = probe(p)
            if not any(s['type'] == 'video' for s in sources[p]['streams']):
                raise ValueError('Screen source must contain video')
            a, b = num(screen['in'], 'screen.in'), num(screen['out'], 'screen.out')
            if b <= a or b > sources[p]['duration'] + .05:
                raise ValueError(f'Segment {i}: invalid screen trim')
            speed = (b - a) / (end - start)
            if speed < .25 or speed > 4:
                raise ValueError('Screen retiming exceeds 0.25x–4x; split or choose another action range')
        for entry in [segment, segment.get('screen', {})]:
            if entry.get('crop'):
                crop = entry['crop']
                if len(crop) != 4 or any(not isinstance(x, int) or x < 0 for x in crop) or crop[2] < 2 or crop[3] < 2:
                    raise ValueError('crop is [x,y,width,height], nonnegative integer pixels')
                p = source_path(root, entry['source'])
                video = next(s for s in sources[p]['streams'] if s['type'] == 'video')
                if crop[0]+crop[2] > video['width'] or crop[1]+crop[3] > video['height']:
                    raise ValueError('Crop extends outside source')
        offset += end - start
    for c in plan.get('captions', []) + plan.get('animations', []) + ([plan['hook']] if plan.get('hook') else []):
        if not c.get('text', '').strip():
            raise ValueError('Text cue is empty')
        if num(c['start'], 'cue start') >= num(c['end'], 'cue end') or c['end'] > offset + .05:
            raise ValueError('Text cue lies outside output timeline')
        for key, default in [('x', .5), ('y', .55)]:
            if not .04 <= num(c.get(key, default), key) <= .92:
                raise ValueError('Text positions must be between .04 and .92 of canvas')
    return sources, offset


def ass_time(s):
    cs = round(s * 100)
    return f'{cs // 360000}:{cs // 6000 % 60:02d}:{cs // 100 % 60:02d}.{cs % 100:02d}'


def ass_text(text):
    # Prevent user text from becoming subtitle drawing/style commands.
    return text.replace('\\', '＼').replace('{', '｛').replace('}', '｝').replace('\r', '').replace('\n', '\\N')


def caption_file(plan, path):
    w, h = plan.get('width', 720), plan.get('height', 1280)
    head = f'''[Script Info]
ScriptType: v4.00+
PlayResX: {w}
PlayResY: {h}
WrapStyle: 0
ScaledBorderAndShadow: yes
[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Caption,Arial,{round(w*.049)},&H00FFFFFF,&H00FFFFFF,&H00202020,&H80000000,-1,0,0,0,100,100,0,0,1,{w*.0028:.2f},1,5,{round(w*.09)},{round(w*.14)},0,1
Style: Hook,Arial,{round(w*.065)},&H00FFFFFF,&H00FFFFFF,&H00202020,&H80000000,-1,0,0,0,100,100,0,0,1,{w*.003:.2f},1,5,{round(w*.09)},{round(w*.14)},0,1
[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
'''
    events = []
    for style, cues in [('Caption', plan.get('captions', [])), ('Hook', [plan['hook']] if plan.get('hook') else []), ('Caption', plan.get('animations', []))]:
        for c in cues:
            x, y = round(c.get('x', .47) * w), round(c.get('y', .105 if style == 'Hook' else .55) * h)
            fade = 100 if c.get('animate', True) else 0
            tags = f'{{\\an5\\pos({x},{y})\\fad({fade},60)}}'
            events.append(f'Dialogue: 0,{ass_time(c["start"])},{ass_time(c["end"])},{style},,0,0,0,,{tags}{ass_text(c["text"])}')
    Path(path).write_text(head + '\n'.join(events) + '\n')


def remap_captions(transcript, plan, root=None):
    """Word-aligned remapping through cuts; refuses edits that bisect transcribed words."""
    root = Path(root).resolve() if root is not None else Path.cwd()
    captions, offset = [], 0
    for seg in plan['segments']:
        words = []
        # Transcript source is explicit: do not apply one speaker recording to another.
        if source_path(root, seg['source']) != source_path(root, transcript['source']):
            raise ValueError('Transcript source does not match narration; remap each source separately')
        for ts in transcript['segments']:
            for word in ts.get('words', []):
                a, b = word['start'], word['end']
                if a < seg['in'] - .015 and b > seg['in'] + .015 or a < seg['out'] - .015 and b > seg['out'] + .015:
                    raise ValueError(f'Cut splits word: {word["text"]!r} at {a:.2f}–{b:.2f}')
                if a >= seg['in'] - .015 and b <= seg['out'] + .015:
                    words.append({'start': offset + max(0, a-seg['in']), 'end': offset + min(seg['out']-seg['in'], b-seg['in']), 'text': word['text']})
        group = []
        for word in words:
            if group and (len(group) >= 5 or len(' '.join(x['text'] for x in group+[word])) > 32 or word['start']-group[-1]['end'] > .4):
                captions.append({'start': group[0]['start'], 'end': group[-1]['end'], 'text': ' '.join(x['text'] for x in group), 'y': seg.get('caption_y', .56 if seg.get('screen') else .82)})
                group = []
            group.append(word)
        if group:
            captions.append({'start': group[0]['start'], 'end': group[-1]['end'], 'text': ' '.join(x['text'] for x in group), 'y': seg.get('caption_y', .56 if seg.get('screen') else .82)})
        offset += seg['out'] - seg['in']
    return captions


def sync_ranges(anchors):
    """Consecutive pairs define content alignment; no timestamp-start guessing."""
    if len(anchors) < 2:
        raise ValueError('At least two content-matched anchors are required')
    ranges = []
    for a, b in zip(anchors, anchors[1:]):
        ns, ne, ss, se = (num(a['narration'], 'narration'), num(b['narration'], 'narration'), num(a['screen'], 'screen'), num(b['screen'], 'screen'))
        if ne <= ns or se <= ss:
            raise ValueError('Anchors must increase in narration and screen time')
        if not .25 <= (se-ss)/(ne-ns) <= 4:
            raise ValueError('Screen retiming exceeds 0.25x–4x; split action ranges')
        ranges.append({'in': ns, 'out': ne, 'screen_in': ss, 'screen_out': se, 'speed': (se-ss)/(ne-ns)})
    return ranges


def graph(plan, root, ass):
    sources, duration = validate(plan, root)
    indices = {p: i for i, p in enumerate(sources)}
    inputs = []
    for p in sources:
        inputs += ['-i', p]
    w, h, fps = plan.get('width', 720), plan.get('height', 1280), plan.get('fps', 30)
    filters, parts = [], []
    def fit(entry, iw, ih):
        crop = entry.get('crop')
        prefix = f'crop={crop[2]}:{crop[3]}:{crop[0]}:{crop[1]},' if crop else ''
        # Never enlarge source pixels just to fill the canvas.
        return prefix + f"scale=w='min(iw,{iw})':h='min(ih,{ih})':force_original_aspect_ratio=decrease:force_divisible_by=2,pad={iw}:{ih}:(ow-iw)/2:(oh-ih)/2:black,setsar=1"
    for n, seg in enumerate(plan['segments']):
        idx = indices[source_path(root, seg['source'])]
        start, end, d = seg['in'], seg['out'], seg['out']-seg['in']
        top = round(h*.14)//2*2
        vh = round(h*(.40 if seg.get('screen') else .68))//2*2
        filters.append(f'[{idx}:v:0]trim=start={start}:end={end},setpts=PTS-STARTPTS,{fit(seg,w,vh)},pad={w}:{h}:0:{top}:black,fps={fps},format=yuv420p[v{n}base]')
        last = f'v{n}base'
        if seg.get('screen'):
            s = seg['screen']; si = indices[source_path(root,s['source'])]
            sh = round(h*.30)//2*2; sy=round(h*.60)//2*2
            ratio = d/(s['out']-s['in'])
            filters.append(f'[{si}:v:0]trim=start={s["in"]}:end={s["out"]},setpts=(PTS-STARTPTS)*{ratio:.10f},{fit(s,w,sh)},fps={fps}[s{n}]')
            filters.append(f'[{last}][s{n}]overlay=x=0:y={sy}:eof_action=pass:repeatlast=0[v{n}]')
            last=f'v{n}'
        filters.append(f'[{idx}:a:0]atrim=start={start}:end={end},asetpts=PTS-STARTPTS,aresample=48000,aformat=sample_fmts=fltp:channel_layouts=stereo,afade=t=in:st=0:d=0.005,afade=t=out:st={max(0,d-.005)}:d=0.005[a{n}]')
        parts.append(f'[{last}][a{n}]')
    filters.append(''.join(parts)+f'concat=n={len(parts)}:v=1:a=1[composed][audio]')
    # ASS lives in render cwd with a safe generated filename, not an interpolated upload name.
    filters.append(f'[composed]fps={fps},tpad=stop_mode=clone:stop_duration={1/fps},trim=duration={duration},ass={ass.name}[video]')
    return inputs, ';\n'.join(filters), duration


def render(plan_path, output, preview_times=None):
    path = Path(plan_path).resolve(); root = path.parent; plan = read(path)
    output = Path(output).resolve(); output.parent.mkdir(parents=True, exist_ok=True)
    workspace = output.parent / ('.' + output.stem + '-render'); workspace.mkdir(exist_ok=True)
    ass = workspace/'captions.ass'; caption_file(plan, ass)
    inputs, filters, duration = graph(plan, root, ass)
    script = workspace/'filters.txt'; script.write_text(filters)
    command = [ffmpeg(), '-hide_banner', '-loglevel', 'error', '-nostdin', '-y', *inputs, '-filter_complex_script', script]
    if preview_times is not None:
        # Four stills run through exactly the final graph, without encoding the whole video.
        script.write_text(filters+';\n[audio]anullsink')
        results=[]
        for i,t in enumerate(preview_times):
            t=min(max(0,float(t)), max(0,duration-.08))
            dest=output.parent/f'{output.stem}-{i+1}.jpg'
            run(command+['-map','[video]','-ss',str(t),'-frames:v','1','-q:v','3',dest],cwd=workspace)
            if not dest.exists(): raise RuntimeError('Preview frame was not produced')
            results.append(str(dest))
        return {'frames':results,'duration':duration}
    temp=output.with_name(output.stem+'.partial.mp4')
    run(command+['-map','[video]','-map','[audio]','-c:v','libx264','-preset','medium','-crf',str(plan.get('crf',18)),'-pix_fmt','yuv420p','-c:a','aac','-b:a','192k','-t',str(duration),'-movflags','+faststart',temp],cwd=workspace)
    report=verify(temp, duration)
    temp.replace(output)
    report['path']=str(output)
    report['plan_sha256']=fingerprint(path)
    report['human_review_required']=['speech and mouth synchronization','screen actions match narration','caption accuracy and placement','clean ending']
    save(output.with_suffix('.verification.json'), report)
    return report


def verify(path, expected=None):
    metadata=probe(path)
    videos=[s for s in metadata['streams'] if s['type']=='video']; audios=[s for s in metadata['streams'] if s['type']=='audio']
    if len(videos)!=1 or len(audios)!=1:
        raise ValueError('Export must have one video and one primary audio stream')
    if expected is not None and abs(metadata['duration']-expected)>.15:
        raise ValueError('Export duration differs from edit plan')
    # Decode every packet to catch corrupt/truncated output. Energy is informational, not a listening check.
    run([ffmpeg(),'-v','error','-xerror','-i',path,'-f','null','-'])
    import av
    peak=0.0
    with av.open(str(path)) as c:
        for frame in c.decode(audio=0):
            import numpy as np
            peak=max(peak,float(np.max(np.abs(frame.to_ndarray().astype('float64')))))
    metadata.update(decoded_without_errors=True,audio_peak=peak,audio_nonzero=peak>0,expected_duration=expected)
    if peak == 0: raise ValueError('Output audio is silent')
    return metadata


def main():
    ap=argparse.ArgumentParser(description=__doc__); sub=ap.add_subparsers(dest='command',required=True)
    p=sub.add_parser('inspect'); p.add_argument('source')
    p=sub.add_parser('transcribe'); p.add_argument('source'); p.add_argument('output'); p.add_argument('--model',default='small.en'); p.add_argument('--language',default='en')
    p=sub.add_parser('captions'); p.add_argument('transcript'); p.add_argument('plan')
    p=sub.add_parser('sync'); p.add_argument('anchors')
    for cmd in ('render','preview'):
        p=sub.add_parser(cmd); p.add_argument('plan'); p.add_argument('output')
        if cmd=='preview': p.add_argument('--times',type=float,nargs='+')
    p=sub.add_parser('verify'); p.add_argument('source')
    a=ap.parse_args()
    if a.command=='inspect': result=probe(a.source)
    elif a.command=='transcribe': result=transcribe(a.source,a.output,a.model,a.language)
    elif a.command=='captions':
        plan=read(a.plan); plan['captions']=remap_captions(read(a.transcript),plan,Path(a.plan).resolve().parent); save(a.plan,plan); result={'captions':len(plan['captions'])}
    elif a.command=='sync': result=sync_ranges(read(a.anchors))
    elif a.command=='render': result=render(a.plan,a.output)
    elif a.command=='preview':
        plan=read(a.plan); duration=sum(s['out']-s['in'] for s in plan['segments']); result=render(a.plan,a.output,a.times or [0.5,duration*.4,duration*.65,max(0,duration-.5)])
    else: result=verify(a.source)
    print(json.dumps(result,indent=2))

if __name__=='__main__':
    main()
