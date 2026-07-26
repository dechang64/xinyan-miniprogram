"""验证 .minimax reparse point 已同步 v3.1 阶段 20 fl_bridge"""
import sys, os, hashlib
sys.stdout.reconfigure(encoding="utf-8")

src_root = r"C:\Users\decha\.mavis\agents\mavis\workspace\xinyan-miniprogram"
dst_root = r"C:\Users\decha\.minimax\agents\mavis\workspace\xinyan-miniprogram"

src_files = [
    "v0.1-prototype/core/fl_bridge.py",
    "v0.1-prototype/core/fl_bridge_test.py",
    "v0.1-prototype/core/fl_bridge_demo.py",
    "v0.1-prototype/core/fl_bridge_README.md",
]
for f in src_files:
    src = os.path.join(src_root, f)
    dst = os.path.join(dst_root, f)
    if not os.path.exists(dst):
        print(f"  ❌ {f:50}  dst 不存在")
        continue
    sh = hashlib.sha256(open(src, "rb").read()).hexdigest()[:12]
    dh = hashlib.sha256(open(dst, "rb").read()).hexdigest()[:12]
    mark = "OK" if sh == dh else "FAIL"
    print(f"  {f:50}  src={sh} dst={dh} {mark}")

src_hf = os.path.join(src_root, "v0.1-prototype/core/hf_space")
dst_hf = os.path.join(dst_root, "v0.1-prototype/core/hf_space")
if os.path.exists(dst_hf):
    src_files_hf = sorted(os.listdir(src_hf))
    dst_files_hf = sorted(os.listdir(dst_hf))
    same = src_files_hf == dst_files_hf
    mark = "OK" if same else "DIFF"
    print(f"  hf_space/  src={len(src_files_hf)} files  dst={len(dst_files_hf)} files  {mark}")
    for f in src_files_hf:
        if f == "__pycache__":
            continue
        src_p = os.path.join(src_hf, f)
        dst_p = os.path.join(dst_hf, f)
        if os.path.isfile(src_p) and os.path.isfile(dst_p):
            sh = hashlib.sha256(open(src_p, "rb").read()).hexdigest()[:12]
            dh = hashlib.sha256(open(dst_p, "rb").read()).hexdigest()[:12]
            m = "OK" if sh == dh else "FAIL"
            print(f"    {f:38}  src={sh} dst={dh} {m}")
