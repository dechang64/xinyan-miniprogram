"""
悦济 海报 SVG 装饰库 (v0.7.1.7.1)
v0.7.1.7.1 升级: 装饰高度 60→100, 加左右卷轴边饰, viewBox 扩展, 字号放大

为 6 个海报模板提供 顶部/底部/左右 意境 SVG 装饰

严守基调: 滋养/共修/涵养/清润/温润, 不出现美颜/美白/医美等营销/医疗词
所有 SVG 走 base64 内嵌, Streamlit Cloud 友好, 无外部依赖
"""
import base64


def _img(svg: str) -> str:
    """SVG 走 base64 data URL 嵌入 (Streamlit 渲染稳定)"""
    b64 = base64.b64encode(svg.encode("utf-8")).decode("ascii")
    return f'<img src="data:image/svg+xml;base64,{b64}" style="width:100%; display:block;" />'


# ══════════════════════════════════════════════════════════
#  📜 经典: 古卷轴 (米色竖排)
# ══════════════════════════════════════════════════════════
def svg_classic_top() -> str:
    """古卷轴开篇, 横向水波纹 + 朱砂印 (高度 100)"""
    return _img(f"""
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 100" preserveAspectRatio="none">
  <defs>
    <linearGradient id="g1" x1="0" x2="1" y1="0" y2="0">
      <stop offset="0" stop-color="#a94442" stop-opacity="0"/>
      <stop offset="0.5" stop-color="#a94442" stop-opacity="0.7"/>
      <stop offset="1" stop-color="#a94442" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <!-- 主波纹 -->
  <path d="M 20 50 Q 60 25 100 50 T 180 50 T 260 50 T 340 50 T 380 50" stroke="url(#g1)" stroke-width="2" fill="none"/>
  <!-- 中央朱砂方印 "经" -->
  <rect x="186" y="32" width="28" height="36" fill="none" stroke="#a94442" stroke-width="1.8"/>
  <rect x="190" y="36" width="20" height="28" fill="none" stroke="#a94442" stroke-width="0.8"/>
  <text x="200" y="58" font-size="20" fill="#a94442" text-anchor="middle" font-family="serif" font-weight="bold">经</text>
  <!-- 装饰小圆点 -->
  <circle cx="140" cy="80" r="2" fill="#a94442" opacity="0.5"/>
  <circle cx="200" cy="85" r="2.5" fill="#a94442" opacity="0.7"/>
  <circle cx="260" cy="80" r="2" fill="#a94442" opacity="0.5"/>
</svg>
""")


def svg_classic_bottom() -> str:
    """古卷轴收尾, 卷边 + 题款 (高度 100)"""
    return _img(f"""
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 100" preserveAspectRatio="none">
  <!-- 圆印 "印" -->
  <circle cx="200" cy="35" r="20" fill="none" stroke="#a94442" stroke-width="1.8"/>
  <circle cx="200" cy="35" r="16" fill="none" stroke="#a94442" stroke-width="0.6"/>
  <text x="200" y="42" font-size="16" fill="#a94442" text-anchor="middle" font-family="serif" font-weight="bold">印</text>
  <!-- 卷尾波纹 -->
  <path d="M 20 75 Q 80 95 140 75 T 260 75 T 380 75" stroke="#2d3a2e" stroke-width="1.2" fill="none" opacity="0.5"/>
  <path d="M 40 85 Q 100 95 160 85 T 280 85 T 360 85" stroke="#2d3a2e" stroke-width="0.8" fill="none" opacity="0.3"/>
</svg>
""")


def svg_classic_side() -> str:
    """左右卷轴边饰 (高度 200)"""
    return _img(f"""
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 200" preserveAspectRatio="none">
  <rect x="20" y="0" width="20" height="200" fill="#2d3a2e" opacity="0.15"/>
  <rect x="22" y="0" width="2" height="200" fill="#a94442" opacity="0.6"/>
  <rect x="36" y="0" width="2" height="200" fill="#a94442" opacity="0.4"/>
  <circle cx="30" cy="20" r="3" fill="#a94442" opacity="0.7"/>
  <circle cx="30" cy="100" r="3" fill="#a94442" opacity="0.7"/>
  <circle cx="30" cy="180" r="3" fill="#a94442" opacity="0.7"/>
</svg>
""")


# ══════════════════════════════════════════════════════════
#  🌿 节气: 叶脉
# ══════════════════════════════════════════════════════════
def svg_solar_top() -> str:
    return _img(f"""
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 100" preserveAspectRatio="none">
  <g transform="translate(60, 60)">
    <path d="M 0 0 Q 25 -20 50 0" stroke="#4a7c59" stroke-width="1.5" fill="none"/>
    <path d="M 12 -12 L 12 -3 M 25 -16 L 25 -3 M 38 -12 L 38 -3" stroke="#4a7c59" stroke-width="0.8" fill="none"/>
  </g>
  <g transform="translate(175, 65)">
    <path d="M 0 0 Q 30 -25 60 0" stroke="#4a7c59" stroke-width="1.5" fill="none"/>
    <path d="M 15 -14 L 15 -3 M 30 -18 L 30 -3 M 45 -14 L 45 -3" stroke="#4a7c59" stroke-width="0.8" fill="none"/>
  </g>
  <g transform="translate(295, 60)">
    <path d="M 0 0 Q 25 -20 50 0" stroke="#4a7c59" stroke-width="1.5" fill="none"/>
    <path d="M 12 -12 L 12 -3 M 25 -16 L 25 -3 M 38 -12 L 38 -3" stroke="#4a7c59" stroke-width="0.8" fill="none"/>
  </g>
</svg>
""")


def svg_solar_bottom() -> str:
    return _img(f"""
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 100" preserveAspectRatio="none">
  <path d="M 50 90 Q 55 50 50 25 M 50 50 L 42 42 M 50 55 L 58 47" stroke="#4a7c59" stroke-width="1.2" fill="none"/>
  <path d="M 200 90 Q 205 55 200 30 M 200 55 L 192 47 M 200 60 L 208 52" stroke="#4a7c59" stroke-width="1.2" fill="none"/>
  <path d="M 350 90 Q 355 50 350 25 M 350 50 L 342 42 M 350 55 L 358 47" stroke="#4a7c59" stroke-width="1.2" fill="none"/>
  <circle cx="50" cy="25" r="3" fill="#a8c5a0" opacity="0.7"/>
  <circle cx="200" cy="30" r="3" fill="#a8c5a0" opacity="0.7"/>
  <circle cx="350" cy="25" r="3" fill="#a8c5a0" opacity="0.7"/>
  <circle cx="50" cy="50" r="1.5" fill="#a8c5a0" opacity="0.5"/>
  <circle cx="200" cy="55" r="1.5" fill="#a8c5a0" opacity="0.5"/>
  <circle cx="350" cy="50" r="1.5" fill="#a8c5a0" opacity="0.5"/>
</svg>
""")


def svg_solar_side() -> str:
    return _img(f"""
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 200" preserveAspectRatio="none">
  <g transform="translate(30, 30)">
    <path d="M 0 0 Q 10 -15 20 0" stroke="#4a7c59" stroke-width="1.2" fill="none"/>
    <path d="M 5 -8 L 5 -2 M 10 -10 L 10 -2 M 15 -8 L 15 -2" stroke="#4a7c59" stroke-width="0.6" fill="none"/>
  </g>
  <g transform="translate(30, 100)">
    <path d="M 0 0 Q 10 -15 20 0" stroke="#4a7c59" stroke-width="1.2" fill="none"/>
    <path d="M 5 -8 L 5 -2 M 10 -10 L 10 -2 M 15 -8 L 15 -2" stroke="#4a7c59" stroke-width="0.6" fill="none"/>
  </g>
  <g transform="translate(30, 170)">
    <path d="M 0 0 Q 10 -15 20 0" stroke="#4a7c59" stroke-width="1.2" fill="none"/>
    <path d="M 5 -8 L 5 -2 M 10 -10 L 10 -2 M 15 -8 L 15 -2" stroke="#4a7c59" stroke-width="0.6" fill="none"/>
  </g>
</svg>
""")


# ══════════════════════════════════════════════════════════
#  ✨ 极简: 留白线
# ══════════════════════════════════════════════════════════
def svg_minimal_top() -> str:
    return _img(f"""
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 100" preserveAspectRatio="none">
  <line x1="100" y1="50" x2="300" y2="50" stroke="#999" stroke-width="0.8"/>
  <circle cx="200" cy="50" r="4" fill="#666"/>
  <line x1="180" y1="70" x2="220" y2="70" stroke="#bbb" stroke-width="0.5"/>
  <line x1="190" y1="80" x2="210" y2="80" stroke="#bbb" stroke-width="0.5"/>
</svg>
""")


def svg_minimal_bottom() -> str:
    return _img(f"""
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 100" preserveAspectRatio="none">
  <line x1="190" y1="30" x2="210" y2="30" stroke="#bbb" stroke-width="0.4"/>
  <line x1="180" y1="40" x2="220" y2="40" stroke="#bbb" stroke-width="0.4"/>
  <line x1="170" y1="50" x2="230" y2="50" stroke="#bbb" stroke-width="0.4"/>
  <line x1="100" y1="70" x2="300" y2="70" stroke="#999" stroke-width="0.8"/>
  <circle cx="200" cy="70" r="3" fill="#666"/>
</svg>
""")


def svg_minimal_side() -> str:
    return _img(f"""
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 200" preserveAspectRatio="none">
  <line x1="30" y1="20" x2="30" y2="80" stroke="#ccc" stroke-width="0.5"/>
  <line x1="30" y1="100" x2="30" y2="180" stroke="#ccc" stroke-width="0.5"/>
  <circle cx="30" cy="100" r="2" fill="#999"/>
</svg>
""")


# ══════════════════════════════════════════════════════════
#  🖌️ 文艺: 印章 + 书法笔触
# ══════════════════════════════════════════════════════════
def svg_art_top() -> str:
    return _img(f"""
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 100" preserveAspectRatio="none">
  <path d="M 20 50 Q 100 25 200 50 T 340 50" stroke="#3d2817" stroke-width="2.5" fill="none" opacity="0.7"/>
  <path d="M 20 50 Q 100 25 200 50 T 340 50" stroke="#3d2817" stroke-width="1.2" fill="none" opacity="0.4" stroke-dasharray="3 2"/>
  <rect x="332" y="28" width="40" height="40" fill="none" stroke="#a94442" stroke-width="1.8"/>
  <rect x="336" y="32" width="32" height="32" fill="none" stroke="#a94442" stroke-width="0.8"/>
  <text x="352" y="58" font-size="22" fill="#a94442" text-anchor="middle" font-family="serif" font-weight="bold">颜</text>
  <circle cx="100" cy="80" r="1.5" fill="#3d2817" opacity="0.4"/>
  <circle cx="200" cy="85" r="2" fill="#3d2817" opacity="0.5"/>
  <circle cx="300" cy="80" r="1.5" fill="#3d2817" opacity="0.4"/>
</svg>
""")


def svg_art_bottom() -> str:
    return _img(f"""
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 100" preserveAspectRatio="none">
  <path d="M 30 50 Q 120 75 220 50 T 360 50" stroke="#3d2817" stroke-width="2" fill="none" opacity="0.5"/>
  <path d="M 50 70 Q 130 85 220 70 T 340 70" stroke="#3d2817" stroke-width="1" fill="none" opacity="0.3"/>
  <circle cx="60" cy="40" r="18" fill="none" stroke="#a94442" stroke-width="1.5"/>
  <circle cx="60" cy="40" r="14" fill="none" stroke="#a94442" stroke-width="0.6"/>
  <text x="60" y="46" font-size="13" fill="#a94442" text-anchor="middle" font-family="serif" font-weight="bold">共修</text>
</svg>
""")


def svg_art_side() -> str:
    return _img(f"""
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 200" preserveAspectRatio="none">
  <path d="M 20 10 Q 30 50 20 100 Q 10 150 20 190" stroke="#3d2817" stroke-width="1.5" fill="none" opacity="0.5"/>
  <path d="M 40 10 Q 30 50 40 100 Q 50 150 40 190" stroke="#3d2817" stroke-width="1.5" fill="none" opacity="0.5"/>
  <rect x="22" y="80" width="16" height="20" fill="none" stroke="#a94442" stroke-width="1"/>
  <text x="30" y="95" font-size="10" fill="#a94442" text-anchor="middle" font-family="serif">颜</text>
</svg>
""")


# ══════════════════════════════════════════════════════════
#  🌊 水墨: 山影 + 水波
# ══════════════════════════════════════════════════════════
def svg_ink_top() -> str:
    return _img(f"""
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 100" preserveAspectRatio="none">
  <path d="M 0 80 L 50 40 L 100 60 L 150 30 L 200 50 L 250 25 L 300 55 L 350 30 L 400 50 L 400 100 L 0 100 Z" fill="#2d3a2e" opacity="0.15"/>
  <path d="M 0 90 L 60 65 L 120 80 L 180 60 L 240 75 L 300 65 L 360 80 L 400 70 L 400 100 L 0 100 Z" fill="#2d3a2e" opacity="0.25"/>
  <path d="M 0 95 L 80 85 L 160 92 L 240 85 L 320 90 L 400 85 L 400 100 L 0 100 Z" fill="#2d3a2e" opacity="0.4"/>
  <circle cx="320" cy="20" r="6" fill="none" stroke="#2d3a2e" stroke-width="1" opacity="0.5"/>
</svg>
""")


def svg_ink_bottom() -> str:
    return _img(f"""
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 100" preserveAspectRatio="none">
  <path d="M 0 65 Q 40 55 80 65 T 160 65 T 240 65 T 320 65 T 400 65" stroke="#2d3a2e" stroke-width="0.8" fill="none" opacity="0.4"/>
  <path d="M 0 75 Q 50 68 100 75 T 200 75 T 300 75 T 400 75" stroke="#2d3a2e" stroke-width="0.8" fill="none" opacity="0.3"/>
  <path d="M 0 85 Q 60 80 120 85 T 240 85 T 360 85 T 400 85" stroke="#2d3a2e" stroke-width="0.6" fill="none" opacity="0.2"/>
  <circle cx="320" cy="25" r="14" fill="none" stroke="#2d3a2e" stroke-width="1.2" opacity="0.6"/>
  <circle cx="320" cy="25" r="10" fill="none" stroke="#2d3a2e" stroke-width="0.6" opacity="0.4"/>
</svg>
""")


def svg_ink_side() -> str:
    return _img(f"""
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 200" preserveAspectRatio="none">
  <path d="M 0 60 L 20 30 L 40 50 L 60 25 L 60 80 L 0 80 Z" fill="#2d3a2e" opacity="0.2"/>
  <path d="M 0 80 L 30 55 L 60 75 L 60 100 L 0 100 Z" fill="#2d3a2e" opacity="0.3"/>
  <path d="M 0 100 L 20 80 L 40 95 L 60 80 L 60 120 L 0 120 Z" fill="#2d3a2e" opacity="0.4"/>
</svg>
""")


# ══════════════════════════════════════════════════════════
#  🎨 现代: 几何
# ══════════════════════════════════════════════════════════
def svg_modern_top() -> str:
    return _img(f"""
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 100" preserveAspectRatio="none">
  <circle cx="60" cy="50" r="22" fill="none" stroke="#c9a961" stroke-width="1.5" opacity="0.5"/>
  <circle cx="60" cy="50" r="6" fill="#c9a961" opacity="0.4"/>
  <polygon points="200,28 220,68 180,68" fill="none" stroke="#4a7c59" stroke-width="1.5" opacity="0.5"/>
  <line x1="180" y1="68" x2="220" y2="68" stroke="#4a7c59" stroke-width="1.5" opacity="0.5"/>
  <line x1="320" y1="30" x2="360" y2="70" stroke="#a94442" stroke-width="1.5" opacity="0.5"/>
  <line x1="360" y1="30" x2="320" y2="70" stroke="#a94442" stroke-width="1.5" opacity="0.5"/>
  <line x1="100" y1="85" x2="280" y2="85" stroke="#999" stroke-width="0.5"/>
</svg>
""")


def svg_modern_bottom() -> str:
    return _img(f"""
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 100" preserveAspectRatio="none">
  <rect x="50" y="40" width="40" height="12" fill="#c9a961" opacity="0.5"/>
  <rect x="100" y="40" width="40" height="12" fill="#4a7c59" opacity="0.5"/>
  <rect x="150" y="40" width="40" height="12" fill="#a94442" opacity="0.5"/>
  <line x1="220" y1="46" x2="350" y2="46" stroke="#999" stroke-width="0.8"/>
  <circle cx="220" cy="46" r="3" fill="#666"/>
  <circle cx="350" cy="46" r="3" fill="#666"/>
  <rect x="50" y="65" width="20" height="3" fill="#4a7c59" opacity="0.5"/>
  <rect x="80" y="65" width="20" height="3" fill="#c9a961" opacity="0.5"/>
  <rect x="110" y="65" width="20" height="3" fill="#a94442" opacity="0.5"/>
</svg>
""")


def svg_modern_side() -> str:
    return _img(f"""
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 200" preserveAspectRatio="none">
  <rect x="10" y="20" width="40" height="40" fill="none" stroke="#c9a961" stroke-width="1.2" opacity="0.5"/>
  <rect x="10" y="80" width="40" height="40" fill="none" stroke="#4a7c59" stroke-width="1.2" opacity="0.5"/>
  <rect x="10" y="140" width="40" height="40" fill="none" stroke="#a94442" stroke-width="1.2" opacity="0.5"/>
  <line x1="20" y1="40" x2="40" y2="40" stroke="#c9a961" stroke-width="1.2" opacity="0.7"/>
  <line x1="20" y1="100" x2="40" y2="100" stroke="#4a7c59" stroke-width="1.2" opacity="0.7"/>
  <line x1="20" y1="160" x2="40" y2="160" stroke="#a94442" stroke-width="1.2" opacity="0.7"/>
</svg>
""")


# ══════════════════════════════════════════════════════════
#  模板 → (top, bottom, side) 装饰路由
# ══════════════════════════════════════════════════════════
POSTER_DECORATIONS = {
    "📜 经典 (米色竖排)": (svg_classic_top, svg_classic_bottom, svg_classic_side),
    "🌿 节气 (随节气换色)": (svg_solar_top, svg_solar_bottom, svg_solar_side),
    "✨ 极简 (白底黑字)": (svg_minimal_top, svg_minimal_bottom, svg_minimal_side),
    "🖌️ 文艺 (手写体 + 印章)": (svg_art_top, svg_art_bottom, svg_art_side),
    "🌊 水墨 (山水背景)": (svg_ink_top, svg_ink_bottom, svg_ink_side),
    "🎨 现代 (彩色几何)": (svg_modern_top, svg_modern_bottom, svg_modern_side),
}


def get_decoration(template: str) -> tuple[str, str, str]:
    """返回 (顶部装饰 HTML, 底部装饰 HTML, 左右侧装饰 HTML)"""
    top_fn, bottom_fn, side_fn = POSTER_DECORATIONS[template]
    return top_fn(), bottom_fn(), side_fn()