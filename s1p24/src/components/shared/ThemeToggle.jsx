import { useState } from 'react';

export function ThemeToggle() {
  const [theme, setTheme] = useState(() => document.documentElement.getAttribute('data-theme') || 'light');
  const toggle = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) { /* ignore */ }
    setTheme(next);
  };
  return (
    <button className="theme-toggle" onClick={toggle} aria-label="Toggle light and dark theme">
      {theme === 'light' ? '\uD83C\uDF19 Dark' : '\u2600\uFE0F Light'}
    </button>
  );
}
