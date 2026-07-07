import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import API from '../api/axios'

const STATUS_OPTIONS = ['Applied', 'Interview', 'Selected', 'Rejected']

const statusStyle = {
  Applied: 'bg-blue-100 text-blue-700 border-blue-300',
  Interview: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  Selected: 'bg-green-100 text-green-700 border-green-300',
  Rejected: 'bg-red-100 text-red-700 border-red-300',
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
      alert('Company ka naam daalein.')
      return
    }
    try {
      await API.post('/applications', form)
      setForm({ ...emptyForm })
      setShowForm(false)
      load()
    } catch (error) {
      console.error('Add application error:', error)
      alert('Application add nahi hui. Dobara try karein.')
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
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6 text-center">
        <h1 className="text-3xl font-bold text-blue-600 mb-3">📋 Application Tracker</h1>
        <p className="text-gray-500 mb-6">Apni applications track karne ke liye login karein.</p>
        <Link to="/login" className="neon-btn">Login karo</Link>
      </div>
    )
  }

  const inputClass = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400'
  const visible = filter === 'All' ? applications : applications.filter((a) => a.status === filter)

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6">
      <h1 className="text-4xl font-bold text-center text-blue-600 mb-2">📋 Application Tracker</h1>
      <p className="text-center text-gray-500 mb-8">Har job application ka status ek jagah track karo</p>

      <div className="max-w-5xl mx-auto space-y-8">
        {/* Stats */}
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

        {/* Add form */}
        <div className="bg-white p-6 rounded-xl shadow">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-bold">Applications {filter !== 'All' && <span className="text-sm font-normal text-gray-400">· {filter}</span>}</h2>
            <button onClick={() => setShowForm((s) => !s)} className="neon-outline text-sm px-3 py-1 rounded-lg">
              {showForm ? 'Cancel' : '+ Add Application'}
            </button>
          </div>

          {showForm && (
            <div className="border border-gray-200 rounded-lg p-4 mb-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input className={inputClass} placeholder="Company *" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
                <input className={inputClass} placeholder="Role / Post" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
                <label className="text-xs text-gray-500">Status
                  <select className={inputClass} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </label>
                <label className="text-xs text-gray-500">Applied date
                  <input type="date" className={inputClass} value={form.applied_date} onChange={(e) => setForm({ ...form, applied_date: e.target.value })} />
                </label>
              </div>
              <input className={inputClass} placeholder="Job link (optional)" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} />
              <textarea className={inputClass} rows={2} placeholder="Notes (interview date, contact person...)" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              <button onClick={addApplication} className="neon-btn w-full">Save Application</button>
            </div>
          )}

          {loading && <p className="text-center text-gray-400">Loading...</p>}

          {!loading && visible.length ? (
            <div className="space-y-3">
              {visible.map((a) => (
                <div key={a.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold">{a.company}{a.role && <span className="text-gray-500 font-normal"> — {a.role}</span>}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {a.applied_date ? `Applied: ${a.applied_date}` : 'Date not set'}
                      </p>
                      {a.notes && <p className="text-sm text-gray-600 mt-1">{a.notes}</p>}
                      {a.link && <a href={a.link} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline">Job link →</a>}
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <select
                        value={a.status}
                        onChange={(e) => changeStatus(a.id, e.target.value)}
                        className={`text-xs font-semibold border rounded-full px-3 py-1 focus:outline-none ${statusStyle[a.status] || ''}`}
                      >
                        {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <button onClick={() => deleteApplication(a.id)} className="text-red-500 text-xs hover:underline">Remove</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            !loading && (
              <p className="text-sm text-gray-400">
                {filter === 'All'
                  ? 'Abhi tak koi application add nahi ki. "+ Add Application" se shuru karo.'
                  : `Koi application "${filter}" status me nahi hai.`}
              </p>
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
      className={`p-4 rounded-xl shadow text-center transition ${active ? 'bg-blue-600 text-white' : 'bg-white hover:shadow-md'}`}
    >
      <p className={`text-2xl font-bold ${active ? 'text-white' : 'text-blue-600'}`}>{value}</p>
      <p className={`text-xs mt-1 ${active ? 'text-white/90' : 'text-gray-500'}`}>{label}</p>
    </button>
  )
}

export default ApplicationTracker
