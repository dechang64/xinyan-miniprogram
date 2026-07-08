"""
心颜 海报 SVG 装饰库 (v0.7.1.7)
为 6 个海报模板提供 顶部 + 底部 意境 SVG 装饰

严守基调: 滋养/共修/涵养/清润/温润, 不出现美颜/美白/医美/治愈等营销/医疗词
风格: 文艺 印章/书法笔触 + 水墨 山影/水波 + 现代 几何/线条 + 经典 古卷 + 节气 叶脉 + 极简 留白线
所有 SVG 走 base64 内嵌, Streamlit Cloud 友好, 无外部依赖
"""
import base64


def _wrap(inner_svg: str, width: str = "100%", height: str = "60px", opacity: float = 0.35) -> str:
    """包一层 div 让 SVG 在海报里自适应宽度 + 透明度"""
    return (
        f'<div style="width: {width}; height: {height}; opacity: {opacity}; '
        f'margin: 0.3rem auto; display: block; line-height: 0;">'
        f'{inner_svg}</div>'
    )


def _encode(svg: str) -> str:
    """SVG 走 base64 data URL 嵌入 (Streamlit 渲染稳定)"""
    b64 = base64.b64encode(svg.encode("utf-8")).decode("ascii")
    return f'<img src="data:image/svg+xml;base64,{b64}" style="width:100%; height:60px; display:block;" />'


# ══════════════════════════════════════════════════════════
#  📜 经典: 古卷轴 (米色竖排)
# ══════════════════════════════════════════════════════════
def svg_classic_top() -> str:
    """古卷轴开篇, 横向水波纹 + 朱砂印"""
    return _encode(f"""
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 60" preserveAspectRatio="none">
  <defs>
    <linearGradient id="g1" x1="0" x2="1" y1="0" y2="0">
      <stop offset="0" stop-color="#a94442" stop-opacity="0"/>
      <stop offset="0.5" stop-color="#a94442" stop-opacity="0.7"/>
      <stop offset="1" stop-color="#a94442" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <path d="M 20 30 Q 60 10 100 30 T 180 30 T 260 30 T 340 30 T 380 30" stroke="url(#g1)" stroke-width="1.5" fill="none"/>
  <rect x="195" y="20" width="14" height="20" fill="none" stroke="#a94442" stroke-width="1.2"/>
  <text x="202" y="34" font-size="10" fill="#a94442" text-anchor="middle" font-family="serif">经</text>
</svg>
""")


def svg_classic_bottom() -> str:
    """古卷轴收尾, 卷边 + 题款"""
    return _encode(f"""
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 60" preserveAspectRatio="none">
  <path d="M 20 30 Q 80 50 140 30 T 260 30 T 380 30" stroke="#2d3a2e" stroke-width="1" fill="none" opacity="0.5"/>
  <circle cx="370" cy="30" r="10" fill="none" stroke="#a94442" stroke-width="1.2"/>
  <text x="370" y="34" font-size="9" fill="#a94442" text-anchor="middle" font-family="serif">印</text>
</svg>
""")


# ══════════════════════════════════════════════════════════
#  🌿 节气: 叶脉 (随节气换色)
# ══════════════════════════════════════════════════════════
def svg_solar_top() -> str:
    """三片错落叶脉, 节气感"""
    return _encode(f"""
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 60" preserveAspectRatio="none">
  <g transform="translate(80, 30)">
    <path d="M 0 0 Q 20 -15 40 0" stroke="#4a7c59" stroke-width="1" fill="none"/>
    <path d="M 10 -8 L 10 -2 M 20 -10 L 20 -2 M 30 -8 L 30 -2" stroke="#4a7c59" stroke-width="0.6" fill="none"/>
  </g>
  <g transform="translate(180, 32)">
    <path d="M 0 0 Q 25 -18 50 0" stroke="#4a7c59" stroke-width="1" fill="none"/>
    <path d="M 12 -10 L 12 -2 M 25 -13 L 25 -2 M 38 -10 L 38 -2" stroke="#4a7c59" stroke-width="0.6" fill="none"/>
  </g>
  <g transform="translate(290, 30)">
    <path d="M 0 0 Q 20 -15 40 0" stroke="#4a7c59" stroke-width="1" fill="none"/>
    <path d="M 10 -8 L 10 -2 M 20 -10 L 20 -2 M 30 -8 L 30 -2" stroke="#4a7c59" stroke-width="0.6" fill="none"/>
  </g>
</svg>
""")


def svg_solar_bottom() -> str:
    """小草 + 露珠"""
    return _encode(f"""
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 60" preserveAspectRatio="none">
  <path d="M 50 50 Q 55 30 50 20 M 50 30 L 45 25 M 50 32 L 55 27" stroke="#4a7c59" stroke-width="1" fill="none"/>
  <path d="M 200 50 Q 205 35 200 25 M 200 35 L 195 30 M 200 37 L 205 32" stroke="#4a7c59" stroke-width="1" fill="none"/>
  <path d="M 350 50 Q 355 30 350 20 M 350 30 L 345 25 M 350 32 L 355 27" stroke="#4a7c59" stroke-width="1" fill="none"/>
  <circle cx="50" cy="20" r="2" fill="#a8c5a0" opacity="0.6"/>
  <circle cx="200" cy="25" r="2" fill="#a8c5a0" opacity="0.6"/>
  <circle cx="350" cy="20" r="2" fill="#a8c5a0" opacity="0.6"/>
</svg>
""")


# ══════════════════════════════════════════════════════════
#  ✨ 极简: 留白线 (白底黑字)
# ══════════════════════════════════════════════════════════
def svg_minimal_top() -> str:
    """极简: 一道细线 + 一个小圆点"""
    return _encode(f"""
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 60" preserveAspectRatio="none">
  <line x1="120" y1="30" x2="280" y2="30" stroke="#999" stroke-width="0.5"/>
  <circle cx="200" cy="30" r="2" fill="#666"/>
</svg>
""")


def svg_minimal_bottom() -> str:
    """极简: 三道极细横线 (呼吸感)"""
    return _encode(f"""
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 60" preserveAspectRatio="none">
  <line x1="160" y1="22" x2="240" y2="22" stroke="#bbb" stroke-width="0.4"/>
  <line x1="170" y1="30" x2="230" y2="30" stroke="#bbb" stroke-width="0.4"/>
  <line x1="180" y1="38" x2="220" y2="38" stroke="#bbb" stroke-width="0.4"/>
</svg>
""")


# ══════════════════════════════════════════════════════════
#  🖌️ 文艺: 印章 + 书法笔触
# ══════════════════════════════════════════════════════════
def svg_art_top() -> str:
    """手写体文艺: 飞白笔触 + 红印"""
    return _encode(f"""
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 60" preserveAspectRatio="none">
  <path d="M 30 30 Q 100 15 180 30 T 320 30" stroke="#3d2817" stroke-width="2" fill="none" opacity="0.7"/>
  <path d="M 30 30 Q 100 15 180 30 T 320 30" stroke="#3d2817" stroke-width="1" fill="none" opacity="0.4" stroke-dasharray="3 2"/>
  <rect x="340" y="18" width="28" height="28" fill="none" stroke="#a94442" stroke-width="1.5"/>
  <text x="354" y="38" font-size="14" fill="#a94442" text-anchor="middle" font-family="serif" font-weight="bold">颜</text>
</svg>
""")


def svg_art_bottom() -> str:
    """飞白 + 落款印"""
    return _encode(f"""
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 60" preserveAspectRatio="none">
  <path d="M 40 30 Q 120 45 200 30 T 340 30" stroke="#3d2817" stroke-width="1.5" fill="none" opacity="0.5"/>
  <circle cx="60" cy="30" r="14" fill="none" stroke="#a94442" stroke-width="1.2"/>
  <text x="60" y="35" font-size="10" fill="#a94442" text-anchor="middle" font-family="serif">共修</text>
</svg>
""")


# ══════════════════════════════════════════════════════════
#  🌊 水墨: 山影 + 水波
# ══════════════════════════════════════════════════════════
def svg_ink_top() -> str:
    """远山轮廓 (水墨层叠)"""
    return _encode(f"""
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 60" preserveAspectRatio="none">
  <path d="M 0 50 L 50 25 L 100 40 L 150 20 L 200 35 L 250 18 L 300 38 L 350 22 L 400 40 L 400 60 L 0 60 Z" fill="#2d3a2e" opacity="0.18"/>
  <path d="M 0 55 L 60 40 L 120 50 L 180 38 L 240 48 L 300 40 L 360 50 L 400 45 L 400 60 L 0 60 Z" fill="#2d3a2e" opacity="0.28"/>
  <path d="M 0 58 L 80 52 L 160 55 L 240 52 L 320 56 L 400 53 L 400 60 L 0 60 Z" fill="#2d3a2e" opacity="0.4"/>
</svg>
""")


def svg_ink_bottom() -> str:
    """水波纹 + 落日圆"""
    return _encode(f"""
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 60" preserveAspectRatio="none">
  <circle cx="320" cy="20" r="10" fill="none" stroke="#2d3a2e" stroke-width="1" opacity="0.6"/>
  <path d="M 0 45 Q 40 38 80 45 T 160 45 T 240 45 T 320 45 T 400 45" stroke="#2d3a2e" stroke-width="0.6" fill="none" opacity="0.4"/>
  <path d="M 0 52 Q 50 46 100 52 T 200 52 T 300 52 T 400 52" stroke="#2d3a2e" stroke-width="0.6" fill="none" opacity="0.3"/>
</svg>
""")


# ══════════════════════════════════════════════════════════
#  🎨 现代: 几何 (彩色)
# ══════════════════════════════════════════════════════════
def svg_modern_top() -> str:
    """彩色几何: 圆 + 三角 + 线"""
    return _encode(f"""
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 60" preserveAspectRatio="none">
  <circle cx="60" cy="30" r="14" fill="none" stroke="#c9a961" stroke-width="1.2" opacity="0.5"/>
  <polygon points="180,18 200,42 160,42" fill="none" stroke="#4a7c59" stroke-width="1.2" opacity="0.5"/>
  <line x1="260" y1="20" x2="320" y2="40" stroke="#a94442" stroke-width="1.2" opacity="0.5"/>
  <line x1="260" y1="40" x2="320" y2="20" stroke="#a94442" stroke-width="1.2" opacity="0.5"/>
</svg>
""")


def svg_modern_bottom() -> str:
    """现代: 极简色块"""
    return _encode(f"""
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 60" preserveAspectRatio="none">
  <rect x="50" y="26" width="30" height="8" fill="#c9a961" opacity="0.5"/>
  <rect x="100" y="26" width="30" height="8" fill="#4a7c59" opacity="0.5"/>
  <rect x="150" y="26" width="30" height="8" fill="#a94442" opacity="0.5"/>
  <line x1="220" y1="30" x2="350" y2="30" stroke="#999" stroke-width="0.5"/>
</svg>
""")


# ══════════════════════════════════════════════════════════
#  模板 → (top, bottom) 装饰路由
# ══════════════════════════════════════════════════════════
POSTER_DECORATIONS = {
    "📜 经典 (米色竖排)": (svg_classic_top, svg_classic_bottom),
    "🌿 节气 (随节气换色)": (svg_solar_top, svg_solar_bottom),
    "✨ 极简 (白底黑字)": (svg_minimal_top, svg_minimal_bottom),
    "🖌️ 文艺 (手写体 + 印章)": (svg_art_top, svg_art_bottom),
    "🌊 水墨 (山水背景)": (svg_ink_top, svg_ink_bottom),
    "🎨 现代 (彩色几何)": (svg_modern_top, svg_modern_bottom),
}


def get_decoration(template: str) -> tuple[str, str]:
    """返回 (顶部装饰 HTML, 底部装饰 HTML)"""
    top_fn, bottom_fn = POSTER_DECORATIONS[template]
    return top_fn(), bottom_fn()