import json
import re
import requests
from datetime import datetime
from typing import Dict, List, Tuple, Any, Optional


GITHUB_REPO = "Balackburn/Apollo"
JSON_FILE = "apps.json"
JSON_NOEXT = "apps_noext.json"


def fetch_all_releases() -> List[Dict[str, Any]]:
    """
    Fetch all release information from GitHub.

    Returns:
        List of release objects sorted by publication date (oldest first)

    Raises:
        requests.RequestException: If the API request fails
    """
    api_url = f"https://api.github.com/repos/{GITHUB_REPO}/releases"
    headers = {"Accept": "application/vnd.github+json"}

    response = requests.get(api_url, headers=headers)
    response.raise_for_status()  # Raise exception for non 200 OK responses

    releases = response.json()
    sorted_releases = sorted(releases, key=lambda x: x["published_at"], reverse=False)

    return sorted_releases


def fetch_latest_release() -> Dict[str, Any]:
    """
    Fetch the latest release information from GitHub.

    Returns:
        Latest release object

    Raises:
        requests.RequestException: If the API request fails
        ValueError: If no releases are found
    """
    api_url = f"https://api.github.com/repos/{GITHUB_REPO}/releases"
    headers = {"Accept": "application/vnd.github+json"}

    response = requests.get(api_url, headers=headers)
    response.raise_for_status()

    releases = response.json()
    sorted_releases = sorted(releases, key=lambda x: x["published_at"], reverse=True)

    if not sorted_releases:
        raise ValueError("No release found.")

    return sorted_releases[0]


def format_description(input_text: str) -> str:
    """
    Format release description by removing HTML tags and markdown formatting.

    Args:
        input_text: Raw release description

    Returns:
        Formatted description text
    """
    description = input_text
    description = re.sub(r"<[^<]+?>", "", description)  # HTML tags
    description = re.sub(r"#{1,6}\s?", "", description)  # Markdown header tags
    description = description.replace(r"\*{2}", "").replace("-", "•").replace("`", '"')
    return description


def get_download_info(
    release: Dict[str, Any], prefix: Optional[str]
) -> Tuple[Optional[str], Optional[int]]:
    """
    Get download URL and size for a specific release asset.

    Args:
        release: GitHub release object
        prefix: Asset name prefix to search for (None or "NO-EXTENSIONS")

    Returns:
        Tuple of (download_url, size) - both can be None if asset not found
    """
    target_prefix = "NO-EXTENSIONS" if prefix == "NO-EXTENSIONS" else "Apollo"

    download_url = None
    size = None

    for asset in release.get("assets", []):
        if asset.get("name", "").startswith(target_prefix) and asset.get(
            "browser_download_url"
        ):
            download_url = asset["browser_download_url"]
            size = asset.get("size")
            break

    return download_url, size


def parse_version(version_string: str) -> Tuple[str, str]:
    """
    Parse version string to extract main version and secondary version if present.
    Support for both underscore and hyphen separators.
    
    Args:
        version_string: Version string with optional underscore or hyphen component
        
    Returns:
        Tuple of (app_version, tweak_version)
    """
    # Support both underscore and hyphen as separators
    # This captures prior releases which used a different formatting approach
    version_match = re.search(r"(\d+\.\d+(?:\.\d+)?)(?:[_-](\d+\.\d+\.\d+[a-z]?))?", version_string)
    
    if not version_match:
        raise ValueError(f"Invalid version format: {version_string}")
        
    app_version = version_match.group(1)
    tweak_version = version_match.group(2)

    # Catches edge cases where only major and minor version are present in the tag
    if tweak_version and tweak_version.count('.') == 1:  # If only major and minor exist
        tweak_version += ".0"
    
    return app_version, tweak_version


def get_patch_number(version_string: str) -> int:
    """
    Extract patch number from version string.

    Args:
        version_string: Version string (i.e. "1.2.3_1.2.3")

    Returns:
        Patch number (third component of version)
    """
    _, tweak_version = parse_version(version_string)

    # Extract patch number (third component)
    _, _, patch = map(int, tweak_version.split("."))

    return patch


def update_json_file(
    json_file: str,
    fetched_data_all: List[Dict[str, Any]],
    fetched_data_latest: Dict[str, Any],
    prefix: Optional[str],
) -> None:
    """
    Update app source JSON file with fetched release information.

    Args:
        json_file: Path to the app source JSON file to update
        fetched_data_all: List of all releases
        fetched_data_latest: Latest release data
        prefix: Asset name prefix to search for (None or "NO-EXTENSIONS")
    """
    try:
        with open(json_file, "r") as file:
            data = json.load(file)
    except (json.JSONDecodeError, FileNotFoundError) as e:
        raise ValueError(f"Error reading JSON file {json_file}: {str(e)}")

    if (
        not data.get("apps")
        or not isinstance(data["apps"], list)
        or len(data["apps"]) == 0
    ):
        raise ValueError("Invalid JSON structure: missing or empty 'apps' array")

    app = data["apps"][0]

    if "versions" not in app:
        app["versions"] = []

    fetched_versions = []

    # Process all releases
    for release in fetched_data_all:
        full_version = release["tag_name"].lstrip("v")
        
        # Parse the version for comparison
        app_version, tweak_version = parse_version(full_version)
        version = tweak_version
        version_date = release["published_at"]
        fetched_versions.append(version)

        # Extract and format description
        description = release.get("body", "")
        keyword = "Apollo for Reddit (with ImprovedCustomApi) Release Information"
        if keyword in description:
            description = description.split(keyword, 1)[1].strip()

        description = format_description(description)

        # Get download information
        download_url, size = get_download_info(release, prefix)

        # Create version entry
        version_entry = {
            "version": version,
            "date": version_date,
            "localizedDescription": description,
            "downloadURL": download_url,
            "size": size,
        }

        # Remove any existing entry with the same version
        app["versions"] = [v for v in app["versions"] if v.get("version") != version]

        # Add new entry if download URL is available
        if download_url:
            app["versions"].insert(0, version_entry)

    # Process latest release
    latest_version = fetched_data_latest["tag_name"].lstrip("v")
    tag = fetched_data_latest["tag_name"]

    try:
        app_version, tweak_version = parse_version(latest_version)
        version = tweak_version if tweak_version else app_version
        patch_number = get_patch_number(latest_version)
    except ValueError as e:
        raise ValueError(f"Error parsing latest version: {str(e)}")

    # Update app metadata
    app["version"] = version
    app["versionDate"] = fetched_data_latest["published_at"]
    app["versionDescription"] = format_description(fetched_data_latest.get("body", ""))

    # Find IPA download URL and size
    app["downloadURL"] = next(
        (
            asset["browser_download_url"]
            for asset in fetched_data_latest.get("assets", [])
            if asset.get("name", "").endswith(".ipa")
            and asset.get("browser_download_url")
        ),
        None,
    )

    app["size"] = next(
        (
            asset["size"]
            for asset in fetched_data_latest.get("assets", [])
            if asset.get("browser_download_url") == app["downloadURL"]
        ),
        None,
    )

    # Add news entry if not already present
    if "news" not in data:
        data["news"] = []

    news_identifier = f"release-{latest_version}"
    if not any(item.get("identifier") == news_identifier for item in data["news"]):
        formatted_date = datetime.strptime(
            fetched_data_latest["published_at"], "%Y-%m-%dT%H:%M:%SZ"
        ).strftime("%d %b")

        # Determine caption and image_url based on patch number
        if patch_number == 0:
            caption = "Major update of Apollo (with ImprovedCustomApi) is here!"
            image_url = "https://raw.githubusercontent.com/Balackburn/Apollo/main/images/news/news_1.webp"
        else:
            caption = "Update of Apollo (with ImprovedCustomApi) now available!"
            image_url = "https://raw.githubusercontent.com/Balackburn/Apollo/main/images/news/news_2.webp"

        news_entry = {
            "appID": "com.christianselig.Apollo",
            "title": f"{latest_version} - {formatted_date}",
            "identifier": news_identifier,
            "caption": caption,
            "date": fetched_data_latest["published_at"],
            "tintColor": "3F91FE",
            "imageURL": image_url,
            "notify": True,
            "url": f"https://github.com/Balackburn/Apollo/releases/tag/{tag}",
        }
        data["news"].append(news_entry)

    try:
        with open(json_file, "w") as file:
            json.dump(data, file, indent=2)
    except IOError as e:
        raise ValueError(f"Error writing to JSON file {json_file}: {str(e)}")


def main() -> None:
    """
    Entrypoint for the GitHub workflow action.

    The script runs two passes to populate both the sources (standard and no-extensions).
    """
    try:
        fetched_data_all = fetch_all_releases()
        fetched_data_latest = fetch_latest_release()

        update_json_file(
            JSON_FILE, fetched_data_all, fetched_data_latest, None
        )
        update_json_file(
            JSON_NOEXT, fetched_data_all, fetched_data_latest, "NO-EXTENSIONS"
        )

        print(f"Successfully updated {JSON_FILE} and {JSON_NOEXT}")
    except Exception as e:
        print(f"Error: {str(e)}")
        raise


if __name__ == "__main__":
    main()
