#!/usr/bin/env python3
"""Local upload/edit/export dashboard for edity. No external server dependencies."""
import argparse, json, mimetypes, os, re, secrets, shutil, signal, subprocess, sys, threading, time, uuid, webbrowser
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, unquote, urlparse
import media

SKILL=Path(__file__).resolve().parent.parent
LOCK=threading.RLock()
PROCESSES={}
ACTIVE=set()
TOKEN=secrets.token_urlsafe(32)
DATA=None
PORT=None


def project_dir(pid):
    if not re.fullmatch('[a-f0-9]{12}',pid): raise ValueError('Invalid project')
    p=DATA/pid
    if not (p/'project.json').exists(): raise ValueError('Project not found')
    return p


def info(p):
    value=media.read(p/'project.json')
    value['has_plan']=(p/'plan.json').exists()
    value['has_final']=(p/'final.mp4').exists()
    value['previews']=[str(f.relative_to(p)) for f in sorted((p/'previews').glob('*.jpg'))] if (p/'previews').exists() else []
    for key,file in [('result','result.md'),('log','job.log')]:
        value[key]=(p/file).read_text(errors='replace')[-18000:] if (p/file).exists() else ''
    value['review']=media.read(p/'review.json') if (p/'review.json').exists() else None
    value['verification']=media.read(p/'final.verification.json') if (p/'final.verification.json').exists() else None
    value['plan']=media.read(p/'plan.json') if value['has_plan'] else None
    value['current_export']=bool(value['has_final'] and value['has_plan'] and value['verification'] and value['verification'].get('plan_sha256')==media.fingerprint(p/'plan.json'))
    return value


def patch(p,fields):
    with LOCK:
        value=media.read(p/'project.json'); value.update(fields); value['updated']=time.time(); media.save(p/'project.json',value)


def codex_binary():
    return shutil.which('codex') or next((str(p) for p in [Path('/Applications/ChatGPT.app/Contents/Resources/codex'),Path('/Applications/Codex.app/Contents/Resources/codex')] if p.exists()),None)


def request_text(p):
    state=media.read(p/'project.json')
    return f'''Use $edity at {SKILL / 'SKILL.md'} to complete this video edit in this project directory.
Read that skill and references/edit-plan.md. Media helper Python: {sys.executable}; script: {SKILL / 'scripts/media.py'}.
Local speech model cache: {os.environ.get('EDITY_MODEL_CACHE', 'default cache')}. Use it through EDITY_MODEL_CACHE when transcribing.
User editing brief:
{state.get('brief','Edit naturally with the screen recording below my face.')}
Exact hook (if supplied; otherwise choose a truthful hook): {state.get('hook','')}
Primary narration: {state.get('primary','')}
Uploaded files and roles: {json.dumps(state['files'],ensure_ascii=False)}
Inspect actual footage and reuse any existing transcript/analysis. Preserve Chat and the introductory sentence. For revisions preserve approved work and modify only requested elements.
Write plan.json with actual source cuts, white captions and a truthful hook. Align screen actions by inspected content. Generate and inspect representative frames in previews/. Render one final.mp4, verify it, and write review.json describing only checks actually performed, timestamps, limitations and plan_sha256. The media helper's automatic report is not proof of semantic or visual quality. Do not claim to hear audio if your tools cannot play it; disclose that limitation and use all available evidence. Keep all work under this project. Do not publish or send messages. Never modify this dashboard, skill, global configuration, or other projects.
Deliver a brief result and identify any unresolved quality limits. If blocked, record the specific blocker rather than inventing success.
'''


def job(p,mode):
    pid=p.name
    try:
        with (p/'job.log').open('w') as log:
            if mode=='edit':
                binary=codex_binary()
                if not binary: raise RuntimeError('Codex CLI is unavailable. Open this project in Codex to continue.')
                prompt=request_text(p); (p/'request.md').write_text(prompt)
                command=[binary,'exec','--skip-git-repo-check','--sandbox','workspace-write','--cd',str(p),'--color','never','--output-last-message',str(p/'result.md'),'-']
                env=os.environ.copy(); env['PYTHONUNBUFFERED']='1'
                # Keep CLI session identity independent; do not override authentication/settings.
                env.pop('CODEX_THREAD_ID',None)
                process=subprocess.Popen(command,stdin=subprocess.PIPE,stdout=log,stderr=subprocess.STDOUT,text=True,start_new_session=True,env=env)
                with LOCK: PROCESSES[pid]=process
                process.communicate(prompt)
                if process.returncode: raise RuntimeError(f'Codex stopped with exit code {process.returncode}. See activity for the reason.')
            else:
                command=[sys.executable,str(SKILL/'scripts/media.py'), 'render' if mode=='export' else 'preview',str(p/'plan.json'),str(p/'final.mp4' if mode=='export' else 'previews/frame')]
                process=subprocess.Popen(command,stdout=log,stderr=subprocess.STDOUT,start_new_session=True)
                with LOCK: PROCESSES[pid]=process
                if process.wait(): raise RuntimeError('Media processing failed. See activity for the reason.')
        patch(p,{'status':'finished','message':'Job finished. Review the result and any limitations.'})
    except Exception as e:
        patch(p,{'status':'attention','message':str(e)})
    finally:
        with LOCK: PROCESSES.pop(pid,None); ACTIVE.discard(pid)


class Handler(BaseHTTPRequestHandler):
    server_version='edity'
    def log_message(self,*args): pass
    def valid_host(self): return self.headers.get('Host') in (f'127.0.0.1:{PORT}',f'localhost:{PORT}')
    def headers_common(self):
        self.send_header('X-Content-Type-Options','nosniff')
        self.send_header('Cache-Control','no-store')
        self.send_header('Referrer-Policy','no-referrer')
        self.send_header('Content-Security-Policy',"default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' blob:; media-src 'self' blob:; frame-ancestors 'none'; connect-src 'self'")
    def respond(self,value,status=200):
        raw=json.dumps(value,ensure_ascii=False).encode(); self.send_response(status); self.headers_common(); self.send_header('Content-Type','application/json'); self.send_header('Content-Length',str(len(raw))); self.end_headers(); self.wfile.write(raw)
    def secure(self,mutation=False):
        if not self.valid_host(): self.respond({'error':'Unrecognized host'},403); return False
        if mutation and self.headers.get('X-Edity-Token')!=TOKEN:
            self.respond({'error':'Reload the dashboard to refresh the session'},403); return False
        origin=self.headers.get('Origin')
        if origin and origin not in (f'http://127.0.0.1:{PORT}',f'http://localhost:{PORT}'):
            self.respond({'error':'Origin not allowed'},403); return False
        return True
    def body(self):
        n=int(self.headers.get('Content-Length','0'))
        if n>1000000: raise ValueError('Request too large')
        return json.loads(self.rfile.read(n) or '{}')
    def file(self,path):
        length=path.stat().st_size; start=0; end=length-1; status=200
        if self.headers.get('Range'):
            match=re.fullmatch(r'bytes=(\d+)-(\d*)',self.headers['Range'])
            if not match: self.send_error(416); return
            start=int(match[1]); end=min(end,int(match[2])) if match[2] else end
            if start>end: self.send_error(416); return
            status=206
        self.send_response(status); self.headers_common(); self.send_header('Content-Type',mimetypes.guess_type(path)[0] or 'application/octet-stream'); self.send_header('Accept-Ranges','bytes')
        self.send_header('Content-Length',str(end-start+1))
        if status==206: self.send_header('Content-Range',f'bytes {start}-{end}/{length}')
        self.end_headers()
        try:
            with path.open('rb') as f:
                f.seek(start); remain=end-start+1
                while remain:
                    block=f.read(min(remain,1024*1024))
                    if not block: break
                    self.wfile.write(block); remain-=len(block)
        except (BrokenPipeError,ConnectionResetError): pass
    def do_GET(self):
        if not self.secure(): return
        try:
            path=urlparse(self.path).path
            if path=='/':
                html=(SKILL/'assets/dashboard.html').read_text().replace('__TOKEN__',TOKEN).encode()
                self.send_response(200); self.headers_common(); self.send_header('Content-Type','text/html; charset=utf-8'); self.send_header('Content-Length',str(len(html))); self.end_headers(); self.wfile.write(html)
            elif path=='/api/projects':
                with LOCK: values=[media.read(p) for p in DATA.glob('*/project.json')]
                self.respond({'app':'edity','projects':sorted(values,key=lambda p:p['updated'],reverse=True),'codex':bool(codex_binary()),'data':str(DATA)})
            elif path.startswith('/api/project/'):
                with LOCK: value=info(project_dir(path.rsplit('/',1)[1]))
                self.respond(value)
            elif path.startswith('/files/'):
                _,_,pid,*parts=path.split('/'); p=project_dir(pid); target=(p/unquote('/'.join(parts))).resolve()
                if not target.is_relative_to(p.resolve()) or not target.is_file() or target.suffix.lower() not in ('.mp4','.mov','.webm','.mkv','.m4v','.jpg','.jpeg','.png','.json','.md','.log','.wav','.mp3'):
                    raise ValueError('File not available')
                self.file(target)
            else: self.send_error(404)
        except Exception as e: self.respond({'error':str(e)},400)
    def do_POST(self):
        if not self.secure(True): return
        try:
            path=urlparse(self.path).path; body=self.body()
            if path=='/api/projects':
                pid=uuid.uuid4().hex[:12]; p=DATA/pid; p.mkdir(); (p/'assets').mkdir()
                name=str(body.get('name','Untitled edit')).strip()[:100] or 'Untitled edit'
                media.save(p/'project.json',{'id':pid,'name':name,'files':[],'brief':'Edit this with the screen recording below my face.','hook':'','primary':'','status':'ready','message':'Add footage to begin.','updated':time.time()})
                self.respond(info(p)); return
            match=re.fullmatch(r'/api/project/([a-f0-9]{12})/(save|edit|export|preview|stop)',path)
            if not match: raise ValueError('Unknown action')
            p=project_dir(match[1]); action=match[2]
            with LOCK:
                if action=='stop':
                    process=PROCESSES.get(p.name)
                    if process: os.killpg(process.pid,signal.SIGTERM)
                    self.respond({'ok':True}); return
                if p.name in ACTIVE: raise ValueError('Wait for or stop the current job first')
                if action=='save':
                    state=media.read(p/'project.json'); allowed={f['path'] for f in state['files'] if f['role']=='talking'}
                    primary=str(body.get('primary',state.get('primary','')))
                    if primary and primary not in allowed: raise ValueError('Select an uploaded talking video')
                    patch(p,{'brief':str(body.get('brief',''))[:20000],'hook':str(body.get('hook',''))[:1000],'primary':primary}); self.respond(info(p)); return
                state=media.read(p/'project.json')
                if action=='edit' and not state.get('primary'): raise ValueError('Upload and select a primary talking video first')
                if action in ('export','preview') and not (p/'plan.json').exists(): raise ValueError('Run an edit first to create the plan')
                if action=='export' and (p/'final.verification.json').exists() and media.read(p/'final.verification.json').get('plan_sha256')==media.fingerprint(p/'plan.json') and (p/'final.mp4').exists():
                    self.respond({'ok':True,'message':'Current export already matches this plan; reused it.'}); return
                ACTIVE.add(p.name); patch(p,{'status':'running','message':{'edit':'edity is inspecting and editing your footage.','export':'Exporting MP4 from the saved plan.','preview':'Building representative frames.'}[action]})
                threading.Thread(target=job,args=(p,action),daemon=True).start()
            self.respond({'ok':True})
        except Exception as e: self.respond({'error':str(e)},400)
    def do_PUT(self):
        if not self.secure(True): return
        temp=None
        try:
            url=urlparse(self.path); match=re.fullmatch(r'/api/project/([a-f0-9]{12})/upload',url.path)
            if not match: raise ValueError('Unknown upload destination')
            p=project_dir(match[1]); params=parse_qs(url.query); role=params.get('role',['talking'])[0]
            if role not in ('talking','screen'): raise ValueError('Unknown footage role')
            original=Path(params.get('name',['clip.mp4'])[0]).name; ext=Path(original).suffix.lower()
            if ext not in ('.mp4','.mov','.mkv','.webm','.m4v'): raise ValueError('Use MP4, MOV, MKV, WEBM, or M4V footage')
            length=int(self.headers.get('Content-Length','0'))
            if length<=0 or length>8*1024**3: raise ValueError('Choose a video smaller than 8 GB')
            with LOCK:
                if p.name in ACTIVE: raise ValueError('Wait for the current job to finish before uploading')
                ACTIVE.add(p.name)
            dest=p/'assets'/(uuid.uuid4().hex[:10]+ext); temp=dest.with_suffix('.upload')
            with temp.open('wb') as f:
                remaining=length
                while remaining:
                    block=self.rfile.read(min(1024*1024,remaining))
                    if not block: raise ValueError('Upload interrupted')
                    f.write(block); remaining-=len(block)
            metadata=media.probe(temp)
            if not any(s['type']=='video' for s in metadata['streams']): raise ValueError('This file has no video stream')
            temp.replace(dest); temp=None
            with LOCK:
                state=media.read(p/'project.json'); rel=str(dest.relative_to(p)); state['files'].append({'name':original,'path':rel,'role':role,'duration':metadata['duration'],'streams':metadata['streams']})
                if role=='talking' and not state['primary']: state['primary']=rel
                state['message']='Footage saved. Add your brief and start the edit.'; media.save(p/'project.json',state); ACTIVE.discard(p.name)
            self.respond(info(p))
        except Exception as e:
            if temp and temp.exists(): temp.unlink()
            if 'p' in locals() and temp is not None:
                with LOCK: ACTIVE.discard(p.name)
            self.respond({'error':str(e)},400)


def main():
    global DATA,PORT
    ap=argparse.ArgumentParser(); ap.add_argument('--data',type=Path,required=True); ap.add_argument('--port',type=int,default=8777); ap.add_argument('--open',action='store_true'); args=ap.parse_args()
    DATA=args.data.resolve(); DATA.mkdir(parents=True,exist_ok=True); PORT=args.port
    for p in DATA.glob('*/project.json'):
        if media.read(p).get('status')=='running': patch(p.parent,{'status':'attention','message':'Previous job was interrupted. Existing files are preserved.'})
    server=ThreadingHTTPServer(('127.0.0.1',PORT),Handler)
    print(f'edity is ready at http://127.0.0.1:{PORT}',flush=True)
    if args.open: webbrowser.open(f'http://127.0.0.1:{PORT}')
    try: server.serve_forever()
    except KeyboardInterrupt: pass
    finally:
        with LOCK:
            for p in PROCESSES.values():
                try: os.killpg(p.pid,signal.SIGTERM)
                except ProcessLookupError: pass
        server.server_close()

if __name__=='__main__': main()
