export default function AdminLoading() {
  return (
    <main className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-4xl rounded-xl border bg-white p-5">
        <div className="flex items-center gap-3">
          <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-gray-700 border-t-transparent" />
          <span className="text-sm text-gray-700">Loading admin panel...</span>
        </div>
      </div>
    </main>
  );
}
