import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import API from '../api/axios'

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
      alert('Exam ka naam daalein.')
      return
    }
    try {
      await API.post('/dashboard/exams', { ...form, progress: Number(form.progress) || 0 })
      setForm({ ...emptyExam })
      setShowForm(false)
      load()
    } catch (error) {
      console.error('Add exam error:', error)
      alert('Exam add nahi hua. Dobara try karein.')
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
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6 text-center">
        <h1 className="text-3xl font-bold text-blue-600 mb-3">📊 Dashboard</h1>
        <p className="text-gray-500 mb-6">Dashboard dekhne ke liye login karein.</p>
        <Link to="/login" className="neon-btn">Login karo</Link>
      </div>
    )
  }

  const stats = data?.stats || { total_exams: 0, upcoming_exams: 0, saved_jobs: 0, avg_progress: 0 }
  const inputClass = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400'

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6">
      <h1 className="text-4xl font-bold text-center text-blue-600 mb-2">📊 Dashboard</h1>
      <p className="text-center text-gray-500 mb-8">Hi {name}! Yahan apni tayari track karo.</p>

      <div className="max-w-5xl mx-auto space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Exams" value={stats.total_exams} />
          <StatCard label="Upcoming" value={stats.upcoming_exams} />
          <StatCard label="Saved Jobs" value={stats.saved_jobs} />
          <StatCard label="Avg Progress" value={`${stats.avg_progress}%`} />
        </div>

        {loading && <p className="text-center text-gray-400">Loading...</p>}

        {/* Upcoming exams + deadlines */}
        <div className="grid md:grid-cols-2 gap-6">
          <Panel title="🗓️ Upcoming Exams">
            {data?.upcoming_exams?.length ? (
              <ul className="space-y-2">
                {data.upcoming_exams.map((e, i) => {
                  const d = daysLeft(e.exam_date)
                  return (
                    <li key={i} className="flex justify-between items-center text-sm">
                      <span className="font-medium">{e.name}</span>
                      <span className="text-gray-500">
                        {e.exam_date}{d !== null && d >= 0 ? ` · ${d} din baaki` : ''}
                      </span>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <Empty text="Koi upcoming exam nahi. Neeche se add karo." />
            )}
          </Panel>

          <Panel title="⏰ Application Deadlines">
            {data?.deadlines?.length ? (
              <ul className="space-y-2">
                {data.deadlines.map((d, i) => {
                  const left = daysLeft(d.last_date_to_apply)
                  return (
                    <li key={i} className="flex justify-between items-center text-sm">
                      <span className="font-medium">{d.exam}</span>
                      <span className={left !== null && left <= 7 ? 'text-red-500 font-semibold' : 'text-gray-500'}>
                        {d.last_date_to_apply}{left !== null && left >= 0 ? ` · ${left} din` : ''}
                      </span>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <Empty text="Koi deadline set nahi hai." />
            )}
          </Panel>
        </div>

        {/* Preparation progress + manage exams */}
        <Panel title="📈 Preparation Progress">
          <div className="flex justify-end mb-3">
            <button onClick={() => setShowForm((s) => !s)} className="neon-outline text-sm px-3 py-1 rounded-lg">
              {showForm ? 'Cancel' : '+ Add Exam'}
            </button>
          </div>

          {showForm && (
            <div className="border border-gray-200 rounded-lg p-4 mb-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input className={inputClass} placeholder="Exam name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                <input className={inputClass} placeholder="Category (SSC, Banking...)" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
                <label className="text-xs text-gray-500">Exam date
                  <input type="date" className={inputClass} value={form.exam_date} onChange={(e) => setForm({ ...form, exam_date: e.target.value })} />
                </label>
                <label className="text-xs text-gray-500">Last date to apply
                  <input type="date" className={inputClass} value={form.last_date_to_apply} onChange={(e) => setForm({ ...form, last_date_to_apply: e.target.value })} />
                </label>
              </div>
              <input className={inputClass} placeholder="Official link (optional)" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} />
              <button onClick={addExam} className="neon-btn w-full">Save Exam</button>
            </div>
          )}

          {exams.length ? (
            <div className="space-y-4">
              {exams.map((e) => (
                <div key={e.id}>
                  <div className="flex justify-between items-center mb-1 text-sm">
                    <span className="font-medium">{e.name} {e.category && <span className="text-gray-400">· {e.category}</span>}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-gray-500">{e.progress}%</span>
                      <button onClick={() => deleteExam(e.id)} className="text-red-500 text-xs hover:underline">Remove</button>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-gray-200 rounded-full h-2.5">
                      <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: `${e.progress}%` }} />
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={e.progress}
                      onChange={(ev) => updateProgress(e.id, Number(ev.target.value))}
                      className="w-32"
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Empty text="Abhi tak koi exam add nahi kiya." />
          )}
        </Panel>

        {/* Saved jobs */}
        <Panel title="🔖 Saved Jobs">
          {savedJobs.length ? (
            <div className="grid md:grid-cols-2 gap-3">
              {savedJobs.map((j) => (
                <div key={j.id} className="border border-gray-200 rounded-lg p-3 flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-sm">{j.name}</p>
                    {j.description && <p className="text-xs text-gray-500">{j.description}</p>}
                    {j.link && <a href={j.link} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline">Visit →</a>}
                  </div>
                  <button onClick={() => removeSaved(j.id)} className="text-red-500 text-xs hover:underline">Remove</button>
                </div>
              ))}
            </div>
          ) : (
            <Empty text="Jobs page se koi bhi portal 🔖 Save karo, yahan dikhega." />
          )}
        </Panel>
      </div>
    </div>
  )
}

function StatCard({ label, value }) {
  return (
    <div className="bg-white p-5 rounded-xl shadow text-center">
      <p className="text-3xl font-bold text-blue-600">{value}</p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
    </div>
  )
}

function Panel({ title, children }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      {children}
    </div>
  )
}

function Empty({ text }) {
  return <p className="text-sm text-gray-400">{text}</p>
}

export default Dashboard
