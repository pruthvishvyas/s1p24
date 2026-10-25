export function makeTerm(terms) {
  const t = terms || {};
  return (key, plural = false) => {
    const base = t[key] || key.charAt(0).toUpperCase() + key.slice(1);
    return plural ? base + 's' : base;
  };
}
