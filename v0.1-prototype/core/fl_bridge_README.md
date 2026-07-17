# 悦济 FL Bridge (C 方案: Python 中间层)

> 跨项目联邦学习 HTTP 桥 — 悦济 Streamlit × reading-fl 真 FL 库

## 背景 (2026-07-16 拍板)

冬生问"联邦学习的基础还没用上?" → 选 **C 方案: Python 中间层**

**问题**: 悦济 v3.1 阶段 1-16 没用上 `reading-fl` 跨项目 Python 联邦学习库 (40+ 文件完整 Python FL 实现)

**C 方案核心**: 悦济写 `core/fl_bridge.py` (FastAPI HTTP server), 内部 `from reading_fl.core.aggregation import FedAvg` 复用真库, 部署到 Hugging Face Space (免费), 悦济云函数 HTTP 调这个桥

**关键好处**:
- 悦济不动 `reading-fl` 仓库 (单边集成, 干净)
- 真协同 + 真 FL (用 reading-fl 真 FedAvg 数学, 不是 mock)
- HF Space 部署免费 (跟 Streamlit 同 ecosystem)
- 比赛路演可现场演示: 启动 server → 3 client 注册 → 触发 FedAvg → 看聚合结果

## 4 个 HTTP Endpoint

| Method | Path | 用途 |
|---|---|---|
| GET | `/` | server info (name/version/input_dim/embed_dim) |
| POST | `/fl/register` | 客户端注册 (campus_id + n_samples) |
| POST | `/fl/upload` | 上传 backbone weights (base64 编码 npz) |
| POST | `/fl/aggregate` | 触发 FedAvg 聚合 1 轮, 返回 global_weights_b64 |
| GET | `/fl/status` | 训练历史 + 全局指标 + client 列表 |
| POST | `/fl/reset` | 清空 state (测试用) |

## 数据流 (3 客户端 → 1 轮 FedAvg)

```
client-A ─┐
client-B ─┼─→ POST /fl/register (campus_id, n_samples)
client-C ─┘
   ↓
client-A ─┐
client-B ─┼─→ POST /fl/upload (campus_id, weights_b64)
client-C ─┘   (base64 of np.savez_compressed)
   ↓
   POST /fl/aggregate
   ↓
   reading_fl.core.aggregation.FedAvg.aggregate(weights, sizes)
   ↓
   global_weights_b64 → 客户端拿回去
   ↓
   GET /fl/status (查训练历史)
```

## 核心代码 (fl_bridge.py)

```python
# 复用 reading-fl 真库 (Python 中间层核心)
from core.aggregation import FedAvg, TaskAwareAggregation, get_aggregator

@app.post("/fl/aggregate")
def aggregate(req: AggregateRequest):
    # 收集 client weights
    client_weights = [info["last_weights"] for info in _state.clients.values() if "last_weights" in info]
    client_sizes = [info["n_samples"] for info in _state.clients.values() if "last_weights" in info]

    # 触发 reading-fl 真 FedAvg 聚合
    aggregator = FedAvg()  # 或 TaskAwareAggregation()
    new_global = aggregator.aggregate(client_weights, client_sizes)
    return AggregateResponse(..., global_weights_b64=encode_weights(new_global))
```

## 输入维度

| 字段 | 维度 | 说明 |
|---|---|---|
| 4 维 MBTI | 4 | E/I/S/N/T/F/J/P 简化 4 维 |
| 9 维 9 体质 | 9 | 王琦 9 体质 one-hot |
| 1 维 心情 | 1 | PHQ-9 / 自评 0-1 |
| **input_dim** | **14** | 4 + 9 + 1 |
| embed_dim | 32 | 悦济 demo 用最小 backbone |
| backbone 形状 | (14, 32) | 1 个 np.ndarray |

## 本地测试

```bash
# 测试 1: pytest 等价测试 (TestClient, 不开 server)
python core/fl_bridge_test.py
# → 8/8 通过 (4 endpoint + FedAvg 数学 0 误差 + 错误处理 + 严守字串)

# 测试 2: 端到端 demo (启动 uvicorn + 3 client + 2 轮 FedAvg)
python core/fl_bridge_demo.py
# → server up → 3 client 注册 → 2 轮聚合 → 关闭
```

## 部署到 Hugging Face Space (比赛演示)

### 方案 A: Docker Space (推荐, 比赛路演最稳)

1. 创建 HF Space: https://huggingface.co/new-space → SDK 选 **Docker**
2. 复制 `core/fl_bridge.py` 到 Space 根目录
3. 复制 `core/Dockerfile` (待加) + `core/requirements.txt` (待加)
4. 同时 clone `reading-fl` 仓库到 Space (因为 fl_bridge.py 用 `from core.aggregation import ...`)
5. push → HF 自动 build + deploy → URL: `https://huggingface.co/spaces/dechang64/yueji-fl-bridge`

### 方案 B: Gradio Space (最简, 但功能受限)

1. 创建 HF Space: SDK 选 **Gradio**
2. 写 `app.py` 包装 `fl_bridge.py` 的 4 endpoint 为 Gradio interface
3. push → 部署

**悦济 7-17 选 A 方案** (Docker, 真暴露 4 HTTP endpoint, 比赛路演可用 curl/Postman 实测)

## 比赛路演用法 (7-25)

1. 提前 1 天启动 HF Space, 验证 URL 可访问
2. 路演现场: 笔记本跑 demo (或 HF Space 远程调)
3. 5 分钟演示:
   - 启动 FL 桥 (3 秒, uvicorn)
   - 3 个 client 注册 (1 秒)
   - 3 个 client 上传 weights (1 秒)
   - 触发 FedAvg (1 秒, 看 norm 变化)
   - 查 status (1 秒, 看训练历史)
4. 关键话术: "悦济的 14 维用户特征通过 FedAvg 跨用户聚合, 训练全局推荐模型, 但客户端原始数据 0 上传 (隐私优先)"

## 严守

- 14 严守字串 0 出现 (代码区)
- 12 玄学红线 0 出现
- 15 危机词 0 出现
- 注释顶部 `严守` 块说明
- 测试脚本 `test_08_严守字串` 自动验证

## 工期 (2026-07-17 完)

- [x] 2026-07-16: fl_bridge.py 写好 (10 KB, 4 endpoint + 复用 reading_fl 真库)
- [x] 2026-07-16: fl_bridge_test.py 写好 (9 KB, 8/8 测试通过)
- [x] 2026-07-16: fl_bridge_demo.py 写好 (5 KB, 端到端 demo 通过)
- [x] 2026-07-16: fl_bridge_README.md 写好 (本文档)
- [ ] 2026-07-17: HF Space Dockerfile + requirements + push (1 工时)
- [ ] 2026-07-17: 悦济 Streamlit 端调 FL 桥 (云函数, 比赛演示用)

## 跟 v3.1 阶段 1-19 关系

- 阶段 1-16: 微信小程序 (v3.1 阶段 1-16 已 commit, 16 commit 1 周交付)
- 阶段 17-18: 5 调式音乐知识库 v1.1 + 方案 v1.1 (48.8 KB + 42 KB)
- 阶段 19: Streamlit 端 page 6 严守修订 (commit 06a5f42, 待 push)
- **阶段 20: 联邦学习 C 方案 Python 中间层 (本文档)**
