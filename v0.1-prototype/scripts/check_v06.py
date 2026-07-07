"""v0.6 本地部署自检: 启 streamlit, 验主页 / 5_我的 page, stderr 空 = OK"""
import subprocess, sys, time, urllib.request, socket
from urllib.parse import quote

PORT = 8770
proc = subprocess.Popen(
    [sys.executable, "-m", "streamlit", "run", "app.py",
     "--server.port", str(PORT),
     "--server.headless", "true",
     "--browser.gatherUsageStats", "false",
     "--server.fileWatcherType", "none"],
    stdout=subprocess.PIPE, stderr=subprocess.PIPE, cwd=r"C:\Users\decha\.minimax\agents\mavis\workspace\xinyan_prototype"
)
print(f"[boot] pid={proc.pid} port={PORT}")

time.sleep(8)

# 验主页 / healthz / 我的
def fetch(path):
    try:
        r = urllib.request.urlopen(f"http://localhost:{PORT}{path}", timeout=5)
        return r.status, len(r.read())
    except Exception as e:
        return -1, str(e)[:80]

print("[http] /            ", fetch("/"))
print("[http] /_stcore/health ", fetch("/_stcore/health"))
print("[http] /5_我的       ", fetch("/" + quote("5_我的")))

# 杀掉
proc.terminate()
try:
    stdout, stderr = proc.communicate(timeout=5)
except subprocess.TimeoutExpired:
    proc.kill()
    stdout, stderr = proc.communicate()

# stderr 检查
err = stderr.decode('utf-8', errors='replace') if stderr else ''
out = stdout.decode('utf-8', errors='replace') if stdout else ''
print("=" * 60)
print("STDOUT tail:")
print(out[-1500:] if out else "(empty)")
print("STDERR tail:")
print(err[-1500:] if err else "(empty)")

# 关键错误模式
err_patterns = ["Traceback", "ModuleNotFoundError", "SyntaxError", "TypeError", "ImportError"]
hits = [p for p in err_patterns if p in err]
if hits:
    print(f"❌ STDERR has {hits}")
    sys.exit(1)
else:
    print("✅ stderr clean (no Traceback/Module/Syntax/Type/Import)")