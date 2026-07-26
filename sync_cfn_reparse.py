"""同步 fl_bridge 云函数到 .minimax reparse point + 验证 hash."""
import os, shutil, hashlib
import sys
sys.stdout.reconfigure(encoding="utf-8")

src = r"C:\Users\decha\.mavis\agents\mavis\workspace\xinyan-miniprogram\yueji-miniprogram-app\cloudfunctions\fl_bridge"
dst = r"C:\Users\decha\.minimax\agents\mavis\workspace\xinyan-miniprogram\yueji-miniprogram-app\cloudfunctions\fl_bridge"

if not os.path.exists(src):
    print(f"src not found: {src}")
    sys.exit(1)

if os.path.exists(dst):
    shutil.rmtree(dst)
shutil.copytree(src, dst)

ok = True
for f in sorted(os.listdir(src)):
    sp = os.path.join(src, f)
    dp = os.path.join(dst, f)
    if os.path.isfile(sp) and os.path.isfile(dp):
        sh = hashlib.sha256(open(sp, "rb").read()).hexdigest()[:12]
        dh = hashlib.sha256(open(dp, "rb").read()).hexdigest()[:12]
        mark = "OK" if sh == dh else "FAIL"
        if sh != dh:
            ok = False
        print(f"  {f:25}  src={sh} dst={dh} {mark}")

if ok:
    print("✅ 4 文件 hash 一致")
else:
    print("❌ hash 不一致")
    sys.exit(1)
