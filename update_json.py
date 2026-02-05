"""
AltStore Source JSON Generator

Automatically generates and updates AltStore source JSON files from GitHub releases.
Supports 4 IPA variants: standard, NO-EXTENSIONS, GLASS, and NO-EXTENSIONS_GLASS.

Specification: https://faq.altstore.io/developers/make-a-source
"""

import json
import re
import sys
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Tuple

import requests


# ============================================================================
# Configuration
# ============================================================================


def load_config(config_path: str = "config.json") -> Dict:
    """Load repository configuration from JSON file."""
    config_file = Path(config_path)
    if not config_file.exists():
        raise FileNotFoundError(f"Configuration file not found: {config_path}")

    with config_file.open("r", encoding="utf-8") as f:
        config_data = json.load(f)

    # Validate required keys
    required_keys = [
        "repo_url", "json_file", "json_noext_file", "json_glass_file", "json_noext_glass_file",
        "app_id", "app_name", "caption", "tint_colour", "image_url"
    ]
    missing_keys = [key for key in required_keys if key not in config_data]
    if missing_keys:
        raise KeyError(f"Missing required config keys: {', '.join(missing_keys)}")

    return config_data


# ============================================================================
# GitHub API Functions
# ============================================================================


def fetch_github_releases(repo_url: str) -> List[Dict]:
    """Fetch all GitHub releases for a repository, sorted oldest first."""
    api_url = f"https://api.github.com/repos/{repo_url}/releases"
    headers = {
        "Accept": "application/vnd.github+json",
        "User-Agent": "AltStore-Source-Generator"
    }

    print(f"Fetching releases from {repo_url}...")
    response = requests.get(api_url, headers=headers, timeout=30)
    response.raise_for_status()

    releases = response.json()
    if not releases:
        print("Warning: No releases found")
        return []

    # Sort by publication date (oldest first)
    sorted_releases = sorted(releases, key=lambda x: x.get("published_at", ""))
    print(f"Found {len(sorted_releases)} releases")
    return sorted_releases


# ============================================================================
# Version Processing Functions
# ============================================================================


def extract_version_info(tag_name: str) -> Tuple[str, str]:
    """
    Extract version and buildVersion from GitHub release tag.
    
    Handles formats:
    - 'v1.15.11_1.3.2' → version='1.15.11', buildVersion='1.3.2'
    - 'v1.15.11' → version='1.15.11', buildVersion='1'
    
    Returns:
        Tuple of (version, buildVersion)
    """
    # Remove 'v' prefix
    tag = tag_name.lstrip("v")

    # Try format: VERSION_BUILDVERSION
    match = re.match(r"(\d+\.\d+\.\d+)(?:_(\d+\.\d+\.\d+))?", tag)
    if match:
        version = match.group(1)
        build_version = match.group(2) if match.group(2) else "1"
        return version, build_version

    # Fallback: extract any version number
    version_match = re.search(r"(\d+\.\d+\.\d+)", tag)
    if version_match:
        return version_match.group(1), "1"

    # Last resort
    print(f"Warning: Could not parse version from tag '{tag_name}', using as-is")
    return tag, "1"


def format_description(description: str, app_name: str = "") -> str:
    """Clean release description for AltStore display."""
    if not description:
        return ""

    # Remove app-specific header
    if app_name:
        keyword = f"{app_name} Release Information"
        if keyword in description:
            description = description.split(keyword, 1)[1]

    # Clean formatting
    formatted = re.sub(r"<[^<]+?>", "", description)  # HTML tags
    formatted = re.sub(r"#{1,6}\s?", "", formatted)  # Markdown headers
    formatted = formatted.replace("**", "").replace("-", "•").replace("`", '"')

    return formatted.strip()


def find_ipa_asset(release: Dict, prefix: Optional[str] = None) -> Tuple[Optional[str], Optional[int]]:
    """
    Find IPA file in release assets.
    
    Args:
        release: GitHub release object
        prefix: IPA variant to find:
                - None: Standard (Apollo*.ipa, not GLASS or NO-EXTENSIONS)
                - "NO-EXTENSIONS": NO-EXTENSIONS*.ipa (not NO-EXTENSIONS_GLASS)
                - "GLASS": GLASS_*.ipa (not NO-EXTENSIONS_GLASS)
                - "NO-EXTENSIONS_GLASS": NO-EXTENSIONS_GLASS*.ipa
        
    Returns:
        Tuple of (download_url, size) or (None, None)
    """
    for asset in release.get("assets", []):
        name = asset.get("name", "")
        
        if not name.endswith(".ipa"):
            continue
        
        # Check for specific variant (order matters - check most specific first)
        if prefix == "NO-EXTENSIONS_GLASS":
            if name.startswith("NO-EXTENSIONS_GLASS"):
                return asset.get("browser_download_url"), asset.get("size")
        elif prefix == "NO-EXTENSIONS":
            if name.startswith("NO-EXTENSIONS") and not name.startswith("NO-EXTENSIONS_GLASS"):
                return asset.get("browser_download_url"), asset.get("size")
        elif prefix == "GLASS":
            if name.startswith("GLASS") and not name.startswith("NO-EXTENSIONS"):
                return asset.get("browser_download_url"), asset.get("size")
        else:  # Standard (None)
            if name.startswith("Apollo") and not name.startswith("NO-EXTENSIONS") and not name.startswith("GLASS"):
                return asset.get("browser_download_url"), asset.get("size")

    return None, None


# ============================================================================
# JSON Update Functions
# ============================================================================


def create_version_entry(release: Dict, config: Dict, prefix: Optional[str] = None) -> Optional[Dict]:
    """Create version entry from GitHub release."""
    version, build_version = extract_version_info(release["tag_name"])
    download_url, size = find_ipa_asset(release, prefix)
    
    if not download_url:
        return None

    return {
        "version": version,
        "buildVersion": build_version,
        "date": release["published_at"],
        "localizedDescription": format_description(release.get("body", ""), config["app_name"]),
        "downloadURL": download_url,
        "size": size or 0
    }


def create_news_entry(release: Dict, config: Dict) -> Dict:
    """Create news entry for release."""
    # Use full tag name (without 'v' prefix) for title and identifier
    tag_name = release["tag_name"].lstrip("v")
    
    release_date = datetime.strptime(release["published_at"], "%Y-%m-%dT%H:%M:%SZ")
    formatted_date = release_date.strftime("%d %b")

    return {
        "appID": config["app_id"],
        "title": f"{tag_name} - {formatted_date}",
        "identifier": f"release-{tag_name}",
        "caption": config["caption"],
        "date": release["published_at"],
        "tintColor": config["tint_colour"],
        "imageURL": config["image_url"],
        "notify": True,
        "url": f"https://github.com/{config['repo_url']}/releases/tag/{release['tag_name']}"
    }


def update_source_json(json_path: str, releases: List[Dict], config: Dict, prefix: Optional[str] = None) -> None:
    """
    Update AltStore source JSON file with release information.
    
    Per AltStore spec: "The order of versions matters. AltStore uses the order 
    to determine which version is the 'latest' release."
    
    For news: "The ordering does not matter because AltStore will display them 
    in reverse chronological order according to their date."
    """
    json_file = Path(json_path)

    # Load existing JSON
    if json_file.exists():
        with json_file.open("r", encoding="utf-8") as f:
            data = json.load(f)
    else:
        print(f"Warning: {json_path} not found, creating new file")
        data = {"apps": [{}], "news": []}

    # Ensure structure
    if "apps" not in data or not data["apps"]:
        data["apps"] = [{}]
    if "news" not in data:
        data["news"] = []

    app = data["apps"][0]

    # Build versions list (newest first per AltStore spec)
    versions = []
    seen = set()  # Track (version, buildVersion) to avoid duplicates
    
    # Process releases in reverse (newest first)
    for release in reversed(releases):
        entry = create_version_entry(release, config, prefix)
        if entry:
            key = (entry["version"], entry["buildVersion"])
            if key not in seen:
                versions.append(entry)
                seen.add(key)

    app["versions"] = versions

    # Rebuild entire news array from releases
    # This ensures no duplicates and consistent formatting
    news_entries = []
    for release in releases:
        # Only add news for releases that have valid IPA assets
        if find_ipa_asset(release, prefix)[0]:
            news_entries.append(create_news_entry(release, config))
    
    # Sort news by date (newest first) for readability
    data["news"] = sorted(news_entries, key=lambda x: x["date"], reverse=True)

    # Update app metadata with latest release
    if releases:
        latest = releases[-1]  # Last in sorted list is newest
        version, build_version = extract_version_info(latest["tag_name"])

        app["version"] = version
        app["buildVersion"] = build_version
        app["versionDate"] = latest["published_at"]
        app["versionDescription"] = format_description(latest.get("body", ""), config["app_name"])

        download_url, size = find_ipa_asset(latest, prefix)
        app["downloadURL"] = download_url
        app["size"] = size

    # Write updated JSON
    with json_file.open("w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print(f"✓ Updated {json_path} with {len(versions)} version(s) and {len(data['news'])} news item(s)")


# ============================================================================
# Main Execution
# ============================================================================


def main() -> int:
    """Main entry point."""
    try:
        print("=" * 60)
        print("AltStore Source JSON Generator")
        print("=" * 60)

        # Load configuration
        config = load_config()
        print(f"\nRepository: {config['repo_url']}")
        print(f"App: {config['app_name']}")

        # Fetch releases
        releases = fetch_github_releases(config["repo_url"])
        if not releases:
            print("\nError: No releases found")
            return 1

        # Update all source files
        print(f"\nUpdating standard source ({config['json_file']})...")
        update_source_json(config["json_file"], releases, config, prefix=None)

        print(f"Updating no-extensions source ({config['json_noext_file']})...")
        update_source_json(config["json_noext_file"], releases, config, prefix="NO-EXTENSIONS")

        print(f"Updating GLASS source ({config['json_glass_file']})...")
        update_source_json(config["json_glass_file"], releases, config, prefix="GLASS")

        print(f"Updating no-extensions GLASS source ({config['json_noext_glass_file']})...")
        update_source_json(config["json_noext_glass_file"], releases, config, prefix="NO-EXTENSIONS_GLASS")

        print("\n" + "=" * 60)
        print("✓ Successfully updated all 4 source files")
        print("=" * 60)

        return 0

    except KeyboardInterrupt:
        print("\n\nOperation cancelled by user")
        return 1
    except Exception as e:
        print(f"\n✗ Error: {e}")
        import traceback
        traceback.print_exc()
        return 1


if __name__ == "__main__":
    sys.exit(main())