import json, urllib.request, asyncio, websockets

async def check_dom_content():
    req = urllib.request.urlopen('http://localhost:9222/json')
    pages = json.loads(req.read().decode())
    target = next((p for p in pages if 'localhost:8000' in p.get('url', '')), None)
    if not target:
        print('Target not found')
        return
    
    async with websockets.connect(target['webSocketDebuggerUrl']) as ws:
        # Evaluate innerHTML of #pageContentContainer and #globalDateFilter
        await ws.send(json.dumps({
            'id': 1,
            'method': 'Runtime.evaluate',
            'params': {
                'expression': 'JSON.stringify({ dateOptions: document.getElementById("globalDateFilter").options.length, containerLength: document.getElementById("pageContentContainer").innerHTML.length, kpiTitles: Array.from(document.querySelectorAll(".kpi-title")).map(e => e.textContent) })',
                'returnByValue': True
            }
        }))
        msg = await ws.recv()
        data = json.loads(msg)
        print('DOM STATUS:', data.get('result', {}).get('result', {}).get('value'))

asyncio.run(check_dom_content())
