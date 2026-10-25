export function SkeletonCard({ height = 120, count = 1 }) {
  return (
    <div className="skeleton-row">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton-card" style={{ height }}>
          <div className="skeleton-shimmer" />
        </div>
      ))}
    </div>
  );
}
