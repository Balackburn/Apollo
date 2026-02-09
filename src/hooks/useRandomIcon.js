import { useState, useEffect } from 'react';

const TOTAL_ICONS = 156;

function getRandomIcon() {
  const randomIndex = Math.floor(Math.random() * TOTAL_ICONS);
  return `${import.meta.env.BASE_URL}apollo_icons/icon_${randomIndex}.webp`;
}

export default function useRandomIcon() {
  const [iconSrc, setIconSrc] = useState(getRandomIcon);

  useEffect(() => {
    const interval = setInterval(() => {
      setIconSrc(getRandomIcon());
    }, 400);
    return () => clearInterval(interval);
  }, []);

  return iconSrc;
}
