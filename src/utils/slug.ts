
export const toSlug = (name: string): string =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

// "ADDICTED SHIRT" → "addicted-shirt"
// "Flash Sales 10%" → "flash-sales-10"