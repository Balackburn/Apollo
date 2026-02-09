import useRandomIcon from '../hooks/useRandomIcon';
import useDownloadLink from '../hooks/useDownloadLink';

function ActionButtons({ downloadUrl, isMobile }) {
  return (
    <div className={`app__buttons ${isMobile ? 'app__buttons--mobile container' : 'app__buttons--desktop'}`}>
      <a
        className="app__button-ios"
        href="altstore://source/?url=https://balackburn.github.io/Apollo/apps.json"
        target="_blank"
        rel="noreferrer"
        title="Add to Altstore"
      >
        <img alt="Add to Altstore" src={isMobile ? `${import.meta.env.BASE_URL}images/UI/image_4.webp` : `${import.meta.env.BASE_URL}images/UI/image_1.webp`} />
      </a>
      <a
        className="app__button-web"
        href="https://github.com/Balackburn/Apollo"
        target="_blank"
        rel="noreferrer"
        title="See on Github"
      >
        <img alt="See on Github" src={isMobile ? `${import.meta.env.BASE_URL}images/UI/image_5.webp` : `${import.meta.env.BASE_URL}images/UI/image_2.webp`} />
      </a>
      <a
        className="app__button-download"
        href={downloadUrl}
        target="_blank"
        rel="noreferrer"
        title=".ipa download"
      >
        <img alt=".ipa download" src={`${import.meta.env.BASE_URL}images/UI/image_3.webp`} />
      </a>
    </div>
  );
}

export default function Header() {
  const iconSrc = useRandomIcon();
  const downloadUrl = useDownloadLink();

  return (
    <>
      <header className="app__header container">
        <div className="app__logo-wrapper">
          <img className="app__logo" alt="App logo" src={iconSrc} />
        </div>
        <div className="app__infos">
          <h1 className="app__name">Apollo for Reddit</h1>
          <p className="app__description"> The award-winning Reddit app !</p>
          <ActionButtons downloadUrl={downloadUrl} isMobile={false} />
        </div>
      </header>
      <ActionButtons downloadUrl={downloadUrl} isMobile={true} />
    </>
  );
}
