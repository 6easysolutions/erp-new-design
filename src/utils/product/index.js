/**
 * Normalizes product response data from barcode search API into an array of products.
 * Handles both single product object and array of products.
 *
 * @param {*} data - response data or payload
 * @returns {Array} Array of products
 */
export function normalizeProductResponse(data) {
  if (!data) return [];
  return Array.isArray(data) ? data : [data];
}
