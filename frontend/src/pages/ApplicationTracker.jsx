import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import API from '../api/axios'
import BrandIcon from '../components/BrandIcon'

const STATUS_OPTIONS = ['Applied', 'Interview', 'Selected', 'Rejected']

const statusStyle = {
  Applied: 'bg-blue-50 text-blue-700 border-blue-200/60 shadow-sm',
  Interview: 'bg-yellow-50 text-yellow-700 border-yellow-200/60 shadow-sm',
  Selected: 'bg-green-50 text-green-700 border-green-200/60 shadow-sm',
  Rejected: 'bg-red-50 text-red-700 border-red-200/60 shadow-sm',
}

const emptyForm = {
  company: '',
  role: '',
  status: 'Applied',
  applied_date: '',
  link: '',
  notes: '',
}

function ApplicationTracker() {
  const token = localStorage.getItem('token')

  const [applications, setApplications] = useState([])
  const [counts, setCounts] = useState({})
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ ...emptyForm })
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState('All')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await API.get('/applications')
      setApplications(data.applications || [])
      setCounts(data.counts || {})
      setTotal(data.total || 0)
    } catch (error) {
      console.error('Applications load error:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (token) load()
  }, [token, load])

  const addApplication = async () => {
    if (!form.company.trim()) {
      alert('Please enter a company name.')
      return
    }
    try {
      await API.post('/applications', form)
      setForm({ ...emptyForm })
      setShowForm(false)
      load()
    } catch (error) {
      console.error('Add application error:', error)
      alert('Application could not be added. Please try again.')
    }
  }

  const changeStatus = async (id, status) => {
    setApplications((list) => list.map((a) => (a.id === id ? { ...a, status } : a)))
    try {
      await API.patch(`/applications/${id}`, { status })
      load()
    } catch (error) {
      console.error('Update status error:', error)
    }
  }

  const deleteApplication = async (id) => {
    try {
      await API.delete(`/applications/${id}`)
      load()
    } catch (error) {
      console.error('Delete application error:', error)
    }
  }

  if (!token) {
    return (
      <div className="wander-light-theme relative min-h-screen flex items-center justify-center p-4 overflow-hidden select-none">
        <img 
          src="https://images.unsplash.com/photo-1508962914676-134849a727f0?w=1600&auto=format&fit=crop&q=80" 
          alt="Tracker background" 
          className="absolute inset-0 w-full h-full object-cover opacity-95"
        />
        <div className="absolute inset-0 bg-[#f8fafc]/75 backdrop-blur-[2px]" />
        
        <div className="relative z-10 wander-bg-white border border-slate-200/80 p-8 rounded-3xl shadow-2xl w-full max-w-md text-center space-y-6">
          <div className="text-xl font-black tracking-widest wander-text-dark font-mono mb-2">
            CAREERPILOT
          </div>
          <h1 className="text-2xl font-extrabold wander-text-dark tracking-tight">Application Tracker</h1>
          <p className="text-xs text-slate-500 font-bold max-w-sm mx-auto leading-relaxed">
            Organize your career search dashboard. Please login to save and track your external job applications.
          </p>
          <Link to="/login" className="bg-[#0f172a] hover:bg-blue-600 text-white text-xs font-bold py-3.5 px-8 rounded-xl transition-all shadow-md inline-block w-full">
            Login to Account
          </Link>
        </div>
      </div>
    )
  }

  const inputClass =
    'w-full bg-slate-100/50 hover:bg-slate-200/40 border border-slate-200 focus:bg-white text-slate-800 wander-search-input text-xs rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-semibold'
  const visible = filter === 'All' ? applications : applications.filter((a) => a.status === filter)

  return (
    <div className="wander-light-theme min-h-screen p-4 md:p-8 md:pl-24 flex flex-col font-sans select-none overflow-x-hidden relative">
      {/* UHD Background Wallpaper */}
      <img 
        src="https://images.unsplash.com/photo-1508962914676-134849a727f0?w=2560&auto=format&fit=crop&q=90" 
        alt="Tracker background" 
        className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none z-0"
      />
      {/* Soft Pure White Overlay */}
      <div className="absolute inset-0 z-0 pointer-events-none" style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(2px)' }} />

      <div className="max-w-4xl mx-auto w-full space-y-12 relative z-10">
        {/* Page Header */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight" style={{ color: '#0f172a' }}>Application Tracker</h1>
          <p className="text-xs md:text-sm font-bold max-w-lg mx-auto" style={{ color: '#475569' }}>
            Track the status of every job application across external platforms in one place.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatCard label="Total" value={total} active={filter === 'All'} onClick={() => setFilter('All')} />
          {STATUS_OPTIONS.map((s) => (
            <StatCard
              key={s}
              label={s}
              value={counts[s] || 0}
              active={filter === s}
              onClick={() => setFilter(s)}
            />
          ))}
        </div>

        {/* Info Explainer Alert */}
        <div className="wander-bg-white border border-blue-200/60 p-4 rounded-2xl wander-badge-shadow flex items-start gap-3">
          <span className="text-lg">💡</span>
          <div className="text-xs font-semibold text-blue-700 leading-relaxed">
            <strong>Personal Tracker:</strong> Since applications redirect to external systems (like LinkedIn or official exam portals), status changes won't automatically sync. Manually transition your phases below to keep your global job search organized in one dashboard board!
          </div>
        </div>

        {/* Applications List & Form Panel */}
        <div className="wander-bg-white border border-slate-200/80 p-6 md:p-8 rounded-3xl wander-badge-shadow space-y-6">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <h2 className="text-lg font-extrabold text-slate-800 tracking-tight">
              Job Applications {filter !== 'All' && <span className="text-xs font-semibold text-slate-400">&bull; {filter}</span>}
            </h2>
            <button 
              onClick={() => setShowForm((s) => !s)} 
              className="bg-[#0f172a] hover:bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer whitespace-nowrap"
            >
              {showForm ? 'Cancel' : '+ Add Application'}
            </button>
          </div>

          {/* Expandable Add Application Form */}
          {showForm && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-4 space-y-4 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Company Name *</label>
                  <input className={inputClass} placeholder="e.g. Google, SSC, TCS" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Role / Post</label>
                  <input className={inputClass} placeholder="e.g. Software Engineer, Assistant" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Initial Status</label>
                  <select className={inputClass} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Applied Date</label>
                  <input type="date" className={inputClass} value={form.applied_date} onChange={(e) => setForm({ ...form, applied_date: e.target.value })} />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Job Link (Optional)</label>
                <input className={inputClass} placeholder="https://..." value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Notes</label>
                <textarea className={inputClass} rows={2} placeholder="e.g. Interview date set for Monday, contact details, salary, etc..." value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </div>
              <button 
                onClick={addApplication} 
                className="w-full bg-[#0f172a] hover:bg-blue-600 text-white text-xs font-bold py-3 rounded-xl transition-all shadow-md cursor-pointer"
              >
                Save Application Details
              </button>
            </div>
          )}

          {loading && (
            <div className="py-12 text-center space-y-2">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs font-bold text-slate-500">Syncing board applications...</p>
            </div>
          )}

          {!loading && visible.length ? (
            <div className="space-y-4">
              {visible.map((a) => (
                <div key={a.id} className="border border-slate-200/80 wander-bg-gray/50 rounded-2xl p-5 hover:shadow-md transition-shadow flex justify-between items-start gap-4">
                  <div className="min-w-0 space-y-1.5">
                    <div>
                      <span className="font-extrabold text-slate-800 text-base">{a.company}</span>
                      {a.role && <span className="text-slate-400 font-semibold text-xs ml-1.5">&bull; {a.role}</span>}
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                      {a.applied_date ? `Applied: ${a.applied_date}` : 'Date not set'}
                    </span>
                    {a.notes && (
                      <p className="text-xs text-slate-600 font-semibold leading-relaxed max-w-xl bg-white border border-slate-200/50 p-3 rounded-xl">
                        {a.notes}
                      </p>
                    )}
                    {a.link && (
                      <a 
                        href={a.link} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-all flex items-center gap-1.5 mt-1"
                      >
                        <BrandIcon url={a.link} className="w-3.5 h-3.5 border border-slate-200/60 rounded p-0.5 bg-white" /> 
                        Visit Job Link &rarr;
                      </a>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-3 shrink-0">
                    <select
                      value={a.status}
                      onChange={(e) => changeStatus(a.id, e.target.value)}
                      className={`text-xs font-bold border rounded-full px-3 py-1.5 focus:outline-none cursor-pointer ${statusStyle[a.status] || ''}`}
                    >
                      {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <button 
                      onClick={() => deleteApplication(a.id)} 
                      className="text-red-500 hover:text-red-700 text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            !loading && (
              <div className="py-12 text-center text-xs font-bold text-slate-500">
                {filter === 'All'
                  ? 'No applications added yet. Start by clicking "+ Add Application".'
                  : `No applications matching "${filter}" status.`}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`p-4 rounded-2xl border text-center transition-all cursor-pointer shadow-sm hover:shadow-md hover:scale-[1.03] duration-200 ${
        active 
          ? 'bg-[#0f172a] text-white border-[#0f172a] font-black' 
          : 'bg-white text-slate-700 border-slate-200/80 hover:border-blue-400 font-bold'
      }`}
    >
      <p className="text-2xl font-extrabold">{value}</p>
      <p className="text-[10px] uppercase tracking-wider mt-1 opacity-80">{label}</p>
    </button>
  )
}

export default ApplicationTracker
