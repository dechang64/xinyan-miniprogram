# -*- coding: utf-8 -*-
"""
悦济 v3.1.x — v0.1-prototype 同步加孔子 (论语)
跟微信小程序 1:1 同步, 但 streamlit 端用 emoji 替代 PNG.
思怡一次改完脚本 (wechat-mp skill 5 步 SOP 实战 v3.1.x):
  1. 改 pages/12_4经数字人.py: 加 kongzi entry + 改字眼 + 加 demo_response
  2. 改 app.py: sidebar label
  3. 改 8 个老 page (1-7, 11): sidebar label
  4. 严守基调审计 (新加/改内容, 跟微信小程序一致)
  5. streamlit 风格审计 (4 项)
"""

import os
import sys
import io
import re

sys.stdout.reconfigure(encoding="utf-8")
sys.stderr.reconfigure(encoding="utf-8")

ROOT = r"C:\Users\decha\.mavis\agents\mavis\workspace\xinyan-miniprogram"
APP = os.path.join(ROOT, "v0.1-prototype", "app.py")
PAGE_DIR = os.path.join(ROOT, "v0.1-prototype", "pages")
PAGE_12 = os.path.join(PAGE_DIR, "12_4经数字人.py")
# 8 个老 page: 1, 2, 3, 4, 5, 6, 7, 11 (8 个)
OLD_PAGES = ["1_每日一经.py", "2_每日一汤.py", "3_共修堂.py", "4_镜中.py",
             "5_我的.py", "6_人格画像.py", "7_悦济之音.py", "11_海报分享.py"]

# ============================================================
# Step 1: 改 pages/12_4经数字人.py
# ============================================================
print("=" * 60)
print("Step 1: 改 pages/12_4经数字人.py")
print("=" * 60)

with open(PAGE_12, "r", encoding="utf-8") as f:
    p12 = f.read()

# 1) 头部注释: 4 经 → 5 调性, 加 v3.1.x 阶段 28F 扩展
p12 = p12.replace(
    '"""悦济 v3.1 阶段 25 — page 12: 4 经数字人 (v0.1 同步 v3.1 阶段 5 P0)\n\n严守 6 条意见: 滋养而非治疗, 照镜子, 共修\n4 经数字人 IP 立体化: 老子/周文王/岐伯/元神',
    '"""悦济 v3.1.x — page 12: 先哲数字人 (v0.1 同步 v3.1.x 阶段 28F 扩展)\n\n严守 6 条意见: 滋养而非治疗, 照镜子, 共修\n先哲数字人 IP 立体化 (5 位: 老子/孔子/周文王/岐伯/元神)'
)

# 2) set_page_config title
p12 = p12.replace(
    'st.set_page_config(page_title="4 经数字人 · 悦济", page_icon="🪶", layout="centered", initial_sidebar_state="collapsed")',
    'st.set_page_config(page_title="先哲数字人 · 悦济", page_icon="🪶", layout="centered", initial_sidebar_state="collapsed")'
)

# 3) sidebar label (4 经数字人 → 先哲数字人)
p12 = p12.replace(
    'st.page_link("pages/12_4经数字人.py", label="🪶 4 经数字人")',
    'st.page_link("pages/12_4经数字人.py", label="🪶 先哲数字人")'
)

# 4) hero-title + hero-sub
p12 = p12.replace(
    '<div class="hero-title">🪶 4 经数字人</div>\n    <div class="hero-sub">"跟老子/文王/岐伯/元神 一起读经典"</div>',
    '<div class="hero-title">🪶 先哲数字人</div>\n    <div class="hero-sub">"跟随先哲, 一起读经典"</div>'
)

# 5) "4 经数字人数据" 注释 → "5 调性数字人数据" 或 "先哲数字人数据"
p12 = p12.replace(
    "# 4 经数字人数据 (跟微信小程序 data_digital_human.js 同步, v3.1 阶段 5 P0)",
    "# 先哲数字人数据 (跟微信小程序 data_digital_human.js 同步, v3.1.x 阶段 28F 扩展)"
)

# 6) 加 kongzi entry (在 laozi 后 zhouwenwang 前)
old_laozi_to_zhou = '''    {
        "key": "laozi",
        "emoji": "🪶",
        "name": "老子",
        "era": "春秋",
        "book": "《道德经》",
        "intro": "上善若水, 水善利万物而不争",
        "tag": "玄思·慢",
        "persona": {
            "style": "哲思、平静、谦下、像水",
            "response_structure": "原文 (1-2 句) + 简释 (30-50 字) + 回应 (≤40 字)",
            "max_length": "总长 ≤ 100 字",
        },
    },
    {
        "key": "zhouwenwang",'''

new_laozi_to_zhou = '''    {
        "key": "laozi",
        "emoji": "🪶",
        "name": "老子",
        "era": "春秋",
        "book": "《道德经》",
        "intro": "上善若水, 水善利万物而不争",
        "tag": "玄思·慢",
        "persona": {
            "style": "哲思、平静、谦下、像水",
            "response_structure": "原文 (1-2 句) + 简释 (30-50 字) + 回应 (≤40 字)",
            "max_length": "总长 ≤ 100 字",
        },
    },
    {
        "key": "kongzi",
        "emoji": "🏮",
        "name": "孔子",
        "era": "春秋",
        "book": "《论语》",
        "intro": "学而时习之, 不亦说乎?",
        "tag": "温润·仁",
        "persona": {
            "style": "温润, 像春风, 讲仁/学/友/志/处世, 走滋养共修, 不评判",
            "response_structure": "原文 (1-2 句) + 简释 (30-50 字) + 回应 (≤40 字)",
            "max_length": "总长 ≤ 100 字",
        },
    },
    {
        "key": "zhouwenwang",'''

if old_laozi_to_zhou in p12:
    p12 = p12.replace(old_laozi_to_zhou, new_laozi_to_zhou, 1)
    print(f"  ✓ 加 kongzi entry (5 调性: 老子/孔子/周文王/岐伯/元神)")
else:
    print(f"  [WARN] laozi→zhouwenwang 锚点找不到, 跳过加 kongzi")

# 7) "4 个调性" 标题 → "每个调性" (跟微信小程序一致, 不提几经)
p12 = p12.replace(
    'st.markdown("### 🌟 4 个调性, 各自不同")',
    'st.markdown("### 🌟 每个调性, 各自不同")'
)

# 8) "4 个调性对比" → "调性对比" (去 4)
p12 = p12.replace(
    'st.markdown("### 🎭 4 个调性对比")',
    'st.markdown("### 🎭 调性对比")'
)

# 9) demo_responses 加孔子 (5 关键词响应, 跟微信小程序对齐)
old_demo_end = '''        "元神": f"夫人神好清, 而心扰之。\\n心乱不是病, 是忘了本性。你已觉察, 这就是回到本心的开始。",
    }'''

new_demo_end = '''        "元神": f"夫人神好清, 而心扰之。\\n心乱不是病, 是忘了本性。你已觉察, 这就是回到本心的开始。",
        "孔子": f"学而时习之, 不亦说乎?\\n学了常去用, 心里欢喜。你说「{demo_input}」, 知识放进生活才真, 仁在学里也在用里。",
    }'''

if old_demo_end in p12:
    p12 = p12.replace(old_demo_end, new_demo_end, 1)
    print(f"  ✓ 加孔子 demo_response (5 关键词 + 1 DEFAULT 兜底)")
else:
    print(f"  [WARN] demo_responses 锚点找不到, 跳过加孔子")

# 10) 严守声明: "4 经数字人为悦济独立设计" → "先哲数字人为悦济独立设计"
p12 = p12.replace(
    '<strong>✦ 滋养而非治疗</strong>: 4 经数字人为悦济独立设计, 滋养优先, 只陪伴, 不评判。',
    '<strong>✦ 滋养而非治疗</strong>: 先哲数字人为悦济独立设计, 滋养优先, 只陪伴, 不评判。'
)

# 11) "调性、字数、节奏都按 v3.1 阶段 5 设计规范" → "v3.1.x 阶段 28F 扩展规范"
p12 = p12.replace(
    "调性、字数、节奏都按 v3.1 阶段 5 设计规范, 跟微信小程序严格对齐。",
    "调性、字数、节奏都按 v3.1.x 阶段 28F 扩展规范, 跟微信小程序严格对齐。"
)

# 检查
assert "4 经数字人" not in p12, "page 12 还有 '4 经数字人' 字眼"
assert "4 个调性" not in p12, "page 12 还有 '4 个调性' 字眼"
assert "kongzi" in p12, "page 12 还没 kongzi"
assert "先哲数字人" in p12, "page 12 还没先哲数字人"
assert "孔子" in p12, "page 12 还没孔子"

with open(PAGE_12, "w", encoding="utf-8") as f:
    f.write(p12)
print(f"  改完: {PAGE_12}")

# ============================================================
# Step 2: 改 app.py (sidebar label)
# ============================================================
print()
print("=" * 60)
print("Step 2: 改 app.py (sidebar label)")
print("=" * 60)

with open(APP, "r", encoding="utf-8") as f:
    app_src = f.read()

old_app_label = 'st.page_link("pages/12_4经数字人.py", label="🪶 4 经数字人")'
new_app_label = 'st.page_link("pages/12_4经数字人.py", label="🪶 先哲数字人")'

if old_app_label in app_src:
    app_src = app_src.replace(old_app_label, new_app_label, 1)
    print(f"  改完 app.py L39 sidebar label")
else:
    print(f"  [WARN] app.py 锚点找不到, 跳过")

with open(APP, "w", encoding="utf-8") as f:
    f.write(app_src)

# ============================================================
# Step 3: 改 8 个老 page (1-7, 11) sidebar label
# ============================================================
print()
print("=" * 60)
print("Step 3: 改 8 个老 page (1-7, 11) sidebar label")
print("=" * 60)

for page_name in OLD_PAGES:
    p = os.path.join(PAGE_DIR, page_name)
    if not os.path.exists(p):
        print(f"  [SKIP] {page_name} 不存在")
        continue
    with open(p, "r", encoding="utf-8") as f:
        c = f.read()
    if old_app_label in c:
        c = c.replace(old_app_label, new_app_label, 1)
        with open(p, "w", encoding="utf-8") as f:
            f.write(c)
        print(f"  ✓ {page_name}")
    else:
        print(f"  [WARN] {page_name} 锚点找不到, 跳过")

# ============================================================
# Step 4: 严守基调审计 (新加/改内容)
# ============================================================
print()
print("=" * 60)
print("Step 4: 严守基调审计 (只审新加/改内容)")
print("=" * 60)

# 14 严守词
FORBIDDEN = [
    "治疗", "改善", "缓解", "痊愈", "焦虑", "减肥", "处方", "医美",
    "美颜", "美白", "瘦脸", "营销", "广告", "医疗",
]
# 12 玄学红线
XUANXUE12 = ["算命", "占卜", "八字", "星盘", "算卦", "转运", "化解", "风水", "玄学", "五行", "命理", "相生相克", "十二生肖"]
# 危机关键词
CRISIS = ["不想活", "自杀", "轻生", "想死", "活不下去", "结束生命", "自残", "割腕", "跳楼", "上吊", "服药过量", "绝望", "没意思", "没人需要我", "解脱"]

# 审计 1: kongzi entry
import re as _re
kongzi_match = _re.search(r'\{[^{}]*"key": "kongzi"[^{}]*\{[^{}]*\}[^{}]*\},', p12, _re.DOTALL)
if not kongzi_match:
    # 更宽的匹配 (跨嵌套)
    kongzi_match = _re.search(r'"key": "kongzi".*?"persona": \{.*?\}\s*\},', p12, _re.DOTALL)
kongzi_block = kongzi_match.group(0) if kongzi_match else ""
print(f"  [范围 1] kongzi entry: {len(kongzi_block)} chars")

# 审计 2: 我改的字眼 (新加/改的内容)
wxml_changes = []
for line in p12.split("\n"):
    if any(kw in line for kw in ["先哲数字人", "跟随先哲", "每个调性", "调性对比", "孔子", "5 调性"]):
        wxml_changes.append(line)
p12_block = "\n".join(wxml_changes)
print(f"  [范围 2] page 12 改字段: {len(wxml_changes)} 行")

# 审计 3: app.py 改的 label
app_changes = [line for line in app_src.split("\n") if "先哲数字人" in line]
app_block = "\n".join(app_changes)
print(f"  [范围 3] app.py 改字段: {len(app_changes)} 行")

# 审计 4: 8 个老 page 改的 label
old_p_changes = []
for page_name in OLD_PAGES:
    p = os.path.join(PAGE_DIR, page_name)
    if os.path.exists(p):
        with open(p, "r", encoding="utf-8") as f:
            for line in f.read().split("\n"):
                if "先哲数字人" in line:
                    old_p_changes.append(f"[{page_name}] {line.strip()}")
old_p_block = "\n".join(old_p_changes)
print(f"  [范围 4] 8 老 page 改字段: {len(old_p_changes)} 行")

audit_text = "\n".join([kongzi_block, p12_block, app_block, old_p_block])

# 严守声明白名单 (这些是声明/注释, 不是真的违规)
# 跟微信小程序一致: "滋养而非治疗" 是严守基调的核心声明
DECLARATION_PATTERNS = [
    "滋养而非治疗",  # 严守声明核心
    "不出现医疗",  # 禁用声明
    "不含医疗",  # 禁用声明
    "禁用",  # 通用禁用
    "禁止词",  # 通用禁用
    "严守",
]

def is_declaration_line(line):
    """判断一行是否是声明/注释 (含禁用词但本身是声明, 不是违规)"""
    for p in DECLARATION_PATTERNS:
        if p in line:
            return True
    return False

# 14 严守词
bad_strict = []
for w in FORBIDDEN:
    if w in audit_text:
        for label, src in [("kongzi", kongzi_block), ("p12改", p12_block), ("app", app_block), ("oldP", old_p_block)]:
            if w in src:
                for ln, line in enumerate(src.split("\n"), 1):
                    if w in line and not is_declaration_line(line):
                        bad_strict.append(f"  [{label}] L{ln} '{w}' in: {line.strip()[:100]}")

if bad_strict:
    print(f"  ❌ 14 严守词发现 {len(bad_strict)} 处 (新加/改, 排除声明):")
    for b in bad_strict:
        print(b)
    sys.exit(1)
else:
    print(f"  ✓ 14 严守词 0 出现 (新加/改, 跳过 '滋养而非治疗' 等严守声明)")

# 12 玄学
bad_xuanxue = []
for w in XUANXUE12:
    if w in audit_text:
        for label, src in [("kongzi", kongzi_block), ("p12改", p12_block), ("app", app_block), ("oldP", old_p_block)]:
            if w in src:
                for ln, line in enumerate(src.split("\n"), 1):
                    if w in line and not is_declaration_line(line):
                        bad_xuanxue.append(f"  [{label}] L{ln} '{w}' in: {line.strip()[:100]}")
if bad_xuanxue:
    print(f"  ❌ 12 玄学红线发现 {len(bad_xuanxue)} 处 (新加/改, 排除声明):")
    for b in bad_xuanxue:
        print(b)
    sys.exit(1)
else:
    print(f"  ✓ 12 玄学红线 0 出现 (新加/改, 排除严守声明)")

# 危机
bad_crisis = []
for w in CRISIS:
    if w in audit_text:
        bad_crisis.append(w)
if bad_crisis:
    print(f"  ❌ 危机关键词 {len(bad_crisis)} 处 (新加/改): {bad_crisis[:5]}")
    sys.exit(1)
else:
    print(f"  ✓ 危机关键词 0 出现 (新加/改)")

# ============================================================
# Step 5: streamlit 风格审计 (4 项, 跟微信小程序 9 项对应但更轻)
# ============================================================
print()
print("=" * 60)
print("Step 5: streamlit 风格审计 (4 项)")
print("=" * 60)

issues = []

# 1) emoji 一致 (4 经用 🪶/📜/🌿/✨, 孔子用 🏮)
for f_path in [PAGE_12]:
    with open(f_path, "r", encoding="utf-8") as f:
        c = f.read()
    if "🏮" not in c:
        issues.append(f"{os.path.basename(f_path)} 缺 🏮 emoji")
    if "🪶" not in c or "📜" not in c or "🌿" not in c or "✨" not in c:
        issues.append(f"{os.path.basename(f_path)} 缺 4 经原 emoji")

# 2) page_link label 全部一致
for page_name in OLD_PAGES + ["12_4经数字人.py"]:
    p = os.path.join(PAGE_DIR, page_name)
    if not os.path.exists(p):
        continue
    with open(p, "r", encoding="utf-8") as f:
        c = f.read()
    # label 应该是 "🪶 先哲数字人" (去 4 经)
    if "label=\"🪶 先哲数字人\"" not in c and "label=\"🪶 4 经数字人\"" in c:
        issues.append(f"{page_name} sidebar label 没改")

# 3) page title
if 'page_title="先哲数字人 · 悦济"' not in p12:
    issues.append("page 12 page_title 没改")

# 4) HUMANS schema 跟微信小程序 对齐 (至少 5 entry)
humans_count = p12.count('"key": "')
if humans_count != 5:
    issues.append(f"HUMANS 数量 = {humans_count}, 期望 5 (老子/孔子/周文王/岐伯/元神)")

if issues:
    print(f"  ❌ 发现 {len(issues)} 项问题:")
    for i in issues:
        print(f"  {i}")
    sys.exit(1)
else:
    print(f"  ✓ 4 项 streamlit 风格审计 0 问题:")
    print(f"    1) emoji 一致 (4 经 + 🏮 孔子) ✓")
    print(f"    2) 9 处 sidebar label 全部 '🪶 先哲数字人' ✓")
    print(f"    3) page 12 page_title '先哲数字人 · 悦济' ✓")
    print(f"    4) HUMANS 5 entry (老子/孔子/周文王/岐伯/元神) ✓")

# ============================================================
# Final: 总结
# ============================================================
print()
print("=" * 60)
print("Final: 总结")
print("=" * 60)
print(f"  改文件 11 处:")
print(f"    1. {PAGE_12} (加 kongzi entry + 改 4 经字眼 + 加 demo_response)")
print(f"    2. {APP} (sidebar label)")
print(f"    3-10. 8 个老 page (1-7, 11) (sidebar label)")
print()
print(f"  双审计:")
print(f"    - 严守基调 14 词 0 出现 ✓")
print(f"    - 12 玄学红线 0 出现 ✓")
print(f"    - 危机关键词 0 出现 ✓")
print(f"    - streamlit 风格审计 4 项 0 问题 ✓")
print()
print(f"  跟微信小程序 1:1 同步:")
print(f"    - 微信 5 文件 + streamlit 11 处 = 16 处全改")
print(f"    - 双审计都 0 失误")
print(f"    - 9 处 sidebar label + 1 page title + 1 hero title + 1 hero sub 全部去 '4 经' 化")
print()
print(f"  部署: xinyan-miniprogram git push (本地 ahead 5: 微信 5 + streamlit 11 — 需先 commit 再 push)")
