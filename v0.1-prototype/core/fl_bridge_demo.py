"""悦济 v3.1 阶段 20 — FL 桥 端到端 demo (模拟悦济云函数 HTTP 调用)

模拟 3 个悦济用户通过 HTTP 调用 FL 桥 (跟生产真调用一致):
1. 启动 uvicorn 子进程 (127.0.0.1:7860)
2. 等 server up
3. 3 个 client 注册 + 上传 weights
4. 触发 FedAvg 聚合
5. 查 status 验证
6. 关闭 server

严守: 0 出现禁用词 (跟 fl_bridge.py 一致)

运行: python core/fl_bridge_demo.py
"""
import subprocess
import sys
import time
from pathlib import Path

import httpx
import numpy as np

sys.stdout.reconfigure(encoding="utf-8")
sys.stderr.reconfigure(encoding="utf-8")

# 复用 fl_bridge 的工具
sys.path.insert(0, str(Path(__file__).parent))
from fl_bridge import make_demo_weights, encode_weights, decode_weights, INPUT_DIM, EMBED_DIM  # noqa: E402

URL = "http://127.0.0.1:7860"
SERVER_CMD = [sys.executable, "-m", "uvicorn", "fl_bridge:app", "--host", "127.0.0.1", "--port", "7860", "--log-level", "warning"]


def start_server() -> subprocess.Popen:
    """启动 uvicorn 子进程."""
    print(f"[demo] 启动 uvicorn: {' '.join(SERVER_CMD)}")
    proc = subprocess.Popen(
        SERVER_CMD,
        cwd=str(Path(__file__).parent),
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )
    # 等 server up
    for i in range(30):
        try:
            r = httpx.get(URL, timeout=1.0)
            if r.status_code == 200:
                print(f"  ✅ server up ({i+1} retries)")
                return proc
        except Exception:
            time.sleep(0.3)
    raise RuntimeError("server failed to start in 9s")


def stop_server(proc: subprocess.Popen):
    print("[demo] 关闭 uvicorn")
    proc.terminate()
    try:
        proc.wait(timeout=5)
    except subprocess.TimeoutExpired:
        proc.kill()


def main():
    print("=" * 60)
    print("悦济 v3.1 阶段 20 — FL 桥 端到端 demo (3 client + FedAvg)")
    print("=" * 60)

    proc = start_server()
    try:
        with httpx.Client(base_url=URL, timeout=10.0) as c:
            # 1. Root
            r = c.get("/")
            print(f"\n[1] GET / → {r.json()['name']} v{r.json()['version']}")

            # 2. 3 个 client 注册
            print("\n[2] 3 个 client 注册 (模拟 3 个悦济用户)")
            clients = [
                ("user-A-郁金香花", 100),  # 9 体质平和 + 心情 60
                ("user-B-秋叶静", 200),   # 9 体质气虚 + 心情 40
                ("user-C-寒山月", 300),   # 9 体质阳虚 + 心情 30
            ]
            for cid, n in clients:
                r = c.post("/fl/register", json={"campus_id": cid, "n_samples": n})
                print(f"  ✅ {cid} n_samples={n} → {r.json()['msg']}")

            # 3. 上传 weights
            print("\n[3] 3 个 client 上传 backbone weights (14x32 np.ndarray)")
            for i, (cid, _) in enumerate(clients):
                weights = make_demo_weights(seed=i + 1)
                b64 = encode_weights(weights)
                r = c.post("/fl/upload", json={"campus_id": cid, "weights_b64": b64})
                print(f"  ✅ {cid} uploaded {r.json()['n_arrays']} array, shape={r.json()['shapes'][0]}")

            # 4. 触发 FedAvg 聚合
            print("\n[4] 触发 FedAvg 聚合 (reading_fl 真库)")
            r = c.post("/fl/aggregate", json={"aggregation": "fedavg"})
            data = r.json()
            assert data["ok"]
            print(f"  ✅ round {data['round_idx']}: {data['n_participants']} participants")
            print(f"     aggregation = {data['aggregation']}")
            print(f"     global_weight_shape = {data['metrics']['global_weight_shape']}")
            print(f"     global_weight_norm = {data['metrics']['global_weight_norm']:.4f}")

            # 验证 FedAvg 数学
            wA = make_demo_weights(seed=1)[0]
            wB = make_demo_weights(seed=2)[0]
            wC = make_demo_weights(seed=3)[0]
            expected = (1/6) * wA + (2/6) * wB + (3/6) * wC  # n_samples = [100,200,300]
            server_w = decode_weights(data["global_weights_b64"])[0]
            diff = float(np.linalg.norm(server_w - expected))
            print(f"     expected norm = {float(np.linalg.norm(expected)):.6f}, server norm = {float(np.linalg.norm(server_w)):.6f}, diff = {diff:.2e}")
            assert diff < 1e-4, f"FedAvg math mismatch! diff={diff}"
            print(f"  ✅ FedAvg 真库验证通过 (diff < 1e-4)")

            # 5. 查 status
            print("\n[5] GET /fl/status")
            r = c.get("/fl/status")
            data = r.json()
            print(f"  ✅ n_clients={data['n_clients']}, n_rounds={data['n_rounds']}")
            for cli in data["clients"]:
                print(f"     - {cli['campus_id']} n_samples={cli['n_samples']} uploaded={cli['has_uploaded']}")

            # 6. 跑第 2 轮 (测试多轮)
            print("\n[6] 第 2 轮聚合 (re-upload 后)")
            for i, (cid, _) in enumerate(clients):
                weights = make_demo_weights(seed=(i + 1) * 10)  # 新 seed
                b64 = encode_weights(weights)
                c.post("/fl/upload", json={"campus_id": cid, "weights_b64": b64})
            r = c.post("/fl/aggregate", json={"aggregation": "fedavg"})
            print(f"  ✅ round {r.json()['round_idx']} aggregated, n_participants={r.json()['n_participants']}")

        print()
        print("=" * 60)
        print("✅ demo 端到端通过: server 启动 + 3 client 注册 + 上传 + 2 轮 FedAvg 聚合 + status")
        print("=" * 60)
    finally:
        stop_server(proc)


if __name__ == "__main__":
    main()
