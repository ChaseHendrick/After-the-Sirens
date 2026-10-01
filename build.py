#!/usr/bin/env python3
"""Build the offline standalone HTML after blocking namespace/syntax checks."""
import argparse
import os
from pathlib import Path
import re
import shutil
import subprocess
import tempfile

ROOT = Path(__file__).resolve().parent
MODULES = ["catalog.js", "effects.js", "progression.js", "settlement.js", "personal.js", "warfare.js", "vehicles.js", "actors.js", "neural.js", "autoplay.js", "destruction.js", "stories.js", "world.js", "engine.js", "commands.js", "multiplayer.js", "lobbies.js", "renderer.js", "journal.js", "ui.js", "network-ui.js", "social.js", "touch.js", "main.js"]
EXPORTS = {
    "catalog.js": "Catalog", "effects.js": "Effects", "progression.js": "Progression", "settlement.js": "Settlement", "personal.js": "Personal", "warfare.js": "Warfare",
    "vehicles.js": "Vehicles", "actors.js": "Actors", "autoplay.js": "Autoplay", "neural.js": "Neural", "destruction.js": "Destruction",
    "stories.js": "Stories", "world.js": "World", "engine.js": "Engine", "commands.js": "Commands", "social.js": "Social",
    "multiplayer.js": "Multiplayer", "lobbies.js": "Lobbies", "renderer.js": "Renderer", "journal.js": "Journal", "ui.js": "UI", "network-ui.js": "NetworkUI", "touch.js": "Touch", "main.js": "App",
}
REGISTRATION = re.compile(r"\b(?:S|Sirens|NS|ns|window\.Sirens)\.([A-Z]\w*)\s*=")

def validate_wiring(root=None, modules=None):
    """Require every JavaScript source to run once, with explicit ownership."""
    root = ROOT if root is None else Path(root)
    modules = MODULES if modules is None else modules
    if not all(isinstance(name, str) and re.fullmatch(r"[A-Za-z][A-Za-z0-9_-]*\.js", name) for name in modules):
        raise ValueError("Module names must be JavaScript basenames inside src")
    if len(set(modules)) != len(modules):
        raise ValueError("A JavaScript module is assembled more than once")
    discovered = {path.relative_to(root / "src").as_posix() for path in (root / "src").rglob("*.js") if path.is_file()}
    missing = set(modules) - discovered
    orphaned = discovered - set(modules)
    if missing or orphaned:
        raise ValueError(f"Module wiring mismatch: missing={sorted(missing)}, unassembled={sorted(orphaned)}")
    if set(modules) != set(EXPORTS) or len(set(EXPORTS.values())) != len(EXPORTS):
        raise ValueError("Every assembled module needs one distinct namespace owner")

def validate_exports(sources):
    if len(sources) != len(MODULES):
        raise ValueError("Expected one source body per assembled module")
    combined = "\n".join(sources)
    for filename, source in zip(MODULES, sources):
        registrations = REGISTRATION.findall(source)
        expected = [EXPORTS[filename]]
        if registrations != expected:
            raise ValueError(f"Expected {filename} to register only {expected[0]}; found {registrations}")
    if "</script" in combined.lower():
        raise ValueError("Script contains an HTML closing script sequence")

def build(extra_output=None):
    validate_wiring()
    sources = [(ROOT / "src" / name).read_text() for name in MODULES]
    validate_exports(sources)
    js = "\n".join(sources)
    node = os.environ.get("NODE_BIN") or shutil.which("node")
    if not node:
        raise RuntimeError("Node.js is required for the blocking JavaScript syntax check")
    with tempfile.TemporaryDirectory(prefix="sirens-build-") as temp:
        check = Path(temp) / "game.js"
        check.write_text(js)
        subprocess.run([node, "--check", str(check)], check=True)
    css = "\n".join((ROOT / "src" / name).read_text() for name in ("style.css", "ui.css"))
    template = (ROOT / "src" / "index-template.html").read_text()
    if template.count("/*__CSS__*/") != 1 or template.count("/*__JS__*/") != 1:
        raise ValueError("Template needs exactly one CSS slot and one JavaScript slot")
    document = template.replace("/*__CSS__*/", css).replace("/*__JS__*/", js)
    output = ROOT / "index.html"
    output.write_text(document)
    if extra_output:
        Path(extra_output).write_text(document)
    print(f"Built {output.name}: {len(document.encode()):,} bytes. Syntax and module guards passed.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", help="Also copy the game to this path")
    args = parser.parse_args()
    build(args.output)
