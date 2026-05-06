export function Skeleton({ width = '100%', height = '16px', radius = '6px', count = 1 }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="skeleton" style={{ width, height, borderRadius: radius, marginBottom: count > 1 ? '8px' : 0 }} />
      ))}
    </>
  )
}

export function CardSkeleton() {
  return (
    <div className="skeleton-card">
      <Skeleton width="40%" height="14px" />
      <Skeleton width="80%" height="20px" />
      <Skeleton width="100%" height="12px" count={3} />
    </div>
  )
}

export function CodeSkeleton() {
  return (
    <div className="skeleton-code">
      <Skeleton width="70%" height="12px" />
      <Skeleton width="90%" height="12px" />
      <Skeleton width="50%" height="12px" />
      <Skeleton width="85%" height="12px" />
      <Skeleton width="60%" height="12px" />
    </div>
  )
}
