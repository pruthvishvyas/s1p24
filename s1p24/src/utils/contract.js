export const dataPath = (rel) => (rel ? '/data/' + String(rel).replace(/^\/+/, '') : null);
export const findPath = (list, id) => (Array.isArray(list) ? list.find((p) => String(p).includes(id)) || null : null);
