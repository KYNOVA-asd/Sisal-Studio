const links = [
  ['/', 'Inicio'], ['/bodas/', 'Bodas'], ['/eventos/', 'XV Años & Eventos'],
  ['/locaciones/', 'Locaciones'], ['/cotizar/', 'Cotizar'],
  ['/blog/', 'Blog'],
  ['/contacto/', 'Contacto'],
];

const normalize = (path) => path === '/' ? '/' : `/${path.split('/').filter(Boolean)[0]}/`;

export const renderNav = () => {
  const current = normalize(window.location.pathname);
  return `<button class="site-header__menu" type="button" aria-expanded="false" aria-controls="site-nav">Menú</button>
    <nav class="site-nav" id="site-nav" aria-label="Navegación principal">
      ${links.map(([href, label]) => `<a class="site-nav__link${current === href ? ' is-active' : ''}" href="${href}"${current === href ? ' aria-current="page"' : ''}>${label}</a>`).join('')}
    </nav>`;
};
