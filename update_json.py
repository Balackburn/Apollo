#!/usr/bin/env python3
"""
AltStore source generator for Balackburn/Apollo.

This repository keeps publishing its own Apollo releases, but it no longer
*builds* them: as of Apollo-Reborn v3.0.0 the official Apollo-Reborn project
(https://github.com/Apollo-Reborn/Apollo-Reborn, formerly ImprovedCustomApi)
builds and validates the four variants in-house, and `.github/workflows/
mirror-release.yml` re-hosts those exact IPAs as a Balackburn release so this
long-standing source keeps working for existing users.

This script is a pure, deterministic transform with no network access:

    config.json + release-manifest.json  ->  apps*.json

  * release-manifest.json  — written by the mirror workflow from the actual
    mirrored IPAs (tag, version, buildVersion, per-variant download URL + size,
    release notes). This is the authoritative version/buildVersion truth, so it
    always matches the binaries (AltStore's VerifyAppOperation rejects installs
    when source `version` != CFBundleShortVersionString or `buildVersion` !=
    CFBundleVersion).
  * config.json — Balackburn source/app identity, the static `appPermissions`
    that AltStore validates against the IPA, and the migration news note.

Spec: https://faq.altstore.io/developers/make-a-source
"""
from __future__ import annotations

import json
import re
import sys
from datetime import datetime
from pathlib import Path
from typing import Any, Optional

CONFIG_PATH = "config.json"


def load_json(path: str) -> Any:
    p = Path(path)
    if not p.exists():
        raise FileNotFoundError(f"Required file not found: {path}")
    with p.open("r", encoding="utf-8") as f:
        return json.load(f)


def format_description(body: str) -> str:
    """GitHub release body -> AltStore-friendly plain text.

    Strips HTML/Markdown syntax. Does NOT blanket-replace hyphens (the old
    generator turned every "-" into "•", mangling words and URLs such as
    "Apollo-Reborn" -> "Apollo•Reborn").
    """
    if not body:
        return ""
    text = body.replace("\r\n", "\n").replace("\r", "\n")
    text = re.sub(r"<[^>]+>", "", text)                          # HTML tags
    text = re.sub(r"!\[[^\]]*\]\([^)]*\)", "", text)             # images
    text = re.sub(r"\[([^\]]+)\]\(([^)]+)\)", r"\1 (\2)", text)  # links -> "text (url)"
    text = re.sub(r"^\s{0,3}>\s?\[![A-Za-z]+\]\s*", "", text, flags=re.MULTILINE)  # > [!NOTE]
    text = re.sub(r"^\s{0,3}>\s?", "", text, flags=re.MULTILINE)  # blockquote markers
    text = re.sub(r"^\s{0,3}#{1,6}\s*", "", text, flags=re.MULTILINE)  # headers
    text = re.sub(r"^(\s*)[-*]\s+", r"\1• ", text, flags=re.MULTILINE)  # list bullets
    text = text.replace("**", "").replace("`", '"')
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def _labelled(base: str, label: Optional[str]) -> str:
    return f"{base} - {label}" if label else base


def migration_news_entry(cfg: dict[str, Any]) -> Optional[dict[str, Any]]:
    mn = cfg.get("migrationNews")
    if not mn:
        return None
    return {
        "appID": cfg["app"]["bundleIdentifier"],
        "title": mn["title"],
        "identifier": mn["identifier"],
        "caption": mn["caption"],
        "date": mn["date"],
        "tintColor": mn.get("tintColor", cfg["source"]["tintColor"]),
        "imageURL": mn["imageURL"],
        "notify": False,
        "url": mn["url"],
    }


def release_news_entry(cfg: dict[str, Any], manifest: dict[str, Any]) -> dict[str, Any]:
    news = cfg["news"]
    date = datetime.strptime(manifest["date"], "%Y-%m-%dT%H:%M:%SZ")
    return {
        "appID": cfg["app"]["bundleIdentifier"],
        "title": f"Apollo-Reborn {manifest['version']} - {date.strftime('%d %b %Y')}",
        "identifier": f"release-{manifest['tag']}",
        "caption": news["caption"],
        "date": manifest["date"],
        "tintColor": news.get("tintColor", cfg["source"]["tintColor"]),
        "imageURL": news["imageURL"],
        "notify": True,
        "url": manifest["releaseURL"],
    }


def build_app(cfg: dict[str, Any], manifest: dict[str, Any],
              variant_asset: dict[str, Any], label: Optional[str]) -> dict[str, Any]:
    app = cfg["app"]
    notes = format_description(manifest.get("notes", ""))
    version_entry = {
        "version": manifest["version"],
        "buildVersion": manifest["buildVersion"],
        "marketingVersion": manifest["version"],
        "date": manifest["date"],
        "localizedDescription": notes,
        "downloadURL": variant_asset["downloadURL"],
        "size": variant_asset["size"],
    }
    return {
        "name": _labelled(app["name"], label),
        "bundleIdentifier": app["bundleIdentifier"],
        "developerName": app["developerName"],
        "subtitle": app["subtitle"],
        "localizedDescription": app["localizedDescription"],
        "iconURL": app["iconURL"],
        "tintColor": app["tintColor"],
        "category": app.get("category", "social"),
        "screenshots": app.get("screenshots", []),
        "appPermissions": app["appPermissions"],
        "version": version_entry["version"],
        "buildVersion": version_entry["buildVersion"],
        "marketingVersion": version_entry["marketingVersion"],
        "versionDate": version_entry["date"],
        "versionDescription": version_entry["localizedDescription"],
        "downloadURL": version_entry["downloadURL"],
        "size": version_entry["size"],
        "versions": [version_entry],
    }


def build_source(cfg: dict[str, Any], manifest: dict[str, Any],
                 variant: dict[str, Any]) -> Optional[dict[str, Any]]:
    asset = manifest.get("variants", {}).get(variant["key"])
    if not asset:
        print(f"  ! manifest has no variant '{variant['key']}' for {variant['output']}; skipping")
        return None

    src = cfg["source"]
    label = variant.get("label")
    news = [n for n in (migration_news_entry(cfg), release_news_entry(cfg, manifest)) if n]
    return {
        "name": _labelled(src["name"], label),
        "subtitle": src["subtitle"],
        "description": src["description"],
        "iconURL": src["iconURL"],
        "headerURL": src["headerURL"],
        "website": src["website"],
        "tintColor": src["tintColor"],
        "featuredApps": [],
        "apps": [build_app(cfg, manifest, asset, label)],
        "news": news,
    }


def write_source(path: str, data: dict[str, Any]) -> None:
    with Path(path).open("w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        f.write("\n")
    app = data["apps"][0]
    print(f"  ✓ {path}: {app['version']} (build {app['buildVersion']}), "
          f"{len(data['news'])} news item(s)")


def main() -> int:
    try:
        print("=" * 60)
        print("Balackburn/Apollo source generator (config + manifest)")
        print("=" * 60)

        cfg = load_json(CONFIG_PATH)
        manifest = load_json(cfg.get("manifest", "release-manifest.json"))
        print(f"\nManifest: {manifest['tag']} -> version {manifest['version']} "
              f"(build {manifest['buildVersion']})\n")

        wrote_any = False
        for variant in cfg["variants"]:
            source = build_source(cfg, manifest, variant)
            if source is not None:
                write_source(variant["output"], source)
                wrote_any = True

        if not wrote_any:
            print("\nError: no sources generated (empty manifest?)")
            return 1

        print("\n" + "=" * 60)
        print("✓ Done")
        print("=" * 60)
        return 0

    except Exception as exc:  # noqa: BLE001 - top-level guard for CI logging
        print(f"\n✗ Error: {exc}")
        import traceback
        traceback.print_exc()
        return 1


if __name__ == "__main__":
    sys.exit(main())
