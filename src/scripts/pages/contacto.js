import '../../styles/global.css';
import '../../styles/contact.css';
import '../../styles/depth-hero.css';
import '../../styles/depth-hero-accessibility.css';
import '../../styles/contact-depth.css';
import { initGlobalLayout } from '../global.js';
import { createDepthHero } from '../../components/DepthHero.js';
import portraitBackground from '../../img/contact/leadsbeachangel-bg.webp';
import portraitForeground from '../../img/contact/leadsbeachangel-fg.webp';

initGlobalLayout();
createDepthHero({
  target: document.querySelector('[data-contact-depth]'),
  background: portraitBackground,
  foreground: portraitForeground,
  text: 'FOTÓGRAFO',
});
