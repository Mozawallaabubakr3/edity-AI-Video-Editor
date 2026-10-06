#!/usr/bin/env python3
"""Start the local editor or open the already-running edity dashboard."""
import json, os, subprocess, sys, urllib.request, urllib.error, webbrowser
from pathlib import Path
url='http://127.0.0.1:8777'
try:
    with urllib.request.urlopen(url+'/api/projects',timeout=1) as response:
        existing=json.load(response)
    if existing.get('app')=='edity':
        webbrowser.open(url)
        print('Opened the running edity dashboard.')
        sys.exit(0)
except (OSError, ValueError):
    pass
script=Path(__file__).resolve().parent/'dashboard.py'
data=os.environ.get('EDITY_DATA',str(Path.cwd()/'edity-projects'))
print('Keep this window open while editing. Close it or press Ctrl+C to stop edity.')
try:
    subprocess.run([sys.executable,str(script),'--data',data,'--port','8777','--open'],check=True)
except KeyboardInterrupt:
    pass
