"""心颜 v0.1 原型 — 共享 CSS

调性: 浅米白 + 墨绿 + 暖黄, 安静 / 涵养 / 共修
严守: 不用「治疗/改善/缓解」, 用「滋养/涵养/陪伴/焕颜/共修」
"""

CSS = """<style>
/* 隐藏 Streamlit 默认元素 */
#MainMenu, footer, header {visibility: hidden}
/* v0.6.3: 隐藏 streamlit 自动顶部 nav (用 sidebar 自建中文菜单) */
div[data-testid="stSidebarNav"] {display: none !important; visibility: hidden !important; height: 0 !important;}
.block-container {padding-top: 0.5rem; padding-bottom: 2rem; max-width: 520px}

/* 全局字体 — 优先思源宋体, 然后衬线, 营造古朴涵养感 */
.stApp {font-family: 'Source Han Serif SC', 'Noto Serif CJK SC', 'Songti SC', 'STSong', 'SimSun', serif}

/* 主色调变量 */
:root {
    --ink-green: #4a7c59;       /* 墨绿 - 主色 */
    --ink-green-deep: #2d5a3d;  /* 深墨绿 - 强调 */
    --warm-yellow: #c9a961;     /* 暖黄 - 副色 */
    --cream: #faf6f0;           /* 浅米白 - 背景 */
    --cream-deep: #f0e9dc;      /* 暖米 - 卡片 */
    --cream-darker: #e8dfc8;    /* 深米 - 边框 */
    --ink-black: #2d3a2e;       /* 深绿黑 - 主文字 */
    --ink-gray: #6b6b6b;        /* 灰 - 副文字 */
    --cinnabar-red: #a94442;    /* 朱砂红 - 印章感, 装饰用 */
}

/* ── Hero 启动区 (主页面) ── */
.hero {
    background: linear-gradient(135deg, #faf6f0 0%, #f0e9dc 100%);
    border-radius: 16px;
    padding: 2.5rem 1.5rem;
    margin: 1rem 0 1.5rem 0;
    text-align: center;
    border: 1px solid #e8dfc8;
    position: relative;
}
.hero-eyebrow {
    color: var(--ink-green);
    font-size: 0.75rem;
    letter-spacing: 0.3em;
    margin-bottom: 0.5rem;
    font-weight: 500;
}
.hero-title {
    color: var(--ink-black);
    font-size: 2.5rem;
    font-weight: 600;
    margin: 0.5rem 0;
    letter-spacing: 0.1em;
}
.hero-sub {
    color: var(--ink-gray);
    font-size: 0.95rem;
    margin-top: 0.5rem;
    font-style: italic;
}
.hero-stamp {
    display: inline-block;
    color: var(--cinnabar-red);
    font-size: 0.85rem;
    border: 1px solid var(--cinnabar-red);
    border-radius: 4px;
    padding: 0.2rem 0.6rem;
    margin-top: 1rem;
    letter-spacing: 0.1em;
}

/* ── 卡片样式 ── */
.card {
    background: var(--cream-deep);
    color: var(--ink-black);
    border-radius: 12px;
    padding: 1.2rem;
    margin: 0.8rem 0;
    border: 1px solid var(--cream-darker);
}
.card h1, .card h2, .card h3, .card p { color: var(--ink-black) !important }

.card-jingwen {
    background: linear-gradient(135deg, #faf6f0 0%, #f5efe1 100%);
    border-left: 4px solid var(--ink-green);
    border-radius: 8px;
    padding: 1.2rem 1.4rem;
    margin: 0.8rem 0;
}
.card-jingwen .source {
    color: var(--cinnabar-red);
    font-size: 0.85rem;
    letter-spacing: 0.1em;
    margin-bottom: 0.4rem;
}
.card-jingwen .title {
    color: var(--ink-black);
    font-size: 1.15rem;
    font-weight: 600;
    margin: 0.4rem 0;
}
.card-jingwen .content {
    color: var(--ink-black);
    font-size: 1.05rem;
    line-height: 1.8;
    margin: 0.6rem 0;
    font-family: 'Source Han Serif SC', 'Songti SC', 'STSong', serif;
}
.card-jingwen .jieshi {
    color: var(--ink-gray);
    font-size: 0.9rem;
    line-height: 1.6;
    margin-top: 0.6rem;
    padding-top: 0.6rem;
    border-top: 1px dashed var(--cream-darker);
}

.card-soup {
    background: linear-gradient(135deg, #f5efe1 0%, #ede2c8 100%);
    border-left: 4px solid var(--warm-yellow);
    border-radius: 8px;
    padding: 1.2rem 1.4rem;
    margin: 0.8rem 0;
}
.card-soup .name {
    color: var(--ink-black);
    font-size: 1.2rem;
    font-weight: 600;
    margin: 0.3rem 0;
}
.card-soup .badge {
    display: inline-block;
    color: var(--ink-green);
    font-size: 0.78rem;
    background: rgba(74,124,89,0.1);
    border-radius: 99px;
    padding: 0.15rem 0.6rem;
    margin: 0.2rem 0.3rem 0.2rem 0;
}
.card-soup .ingredients {
    color: var(--ink-black);
    font-size: 0.92rem;
    margin: 0.5rem 0;
    line-height: 1.6;
}
.card-soup .steps {
    color: var(--ink-gray);
    font-size: 0.88rem;
    margin: 0.4rem 0;
    line-height: 1.6;
}
.card-soup .effect {
    color: var(--cinnabar-red);
    font-size: 0.85rem;
    margin-top: 0.5rem;
    padding-top: 0.5rem;
    border-top: 1px dashed var(--cream-darker);
    font-style: italic;
}

/* ── 标签 (tizhi / 节气) ── */
.tag {
    display: inline-block;
    padding: 0.2rem 0.7rem;
    background: rgba(74,124,89,0.1);
    color: var(--ink-green);
    border-radius: 99px;
    font-size: 0.78rem;
    margin: 0.15rem 0.3rem 0.15rem 0;
    border: 1px solid rgba(74,124,89,0.2);
}
.tag-yellow {
    background: rgba(201,169,97,0.1);
    color: #8a6d2a;
    border-color: rgba(201,169,97,0.3);
}
.tag-red {
    background: rgba(169,68,66,0.08);
    color: var(--cinnabar-red);
    border-color: rgba(169,68,66,0.2);
}

/* ── 按钮样式 ── */
.stButton > button {
    background: var(--ink-green) !important;
    color: white !important;
    border-radius: 99px !important;
    padding: 0.5rem 1.5rem !important;
    border: none !important;
    font-weight: 500 !important;
    letter-spacing: 0.05em;
    transition: all 0.3s;
}
.stButton > button:hover {
    background: var(--ink-green-deep) !important;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(74,124,89,0.2);
}

/* ── 共修堂 — 心愿卡片 ── */
.wish-card {
    background: var(--cream);
    border: 1px solid var(--cream-darker);
    border-radius: 12px;
    padding: 1rem;
    margin: 0.6rem 0;
    color: var(--ink-black);
    line-height: 1.6;
}
.wish-card .time {
    color: var(--ink-gray);
    font-size: 0.78rem;
    margin-bottom: 0.3rem;
}
.wish-card .type {
    color: var(--cinnabar-red);
    font-size: 0.78rem;
    margin-right: 0.5rem;
    font-weight: 500;
}
.wish-card .text {
    color: var(--ink-black);
    font-size: 0.95rem;
    margin: 0.3rem 0;
}
.wish-card .from {
    color: var(--ink-gray);
    font-size: 0.8rem;
    margin-top: 0.4rem;
    text-align: right;
    font-style: italic;
}

/* ── 任务清单 (共修 3 任务) ── */
.task-row {
    display: flex;
    align-items: center;
    background: var(--cream);
    border: 1px solid var(--cream-darker);
    border-radius: 8px;
    padding: 0.7rem 1rem;
    margin: 0.4rem 0;
}
.task-row.done {
    background: rgba(74,124,89,0.08);
    border-color: var(--ink-green);
}
.task-check {
    display: inline-block;
    width: 1.3rem;
    height: 1.3rem;
    border-radius: 50%;
    border: 2px solid var(--ink-gray);
    text-align: center;
    line-height: 1.1rem;
    margin-right: 0.8rem;
    color: white;
    font-size: 0.85rem;
}
.task-check.done {
    background: var(--ink-green);
    border-color: var(--ink-green);
}
.task-text {
    color: var(--ink-black);
    font-size: 0.95rem;
    flex: 1;
}
.task-row.done .task-text {
    color: var(--ink-gray);
    text-decoration: line-through;
}

/* ── 顶部品牌头 (所有页面) ── */
.brand-header {
    text-align: center;
    padding: 1rem 0 0.5rem 0;
    color: var(--ink-green);
    font-size: 1.1rem;
    letter-spacing: 0.2em;
    font-weight: 500;
}
.brand-sub {
    text-align: center;
    color: var(--ink-gray);
    font-size: 0.78rem;
    letter-spacing: 0.1em;
    margin-bottom: 1rem;
    font-style: italic;
}

/* ── 底部说明 ── */
.footer-note {
    text-align: center;
    color: var(--ink-gray);
    font-size: 0.75rem;
    margin-top: 2rem;
    padding-top: 1rem;
    border-top: 1px dashed var(--cream-darker);
    line-height: 1.6;
}

/* ── 海报样式 (心颜专属, 朱砂红印章感) ── */
.poster-frame {
    background: linear-gradient(135deg, #faf6f0 0%, #f0e9dc 100%);
    border: 2px solid var(--ink-green);
    border-radius: 12px;
    padding: 1.5rem 1.2rem;
    margin: 1rem 0;
    text-align: center;
    position: relative;
}
.poster-frame::before, .poster-frame::after {
    content: '';
    position: absolute;
    width: 30px;
    height: 30px;
    border: 2px solid var(--cinnabar-red);
    border-radius: 4px;
}
.poster-frame::before { top: 8px; left: 8px; }
.poster-frame::after { bottom: 8px; right: 8px; }
.poster-eyebrow {
    color: var(--cinnabar-red);
    font-size: 0.75rem;
    letter-spacing: 0.3em;
    margin-bottom: 0.5rem;
}
.poster-title {
    color: var(--ink-black);
    font-size: 1.1rem;
    margin: 0.4rem 0;
    line-height: 1.5;
    font-weight: 500;
}
.poster-content {
    color: var(--ink-black);
    font-size: 1.3rem;
    line-height: 2;
    margin: 0.8rem 0;
    font-family: 'Source Han Serif SC', 'Songti SC', 'STSong', serif;
}
.poster-stamp {
    display: inline-block;
    color: var(--cinnabar-red);
    border: 1px solid var(--cinnabar-red);
    border-radius: 4px;
    padding: 0.2rem 0.5rem;
    font-size: 0.78rem;
    margin-top: 0.6rem;
    letter-spacing: 0.1em;
}

/* ── 警告框 (严守合规) ── */
.compliance-note {
    background: rgba(201,169,97,0.08);
    border: 1px solid rgba(201,169,97,0.3);
    border-radius: 6px;
    padding: 0.6rem 0.9rem;
    margin: 0.8rem 0;
    color: #8a6d2a;
    font-size: 0.82rem;
    line-height: 1.5;
}

/* ── Streamlit 元素适配 ── */
.stMarkdown, .stText { color: var(--ink-black) !important }
.stCaption, .stCaption > div { color: var(--ink-gray) !important }
[data-testid="stSidebar"] {
    background: var(--cream-deep);
}
</style>"""


def inject_css():
    """所有 page 第一行调用, 注入心颜专属 CSS"""
    import streamlit as st
    st.markdown(CSS, unsafe_allow_html=True)
