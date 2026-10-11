export const renderFooter = () => {
  const mount = document.querySelector('[data-site-footer]');
  if (mount) mount.innerHTML = `<footer class="site-footer"><p>Sisal Studio · Yucatán, México</p><p>© ${new Date().getFullYear()} Todos los derechos reservados.</p></footer>`;
};
