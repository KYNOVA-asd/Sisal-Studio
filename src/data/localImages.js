const imageModules = import.meta.glob('/src/img/**/*.{avif,gif,jpeg,jpg,png,webp}', {
  eager: true,
  query: '?url',
  import: 'default',
});

export const localImages = Object.entries(imageModules)
  .map(([path, url]) => ({ path: path.toLowerCase(), url }))
  .sort((a, b) => a.path.localeCompare(b.path));

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
