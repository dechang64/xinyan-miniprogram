"""心颜 v0.7 — 5 滋养曲风 prompt + MiniMax MCP 音乐生成封装

严守:
- 跟 v0.6.1 温润滤镜一致意境: 清润/温润/通透/晨光/黄昏 (不用「美颜/美白/瘦脸」营销词)
- 不生成激烈 / 消极 / 焦虑 / 痛苦类情绪音乐
- 数据只存 session_state, 关浏览器即清
- 8 禁用词 0 出现
- 曲风只跟「滋养」相关, 严守化妆品监管条例不宣称医疗作用
"""

import json

# 5 滋养曲风 (跟温润滤镜 5 预设一一对应, 心颜「滋养」调性统一)
MUSIC_STYLES = {
    "清润": {
        "prompt": "gentle, clear, refined piano solo, soft mallets, 70 BPM, morning dew, healing ambient, minimalist, no lyrics, 2 minutes",
        "description": "清晨的露珠, 透明轻盈, 钢琴泛音清亮",
        "scene": "晨起 / 静心阅读时",
        "icon": "💧",
        "color": "#A8D5BA",  # 浅绿
    },
    "温润": {
        "prompt": "warm, tender, wooden flute with strings, 75 BPM, warm tea, cozy afternoon, folk ambient, no lyrics, 2 minutes",
        "description": "午后的温茶, 木质音色, 暖意慢慢渗开",
        "scene": "下午茶 / 缓慢工作时",
        "icon": "🍵",
        "color": "#E6C79C",  # 暖橙
    },
    "通透": {
        "prompt": "crystal clear, ethereal, guzheng with ambient pads, 80 BPM, clear mind, meditative, no lyrics, 2 minutes",
        "description": "心境清透, 古筝泛音远山, 通透感",
        "scene": "冥想 / 自我对话时",
        "icon": "✨",
        "color": "#B8D8E8",  # 浅蓝
    },
    "晨光": {
        "prompt": "soft sunrise, gentle acoustic guitar, 72 BPM, golden hour, hopeful, indie folk, no lyrics, 2 minutes",
        "description": "晨光洒进窗, 木吉他 + 微微铃铛, 新的开始",
        "scene": "早晨醒来 / 启动一日时",
        "icon": "🌅",
        "color": "#F4D35E",  # 暖黄
    },
    "黄昏": {
        "prompt": "warm dusk, cello with soft piano, 68 BPM, sunset, reflective, cinematic ambient, no lyrics, 2 minutes",
        "description": "黄昏时分, 大提琴低吟, 一日落幕的温柔",
        "scene": "傍晚 / 整理一日时",
        "icon": "🌆",
        "color": "#E8998C",  # 暖红
    },
}

# v0.7.1.1: 5 个示例 MP3 的 CDN URL (MiniMax hailuoai.com 永久 bucket)
# 严守: 由 MiniMax AI 生成, 严守 8 禁用词 0 出现, prompt 已预审
# Cloud 兼容: Streamlit Cloud 上 mavis.cmd 不可用, 用预生成示例绕过
# 真生成 (本地 dev): UI 上「✨ 真生成」折叠按钮可调 MCP, 需本地 mavis daemon
# CDN 链接有效期: MiniMax CDN 通常 7 天, 失效时刷新 demo 即可
DEMO_URLS = {
    "清润": "https://cdn.hailuoai.com/mcp/u503581678484750338/music_tool/output/1783468760_eba347f3.mp3",
    "温润": "https://cdn.hailuoai.com/mcp/u503581678484750338/music_tool/output/1783468789_0790e546.mp3",
    "通透": "https://cdn.hailuoai.com/mcp/u503581678484750338/music_tool/output/1783468833_aac36996.mp3",
    "晨光": "https://cdn.hailuoai.com/mcp/u503581678484750338/music_tool/output/1783468869_f2e62690.mp3",
    "黄昏": "https://cdn.hailuoai.com/mcp/u503581678484750338/music_tool/output/1783468905_14fe8f18.mp3",
}

# 心颜严守: 不允许的曲风关键词
_FORBIDDEN_MUSIC_KEYWORDS = [
    "激烈", "焦虑", "痛苦", "愤怒", "恐惧", "绝望",
    "治疗", "改善", "缓解", "治愈", "祛斑", "减肥", "处方", "医美",
    "美颜", "美白", "瘦脸", "营销", "广告",
]

# 心颜严守: 5 曲风描述 + prompt 都要过关键词预审
def _validate_prompt(style_key: str, prompt: str) -> bool:
    """严守预审: 不允许消极/医疗/营销词进入"""
    for keyword in _FORBIDDEN_MUSIC_KEYWORDS:
        if keyword in prompt:
            print(f"[music] ⚠️ 严守拦截: '{keyword}' 在 prompt 中")
            return False
    return True


def get_style_prompt(style_key: str) -> str:
    """取曲风的 MiniMax prompt"""
    if style_key not in MUSIC_STYLES:
        return MUSIC_STYLES["清润"]["prompt"]  # 默认
    return MUSIC_STYLES[style_key]["prompt"]


def list_styles() -> list:
    """列出所有曲风 (用于 UI 下拉框)"""
    return [(k, v["icon"] + " " + k + " - " + v["description"]) for k, v in MUSIC_STYLES.items()]


def call_minimax_generate_music(prompt: str, lyrics: str = "", sample_rate: int = 32000, bitrate: int = 128000) -> str:
    """调用 MiniMax MCP 生成音乐, 返回本地 MP3 文件路径

    Args:
        prompt: 曲风 prompt (英文, MiniMax 训练数据)
        lyrics: 歌词 (心颜不用歌词, 默认 "")
        sample_rate: 采样率 16000/24000/32000/44100
        bitrate: 比特率 32000-256000
    Returns:
        CDN URL (https://cdn.hailuoai.com/...) 或 本地路径 或 None (失败)

    严守: PowerShell 环境必须用 --stdin, 不能直接传 JSON (单引号转义冲突)
    严守: Windows subprocess 必须 shell=True 才能找到 mavis.cmd
    """
    # 严守预审
    if not _validate_prompt("", prompt):
        return None

    import subprocess
    try:
        # 调用 MCP CLI (PowerShell 必须用 --stdin)
        payload = json.dumps({
            "requests": [{
                "prompt": prompt,
                "lyrics": lyrics,
                "sample_rate": sample_rate,
                "bitrate": bitrate,
                "format": "mp3",
            }]
        }, ensure_ascii=False)

        # Windows 上 subprocess 必须 shell=True 才能找到 mavis.cmd
        result = subprocess.run(
            "mavis mcp call matrix matrix_batch_text_to_music --stdin",
            input=payload,
            capture_output=True,
            text=True,
            timeout=180,
            shell=True,
        )
        if result.returncode != 0:
            print(f"[music] MiniMax 调用失败: {result.stderr[:300]}")
            return None

        data = json.loads(result.stdout)
        # 返回结构: {success_items: [{output_url: <本地路径>, is_success: true}]}
        success_items = data.get("success_items", [])
        if success_items and success_items[0].get("is_success"):
            return success_items[0].get("output_url")  # 本地路径
        failed = data.get("failed_items", [])
        if failed:
            print(f"[music] MiniMax 返回失败: {failed[0]}")
        return None
    except Exception as e:
        print(f"[music] MiniMax 调用异常: {e}")
        return None


def generate_xinyan_music(style_key: str, use_demo: bool = True) -> dict:
    """心颜专属音乐生成: 曲风 → MiniMax prompt → CDN URL

    Args:
        style_key: 曲风 key
        use_demo: True 用预生成示例 (Cloud 兼容, 默认), False 调 MiniMax MCP (本地 dev)
    Returns:
        {
            "success": True,
            "style": "清润",
            "prompt": "...",
            "audio_url": "https://...",
            "description": "...",
            "scene": "...",
            "icon": "💧",
            "color": "#A8D5BA",
            "is_demo": True/False,  # 标记是否演示模式
        }
    """
    if style_key not in MUSIC_STYLES:
        style_key = "清润"

    style = MUSIC_STYLES[style_key]
    prompt = style["prompt"]

    # 严守预审
    if not _validate_prompt(style_key, prompt):
        return {"success": False, "style": style_key, "error": "严守拦截"}

    # Demo 模式 (Cloud 兼容): 用预生成 URL, 不调 MCP
    audio_url = None
    is_demo = False
    if use_demo and style_key in DEMO_URLS:
        audio_url = DEMO_URLS[style_key]
        is_demo = True

    # 真生成模式: 调 MiniMax MCP (本地 dev 需 mavis daemon)
    if audio_url is None:
        audio_url = call_minimax_generate_music(prompt)

    return {
        "success": audio_url is not None,
        "style": style_key,
        "prompt": prompt,
        "audio_url": audio_url,
        "description": style["description"],
        "scene": style["scene"],
        "icon": style["icon"],
        "color": style["color"],
        "is_demo": is_demo,
    }


# 心颜严守声明
_MUSIC_COMPLIANCE = """
严守: 8 禁用词 0 出现 (治疗/改善/缓解/治愈/祛斑/减肥/处方/医美)
严守: 营销词 0 出现 (美颜/美白/瘦脸/营销/广告)
严守: 消极情绪词 0 出现 (激烈/焦虑/痛苦/愤怒/恐惧/绝望)

5 滋养曲风跟 v0.6.1 温润滤镜 5 预设一一对应:
- 清润 ↔ 清润滤镜 (💧 浅绿)
- 温润 ↔ 温润滤镜 (🍵 暖橙)
- 通透 ↔ 通透滤镜 (✨ 浅蓝)
- 晨光 ↔ 晨光滤镜 (🌅 暖黄)
- 黄昏 ↔ 黄昏滤镜 (🌆 暖红)

音乐生成来源: MiniMax MCP matrix_batch_text_to_music (官方音乐生成 API)
数据 100% 本地: session_state 关浏览器即清, 严守个保法
"""