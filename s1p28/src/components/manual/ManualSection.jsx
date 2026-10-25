import { escapeRegExp } from '../../utils/formatters';

function Highlight({ text, q }) {
  if (!q) return text;
  const parts = String(text).split(new RegExp('(' + escapeRegExp(q) + ')', 'ig'));
  return parts.map((p, i) => (p.toLowerCase() === q.toLowerCase() ? <mark key={i}>{p}</mark> : <span key={i}>{p}</span>));
}

export function ManualSection({ id, title, paragraphs, q, match }) {
  return (
    <section id={'manual-' + id} className={'card manual-section' + (match && q ? ' match' : '')}>
      <h3><Highlight text={title} q={q} /></h3>
      {paragraphs.map((p, i) => (
        <p key={i}>{typeof p === 'string' ? <Highlight text={p} q={q} /> : <><b>{p.h}</b> <Highlight text={p.t} q={q} /></>}</p>
      ))}
    </section>
  );
}
