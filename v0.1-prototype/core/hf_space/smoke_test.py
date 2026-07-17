"""HF Space app.py 4 endpoint smoke test (验证 import + FedAvg 跑通)."""
import sys
sys.stdout.reconfigure(encoding="utf-8")
sys.path.insert(0, ".")
from app import app, INPUT_DIM, EMBED_DIM, _state
from fastapi.testclient import TestClient
import numpy as np
import base64
import io

c = TestClient(app)
r = c.get("/")
data = r.json()
print(f"GET /: {data['name']} v{data['version']}, input_dim={data['input_dim']}")

_state.reset()
for i, cid in enumerate(["campus-A", "campus-B", "campus-C"]):
    r = c.post("/fl/register", json={"campus_id": cid, "n_samples": 100 * (i + 1)})
    assert r.status_code == 200

for i, cid in enumerate(["campus-A", "campus-B", "campus-C"]):
    rng = np.random.default_rng(i + 1)
    w = [rng.standard_normal((INPUT_DIM, EMBED_DIM)).astype(np.float32) * 0.1]
    buf = io.BytesIO()
    np.savez_compressed(buf, *w)
    b64 = base64.b64encode(buf.getvalue()).decode("utf-8")
    r = c.post("/fl/upload", json={"campus_id": cid, "weights_b64": b64})
    assert r.status_code == 200

r = c.post("/fl/aggregate", json={"aggregation": "fedavg"})
data = r.json()
print(f"aggregate: round {data['round_idx']}, norm = {data['metrics']['global_weight_norm']:.4f}")

# FedAvg math
wA = [np.random.default_rng(1).standard_normal((INPUT_DIM, EMBED_DIM)).astype(np.float32) * 0.1]
wB = [np.random.default_rng(2).standard_normal((INPUT_DIM, EMBED_DIM)).astype(np.float32) * 0.1]
wC = [np.random.default_rng(3).standard_normal((INPUT_DIM, EMBED_DIM)).astype(np.float32) * 0.1]
expected = (1 / 6) * wA[0] + (2 / 6) * wB[0] + (3 / 6) * wC[0]
expected_norm = float(np.linalg.norm(expected))
print(f"expected norm = {expected_norm:.4f}, server norm = {data['metrics']['global_weight_norm']:.4f}")

r = c.get("/fl/status")
data = r.json()
print(f"status: n_clients={data['n_clients']}, n_rounds={data['n_rounds']}")

print("✅ HF Space app.py 4 endpoint + FedAvg 跑通")
