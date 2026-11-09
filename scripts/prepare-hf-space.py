#!/usr/bin/env python3
"""Create a token-free, two-file Hugging Face Docker Space upload bundle."""
import argparse
from pathlib import Path
import re
import subprocess
import zipfile

ROOT = Path(__file__).resolve().parents[1]
MARKER = "__SIRENS_SOURCE_COMMIT__"


def prepare(commit, output):
    if not re.fullmatch(r"[0-9a-f]{40}", commit):
        raise ValueError("Source commit must be a full 40-character lowercase Git SHA.")
    # Reject a mistyped/nonexistent local commit before preparing an unbuildable
    # remote URL. Publishing that commit to the public repository is a separate step.
    subprocess.run(["git", "cat-file", "-e", commit + "^{commit}"], cwd=ROOT, check=True)
    for path in ("index.html", "server/index.cjs", "package-lock.json"):
        subprocess.run(["git", "cat-file", "-e", commit + ":" + path], cwd=ROOT, check=True)
    output = Path(output).resolve()
    if output == ROOT or output in ROOT.parents or ROOT in output.parents:
        raise ValueError("Use an output folder outside the game repository.")
    if output.exists() and any(output.iterdir()):
        raise ValueError("Output folder must be empty; existing files are never deleted.")
    output.mkdir(parents=True, exist_ok=True)
    for name in ("README.md", "Dockerfile"):
        template = ROOT / "deploy" / "huggingface" / name
        if template.is_symlink():
            raise ValueError("Deployment templates must be regular files.")
        text = template.read_text(encoding="utf-8")
        if MARKER not in text:
            raise ValueError("Deployment template is missing its source-commit marker.")
        (output / name).write_text(text.replace(MARKER, commit), encoding="utf-8")
    archive = output.parent / (output.name + ".zip")
    if archive.exists():
        raise ValueError("Refusing to replace an existing upload archive.")
    with zipfile.ZipFile(archive, "w", compression=zipfile.ZIP_DEFLATED) as bundle:
        for name in ("README.md", "Dockerfile"):
            bundle.write(output / name, arcname=name)
    print("Prepared two upload files in " + str(output))
    print("ZIP: " + str(archive))
    print("Source: https://github.com/ChaseHendrick/After-the-Sirens/commit/" + commit)
    print("Push this commit to the public source repository before the Space builds.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--commit", required=True, help="Public game source commit, full 40-character SHA")
    parser.add_argument("--output", required=True, help="New or empty folder outside this repository")
    args = parser.parse_args()
    try:
        prepare(args.commit, args.output)
    except (ValueError, OSError, subprocess.CalledProcessError) as error:
        parser.exit(1, str(error) + "\n")
