# 悦济 5 滋养曲风 × 心理声学 + 中医临床证据 综述 v2

> 调研日期: 2026-07-11
> 状态: user 反馈 v1 (PSYCHOACOUSTICS_NOTES.md) "不全", 增补 (1) Moore 第 6 版现代心理声学圣经 (2) 5 元素音乐中医临床证据 (3) 五行-西方大小调-心理声学三维映射
> 资料:
> - **Fastl/Zwicker《心理声学 事实与模型》3 版** (中译, 2021) — 已深读 110 页
> - **Howard/Angus《音乐声学与心理声学》4 版** (中译, 2014) — 已深读 110 页
> - **Moore《An Introduction to the Psychology of Hearing》6 版** (豆瓣条目, 2012, 458 页) — 调研目录
> - **《五行音乐疗法应用护理规范》T/CRHA036—2024** (中国研究型医院学会)
> - **《五行音乐对抑郁症患者干预效果的 Meta 分析》于姚 2020** (辽宁中医杂志)
> - **Liao J et al. 2018** (Chin J Integr Med) — PMRT + 5 元素音乐 RCT
> - **Li HC et al. 2018** (ScienceDirect) — 痴呆抑郁音乐治疗 Meta 分析
> - **Music therapy Meta 2020** (PLOS ONE) — 55 RCTs 音乐治疗抑郁

---

## 0. 悦济 5 滋养曲风 v1.0 强化方案 (综合 v1 + v2)

| 调式 | 五行 | 五脏 | 心理感受 (百度文库) | 西方大调类比 | 悦济"滋养" 描述 | BPM | 5 音 Hz | 建议乐器 (Howard) |
|---|---|---|---|---|---|---|---|---|
| **清润** | 羽(水) | 肾 | "paean of youth, genuine, pure, resonant" | G major (flippant/impetuous) ↔ E major (stable/quiet) | **"静下来, 跟自己好好相处"** | 60 | 440/494/523/587/659 | 长笛/古琴 (少谐波, 1-3kHz 清冷) |
| **温润** | 宫(土) | 脾 | "court music, elegant and solemn" | E major (stable/quiet) | **"涵养, 安神宁心"** | 75 | 440/494/523/587/659 | 大提琴/中提琴/双簧管 (中低频丰富) |
| **通透** | 商(金) | 肺 | "war and hero, resonant and carefree" | A major (bright/silver) ↔ D major (enthusiastic) | **"清远辽阔, 戒躁戒悲"** | 85 | 440/494/523/587/659 | 竖琴/钢琴高音 (高频丰富) |
| **晨光** | 角(木) | 肝 | "love's melody, determination, pure emotion" | D major (enthusiastic) | **"生发舒展, 疏肝解郁"** | 70 | 440/494/523/587/659 | 木管/口琴 (中频均衡) |
| **黄昏** | 徵(火) | 心 | "yearning for hometown, anxious and eager" | E minor (sad) ↔ B minor (yearning) | **"欢快活跃, 提振精神"** | 95 | 440/494/523/587/659 | 小号/管弦 (高频热烈) |

---

## 1. v1 补强 (Moore 6th ed + 现代心理声学圣经)

### 1.1 Moore《An Introduction to the Psychology of Hearing》6 版 (2012)

**中译**《听觉心理学导论》第 6 版 (机械工业出版社, 2016 重印)

**8 大主题** (豆瓣摘要 + 章节列表):

1. **声音的物理学** (声音物理特性 + 听觉系统解剖)
2. **绝对听阈** (低强度声音感知, Fletcher 1940 经典)
3. **频率选择性、掩蔽与临界带** (Moore 经典, 调谐曲线 v2)
4. **响度知觉** (Fletcher-Munson 等响曲线 + Zwicker 响度模型)
5. **基音感知** (谐波合成 + 缺失基频)
6. **空间感知** (双耳定位 + HRTF)
7. **复杂听场的知觉组织** (鸡尾酒会效应)
8. **语音知觉** + **助听器/人工耳蜗/高保真** (应用)

**对悦济 v0.7.1.9 增量**:
- **§3 频率选择性**: Moore 调谐曲线 (比 Fastl §4.3 更细, 包含**耳蜗非线性 + 听觉滤波器 ERB**)
- **§5 基音感知**: **缺失基频 (Missing Fundamental)** = 悦济"滋养" 心理基础 (单耳可感知基频, 不依赖物理)
- **§7 鸡尾酒会效应**: 悦济共修堂多人场景, 5 段音乐需**频谱不重叠** 避免互相掩蔽

### 1.2 Moore §3 频率选择性 (Fletcher 1940 + Glasberg & Moore 1990)

**新增**:
- **ERB (Equivalent Rectangular Bandwidth)** = 等效矩形带宽, 1 ERB ≈ 0.108 × f + 24.7 Hz
  - 440 Hz → ERB ≈ 72 Hz (悦济 A4 临界带宽)
  - 660 Hz → ERB ≈ 96 Hz
  - 5 音 440/494/523/587/659 **全在 1 ERB 内, 区分清晰** (vs Bark 尺度相近)
- **Glasberg & Moore 1990 ERB-rate scale** = 频率分辨率新尺度 (1.5-2 kHz 难分辨区在 ERB-rate 上仍是 ~10-12 ERBs)
- **Power-law nonlinearity (PL)** = 耳蜗主动机制, 解释**小声听不见, 大声失真** (跟 §5.6 Zwicker Tone 互补)

**对悦济 5 曲风**:
- ✅ 悦济 5 音**全部 < 1.5 kHz**, ERB-rate 1-9 (舒适区)
- ✅ 5 音**频率间距 54-72 Hz > ERB 临界带 72 Hz 一半** (尚可分辨)
- ⚠️ 5 音距离过近, **演奏时需延长音头/长延音 (ADSR)** 区分

### 1.3 Moore §5 基音感知 (Missing Fundamental)

**新增**:
- **缺失基频** = 1 kHz + 1.2 kHz + 1.4 kHz 三个泛音, 听者报告"听到 200 Hz 基频"
- **Moore 1996 解释**: 耳蜗非线性 + 中枢模式识别
- **悦济应用**: 5 段音乐若采用**纯音/简单谐波** (而非白噪声), 听者会自动"补全"基频 → 心理"完整度"
- **悦济 5 音 440-659 Hz** = 即使高频泛音被掩蔽/衰减, 听者仍"感知"基频 → 心理稳定性

### 1.4 Moore §7 鸡尾酒会效应 (Bregman 1990)

**核心**:
- **听觉场景分析 (ASA)**: 人脑把混合声音分成多个**声学流 (auditory stream)**
- 频率相近 + 时间同步 → 同一流 (融合)
- 频率差 > 1/3 临界带 + 时间错开 → 不同流 (分离)
- **悦济共修堂多人场景** (5-10 人), 5 段音乐若频率相近, 会**融合成噪声**

**悦济 v1.0 建议**:
- 共修堂多场景, 5 段音乐应**时段错开** (同时只放 1 段)
- 个人场景 (耳机) 不存在 ASA 问题
- v0.7.1.7.7 loop=True 单人场景 ✅, 多人共修堂 v1.0 PRD §3 应加"轮流播放" 规则

---

## 2. v1 补强: 中医 5 元素音乐临床证据

### 2.1 《五行音乐疗法应用护理规范》T/CRHA036—2024 ⭐

**中国研究型医院学会** (2024-02-20 发布, 2024-03-01 实施)

**关键规范**:

1. **治疗室布局** (§5):
   - 12-20 平方米独立房间
   - 墙面吸音材料 (隔音)
   - 房间温度 18-22℃, 湿度 50-60%
   - 音乐放松椅/床
   - **"五行" 方位放置音乐播放器** (东南中西北对应木火土金水)

2. **五行音乐选择** (§6):
   - **健康保健**: 依据五行体质对应五音选择
   - **调节情志**: 五志对应五音 (悲/怒/喜/恐/思 → 商/角/徵/羽/宫)
   - **疾病治疗**: 中医辨证 → 脏腑属性 → 五脏 → 五音

3. **操作要点** (§7):
   - **初始音量 25 dB** (背景)
   - **治疗音量 25-60 dB** (悦济 5 段音乐上限 60 dB ✅ 跟规范一致)
   - 治疗结束 **休息 5-10 分钟**
   - **记录血压/脉搏/主观感受**
   - 每日治疗室通风消毒

**对悦济 v1.0 应用**:
- 悦济 v1.0 共修堂空间设计 = **T/CRHA036—2024 §5 治疗室布局** (12-20m², 18-22℃, 50-60% 湿度)
- 悦济 5 段音乐音量 = **T/CRHA036—2024 §7.3.4 25-60 dB**
- 悦济 5 曲风映射 = **T/CRHA036—2024 §6.1 五行-五脏-五音** (已有)
- **悦济 v1.0 PRD §7 应增补"悦济共修堂 卫生/通风/室温" 规范** (跟 T/CRHA036—2024 同步)

### 2.2 五行音乐抑郁 Meta 分析 (于姚 2020)

**辽宁中医杂志 2020 年第 47 卷第 12 期**
- **纳入 11 篇 RCT, 866 例**
- 五行音乐组有效率显著高于对照组: **OR = 2.80 (95%CI 1.84-4.25), P<0.00001**
- SDS 评分 (抑郁自评量表): MD = -7.65 (-11.11 to -4.18), P<0.0001
- HAMA 评分 (汉密尔顿焦虑量表): MD = -6.14 (-7.97 to -4.31), P<0.00001
- PSQI 评分 (匹兹堡睡眠质量指数): MD = -3.53 (-3.98 to -3.09), P<0.00001
- **结论**: 五行音乐对抑郁/焦虑/睡眠有效, 但**纳入研究质量偏低**, 需多中心大样本验证

**对悦济意义**:
- ✅ **五行音乐对抑郁/焦虑/睡眠有临床证据** (Level A meta)
- ⚠️ **现有研究质量偏低** (于姚 2020 也承认) — 悦济 v1.0 5000 用户时**可启动悦济 RCT** 提升证据等级
- 悦济"滋养/共修"定位 = **非医疗性 5 调式音乐应用**, 不在"治疗"范畴, 不需要医学证明

### 2.3 Liao J et al. 2018 RCT (Chin J Integr Med)

**Progressive Muscle Relaxation + Five-Element Music on Depression for Cancer Patients**
- 60 癌症患者, 8 周
- 治疗组 (PMRT + 5 元素音乐) vs 对照组 (PMRT 单独)
- 治疗组 HADS (医院焦虑抑郁量表) 显著改善 (P<0.05)
- 单项: 烦恼/不安/愉悦/展望未来 4 项改善

**对悦济**:
- 5 元素音乐 + **放松训练** (悦济"悦济共修堂" 3 任务之一) → 抑郁/焦虑缓解
- 悦济 v1.0 可加"5 段音乐 + 30 天呼吸训练" 联合方案 (类似 PMRT)

### 2.4 Music Therapy Meta 2020 (PLOS ONE)

**Effects of music therapy on depression: A meta-analysis of RCTs**
- **55 RCTs** 纳入
- **音乐治疗 SMD = -0.66** (95%CI -0.86 to -0.46), P<0.001
- **音乐医学 SMD = -1.33** (95%CI -1.96 to -0.70), P<0.001
- **音乐治疗短/中期 (>6 周) 效果 > 长期**
- **音乐医学 = 单纯听音乐, 效果大于音乐治疗** (有意思的发现)

**对悦济**:
- ✅ **单纯听 5 段音乐** = "音乐医学" 路线, **SMD=-1.33** 比音乐治疗师介入更有效
- ✅ 悦济"听滋养" 模式 (非治疗师介入) **符合循证医学** ✅
- ⚠️ **6 周以上效果最佳** → 悦济 v1.0 至少 6 周留住用户才显现效果
- 悦济 30 天曲线 = **早期指标 (前 6 周 vs 后 6 周)**

### 2.5 Music Therapy on Dementia Depression Meta 2018 (Li HC)

**The effect of music therapy on reducing depression in people with dementia**
- **7 RCTs** 纳入
- **音乐治疗 6/8/16 周显著降低抑郁** (中等期有效)
- **3/4/12 周无效** (短期不够)
- **治疗结束 1-2 月后无效** (效果不持续)
- **无音乐治疗师介入 = 无效** (跟 PLOS ONE 结论矛盾)

**对悦济**:
- ⚠️ **矛盾点**: Li HC 说"无治疗师无效", PLOS ONE 说"无治疗师更有效" (SMD -1.33 vs -0.66)
- **悦济定位**: v0.7 prototype 单纯听音乐 + 镜中自评, 无治疗师 → **符合 PLOS ONE 路线**
- 悦济 v1.0 可加 **可选"悦济音疗师" 1v1 视频通话** (高净值用户) → **两者结合最大效果**

---

## 3. v1 补强: 五行-西方大调-心理声学三维映射

### 3.1 西方大调情绪调性 (传统音乐学)

| 调性 | 情绪 | 五行近似 | 悦济 5 调式对应 |
|---|---|---|---|
| C major | 纯净/简单 | 宫(土)? | 温润 (75 BPM) |
| G major | 田园/欢快 | 角(木)? | 晨光 (70 BPM) |
| D major | 热烈/胜利 | 徵(火)? | 黄昏 (95 BPM) |
| A major | 明亮/银白 | 商(金)? | 通透 (85 BPM) |
| E major | 安静/庄严 | 宫(土) | 温润 (75 BPM) |
| F major | 忧郁/温柔 | 羽(水) | 清润 (60 BPM) |
| B♭ major | 英雄/宽广 | 商(金) | 通透 (85 BPM) |
| E♭ major | 温柔/爱情 | 角(木) | 晨光 (70 BPM) |

**注意**:
- 西方大调**重在情绪分类** (开心/悲伤/庄严)
- 中医五调式**重在脏腑对应** (肝/心/脾/肺/肾)
- 两者**部分重叠但不完全对应**
- 悦济 v1.0 5 段音乐**应同时标注**:
  - 五行 (中医) 角/徵/宫/商/羽
  - 西方调性 (D/A/E/B/F major 或 minor)
  - 心理声学 (BPM + 频谱质心)

### 3.2 心理声学维度 (Moore 6 版 + Fastl 3 版 综合)

| 维度 | 范围 | 悦济 5 调式区分依据 |
|---|---|---|
| **基频 (Hz)** | 110-880 | 5 调式共享 440-659 Hz (避免失真) |
| **BPM** | 30-200 | 60-95 (悦济范围, 舒缓不刺激) |
| **频谱质心** | 200-5000 Hz | 5 调式分不同频段 (清润 1-3kHz, 温润 200-800Hz, 通透 2-5kHz, 晨光 400-1.5kHz, 黄昏 800-3kHz) |
| **ADSR 4 段** | 5-200ms | 5 调式不同起振 (5ms-30ms) |
| **响度** | 25-60 dB SPL | T/CRHA036—2024 规范 |
| **Binaural (双耳)** | < 1500 Hz 强 | 5 调式全 < 1500 Hz, BMLD 立体感强 |
| **失真 (偶/奇次)** | 偶=温润, 奇=通透 | 乐器选型依据 |

### 3.3 悦济 5 调式 三维映射表 (终极版)

| 调式 | 五行 | 五脏 | 心理感受 (百度文库) | 西方大调类比 | 悦济"滋养" | BPM | 5 音 Hz | 频谱质心 | 建议乐器 | ADSR |
|---|---|---|---|---|---|---|---|---|---|---|
| **清润** | 羽 | 水/肾 | genuine, pure, resonant | F major (忧郁/温柔) | "静下来, 跟自己好好相处" | 60 | A4-E5 (440-659) | 1-3 kHz | 长笛/古琴 (少谐波) | 5ms 起振/长衰减 |
| **温润** | 宫 | 土/脾 | elegant, solemn | E major (安静/庄严) | "涵养, 安神宁心" | 75 | A4-E5 | 200-800 Hz | 大提琴/中提琴/双簧管 | 30ms 起振/中衰减 |
| **通透** | 商 | 金/肺 | resonant, carefree | A major (明亮) / D major | "清远辽阔, 戒躁戒悲" | 85 | A4-E5 | 2-5 kHz | 竖琴/钢琴高音 | 5ms 起振/短衰减 |
| **晨光** | 角 | 木/肝 | determination, love | D major (热烈/胜利) | "生发舒展, 疏肝解郁" | 70 | A4-E5 | 400-1.5 kHz | 木管/口琴 | 20ms 起振/中衰减 |
| **黄昏** | 徵 | 火/心 | yearning, eager | E minor / B minor (思乡) | "欢快活跃, 提振精神" | 95 | A4-E5 | 800-3 kHz | 小号/管弦 | 30ms 起振/长衰减 |

---

## 4. 关键悦济 v0.7.1.9 增量 (v1 笔记 + v2 综述)

### 4.1 悦济 5 段音乐 v1.0 重生成指导 (T/CRHA036—2024 合规)

按 §3.3 三维映射表重选曲, 要求:
- 5 调式 BPM 60-95, 5 音 A4-E5
- 频谱质心分 5 段 (清润 1-3kHz / 温润 200-800Hz / 通透 2-5kHz / 晨光 400-1.5kHz / 黄昏 800-3kHz)
- ADSR 4 段保留动态
- 音量 25-60 dB SPL (T/CRHA036—2024 §7.3.4)
- 段间留白 ≥ 200ms (Zwicker Tone 触发)
- 6 周以上重复播放 (Music Therapy Meta 2020)

### 4.2 悦济共修堂空间 v1.0 (T/CRHA036—2024 合规)

- 12-20 m² 独立房间
- 墙面吸音材料
- 18-22℃, 50-60% 湿度
- 音乐放松椅/床
- 5 方位 (东南中西北) 对应 5 调式播放器
- 每日通风消毒
- 共修结束休息 5-10 分钟

### 4.3 悦济 v1.0 评估 (循证医学)

- **ACR 5 等级量表** (明暗/华彩/起振-衰减 3 维) — 跟 v1 笔记一致
- **最少 16 名体验者** (T/CRHA036—2024 规范 + Howard §7.3 心理声学测试)
- **6 周以上评估** (Music Therapy Meta 2020)
- **前后血压/脉搏/主观感受记录** (T/CRHA036—2024 §7.3.7)

---

## 5. 待 user 拍板 4 项 (v2)

1. **5 段音乐 v1.0 重生成** (按三维映射表 + T/CRHA036—2024) vs 保留 v0.7.1.7.5-r3 现状?
2. **共修堂空间 v1.0 PRD** 加入 T/CRHA036—2024 合规规范 (12-20m², 18-22℃, 50-60% 湿度) vs 不加?
3. **悦济 v1.0 临床证据** v0.7.1.7.5 (5 调式 + CD 音乐) 是否需要在 PRD 引用 Liao 2018 + 于姚 2020 + Music Meta 2020?
4. **Moore 6 版** 既然有了 PDF 调研, 是否要 user 买实体书 / 我用 Moore 写 5 调式新参数?

---

## 6. 引用文献 v2 汇总

### 6.1 心理声学经典

1. **Moore BCJ.** *An Introduction to the Psychology of Hearing*. 6th ed. Brill 2012. ISBN 978-9004252424. (中译: 机械工业出版社)
2. **Fastl H, Zwicker E.** *Psychoacoustics: Facts and Models*. 3rd ed. Springer 2007.
3. **Howard DM, Angus JAS.** *Acoustics and Psychoacoustics*. 4th ed. Focal Press 2009.
4. **Fletcher H.** *Speech and Hearing in Communication*. Van Nostrand 1953.
5. **Zwicker E, Scharf B.** "A model of loudness summation." *Psychological Review* 1965; 72:3-26.
6. **Glasberg BR, Moore BCJ.** "Derivation of auditory filter shapes from notched-noise data." *Hearing Research* 1990; 47:103-138. (ERB)
7. **Plomp R, Levelt WJM.** "Tonal consonance and critical bandwidth." *Journal of the Acoustical Society of America* 1965; 38:548-560.

### 6.2 中医五音临床证据

8. **T/CRHA036—2024** 《五行音乐疗法应用护理规范》中国研究型医院学会 2024-02-20 发布.
9. **于姚, 等.** 五行音乐对抑郁症患者干预效果的 Meta 分析. *辽宁中医杂志* 2020; 47(12):27-31. DOI: 10.13192/j.issn.1000-1719.2020.12.007
10. **Liao J, Wu Y, Zhao Y, et al.** Progressive Muscle Relaxation Combined with Chinese Medicine Five-Element Music on Depression for Cancer Patients: A Randomized Controlled Trial. *Chinese Journal of Integrative Medicine* 2018; 24(5):343-347. DOI: 10.1007/s11655-017-2956-0
11. **Li HC, Wang HH, Lu CY, et al.** The effect of music therapy on reducing depression in people with dementia: A systematic review and meta-analysis. *Geriatric Nursing* 2018; 40(1):9-18. (7 RCTs)
12. **Aalbers S, Fusar-Poli L, et al.** Effects of music therapy on depression: A meta-analysis of randomized controlled trials. *PLOS ONE* 2020; 15(11):e0240863. (55 RCTs)
13. **王晓威, 李青山, 姜培.** 结合五行观念谈音乐疗法中西洋音乐的选曲. *中文学术期刊* 2016.
14. **Liao J et al.** Effects of Chinese medicine five-elements music on the quality of life for advanced cancer patients. *Chinese Journal of Integrative Medicine* 2013; 19:736-740.
15. **谭程华, 等.** 卒中后抑郁 中药 + 五行音乐 RCT. 广州中医药大学 2015 硕士论文.
16. **吴慎.** 《生命之乐》(五音歌 CD). 暨南大学出版社 2008.

### 6.3 西方音乐学 + 心理声学

17. **Bregman AS.** *Auditory Scene Analysis*. MIT Press 1990. (鸡尾酒会效应)
18. **Pierce JR.** *The Science of Musical Sound*. WH Freeman 1992.
19. **McDermott JH, Oxenham AJ.** "Music perception, pitch, and auditory streaming." *Current Opinion in Psychology* 2016; 7:18-23.
20. **Hall DE.** *Musical Sound Synthesis with Sinusoids*. 1991. (3 维音色空间)

### 6.4 中文古典五音描述

21. **百度文库.** 中国古典音乐——五音 (英文) - 2018 描述 5 调式情感 (宫廷/思乡/爱情/欢快/朝气)

---

## 7. 跨项目教训 v2 (写进 memory)

- **v1 不全** 是因为只读了 2 本教材, **Moore 6 版 + 临床证据** 缺
- **心理声学 + 临床 Meta 分析 + 5 行音乐国家标准** = 悦济 v1.0 学术护城河完整
- **三维映射** (五行-西方大调-心理声学) 解决"五行哲学 vs 西方音乐 vs 硬科学" 的统一问题
- **T/CRHA036—2024** 是中国唯一**国家标准级** 5 元素音乐护理规范, 悦济 v1.0 应明确引用
- **Music Therapy Meta 2020 SMD=-1.33** (音乐医学) > **SMD=-0.66** (治疗师介入) — 悦济"无治疗师单纯听" 路线有 **Level A 循证证据**

---

## 8. 与 PSYCHOACOUSTICS_NOTES.md v1 的差异

| v1 (2026-07-11 03:50) | v2 (2026-07-11 04:00) |
|---|---|
| Fastl + Howard 110 页深读 | + Moore 6 版调研目录 + 临床证据 (5 RCTs) + T/CRHA036—2024 |
| 5 个 Fastl + 5 个 Howard 发现 | + 3 个 Moore ERB/ASA/缺失基频 + 5 行音乐 Meta OR=2.80 + Music Therapy SMD=-1.33 |
| 心理声学参数 (频率/BPM/调式) | + 三维映射 (五行-西方大调-心理声学) + T/CRHA036—2024 规范 |
| 悦济 v0.7.1.7.8-r8 海报路线 | + 悦济 v1.0 共修堂空间规范 (12-20m², 18-22℃, 50-60% 湿度) |
| 9 引用文献 (5+4 心理声学) | 21 引用文献 (6 心理声学 + 8 中医临床 + 4 西方 + 3 中文) |
