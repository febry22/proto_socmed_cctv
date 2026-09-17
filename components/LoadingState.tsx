export default function LoadingState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 text-neutral-500">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-neutral-300 border-t-indigo-600" />
      <p className="text-sm">Menyusun hasil pencarian menjadi diagram...</p>
    </div>
  );
}
