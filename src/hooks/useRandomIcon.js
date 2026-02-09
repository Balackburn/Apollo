import { useState, useEffect } from 'react';

const TOTAL_ICONS = 156;
const BASE = import.meta.env.BASE_URL;

function getRandomIcon() {
  const randomIndex = Math.floor(Math.random() * TOTAL_ICONS) + 1;
  return `${BASE}apollo_icons/icon_${randomIndex}.webp`;
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
