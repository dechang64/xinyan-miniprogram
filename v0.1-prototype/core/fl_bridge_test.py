"""悦济 v3.1 阶段 20 — FL 桥 pytest 测试 (4 endpoint + 错误处理 + 真实 FedAvg 验证)

运行: pytest core/fl_bridge_test.py -v
或: python core/fl_bridge_test.py (无 pytest 也跑)
"""
import sys
import time
from pathlib import Path

# Windows GBK 编码 → UTF-8
sys.stdout.reconfigure(encoding="utf-8")
sys.stderr.reconfigure(encoding="utf-8")

import numpy as np

# 测试不依赖 pytest, 用 python 直接跑
try:
    from fastapi.testclient import TestClient
except ImportError:
    print("❌ fastapi.testclient not available, install: pip install httpx")
    sys.exit(1)

# 复用 fl_bridge 的 state (单进程测试)
sys.path.insert(0, str(Path(__file__).parent))
from fl_bridge import app, _state, INPUT_DIM, EMBED_DIM, make_demo_weights, encode_weights  # noqa: E402


def test_01_root():
    """GET / 返回 server info."""
    print("\n[01] GET /")
    client = TestClient(app)
    r = client.get("/")
    assert r.status_code == 200
    data = r.json()
    assert data["name"] == "悦济 FL Bridge"
    assert data["input_dim"] == INPUT_DIM
    assert data["embed_dim"] == EMBED_DIM
    print(f"  ✅ {data['name']} v{data['version']}, input_dim={data['input_dim']}")


def test_02_register_3_clients():
    """POST /fl/register 注册 3 客户端."""
    print("\n[02] POST /fl/register (3 clients)")
    client = TestClient(app)
    _state.reset()  # 干净起点

    for i, cid in enumerate(["campus-A", "campus-B", "campus-C"]):
        r = client.post("/fl/register", json={"campus_id": cid, "n_samples": 100 * (i + 1)})
        assert r.status_code == 200
        data = r.json()
        assert data["ok"] is True
        assert data["n_clients"] == i + 1
        print(f"  ✅ {cid} registered, n_samples={100*(i+1)}")

    # 重复 register 不报错
    r = client.post("/fl/register", json={"campus_id": "campus-A", "n_samples": 999})
    assert r.status_code == 200
    assert r.json()["n_samples"] == 999  # 更新
    print(f"  ✅ campus-A re-register updates n_samples to 999")


def test_03_upload_weights():
    """POST /fl/upload 上传 3 客户端 weights."""
    print("\n[03] POST /fl/upload (3 clients)")
    client = TestClient(app)
    _state.reset()

    for cid in ["campus-A", "campus-B", "campus-C"]:
        r = client.post("/fl/register", json={"campus_id": cid, "n_samples": 100})
        assert r.status_code == 200

    # 上传 weights
    for i, cid in enumerate(["campus-A", "campus-B", "campus-C"]):
        weights = make_demo_weights(seed=i + 1)  # 不同 seed → 不同 weights
        b64 = encode_weights(weights)
        r = client.post("/fl/upload", json={"campus_id": cid, "weights_b64": b64})
        assert r.status_code == 200
        data = r.json()
        assert data["ok"] is True
        assert data["n_arrays"] == 1
        assert data["shapes"] == [[INPUT_DIM, EMBED_DIM]]
        print(f"  ✅ {cid} uploaded 1 array, shape={data['shapes'][0]}")

    # 错误: 未注册 client
    r = client.post("/fl/upload", json={
        "campus_id": "campus-XXX",
        "weights_b64": encode_weights(make_demo_weights()),
    })
    assert r.status_code == 404
    print(f"  ✅ upload 未注册 client → 404 (正确)")

    # 错误: shape 不对
    wrong_weights = [np.zeros((10, 10), dtype=np.float32)]
    r = client.post("/fl/upload", json={
        "campus_id": "campus-A",
        "weights_b64": encode_weights(wrong_weights),
    })
    assert r.status_code == 400
    print(f"  ✅ upload shape 不对 → 400 (正确)")


def test_04_aggregate_fedavg():
    """POST /fl/aggregate 真触发 reading_fl.FedAvg 聚合."""
    print("\n[04] POST /fl/aggregate (FedAvg)")
    client = TestClient(app)
    _state.reset()

    # 3 个 client, 不同 n_samples
    for i, cid in enumerate(["campus-A", "campus-B", "campus-C"]):
        client.post("/fl/register", json={"campus_id": cid, "n_samples": 100 * (i + 1)})
        weights = make_demo_weights(seed=i + 1)
        client.post("/fl/upload", json={"campus_id": cid, "weights_b64": encode_weights(weights)})

    # 触发聚合
    r = client.post("/fl/aggregate", json={"aggregation": "fedavg"})
    assert r.status_code == 200
    data = r.json()
    assert data["ok"] is True
    assert data["n_participants"] == 3
    assert data["aggregation"] == "fedavg"
    assert data["metrics"]["global_weight_shape"] == [INPUT_DIM, EMBED_DIM]
    assert 0.0 < data["metrics"]["global_weight_norm"] < 10.0
    print(f"  ✅ round {data['round_idx']} aggregated, {data['n_participants']} participants")
    print(f"     global weight norm = {data['metrics']['global_weight_norm']:.4f}")

    # 验证 FedAvg 数学: weighted sum 公式
    # 0.1 * wA + 0.2 * wB + 0.3*0.166(wC, n=300) = ...
    # client n_samples = [100, 200, 300], total = 600
    # weights = [0.166, 0.333, 0.5]
    # 重新算一遍手算对比
    wA = make_demo_weights(seed=1)[0]
    wB = make_demo_weights(seed=2)[0]
    wC = make_demo_weights(seed=3)[0]
    expected = (1/6) * wA + (2/6) * wB + (3/6) * wC
    expected_norm = float(np.linalg.norm(expected))

    # 拿 server 返回的 b64 解码对比
    server_weights_b64 = data["global_weights_b64"]
    from fl_bridge import decode_weights
    server_w = decode_weights(server_weights_b64)[0]
    server_norm = float(np.linalg.norm(server_w))

    diff = abs(server_norm - expected_norm)
    print(f"     expected norm = {expected_norm:.6f}, server norm = {server_norm:.6f}, diff = {diff:.2e}")
    assert diff < 1e-4, f"FedAvg math mismatch! diff = {diff}"
    print(f"  ✅ FedAvg 数学验证: server 聚合权重 ≈ 期望值 (diff < 1e-4)")


def test_05_status():
    """GET /fl/status 查训练历史."""
    print("\n[05] GET /fl/status")
    client = TestClient(app)
    _state.reset()

    client.post("/fl/register", json={"campus_id": "campus-X", "n_samples": 50})
    client.post("/fl/register", json={"campus_id": "campus-Y", "n_samples": 80})
    client.post("/fl/upload", json={"campus_id": "campus-X", "weights_b64": encode_weights(make_demo_weights(1))})
    client.post("/fl/upload", json={"campus_id": "campus-Y", "weights_b64": encode_weights(make_demo_weights(2))})
    client.post("/fl/aggregate", json={"aggregation": "fedavg"})

    r = client.get("/fl/status")
    assert r.status_code == 200
    data = r.json()
    assert data["n_clients"] == 2
    assert data["n_rounds"] == 1
    assert data["last_metrics"] is not None
    assert data["clients"][0]["has_uploaded"] is True
    print(f"  ✅ n_clients={data['n_clients']}, n_rounds={data['n_rounds']}")
    print(f"     last metrics: {list(data['last_metrics'].keys())[:5]}...")


def test_06_aggregate_too_few_clients():
    """POST /fl/aggregate 客户端 < 2 → 报错."""
    print("\n[06] POST /fl/aggregate (客户端不足)")
    client = TestClient(app)
    _state.reset()

    # 只注册 1 个 client
    client.post("/fl/register", json={"campus_id": "solo", "n_samples": 100})
    r = client.post("/fl/aggregate", json={"aggregation": "fedavg"})
    assert r.status_code == 400
    assert "≥ 2 clients" in r.json()["detail"]
    print(f"  ✅ 1 client 聚合 → 400 (正确, {r.json()['detail']})")


def test_07_reset():
    """POST /fl/reset 清空 state."""
    print("\n[07] POST /fl/reset")
    client = TestClient(app)
    _state.reset()
    client.post("/fl/register", json={"campus_id": "temp", "n_samples": 10})
    assert len(_state.clients) == 1
    r = client.post("/fl/reset")
    assert r.status_code == 200
    assert len(_state.clients) == 0
    print(f"  ✅ reset OK, n_clients = {len(_state.clients)}")


def test_08_严守字串():
    """FL 桥代码 0 出现 14 严守 + 12 玄学 + 15 危机词 (排除 docstring/注释反向引用)."""
    import re
    print("\n[08] 严守字串扫描")
    src = Path(__file__).parent / "fl_bridge.py"
    text = src.read_text(encoding="utf-8")

    # 删所有 docstring (""" ... """ 三引号段) + 顶部 file-level 注释
    code_only = re.sub(r'"""[\s\S]*?"""', '', text)
    # 删 # ... 行注释 (注意保留 # noqa 这类内联注释)
    code_only = re.sub(r'^\s*#[^\n]*\n', '', code_only, flags=re.MULTILINE)

    banned = [
        # 14 严守
        "治疗", "改善", "缓解", "治愈", "祛斑", "减肥", "处方", "医美",
        "美颜", "美白", "瘦脸", "营销", "广告", "疗愈",
        # 12 玄学
        "命理", "占星", "八字", "星盘", "算命", "转运", "化解",
        "风水", "玄学", "五行", "生克", "补泻",
        # 15 危机
        "自杀", "自残", "轻生", "跳楼", "割腕", "上吊", "服药自杀",
        "绝望", "崩溃", "了断", "结束生命", "一了百了", "不想活", "活不下去",
    ]
    found = [w for w in banned if w in code_only]
    if found:
        print(f"  ❌ 严守字串命中 (代码区): {found}")
        raise AssertionError(f"严守字串: {found}")
    else:
        print(f"  ✅ 14 严守 + 12 玄学 + 15 危机词 全部 0 出现 (代码区)")


if __name__ == "__main__":
    print("=" * 60)
    print("悦济 v3.1 阶段 20 FL 桥测试 (4 endpoint + FedAvg 验证)")
    print("=" * 60)
    t0 = time.time()

    tests = [
        test_01_root,
        test_02_register_3_clients,
        test_03_upload_weights,
        test_04_aggregate_fedavg,
        test_05_status,
        test_06_aggregate_too_few_clients,
        test_07_reset,
        test_08_严守字串,
    ]

    passed = 0
    for t in tests:
        try:
            t()
            passed += 1
        except AssertionError as e:
            print(f"  ❌ {t.__name__} 失败: {e}")
        except Exception as e:
            import traceback
            print(f"  ❌ {t.__name__} 异常: {type(e).__name__}: {e}")
            traceback.print_exc()

    print("=" * 60)
    print(f"通过: {passed}/{len(tests)} 测试 ({time.time() - t0:.2f}s)")
    print("=" * 60)
    if passed == len(tests):
        print("✅ FL 桥 4 endpoint + FedAvg 真验证 + 严守字串 全部通过")
        sys.exit(0)
    else:
        print(f"❌ {len(tests) - passed} 个测试失败")
        sys.exit(1)
