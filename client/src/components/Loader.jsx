const Loader = ({ size = 24, className = '' }) => (
  <div
    className={`inline-block animate-spin rounded-full border-2 border-white/30 border-t-white ${className}`}
    style={{ width: size, height: size }}
  />
);

export const PageLoader = () => (
  <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-brand-50 via-white to-purple-50">
    <div className="flex flex-col items-center gap-4">
      <div className="h-14 w-14 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
      <p className="text-sm font-medium text-gray-500">Loading...</p>
    </div>
  </div>
);

export default Loader;
