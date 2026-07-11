# 心颜 5 段滋养曲风 v1.0 规范 (Music V1.0 Spec)

> 制定日期: 2026-07-11
> 依据: docs/PSYCHOACOUSTICS_LIT_REVIEW.md v2 综述
> 标准: T/CRHA036—2024 《五行音乐疗法应用护理规范》
> 状态: v1.0 规范 (commit 504c7f9) — 5 段音乐 v1.0 重生成 + v1.0 共修堂空间规范
> 5 段音乐来源: 心颜当前用 v0.7.1.7.5-r3 (data/music.py) → **重生成 v1.0 规范版**

---

## 0. 心颜 5 段音乐 v1.0 总览

| 调式 | 五行 | 五脏 | BPM | 5 音 (Hz) | 频谱质心 | ADSR | 音量上限 | 建议乐器 | 西方大调 | 心理声学映射 |
|---|---|---|---|---|---|---|---|---|---|---|
| **清润** | 羽 | 水/肾 | 60 | A4-B4-C5-D5-E5 (440-659) | 1-3 kHz | 5ms 起振/长衰减 | 50 dB SPL | 长笛/古琴 (少谐波, 高频少) | F major (忧郁/温柔) ↔ A minor | 频谱质心高, ERB 50-100 Hz, BMLD 立体感强 |
| **温润** | 宫 | 土/脾 | 75 | A4-B4-C5-D5-E5 | 200-800 Hz | 30ms 起振/中衰减 | 55 dB SPL | 大提琴/中提琴/双簧管 (中低频丰富) | E major (安静/庄严) | 频谱质心低, 偶次谐波强, 失真 < 1% |
| **通透** | 商 | 金/肺 | 85 | A4-B4-C5-D5-E5 | 2-5 kHz | 5ms 起振/短衰减 | 55 dB SPL | 竖琴/钢琴高音 (高频丰富) | A major (明亮/银白) ↔ D major | 频谱质心很高, 短 ADSR, 失真 < 2% |
| **晨光** | 角 | 木/肝 | 70 | A4-B4-C5-D5-E5 | 400-1.5 kHz | 20ms 起振/中衰减 | 50 dB SPL | 木管/口琴 (中频均衡) | D major (热烈/胜利) ↔ G major | 频谱质心中, 中频突出, 偶次+奇次混合 |
| **黄昏** | 徵 | 火/心 | 95 | A4-B4-C5-D5-E5 | 800-3 kHz | 30ms 起振/长衰减 | 60 dB SPL | 小号/管弦 (高频热烈) | E minor / B minor (思乡/沉静) | 频谱质心高, 长 ADSR, 失真 < 3% |

---

## 1. 5 段音乐 硬参数 (Psychoacoustic V1.0 Spec)

### 1.1 通用规范 (5 段统一)

| 参数 | 值 | 依据 |
|---|---|---|
| **采样率** | 44100 Hz | CD 音质, Nyquist 22050 Hz (覆盖心颜 5 音最高 659 Hz × 5 谐波 = 3295 Hz) |
| **位深** | 16-bit | CD 标准 |
| **声道** | **立体声 (Stereo)** | BMLD 立体感 < 1500 Hz 强, 5 音 440-659 Hz 全在 BMLD 区 |
| **声道时间差** | ≤ 0.01 sample (~0.23 μs @ 44.1kHz) | 严守 JNΔT 30 μs (Fastl §15) |
| **音量** | 25-60 dB SPL | T/CRHA036—2024 §7.3.4 规范 |
| **初始音量** | 25 dB (背景) | T/CRHA036—2024 §7.3.3 规范 |
| **每段时长** | 5-10 分钟 (≥ 6 周重复播放, Music Meta 2020) | |
| **循环** | loop=True (心颜 v0.7.1.7.7 已有) | |
| **段间留白** | ≥ 200ms (Zwicker Tone 触发) | Fastl §5.6 |
| **避免** | 白噪声/雨声/环境音 (无谱隙, 失去 Zwicker Tone) | Fastl §5.6 |
| **保留** | ADSR 4 段动态 (Howard §5) | |
| **主旋律上限** | ≤ 1.5 kHz (保留 BMLD 立体感) | Fastl §15 |
| **谐波数** | 5-10 (前 5 谐波 = 大三和弦天然和谐, Howard §3.1.3) | |

### 1.2 5 调式特化

#### 1.2.1 清润 (羽水) — 60 BPM

```
音域: A4-E5 (440-659 Hz), 跨度 1 个六度
频谱: 1-3 kHz 频谱质心, 5 次以上谐波 < -20 dB (少谐波)
乐器: 长笛 (主) + 古琴 (低) + 钢琴 (弱高音)
ADSR: 5ms 起振 (长笛快速), 长衰减 (1.5-2s 余韵)
音量: 起始 25 dB, 治疗 40-50 dB
时长: 8 分钟 (Zwicker Tone 段间留白 2 秒)
心理: 静下来, 跟自己好好相处 (吴慎《羽音》: "入肾经, 安神定恐, 改善面色暗淡")
```

#### 1.2.2 温润 (宫土) — 75 BPM

```
音域: A4-E5
频谱: 200-800 Hz 频谱质心, 偶次谐波强 (温润感)
乐器: 大提琴 (主) + 中提琴 + 双簧管 + 钢琴低音
ADSR: 30ms 起振 (弦乐), 中衰减 (1s)
音量: 起始 25 dB, 治疗 45-55 dB
时长: 7 分钟
心理: 涵养, 安神宁心 (吴慎《宫音》: "入脾经, 健脾养胃, 滋养气血")
```

#### 1.2.3 通透 (商金) — 85 BPM

```
音域: A4-E5
频谱: 2-5 kHz 频谱质心, 高频丰富
乐器: 竖琴 (主) + 钢琴高音 + 钢片琴 (celesta)
ADSR: 5ms 起振 (钢片琴快速), 短衰减 (0.5s)
音量: 起始 25 dB, 治疗 45-55 dB
时长: 6 分钟
心理: 清远辽阔, 戒躁戒悲 (吴慎《商音》: "入肺经, 补肺益气, 调节肺气虚弱")
```

#### 1.2.4 晨光 (角木) — 70 BPM

```
音域: A4-E5
频谱: 400-1.5 kHz 频谱质心, 中频突出
乐器: 木管/口琴 (主) + 钢琴中音 + 弦乐
ADSR: 20ms 起振, 中衰减 (0.8s)
音量: 起始 25 dB, 治疗 40-50 dB
时长: 7 分钟
心理: 生发舒展, 疏肝解郁 (吴慎《角音》: "入肝胆经, 养肝明目, 缓解焦虑")
```

#### 1.2.5 黄昏 (徵火) — 95 BPM

```
音域: A4-E5
频谱: 800-3 kHz 频谱质心, 高频热烈
乐器: 小号/管弦 (主) + 钢琴高音 + 弦乐
ADSR: 30ms 起振, 长衰减 (1.2s)
音量: 起始 25 dB, 治疗 50-60 dB
时长: 6 分钟
心理: 欢快活跃, 提振精神 (吴慎《徵音》: "入心经, 舒心安神, 畅通心脉")
```

---

## 2. 5 段音乐 Suno/Udio 生成 Prompt (可直接复制)

> Suno v4 / Udio v2 prompt 格式: **流派 + 调式 + BPM + 乐器 + 情绪 + 时长 + 音量**

### 2.1 清润 (羽水) — Suno Prompt

```
English:
"60 BPM, A natural minor pentatonic (la, do, re, mi, sol), pure bamboo flute and 
guqin zither, very soft attack, long reverb tail 1.5-2s, gentle flow like morning 
mist over a still lake, meditation for kidney meridian and inner peace, no percussion, 
no vocals, no bright highs, 8 minutes seamless loop, -20 LUFS, mono-to-stereo"

中文: "60 BPM, A 自然小调五声音阶 (la, do, re, mi, sol), 纯竹笛与古琴, 
极柔起振, 长混响尾 1.5-2 秒, 如晨雾静湖般轻柔流淌, 养肾经内静, 
无打击乐, 无人声, 无明亮高频, 8 分钟无缝循环, -20 LUFS, 单声道转立体声"
```

### 2.2 温润 (宫土) — Suno Prompt

```
English:
"75 BPM, C major pentatonic (do, re, mi, sol, la), warm cello and viola, with 
oboe counter-melody, gentle 30ms attack, 1s reverb, like autumn harvest song, 
nourishing spleen meridian, earth-tone color, no percussion, no vocals, 7 minutes 
seamless loop, -20 LUFS, mono-to-stereo"

中文: "75 BPM, C 大调五声音阶 (do, re, mi, sol, la), 温暖大提琴与中提琴, 
双簧管副旋律, 轻柔 30ms 起振, 1 秒混响, 如秋收之歌, 养脾经, 大地色调, 
无打击乐, 无人声, 7 分钟无缝循环, -20 LUFS, 单声道转立体声"
```

### 2.3 通透 (商金) — Suno Prompt

```
English:
"85 BPM, D major pentatonic (re, mi, fa#, la, ti), bright harp with piano high 
treble and celesta, crisp 5ms attack, 0.5s decay, clear and silver like 
autumn moonlight, supporting lung meridian, no percussion, no vocals, 
6 minutes seamless loop, -20 LUFS, mono-to-stereo"

中文: "85 BPM, D 大调五声音阶 (re, mi, fa#, la, ti), 明亮竖琴与钢琴高音, 
钢片琴, 锐利 5ms 起振, 0.5 秒衰减, 如秋月般清银, 养肺经, 
无打击乐, 无人声, 6 分钟无缝循环, -20 LUFS, 单声道转立体声"
```

### 2.4 晨光 (角木) — Suno Prompt

```
English:
"70 BPM, G major pentatonic (sol, la, ti, re, mi), warm woodwind with harmonica 
and mid-range piano, gentle 20ms attack, 0.8s reverb, like spring morning sun 
through leaves, supporting liver meridian, no percussion, no vocals, 7 minutes 
seamless loop, -20 LUFS, mono-to-stereo"

中文: "70 BPM, G 大调五声音阶 (sol, la, ti, re, mi), 温暖木管与口琴, 
中频钢琴, 柔和 20ms 起振, 0.8 秒混响, 如春日晨光透过树叶, 养肝经, 
无打击乐, 无人声, 7 分钟无缝循环, -20 LUFS, 单声道转立体声"
```

### 2.5 黄昏 (徵火) — Suno Prompt

```
English:
"95 BPM, E minor pentatonic (mi, sol, la, ti, re), warm brass and strings with 
piano high treble, sustained 30ms attack, 1.2s reverb, like golden sunset, 
nurturing heart meridian, no percussion, no vocals, 6 minutes seamless loop, 
-20 LUFS, mono-to-stereo"

中文: "95 BPM, E 小调五声音阶 (mi, sol, la, ti, re), 温暖铜管与弦乐, 
钢琴高音, 持续 30ms 起振, 1.2 秒混响, 如金色夕阳, 养心经, 
无打击乐, 无人声, 6 分钟无缝循环, -20 LUFS, 单声道转立体声"
```

---

## 3. 现有 5 元素音乐资源 (可借鉴 / 直接用)

### 3.1 专业 CD / 库 (推荐)

| 资源 | 来源 | 链接 | 推荐度 |
|---|---|---|---|
| **吴慎《生命之乐》CD** (2008 暨南大学) | 孔夫子二手/淘宝 80-780元 | 实体 CD, 5 调式完整 | ⭐⭐⭐⭐⭐ |
| **《黄帝内经养生音乐》专辑 251059699** | 网易云音乐 | music.163.com | ⭐⭐⭐⭐ |
| **《中医五音疗效音乐系列全集》** | 喜马拉雅 7193164/3769611 | 完整 5 调式音频 | ⭐⭐⭐⭐ |
| **五音疗愈音乐盒** (抖音/汽水音乐) | 50+ 单曲 | 1-3 分钟单曲 | ⭐⭐⭐ |
| **音希/吴慎/古琴五音疗愈** (抖音/Bilibili) | 短视频 | 实时视频 | ⭐⭐⭐ |

### 3.2 适配心颜 v1.0 规范的曲目 (待 user 试听筛选)

| 调式 | 推荐曲目 (从公开库) |
|---|---|
| 清润 (羽) | 音希《羽音养肾(疏通肾经滋阴)》《水音补肾(安神定恐 改善面色暗淡)》 |
| 温润 (宫) | 《宫音养脾(补气血调脾胃)音希》《五音养五脏·土音(调和脾胃 祛湿减小肚子)》 |
| 通透 (商) | 《中医养生乐|金音(润肺止咳 畅通呼吸)》《五音疗疾 调养五脏:商音入肺 增强机体》 |
| 晨光 (角) | 《角音养肝(疏肝解郁补气)音希》《角调养生乐曲(木音入肝)黄帝内经养生音乐》 |
| 黄昏 (徵) | 《徵调火音疗愈·养心·解压助眠》《五音疗疾 调养五脏:角音入肝 缓解焦虑》 |
| **复合治疗** | **吴慎《生命之乐》CD 套装 5 调式 + 治疗引导** (最专业) |

### 3.3 user 自行生成 (Suno/Udio)

- **Suno v4**: suno.com (免费 5 首/天, 订阅 $8/月 500 首)
- **Udio v2**: udio.com (免费, 高品质)
- **Stable Audio 2.0**: stability.ai
- **Mubert**: mubert.com
- **AIVA**: aiva.ai (古典音乐生成)

**推荐**: **Suno v4** 最适合 5 元素音乐 (支持中文 prompt + 流派/情绪/乐器精确控制)

---

## 4. 心颜 v1.0 共修堂空间规范 (T/CRHA036—2024 §5)

| 项目 | 规范 | 依据 |
|---|---|---|
| **房间** | 12-20 m² 独立房间 | T/CRHA036—2024 §5.1 |
| **墙面** | 吸音材料 (隔音) | T/CRHA036—2024 §5.2 |
| **光线** | 适度可调, 无强光刺激 | T/CRHA036—2024 §5.3 |
| **温度** | 18-22℃ | T/CRHA036—2024 §5.4 |
| **湿度** | 50-60% | T/CRHA036—2024 §5.4 |
| **家具** | 音乐放松椅/床, 简约装饰, 绿植壁画 | T/CRHA036—2024 §5.5/5.7 |
| **播放器方位** | 五行对应 5 方位 (东南中西北) | T/CRHA036—2024 §5.6 |
| **空气** | 避免对流, 每日通风消毒 | T/CRHA036—2024 §5.4/§7.3.8 |
| **休息** | 共修结束 5-10 分钟休息 | T/CRHA036—2024 §7.3.6 |
| **声学参数** | RT60 ≤ 0.5 秒 (心颜 v0.7.1.9 笔记, Howard §7.1) | |

---

## 5. 心颜 v1.0 评估规范 (T/CRHA036—2024 §7.4 + Howard §7.3)

### 5.1 评估量表

- **绝对范畴 (ACR) 5 等级量表** (Howard §7.3.2):
  - 5 优 / 4 良 / 3 中 / 2 差 / 1 劣
- **3 维评价** (Howard §5.3.2):
  - 明亮 ↔ 暗淡
  - 华彩 ↔ 单调
  - 起振-衰减同步性

### 5.2 评估人数

- **最少 16 名体验者** (Howard §7.3)
- **非专家** (普通人, 心颜定位)
- **6 周以上评估** (Music Therapy Meta 2020)

### 5.3 评估指标

- 血压 / 脉搏 (治疗前后)
- 主观感受 (心情/焦虑/睡眠)
- 30 天曲线 (心颜 v0.7.1 镜中)
- ACR 5 等级评分

---

## 6. 心颜 v1.0 PRD §7 增补建议 (给 user 拍板)

**心颜 v1.0 PRD §7 应增补**:
1. **音乐规范**: 5 调式 BPM 60-95, 5 音 A4-E5, 音量 25-60 dB (T/CRHA036—2024 合规)
2. **共修堂空间规范**: 12-20 m², 18-22℃, 50-60% 湿度, RT60 ≤ 0.5 秒
3. **5 方位播放器**: 东南中西北对应木火土金水
4. **评估规范**: ACR 5 等级 + 16 名体验者 + 6 周
5. **学术护城河引用**: 引用 T/CRHA036—2024 + 于姚 2020 Meta + Liao 2018 + Music Meta 2020
6. **严守**: 不宣称医疗 (化妆品监督管理条例 17/37/43/46/68) + 8 禁用词 0 出现 + 滋养/共修基调

---

## 7. 跨项目教训 (P0)

- **心颜 5 段音乐 v1.0 = 中医哲学 + 西方大调 + 心理声学 + 临床循证 + 国家标准** 5 维合一
- **T/CRHA036—2024** 是心颜共修堂空间唯一国家标准级依据
- **Music Meta 2020 SMD=-1.33** 证明"无治疗师单纯听" 路线有 Level A 证据
- **5 段音乐 + 共修堂空间 + 评估规范 = 心颜 v1.0 学术护城河** 完整

---

## 8. 待 user 拍板 3 项

1. **5 段音乐 v1.0 选什么源**: 现有 CD (吴慎/黄帝内经) vs Suno/Udio 生成 vs 混合?
2. **心颜 v1.0 PRD §7** 是否加 T/CRHA036—2024 共修堂空间规范 + 评估规范?
3. **v0.7.1.7.5-r3 当前 5 段** 立即升级 v1.0 规范, 还是 v1.0 PRD 拍板后再升级?
