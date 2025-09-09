import Link from "next/link";

export default function Home() {
  const currentYear = new Date().getFullYear();
  
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <main className="flex-grow flex flex-col items-center justify-center text-center px-6">
        <h1 className="text-4xl font-bold mb-4 text-gray-800">
          Welcome to Resume Assistant Pro
        </h1>
        <p className="text-lg text-gray-600 mb-8 max-w-2xl">
          Upload your resume, chat with it, and send professional emails — all
          in one place.
        </p>

        <div className="flex space-x-4">
          <Link
            href="/upload"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
          >
            Upload Resume
          </Link>
          <Link
            href="/chat"
            className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg shadow hover:bg-gray-300"
          >
            Chat with Resume
          </Link>
          <Link
            href="/email"
            className="px-6 py-3 bg-green-600 text-white rounded-lg shadow hover:bg-green-700"
          >
            Send Email
          </Link>
        </div>
      </main>

      <footer className="bg-gray-900 text-white text-center py-4">
        <p className="text-sm">
          © {currentYear} Resume Assistant Pro
        </p>
      </footer>
    </div>
  );
}