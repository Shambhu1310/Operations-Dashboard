import json, urllib.request, asyncio
import urllib.parse

# Try importing websockets or fallback to standard library socket
try:
    import websockets
except ImportError:
    import subprocess
    subprocess.run(['pip', 'install', 'websockets'], check=True)
    import websockets

async def check_cdp():
    req = urllib.request.urlopen('http://localhost:9222/json')
    pages = json.loads(req.read().decode())
    target = next((p for p in pages if p.get('url') == 'http://localhost:8000/'), None)
    if not target:
        print('Target page not found')
        return
    
    ws_url = target['webSocketDebuggerUrl']
    print('Connecting to', ws_url)
    
    async with websockets.connect(ws_url) as ws:
        # Enable Console and Runtime
        await ws.send(json.dumps({'id': 1, 'method': 'Runtime.enable'}))
        await ws.send(json.dumps({'id': 2, 'method': 'Log.enable'}))
        
        # Evaluate OpsPages.init()
        await ws.send(json.dumps({
            'id': 3,
            'method': 'Runtime.evaluate',
            'params': {
                'expression': 'try { OpsPages.init(); "OK"; } catch(e) { e.stack || e.message; }',
                'returnByValue': True
            }
        }))
        
        for _ in range(10):
            msg = await ws.recv()
            data = json.loads(msg)
            if data.get('id') == 3:
                print('EVAL RESULT:', json.dumps(data.get('result', {}), indent=2))
            elif data.get('method') == 'Runtime.exceptionThrown':
                print('EXCEPTION:', json.dumps(data, indent=2))
            elif data.get('method') == 'Runtime.consoleAPICalled':
                print('CONSOLE:', data['params'].get('type'), [a.get('value') for a in data['params'].get('args', [])])

asyncio.run(check_cdp())
