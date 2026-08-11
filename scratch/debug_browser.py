import subprocess, json, time, urllib.request, os

edge = r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'

# Start Edge with remote debugging
proc = subprocess.Popen([
    edge,
    '--headless',
    '--remote-debugging-port=9222',
    '--disable-gpu',
    '--no-first-run',
    'http://localhost:8000'
])

time.sleep(2)

try:
    # Query DevTools JSON API
    req = urllib.request.urlopen('http://localhost:9222/json')
    pages = json.loads(req.read().decode())
    print('DevTools Pages:', len(pages))
    for p in pages:
        print('Page:', p.get('title'), p.get('url'), p.get('webSocketDebuggerUrl'))
finally:
    proc.terminate()
