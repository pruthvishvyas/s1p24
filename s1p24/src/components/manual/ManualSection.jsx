export function highlight(text, q) {
  if (!q) return text;
  const safe = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = String(text).split(new RegExp('(' + safe + ')', 'ig'));
  return parts.map((p, i) => (p.toLowerCase() === q.toLowerCase() ? <mark key={i}>{p}</mark> : p));
}

export function ManualSection({ title, paragraphs, q }) {
  return (
    <section className="card" style={{ marginBottom: 16 }}>
      <h2 style={{ marginTop: 0 }}>{highlight(title, q)}</h2>
      {paragraphs.map((p, i) => <p key={i}>{highlight(p, q)}</p>)}
    </section>
  );
}
