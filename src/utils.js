const BASE_URL = import.meta.env.BASE_URL;

const TOTAL_ICONS = 156;

export function getRandomIconUrl() {
  const randomIndex = Math.floor(Math.random() * TOTAL_ICONS);
  return `${BASE_URL}apollo_icons/icon_${randomIndex}.webp`;
}

export function getImageUrl(path) {
  return `${BASE_URL}${path}`;
}

export const REPO_OWNER = "Balackburn";
export const REPO_NAME = "Apollo";
export const API_URL = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/releases/latest`;

export function getVersionFromFileName(fileName) {
  const versionMatch = fileName.match(/Apollo_(\d+\.\d+\.\d+)_mod/);
  return versionMatch ? versionMatch[1] : null;
}
