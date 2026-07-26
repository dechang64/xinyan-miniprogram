"""同步 v3.1 阶段 20 fl_bridge 到 .minimax reparse point."""
import sys, shutil, os, hashlib
sys.stdout.reconfigure(encoding="utf-8")

src_root = r"C:\Users\decha\.mavis\agents\mavis\workspace\xinyan-miniprogram\v0.1-prototype\core"
dst_root = r"C:\Users\decha\.minimax\agents\mavis\workspace\xinyan-miniprogram\v0.1-prototype\core"

files_to_copy = [
    "fl_bridge.py",
    "fl_bridge_test.py",
    "fl_bridge_demo.py",
    "fl_bridge_README.md",
]
for f in files_to_copy:
    src = os.path.join(src_root, f)
    dst = os.path.join(dst_root, f)
    shutil.copy2(src, dst)
    sh = hashlib.sha256(open(src, "rb").read()).hexdigest()[:12]
    dh = hashlib.sha256(open(dst, "rb").read()).hexdigest()[:12]
    mark = "OK" if sh == dh else "FAIL"
    print(f"  {f:30}  src={sh} dst={dh} {mark}")

src_hf = os.path.join(src_root, "hf_space")
dst_hf = os.path.join(dst_root, "hf_space")
if os.path.exists(dst_hf):
    shutil.rmtree(dst_hf)
shutil.copytree(src_hf, dst_hf)
print("  hf_space/  整个目录 copy 完")

# 验证 3 处 hash 一致 (v0.1-prototype + xinyan_prototype + .minimax)
for f in files_to_copy:
    p1 = os.path.join(src_root, f)
    p3 = os.path.join(dst_root, f)
    h1 = hashlib.sha256(open(p1, "rb").read()).hexdigest()[:12]
    h3 = hashlib.sha256(open(p3, "rb").read()).hexdigest()[:12]
    print(f"  验证: {f:30}  .mavis={h1}  .minimax={h3}  {'OK' if h1 == h3 else 'FAIL'}")
