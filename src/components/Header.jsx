import { useTheme } from '../hooks/useTheme';
import useRandomIcon from '../hooks/useRandomIcon';
import useDownloadLink from '../hooks/useDownloadLink';

const BASE_URL = 'https://raw.githubusercontent.com/Balackburn/Apollo/refs/heads/main';
const REDIRECT = 'https://intradeus.github.io/http-protocol-redirector?r=';
const BASE = import.meta.env.BASE_URL;

const SOURCES = [
  {
    title: 'Standard',
    description: 'Apollo + ImprovedCustomApi',
    json: 'apps.json',
  },
  {
    title: 'No Extensions',
    description: 'Fewer App IDs (1 vs 7) — ideal for free developer accounts',
    json: 'apps_noext.json',
  },
  {
    title: 'GLASS',
    description: 'Liquid Glass UI Patch (iOS 26+)',
    json: 'apps_glass.json',
  },
  {
    title: 'No Extensions + GLASS',
    description: 'Both options combined (iOS 26+)',
    json: 'apps_noext_glass.json',
  },
];

function SourceButtons({ jsonFile, isDark }) {
  const folder = isDark ? 'DARK' : 'LIGHT';
  const jsonUrl = `${BASE_URL}/${jsonFile}`;

  const buttons = [
    {
      href: `${REDIRECT}altstore://source?url=${jsonUrl}`,
      alt: 'Add to AltStore',
      img: `${BASE}images/buttons/${folder}/Altstore.png`,
    },
    {
      href: `${REDIRECT}feather://source/${jsonUrl}`,
      alt: 'Add to Feather',
      img: `${BASE}images/buttons/${folder}/Feather.png`,
    },
    {
      href: `${REDIRECT}sidestore://source?url=${jsonUrl}`,
      alt: 'Add to SideStore',
      img: `${BASE}images/buttons/${folder}/Sidestore.png`,
    },
    {
      href: jsonUrl,
      alt: 'Direct URL',
      img: `${BASE}images/buttons/${folder}/DirectURL.png`,
    },
  ];

  return (
    <div className="source-buttons">
      {buttons.map((btn) => (
        <a key={btn.alt} href={btn.href} target="_blank" rel="noreferrer" title={btn.alt}>
          <img alt={btn.alt} src={btn.img} />
        </a>
      ))}
    </div>
  );
}

function BottomLinks({ downloadUrl, isDark }) {
  const folder = isDark ? 'DARK' : 'LIGHT';

  return (
    <div className="bottom-links">
      <a href={downloadUrl} target="_blank" rel="noreferrer" title=".ipa Download">
        <img alt=".ipa Download" src={`${BASE}images/buttons/${folder}/Download.png`} />
      </a>
      <a href="https://github.com/Balackburn/Apollo" target="_blank" rel="noreferrer" title="GitHub">
        <img alt="GitHub" src={`${BASE}images/buttons/${folder}/Github.png`} />
      </a>
    </div>
  );
}

export default function Header() {
  const iconSrc = useRandomIcon();
  const downloadUrl = useDownloadLink();
  const { isDark } = useTheme();

  return (
    <>
      <header className="app__header container">
        <div className="app__logo-wrapper">
          <img className="app__logo" alt="App logo" src={iconSrc} />
        </div>
        <div className="app__infos">
          <h1 className="app__name">Apollo for Reddit</h1>
          <p className="app__description">The award-winning Reddit app !</p>
        </div>
      </header>

      <section className="app__sources container">
        {SOURCES.map((source) => (
          <div key={source.title} className="source-section">
            <h2 className="source-title">{source.title}</h2>
            <p className="source-desc">{source.description}</p>
            <SourceButtons jsonFile={source.json} isDark={isDark} />
          </div>
        ))}
        <BottomLinks downloadUrl={downloadUrl} isDark={isDark} />
      </section>
    </>
  );
}
