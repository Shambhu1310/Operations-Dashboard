import subprocess, os

edge_paths = [
    r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe',
    r'C:\Program Files\Microsoft\Edge\Application\msedge.exe'
]

edge = next((p for p in edge_paths if os.path.exists(p)), None)
if not edge:
    print('No edge found')
    exit(1)

print('Using Edge:', edge)
cmd = [edge, '--headless', '--virtual-time-budget=5000', '--dump-dom', 'http://localhost:8000']
res = subprocess.run(cmd, capture_output=True, text=True, timeout=25)

print('DOM length:', len(res.stdout))
if 'Average Waiting Time' in res.stdout:
    print('SUCCESS: Executive Overview rendered properly!')
    # Check if Great Lakes button exists
    print('Has Great Lakes button:', 'Great Lakes' in res.stdout)
    print('Has Date filter options:', '2026-08-10' in res.stdout)
    print('Has KPI values:', 'Passenger waiting' in res.stdout)
else:
    print('Output text:')
    print(res.stdout)
