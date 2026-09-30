"""Ensure offline assembly rejects unconnected code and unsafe bundles."""
import importlib.util
from pathlib import Path
import shutil
import tempfile

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("sirens_build", ROOT / "build.py")
build = importlib.util.module_from_spec(spec)
spec.loader.exec_module(build)
sources = [(ROOT / "src" / name).read_text() for name in build.MODULES]
build.validate_wiring()
build.validate_exports(sources)

def rejects(operation, description):
    try:
        operation()
    except ValueError:
        return
    else:
        raise AssertionError("Build accepted " + description)

for extra in ("S.Engine = {};", "S.Stories = {};", "S.Effects = {};", "S.Progression = {};", "S.Settlement = {};", "S.Personal = {};", "S.Warfare = {};", "S.Journal = {};", "S.UnknownSystem = {};", "// </ScRiPt>"):
    changed = sources.copy()
    changed[0] += "\n" + extra
    rejects(lambda: build.validate_exports(changed), "an unsafe namespace or script terminator")
misplaced = sources.copy()
misplaced[0], misplaced[1] = misplaced[1], misplaced[0]
rejects(lambda: build.validate_exports(misplaced), "a system registered in the wrong module")
rejects(lambda: build.validate_exports(sources[:-1]), "an omitted source body")
rejects(lambda: build.validate_wiring(modules=build.MODULES + [build.MODULES[0]]), "a duplicate module entry")
rejects(lambda: build.validate_wiring(modules=build.MODULES + ["../main.js"]), "a module outside src")

with tempfile.TemporaryDirectory(prefix="sirens-repro-") as tmp:
    copy = Path(tmp)
    shutil.copytree(ROOT / "src", copy / "src")
    unused = copy / "src" / "unused.js"
    unused.write_text("// A forgotten module must block publication.\n")
    rejects(lambda: build.validate_wiring(root=copy), "an orphaned JavaScript file")
    unused.unlink()
    nested = copy / "src" / "layers"
    nested.mkdir()
    (nested / "unused.js").write_text("// Nested files must not evade the coverage check.\n")
    rejects(lambda: build.validate_wiring(root=copy), "an orphaned nested JavaScript file")
    shutil.rmtree(nested)
    missing = copy / "src" / "main.js"
    missing.unlink()
    rejects(lambda: build.validate_wiring(root=copy), "a missing assembled JavaScript file")
    shutil.copyfile(ROOT / "src" / "main.js", missing)
    original = build.ROOT
    build.ROOT = copy
    try:
        build.build()
        assert (copy / "index.html").read_bytes() == (ROOT / "index.html").read_bytes(), "Generated index.html is stale"
    finally:
        build.ROOT = original
print("PASS module coverage, ownership, offline build guards and reproducible committed artifact")
