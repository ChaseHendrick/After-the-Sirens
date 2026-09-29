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
MODULES = ["catalog.js", "vehicles.js", "actors.js", "destruction.js", "stories.js", "world.js", "engine.js", "renderer.js", "ui.js", "main.js"]

def validate_exports(sources):
    combined = "\n".join(sources)
    for name in ("Catalog", "Vehicles", "Actors", "Destruction", "Stories", "World", "Engine", "Renderer", "UI", "App"):
        registrations = re.findall(r"\b(?:S|Sirens|NS|ns|window\.Sirens)\." + name + r"\s*=", combined)
        if len(registrations) != 1:
            raise ValueError(f"Expected one {name} registration; found {len(registrations)}")
    if "</script" in combined.lower():
        raise ValueError("Script contains an HTML closing script sequence")

def build(extra_output=None):
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
    assert template.count("/*__CSS__*/") == 1
    assert template.count("/*__JS__*/") == 1
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
