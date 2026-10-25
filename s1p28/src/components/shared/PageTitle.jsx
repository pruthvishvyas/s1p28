export function PageTitle({ title, sub }) {
  return (
    <div>
      <h2 className="page-title">{title}</h2>
      {sub && <p className="page-sub">{sub}</p>}
    </div>
  );
}
