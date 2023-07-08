import json
import re
import requests

# Fetch the latest release information from GitHub
def fetch_latest_release(repo_url):
    api_url = f"https://api.github.com/repos/{repo_url}/releases"
    headers = {"Accept": "application/vnd.github+json"}
    response = requests.get(api_url, headers=headers)
    releases = response.json()
    sorted_releases = sorted(releases, key=lambda x: x["published_at"], reverse=True)

    if sorted_releases:
        return sorted_releases[0]
    else:
        raise ValueError("No releases found.")

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

def update_json_file(json_file, fetched_data):
    with open(json_file, "r") as file:
        data = json.load(file)

    app = data["apps"][0]
    
    keyword = "1.15.11"
    selected_asset = find_asset(fetched_data["assets"], keyword)
    
    version = re.search(r"(\d+\.\d+\.\d+)", selected_asset["name"]).group(1)
    app["version"] = version
    app["versionDate"] = fetched_data["published_at"]

    description = fetched_data["body"]

    description = remove_tags(description)
    description = re.sub(r'\*{2}', '', description)
    description = re.sub(r'-', '•', description)
    description = re.sub(r'`', '"', description)

    app["versionDescription"] = description
    app["downloadURL"] = selected_asset["browser_download_url"]
    app["size"] = selected_asset["size"]

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