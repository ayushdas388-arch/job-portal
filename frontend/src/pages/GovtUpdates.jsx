import { useState, useEffect } from 'react'
import API from '../api/axios'

function GovtUpdates() {
  const [tab, setTab] = useState('results')
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchUpdates = async (currentTab = tab, query = searchQuery) => {
    setLoading(true)
    setError('')
    try {
      const response = await API.post('/ai/exam-updates', {
        query: query.trim(),
        category: currentTab
      })
      setItems(response.data || [])
    } catch (err) {
      console.error('Fetch updates error:', err)
      setError('Failed to fetch latest exam updates. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Reset search query and fetch default list when tab changes
    setSearchQuery('')
    setIsSearching(false)
    fetchUpdates(tab, '')
  }, [tab])

  const handleSearch = (e) => {
    if (e) e.preventDefault()
    const query = searchQuery.trim()
    if (query) {
      setIsSearching(true)
      fetchUpdates('search', query)
    } else {
      setIsSearching(false)
      fetchUpdates(tab, '')
    }
  }

  return (
    <div className="wander-light-theme min-h-screen p-4 md:p-8 md:pl-24 flex flex-col font-sans select-none overflow-x-hidden relative">
      {/* UHD Background Wallpaper */}
      <img 
        src="https://images.unsplash.com/photo-1513258496099-48168024aec0?w=2560&auto=format&fit=crop&q=90" 
        alt="Govt Updates background" 
        className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none z-0"
      />
      {/* Soft Pure White Overlay */}
      <div className="absolute inset-0 z-0 pointer-events-none" style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(2px)' }} />

      <div className="max-w-4xl mx-auto w-full space-y-12 relative z-10">
        {/* Page Header */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight" style={{ color: '#0f172a' }}>Exam Updates</h1>
          <p className="text-xs md:text-sm font-bold max-w-lg mx-auto" style={{ color: '#475569' }}>
            Latest updates for exam calendars, results, notifications, and admit cards.
          </p>
        </div>

        {/* Search Bar Panel */}
        <form onSubmit={handleSearch} className="wander-bg-white border border-slate-200/80 p-5 rounded-3xl wander-badge-shadow flex flex-col sm:flex-row gap-3">
          <input 
            type="text" 
            placeholder="Search exams or vacancies (e.g. UPSC, SSC CGL results, Railway jobs)..." 
            className="flex-1 bg-slate-100/50 hover:bg-slate-200/40 border border-slate-200 focus:bg-white text-slate-800 wander-search-input text-xs rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-semibold"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button 
            type="submit"
            disabled={loading}
            className="bg-[#0f172a] hover:bg-blue-600 disabled:opacity-50 text-white text-xs font-bold py-3.5 px-8 rounded-xl transition-all shadow-md cursor-pointer whitespace-nowrap flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
            Search
          </button>
        </form>

        {/* Tab Switcher */}
        <div className="flex flex-wrap justify-center gap-3">
          {[
            { id: 'results', label: 'Results' },
            { id: 'calendar', label: 'Exam Calendar' },
            { id: 'jobs', label: 'Govt Jobs' },
            { id: 'admit_cards', label: 'Admit Cards' }
          ].map(t => {
            const isActive = !isSearching && tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all border cursor-pointer ${
                  isActive 
                    ? 'bg-[#0f172a] text-white shadow-md border-[#0f172a]' 
                    : 'bg-slate-100 text-slate-600 border-slate-200/60 hover:bg-slate-200/60'
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Main Content Area */}
        <div className="wander-bg-white border border-slate-200/80 p-6 md:p-8 rounded-3xl wander-badge-shadow space-y-6">
          <h2 className="text-xl font-extrabold text-slate-800 border-b border-slate-100 pb-3 capitalize tracking-tight flex justify-between items-center">
            <span>{isSearching ? `Search Results` : tab.replace('_', ' ')}</span>
          </h2>

          {error && (
            <div className="border border-red-200 bg-red-50/50 p-4 rounded-2xl text-center text-xs font-bold text-red-600">
              {error}
            </div>
          )}

          {loading ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs font-bold text-slate-500">Querying Google database for updates...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="py-12 text-center space-y-2 animate-in fade-in duration-200">
              <p className="text-sm font-bold text-slate-500">No updates matching your query were found.</p>
              <p className="text-xs text-slate-400 font-semibold">Try searching for other terms or check another category tab.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-in fade-in duration-200">
              {items.map((item, index) => (
                <a 
                  key={index}
                  href={item.link}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-slate-50 hover:bg-slate-100/85 border border-slate-200/60 rounded-2xl p-5 flex flex-col justify-between hover:border-blue-500 hover:shadow-sm transition-all group"
                >
                  <div className="space-y-1">
                    <h3 className="font-extrabold text-slate-800 group-hover:text-blue-600 transition-colors text-sm tracking-tight leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-400 font-semibold">
                      Date / Status: <span className="text-slate-600">{item.date}</span>
                    </p>
                  </div>
                  <div className="mt-4 flex items-center text-xs font-bold text-blue-600 gap-1.5">
                    View Official Source 
                    <svg className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                    </svg>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default GovtUpdates
