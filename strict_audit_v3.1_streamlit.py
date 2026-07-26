"""悦济 v3.1 阶段 19 Streamlit 端严格审计 — 14 严守 + 12 玄学 + 15 危机 + 4 红线
v0.1-prototype/ Streamlit 端专用, 跟微信小程序 strict_audit_v1.1.py 配套
"""
import os
import re
import sys
# 强制 UTF-8 输出, 避免 Windows GBK 编码报错
try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

# 配置 — 改这个变量切到不同项目
ROOT = r"C:\Users\decha\.mavis\agents\mavis\workspace\xinyan-miniprogram\v0.1-prototype"

# 14 严守词 (医疗/妆护/医械/营销)
FORBIDDEN_14 = [
    '治疗', '改善', '缓解', '治愈', '祛斑', '减肥', '处方', '医美',
    '美颜', '美白', '瘦脸', '营销', '广告', '疗愈',
]

# 12 玄学红线 (v3.1 阶段 8 严守修订补, 之前 audit 漏了)
XUANXUE_12 = [
    '命理', '占星', '八字', '星盘', '算命', '转运',
    '化解', '风水', '玄学', '五行', '生克', '补泻',
]

# 15 危机词 (触发 12356)
CRISIS_15 = [
    '不想活', '自杀', '轻生', '想死', '活不下去',
    '结束生命', '自残', '割腕', '跳楼', '上吊',
    '服药过量', '绝望', '没意义', '没人需要我', '解脱',
]

# 4 大红线文件名 (8 字 / 星盘 / 命理 / 玄学, 必须删)
REDLINE_FILES = [
    'data/bazi.py',          # 8 字
    'data/zodiac.py',        # 12 星座
    'data/xuanxue.py',      # 玄学
    'data/mingli.py',       # 命理
]

# 必备文件 (v0.1-prototype v3.1 阶段 19 必备)
REQUIRED_FILES = [
    'app.py',
    'pages/1_每日一经.py',
    'pages/2_每日一汤.py',
    'pages/3_共修堂.py',
    'pages/4_镜中.py',
    'pages/5_我的.py',
    'pages/7_悦济之音.py',
    'data/music.py',
    'data/fl_mock.py',
    'data/tizhi.py',
    'data/food_9.py',
    'data/soups_30.py',
    'data/jingwen_30.py',
    'core/config.py',
    'requirements.txt',
]

# 扫描后缀
SCAN_EXT = ('.py', '.json', '.md', '.txt', '.toml')

# 排除目录
EXCLUDE_DIRS = ['__pycache__', 'node_modules', '.git', '.streamlit', '__MACOSX']


def collect_files(root):
    """收集所有要扫描的文件"""
    files = []
    for dirpath, dirnames, filenames in os.walk(root):
        # 排除目录
        dirnames[:] = [d for d in dirnames if d not in EXCLUDE_DIRS]
        for fn in filenames:
            if fn.endswith(SCAN_EXT):
                files.append(os.path.join(dirpath, fn))
    return files


def scan_text(path, words, label):
    """扫描文件里所有 word, 返回 (word, line_number, line_text) 列表

    排除规则 (减少 false positive):
    - 注释行 (# 或 // 开头)
    - 自我防护行 (BANNED_TERMS / 严守 8 禁用词 / 严守 6 条意见 / 严守: 营销词 0 出现 / 严守基调 / 严守预审 / 不用 X / 不写 X / 不出现 X / 严守 严守)
    - 字符串字面量列表 (["治疗", "改善", ...] 这种 array)
    """
    import re
    hits = []
    # 自我防护模式 (排除)
    self_protect_patterns = [
        re.compile(r'BANNED_TERMS\s*='),
        re.compile(r'严守[：:]?\s*[\d]*\s*禁'),
        re.compile(r'严守\s*6\s*条'),
        re.compile(r'严守[：:]?\s*营销'),
        re.compile(r'严守基调'),
        re.compile(r'严守预审'),
        re.compile(r'严守[：:]'),
        re.compile(r'不[用写出现].*医疗'),
        re.compile(r'不[用写出现].*营销'),
        re.compile(r'严守.*\d+\s*禁用'),
    ]
    # 字符串数组模式 (BANNED 字面量列表)
    string_array_pattern = re.compile(r'\[\s*[\"\'].*[\"\']\s*,\s*[\"\']')

    try:
        with open(path, 'r', encoding='utf-8') as f:
            for i, line in enumerate(f, 1):
                stripped = line.strip()
                # 跳过单行注释
                if stripped.startswith('#') or stripped.startswith('//'):
                    continue
                # 跳过 docstring 行 (""" 或 ''' 包围的)
                if stripped.startswith('"""') or stripped.startswith("'''"):
                    continue
                # 跳过自我防护模式
                is_self_protect = False
                for pat in self_protect_patterns:
                    if pat.search(line):
                        is_self_protect = True
                        break
                if is_self_protect:
                    continue
                # 跳过字符串数组 (BANNED_TERMS 字面量)
                if string_array_pattern.search(line) and 'BANNED' in line.upper():
                    continue
                # 跳过 BANNED 字面量数组 ("治疗", "改善", ...)
                if '"治疗"' in line and '"改善"' in line:
                    continue
                for w in words:
                    if w in line:
                        hits.append((w, i, line.rstrip()))
    except (UnicodeDecodeError, PermissionError):
        pass
    return hits


def main():
    print('=' * 70)
    print('悦济 v3.1 阶段 19 Streamlit 端严格审计')
    print('  14 严守 + 12 玄学 + 15 危机 + 4 红线')
    print('=' * 70)
    print(f'扫描根目录: {ROOT}')
    print()

    files = collect_files(ROOT)
    print(f'扫描 {len(files)} 个文件 (.py / .json / .md / .txt / .toml)')
    print()

    # A. 必备文件检查
    print('A. 必备文件检查:')
    A_OK = 0
    A_FAIL = 0
    for rf in REQUIRED_FILES:
        full = os.path.join(ROOT, rf)
        if os.path.exists(full):
            print(f'  [OK] {rf}')
            A_OK += 1
        else:
            print(f'  [FAIL] {rf} (缺失)')
            A_FAIL += 1
    print(f'  A: {A_OK} OK / {A_FAIL} FAIL')
    print()

    # B. 4 大红线文件 (必须不存在)
    print('B. 4 大红线文件检查 (必须删除):')
    B_OK = 0
    B_FAIL = 0
    for rf in REDLINE_FILES:
        full = os.path.join(ROOT, rf)
        if not os.path.exists(full):
            print(f'  [OK] {rf} (已删除)')
            B_OK += 1
        else:
            print(f'  [FAIL] {rf} (必须删除, 12 玄学红线冲突)')
            B_FAIL += 1
    print(f'  B: {B_OK} OK / {B_FAIL} FAIL')
    print()

    # C. 14 严守字串
    print('C. 14 严守字串扫描:')
    C_HITS = 0
    for path in files:
        hits = scan_text(path, FORBIDDEN_14, 'FORBIDDEN_14')
        for w, line, text in hits:
            rel = os.path.relpath(path, ROOT)
            print(f'  [X] {rel}:{line} [{w}] {text[:80]}')
            C_HITS += 1
    if C_HITS == 0:
        print('  [OK] 0 命中 (14 严守字串)')
    print(f'  C: {C_HITS} 命中')
    print()

    # D. 12 玄学红线 (v3.1 阶段 8 严守修订补)
    print('D. 12 玄学红线扫描:')
    D_HITS = 0
    for path in files:
        hits = scan_text(path, XUANXUE_12, 'XUANXUE_12')
        for w, line, text in hits:
            rel = os.path.relpath(path, ROOT)
            print(f'  [X] {rel}:{line} [{w}] {text[:80]}')
            D_HITS += 1
    if D_HITS == 0:
        print('  [OK] 0 命中 (12 玄学红线)')
    print(f'  D: {D_HITS} 命中')
    print()

    # E. 15 危机词
    print('E. 15 危机词扫描:')
    E_HITS = 0
    for path in files:
        hits = scan_text(path, CRISIS_15, 'CRISIS_15')
        for w, line, text in hits:
            rel = os.path.relpath(path, ROOT)
            print(f'  [X] {rel}:{line} [{w}] {text[:80]}')
            E_HITS += 1
    if E_HITS == 0:
        print('  [OK] 0 命中 (15 危机词, 不算提示词)')
    print(f'  E: {E_HITS} 命中')
    print()

    # 总结
    print('=' * 70)
    total_fail = A_FAIL + B_FAIL + C_HITS + D_HITS + E_HITS
    if total_fail == 0:
        print('[ALL OK] 14 严守 + 12 玄学 + 15 危机 + 4 红线 0 命中')
    else:
        print(f'[WARN] {total_fail} 项不通过:')
        print(f'   A 必备文件: {A_FAIL} FAIL')
        print(f'   B 4 大红线文件: {B_FAIL} FAIL')
        print(f'   C 14 严守字串: {C_HITS} 命中')
        print(f'   D 12 玄学红线: {D_HITS} 命中')
        print(f'   E 15 危机词: {E_HITS} 命中')
    print('=' * 70)
    sys.exit(0 if total_fail == 0 else 1)


if __name__ == '__main__':
    main()
