import { useState } from 'react'
import API from '../api/axios'

function CareerRoadmap() {
  const [role, setRole] = useState('')
  const [roadmap, setRoadmap] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const generateRoadmap = async () => {
    const trimmed = role.trim()
    if (!trimmed) return

    setError('')
    setLoading(true)
    setRoadmap(null)
    try {
      const response = await API.post('/ai/roadmap', { target_role: trimmed })
      setRoadmap(response.data || [])
    } catch (err) {
      console.error('Roadmap generate error:', err)
      setError(err.response?.data?.detail || 'Failed to generate career roadmap. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="wander-light-theme min-h-screen p-4 md:p-8 md:pl-24 flex flex-col font-sans select-none overflow-x-hidden relative">
      {/* UHD Background Wallpaper */}
      <img 
        src="https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=2560&auto=format&fit=crop&q=90" 
        alt="Career Roadmap background" 
        className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none z-0"
      />
      {/* Soft Pure White Overlay */}
      <div className="absolute inset-0 z-0 pointer-events-none" style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(2px)' }} />

      <div className="max-w-3xl mx-auto w-full space-y-12 relative z-10">
        {/* Page Header */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight" style={{ color: '#0f172a' }}>Career Roadmap</h1>
          <p className="text-xs md:text-sm font-bold max-w-lg mx-auto" style={{ color: '#475569' }}>
            Not sure where to start? Enter your dream role and get a step-by-step path to success.
          </p>
        </div>

        {/* Input Bar Card */}
        <div className="wander-bg-white border border-slate-200/80 p-5 rounded-3xl wander-badge-shadow flex flex-col sm:flex-row gap-3">
          <input 
            type="text" 
            placeholder="e.g. Backend Developer, Data Scientist, Bank PO..." 
            className="flex-1 bg-slate-100/50 hover:bg-slate-200/40 border border-slate-200 focus:bg-white text-slate-800 wander-search-input text-xs rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-semibold"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && generateRoadmap()}
            disabled={loading}
          />
          <button 
            onClick={generateRoadmap}
            disabled={loading}
            className="bg-[#0f172a] hover:bg-blue-600 disabled:opacity-50 text-white text-xs font-bold py-3.5 px-8 rounded-xl transition-all shadow-md cursor-pointer whitespace-nowrap flex items-center justify-center gap-2"
          >
            {loading ? 'Designing path...' : 'Generate Path'}
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="wander-bg-white border border-red-200 p-4 rounded-2xl text-center text-xs font-bold text-red-600 shadow-sm animate-in fade-in duration-200">
            {error}
          </div>
        )}

        {/* Loading placeholder */}
        {loading && (
          <div className="wander-bg-white border border-slate-200/80 p-8 rounded-3xl wander-badge-shadow text-center space-y-3">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs font-bold text-slate-500">Creating custom skill milestones for "{role}"...</p>
          </div>
        )}

        {/* Roadmap milestones */}
        {roadmap && (
          <div className="relative animate-in fade-in slide-in-from-bottom duration-300">
            {/* Vertical timeline connector line */}
            <div className="absolute left-[27px] top-6 bottom-6 w-1 bg-blue-200/60 rounded"></div>
            
            <div className="space-y-8">
              {roadmap.map((item, index) => (
                <div key={item.step || index} className="flex gap-6 relative">
                  {/* Number Milestone Indicator */}
                  <div className="w-14 h-14 shrink-0 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl shadow-lg border-4 border-white relative z-10">
                    {item.step}
                  </div>
                  {/* Info Card */}
                  <div className="wander-bg-white p-6 rounded-3xl border border-slate-200/80 wander-badge-shadow flex-1 hover:shadow-md transition-shadow space-y-2">
                    <h3 className="text-lg font-extrabold text-slate-800 tracking-tight">{item.title}</h3>
                    <p className="text-xs md:text-sm leading-relaxed font-semibold" style={{ color: '#475569' }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CareerRoadmap
