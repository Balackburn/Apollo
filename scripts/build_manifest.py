#!/usr/bin/env python3
"""
Build release-manifest.json from a directory of mirrored Apollo-Reborn IPAs.

Used by .github/workflows/mirror-release.yml after downloading Apollo-Reborn's
official release assets. Reads the real CFBundleShortVersionString /
CFBundleVersion out of each IPA's Info.plist so the generated source files can
never advertise a version that doesn't match the binary (AltStore rejects the
install on a mismatch).
"""
from __future__ import annotations

import argparse
import json
import os
import plistlib
import re
import zipfile

# Apollo-Reborn asset naming: Apollo-Reborn-<version>[-<suffix>].ipa
ASSET_RE = re.compile(
    r"^Apollo-Reborn-(?P<version>\d+\.\d+\.\d+)"
    r"(?:-(?P<suffix>GLASSICONS-NOEXTENSIONS|GLASS-NOEXTENSIONS|GLASSICONS|NOEXTENSIONS|GLASS))?"
    r"\.ipa$"
)
SUFFIX_TO_KEY = {
    None: "standard",
    "NOEXTENSIONS": "noExtensions",
    "GLASS": "glass",
    "GLASS-NOEXTENSIONS": "noExtensionsGlass",
    # GLASSICONS variants are defined upstream but not distributed here yet.
}

APP_PLIST_RE = re.compile(r"^Payload/[^/]+\.app/Info\.plist$")


def read_info_plist(ipa_path: str) -> dict:
    with zipfile.ZipFile(ipa_path) as z:
        candidates = [n for n in z.namelist() if APP_PLIST_RE.match(n)]
        if not candidates:
            raise RuntimeError(f"No main-app Info.plist found in {ipa_path}")
        with z.open(candidates[0]) as f:
            return plistlib.load(f)


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--tag", required=True)
    ap.add_argument("--repo", required=True, help="this repo, e.g. Balackburn/Apollo")
    ap.add_argument("--upstream", required=True, help="mirror source, e.g. Apollo-Reborn/Apollo-Reborn")
    ap.add_argument("--dir", required=True, help="directory containing the downloaded IPAs")
    ap.add_argument("--date", required=True, help="release published_at (ISO 8601)")
    ap.add_argument("--notes", default="", help="path to release notes file")
    ap.add_argument("--out", default="release-manifest.json")
    args = ap.parse_args()

    base = f"https://github.com/{args.repo}/releases/download/{args.tag}"
    variants: dict[str, dict] = {}
    version: str | None = None
    build_version: str | None = None

    for name in sorted(os.listdir(args.dir)):
        match = ASSET_RE.match(name)
        if not match:
            continue
        key = SUFFIX_TO_KEY.get(match.group("suffix"))
        if not key:
            print(f"  - skipping undistributed variant: {name}")
            continue

        path = os.path.join(args.dir, name)
        info = read_info_plist(path)
        v = info.get("CFBundleShortVersionString")
        b = str(info.get("CFBundleVersion"))
        if version is None:
            version, build_version = v, b
        elif (v, b) != (version, build_version):
            raise RuntimeError(
                f"version/build mismatch: {name} is {v}/{b}, expected {version}/{build_version}"
            )

        variants[key] = {
            "assetName": name,
            "downloadURL": f"{base}/{name}",
            "size": os.path.getsize(path),
        }
        print(f"  + {key}: {name} ({v}/{b}, {variants[key]['size']} bytes)")

    if not variants:
        raise RuntimeError(f"No Apollo-Reborn IPAs found in {args.dir}")

    notes = ""
    if args.notes and os.path.exists(args.notes):
        with open(args.notes, encoding="utf-8") as f:
            notes = f.read()

    manifest = {
        "tag": args.tag,
        "version": version,
        "buildVersion": build_version,
        "date": args.date,
        "mirroredFrom": f"https://github.com/{args.upstream}/releases/tag/{args.tag}",
        "releaseURL": f"https://github.com/{args.repo}/releases/tag/{args.tag}",
        "notes": notes,
        "variants": variants,
    }
    with open(args.out, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)
        f.write("\n")
    print(f"Wrote {args.out}: {version} (build {build_version}), variants={sorted(variants)}")


if __name__ == "__main__":
    main()
