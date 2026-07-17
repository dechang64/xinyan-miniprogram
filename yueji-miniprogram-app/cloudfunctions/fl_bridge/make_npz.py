"""云函数 fl_bridge test_local.js helper: 生成 npz base64 给 Node 调用.

用法: python make_npz.py <seed>
输出: 一行 base64 字符串
"""
import sys

# 加入 v0.1-prototype/core 路径
sys.path.insert(0, r"C:\Users\decha\.mavis\agents\mavis\workspace\xinyan-miniprogram\v0.1-prototype\core")

from fl_bridge import make_demo_weights, encode_weights  # noqa: E402

seed = int(sys.argv[1]) if len(sys.argv) > 1 else 1
weights = make_demo_weights(seed=seed)
b64 = encode_weights(weights)
print(b64)
