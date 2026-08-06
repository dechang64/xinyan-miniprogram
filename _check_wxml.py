import sys
sys.stdout.reconfigure(encoding="utf-8")
p = r"C:\Users\decha\.mavis\agents\mavis\workspace\xinyan-miniprogram\yueji-miniprogram-app\pages\8_4经数字人\8_4经数字人.wxml"
with open(p, "r", encoding="utf-8") as f:
    c = f.read()
old = '<nav-bar title="4经数字人" showHome="{{true}}" />'
print(f"old in c: {old in c}")
print(f"L9 repr: {repr(c.split(chr(10))[8])}")
# 找所有 4经位置
for line_no, line in enumerate(c.split("\n"), 1):
    if "4经" in line:
        print(f"L{line_no}: {line[:120]}")
