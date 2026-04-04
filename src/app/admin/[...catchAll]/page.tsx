import Link from 'next/link';

export default function AdminNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
      <div className="text-center max-w-md bg-white border border-gray-200 p-10 rounded-2xl shadow-sm">
        <h1 className="text-6xl font-extrabold text-gray-900 mb-4 bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-500">404</h1>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Page Not Found</h2>
        <p className="text-sm text-gray-500 mb-8 leading-relaxed">The administrative module or interface you are looking for does not exist, has been moved, or you lack access permissions.</p>
        <Link href="/admin" className="inline-flex items-center justify-center w-full px-5 py-3 bg-blue-600 text-white font-semibold text-sm rounded-xl hover:bg-blue-700 transition duration-200 shadow-sm border border-transparent active:scale-[0.98]">
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
