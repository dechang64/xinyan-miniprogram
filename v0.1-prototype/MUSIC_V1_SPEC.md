# 心颜 5 段滋养曲风 v1.0 规范

> 制定: 2026-07-11 | 状态: v1.0 草案
> 依据: docs/PSYCHOACOUSTICS_LIT_REVIEW.md v2 综述 + T/CRHA036—2024 国标
> 5 段来源: 心颜 v0.7.1.7.5-r3 data/music.py (5 prompt + 5 CDN URL)

---

## 1. 5 段音乐 8 维度参数 (v1.0)

| 调式 | 五行 | 西方大调 | BPM | 5 音 Hz | 频谱质心 | ADSR | 音量 | 主乐器 |
|---|---|---|---|---|---|---|---|---|
| **清润** | 羽/水 | A minor (5#F#) | 60 | A4-E5 (440-659) | 1-3 kHz | 5ms/长衰减 (1.5-2s) | 50 dB | 竹笛+古琴 |
| **温润** | 宫/土 | C major (5#无) | 75 | A4-E5 | 200-800 Hz | 30ms/中衰减 (1s) | 55 dB | 大提琴+中提琴+双簧管 |
| **通透** | 商/金 | D major (5#F#C#) | 85 | A4-E5 | 2-5 kHz | 5ms/短衰减 (0.5s) | 55 dB | 竖琴+钢琴+钢片琴 |
| **晨光** | 角/木 | E minor (5#F#) | 70 | A4-E5 | 400-1.5 kHz | 20ms/中衰减 (0.8s) | 50 dB | 木管+口琴+钢琴中 |
| **黄昏** | 徵/火 | E minor | 95 | A4-E5 | 800-3 kHz | 30ms/长衰减 (1.2s) | 60 dB | 小号+管弦+钢琴高 |

**通用规范 (5 段统一)**:
- 采样率 44100 Hz / 16-bit / **立体声 (Stereo, BMLD 立体感)**
- 声道时间差 ≤ 30 μs (Fastl §15 JNΔT)
- 音量 25-60 dB SPL (T/CRHA036—2024 §7.3.4)
- 时长 5-10 分钟 (≥ 6 周循环, Music Meta 2020)
- **段间留白 ≥ 200ms** (防 Zwicker Tone 触发, Fastl §5.6)
- 主旋律 ≤ 1.5 kHz (保留 BMLD 立体感)
- 谐波数 5-10 (大三和弦天然和谐, Howard §3.1.3)
- **白噪声/雨声 = 不用** (无谱隙, Zwicker Tone 触发)

---

## 2. 5 段 Suno v4 Prompt (可直接复制, 中英对照)

### 2.1 清润 (羽水) 60 BPM
```
EN: "60 BPM, A natural minor pentatonic (la, do, re, mi, sol), pure bamboo flute 
and guqin zither, very soft 5ms attack, long reverb tail 1.5-2s, gentle flow 
like morning mist over a still lake, meditation for kidney meridian and inner 
peace, no percussion, no vocals, no bright highs, 8 minutes seamless loop, 
-20 LUFS, mono-to-stereo"
```

### 2.2 温润 (宫土) 75 BPM
```
EN: "75 BPM, C major pentatonic (do, re, mi, sol, la), warm cello and viola with 
oboe counter-melody, gentle 30ms attack, 1s reverb, like autumn harvest song, 
nourishing spleen meridian, earth-tone color, no percussion, no vocals, 
7 minutes seamless loop, -20 LUFS, mono-to-stereo"
```

### 2.3 通透 (商金) 85 BPM
```
EN: "85 BPM, D major pentatonic (re, mi, fa#, la, ti), bright harp with piano 
high treble and celesta, crisp 5ms attack, 0.5s decay, clear and silver like 
autumn moonlight, supporting lung meridian, no percussion, no vocals, 
6 minutes seamless loop, -20 LUFS, mono-to-stereo"
```

### 2.4 晨光 (角木) 70 BPM
```
EN: "70 BPM, E minor pentatonic (mi, sol, la, ti, re), warm woodwind with 
harmonica and mid-range piano, gentle 20ms attack, 0.8s reverb, like spring 
morning sun through leaves, supporting liver meridian, no percussion, 
no vocals, 7 minutes seamless loop, -20 LUFS, mono-to-stereo"
```

### 2.5 黄昏 (徵火) 95 BPM
```
EN: "95 BPM, E minor pentatonic (mi, sol, la, ti, re), warm brass and strings 
with piano high treble, sustained 30ms attack, 1.2s reverb, like golden 
sunset, nurturing heart meridian, no percussion, no vocals, 6 minutes 
seamless loop, -20 LUFS, mono-to-stereo"
```

---

## 3. v1.0 vs v0.7.1.7.5-r3 升级点 (3 维映射)

| 升级点 | v0.7.1.7.5-r3 | v1.0 |
|---|---|---|
| 西方大调 | 无 (只五声音阶) | **5 调式对应 5 大调** (心理声学 + 西方音乐桥接) |
| 5 音频率范围 | 无 (任意五声音阶) | **统一 A4-E5 (440-659 Hz)** 全部 < 1.5 kHz BMLD 区 |
| 频谱质心 | 无 | **5 调式各 1 个 (200-800 / 400-1.5k / 800-3k / 1-3k / 2-5k Hz)** |
| ADSR | "soft/moderate" 模糊 | **5ms/30ms 起振 × 0.5/0.8/1/1.2/1.5-2s 衰减** 精确 |
| 音量 | 无 | **25-60 dB SPL** (T/CRHA036—2024 §7.3.4) |
| 立体声 | 无 | **Stereo + ≤ 30 μs JNΔT** (BMLD 立体感) |
| 段间留白 | 无 | **≥ 200ms** (防 Zwicker Tone) |
| 谐波数 | 无 | **5-10** (大三和弦天然) |
| 国家标准 | 无 | **T/CRHA036—2024** 合规引用 |
| 循证 | 无 | **Music Meta 2020 SMD=-1.33 + Liao 2018 + 于姚 2020 OR=2.80** |

---

## 4. 5 段音乐公开资源 (可借鉴)

| 资源 | 链接 | 推荐度 |
|---|---|---|
| **吴慎《生命之乐》CD** (2008 暨南大学) | 孔夫子二手/淘宝 80-780元 | ⭐⭐⭐⭐⭐ |
| **《黄帝内经养生音乐》网易云 251059699** | music.163.com | ⭐⭐⭐⭐ |
| **《中医五音疗效音乐》喜马拉雅 7193164/3769611** | 完整 5 调式 | ⭐⭐⭐⭐ |
| **音希/黄帝内经养生音乐** 抖音/汽水 | 50+ 单曲 | ⭐⭐⭐ |
| **Suno v4 / Udio v2 自生成** | suno.com | ⭐⭐⭐⭐⭐ |

---

## 5. 心颜 v1.0 共修堂空间规范 (T/CRHA036—2024 §5)

- 房间 12-20 m² / 18-22℃ / 50-60% 湿度
- RT60 ≤ 0.5 秒 (心颜 v0.7.1.9, Howard §7.1)
- 5 方位播放器 (东南中西北 = 木火土金水)
- 25-60 dB 音量 + 段间留白 ≥ 200ms
- 评估: ACR 5 等级 + 16 名体验者 + 6 周 (Howard §7.3)

---

## 6. 待 user 拍板 3 项

1. **5 段音乐源**: 现有 CD (吴慎) vs Suno/Udio 自生成 vs 混合?
2. **v1.0 PRD §7** 加 T/CRHA036—2024 共修堂空间 + 评估规范?
3. **v0.7.1.7.5-r3 → v1.0** 立即升级还是等 PRD 拍板?
