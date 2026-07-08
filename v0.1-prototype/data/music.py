"""心颜 v0.7.1.7.5 — 5 滋养曲风 prompt + MiniMax MCP 音乐生成封装

v0.7.1.7.5 关键变化:
- 之前 5 曲风 prompt 自由写 (清润/温润/通透/晨光/黄昏), 实际生成 80 BPM 偏快
- 现在 5 曲风严格按《五行音乐映射规则白皮书 v1.2》(中国音乐学院王教授审阅):
  - 清润 → 羽(水) 60 BPM 二胡/大提琴
  - 温润 → 宫(土) 75 BPM 埙/古筝
  - 通透 → 商(金) 85 BPM 钢琴/编钟
  - 晨光 → 角(木) 70 BPM 古琴/竹笛
  - 黄昏 → 徵(火) 95 BPM 琵琶/小提琴
- 主音/五声音阶/演奏法按白皮书 3.1 节 + 5.2 节模板
- 数据只存 session_state, 关浏览器即清
- 8 禁用词 0 出现
- 曲风只跟「滋养」相关, 严守化妆品监管条例不宣称医疗作用
"""

import json

# 5 滋养曲风 (按五行音乐白皮书 v1.2 严格映射, 心颜「滋养」调性统一)
MUSIC_STYLES = {
    "清润": {
        # 羽调式 (水), A 五声音阶 (A-C-D-E-G), 55-70 BPM, 二胡+大提琴
        "prompt": "A deep, flowing instrumental piece in 羽调式 (Yu mode, pentatonic scale A-C-D-E-G), 60 BPM, 4/4 time signature with free rhythm (散板) sections. Primary instruments: erhu with portamento, cello legato, harp pizzicato, bass flute. Acoustic parameters: reverb=large hall, wetness=40%, attack=soft, decay=long, brightness=warm dark. Dark, rich, fluid timbre like deep water flowing. Legato phrasing, gentle dynamic swells, fluid rhythm. Melody meanders like a stream, with deep resonant undertones. Dynamic p-mp, intimate and introspective. Duration: 2 minutes, no lyrics.",
        "description": "羽调式 (水), 60 BPM 静谧, 二胡揉音大提琴连奏",
        "scene": "睡前 / 深度放松时",
        "wuxing": "水",
        "bpm": "60",
        "mode": "羽调式",
        "scale": "A-C-D-E-G 五声音阶",
        "icon": "💧",
        "color": "#A8D5BA",  # 浅绿
    },
    "温润": {
        # 宫调式 (土), C 五声音阶 (C-D-E-G-A), 70-85 BPM, 埙+古筝
        "prompt": "A steady, grounding instrumental piece in 宫调式 (Gong mode, pentatonic scale C-D-E-G-A), 75 BPM, 4/4 time signature. Primary instruments: xun (埙), guzheng, cello, piano mid-low register. Acoustic parameters: reverb=hall, wetness=25%, attack=soft, decay=moderate, brightness=warm dark. Full, warm, round timbre like embracing mother earth. Broad, sustained notes, minimal ornamentation, steady pulse. Melody centered around the tonic C, grounding and reassuring. Dynamic mf, with occasional crescendo. Evoke stability, nourishment, centering, and inner peace. Duration: 2 minutes, no lyrics.",
        "description": "宫调式 (土), 75 BPM 沉稳, 埙长音古筝低音",
        "scene": "下午茶 / 缓慢工作时",
        "wuxing": "土",
        "bpm": "75",
        "mode": "宫调式",
        "scale": "C-D-E-G-A 五声音阶",
        "icon": "🍵",
        "color": "#E6C79C",  # 暖橙
    },
    "通透": {
        # 商调式 (金), D 五声音阶 (D-E-G-A-C), 80-100 BPM, 钢琴+编钟
        "prompt": "A clear, crisp instrumental piece in 商调式 (Shang mode, pentatonic scale D-E-G-A-C), 85 BPM, 4/4 time signature. Primary instruments: piano, chimes, metal percussion, trumpet or saxophone staccato. Acoustic parameters: reverb=none or plate, wetness=15%, attack=sharp, decay=short, brightness=bright. Bright, clear, slightly sharp-edged timbre with metallic resonance. Clean articulation, detached notes, spacious and airy. Melodic lines with clear direction, autumnal atmosphere. Dynamic mf-mp, with moments of bright intensity. Evoke clarity, letting go, precision, and inner strength. Duration: 2 minutes, no lyrics.",
        "description": "商调式 (金), 85 BPM 清朗, 钢琴断奏编钟",
        "scene": "冥想 / 自我对话时",
        "wuxing": "金",
        "bpm": "85",
        "mode": "商调式",
        "scale": "D-E-G-A-C 五声音阶",
        "icon": "✨",
        "color": "#B8D8E8",  # 浅蓝
    },
    "晨光": {
        # 角调式 (木), E 五声音阶 (E-G-A-B-D), 60-80 BPM, 古琴+竹笛
        "prompt": "A slow-flowing instrumental piece in 角调式 (Jue mode, pentatonic scale E-G-A-B-D), 70 BPM, 4/4 time signature. Primary instruments: guqin with sliding tones, bamboo flute with breathy tone, harp, gentle strings. Acoustic parameters: reverb=large hall, wetness=35%, attack=soft, decay=moderate, brightness=warm neutral. Warm wooden timbre, natural and organic atmosphere. Melody rises and falls like branches swaying in spring breeze. Gentle pentatonic phrases, spacious phrasing, soft dynamic (mp-mf). Evoke a sense of growth, renewal, and gentle vitality. Duration: 2 minutes, no lyrics.",
        "description": "角调式 (木), 70 BPM 舒展, 古琴滑音竹笛揉音",
        "scene": "晨起 / 静心阅读时",
        "wuxing": "木",
        "bpm": "70",
        "mode": "角调式",
        "scale": "E-G-A-B-D 五声音阶",
        "icon": "🌅",
        "color": "#F4D35E",  # 暖黄
    },
    "黄昏": {
        # 徵调式 (火), G 五声音阶 (G-A-C-D-E), 90-110 BPM, 琵琶+小提琴
        "prompt": "A bright, uplifting instrumental piece in 徵调式 (Zhi mode, pentatonic scale G-A-C-D-E), 95 BPM, 2/4 or 6/8 time signature. Primary instruments: pipa with rapid tremolo, violin, bright guitar, warm brass. Acoustic parameters: reverb=chamber, wetness=20%, attack=moderate, decay=short, brightness=bright. Radiant and warm timbre, sparkling and energetic. Rhythmic pulse like dancing flames, joyful and celebratory. Crisp articulation, upward melodic motion, dynamic f. Evoke warmth, joy, passion, and heart-opening energy. Duration: 2 minutes, no lyrics.",
        "description": "徵调式 (火), 95 BPM 热烈, 琵琶轮指小提琴",
        "scene": "傍晚 / 整理一日时",
        "wuxing": "火",
        "bpm": "95",
        "mode": "徵调式",
        "scale": "G-A-C-D-E 五声音阶",
        "icon": "🌆",
        "color": "#E8998C",  # 暖红
    },
}

# v0.7.1.7.5: 5 个示例 MP3 base64 嵌入 (走五行白皮书 v1.2 严格 prompt 重生成)
# 严守: 由 MiniMax AI 生成, 严守 8 禁用词 0 出现, 严守 5.2 节五行调式模板
# Cloud 兼容: base64 嵌入, 不依赖 CDN 7 天有效期, 不依赖 mavis CLI
# 真生成 (本地 dev): UI 上「✨ 真生成」折叠按钮可调 MCP, 需本地 mavis daemon
# v0.7.1.7.5-r2 rollback: 5 MP3 base64 嵌进 repo 让 Streamlit Cloud 报 ImportError
# (推测: Cloud git clone 大文件被截断, 4.7MB base64 字符串 dict 解析失败)
# 改回 CDN URL 模式, 接受 7 天失效 (跟 v0.7.1.4 一致)
# 真生成 (本地 dev): UI 上「✨ 真生成」折叠按钮可调 MCP, 需本地 mavis daemon
DEMO_URLS = {
    # 5 滋养曲风 (走五行白皮书 v1.2 prompt, 5.2 节模板), MiniMax hailuoai.com CDN 7 天有效
    "清润": "https://cdn.hailuoai.com/mcp/u503581678484750338/music_tool/output/1783502569_999058bb.mp3",  # 60 BPM 羽调式
    "温润": "https://cdn.hailuoai.com/mcp/u503581678484750338/music_tool/output/1783502616_11c7604e.mp3",  # 75 BPM 宫调式
    "通透": "https://cdn.hailuoai.com/mcp/u503581678484750338/music_tool/output/1783502665_d532952c.mp3",  # 85 BPM 商调式
    "晨光": "https://cdn.hailuoai.com/mcp/u503581678484750338/music_tool/output/1783502769_452db1d0.mp3",  # 70 BPM 角调式
    "黄昏": "https://cdn.hailuoai.com/mcp/u503581678484750338/music_tool/output/1783502846_a9a8175e.mp3",  # 95 BPM 徵调式
}# 心颜严守: 不允许的曲风关键词
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

    # Demo 模式 (Cloud 兼容): 用预生成 CDN URL, 不调 MCP
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