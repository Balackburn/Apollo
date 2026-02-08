import { useState, useEffect } from 'react';

const REPO_OWNER = 'Balackburn';
const REPO_NAME = 'Apollo';
const API_URL = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/releases/latest`;

function getVersionFromFileName(fileName) {
  const versionMatch = fileName.match(/Apollo_(\d+\.\d+\.\d+)_mod/);
  return versionMatch ? versionMatch[1] : null;
}

export default function useDownloadLink() {
  const [downloadUrl, setDownloadUrl] = useState('#');

  useEffect(() => {
    async function updateDownloadLink() {
      try {
        const response = await fetch(API_URL);
        const data = await response.json();

        const ipaAssets = data.assets.filter((asset) => {
          return asset.name.startsWith('Apollo') && asset.name.endsWith('.ipa');
        });

        if (ipaAssets.length > 0) {
          const highestVersionAsset = ipaAssets.reduce((highest, current) => {
            const highestVersion = getVersionFromFileName(highest.name);
            const currentVersion = getVersionFromFileName(current.name);
            return highestVersion && currentVersion && highestVersion > currentVersion
              ? highest
              : current;
          });
          setDownloadUrl(highestVersionAsset.browser_download_url);
        } else {
          console.error('No .ipa file found in the latest release.');
        }
      } catch (error) {
        console.error('Error fetching latest release information:', error);
      }
    }

    updateDownloadLink();
  }, []);

  return downloadUrl;
}
