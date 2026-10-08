// Resolve assets relative to this module, including GitHub Pages project paths.
export const asset = path => new URL(path.replace(/^\//,''), import.meta.url).href;
