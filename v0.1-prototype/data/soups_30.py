"""悦济 v0.1 原型 — 30 款养生美颜汤 数据

设计: 4 季 × 9 体质 (王琦) 简化组合, 严守「滋养而非治疗」
来源: CCTV《生活圈》+ 北京中医药大学 + 三甲医院营养科 + 大众养生网
"""
from datetime import date
import json
import os

DATA_FILE = os.path.join(os.path.dirname(__file__), "soups_30.json")

# 30 款汤品, 严守「滋养而非治疗」基调
# 字段: id, name, season (春/夏/秋/冬/通), tizhi (9 体质 key), ingredients, steps, effect, tags
SOUPS_30 = [
    # ── 春 (3 款, 养肝) ──
    {
        "id": 1, "name": "菠菜猪肝汤", "season": "春", "tizhi": "xueyu",
        "season_tag": "春养肝", "tizhi_tag": "血瘀质",
        "ingredients": "菠菜 200g, 猪肝 100g, 姜 3 片, 盐适量",
        "steps": "① 猪肝切片, 用清水浸泡 30 分钟去血水; ② 锅中加水煮沸, 放姜片和猪肝煮 5 分钟; ③ 加入菠菜煮 1 分钟, 加盐调味即可。",
        "effect": "养血润燥, 涵养肝血, 适合春季面色暗沉、易瘀斑者。",
        "tags": ["养肝", "养血", "春季"]
    },
    {
        "id": 2, "name": "玫瑰陈皮茶", "season": "春", "tizhi": "qiyu",
        "season_tag": "春养肝", "tizhi_tag": "气郁质",
        "ingredients": "玫瑰花 5g, 陈皮 3g, 蜂蜜适量",
        "steps": "① 玫瑰花和陈皮用温水冲洗; ② 加入 300ml 沸水冲泡, 盖盖焖 5 分钟; ③ 温饮, 可加蜂蜜调味。",
        "effect": "疏肝理气, 解郁安神, 适合春季情绪低落、胸闷叹气者。",
        "tags": ["疏肝", "解郁", "春季"]
    },
    {
        "id": 3, "name": "山药红枣粥", "season": "春", "tizhi": "pinghe",
        "season_tag": "春养肝", "tizhi_tag": "平和质",
        "ingredients": "山药 100g, 红枣 6 颗, 粳米 50g",
        "steps": "① 山药去皮切块, 红枣去核; ② 与粳米一起加水 800ml; ③ 大火煮开转小火慢熬 40 分钟即可。",
        "effect": "健脾养胃, 滋养气血, 适合春季日常平和调养。",
        "tags": ["健脾", "养胃", "平和"]
    },

    # ── 夏 (5 款, 养心 / 清热) ──
    {
        "id": 4, "name": "绿豆百合汤", "season": "夏", "tizhi": "yinxu",
        "season_tag": "夏养心", "tizhi_tag": "阴虚质",
        "ingredients": "绿豆 50g, 百合 20g, 冰糖适量",
        "steps": "① 绿豆提前浸泡 2 小时; ② 加水 1000ml 大火煮开转小火煮 30 分钟; ③ 加入百合和冰糖再煮 10 分钟。",
        "effect": "清心降火, 润燥生津, 适合夏季口燥咽干、手心热者。",
        "tags": ["清心", "降火", "夏季"]
    },
    {
        "id": 5, "name": "冬瓜薏仁汤", "season": "夏", "tizhi": "tanshi",
        "season_tag": "夏养心", "tizhi_tag": "痰湿质",
        "ingredients": "冬瓜 300g, 薏仁 30g, 姜 2 片",
        "steps": "① 薏仁提前浸泡 1 小时; ② 冬瓜带皮切块; ③ 一起加水 800ml 煮 40 分钟即可。",
        "effect": "利水祛湿, 化痰健脾, 适合夏季体形偏胖、痰多面油者。",
        "tags": ["祛湿", "化痰", "夏季"]
    },
    {
        "id": 6, "name": "莲子心茶", "season": "夏", "tizhi": "shire",
        "season_tag": "夏养心", "tizhi_tag": "湿热质",
        "ingredients": "莲子心 3g, 甘草 2g",
        "steps": "① 莲子心和甘草冲洗; ② 加 300ml 沸水冲泡; ③ 焖 5 分钟即可饮用, 可反复冲泡。",
        "effect": "清心火, 化湿热, 适合夏季面油有痤疮、口苦者。",
        "tags": ["清心火", "化湿热", "夏季"]
    },
    {
        "id": 7, "name": "红枣桂圆粥", "season": "夏", "tizhi": "qixu",
        "season_tag": "夏养心", "tizhi_tag": "气虚质",
        "ingredients": "红枣 6 颗, 桂圆肉 10g, 粳米 50g, 莲子 10g",
        "steps": "① 红枣去核, 莲子去芯; ② 与粳米桂圆一起加水 800ml; ③ 大火煮开转小火慢熬 40 分钟。",
        "effect": "补气养血, 安心宁神, 适合夏季易疲乏、少气懒言者。",
        "tags": ["补气", "养血", "夏季"]
    },
    {
        "id": 8, "name": "荷叶冬瓜汤", "season": "夏", "tizhi": "pinghe",
        "season_tag": "夏养心", "tizhi_tag": "平和质",
        "ingredients": "荷叶 半张, 冬瓜 200g, 盐适量",
        "steps": "① 荷叶洗净切条; ② 冬瓜带皮切块; ③ 加水 800ml 大火煮开转小火煮 20 分钟, 加盐即可。",
        "effect": "清暑利湿, 轻身养颜, 适合夏季日常平和调养。",
        "tags": ["清暑", "利湿", "夏季"]
    },

    # ── 秋 (6 款, 养肺 / 润燥) ──
    {
        "id": 9, "name": "银耳莲子汤", "season": "秋", "tizhi": "yinxu",
        "season_tag": "秋养肺", "tizhi_tag": "阴虚质",
        "ingredients": "银耳 1 朵, 莲子 20g, 百合 15g, 冰糖适量",
        "steps": "① 银耳冷水泡发 2 小时撕小朵; ② 莲子去芯, 百合洗净; ③ 一起加水 1000ml 煮 40 分钟即可。",
        "effect": "润肺生津, 滋阴养颜, 适合秋季口干咽燥、皮肤干燥者。",
        "tags": ["润肺", "生津", "秋季"]
    },
    {
        "id": 10, "name": "雪梨川贝盅", "season": "秋", "tizhi": "pinghe",
        "season_tag": "秋养肺", "tizhi_tag": "平和质",
        "ingredients": "雪梨 1 个, 川贝 3g, 冰糖适量",
        "steps": "① 雪梨顶部切开当盖, 挖去内核; ② 放入川贝和冰糖; ③ 盖上梨盖, 蒸锅蒸 40 分钟。",
        "effect": "润肺止咳, 化痰生津, 适合秋季干燥、日常润养。",
        "tags": ["润肺", "止咳", "秋季"]
    },
    {
        "id": 11, "name": "五指毛桃汤", "season": "秋", "tizhi": "qixu",
        "season_tag": "秋养肺", "tizhi_tag": "气虚质",
        "ingredients": "五指毛桃 30g, 淮山 20g, 红枣 4 颗, 排骨 200g",
        "steps": "① 排骨焯水; ② 五指毛桃淮山红枣洗净; ③ 一起加水 1000ml 炖 1.5 小时, 加盐即可。",
        "effect": "益气健脾, 补肺固表, 适合秋季易疲乏、易感冒者。",
        "tags": ["益气", "健脾", "秋季"]
    },
    {
        "id": 12, "name": "百合银耳莲子羹", "season": "秋", "tizhi": "yangxu",
        "season_tag": "秋养肺", "tizhi_tag": "阳虚质",
        "ingredients": "百合 20g, 银耳 1 朵, 莲子 20g, 桂圆 10g",
        "steps": "① 银耳泡发, 莲子去芯; ② 全部食材加水 1000ml 煮 40 分钟; ③ 加冰糖调味。",
        "effect": "温润养肺, 滋补而不燥, 适合秋季阳虚怕冷者。",
        "tags": ["温润", "养肺", "秋季"]
    },
    {
        "id": 13, "name": "陈皮菊花茶", "season": "秋", "tizhi": "qiyu",
        "season_tag": "秋养肺", "tizhi_tag": "气郁质",
        "ingredients": "陈皮 5g, 菊花 3g",
        "steps": "① 陈皮和菊花冲洗; ② 加 300ml 沸水冲泡; ③ 焖 5 分钟即可, 可反复冲泡。",
        "effect": "理气解郁, 清肝明目, 适合秋季情绪低落、眼干涩者。",
        "tags": ["理气", "解郁", "秋季"]
    },
    {
        "id": 14, "name": "沙参玉竹老鸭汤", "season": "秋", "tizhi": "yinxu",
        "season_tag": "秋养肺", "tizhi_tag": "阴虚质",
        "ingredients": "沙参 15g, 玉竹 15g, 老鸭 半只, 姜 3 片",
        "steps": "① 老鸭切块焯水; ② 沙参玉竹洗净; ③ 全部加水 1500ml 炖 2 小时, 加盐即可。",
        "effect": "养阴润肺, 生津止渴, 适合秋季久咳、咽干、手心热者。",
        "tags": ["养阴", "润肺", "秋季"]
    },

    # ── 冬 (5 款, 养肾 / 温补) ──
    {
        "id": 15, "name": "当归生姜羊肉汤", "season": "冬", "tizhi": "yangxu",
        "season_tag": "冬养肾", "tizhi_tag": "阳虚质",
        "ingredients": "当归 10g, 生姜 30g, 羊肉 200g",
        "steps": "① 羊肉切块焯水; ② 当归生姜洗净; ③ 一起加水 1000ml 炖 1.5 小时, 加盐即可。",
        "effect": "温阳散寒, 补血养肝, 适合冬季怕冷、手脚冰凉者。",
        "tags": ["温阳", "散寒", "冬季"]
    },
    {
        "id": 16, "name": "黑芝麻糊", "season": "冬", "tizhi": "yinxu",
        "season_tag": "冬养肾", "tizhi_tag": "阴虚质",
        "ingredients": "黑芝麻 30g, 糯米 30g, 红枣 3 颗, 冰糖适量",
        "steps": "① 黑芝麻小火炒香; ② 全部食材加 600ml 水用破壁机打成米糊; ③ 煮沸加冰糖即可。",
        "effect": "滋补肝肾, 润养乌发, 适合冬季腰膝酸软、头发早白者。",
        "tags": ["滋补", "养肾", "冬季"]
    },
    {
        "id": 17, "name": "桂圆红枣茶", "season": "冬", "tizhi": "qixu",
        "season_tag": "冬养肾", "tizhi_tag": "气虚质",
        "ingredients": "桂圆肉 10g, 红枣 5 颗, 枸杞 5g",
        "steps": "① 红枣去核; ② 全部食材加 500ml 水; ③ 大火煮开转小火煮 20 分钟即可。",
        "effect": "补气养血, 安神助眠, 适合冬季易疲乏、睡眠浅者。",
        "tags": ["补气", "安神", "冬季"]
    },
    {
        "id": 18, "name": "核桃黑米粥", "season": "冬", "tizhi": "pinghe",
        "season_tag": "冬养肾", "tizhi_tag": "平和质",
        "ingredients": "核桃 3 个, 黑米 50g, 红枣 4 颗",
        "steps": "① 黑米提前浸泡 1 小时; ② 核桃掰碎; ③ 全部加水 800ml 慢熬 40 分钟即可。",
        "effect": "补肾养脑, 滋养乌发, 适合冬季日常平和调养。",
        "tags": ["补肾", "养脑", "冬季"]
    },
    {
        "id": 19, "name": "黄芪炖鸡", "season": "冬", "tizhi": "qixu",
        "season_tag": "冬养肾", "tizhi_tag": "气虚质",
        "ingredients": "黄芪 15g, 当归 5g, 母鸡 半只, 姜 3 片",
        "steps": "① 母鸡切块焯水; ② 黄芪当归洗净; ③ 全部加水 1500ml 炖 2 小时, 加盐即可。",
        "effect": "补气养血, 强身健体, 适合冬季体虚、易感冒者。",
        "tags": ["补气", "养血", "冬季"]
    },

    # ── 通季 (4 款, 适合全年) ──
    {
        "id": 20, "name": "红枣枸杞茶", "season": "通", "tizhi": "pinghe",
        "season_tag": "通季", "tizhi_tag": "平和质",
        "ingredients": "红枣 3 颗, 枸杞 5g",
        "steps": "① 红枣去核; ② 加 500ml 沸水冲泡; ③ 焖 5 分钟即可饮用。",
        "effect": "滋养脾胃, 养血安神, 适合四季日常平和调养。",
        "tags": ["滋养", "安神", "通季"]
    },
    {
        "id": 21, "name": "蜂蜜柠檬水", "season": "通", "tizhi": "yinxu",
        "season_tag": "通季", "tizhi_tag": "阴虚质",
        "ingredients": "柠檬 2 片, 蜂蜜 10g, 温水 300ml",
        "steps": "① 柠檬用盐搓洗后切片; ② 加温水 (不超 60℃) 冲泡; ③ 加蜂蜜搅匀即可。",
        "effect": "生津止渴, 润肤养颜, 适合四季日常滋阴润肤。",
        "tags": ["生津", "养颜", "通季"]
    },
    {
        "id": 22, "name": "山楂麦芽茶", "season": "通", "tizhi": "tanshi",
        "season_tag": "通季", "tizhi_tag": "痰湿质",
        "ingredients": "山楂 10g, 麦芽 10g, 红糖适量",
        "steps": "① 山楂麦芽冲洗; ② 加 500ml 水煮 15 分钟; ③ 加红糖调味即可。",
        "effect": "消食化积, 健脾化痰, 适合四季日常消食化湿。",
        "tags": ["消食", "化痰", "通季"]
    },
    {
        "id": 23, "name": "姜枣茶", "season": "通", "tizhi": "yangxu",
        "season_tag": "通季", "tizhi_tag": "阳虚质",
        "ingredients": "生姜 3 片, 红枣 6 颗, 红糖适量",
        "steps": "① 生姜切片, 红枣去核; ② 加 500ml 水煮 15 分钟; ③ 加红糖即可, 温饮。",
        "effect": "温中散寒, 养血安神, 适合四季日常温阳散寒。",
        "tags": ["温中", "散寒", "通季"]
    },

    # ── 长夏/季节交界 (7 款, 衔接季节) ──
    {
        "id": 24, "name": "四神汤", "season": "通", "tizhi": "tanshi",
        "season_tag": "通季", "tizhi_tag": "痰湿质",
        "ingredients": "茯苓 10g, 莲子 10g, 芡实 10g, 山药 (干) 10g, 猪骨 200g",
        "steps": "① 猪骨焯水; ② 四味中药洗净; ③ 一起加水 1500ml 炖 1 小时, 加盐即可。",
        "effect": "健脾祛湿, 安神助眠, 适合脾虚湿重、易疲乏者。",
        "tags": ["健脾", "祛湿", "通季"]
    },
    {
        "id": 25, "name": "四君子汤", "season": "通", "tizhi": "qixu",
        "season_tag": "通季", "tizhi_tag": "气虚质",
        "ingredients": "人参 (干) 10g, 白术 9g, 茯苓 9g, 甘草 6g",
        "steps": "① 全部中药洗净; ② 加 800ml 水煮 30-40 分钟; ③ 温饮, 可作药膳。",
        "effect": "益气健脾, 补元气, 适合气虚乏力、面色苍白者。",
        "tags": ["益气", "健脾", "通季"]
    },
    {
        "id": 26, "name": "四物汤", "season": "通", "tizhi": "xueyu",
        "season_tag": "通季", "tizhi_tag": "血瘀质",
        "ingredients": "当归 10g, 川芎 6g, 白芍 10g, 熟地黄 10g",
        "steps": "① 全部中药洗净; ② 加 600ml 水煮 20 分钟; ③ 温饮。孕妇不宜。",
        "effect": "补血调经, 养血活血, 适合血虚面色萎黄、月经不调者。",
        "tags": ["补血", "调经", "通季"]
    },
    {
        "id": 27, "name": "菊花决明子茶", "season": "通", "tizhi": "shire",
        "season_tag": "通季", "tizhi_tag": "湿热质",
        "ingredients": "菊花 3g, 决明子 10g, 枸杞 5g",
        "steps": "① 全部冲洗; ② 加 500ml 沸水冲泡; ③ 焖 5 分钟即可, 可反复冲泡。",
        "effect": "清肝明目, 润肠通便, 适合湿热体质、易上火者。",
        "tags": ["清肝", "明目", "通季"]
    },
    {
        "id": 28, "name": "酸枣仁汤", "season": "通", "tizhi": "qiyu",
        "season_tag": "通季", "tizhi_tag": "气郁质",
        "ingredients": "酸枣仁 10g, 茯神 10g, 知母 6g, 川芎 3g, 甘草 3g",
        "steps": "① 全部中药洗净; ② 加 600ml 水煮 30 分钟; ③ 睡前 1 小时温饮。",
        "effect": "养血安神, 清热除烦, 适合失眠多梦、心烦易怒者。",
        "tags": ["安神", "助眠", "通季"]
    },
    {
        "id": 29, "name": "莲藕排骨汤", "season": "秋", "tizhi": "pinghe",
        "season_tag": "秋养肺", "tizhi_tag": "平和质",
        "ingredients": "莲藕 300g, 排骨 200g, 姜 3 片, 盐适量",
        "steps": "① 排骨焯水; ② 莲藕去皮切块; ③ 一起加水 1000ml 炖 1.5 小时, 加盐即可。",
        "effect": "养阴润燥, 健脾开胃, 适合秋季口干、胃口不佳者。",
        "tags": ["养阴", "开胃", "秋季"]
    },
    {
        "id": 30, "name": "黑豆红枣汤", "season": "冬", "tizhi": "yangxu",
        "season_tag": "冬养肾", "tizhi_tag": "阳虚质",
        "ingredients": "黑豆 50g, 红枣 6 颗, 红糖适量",
        "steps": "① 黑豆提前浸泡 2 小时; ② 加水 800ml 大火煮开转小火煮 40 分钟; ③ 加红枣红糖再煮 10 分钟。",
        "effect": "补肾养血, 乌发养颜, 适合冬季肾虚、面色晦暗者。",
        "tags": ["补肾", "乌发", "冬季"]
    },
]


def _save():
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(SOUPS_30, f, ensure_ascii=False, indent=2)


def get_all() -> list:
    if not os.path.exists(DATA_FILE):
        _save()
    return SOUPS_30


def get_today_soup(today: date = None) -> dict:
    """按 today 选一款"""
    if today is None:
        today = date.today()
    idx = (today.timetuple().tm_yday % 30)
    return SOUPS_30[idx]


def get_by_id(sid: int) -> dict | None:
    for s in SOUPS_30:
        if s["id"] == sid:
            return s
    return None


def get_by_tizhi(tizhi_key: str) -> list:
    return [s for s in SOUPS_30 if s["tizhi"] == tizhi_key]


def get_by_season(season: str) -> list:
    return [s for s in SOUPS_30 if s["season"] == season]


# 启动持久化
_save()
