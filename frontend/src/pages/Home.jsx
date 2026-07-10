import { Link } from 'react-router-dom'
import BrandIcon from '../components/BrandIcon'

function Home() {
  return (
    <div className="space-y-8">
      {/* Hero Section - Clean Light Theme */}
      <div className="bg-white rounded-2xl p-10 md:p-16 text-center shadow-sm border border-slate-200">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
          Find Jobs Across <span className="text-indigo-600">Top Platforms</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
          AI-powered matching that turns your resume or skills into live searches on external job sites.
        </p>
        <div className="flex justify-center gap-4">
          <Link to="/jobs" className="neon-outline">
            Explore Platforms
          </Link>
          <Link to="/ai-match" className="neon-btn">
            AI Match
          </Link>
        </div>
      </div>

      {/* Features Section - Modern Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1 */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow duration-300">
          <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center text-2xl font-bold mb-6">
            AI
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-3">AI Matching</h3>
          <p className="text-slate-600 leading-relaxed text-sm">
            Upload your resume or skills and let AI build targeted external job searches for you.
          </p>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow duration-300">
          <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center gap-1 mb-6">
            <BrandIcon url="linkedin" className="w-4 h-4" />
            <BrandIcon url="indeed" className="w-4 h-4" />
            <BrandIcon url="naukri" className="w-4 h-4 text-slate-500" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-3">Live External Results</h3>
          <p className="text-slate-600 leading-relaxed text-sm">
            Open current listings directly on LinkedIn, Naukri, Indeed, Foundit, and more.
          </p>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow duration-300">
          <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center text-2xl font-bold mb-6">
            GO
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-3">Direct Platform Links</h3>
          <p className="text-slate-600 leading-relaxed text-sm">
            Skip manual copying and jump straight into live search pages and official portals.
          </p>
        </div>

      </div>
    </div>
  )
}

export default Home