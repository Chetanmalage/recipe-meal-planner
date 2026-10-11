const SkeletonCard = () => (
  <div className="glass-card h-100">
    <div className="skeleton" style={{ height: '220px', borderTopLeftRadius: '16px', borderTopRightRadius: '16px' }} />
    <div className="p-4">
      <div className="skeleton mb-2" style={{ height: '20px', width: '40%' }} />
      <div className="skeleton mb-3" style={{ height: '24px', width: '80%' }} />
      <div className="skeleton mb-2" style={{ height: '14px', width: '100%' }} />
      <div className="skeleton" style={{ height: '14px', width: '60%' }} />
    </div>
  </div>
);

export const LoadingGrid = ({ count = 6 }) => (
  <div className="row g-4">
    {Array.from({ length: count }).map((_, i) => (
      <div className="col-12 col-sm-6 col-lg-4" key={i}>
        <SkeletonCard />
      </div>
    ))}
  </div>
);

export const LoadingPage = () => (
  <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
    <div className="spinner-border text-warning" role="status" style={{ width: '3rem', height: '3rem' }}>
      <span className="visually-hidden">Loading...</span>
    </div>
  </div>
);