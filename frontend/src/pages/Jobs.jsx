import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import API from '../api/axios'
import BrandIcon from '../components/BrandIcon'
import { toast } from 'react-toastify'

const platformWallpapers = {
  linkedin: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&auto=format&fit=crop&q=80',
  naukri: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
  indeed: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&auto=format&fit=crop&q=80',
  foundit: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&auto=format&fit=crop&q=80',
  internshala: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=400&auto=format&fit=crop&q=80',
  wellfound: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&auto=format&fit=crop&q=80',
  
  // Government Portals
  ssc: 'https://images.unsplash.com/photo-1606857521015-7f9fcf423740?w=400&auto=format&fit=crop&q=80',
  upsc: 'https://images.unsplash.com/photo-1532375810709-75b1da00537c?w=400&auto=format&fit=crop&q=80',
  rrb: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=400&auto=format&fit=crop&q=80',
  ibps: 'https://images.unsplash.com/photo-1580519542036-c47de6196ba5?w=400&auto=format&fit=crop&q=80',
  ncs: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&auto=format&fit=crop&q=80'
};

const defaultWallpaper = 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&auto=format&fit=crop&q=80';

const platformCardStyles = {
  linkedin: 'bg-gradient-to-br from-[#0a66c2]/5 via-white to-white border-[#0a66c2]/15',
  naukri: 'bg-gradient-to-br from-[#005c97]/5 via-white to-white border-[#005c97]/15',
  indeed: 'bg-gradient-to-br from-[#003a9b]/5 via-white to-white border-[#003a9b]/15',
  foundit: 'bg-gradient-to-br from-[#8e24aa]/5 via-white to-white border-[#8e24aa]/15',
  internshala: 'bg-gradient-to-br from-[#008cff]/5 via-white to-white border-[#008cff]/15',
  wellfound: 'bg-gradient-to-br from-[#0f172a]/5 via-white to-white border-[#0f172a]/15',
  
  // Government Portals
  ssc: 'bg-gradient-to-br from-blue-900/5 via-white to-white border-blue-900/15',
  upsc: 'bg-gradient-to-br from-orange-600/5 via-white to-white border-orange-600/15',
  rrb: 'bg-gradient-to-br from-red-600/5 via-white to-white border-red-600/15',
  ibps: 'bg-gradient-to-br from-emerald-600/5 via-white to-white border-emerald-600/15',
  ncs: 'bg-gradient-to-br from-indigo-600/5 via-white to-white border-indigo-600/15'
};

const defaultCardStyle = 'bg-gradient-to-br from-slate-50 to-white border-slate-200';

function Jobs() {
  const [searchParams] = useSearchParams()
  const initialQuery = searchParams.get('q') || ''
  
  const [searchInput, setSearchInput] = useState(initialQuery)
  const [searchQuery, setSearchQuery] = useState(initialQuery)
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
      toast.error('Please login first to save.')
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
      toast.error('Could not save. Please try again.')
    }
  }

  const runSearch = () => {
    setSearchQuery(searchInput.trim())
  }

  return (
    <div className="wander-light-theme min-h-screen p-4 md:p-8 flex flex-col font-sans select-none space-y-8">
      
      {/* Top Header & Search Bar (Careerfy Style) */}
      <div className="rounded-3xl p-8 md:p-14 text-center text-white shadow-xl relative overflow-hidden h-[300px] md:h-[350px] flex flex-col justify-center items-center">
        {/* Background Wallpaper */}
        <img 
          src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1600&auto=format&fit=crop&q=80" 
          alt="Career Collaboration Background" 
          className="absolute inset-0 w-full h-full object-cover object-[center_28%]"
        />
        {/* Gradient Overlay for high-contrast blending */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a]/85 via-[#0f172a]/45 to-[#0f172a]/20" />
        
        <h1 className="text-3xl md:text-5xl font-extrabold mb-3 relative z-10 tracking-tight drop-shadow-md">
          Find Your Dream Job
        </h1>
        <p className="text-slate-200 text-xs md:text-sm mb-6 max-w-lg relative z-10 font-medium drop-shadow-sm leading-relaxed">
          Search across top platforms and government portals in one click. Find active roles matching your target career domain.
        </p>
        
        <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl p-2 flex flex-col md:flex-row gap-2 shadow-2xl relative z-10">
          <input
            type="text"
            placeholder={tab === 'private' ? 'Job title, keywords, or company...' : 'Search SSC, UPSC, Railway...'}
            className="flex-1 px-4 py-3 text-slate-800 wander-search-input focus:outline-none rounded-xl text-xs font-semibold"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && runSearch()}
          />
          <button 
            onClick={runSearch} 
            className="bg-[#0f172a] hover:bg-blue-600 text-white font-bold px-8 py-3.5 rounded-xl transition-all shadow-md shrink-0 text-xs hover:scale-105 duration-200 cursor-pointer"
          >
            Search
          </button>
        </div>
      </div>

      {/* Main Layout: Sidebar + Job Listings */}
      <div className="flex flex-col lg:flex-row gap-8 items-start relative z-10">
        
        {/* Left Sidebar (Filters) */}
        <div className="w-full lg:w-1/4 wander-bg-white border border-slate-200 rounded-2xl p-6 shadow-md sticky top-6">
          <h2 className="text-lg font-black text-slate-800 mb-4 pb-2 border-b border-slate-200">Job Filters</h2>
          
          <div className="space-y-4">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Job Sector</p>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer group select-none">
                  <input 
                    type="radio" 
                    name="sector" 
                    checked={tab === 'private'} 
                    onChange={() => setTab('private')}
                    className="w-4 h-4 text-[#0f172a] focus:ring-[#0f172a]/20 border-slate-300 cursor-pointer"
                  />
                  <span className={`text-xs font-bold transition-colors ${tab === 'private' ? 'text-[#0f172a]' : 'text-slate-500 group-hover:text-[#0f172a]'}`}>Private Platforms</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group select-none">
                  <input 
                    type="radio" 
                    name="sector" 
                    checked={tab === 'government'} 
                    onChange={() => setTab('government')}
                    className="w-4 h-4 text-[#0f172a] focus:ring-[#0f172a]/20 border-slate-300 cursor-pointer"
                  />
                  <span className={`text-xs font-bold transition-colors ${tab === 'government' ? 'text-[#0f172a]' : 'text-slate-500 group-hover:text-[#0f172a]'}`}>Government Portals</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group select-none">
                  <input 
                    type="radio" 
                    name="sector" 
                    checked={tab === 'internship'} 
                    onChange={() => setTab('internship')}
                    className="w-4 h-4 text-[#0f172a] focus:ring-[#0f172a]/20 border-slate-300 cursor-pointer"
                  />
                  <span className={`text-xs font-bold transition-colors ${tab === 'internship' ? 'text-[#0f172a]' : 'text-slate-500 group-hover:text-[#0f172a]'}`}>Internships</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Right Content (Job Cards) */}
        <div className="w-full lg:w-3/4 space-y-6">
          
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-black text-slate-800">
              {tab === 'private' && results.length > 0 ? `Showing Live Results` : tab === 'private' ? 'Supported Private Platforms' : tab === 'government' ? 'Supported Government Portals' : 'Internship Platforms'}
            </h2>
            {loading && <span className="text-xs font-bold text-blue-600 animate-pulse">Loading data...</span>}
          </div>

          {/* Render Live Search Results (if Private & searched) */}
          {tab === 'private' && results.length > 0 ? (
            <div className="space-y-4">
              {results.map((item) => {
                const key = item.title || item.company
                const isSaved = saved.includes(key)
                return (
                  <div key={item.id} className="wander-bg-white border border-slate-200/80 rounded-2xl p-5 flex flex-col md:flex-row md:items-center gap-5 hover:shadow-lg transition-all group relative overflow-hidden">
                    {/* General start-up/workspace watermark background */}
                    <div className="absolute inset-0 opacity-[0.18] pointer-events-none select-none z-0">
                      <img 
                        src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=80" 
                        alt="Workspace watermark" 
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Company Initial / Logo Placeholder */}
                    <div className="relative z-10 w-12 h-12 wander-bg-white rounded-xl flex items-center justify-center shrink-0 border border-slate-200/50 shadow-sm">
                      <BrandIcon url={item.link} name={item.company} className="w-7 h-7" />
                    </div>
                    
                    {/* Job Details */}
                    <div className="relative z-10 flex-1 min-w-0">
                      <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1">{item.company}</p>
                      <h3 className="text-base font-black text-[#0f172a] group-hover:text-blue-600 transition-colors truncate">{item.title}</h3>
                      <p className="text-xs text-slate-500 font-medium mt-1.5 line-clamp-2 leading-relaxed">{item.description}</p>
                    </div>

                    {/* Action Buttons */}
                    <div className="relative z-10 flex md:flex-col gap-2 shrink-0 md:w-32 mt-4 md:mt-0">
                      <a 
                        href={item.link} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="flex-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-800 text-xs font-bold py-2.5 rounded-xl text-center border border-slate-200/40 transition-all cursor-pointer"
                      >
                        View Job
                      </a>
                      <button 
                        onClick={() => handleSave(item, 'External Search')} 
                        disabled={isSaved} 
                        className="bg-[#0f172a] hover:bg-blue-600 disabled:bg-slate-400 text-white text-xs font-bold py-2.5 rounded-xl transition-all shadow-sm disabled:shadow-none cursor-pointer"
                      >
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
                // Match specific wallpaper based on platform name
                const siteNameLower = platform.site.toLowerCase()
                const bgWallpaper = platformWallpapers[siteNameLower] || defaultWallpaper
                const cardStyleClass = platformCardStyles[siteNameLower] || defaultCardStyle

                 return (
                  <a 
                    key={platform.id} 
                    href={platform.url || platform.home_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border border-slate-700/20 rounded-3xl p-6 hover:shadow-2xl transition-all group flex flex-col min-h-[300px] relative overflow-hidden text-white cursor-pointer"
                  >
                    {/* Unique Watermark Background Wallpaper (High visibility) */}
                    <div className="absolute inset-0 opacity-[0.88] pointer-events-none select-none z-0">
                      <img 
                        src={bgWallpaper} 
                        alt={`${platform.site} Background`} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {/* Gradient Overlay for card contrast */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a]/95 via-[#0f172a]/65 to-[#0f172a]/40 z-0" />

                    <div className="relative z-10 flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="w-11 h-11 wander-bg-white rounded-2xl flex items-center justify-center border border-slate-200 shadow-md p-1.5 shrink-0">
                          <BrandIcon url={platform.url || platform.home_url} name={platform.site} className="w-8 h-8 object-contain" />
                        </span>
                        <h3 className="text-sm font-black text-white tracking-tight">{platform.site}</h3>
                      </div>
                    </div>
                    
                    <p className="relative z-10 text-xs text-slate-200 font-medium leading-relaxed flex-1 mb-6 line-clamp-3">{platform.description}</p>
                    
                    <div className="relative z-10 flex items-center gap-2 mt-auto">
                      <div 
                        className="flex-1 bg-white hover:bg-slate-100 text-[#0f172a] text-xs font-black py-2.5 rounded-xl text-center transition-all shadow-md hover:scale-105 duration-200"
                      >
                        Visit Site
                      </div>
                      <button 
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleSave(platform, tab === 'private' ? 'Private Platform' : 'Government Portal')
                        }}
                        disabled={isSaved} 
                        className="bg-white/10 hover:bg-white/20 border border-white/20 disabled:bg-white/5 disabled:text-white/40 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all disabled:opacity-50 cursor-pointer relative z-20"
                      >
                        {isSaved ? 'Saved' : 'Save'}
                      </button>
                    </div>
                  </a>
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