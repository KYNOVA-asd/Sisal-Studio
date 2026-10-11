import { renderNav } from './Nav.js';

export const renderHeader = () => {
  const mount = document.querySelector('[data-site-header]');
  if (mount) mount.innerHTML = `<header class="site-header"><a class="site-header__logo" href="/">SISAL STUDIO</a>${renderNav()}</header>`;
};
