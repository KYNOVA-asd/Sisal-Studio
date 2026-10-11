const imageModules = import.meta.glob([
  '/src/img/**/*.{avif,gif,jfif,jpeg,jpg,png,webp}',
  '/src/img/**/*.{AVIF,GIF,JFIF,JPEG,JPG,PNG,WEBP}',
  '/src/img/*.{avif,gif,jfif,jpeg,jpg,png,webp}',
  '/src/img/*.{AVIF,GIF,JFIF,JPEG,JPG,PNG,WEBP}',
], {
  eager: true,
  query: '?url',
  import: 'default',
});

const discoveredImages = Object.entries(imageModules)
  .map(([path, url]) => ({ path: path.toLowerCase(), url }))
  .sort((a, b) => a.path.localeCompare(b.path));

const demoImages = [
  ['unsplash-venue-hacienda', 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&fm=webp&w=1200&q=80'],
  ['unsplash-venue-hotel', 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&fm=webp&w=1200&q=80'],
  ['unsplash-venue-cenote', 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&fm=webp&w=1200&q=80'],
  ['unsplash-boda-pareja', 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&fm=webp&w=1200&q=80'],
  ['unsplash-boda-ceremonia', 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&fm=webp&w=1200&q=80'],
  ['unsplash-evento-recepcion', 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&fm=webp&w=1200&q=80'],
].map(([path, url]) => ({ path, url }));

// Los archivos de src/img siempre tienen prioridad. Unsplash solo mantiene
// visible la demo cuando Vite no descubre ningún asset local.
export const localImages = discoveredImages.length ? discoveredImages : demoImages;

export const findLocalImage = (keywords = [], fallbackIndex = 0) => {
  const terms = keywords.map((keyword) => keyword.toLowerCase());
  const match = localImages.find(({ path }) => terms.some((term) => path.includes(term)));
  return match?.url || localImages[fallbackIndex % Math.max(localImages.length, 1)]?.url || null;
};

export const getGalleryImages = (limit = 12) => localImages.slice(0, limit).map(({ url }) => url);

export const getImagesByKeywords = (keywords, limit = 12) => {
  const terms = keywords.map((keyword) => keyword.toLowerCase());
  const matches = localImages.filter(({ path }) => terms.some((term) => path.includes(term)));
  const selection = matches.length ? matches : localImages;
  return selection.slice(0, limit).map(({ url }) => url);
};
