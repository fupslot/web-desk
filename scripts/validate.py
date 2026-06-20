#!/usr/bin/env python3
"""Validate the legacy Web Desk source tree.

Checks:
- tracked JavaScript files parse with `node --check`
- tracked JSON files parse with Python's json module
- AMD module imports do not differ from real files only by case
- known legacy bug patterns are absent
"""

import json
import os
import pathlib
import re
import subprocess
import sys
from typing import Iterable

ROOT = pathlib.Path(__file__).resolve().parents[1]
SCRIPTS_ROOT = ROOT / "extension" / "chrome" / "content" / "scripts"


def git_files(pattern: str) -> list[str]:
    result = subprocess.run(
        ["git", "ls-files", pattern],
        cwd=ROOT,
        text=True,
        capture_output=True,
        check=True,
    )
    return [line for line in result.stdout.splitlines() if line]


def run_node_check(files: Iterable[str]) -> list[str]:
    failures: list[str] = []
    for file_name in files:
        result = subprocess.run(
            ["node", "--check", file_name],
            cwd=ROOT,
            text=True,
            capture_output=True,
        )
        if result.returncode != 0:
            failures.append(f"{file_name}\n{result.stderr or result.stdout}")
    return failures


def check_json(files: Iterable[str]) -> list[str]:
    failures: list[str] = []
    for file_name in files:
        path = ROOT / file_name
        try:
            with path.open(encoding="utf-8") as handle:
                json.load(handle)
        except Exception as exc:  # noqa: BLE001 - print validation error for humans
            failures.append(f"{file_name}: {exc}")
    return failures


def module_name(path: pathlib.Path) -> str:
    return str(path.relative_to(SCRIPTS_ROOT).with_suffix("")).replace(os.sep, "/")


def check_amd_module_case() -> list[str]:
    modules = {
        module_name(path): path
        for path in SCRIPTS_ROOT.rglob("*.js")
        if path.is_file()
    }
    string_literal = re.compile(r"['\"]([^'\"]+)['\"]")
    failures: list[str] = []

    for path in SCRIPTS_ROOT.rglob("*.js"):
        text = path.read_text(encoding="utf-8", errors="ignore")
        source = str(path.relative_to(ROOT))
        for match in string_literal.finditer(text):
            required = match.group(1).removeprefix("text!")
            if not required.startswith(("app/", "components/", "data/")):
                continue
            if required in modules:
                continue
            case_matches = [name for name in modules if name.lower() == required.lower()]
            if case_matches:
                failures.append(
                    f"{source}: requires {required!r}, actual module is {case_matches[0]!r}"
                )

    return failures


def check_known_bug_patterns() -> list[str]:
    checks = {
        "extension/chrome/content/scripts/app/page.js": [
            ("indefined", "misspelled undefined check should be 'undefined'"),
        ],
        "extension/chrome/storage.js": [
            ("this.getItems({pageId: item.id})", "removeItem should not call undefined getItems"),
            ("!_.isArray(localStorage['sheets'])", "sheets validation must parse localStorage JSON before array check"),
        ],
    }
    failures: list[str] = []
    for file_name, patterns in checks.items():
        text = (ROOT / file_name).read_text(encoding="utf-8", errors="ignore")
        for pattern, message in patterns:
            if pattern in text:
                failures.append(f"{file_name}: {message}")

    return failures


def report(name: str, failures: list[str]) -> bool:
    if failures:
        print(f"{name}: FAIL", file=sys.stderr)
        for failure in failures:
            print(f"  {failure}", file=sys.stderr)
        return False
    print(f"{name}: OK")
    return True


def main() -> int:
    js_files = [file_name for file_name in git_files("*.js") if file_name != "build/r.js"]
    json_files = git_files("*.json")

    ok = True
    ok &= report("JS syntax", run_node_check(js_files))
    ok &= report("JSON parse", check_json(json_files))
    ok &= report("AMD module case check", check_amd_module_case())
    ok &= report("Known bug pattern check", check_known_bug_patterns())

    return 0 if ok else 1


if __name__ == "__main__":
    raise SystemExit(main())
