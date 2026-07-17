---
title: 悦济 FL Bridge
emoji: 🌉
colorFrom: green
colorTo: blue
sdk: docker
app_port: 7860
pinned: true
license: mit
short_description: 悦济 × reading-fl 联邦学习 HTTP 桥 (C 方案)
---

# 悦济 FL Bridge (C 方案)

跨项目联邦学习 HTTP 桥 — 悦济 Streamlit × reading-fl 真 FL 库

## 背景

冬生 2026-07-16 拍板 C 方案: Python 中间层
- 悦济 v0.1-prototype 加 `core/fl_bridge.py` (FastAPI HTTP server)
- 内部 `from reading_fl.core.aggregation import FedAvg` 复用真库
- 部署到 HF Space (免费, 跟 Streamlit 同 ecosystem)
- 悦济云函数 HTTP 调这个桥

## 4 个 HTTP Endpoint

| Method | Path | 用途 |
|---|---|---|
| GET | `/` | server info |
| POST | `/fl/register` | 客户端注册 (campus_id + n_samples) |
| POST | `/fl/upload` | 上传 backbone weights (base64 npz) |
| POST | `/fl/aggregate` | 触发 FedAvg 聚合, 返回 global_weights_b64 |
| GET | `/fl/status` | 训练历史 + 全局指标 |
| POST | `/fl/reset` | 清空 state (测试用) |

## 本地测试

```bash
pip install -r requirements.txt
python app.py
# 另一窗口:
curl http://localhost:7860/
```

## 比赛路演 (7-25)

- 提前 1 天部署并验证 URL
- 路演现场 5 分钟演示: 启动 → 3 client 注册 → 触发 FedAvg → 看聚合结果
- 关键话术: 悦济 14 维用户特征通过 FedAvg 跨用户聚合, 客户端原始数据 0 上传 (隐私优先)

## 严守

- 14 严守字串 0 出现 (代码区)
- 12 玄学红线 0 出现
- 15 危机词 0 出现

## 工期

- 2026-07-16: fl_bridge.py + fl_bridge_test.py (8/8 通过) + fl_bridge_demo.py (端到端通过) + README 写好
- 2026-07-17: HF Space 部署 (本文档) + 悦济 Streamlit 端调 FL 桥
