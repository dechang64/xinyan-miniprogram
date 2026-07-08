"""
心颜 v0.7.1.6 严格审计 v5: 真 Streamlit 渲染
模拟 Python 3.14 + sxtwl 屏蔽 + 真渲染 8 page (app + 7 pages)

策略: 用真 streamlit 模块, 替换其所有 API 属性为我们的 mock.
保留真 streamlit 子模块 (components / runtime / delta_generator / logger).
"""
import os
import sys
import importlib.util
from pathlib import Path

WS = Path(r"C:\Users\decha\.mavis\agents\mavis\workspace")
# Allow override via argv to test repo version (the one that gets pushed)
import os as _os
if len(_os.sys.argv) > 1 and _os.sys.argv[1] == "--repo":
    PROTO = WS / "xinyan-miniprogram" / "v0.1-prototype"
else:
    PROTO = WS / "xinyan_prototype"

PAGES = [
    ("app.py", "app.py"),
    ("pages/1_每日一经.py", "pages/1_每日一经.py"),
    ("pages/2_每日一汤.py", "pages/2_每日一汤.py"),
    ("pages/3_共修堂.py", "pages/3_共修堂.py"),
    ("pages/4_镜中.py", "pages/4_镜中.py"),
    ("pages/5_我的.py", "pages/5_我的.py"),
    ("pages/6_人格画像.py", "pages/6_人格画像.py"),
    ("pages/7_心颜之音.py", "pages/7_心颜之音.py"),
]


# ============ Ctx (context manager) ============
class Ctx:
    def __enter__(self): return self
    def __exit__(self, *a): pass

    # 子 context 可链式调用: ctx.expander(...).markdown(...)
    def __getattr__(self, k):
        if k in ("markdown", "caption", "code", "info", "warning", "error", "success", "text", "write", "latex"):
            return lambda *a, **kw: None
        if k in ("button", "toggle", "checkbox", "download_button", "form_submit_button"):
            return lambda *a, **kw: False
        if k in ("metric", "progress"):
            return lambda *a, **kw: None
        if k in ("expander", "container", "form"):
            return lambda *a, **kw: Ctx()
        if k == "columns":
            return lambda n, **kw: [Ctx() for _ in range(n if isinstance(n, int) else len(n))]
        if k == "tabs":
            return lambda ns, **kw: [Ctx() for _ in ns]
        if k in ("image", "audio", "video"):
            return lambda *a, **kw: None
        if k in ("selectbox", "radio", "multiselect", "text_input", "text_area",
                 "number_input", "slider", "date_input", "time_input", "file_uploader",
                 "camera_input", "color_picker"):
            return lambda *a, **kw: None
        if k == "chat_message":
            return lambda role: Ctx()
        return lambda *a, **kw: None


class SessionStateProxy:
    def __init__(self):
        object.__setattr__(self, "_d", {})
    def __getattr__(self, k):
        if k == "_d":
            return object.__getattribute__(self, "_d")
        try:
            return self._d[k]
        except KeyError:
            raise AttributeError(k)
    def __setattr__(self, k, v):
        if k == "_d":
            object.__setattr__(self, "_d", v)
            return
        self._d[k] = v
    def __contains__(self, k):
        return k in self._d
    def __iter__(self):
        return iter(self._d)
    def get(self, k, default=None):
        return self._d.get(k, default)
    def keys(self):
        return self._d.keys()
    def values(self):
        return self._d.values()
    def items(self):
        return self._d.items()
    def pop(self, k, *a):
        return self._d.pop(k, *a)
    def __setitem__(self, k, v):
        self._d[k] = v
    def __getitem__(self, k):
        return self._d[k]
    def __delitem__(self, k):
        del self._d[k]
    def update(self, *a, **k):
        self._d.update(*a, **k)
    def to_dict(self):
        return dict(self._d)


# ============ MockSt: 提供完整 streamlit API ============
class MockSt:
    def __init__(self):
        self.calls = []
        self.session_state = SessionStateProxy()

    def _c(self, n, a=""):
        self.calls.append((n, str(a)[:80]))

    # ---- basic ----
    def set_page_config(self, **k): pass
    def title(self, t, **k): self._c("title", t)
    def header(self, t, **k): self._c("header", t)
    def subheader(self, t, **k): self._c("subheader", t)
    def markdown(self, t, **k): self._c("md", str(t)[:80])
    def caption(self, t, **k): self._c("cap", str(t)[:80])
    def text(self, t, **k): self._c("txt", str(t)[:80])
    def write(self, *a, **k): self._c("write", str(a)[:80] if a else "")
    def code(self, t, **k): self._c("code", str(t)[:80])
    def divider(self): pass
    def latex(self, t, **k): pass
    def json(self, obj, **k): pass

    def success(self, t, **k): self._c("succ", str(t)[:80])
    def warning(self, t, **k): self._c("warn", str(t)[:80])
    def info(self, t, **k): self._c("info", str(t)[:80])
    def error(self, t, **k): self._c("err", str(t)[:80])
    def exception(self, e): self._c("exc", str(e))
    def progress(self, v, text=None, **k): self._c("prog", str(v))
    def spinner(self, t): return Ctx()
    def toast(self, t, **k): pass
    def balloons(self): pass
    def snow(self): pass
    def empty(self): return Ctx()

    # ---- widgets ----
    def button(self, label, **k): self._c("btn", label); return False
    def toggle(self, label, **k): self._c("tog", label); return False
    def checkbox(self, label, **k): self._c("chk", label); return False
    def radio(self, label, options, **k):
        if k.get("key") and k["key"] in self.session_state:
            return self.session_state[k["key"]]
        return options[0] if options else None
    def selectbox(self, label, options=None, **k):
        if k.get("key") and k["key"] in self.session_state:
            return self.session_state[k["key"]]
        if options is None:
            return None
        idx = k.get("index", 0)
        if isinstance(idx, int) and 0 <= idx < len(options):
            return options[idx]
        return options[0] if options else None
    def multiselect(self, label, options=None, **k):
        if k.get("key") and k["key"] in self.session_state:
            return self.session_state[k["key"]]
        return []
    def slider(self, label, *args, **k):
        if args:
            value = args[0]
        else:
            value = k.get("value", 0)
        if k.get("key") and k["key"] in self.session_state:
            return self.session_state[k["key"]]
        return value
    def select_slider(self, label, options=None, **k):
        if options is None:
            return None
        return options[k.get("index", 0)] if options else None
    def text_input(self, label, **k):
        if k.get("key") and k["key"] in self.session_state:
            return self.session_state[k["key"]]
        return k.get("value", "")
    def text_area(self, label, **k):
        if k.get("key") and k["key"] in self.session_state:
            return self.session_state[k["key"]]
        return k.get("value", "")
    def number_input(self, label, **k):
        if k.get("key") and k["key"] in self.session_state:
            return self.session_state[k["key"]]
        return k.get("value", 0)
    def date_input(self, label, **k):
        from datetime import date
        return k.get("value", date.today())
    def time_input(self, label, **k): return k.get("value", None)
    def file_uploader(self, label, **k): return None
    def camera_input(self, label, **k): return None
    def color_picker(self, label, **k): return k.get("value", "#000000")
    def download_button(self, label, data=None, **k): return False

    # ---- containers ----
    def expander(self, label, **k): return Ctx()
    def container(self, **k): return Ctx()
    def columns(self, spec, **k):
        n = spec if isinstance(spec, int) else len(spec)
        return [Ctx() for _ in range(n)]
    def tabs(self, names, **k):
        self._c("tabs", str(names))
        return [Ctx() for _ in names]
    def form(self, label, **k): return Ctx()
    def form_submit_button(self, label, **k): return False

    @property
    def sidebar(self): return Ctx()
    @property
    def spinner_prop(self):
        class S:
            def __enter__(s2): return s2
            def __exit__(s2, *a): pass
        return S

    # ---- media ----
    def image(self, *a, **k): self._c("img", str(a)[:80])
    def audio(self, *a, **k): self._c("audio", str(a)[:80])
    def video(self, *a, **k): self._c("video", str(a)[:80])

    # ---- chat ----
    def chat_message(self, role, **k): return Ctx()
    def chat_input(self, label, **k): return ""

    # ---- page ----
    def page_link(self, page, label=None, icon=None, **k): self._c("pagelink", label or "")
    def switch_page(self, page): pass

    # ---- data ----
    def metric(self, label, value, delta=None, **k): self._c("met", label)
    def dataframe(self, data=None, **k): pass
    def table(self, data=None, **k): pass

    # ---- rerun ----
    def rerun(self): raise StopIteration("rerun")
    def stop(self): raise StopIteration("stop")
    def experimental_rerun(self): raise StopIteration("rerun")

    # ---- cache (no-op) ----
    def cache_data(self, *a, **k):
        if len(a) == 1 and callable(a[0]):
            return a[0]
        def deco(fn):
            return fn
        return deco
    def cache_resource(self, *a, **k):
        if len(a) == 1 and callable(a[0]):
            return a[0]
        def deco(fn):
            return fn
        return deco


# ============ 替换真 streamlit 属性的所有 API ============
def install_mock_to_streamlit():
    """用 MockSt 实例替换 streamlit 模块的所有 API 属性"""
    import streamlit as real_st
    mock = MockSt()
    # 把 streamlit 模块的每个属性替换成 mock 的对应方法 (如果 mock 有)
    for name in dir(MockSt):
        if name.startswith("_"):
            continue
        try:
            mock_attr = getattr(mock, name)
            setattr(real_st, name, mock_attr)
        except (AttributeError, TypeError):
            pass
    # 同样处理 session_state
    real_st.session_state = mock.session_state
    return mock


# ============ Render ============
def clear_modules():
    for k in list(sys.modules.keys()):
        if k.startswith(("core.", "data.", "pages.")):
            del sys.modules[k]


def render_page(label, rel_path):
    full = PROTO / rel_path
    if not full.exists():
        return False, f"file not found: {rel_path}", 0

    m = install_mock_to_streamlit()
    clear_modules()

    spec = importlib.util.spec_from_file_location(
        rel_path.replace("/", "_").replace(".py", ""),
        str(full),
    )
    mod = importlib.util.module_from_spec(spec)
    try:
        spec.loader.exec_module(mod)
        return True, "OK", len(m.calls)
    except StopIteration:
        return True, "OK (rerun/stop)", len(m.calls)
    except Exception as e:
        import traceback
        tb = traceback.format_exc()
        last_line = ""
        for line in tb.splitlines():
            if "line " in line and ", in <module>" in line:
                last_line = line.strip()
        return False, f"{type(e).__name__}: {e}\n  at {last_line}", len(m.calls)


def main():
    sys.path.insert(0, str(WS))
    sys.path.insert(0, str(PROTO))
    sys.modules["sxtwl"] = None

    print("=" * 60)
    print("心颜 v0.7.1.6 严格审计 v5: 真 Streamlit 渲染")
    print("=" * 60)

    ok_count = 0
    fail_count = 0

    for label, rel in PAGES:
        ok, msg, calls = render_page(label, rel)
        status = "OK " if ok else "X   "
        if ok:
            ok_count += 1
            print(f"  {status} {label}: {calls} calls")
        else:
            fail_count += 1
            print(f"  {status} {label}:")
            for ln in msg.split("\n"):
                print(f"      {ln}")

    print("=" * 60)
    print(f"审计结论: {ok_count} OK / {fail_count} FAIL / {ok_count + fail_count} total")
    print("=" * 60)
    return 0 if fail_count == 0 else 1


if __name__ == "__main__":
    sys.exit(main())