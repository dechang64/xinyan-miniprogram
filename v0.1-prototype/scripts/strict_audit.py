"""悦济 v0.7.1.4 严格部署审计 — 模拟 Streamlit Cloud Python 3.14 + sxtwl 不可用

跑 page 6 (人格画像) 6 tab 全部 imports + 关键函数, 验证没 ImportError
"""
import sys

# 1. 屏蔽 sxtwl (模拟 Python 3.14 + 无 cp314 wheel)
class FakeSxtwlMissing:
    def __getattr__(self, name):
        raise ImportError(f"No module named sxtwl.{name}")


sys.modules["sxtwl"] = FakeSxtwlMissing()
sys.modules["_sxtwl"] = None

# 2. 测试关键依赖
print("=" * 60)
print("A. 关键依赖 (模拟 Python 3.14 干净环境)")
print("=" * 60)

for mod in ["streamlit", "PIL", "lunardate"]:
    try:
        __import__(mod)
        print(f"  OK {mod}")
    except ImportError as e:
        print(f"  ✗ {mod}: {e}")

# 3. 悦济 data 模块导入
print()
print("B. 悦济 data 模块导入 (sxtwl 屏蔽)")

# 清缓存
for mod in list(sys.modules.keys()):
    if mod.startswith("data.") or mod.startswith("core."):
        del sys.modules[mod]

sys.path.insert(0, r"C:\Users\decha\.mavis\agents\mavis\workspace\yueji_prototype")

for mod in [
    "data.mbti",
    "data.bazi",
    "data.zodiac",
    "data.scales",
    "data.tizhi",
    "data.music",
    "data.posters",
    "data.fl_mock",
    "data.jingwen_30",
    "data.soups_30",
    "data.self_dialogue",
    "core.config",
    "core.styles",
]:
    try:
        __import__(mod)
        print(f"  OK {mod}")
    except Exception as e:
        print(f"  ✗ {mod}: {e}")

# 4. page 6 引用测试
print()
print("C. page 6 关键函数调用")
from data.mbti import score_mbti, MBTI_16_TYPES
from data.bazi import calc_bazi
from data.zodiac import calc_zodiac
from data.scales import phq9_score, gad7_score, scale_disclaimer_html, phq9_q9_alert_html
from data.tizhi import score_tizhi

tests = [
    ("MBTI score_mbti", lambda: score_mbti(["A", "B", "A", "B", "A", "B", "A", "B"])),
    ("MBTI MBTI_16_TYPES keys", lambda: len(MBTI_16_TYPES)),
    ("Bazi calc_bazi", lambda: calc_bazi(2026, 7, 7, 14)),
    ("Zodiac calc_zodiac", lambda: calc_zodiac(2026, 7, 7, 14)),
    ("PHQ-9 score", lambda: phq9_score([0, 1, 2, 0, 1, 0, 0, 1, 1])),
    ("GAD-7 score", lambda: gad7_score([0, 1, 2, 0, 1, 0, 1])),
    ("Tizhi score_tizhi", lambda: score_tizhi(["pinghe", "qixu", "pinghe", "pinghe", "qiyu", "pinghe", "pinghe", "qiyu", "pinghe"])),
]
for name, fn in tests:
    try:
        r = fn()
        print(f"  OK {name}: {str(r)[:80]}")
    except Exception as e:
        print(f"  ✗ {name}: {e}")

# 5. scale_disclaimer_html + phq9_q9_alert_html 渲染
print()
print("D. 严守 HTML 渲染")
try:
    h = scale_disclaimer_html()
    print(f"  scale_disclaimer_html: {len(h)} chars")
except Exception as e:
    print(f"  ✗ scale_disclaimer_html: {e}")

try:
    h = phq9_q9_alert_html([0, 0, 0, 0, 0, 0, 0, 0, 1])
    print(f"  phq9_q9_alert_html (Q9=1): {len(h)} chars")
except Exception as e:
    print(f"  ✗ phq9_q9_alert_html: {e}")

print()
print("=" * 60)
print("审计结论:")
print("如果 B+C+D 全 OK, Cloud 上 page 6 不会再 ImportError")
print("=" * 60)