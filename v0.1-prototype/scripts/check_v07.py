"""v0.7 本地部署自检: 启 streamlit, 验主页 + 7 个 page, stderr 空 = OK"""
import subprocess, sys, time, urllib.request
from urllib.parse import quote

PORT = 8771
proc = subprocess.Popen(
    [sys.executable, "-m", "streamlit", "run", "app.py",
     "--server.port", str(PORT),
     "--server.headless", "true",
     "--browser.gatherUsageStats", "false",
     "--server.fileWatcherType", "none"],
    stdout=subprocess.PIPE, stderr=subprocess.PIPE, cwd=r"C:\Users\decha\.mavis\agents\mavis\workspace\xinyan_prototype"
)
print(f"[boot] pid={proc.pid} port={PORT}")

time.sleep(10)

def fetch(path):
    try:
        r = urllib.request.urlopen(f"http://localhost:{PORT}{path}", timeout=8)
        return r.status, len(r.read())
    except Exception as e:
        return -1, str(e)[:80]

pages = [
    "/",
    "/_stcore/health",
    "/1_%E6%AF%8F%E6%97%A5%E4%B8%80%E7%BB%8F",
    "/2_%E6%AF%8F%E6%97%A5%E4%B8%80%E6%B1%A4",
    "/3_%E5%85%B1%E4%BF%AE%E5%A0%82",
    "/4_%E9%95%9C%E4%B8%AD",
    "/6_%E4%BA%BA%E6%A0%BC%E7%94%BB%E5%83%8F",
    "/7_%E5%BF%83%E9%A2%9C%E4%B9%8B%E9%9F%B3",
    "/5_%E6%88%91%E7%9A%84",
]

for p in pages:
    print(f"[http] {p:<55} {fetch(p)}")

proc.terminate()
try:
    stdout, stderr = proc.communicate(timeout=5)
except subprocess.TimeoutExpired:
    proc.kill()
    stdout, stderr = proc.communicate()

err = stderr.decode('utf-8', errors='replace') if stderr else ''
out = stdout.decode('utf-8', errors='replace') if stdout else ''
print("=" * 60)
print("STDOUT tail:")
print(out[-1200:] if out else "(empty)")
print("STDERR tail:")
print(err[-1200:] if err else "(empty)")

err_patterns = ["Traceback", "ModuleNotFoundError", "SyntaxError", "TypeError", "ImportError", "AttributeError"]
hits = [p for p in err_patterns if p in err]
if hits:
    print(f"❌ STDERR has {hits}")
    sys.exit(1)
else:
    print("✅ stderr clean (no Traceback/Module/Syntax/Type/Import/Attribute)")