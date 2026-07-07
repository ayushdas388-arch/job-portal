import { Link } from 'react-router-dom'

function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Hero Section */}
      <div className="hero-gradient text-white py-24 px-6 text-center relative overflow-hidden">
        <h1 className="text-5xl md:text-6xl font-extrabold mb-4 drop-shadow-lg">Find Your Dream Job</h1>
        <p className="text-xl md:text-2xl mb-8 text-white/90">AI powered job matching — upload resume ya skills select karo</p>
        <div className="flex justify-center gap-4">
          <Link to="/jobs" className="neon-outline px-6 py-3 rounded-lg font-semibold hover:opacity-95 transition">
            Browse Jobs
          </Link>
          <Link to="/ai-match" className="neon-btn px-6 py-3 rounded-lg font-semibold">
            AI Match
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 px-6 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
        <div className="bg-white p-6 rounded-xl shadow">
          <div className="text-4xl mb-4">🤖</div>
          <h3 className="text-xl font-bold mb-2">AI Matching</h3>
          <p className="text-gray-600">Upload your resume or skills and let our AI find the best jobs for you</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow">
          <div className="text-4xl mb-4">💼</div>
          <h3 className="text-xl font-bold mb-2">1000+ Jobs</h3>
          <p className="text-gray-600">Top companies ke latest jobs</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow">
          <div className="text-4xl mb-4">⚡</div>
          <h3 className="text-xl font-bold mb-2">Quick Apply</h3>
          <p className="text-gray-600">Ek click mein apply karo</p>
        </div>
      </div>

    </div>
  )
}

export default Home