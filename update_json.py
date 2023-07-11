import json
import re
import requests

# Fetch the latest release information from GitHub
def fetch_latest_release(repo_url):
    api_url = f"https://api.github.com/repos/{repo_url}/releases"
    headers = {"Accept": "application/vnd.github+json"}
    response = requests.get(api_url, headers=headers)
    releases = response.json()
    return releases

def find_asset(assets, keyword):
    for asset in assets:
        if keyword in asset["name"]:
            return asset
    raise ValueError(f"No asset found containing the keyword '{keyword}'.")

# Update the JSON file with the fetched data
def remove_tags(text):
    text = re.sub('<[^<]+?>', '', text)  # Remove HTML tags
    text = re.sub(r'#{1,6}\s?', '', text)  # Remove markdown header tags
    return text

def version_exists(data, download_url):
    for existing_version in data["versions"]:
        if existing_version["downloadURL"] == download_url:
            return True
    return False

def update_json_file(json_file, fetched_data):
    with open(json_file, "r") as file:
        data = json.load(file)

    for release in fetched_data:
        keyword = "1.15.11" # Adjust the keyword as needed
        try:
            selected_asset = find_asset(release["assets"], keyword)
        except ValueError:
            continue

        download_url = selected_asset["browser_download_url"]

        if version_exists(data, download_url):
            continue

        version = re.search(r"(\d+\.\d+\.\d+)", selected_asset["name"]).group(1)
        version_data = {
            "version": version,
            "versionDate": release["published_at"],
            "localizedDescription": remove_tags(release["body"]),
            "downloadURL": download_url,
            "size": selected_asset["size"]
        }

        data["versions"].append(version_data)

    with open(json_file, "w") as file:
        json.dump(data, file, indent=2)

# Main function
def main():
    repo_url = "ichitaso/ApolloPatcher"
    json_file = "apps.json"

    fetched_data = fetch_latest_release(repo_url)
    update_json_file(json_file, fetched_data)

if __name__ == "__main__":
    main()