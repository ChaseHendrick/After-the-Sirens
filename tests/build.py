"""Ensure offline assembly rejects module collisions and script injection."""
import importlib.util
from pathlib import Path
import shutil
import tempfile

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("sirens_build", ROOT / "build.py")
build = importlib.util.module_from_spec(spec)
spec.loader.exec_module(build)
sources = [(ROOT / "src" / name).read_text() for name in build.MODULES]
build.validate_exports(sources)
for extra in ("S.Engine = {};", "S.Stories = {};", "S.Effects = {};", "// </script>"):
    try:
        build.validate_exports(sources + [extra])
    except ValueError:
        pass
    else:
        raise AssertionError("Build accepted an unsafe namespace or script terminator")
with tempfile.TemporaryDirectory(prefix="sirens-repro-") as tmp:
    copy = Path(tmp)
    shutil.copytree(ROOT / "src", copy / "src")
    original = build.ROOT
    build.ROOT = copy
    try:
        build.build()
        assert (copy / "index.html").read_bytes() == (ROOT / "index.html").read_bytes(), "Generated index.html is stale"
    finally:
        build.ROOT = original
print("PASS offline build guards and reproducible committed artifact")
