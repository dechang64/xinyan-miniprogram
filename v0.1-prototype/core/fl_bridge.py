"""悦济 v3.1 阶段 20 — 联邦学习 HTTP 桥 (FL Bridge)

背景 (2026-07-16 拍板):
- 冬生提"联邦学习的基础还没用上?" → 选 C 方案 (Python 中间层)
- 悦济不动 reading-fl 仓库, 但真协同 + 真 FL
- 部署 Hugging Face Space (免费), 悦济云函数 HTTP 调这个桥

设计:
- 内部 `from reading_fl.core.aggregation import FedAvg` (复用 reading-fl 真库, 不重写)
- 4 个 HTTP endpoint:
  - POST /fl/register  — 客户端注册 (campus_id + n_samples)
  - POST /fl/upload    — 上传 backbone weights (base64 编码的 np.ndarray list)
  - POST /fl/aggregate — 触发 FedAvg 聚合 1 轮 (返回聚合后 weights)
  - GET  /fl/status    — 查训练历史 + 全局指标
- 输入维度 input_dim = 14 (4 维 MBTI + 9 维体质 + 1 维心情均值)
- backbone 形状: [input_dim=14, embed_dim=32] = 1 个 np.ndarray
  (悦济 demo 用最小 backbone, 真生产用 reading-fl 默认 128-256)

不动 reading-fl 仓库, 纯 Python 库调用 (核心是 FedAvg.aggregate())
悦济 v3.1 阶段 20: 7-17 工期 1-2 天, 比赛 7-25 前可演示

严守:
- 14 严守字串 0 出现
- 12 玄学红线 0 出现
- 15 危机词 0 出现
- 12356 危机热线 (注释顶部, 不在 UI 显示)
"""

import base64
import io
import sys
import time
from pathlib import Path
from typing import Dict, List, Optional

import numpy as np
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

# 复用 reading-fl 真库 (Python 中间层核心)
_RFL_PATH = Path(r"C:\Users\decha\.mavis\agents\mavis\workspace\Reading-FL")
if str(_RFL_PATH) not in sys.path:
    sys.path.insert(0, str(_RFL_PATH))

from core.aggregation import FedAvg, TaskAwareAggregation, get_aggregator  # noqa: E402

# ── 配置 ──
INPUT_DIM = 14   # 4 维 MBTI (E/I/S/N/T/F/J/P 简化 4 维) + 9 维 9 体质 + 1 维 心情均值
EMBED_DIM = 32   # 悦济 demo 用最小 backbone
N_LAYERS = 1     # 1 层 Linear (简单 demo)
DEFAULT_AGGREGATION = "fedavg"  # 悦济 demo 用 FedAvg (TaskAware 需要 client_metrics)


# ── State ──
class FLBridgeState:
    """FL 桥全局状态 (单 instance, demo 用, 生产用 Redis/PostgreSQL)."""

    def __init__(self):
        self.clients: Dict[str, dict] = {}  # campus_id -> {n_samples, last_upload_round}
        self.history: List[dict] = []        # 每轮聚合记录
        self.global_weights: Optional[List[np.ndarray]] = None
        self.created_at = time.time()

    def reset(self):
        self.clients.clear()
        self.history.clear()
        self.global_weights = None


# 全局 state (FastAPI 单进程)
_state = FLBridgeState()


# ── Pydantic Schema ──
class RegisterRequest(BaseModel):
    campus_id: str = Field(..., min_length=1, max_length=64, description="客户端 ID, e.g. user hash")
    n_samples: int = Field(..., ge=1, le=10_000_000, description="客户端样本数 (用于 FedAvg 权重)")


class RegisterResponse(BaseModel):
    ok: bool
    campus_id: str
    n_samples: int
    n_clients: int
    msg: str


class UploadRequest(BaseModel):
    campus_id: str = Field(..., min_length=1, max_length=64)
    weights_b64: str = Field(..., description="base64 编码的 npz (含 npy 数组列表)")


class UploadResponse(BaseModel):
    ok: bool
    campus_id: str
    n_arrays: int
    shapes: List[List[int]]
    msg: str


class AggregateRequest(BaseModel):
    aggregation: str = Field(DEFAULT_AGGREGATION, description="fedavg 或 task_aware")
    reset_after: bool = Field(False, description="聚合后是否清空 client 缓存 (生产用)")


class AggregateResponse(BaseModel):
    ok: bool
    round_idx: int
    aggregation: str
    n_participants: int
    global_weights_b64: str
    metrics: dict
    msg: str


class StatusResponse(BaseModel):
    ok: bool
    n_clients: int
    n_rounds: int
    aggregation: str
    last_metrics: Optional[dict]
    clients: List[dict]
    msg: str


# ── Helper ──
def encode_weights(weights: List[np.ndarray]) -> str:
    """np.ndarray list → base64 字符串 (npz 压缩)."""
    buf = io.BytesIO()
    np.savez_compressed(buf, *weights)
    return base64.b64encode(buf.getvalue()).decode("utf-8")


def decode_weights(b64: str) -> List[np.ndarray]:
    """base64 字符串 → np.ndarray list."""
    raw = base64.b64decode(b64)
    buf = io.BytesIO(raw)
    npz = np.load(buf, allow_pickle=False)
    return [npz[k] for k in npz.files]


def make_demo_weights(seed: int = 0) -> List[np.ndarray]:
    """生成 1 个 demo backbone weights (INPUT_DIM x EMBED_DIM)."""
    rng = np.random.default_rng(seed)
    return [rng.standard_normal((INPUT_DIM, EMBED_DIM)).astype(np.float32) * 0.1]


# ── FastAPI App ──
app = FastAPI(
    title="悦济 FL Bridge",
    description="悦济 × reading-fl 联邦学习 HTTP 桥 (C 方案)",
    version="0.1.0",
)


@app.get("/")
def root():
    return {
        "name": "悦济 FL Bridge",
        "version": "0.1.0",
        "endpoints": [
            "POST /fl/register",
            "POST /fl/upload",
            "POST /fl/aggregate",
            "GET  /fl/status",
        ],
        "input_dim": INPUT_DIM,
        "embed_dim": EMBED_DIM,
        "default_aggregation": DEFAULT_AGGREGATION,
    }


@app.post("/fl/register", response_model=RegisterResponse)
def register(req: RegisterRequest):
    if req.campus_id in _state.clients:
        return RegisterResponse(
            ok=True,
            campus_id=req.campus_id,
            n_samples=req.n_samples,
            n_clients=len(_state.clients),
            msg=f"client {req.campus_id} already registered, n_samples updated",
        )
    _state.clients[req.campus_id] = {
        "n_samples": req.n_samples,
        "last_upload_round": None,
        "registered_at": time.time(),
    }
    return RegisterResponse(
        ok=True,
        campus_id=req.campus_id,
        n_samples=req.n_samples,
        n_clients=len(_state.clients),
        msg=f"client {req.campus_id} registered, total {len(_state.clients)} clients",
    )


@app.post("/fl/upload", response_model=UploadResponse)
def upload(req: UploadRequest):
    if req.campus_id not in _state.clients:
        raise HTTPException(
            status_code=404,
            detail=f"client {req.campus_id} not registered, call /fl/register first",
        )

    try:
        weights = decode_weights(req.weights_b64)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"base64 decode failed: {e}")

    if not weights:
        raise HTTPException(status_code=400, detail="empty weights")

    # 校验 shape (demo 阶段只允许 1 层 backbone, shape = [INPUT_DIM, EMBED_DIM])
    expected_shape = (INPUT_DIM, EMBED_DIM)
    for w in weights:
        if w.shape != expected_shape:
            raise HTTPException(
                status_code=400,
                detail=f"weight shape {w.shape} != expected {expected_shape}",
            )

    _state.clients[req.campus_id]["last_weights"] = weights
    _state.clients[req.campus_id]["last_upload_round"] = len(_state.history)

    return UploadResponse(
        ok=True,
        campus_id=req.campus_id,
        n_arrays=len(weights),
        shapes=[list(w.shape) for w in weights],
        msg=f"uploaded {len(weights)} arrays, shapes OK",
    )


@app.post("/fl/aggregate", response_model=AggregateResponse)
def aggregate(req: AggregateRequest):
    if len(_state.clients) < 2:
        raise HTTPException(
            status_code=400,
            detail=f"need ≥ 2 clients with uploaded weights, got {len(_state.clients)}",
        )

    # 收集所有 client weights (必须都 upload 过)
    participants = []
    client_weights = []
    client_sizes = []
    for cid, info in _state.clients.items():
        if "last_weights" not in info:
            continue
        participants.append(cid)
        client_weights.append(info["last_weights"])
        client_sizes.append(info["n_samples"])

    if len(participants) < 2:
        raise HTTPException(
            status_code=400,
            detail=f"need ≥ 2 clients with uploaded weights, got {len(participants)}",
        )

    # 触发 reading-fl 真 FedAvg 聚合
    if req.aggregation == "fedavg":
        aggregator = FedAvg()
    elif req.aggregation == "task_aware":
        aggregator = TaskAwareAggregation()  # 缺 client_metrics 会自动 fallback 到 FedAvg
    else:
        raise HTTPException(
            status_code=400,
            detail=f"unknown aggregation: {req.aggregation}, use 'fedavg' or 'task_aware'",
        )

    new_global = aggregator.aggregate(client_weights, client_sizes)
    _state.global_weights = new_global

    # 记录历史
    round_metrics = {
        "round": len(_state.history),
        "aggregation": req.aggregation,
        "n_participants": len(participants),
        "participants": participants,
        "client_data_sizes": client_sizes,
        "global_weight_shape": list(new_global[0].shape),
        "global_weight_norm": float(np.linalg.norm(new_global[0])),
        "ts": time.time(),
    }
    _state.history.append(round_metrics)

    # 可选: 聚合后清空 client 缓存 (生产用, 防止下一轮用旧 weights)
    if req.reset_after:
        for cid in participants:
            if "last_weights" in _state.clients[cid]:
                del _state.clients[cid]["last_weights"]

    return AggregateResponse(
        ok=True,
        round_idx=len(_state.history) - 1,
        aggregation=req.aggregation,
        n_participants=len(participants),
        global_weights_b64=encode_weights(new_global),
        metrics=round_metrics,
        msg=f"round {len(_state.history) - 1} aggregated, {len(participants)} participants",
    )


@app.get("/fl/status", response_model=StatusResponse)
def status():
    client_list = [
        {
            "campus_id": cid,
            "n_samples": info["n_samples"],
            "has_uploaded": "last_weights" in info,
            "last_upload_round": info.get("last_upload_round"),
        }
        for cid, info in _state.clients.items()
    ]
    last = _state.history[-1] if _state.history else None
    return StatusResponse(
        ok=True,
        n_clients=len(_state.clients),
        n_rounds=len(_state.history),
        aggregation=DEFAULT_AGGREGATION,
        last_metrics=last,
        clients=client_list,
        msg=f"server alive {int(time.time() - _state.created_at)}s, {len(_state.clients)} clients, {len(_state.history)} rounds",
    )


@app.post("/fl/reset")
def reset():
    """重置 server state (测试用, 生产用 admin auth)."""
    _state.reset()
    return {"ok": True, "msg": "state reset"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=7860)  # HF Space 默认 7860
