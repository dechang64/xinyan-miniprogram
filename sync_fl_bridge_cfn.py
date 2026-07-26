"""同步 fl_bridge 云函数到 .minimax reparse point."""
import sys, shutil, os, hashlib
sys.stdout.reconfigure(encoding="utf-8")

src = r"C:\Users\decha\.mavis\agents\mavis\workspace\xinyan-miniprogram\yueji-miniprogram-app\cloudfunctions\fl_bridge"
dst = r"C:\Users\decha\.minimax\agents\mavis\workspace\xinyan-miniprogram\yueji-miniprogram-app\cloudfunctions\fl_bridge"

if not os.path.exists(src):
    print(f"src not found: {src}")
    sys.exit(1)

if os.path.exists(dst):
    shutil.rmtree(dst)
shutil.copytree(src, dst)

for f in sorted(os.listdir(src)):
    src_p = os.path.join(src, f)
    dst_p = os.path.join(dst, f)
    if os.path.isfile(src_p) and os.path.isfile(dst_p):
        sh = hashlib.sha256(open(src_p, "rb").read()).hexdigest()[:12]
        dh = hashlib.sha256(open(dst_p, "rb").read()).hexdigest()[:12]
        mark = "OK" if sh == dh else "FAIL"
        print(f"  {f:25}  src={sh} dst={dh} {mark}")
