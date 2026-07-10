import { useEffect, useState } from 'react'
import API from '../api/axios'
import BrandIcon from '../components/BrandIcon'

function Jobs() {
  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [tab, setTab] = useState('private')
  const [platforms, setPlatforms] = useState([])
  const [results, setResults] = useState([])
  const [saved, setSaved] = useState([])
  const [loading, setLoading] = useState(false)

  const loadData = async (category, query) => {
    setLoading(true)
    try {
      const { data } = await API.get('/jobs/', {
        params: {
          category,
          q: query || undefined,
        },
      })
      setPlatforms(data.platforms || [])
      setResults(data.search_results || [])
    } catch (error) {
      console.error('Jobs load error:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData(tab, searchQuery)
  }, [tab, searchQuery])

  const handleSave = async (item, category) => {
    if (!localStorage.getItem('token')) {
      alert('Please login first to save.')
      return
    }
    try {
      await API.post('/dashboard/saved-jobs', {
        name: item.title || item.site,
        description: item.description,
        link: item.link || item.url,
        category,
      })
      setSaved((prev) => [...prev, item.title || item.site])
    } catch (error) {
      console.error('Save job error:', error)
      alert('Could not save. Please try again.')
    }
  }

  const runSearch = () => {
    setSearchQuery(searchInput.trim())
  }

  return (
    <div className="space-y-6">
      
      {/* Top Header & Search Bar (Careerfy Style) */}
      <div className="bg-indigo-600 rounded-2xl p-8 md:p-12 text-center text-white shadow-md relative overflow-hidden">
        {/* Abstract background shapes */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-2xl"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full translate-x-1/2 translate-y-1/2 blur-2xl"></div>
        
        <h1 className="text-3xl md:text-4xl font-extrabold mb-3 relative z-10">Find Your Dream Job</h1>
        <p className="text-indigo-100 mb-8 relative z-10">Search across top platforms and government portals in one click.</p>
        
        <div className="max-w-3xl mx-auto bg-white rounded-xl p-2 flex flex-col md:flex-row gap-2 shadow-lg relative z-10">
          <input
            type="text"
            placeholder={tab === 'private' ? 'Job title, keywords, or company...' : 'Search SSC, UPSC, Railway...'}
            className="flex-1 px-4 py-3 text-slate-800 focus:outline-none rounded-lg"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && runSearch()}
          />
          <button 
            onClick={runSearch} 
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
          >
            Search
          </button>
        </div>
      </div>

      {/* Main Layout: Sidebar + Job Listings */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Left Sidebar (Filters) */}
        <div className="w-full lg:w-1/4 bg-white border border-slate-200 rounded-xl p-6 shadow-sm sticky top-6">
          <h2 className="text-lg font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">Job Filters</h2>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm font-semibold text-slate-700 mb-3">Job Sector</p>
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="radio" 
                    name="sector" 
                    checked={tab === 'private'} 
                    onChange={() => setTab('private')}
                    className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-300"
                  />
                  <span className={`text-sm group-hover:text-indigo-600 transition-colors ${tab === 'private' ? 'text-indigo-600 font-medium' : 'text-slate-600'}`}>Private Platforms</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="radio" 
                    name="sector" 
                    checked={tab === 'government'} 
                    onChange={() => setTab('government')}
                    className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-300"
                  />
                  <span className={`text-sm group-hover:text-indigo-600 transition-colors ${tab === 'government' ? 'text-indigo-600 font-medium' : 'text-slate-600'}`}>Government Portals</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="radio" 
                    name="sector" 
                    checked={tab === 'internship'} 
                    onChange={() => setTab('internship')}
                    className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-300"
                  />
                  <span className={`text-sm group-hover:text-indigo-600 transition-colors ${tab === 'internship' ? 'text-indigo-600 font-medium' : 'text-slate-600'}`}>Internships</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Right Content (Job Cards) */}
        <div className="w-full lg:w-3/4 space-y-6">
          
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-slate-800">
              {tab === 'private' && results.length > 0 ? `Showing Live Results` : tab === 'private' ? 'Supported Private Platforms' : tab === 'government' ? 'Supported Government Portals' : 'Internship Platforms'}
            </h2>
            {loading && <span className="text-sm font-medium text-indigo-600 animate-pulse">Loading data...</span>}
          </div>

          {/* Render Live Search Results (if Private & searched) */}
          {tab === 'private' && results.length > 0 ? (
            <div className="space-y-4">
              {results.map((item) => {
                const key = item.title || item.company
                const isSaved = saved.includes(key)
                return (
                  <div key={item.id} className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col md:flex-row md:items-center gap-5 hover:shadow-md transition-all group">
                    {/* Company Initial / Logo Placeholder */}
                    <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
                      <BrandIcon url={item.link} name={item.company} className="w-8 h-8" />
                    </div>
                    
                    {/* Job Details */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">{item.company}</p>
                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">{item.title}</h3>
                      <p className="text-sm text-slate-500 mt-1 line-clamp-2">{item.description}</p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex md:flex-col gap-2 shrink-0 md:w-32 mt-4 md:mt-0">
                      <a href={item.link} target="_blank" rel="noopener noreferrer" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2 rounded-lg text-center transition-colors">
                        View Job
                      </a>
                      <button onClick={() => handleSave(item, 'External Search')} disabled={isSaved} className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-600 text-sm font-medium py-2 rounded-lg transition-colors disabled:opacity-50">
                        {isSaved ? 'Saved' : 'Save'}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            /* Render Base Platforms if no search results */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {!loading && platforms.map((platform) => {
                const key = platform.site
                const isSaved = saved.includes(key)
                return (
                  <div key={platform.id} className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-all group flex flex-col h-full">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                          <BrandIcon url={platform.url} name={platform.site} className="w-6 h-6" />
                        </span>
                        <h3 className="text-base font-bold text-slate-900">{platform.site}</h3>
                      </div>
                    </div>
                    <p className="text-sm text-slate-500 flex-1 mb-6">{platform.description}</p>
                    <div className="flex items-center gap-2 mt-auto">
                      <a href={platform.url} target="_blank" rel="noopener noreferrer" className="flex-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-sm font-semibold py-2 rounded-lg text-center transition-colors">
                        Visit Site
                      </a>
                      <button onClick={() => handleSave(platform, tab === 'private' ? 'Private Platform' : 'Government Portal')} disabled={isSaved} className="border border-slate-200 hover:bg-slate-50 text-slate-600 text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50">
                        {isSaved ? 'Saved' : 'Save'}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
          
        </div>
      </div>
    </div>
  )
}

export default Jobs