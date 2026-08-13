import { useEffect } from 'react';

const HREF =
  'https://fonts.googleapis.com/css2' +
  '?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,800' +
  '&family=Instrument+Sans:wght@400;500;600' +
  '&family=JetBrains+Mono:wght@400;500' +
  '&display=swap';

const ID = 'grape-landing-fonts';

export default function useLandingFonts() {
  useEffect(() => {
    if (document.getElementById(ID)) return;

    const link = document.createElement('link');
    link.id = ID;
    link.rel = 'stylesheet';
    link.href = HREF;
    document.head.appendChild(link);
  }, []);
}
