export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          AdVisor
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          AI-powered ad creative analysis platform
        </p>
        <div className="inline-block px-6 py-3 bg-white rounded-lg shadow-lg">
          <p className="text-sm text-gray-500">
            Built with Next.js + TypeScript + Tailwind CSS
          </p>
        </div>
      </div>
    </main>
  );
}
