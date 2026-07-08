"""心颜 v0.7.1.5 严格部署审计 v4 — 静态扫描 + sxtwl 屏蔽 + 函数调用"""
import sys
import re


class FakeSxtwlMissing:
    def __getattr__(self, name):
        raise ImportError(f"No module named sxtwl.{name}")


sys.modules["sxtwl"] = FakeSxtwlMissing()
sys.modules["_sxtwl"] = None


print("=" * 60)
print("心颜 v0.7.1.5 严格审计 v4")
print("=" * 60)

# A. 关键 imports
print("\nA. 关键 imports:")
for mod in ["streamlit", "PIL", "lunardate"]:
    try:
        __import__(mod)
        print(f"  OK {mod}")
    except ImportError as e:
        print(f"  X {mod}: {e}")

# 清缓存
for mod in list(sys.modules.keys()):
    if mod.startswith("data.") or mod.startswith("core.") or mod.startswith("pages."):
        del sys.modules[mod]

sys.path.insert(0, r"C:\Users\decha\.mavis\agents\mavis\workspace\xinyan_prototype")

# B. 心颜模块 + page 6 6 tab 关键函数
print("\nB. 关键模块 + page 6 函数:")
from data.mbti import score_mbti, MBTI_16_TYPES, MBTI_8_QUESTIONS
from data.bazi import calc_bazi
from data.zodiac import calc_zodiac
from data.scales import phq9_score, gad7_score, scale_disclaimer_html, phq9_q9_alert_html
from data.tizhi import score_tizhi, TIZHI_9, TIZHI_9_QUESTIONS
from data.music import MUSIC_STYLES, generate_xinyan_music, DEMO_URLS
from core.config import BRAND_NAME, TIZHI_9 as C_TIZHI_9

tests = [
    ("MBTI score", lambda: score_mbti(["A", "B", "A", "B", "A", "B", "A", "B"])),
    ("MBTI 16型", lambda: len(MBTI_16_TYPES)),
    ("Bazi", lambda: calc_bazi(2026, 7, 7, 14)),
    ("Zodiac", lambda: calc_zodiac(2026, 7, 7, 14)),
    ("PHQ-9", lambda: phq9_score([0, 1, 2, 0, 1, 0, 0, 1, 1])),
    ("GAD-7", lambda: gad7_score([0, 1, 2, 0, 1, 0, 1])),
    ("Tizhi 9题", lambda: score_tizhi(["pinghe"] * 9)),
    ("Music DEMO", lambda: generate_xinyan_music("清润")),
    ("严守 HTML", lambda: scale_disclaimer_html()),
    ("Q9 banner", lambda: phq9_q9_alert_html([0] * 8 + [1])),
]
for name, fn in tests:
    try:
        r = fn()
        print(f"  OK {name}: {str(r)[:60]}")
    except Exception as e:
        print(f"  X {name}: {type(e).__name__}: {e}")

# C. 静态扫描: f-string + dict 嵌套 (v0.7.1.5 主修)
print("\nC. f-string + dict 嵌套扫描 (Streamlit TypeError 源):")
issues_total = 0
for page_name in ["1_每日一经", "2_每日一汤", "3_共修堂", "4_镜中", "5_我的", "6_人格画像", "7_心颜之音"]:
    fp = r"C:\Users\decha\.mavis\agents\mavis\workspace\xinyan_prototype\pages\\" + page_name + ".py"
    c = open(fp, encoding="utf-8").read()
    # f-string + [a-z]
    pattern = re.compile(r"""f['"][^'"]*\{[a-zA-Z_]+\[""")
    matches = list(pattern.finditer(c))
    if matches:
        issues_total += len(matches)
        for m in matches[:3]:
            line_num = c[: m.start()].count("\n") + 1
            line = c.split("\n")[line_num - 1]
            print(f"  X {page_name} L{line_num}: {line.strip()[:100]}")
    else:
        print(f"  OK {page_name}: 无 f-string + dict 嵌套")

if issues_total == 0:
    print("\n  ✓ 0 处 f-string + dict 嵌套 (Streamlit 渲染安全)")
else:
    print(f"\n  ✗ {issues_total} 处需要修复")

print("\n=" * 60)
print("审计完成")
print("=" * 60)