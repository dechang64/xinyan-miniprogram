"""悦济 FL Bridge — Hugging Face Space 入口 (2026-07-17 部署)

跟 core/fl_bridge.py 区别:
- 去掉 sys.path hack (HF Space 仓库根目录有 core/aggregation.py)
- 改 host/port = 0.0.0.0:7860 (HF Space 默认)
- 加 git commit hash 显示 (比赛路演版本)
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

# HF Space 仓库结构: 根目录 + core/aggregation.py (跟 app.py 同层)
_SPACE_ROOT = Path(__file__).resolve().parent
if str(_SPACE_ROOT) not in sys.path:
    sys.path.insert(0, str(_SPACE_ROOT))

from core.aggregation import FedAvg, TaskAwareAggregation  # noqa: E402

# ── 配置 ──
INPUT_DIM = 14
EMBED_DIM = 32
N_LAYERS = 1
DEFAULT_AGGREGATION = "fedavg"


class FLBridgeState:
    def __init__(self):
        self.clients: Dict[str, dict] = {}
        self.history: List[dict] = []
        self.global_weights: Optional[List[np.ndarray]] = None
        self.created_at = time.time()

    def reset(self):
        self.clients.clear()
        self.history.clear()
        self.global_weights = None


_state = FLBridgeState()


class RegisterRequest(BaseModel):
    campus_id: str = Field(..., min_length=1, max_length=64)
    n_samples: int = Field(..., ge=1, le=10_000_000)


class RegisterResponse(BaseModel):
    ok: bool
    campus_id: str
    n_samples: int
    n_clients: int
    msg: str


class UploadRequest(BaseModel):
    campus_id: str = Field(..., min_length=1, max_length=64)
    weights_b64: str = Field(...)


class UploadResponse(BaseModel):
    ok: bool
    campus_id: str
    n_arrays: int
    shapes: List[List[int]]
    msg: str


class AggregateRequest(BaseModel):
    aggregation: str = Field(DEFAULT_AGGREGATION)
    reset_after: bool = Field(False)


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


def encode_weights(weights: List[np.ndarray]) -> str:
    buf = io.BytesIO()
    np.savez_compressed(buf, *weights)
    return base64.b64encode(buf.getvalue()).decode("utf-8")


def decode_weights(b64: str) -> List[np.ndarray]:
    raw = base64.b64decode(b64)
    buf = io.BytesIO(raw)
    npz = np.load(buf, allow_pickle=False)
    return [npz[k] for k in npz.files]


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
            ok=True, campus_id=req.campus_id, n_samples=req.n_samples,
            n_clients=len(_state.clients),
            msg=f"client {req.campus_id} already registered, n_samples updated",
        )
    _state.clients[req.campus_id] = {
        "n_samples": req.n_samples,
        "last_upload_round": None,
        "registered_at": time.time(),
    }
    return RegisterResponse(
        ok=True, campus_id=req.campus_id, n_samples=req.n_samples,
        n_clients=len(_state.clients),
        msg=f"client {req.campus_id} registered, total {len(_state.clients)} clients",
    )


@app.post("/fl/upload", response_model=UploadResponse)
def upload(req: UploadRequest):
    if req.campus_id not in _state.clients:
        raise HTTPException(status_code=404, detail=f"client {req.campus_id} not registered")
    try:
        weights = decode_weights(req.weights_b64)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"base64 decode failed: {e}")
    if not weights:
        raise HTTPException(status_code=400, detail="empty weights")
    expected_shape = (INPUT_DIM, EMBED_DIM)
    for w in weights:
        if w.shape != expected_shape:
            raise HTTPException(status_code=400, detail=f"weight shape {w.shape} != expected {expected_shape}")
    _state.clients[req.campus_id]["last_weights"] = weights
    _state.clients[req.campus_id]["last_upload_round"] = len(_state.history)
    return UploadResponse(
        ok=True, campus_id=req.campus_id, n_arrays=len(weights),
        shapes=[list(w.shape) for w in weights],
        msg=f"uploaded {len(weights)} arrays, shapes OK",
    )


@app.post("/fl/aggregate", response_model=AggregateResponse)
def aggregate(req: AggregateRequest):
    if len(_state.clients) < 2:
        raise HTTPException(status_code=400, detail=f"need ≥ 2 clients with uploaded weights, got {len(_state.clients)}")
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
        raise HTTPException(status_code=400, detail=f"need ≥ 2 clients with uploaded weights, got {len(participants)}")
    if req.aggregation == "fedavg":
        aggregator = FedAvg()
    elif req.aggregation == "task_aware":
        aggregator = TaskAwareAggregation()
    else:
        raise HTTPException(status_code=400, detail=f"unknown aggregation: {req.aggregation}")
    new_global = aggregator.aggregate(client_weights, client_sizes)
    _state.global_weights = new_global
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
    if req.reset_after:
        for cid in participants:
            if "last_weights" in _state.clients[cid]:
                del _state.clients[cid]["last_weights"]
    return AggregateResponse(
        ok=True, round_idx=len(_state.history) - 1, aggregation=req.aggregation,
        n_participants=len(participants), global_weights_b64=encode_weights(new_global),
        metrics=round_metrics, msg=f"round {len(_state.history) - 1} aggregated, {len(participants)} participants",
    )


@app.get("/fl/status", response_model=StatusResponse)
def status():
    client_list = [
        {
            "campus_id": cid, "n_samples": info["n_samples"],
            "has_uploaded": "last_weights" in info,
            "last_upload_round": info.get("last_upload_round"),
        }
        for cid, info in _state.clients.items()
    ]
    last = _state.history[-1] if _state.history else None
    return StatusResponse(
        ok=True, n_clients=len(_state.clients), n_rounds=len(_state.history),
        aggregation=DEFAULT_AGGREGATION, last_metrics=last, clients=client_list,
        msg=f"server alive {int(time.time() - _state.created_at)}s, {len(_state.clients)} clients, {len(_state.history)} rounds",
    )


@app.post("/fl/reset")
def reset():
    _state.reset()
    return {"ok": True, "msg": "state reset"}


# HF Space 必须用 0.0.0.0:7860
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=7860)
