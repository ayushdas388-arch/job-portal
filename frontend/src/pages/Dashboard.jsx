import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import API from '../api/axios'
import BrandIcon from '../components/BrandIcon'

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
      alert('Enter the exam name.')
      return
    }
    try {
      await API.post('/dashboard/exams', { ...form, progress: Number(form.progress) || 0 })
      setForm({ ...emptyExam })
      setShowForm(false)
      load()
    } catch (error) {
      console.error('Add exam error:', error)
      alert('Exam could not be added. Please try again.')
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
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h1 className="text-3xl font-bold text-slate-900 mb-3">📊 Dashboard</h1>
        <p className="text-slate-500 mb-6">Login to view the dashboard.</p>
        <Link to="/login" className="neon-btn">Login</Link>
      </div>
    )
  }

  const stats = data?.stats || { total_exams: 0, upcoming_exams: 0, saved_jobs: 0, avg_progress: 0 }
  // Modern input classes
  const inputClass = 'w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 transition-all bg-slate-50/50'

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
        <p className="text-slate-500 mt-1">Welcome back, {name}! Track your preparation here.</p>
      </div>

      <div className="space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <StatCard label="Total Exams" value={stats.total_exams} />
          <StatCard label="Upcoming" value={stats.upcoming_exams} />
          <StatCard label="Saved Jobs" value={stats.saved_jobs} />
          <StatCard label="Avg Progress" value={`${stats.avg_progress}%`} />
        </div>

        {loading && <p className="text-center text-slate-400 font-medium py-4">Loading your data...</p>}

        {/* Upcoming exams + deadlines */}
        <div className="grid md:grid-cols-2 gap-6">
          <Panel title="🗓️ Upcoming Exams">
            {data?.upcoming_exams?.length ? (
              <ul className="space-y-3">
                {data.upcoming_exams.map((e, i) => {
                  const d = daysLeft(e.exam_date)
                  return (
                    <li key={i} className="flex justify-between items-center text-sm p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <span className="font-semibold text-slate-800">{e.name}</span>
                      <span className="text-slate-500 text-xs font-medium">
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
                    <li key={i} className="flex justify-between items-center text-sm p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <span className="font-semibold text-slate-800">{d.exam}</span>
                      <span className={`text-xs font-bold px-2 py-1 rounded-md ${left !== null && left <= 7 ? 'bg-red-50 text-red-600' : 'bg-slate-200 text-slate-600'}`}>
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
            <p className="text-sm text-slate-500">Update your syllabus completion status.</p>
            <button onClick={() => setShowForm((s) => !s)} className="neon-outline text-sm px-4 py-2">
              {showForm ? 'Close Form' : '+ Add Exam'}
            </button>
          </div>

          {showForm && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 mb-1 block uppercase tracking-wider">Exam Name *</label>
                  <input className={inputClass} placeholder="e.g. SSC CGL" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 mb-1 block uppercase tracking-wider">Category</label>
                  <input className={inputClass} placeholder="e.g. Banking" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 mb-1 block uppercase tracking-wider">Exam Date</label>
                  <input type="date" className={inputClass} value={form.exam_date} onChange={(e) => setForm({ ...form, exam_date: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 mb-1 block uppercase tracking-wider">Last Date to Apply</label>
                  <input type="date" className={inputClass} value={form.last_date_to_apply} onChange={(e) => setForm({ ...form, last_date_to_apply: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 mb-1 block uppercase tracking-wider">Official Link (Optional)</label>
                <input className={inputClass} placeholder="https://..." value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} />
              </div>
              <button onClick={addExam} className="neon-btn w-full py-3">Save Exam Details</button>
            </div>
          )}

          {exams.length ? (
            <div className="space-y-6">
              {exams.map((e) => (
                <div key={e.id} className="p-4 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-800 text-base">{e.name}</span>
                      {e.category && <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">{e.category}</span>}
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-indigo-600 font-bold bg-indigo-50 px-2 py-1 rounded-md text-sm">{e.progress}%</span>
                      <button onClick={() => deleteExam(e.id)} className="text-red-500 text-xs font-semibold hover:underline">Remove</button>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 bg-slate-200 rounded-full h-3 overflow-hidden">
                      <div className="bg-indigo-500 h-full rounded-full transition-all duration-500 ease-out" style={{ width: `${e.progress}%` }} />
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={e.progress}
                      onChange={(ev) => updateProgress(e.id, Number(ev.target.value))}
                      className="w-24 md:w-32 accent-indigo-600 cursor-pointer"
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
        <Panel title="🔖 Saved Jobs">
          {savedJobs.length ? (
            <div className="grid md:grid-cols-2 gap-4">
              {savedJobs.map((j) => (
                <div key={j.id} className="border border-slate-200 rounded-xl p-4 flex justify-between items-start hover:shadow-md transition-shadow bg-white">
                  <div>
                    <p className="font-bold text-slate-800 text-sm mb-1">{j.name}</p>
                    {j.description && <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-2">{j.description}</p>}
                    {j.link && <a href={j.link} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"><BrandIcon url={j.link} className="w-3 h-3" /> Visit Link <span aria-hidden="true">&rarr;</span></a>}
                  </div>
                  <button onClick={() => removeSaved(j.id)} className="text-red-500 text-xs font-semibold hover:underline shrink-0 ml-3">Remove</button>
                </div>
              ))}
            </div>
          ) : (
            <Empty text="Save any job from the Jobs page with 🔖 and it will appear here." />
          )}
        </Panel>
      </div>
    </div>
  )
}

// Modernized Sub-components
function StatCard({ label, value }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center transition-all hover:shadow-md">
      <p className="text-3xl md:text-4xl font-extrabold text-indigo-600">{value}</p>
      <p className="text-sm font-semibold text-slate-500 mt-2 tracking-wide">{label}</p>
    </div>
  )
}

function Panel({ title, children }) {
  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm">
      <h2 className="text-xl font-bold text-slate-800 mb-6">{title}</h2>
      {children}
    </div>
  )
}

function Empty({ text }) {
  return (
    <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-300">
      <p className="text-sm font-medium text-slate-500">{text}</p>
    </div>
  )
}

export default Dashboard