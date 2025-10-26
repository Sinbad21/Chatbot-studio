import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center text-white">
          <h1 className="text-6xl font-bold mb-6">Chatbot Studio</h1>
          <p className="text-2xl mb-8">Build AI-Powered Chatbots in Minutes</p>
          <p className="text-xl mb-12 max-w-2xl mx-auto">
            The complete SaaS platform for creating, deploying, and managing intelligent chatbots
            with RAG capabilities, analytics, and enterprise features.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/auth/register"
              className="bg-white text-indigo-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition"
            >
              Get Started Free
            </Link>
            <Link
              href="/auth/login"
              className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white/10 transition"
            >
              Sign In
            </Link>
          </div>
        </div>

        <div className="mt-20 grid md:grid-cols-3 gap-8 text-white">
          <div className="bg-white/10 backdrop-blur-sm p-8 rounded-xl">
            <h3 className="text-2xl font-bold mb-4">🤖 Easy Bot Creation</h3>
            <p>Build chatbots with our intuitive 5-step wizard. No coding required.</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm p-8 rounded-xl">
            <h3 className="text-2xl font-bold mb-4">📚 RAG Integration</h3>
            <p>Upload documents (PDF, DOCX, TXT) to create knowledge-based chatbots.</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm p-8 rounded-xl">
            <h3 className="text-2xl font-bold mb-4">📊 Analytics Dashboard</h3>
            <p>Track conversations, leads, and performance metrics in real-time.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
