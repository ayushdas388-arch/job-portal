import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import API from '../api/axios'
import BrandIcon from '../components/BrandIcon'
import ATSHistoryPanel from '../components/ATSHistoryPanel'
import toast from 'react-hot-toast'

const emptyExam = {
  name: '',
  category: '',
  exam_date: '',
  last_date_to_apply: '',
  link: '',
  progress: 0,
}

function daysLeft(dateStr) {
  if (!dateStr) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(dateStr)
  return Math.round((target - today) / (1000 * 60 * 60 * 24))
}

function Dashboard() {
  const token = localStorage.getItem('token')
  const name = localStorage.getItem('name')

  const [data, setData] = useState(null)
  const [exams, setExams] = useState([])
  const [savedJobs, setSavedJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ ...emptyExam })
  const [showForm, setShowForm] = useState(false)

  // Profile Image state & modal control
  const [avatar, setAvatar] = useState(localStorage.getItem('profile_image') || '')
  const [showAvatarModal, setShowAvatarModal] = useState(false)

  const avatarsList = [
    { name: "Executive Male", url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&q=80" },
    { name: "Executive Female", url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&q=80" },
    { name: "Tech Lead Male", url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&q=80" },
    { name: "Tech Lead Female", url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&q=80" },
    { name: "Developer Male", url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&q=80" },
    { name: "Developer Female", url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&q=80" }
  ]

  const selectAvatar = async (url) => {
    try {
      localStorage.setItem('profile_image', url)
      setAvatar(url)
      setShowAvatarModal(false)
      window.dispatchEvent(new Event('avatar-changed'))
      await API.patch('/auth/profile', { profile_image: url })
    } catch (err) {
      console.error("Error saving avatar:", err)
    }
  }

  const handleCustomPhotoUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 1.5 * 1024 * 1024) {
        toast.error("Please upload an image smaller than 1.5MB to save storage space.")
        return
      }
      const reader = new FileReader()
      reader.onloadend = async () => {
        try {
          const base64Url = reader.result
          localStorage.setItem('profile_image', base64Url)
          setAvatar(base64Url)
          setShowAvatarModal(false)
          window.dispatchEvent(new Event('avatar-changed'))
          await API.patch('/auth/profile', { profile_image: base64Url })
        } catch (err) {
          console.error("Error saving photo:", err)
          toast.error("Unable to save photo. Please try using a smaller image.")
        }
      }
      reader.readAsDataURL(file)
    }
  }


  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [summary, examList, saved] = await Promise.all([
        API.get('/dashboard/summary'),
        API.get('/dashboard/exams'),
        API.get('/dashboard/saved-jobs'),
      ])
      setData(summary.data)
      setExams(examList.data)
      setSavedJobs(saved.data)
      if (summary.data && summary.data.profile_image) {
        localStorage.setItem('profile_image', summary.data.profile_image)
        setAvatar(summary.data.profile_image)
        window.dispatchEvent(new Event('avatar-changed'))
      }
    } catch (error) {
      console.error('Dashboard load error:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (token) load()
  }, [token, load])

  const addExam = async () => {
    if (!form.name.trim()) {
      toast.error('Enter the exam name.')
      return
    }
    try {
      await API.post('/dashboard/exams', { ...form, progress: Number(form.progress) || 0 })
      setForm({ ...emptyExam })
      setShowForm(false)
      load()
    } catch (error) {
      console.error('Add exam error:', error)
      toast.error('Exam could not be added. Please try again.')
    }
  }

  const updateProgress = async (id, progress) => {
    setExams((list) => list.map((e) => (e.id === id ? { ...e, progress } : e)))
    try {
      await API.patch(`/dashboard/exams/${id}`, { progress })
      load()
    } catch (error) {
      console.error('Update progress error:', error)
    }
  }

  const deleteExam = async (id) => {
    try {
      await API.delete(`/dashboard/exams/${id}`)
      load()
    } catch (error) {
      console.error('Delete exam error:', error)
    }
  }

  const removeSaved = async (id) => {
    try {
      await API.delete(`/dashboard/saved-jobs/${id}`)
      load()
    } catch (error) {
      console.error('Remove saved error:', error)
    }
  }

  if (!token) {
    return (
      <div className="wander-light-theme relative min-h-screen flex items-center justify-center p-4 overflow-hidden select-none">
        <img
          src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&auto=format&fit=crop&q=80"
          alt="Dashboard background"
          className="absolute inset-0 w-full h-full object-cover opacity-95"
        />
        <div className="absolute inset-0 bg-[#f8fafc]/75 backdrop-blur-[2px]" />

        <div className="relative z-10 wander-bg-white border border-slate-200/80 p-8 rounded-3xl shadow-2xl w-full max-w-md text-center space-y-6">
          <div className="text-xl font-black tracking-widest wander-text-dark font-mono mb-2">
            CAREERPILOT
          </div>
          <h1 className="text-2xl font-black wander-text-dark tracking-tight">📊 Dashboard</h1>
          <p className="text-xs text-slate-500 font-medium mb-6">Login to view the dashboard.</p>
          <Link to="/login" className="w-full bg-[#0f172a] hover:bg-blue-600 text-white text-xs font-bold py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center cursor-pointer">
            Login
          </Link>
        </div>
      </div>
    )
  }

  const stats = data?.stats || { total_exams: 0, upcoming_exams: 0, saved_jobs: 0, avg_progress: 0 }
  // Modern light input classes
  const inputClass = 'w-full bg-slate-100 hover:bg-slate-200/50 border border-slate-200 focus:bg-white text-slate-800 wander-search-input text-xs rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium'

  return (
    <div className="wander-light-theme min-h-screen p-4 md:p-8 md:pl-24 flex flex-col font-sans select-none overflow-x-hidden">
      <div className="max-w-7xl mx-auto w-full space-y-12">
        {/* Page Header with Profile Card */}
        <div className="wander-bg-white rounded-3xl border border-slate-200/80 p-6 wander-badge-shadow flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col md:flex-row items-center gap-5 text-center md:text-left">
            {/* Avatar frame */}
            <div className="relative group cursor-pointer" onClick={() => setShowAvatarModal(true)}>
              {avatar ? (
                <img
                  src={avatar}
                  alt="Profile Avatar"
                  className="w-20 h-20 rounded-full object-cover border-4 border-blue-500/20 shadow-md transition-all group-hover:brightness-90"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center text-3xl font-bold text-blue-600 border-4 border-blue-500/20 shadow-md transition-all group-hover:bg-blue-100">
                  {name ? name.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center text-[10px] font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity">
                Change Photo
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex flex-col md:flex-row md:items-center gap-2">
                <h1 className="text-2xl font-extrabold wander-text-dark tracking-tight">{name || 'User'}</h1>
                <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-blue-200/50 shrink-0 self-center uppercase tracking-wider">
                  Candidate
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">Track your job applications and exam preparations here</p>
            </div>
          </div>

          <button
            onClick={() => setShowAvatarModal(true)}
            className="border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs px-4 py-2.5 rounded-full font-bold shadow-sm transition-all cursor-pointer"
          >
            Change Profile Photo
          </button>
        </div>

        {/* Avatar Picker Modal */}
        {showAvatarModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 w-full max-w-md rounded-3xl p-6 shadow-2xl relative animate-in fade-in zoom-in duration-200 text-slate-800">
              <h2 className="text-xl font-extrabold text-slate-900 mb-1 tracking-tight">Select Profile Photo</h2>
              <p className="text-xs text-slate-500 mb-6 font-semibold">Choose a high-definition professional headshot to update your profile.</p>

              <div className="grid grid-cols-3 gap-4 mb-6">
                {avatarsList.map((av, index) => (
                  <div
                    key={index}
                    onClick={() => selectAvatar(av.url)}
                    className={`cursor-pointer rounded-xl overflow-hidden border-2 relative group hover:border-blue-500 hover:scale-105 transition-all ${avatar === av.url ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-200'}`}
                  >
                    <img src={av.url} alt={av.name} className="w-full h-24 object-cover" />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-200 pt-4 mb-4">
                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">
                  Or upload your own photo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCustomPhotoUpload}
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100 file:cursor-pointer"
                />
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
                {avatar && (
                  <button
                    onClick={() => {
                      localStorage.removeItem('profile_image');
                      setAvatar('');
                      setShowAvatarModal(false);
                      window.dispatchEvent(new Event('avatar-changed'));
                    }}
                    className="px-4 py-2 border border-red-200 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50 transition-all mr-auto cursor-pointer"
                  >
                    Remove Photo
                  </button>
                )}
                <button
                  onClick={() => setShowAvatarModal(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-600 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <StatCard label="Total Exams" value={stats.total_exams} />
            <StatCard label="Upcoming" value={stats.upcoming_exams} />
            <StatCard label="Saved Jobs" value={stats.saved_jobs} />
            <StatCard label="Avg Progress" value={`${stats.avg_progress}%`} />
          </div>

          {loading && <p className="text-center text-slate-500 font-medium py-4">Loading your data...</p>}

          {/* Upcoming exams + deadlines */}
          <div className="grid md:grid-cols-2 gap-6">
            <Panel title="🗓️ Upcoming Exams">
              {data?.upcoming_exams?.length ? (
                <ul className="space-y-3">
                  {data.upcoming_exams.map((e, i) => {
                    const d = daysLeft(e.exam_date)
                    return (
                      <li key={i} className="flex justify-between items-center text-sm p-3.5 wander-bg-gray rounded-xl border border-slate-200/60">
                        <span className="font-bold wander-text-dark">{e.name}</span>
                        <span className="text-slate-500 text-xs font-semibold bg-white/85 px-3 py-1 rounded-full border border-slate-200/60 shadow-sm">
                          {e.exam_date}{d !== null && d >= 0 ? ` · ${d} days left` : ''}
                        </span>
                      </li>
                    )
                  })}
                </ul>
              ) : (
                <Empty text="No upcoming exams. Add one below." />
              )}
            </Panel>

            <Panel title="⏰ Application Deadlines">
              {data?.deadlines?.length ? (
                <ul className="space-y-3">
                  {data.deadlines.map((d, i) => {
                    const left = daysLeft(d.last_date_to_apply)
                    return (
                      <li key={i} className="flex justify-between items-center text-sm p-3.5 wander-bg-gray rounded-xl border border-slate-200/60">
                        <span className="font-bold wander-text-dark">{d.exam}</span>
                        <span className={`text-xs font-bold px-3 py-1 rounded-full border ${left !== null && left <= 7 ? 'bg-red-50 text-red-600 border-red-200' : 'bg-white/85 text-slate-600 border-slate-200/60 shadow-sm'}`}>
                          {d.last_date_to_apply}{left !== null && left >= 0 ? ` (${left}d)` : ''}
                        </span>
                      </li>
                    )
                  })}
                </ul>
              ) : (
                <Empty text="No deadlines set." />
              )}
            </Panel>
          </div>

          {/* Preparation progress + manage exams */}
          <Panel title="📈 Preparation Progress">
            <div className="flex justify-between items-center mb-6">
              <p className="text-xs text-slate-500 font-semibold">Update your syllabus completion status.</p>
              <button
                onClick={() => setShowForm((s) => !s)}
                className="bg-[#0f172a] hover:bg-blue-600 text-white text-xs font-bold px-5 py-2.5 rounded-full shadow-sm hover:shadow-md transition-all cursor-pointer whitespace-nowrap"
              >
                {showForm ? 'Close Form' : '+ Add Exam'}
              </button>
            </div>

            {showForm && (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-600 mb-1 block uppercase tracking-wider">Exam Name *</label>
                    <input className={inputClass} placeholder="e.g. SSC CGL" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-600 mb-1 block uppercase tracking-wider">Category</label>
                    <input className={inputClass} placeholder="e.g. Banking" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-600 mb-1 block uppercase tracking-wider">Exam Date</label>
                    <input type="date" className={inputClass} value={form.exam_date} onChange={(e) => setForm({ ...form, exam_date: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-600 mb-1 block uppercase tracking-wider">Last Date to Apply</label>
                    <input type="date" className={inputClass} value={form.last_date_to_apply} onChange={(e) => setForm({ ...form, last_date_to_apply: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-600 mb-1 block uppercase tracking-wider">Official Link (Optional)</label>
                  <input className={inputClass} placeholder="https://..." value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} />
                </div>
                <button
                  onClick={addExam}
                  className="w-full bg-[#0f172a] hover:bg-blue-600 text-white text-xs font-bold py-3 rounded-xl transition-all shadow-md cursor-pointer"
                >
                  Save Exam Details
                </button>
              </div>
            )}

            {exams.length ? (
              <div className="space-y-6">
                {exams.map((e) => (
                  <div key={e.id} className="p-5 border border-slate-200/80 rounded-2xl wander-bg-gray/50 hover:bg-slate-50 transition-all">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex flex-col">
                        <span className="font-extrabold wander-text-dark text-base">{e.name}</span>
                        {e.category && <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">{e.category}</span>}
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-blue-600 font-bold bg-blue-50 border border-blue-200/50 px-2.5 py-0.5 rounded-full text-xs">{e.progress}% Completed</span>
                        <button onClick={() => deleteExam(e.id)} className="text-red-500 text-xs font-bold hover:text-red-700 transition-colors cursor-pointer">Remove</button>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex-1 bg-slate-200 rounded-full h-2.5 overflow-hidden border border-slate-300/40">
                        <div className="bg-blue-600 h-full rounded-full transition-all duration-500 ease-out" style={{ width: `${e.progress}%` }} />
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={e.progress}
                        onChange={(ev) => updateProgress(e.id, Number(ev.target.value))}
                        className="w-24 md:w-32 accent-blue-600 cursor-pointer"
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Empty text="No exams added yet." />
            )}
          </Panel>

          {/* Saved jobs */}
          <ATSHistoryPanel />
          <Panel title="🔖 Saved Jobs">
            {savedJobs.length ? (
              <div className="grid md:grid-cols-2 gap-4">
                {savedJobs.map((j) => (
                  <div key={j.id} className="border border-slate-200/80 wander-bg-white rounded-2xl p-4 flex justify-between items-start hover:shadow-md transition-shadow">
                    <div>
                      <p className="font-bold wander-text-dark text-sm mb-1">{j.name}</p>
                      {j.description && <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-2">{j.description}</p>}
                      {j.link && <a href={j.link} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"><BrandIcon url={j.link} className="w-3 h-3" /> Visit Link <span aria-hidden="true">&rarr;</span></a>}
                    </div>
                    <button onClick={() => removeSaved(j.id)} className="text-red-500 text-xs font-bold hover:text-red-700 transition-colors cursor-pointer shrink-0 ml-3">Remove</button>
                  </div>
                ))}
              </div>
            ) : (
              <Empty text="Save any job from the Jobs page with 🔖 and it will appear here." />
            )}
          </Panel>
        </div>
      </div>
    </div>
  )
}

// Modernized Sub-components
function StatCard({ label, value }) {
  return (
    <div className="wander-bg-white p-6 rounded-3xl border border-slate-200/80 wander-badge-shadow flex flex-col justify-center transition-all hover:shadow-md">
      <p className="text-3xl md:text-4xl font-extrabold text-blue-600">{value}</p>
      <p className="text-xs font-bold text-slate-400 mt-2 tracking-wider uppercase">{label}</p>
    </div>
  )
}

function Panel({ title, children }) {
  return (
    <div className="wander-bg-white p-6 md:p-8 rounded-3xl border border-slate-200/80 wander-badge-shadow">
      <h2 className="text-xl font-extrabold wander-text-dark mb-6 tracking-tight">{title}</h2>
      {children}
    </div>
  )
}

function Empty({ text }) {
  return (
    <div className="text-center py-8 wander-bg-gray rounded-2xl border border-dashed border-slate-300">
      <p className="text-sm font-semibold text-slate-400">{text}</p>
    </div>
  )
}

export default Dashboard