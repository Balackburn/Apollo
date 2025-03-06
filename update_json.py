import json
import re
import requests
from datetime import datetime


# Fetch all release information from GitHub
def fetch_all_releases(repo_url):
    api_url = f"https://api.github.com/repos/{repo_url}/releases"
    headers = {"Accept": "application/vnd.github+json"}
    response = requests.get(api_url, headers=headers)
    releases = response.json()
    sorted_releases = sorted(releases, key=lambda x: x["published_at"], reverse=False)

    return sorted_releases


# Fetch the latest release information from GitHub
def fetch_latest_release(repo_url):
    api_url = f"https://api.github.com/repos/{repo_url}/releases"
    headers = {"Accept": "application/vnd.github+json"}
    response = requests.get(api_url, headers=headers)
    releases = response.json()
    sorted_releases = sorted(releases, key=lambda x: x["published_at"], reverse=True)

    if sorted_releases:
        return sorted_releases[0]

    raise ValueError("No release found.")


def format_desciption(input):
    description = input
    description = re.sub("<[^<]+?>", "", description)  # Remove HTML tags
    description = re.sub(r"#{1,6}\s?", "", description)  # Remove markdown header tags
    description = description.replace(r"\*{2}", "").replace("-", "•").replace("`", '"')
    return description

def get_download_info(release, prefix):
    target_prefix = "NO-EXTENSIONS" if prefix == "NO-EXTENSIONS" else "Apollo"
    
    download_url = next(
        (asset["browser_download_url"] for asset in release["assets"] if asset["name"].startswith(target_prefix)),
        None,
    )
    
    size = next(
        (asset["size"] for asset in release["assets"] if asset["browser_download_url"] == download_url),
        None,
    )
    
    return download_url, size

def update_json_file(json_file, fetched_data_all, fetched_data_latest, prefix):
    with open(json_file, "r") as file:
        data = json.load(file)

    app = data["apps"][0]

    if "versions" not in app:
        app["versions"] = []

    fetched_versions = []

    for release in fetched_data_all:
        full_version = release["tag_name"].lstrip("v")
        # Keep the whole string but extract version for comparison
        version_for_comparison = re.search(r"(\d+\.\d+\.\d+)(?:_(\d+\.\d+\.\d+))?", full_version)
        version = version_for_comparison.group(2) if version_for_comparison.group(2) else version_for_comparison.group(1)
        version_date = release["published_at"]
        fetched_versions.append(version)

        description = release["body"]
        keyword = "Apollo for Reddit (with ImprovedCustomApi) Release Information"
        if keyword in description:
            description = description.split(keyword, 1)[1].strip()

        description = format_desciption(description)

        download_url, size = get_download_info(release, prefix)

        version_entry = {
            "version": version,
            "date": version_date,
            "localizedDescription": description,
            "downloadURL": download_url,
            "size": size,
        }

        app["versions"] = [v for v in app["versions"] if v["version"] != version]

        if download_url:
            app["versions"].insert(0, version_entry)

    latest_version = fetched_data_latest["tag_name"].lstrip("v")
    tag = fetched_data_latest["tag_name"]
    version_match = re.search(r"(\d+\.\d+\.\d+)(?:_(\d+\.\d+\.\d+))?", latest_version)

    if version_match:
        if "_" in full_version and len(version_match.groups()) >= 2:
            # Use the components from the part after the underscore
            _, _, patch = map(int, version_match.group(2).split("."))
    else:
        raise ValueError("Invalid version format")
    
    app["version"] = version
    app["versionDate"] = fetched_data_latest["published_at"]

    description = format_desciption(fetched_data_latest["body"])

    app["versionDescription"] = description
    app["downloadURL"] = next(
        (
            asset["browser_download_url"]
            for asset in fetched_data_latest["assets"]
            if asset["name"].endswith(".ipa")
        ),
        None,
    )
    app["size"] = next(
        (
            asset["size"]
            for asset in fetched_data_latest["assets"]
            if asset["browser_download_url"] == app["downloadURL"]
        ),
        None,
    )

    if "news" not in data:
        data["news"] = []

    news_identifier = f"release-{latest_version}"
    if not any(item["identifier"] == news_identifier for item in data["news"]):
        formatted_date = datetime.strptime(
            fetched_data_latest["published_at"], "%Y-%m-%dT%H:%M:%SZ"
        ).strftime("%d %b")

        # Determine caption and image_url based on patch number
        if patch == 0:
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

    with open(json_file, "w") as file:
        json.dump(data, file, indent=2)


# Main function
def main():
    repo_url = "Balackburn/Apollo"
    json = "apps.json"
    json_noext = "apps_noext.json"

    fetched_data_all = fetch_all_releases(repo_url)
    fetched_data_latest = fetch_latest_release(repo_url)
    update_json_file(json, fetched_data_all, fetched_data_latest, None)
    update_json_file(json_noext, fetched_data_all, fetched_data_latest, "NO-EXTENSIONS")


if __name__ == "__main__":
    main()
