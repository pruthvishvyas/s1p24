import { useState, useEffect } from 'react';

const read = () => {
  const s = getComputedStyle(document.documentElement);
  const g = (n) => s.getPropertyValue(n).trim() || 'currentColor';
  return { accent: g('--color-accent'), text: g('--color-text-secondary'), grid: g('--color-border'), surface: g('--color-surface'),
    border: g('--color-border'), danger: g('--color-danger'), warning: g('--color-warning'), success: g('--color-success'),
    series: [1, 2, 3, 4, 5].map((i) => g('--chart-' + i)) };
};

// Reads real colour values from the CSS tokens and refreshes when the theme changes.
export function useThemeColors() {
  const [c, setC] = useState(read);
  useEffect(() => {
    const mo = new MutationObserver(() => setC(read()));
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => mo.disconnect();
  }, []);
  return c;
}
