import subprocess, time, json, urllib.request, asyncio, websockets

edge = r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
proc = subprocess.Popen([
    edge,
    '--headless',
    '--remote-debugging-port=9222',
    '--disable-gpu',
    'http://localhost:8000'
])
time.sleep(2)

async def check_all():
    req = urllib.request.urlopen('http://localhost:9222/json')
    pages = json.loads(req.read().decode())
    target = next((p for p in pages if 'localhost:8000' in p.get('url', '')), None)
    
    async with websockets.connect(target['webSocketDebuggerUrl']) as ws:
        # Check initial load (Executive Overview)
        await ws.send(json.dumps({
            'id': 1,
            'method': 'Runtime.evaluate',
            'params': {
                'expression': 'JSON.stringify({ activePage: OpsPages.activePage, dateOptions: document.getElementById("globalDateFilter").options.length, kpis: Array.from(document.querySelectorAll(".kpi-card")).map(c => c.querySelector(".kpi-title")?.textContent + ": " + c.querySelector(".kpi-value")?.textContent) })',
                'returnByValue': True
            }
        }))
        msg = await ws.recv()
        data = json.loads(msg)
        print('1. EXECUTIVE OVERVIEW RENDER:', data.get('result', {}).get('result', {}).get('value'))
        
        # Test switching to Great Lakes page
        await ws.send(json.dumps({
            'id': 2,
            'method': 'Runtime.evaluate',
            'params': {
                'expression': 'OpsPages.renderPage("great-lakes"); JSON.stringify({ activePage: OpsPages.activePage, glKpis: Array.from(document.querySelectorAll(".kpi-card")).map(c => c.querySelector(".kpi-title")?.textContent + ": " + c.querySelector(".kpi-value")?.textContent), tableRows: document.getElementById("glTableBody")?.children.length, glGroupVisible: document.getElementById("greatLakesFilterGroup").style.display !== "none" })',
                'returnByValue': True
            }
        }))
        msg2 = await ws.recv()
        data2 = json.loads(msg2)
        print('2. GREAT LAKES PAGE RENDER:', data2.get('result', {}).get('result', {}).get('value'))

try:
    asyncio.run(check_all())
finally:
    proc.terminate()
