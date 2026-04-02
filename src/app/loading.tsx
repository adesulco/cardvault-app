export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
      <p className="text-sm font-bold text-slate-400 animate-pulse tracking-wide">Syncing Vault...</p>
    </div>
  );
}
