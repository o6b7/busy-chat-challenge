import Fuse from 'fuse.js';

export function createFuse(paragraphs = []) {
  const options = {
    keys: ['text'],
    includeScore: true,
    threshold: 0.6,
    ignoreLocation: true,
    minMatchCharLength: 3,
    findAllMatches: true,
    useExtendedSearch: true,
    distance: 100
  };
  return new Fuse(paragraphs, options);
}

export function searchParagraphs(fuse, query, limit = 10) {
  if (!fuse || !query) return [];
  
  const cleanedQuery = query.toLowerCase().trim();
  const res = fuse.search(cleanedQuery, { limit });
  return res.map(r => ({ text: r.item.text, order: r.item.order, score: r.score }));
}