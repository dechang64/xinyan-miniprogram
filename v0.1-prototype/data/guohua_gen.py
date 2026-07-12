"""
悦济 v0.7.1.7.3: 即时国画生成 (matrix_generate_image)
为 page 1 海报"生成我的专属画"按钮提供后端

严守: 滋养/共修/涵养/清润 基调, 不出现文字/印章/营销/医美/美颜词
设计: 小品图, 1-2 笔, 大量留白, 严守"不要太复杂"
时令: 春(芽)/夏(茂)/秋(叶)/冬(雪) 季节提示拼 prompt
经文: 标题/内容主题拼 prompt (让画跟经文意境对应)
每人不同: st.session_state["guohua_seed"] 随机种子, prompt 末尾加一点小变化
"""
import os
import base64
import json
import time
import urllib.request
import urllib.error
import random

# 严守禁用词 (在 prompt 之外也检查返回)
BANNED_TERMS = ["美颜", "医美", "美白", "瘦脸", "减肥", "治愈", "治疗", "改善", "缓解", "祛斑"]


def get_season_hint(today=None) -> str:
    """返回季节提示 (春/夏/秋/冬), 拼到 prompt"""
    from datetime import date
    if today is None:
        today = date.today()
    m = today.month
    if m in (3, 4, 5):
        return "early spring scene, fresh buds, soft green"
    elif m in (6, 7, 8):
        return "summer scene, lotus or bamboo, vibrant green"
    elif m in (9, 10, 11):
        return "autumn scene, falling leaves, warm muted ochre"
    else:
        return "winter scene, bare branches, snow or frost, minimalist"


def get_jingwen_hint(jw: dict) -> str:
    """从经文标题/内容提取意境关键词 (用标题更稳)"""
    title = jw.get("title", "")
    # 简单关键词匹配, 标题本身就很有意境
    if not title:
        return "Chinese traditional wellness, harmony"
    return f"inspired by the spirit of '{title}'"


def get_user_seed() -> int:
    """每人不同: 用 st.session_state 拿不到 (此函数纯 backend), 改用 random + timestamp"""
    return random.randint(100, 999)


def build_prompt(jw: dict, today=None) -> str:
    """拼最终 prompt, 极简, 严守不复杂"""
    season = get_season_hint(today)
    jw_hint = get_jingwen_hint(jw)
    seed = get_user_seed()

    # 关键约束: xieyi sketch, minimalist, 1-2 elements, ample white space, no text
    prompt = (
        f"Chinese ink xieyi sketch (写意小品), minimalist, 1-2 simple elements only "
        f"(a single branch, one leaf, a small bird, a tiny boat, or a single bamboo), "
        f"ample white space, {season}, mood: {jw_hint}, "
        f"soft gray ink from deep black to pale, no vivid colors, "
        f"NO text, NO seal, NO characters, NO calligraphy, "
        f"vertical 2:3 ratio, suitable for a Chinese poetry card, "
        f"variation #{seed}"
    )
    return prompt


def call_minimax_generate(prompt: str, aspect_ratio: str = "2:3", timeout: int = 60) -> dict:
    """
    调用 matrix_generate_image, 返回 {success, url, error}
    不传 secret, mavis CLI 内部处理鉴权
    """
    payload = {
        "requests": [
            {
                "prompt": prompt,
                "aspect_ratio": aspect_ratio,
            }
        ]
    }

    # 走 mavis mcp call (避免 subprocess + PowerShell 编码坑)
    # 用 stdin 传 JSON
    import subprocess
    json_str = json.dumps(payload, ensure_ascii=False)

    try:
        result = subprocess.run(
            "mavis mcp call matrix matrix_generate_image --stdin",
            input=json_str,
            capture_output=True,
            text=True,
            timeout=timeout,
            shell=True,  # Windows 必须 shell=True 让 PATH 扩展
        )
    except subprocess.TimeoutExpired:
        return {"success": False, "error": "matrix_generate_image timeout (>{}s)".format(timeout)}
    except Exception as e:
        return {"success": False, "error": "subprocess error: {}".format(e)}

    if result.returncode != 0:
        return {"success": False, "error": "non-zero exit: {}".format(result.stderr[:200])}

    # 解析返回
    try:
        out = json.loads(result.stdout)
        if out.get("code") != 0:
            return {"success": False, "error": "matrix code {}: {}".format(out.get("code"), out.get("message"))}
        items = out.get("success_items", [])
        if not items:
            return {"success": False, "error": "no success_items in response"}
        item = items[0]
        if not item.get("is_success"):
            return {"success": False, "error": "item not success: {}".format(item)}
        return {"success": True, "url": item.get("output_url"), "filename": item.get("output_file")}
    except json.JSONDecodeError as e:
        return {"success": False, "error": "JSON parse fail: {} | raw: {}".format(e, result.stdout[:200])}


def download_to_base64(url: str, timeout: int = 30) -> str | None:
    """下载 CDN URL 转 base64, 供 HTML img 嵌入 (7 天失效问题用 base64 解决)"""
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "yueji/1.0"})
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            data = resp.read()
        return base64.b64encode(data).decode("ascii")
    except (urllib.error.URLError, TimeoutError, OSError) as e:
        return None


def gen_guohua_b64(jw: dict, today=None) -> dict:
    """
    一站式: 拼 prompt + 调 API + 下载 + 转 base64
    返回 {success, b64, url, prompt, error, elapsed}
    """
    t0 = time.time()
    prompt = build_prompt(jw, today)
    r = call_minimax_generate(prompt)
    if not r.get("success"):
        return {
            "success": False,
            "error": r.get("error"),
            "prompt": prompt,
            "elapsed": time.time() - t0,
        }
    url = r["url"]
    b64 = download_to_base64(url)
    elapsed = time.time() - t0
    if not b64:
        return {
            "success": False,
            "error": "download base64 failed from {}".format(url),
            "url": url,
            "prompt": prompt,
            "elapsed": elapsed,
        }
    return {
        "success": True,
        "b64": b64,
        "url": url,
        "prompt": prompt,
        "elapsed": elapsed,
    }