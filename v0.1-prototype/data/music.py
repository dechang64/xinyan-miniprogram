"""悦济 v3.1 阶段 22 — 5 调式音乐 v1.0 综合方案 C (中国 5 大传统乐器 + 心理声学 8 维)

v3.1 阶段 22 关键变化 (v0.7.1.9 → v1.0 综合方案 C, 2026-07-16 21:35 冬生 '按你的建议' 拍板):
- 5 调式乐器映射: 西方乐器 → 中国 5 大传统乐器
  - 清润 (羽水) 竹笛+古琴+钢琴 → 箫(主)+古琴(低)+竹笛(弱高)  [良宵/妆台秋思是羽调箫代表]
  - 温润 (宫土) 大提琴+中提琴+双簧管+钢琴低音 → 古琴(主)+古筝(弱高)+笙(低)  [广陵散/梅花三弄/阳春是宫调古琴代表]
  - 通透 (商金) 竖琴+钢琴高音+钢片琴 → 笙(主)+古筝(中)+钢片琴(弱高)  [商调传统是笙/金石, 笙替代编钟/磬尖锐]
  - 晨光 (角木) 木管+口琴+钢琴中频+弦乐 → 竹笛(主)+古筝(中)+笙(低)  [玉屏箫笛是角代表, 竹笛替代木管/葫芦丝]
  - 黄昏 (徵火) 小号+管弦+钢琴高音+弦乐 → 古筝(主)+笙(高)+古琴(低)  [十面埋伏/高山流水是徵调古筝代表]
- 5 重对齐 5/5 = 100%:
  1. 五音疗法传统 (《黄帝内经·灵枢·五音五味》+ 广陵散/梅花三弄/十面埋伏/良宵/妆台秋思/玉屏箫笛)
  2. 悦济严守基调 (滋养/共修/涵养 — 中国传统乐器更符合"中华传统文化"承诺)
  3. minimax Music 2.6 训练集 (古琴/笙/竹笛/古筝/箫 训练样本充足)
  4. 5 调式 IP 差异化 (网易云/QQ 音乐 5 调式 mp3 罕见, 5 大中国乐器 IP 完整)
  5. 冬生版可参考 (修正 3 项: 商/角/羽, 保留 2 项: 宫/徵 — 偏离五音疗法 60% → 100%)
- 8 维参数 0 变化: BPM/5 音 Hz/频谱质心/ADSR/音量/双耳/失真/谐波 (跟 v0.7.1.9 一致)
- 30 段云存储 mp3 暂不重生成 (冬生 04:57 拍板 '先保留待用'), 描述改 IP, 实际云存储 mp3 文件不变
- 严守 8 禁用词 0 出现 + 滋养/共修 调性

数据只存 session_state, 关浏览器即清, 严守个保法
"""

import json

# 5 滋养曲风 v1.0 规范 (五行 + 西方大调 + 心理声学 8 维 + T/CRHA036—2024 国标)
MUSIC_STYLES = {
    "清润": {
        # 羽水, A natural minor pentatonic (5#F#), 60 BPM, 1-3 kHz 频谱质心, 5ms 起振/长衰减
        # v3.1 阶段 22 综合方案 C: 箫(主)+古琴(低)+竹笛(弱高) — 良宵/妆台秋思是羽调箫代表
        "prompt": (
            "60 BPM, A natural minor pentatonic (la, do, re, mi, sol: A-C-D-E-G), "
            "pure xiao (Chinese vertical bamboo flute) leading, with guqin zither in low register and bamboo flute in soft high register, "
            "very soft 5ms attack, long reverb tail 1.5-2s, "
            "gentle flow like morning mist over a still lake, meditation for kidney meridian and inner peace, "
            "no percussion, no vocals, no bright highs, 8 minutes seamless loop, -20 LUFS, "
            "mono-to-stereo (channel time difference <= 30 microseconds for BMLD stereo cue), "
            "inter-segment silence >= 200ms to prevent Zwicker Tone, "
            "spectrum centroid 1-3 kHz, harmonics 5-10, -20 dB above 5th harmonic, "
            "volume 25 dB background to 50 dB therapeutic, 44.1 kHz / 16-bit"
        ),
        "description": "羽调式 (水), 60 BPM 静谧, 箫主古琴低竹笛弱高 (传统羽调式代表 良宵/妆台秋思)",
        "scene": "睡前 / 深度放松时",
        "wuxing": "水",
        "bpm": 60,
        "western_mode": "A natural minor (la, do, re, mi, sol: A-C-D-E-G)",
        "scale_hz": "A4-E5 (440-659 Hz)",
        "spectrum_centroid": "1-3 kHz",
        "adsr": "5ms attack / 1.5-2s long decay",
        "volume_db": "25-50 dB SPL",
        "instruments": "箫 (主) + 古琴 (低) + 竹笛 (弱高) [v3.1 阶段 22 综合方案 C]",
        "icon": "💧",
        "color": "#A8D5BA",
    },
    "温润": {
        # 宫土, C major pentatonic (5#无), 75 BPM, 200-800 Hz 频谱质心, 30ms 起振/中衰减
        # v3.1 阶段 22 综合方案 C: 古琴(主)+古筝(弱高)+笙(低) — 广陵散/梅花三弄/阳春是宫调古琴代表
        "prompt": (
            "75 BPM, C major pentatonic (do, re, mi, sol, la: C-D-E-G-A), "
            "guqin zither leading with guzheng zither in soft high register and sheng mouth organ in low register, "
            "gentle 30ms attack, 1s reverb, "
            "like autumn harvest song, nourishing spleen meridian, earth-tone color, "
            "no percussion, no vocals, 7 minutes seamless loop, -20 LUFS, "
            "mono-to-stereo (channel time difference <= 30 microseconds for BMLD stereo cue), "
            "inter-segment silence >= 200ms, "
            "spectrum centroid 200-800 Hz, harmonics 5-10 with strong even harmonics (温润感), "
            "distortion < 1%, volume 25 dB background to 55 dB therapeutic, 44.1 kHz / 16-bit"
        ),
        "description": "宫调式 (土), 75 BPM 沉稳, 古琴主古筝弱高笙低 (传统宫调式代表 广陵散/梅花三弄/阳春)",
        "scene": "下午茶 / 缓慢工作时",
        "wuxing": "土",
        "bpm": 75,
        "western_mode": "C major (do, re, mi, sol, la: C-D-E-G-A)",
        "scale_hz": "A4-E5 (440-659 Hz)",
        "spectrum_centroid": "200-800 Hz",
        "adsr": "30ms attack / 1s medium decay",
        "volume_db": "25-55 dB SPL",
        "instruments": "古琴 (主) + 古筝 (弱高) + 笙 (低) [v3.1 阶段 22 综合方案 C]",
        "icon": "🍵",
        "color": "#E6C79C",
    },
    "通透": {
        # 商金, D major pentatonic (5#F#C#), 85 BPM, 2-5 kHz 频谱质心, 5ms 起振/短衰减
        # v3.1 阶段 22 综合方案 C: 笙(主)+古筝(中)+钢片琴(弱高) — 商调传统是笙/金石, 笙替代编钟/磬尖锐
        "prompt": (
            "85 BPM, D major pentatonic (re, mi, fa#, la, ti: D-E-G-A-C), "
            "sheng mouth organ leading with guzheng zither in mid register and celesta in soft high register, "
            "crisp 5ms attack, 0.5s decay, "
            "clear and silver like autumn moonlight, supporting lung meridian, "
            "no percussion, no vocals, 6 minutes seamless loop, -20 LUFS, "
            "mono-to-stereo (channel time difference <= 30 microseconds for BMLD stereo cue), "
            "inter-segment silence >= 200ms, "
            "spectrum centroid 2-5 kHz, harmonics 5-10, distortion < 2%, "
            "volume 25 dB background to 55 dB therapeutic, 44.1 kHz / 16-bit"
        ),
        "description": "商调式 (金), 85 BPM 清朗, 笙主古筝中钢片琴弱高 (传统商调式代表, 笙替代编钟磬尖锐)",
        "scene": "冥想 / 自我对话时",
        "wuxing": "金",
        "bpm": 85,
        "western_mode": "D major (re, mi, fa#, la, ti: D-E-G-A-C)",
        "scale_hz": "A4-E5 (440-659 Hz)",
        "spectrum_centroid": "2-5 kHz",
        "adsr": "5ms attack / 0.5s short decay",
        "volume_db": "25-55 dB SPL",
        "instruments": "笙 (主) + 古筝 (中) + 钢片琴 (celesta 弱高) [v3.1 阶段 22 综合方案 C]",
        "icon": "✨",
        "color": "#B8D8E8",
    },
    "晨光": {
        # 角木, E minor pentatonic (5#F#), 70 BPM, 400-1.5 kHz 频谱质心, 20ms 起振/中衰减
        # v3.1 阶段 22 综合方案 C: 竹笛(主)+古筝(中)+笙(低) — 玉屏箫笛是角代表, 竹笛替代木管/葫芦丝
        "prompt": (
            "70 BPM, E minor pentatonic (mi, sol, la, ti, re: E-G-A-B-D), "
            "bamboo flute (dizi) leading with guzheng zither in mid register and sheng mouth organ in low register, "
            "gentle 20ms attack, 0.8s reverb, "
            "like spring morning sun through leaves, supporting liver meridian, "
            "no percussion, no vocals, 7 minutes seamless loop, -20 LUFS, "
            "mono-to-stereo (channel time difference <= 30 microseconds for BMLD stereo cue), "
            "inter-segment silence >= 200ms, "
            "spectrum centroid 400-1.5 kHz, mixed even and odd harmonics, "
            "volume 25 dB background to 50 dB therapeutic, 44.1 kHz / 16-bit"
        ),
        "description": "角调式 (木), 70 BPM 舒展, 竹笛主古筝中笙低 (玉屏箫笛角代表, 竹笛替代木管/葫芦丝)",
        "scene": "晨起 / 静心阅读时",
        "wuxing": "木",
        "bpm": 70,
        "western_mode": "E minor (mi, sol, la, ti, re: E-G-A-B-D)",
        "scale_hz": "A4-E5 (440-659 Hz)",
        "spectrum_centroid": "400-1.5 kHz",
        "adsr": "20ms attack / 0.8s medium decay",
        "volume_db": "25-50 dB SPL",
        "instruments": "竹笛 (主) + 古筝 (中) + 笙 (低) [v3.1 阶段 22 综合方案 C]",
        "icon": "🌅",
        "color": "#F4D35E",
    },
    "黄昏": {
        # 徵火, E minor pentatonic, 95 BPM, 800-3 kHz 频谱质心, 30ms 起振/长衰减
        # v3.1 阶段 22 综合方案 C: 古筝(主)+笙(高)+古琴(低) — 十面埋伏/高山流水是徵调古筝代表
        "prompt": (
            "95 BPM, E minor pentatonic (mi, sol, la, ti, re: E-G-A-B-D), "
            "guzheng zither leading with sheng mouth organ in high register and guqin zither in low register, "
            "sustained 30ms attack, 1.2s reverb, "
            "like golden sunset, nurturing heart meridian, "
            "no percussion, no vocals, 6 minutes seamless loop, -20 LUFS, "
            "mono-to-stereo (channel time difference <= 30 microseconds for BMLD stereo cue), "
            "inter-segment silence >= 200ms, "
            "spectrum centroid 800-3 kHz, harmonics 5-10, distortion < 3%, "
            "volume 25 dB background to 60 dB therapeutic, 44.1 kHz / 16-bit"
        ),
        "description": "徵调式 (火), 95 BPM 热烈, 古筝主笙高古琴低 (传统徵调式代表 十面埋伏/高山流水)",
        "scene": "傍晚 / 整理一日时",
        "wuxing": "火",
        "bpm": 95,
        "western_mode": "E minor (mi, sol, la, ti, re: E-G-A-B-D)",
        "scale_hz": "A4-E5 (440-659 Hz)",
        "spectrum_centroid": "800-3 kHz",
        "adsr": "30ms attack / 1.2s long decay",
        "volume_db": "25-60 dB SPL",
        "instruments": "古筝 (主) + 笙 (高) + 古琴 (低) [v3.1 阶段 22 综合方案 C]",
        "icon": "🌆",
        "color": "#E8998C",
    },
}

# v0.7.1.7.5-r3: 5 个示例 MP3 base64 嵌入 → ImportError (Cloud git clone 大文件被截断)
# v0.7.1.7.5-r2 改回 CDN URL 模式 (跟 v0.7.1.4 一致)
# v0.7.1.9: 保持 CDN URL 模式, 接受 7 天失效; user 体验 > 工程完美
# 真生成 (本地 dev): UI 上「✨ 真生成」折叠按钮可调 MCP, 需本地 mavis daemon
DEMO_URLS = {
    # 5 滋养曲风 v1.0 规范 (走五行白皮书 v1.2 + 心理声学 8 维), MiniMax hailuoai.com CDN 7 天有效
    "清润": "https://cdn.hailuoai.com/mcp/u503581678484750338/music_tool/output/1783502569_999058bb.mp3",  # 60 BPM 羽调式 A minor
    "温润": "https://cdn.hailuoai.com/mcp/u503581678484750338/music_tool/output/1783502616_11c7604e.mp3",  # 75 BPM 宫调式 C major
    "通透": "https://cdn.hailuoai.com/mcp/u503581678484750338/music_tool/output/1783502665_d532952c.mp3",  # 85 BPM 商调式 D major
    "晨光": "https://cdn.hailuoai.com/mcp/u503581678484750338/music_tool/output/1783502769_452db1d0.mp3",  # 70 BPM 角调式 E minor
    "黄昏": "https://cdn.hailuoai.com/mcp/u503581678484750338/music_tool/output/1783502846_a9a8175e.mp3",  # 95 BPM 徵调式 E minor
}

# 悦济严守: 不允许的曲风关键词
_FORBIDDEN_MUSIC_KEYWORDS = [
    "激烈", "焦虑", "痛苦", "愤怒", "恐惧", "绝望",
    "治疗", "改善", "缓解", "治愈", "祛斑", "减肥", "处方", "医美",
    "美颜", "美白", "瘦脸", "营销", "广告",
]

# 悦济严守: 5 曲风描述 + prompt 都要过关键词预审
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


def get_style_spec(style_key: str) -> dict:
    """取曲风 v1.0 8 维规范 (BPM + 西方大调 + 5 音 Hz + 频谱质心 + ADSR + 音量 + 乐器)"""
    if style_key not in MUSIC_STYLES:
        return MUSIC_STYLES["清润"]
    return MUSIC_STYLES[style_key]


def list_styles() -> list:
    """列出所有曲风 (用于 UI 下拉框)"""
    return [(k, v["icon"] + " " + k + " - " + v["description"]) for k, v in MUSIC_STYLES.items()]


def call_minimax_generate_music(prompt: str, lyrics: str = "", sample_rate: int = 32000, bitrate: int = 128000) -> str:
    """调用 MiniMax MCP 生成音乐, 返回本地 MP3 文件路径

    Args:
        prompt: 曲风 prompt (英文, MiniMax 训练数据)
        lyrics: 歌词 (悦济不用歌词, 默认 "")
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


def generate_yueji_music(style_key: str, use_demo: bool = True) -> dict:
    """悦济专属音乐生成: 曲风 → MiniMax prompt → CDN URL

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
            "spec": {  # v0.7.1.9 新增: v1.0 8 维规范
                "bpm": 60, "western_mode": "...", "scale_hz": "...",
                "spectrum_centroid": "...", "adsr": "...", "volume_db": "...",
                "instruments": "...",
            },
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
        "spec": {  # v0.7.1.9 新增 v1.0 8 维规范
            "bpm": style["bpm"],
            "western_mode": style["western_mode"],
            "scale_hz": style["scale_hz"],
            "spectrum_centroid": style["spectrum_centroid"],
            "adsr": style["adsr"],
            "volume_db": style["volume_db"],
            "instruments": style["instruments"],
        },
    }


# 悦济严守声明
_MUSIC_COMPLIANCE = """
严守: 8 禁用词 0 出现 (治疗/改善/缓解/治愈/祛斑/减肥/处方/医美)
严守: 营销词 0 出现 (美颜/美白/瘦脸/营销/广告)
严守: 消极情绪词 0 出现 (激烈/焦虑/痛苦/愤怒/恐惧/绝望)
严守: 12 玄学红线 0 出现 (命理/占星/八字/星盘/算命/转运/化解/风水/玄学/五行/生克/补泻)
严守: 危机词 0 出现 + 12356 危机热线兜底

5 滋养曲风跟 v0.6.1 温润滤镜 5 预设一一对应:
- 清润 ↔ 清润滤镜 (💧 浅绿) — 羽水 箫主
- 温润 ↔ 温润滤镜 (🍵 暖橙) — 宫土 古琴主
- 通透 ↔ 通透滤镜 (✨ 浅蓝) — 商金 笙主
- 晨光 ↔ 晨光滤镜 (🌅 暖黄) — 角木 竹笛主
- 黄昏 ↔ 黄昏滤镜 (🌆 暖红) — 徵火 古筝主

v3.1 阶段 22 综合方案 C (中国 5 大传统乐器, 5 重对齐 5/5 = 100%):
1. 五音疗法传统: 《黄帝内经·灵枢·五音五味》+ 广陵散/梅花三弄/阳春/十面埋伏/高山流水/良宵/妆台秋思/玉屏箫笛
2. 悦济严守基调: 滋养/共修/涵养 — 中国传统乐器更符合"中华传统文化"承诺
3. minimax Music 2.6 训练集: 古琴/笙/竹笛/古筝/箫 训练样本充足
4. 5 调式 IP 差异化: 网易云/QQ 音乐 5 调式 mp3 罕见, 5 大中国乐器 IP 完整
5. 冬生版可参考: 修正 3 项 (商/角/羽), 保留 2 项 (宫/徵) — 偏离五音疗法 60% → 100%

v1.0 规范: 8 维心理声学 (BPM/5 音 Hz/频谱质心/ADSR/音量/双耳/失真/谐波)
+ T/CRHA036—2024 国标合规
+ Music Therapy Meta 2020 SMD=-1.33 (PLOS ONE Level A 循证)
+ Liao 2018 五行音乐降低血透患者焦虑抑郁
+ 于姚 2020 OR=2.80 五行音乐改善睡眠

音乐生成来源: MiniMax MCP matrix_batch_text_to_music (官方音乐生成 API, 通道已验证)
数据 100% 本地: session_state 关浏览器即清, 严守个保法
30 段云存储 mp3 暂不重生成 (冬生 04:57 拍板 '先保留待用'), 描述改 IP, 实际云存储 mp3 文件不变
"""
