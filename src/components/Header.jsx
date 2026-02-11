import { useState, useEffect, useRef } from 'react'
import { getRandomIconUrl, getImageUrl, API_URL, getVersionFromFileName } from '../utils'

export default function Header() {
  const [iconSrc, setIconSrc] = useState(() => getRandomIconUrl())
  const [downloadUrl, setDownloadUrl] = useState('#')
  const intervalRef = useRef(null)

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setIconSrc(getRandomIconUrl())
    }, 400)
    return () => clearInterval(intervalRef.current)
  }, [])

  useEffect(() => {
    async function fetchDownloadLink() {
      try {
        const response = await fetch(API_URL)
        const data = await response.json()
        const ipaAssets = data.assets.filter(
          (asset) => asset.name.startsWith('Apollo') && asset.name.endsWith('.ipa')
        )
        if (ipaAssets.length > 0) {
          const highestVersionAsset = ipaAssets.reduce((highest, current) => {
            const highestVersion = getVersionFromFileName(highest.name)
            const currentVersion = getVersionFromFileName(current.name)
            return highestVersion && currentVersion && highestVersion > currentVersion
              ? highest
              : current
          })
          setDownloadUrl(highestVersionAsset.browser_download_url)
        }
      } catch (error) {
        console.error('Error fetching latest release information:', error)
      }
    }
    fetchDownloadLink()
  }, [])

  return (
    <>
      <header className="app__header container">
        <div className="app__logo-wrapper">
          <img className="app__logo" alt="App logo" src={iconSrc} />
        </div>
        <div className="app__infos">
          <h1 className="app__name">Apollo for Reddit</h1>
          <p className="app__description"> The award-winning Reddit app !</p>
          <div className="app__buttons app__buttons--desktop">
            <a
              className="app__button-ios"
              href="altstore://source/?url=https://balackburn.github.io/Apollo/apps.json"
              target="_blank"
              rel="noreferrer"
              title="Add to Altstore"
            >
              <img alt="Add to Altstore" src={getImageUrl('images/UI/image_1.webp')} />
            </a>
            <a
              className="app__button-web"
              href="https://github.com/Balackburn/Apollo"
              target="_blank"
              rel="noreferrer"
              title="See on Github"
            >
              <img alt="See on Github" src={getImageUrl('images/UI/image_2.webp')} />
            </a>
            <a
              className="app__button-download"
              href={downloadUrl}
              target="_blank"
              rel="noreferrer"
              title=".ipa download"
            >
              <img alt=".ipa download" src={getImageUrl('images/UI/image_3.webp')} />
            </a>
          </div>
        </div>
      </header>
      <div className="app__buttons app__buttons--mobile container">
        <a
          className="app__button-ios"
          href="altstore://source/?url=https://balackburn.github.io/Apollo/apps.json"
          target="_blank"
          rel="noreferrer"
          title="Add to Altstore"
        >
          <img alt="Add to Altstore" src={getImageUrl('images/UI/image_4.webp')} />
        </a>
        <a
          className="app__button-web"
          href="https://github.com/Balackburn/Apollo"
          target="_blank"
          rel="noreferrer"
          title="See on Github"
        >
          <img alt="See on Github" src={getImageUrl('images/UI/image_5.webp')} />
        </a>
        <a
          className="app__button-download"
          href={downloadUrl}
          target="_blank"
          rel="noreferrer"
          title=".ipa download"
        >
          <img alt=".ipa download" src={getImageUrl('images/UI/image_3.webp')} />
        </a>
      </div>
    </>
  )
}
