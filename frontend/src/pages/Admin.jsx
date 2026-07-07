import { useState, useEffect } from 'react'
import API from '../api/axios'

function Admin() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title: '', company: '', location: '', description: '', skills: ''
  })

  // Saari jobs fetch karo
  const fetchJobs = async () => {
    try {
      const res = await API.get('/jobs/')
      setJobs(res.data)
    } catch (err) {
      console.error('Jobs fetch error:', err)
    }
  }

  useEffect(() => {
    fetchJobs()
  }, [])

  // Nayi job add karo
  const handleAdd = async () => {
    if (!form.title || !form.company) {
      alert('Title aur Company zaroori hai!')
      return
    }
    setLoading(true)
    try {
      await API.post('/jobs/', {
        title: form.title,
        company: form.company,
        location: form.location,
        description: form.description,
        required_skills: form.skills.split(',').map(s => s.trim())
      })
      alert('Job added successfully!')
      setForm({ title: '', company: '', location: '', description: '', skills: '' })
      fetchJobs()
    } catch (err) {
      alert(err.response?.data?.detail || 'Job add karne mein error aaya!')
    } finally {
      setLoading(false)
    }
  }

  // Job delete karo
  const handleDelete = async (id) => {
    if (!window.confirm('Job delete karna chahte ho?')) return
    try {
      await API.delete(`/jobs/${id}`)
      alert('Job deleted!')
      fetchJobs()
    } catch (err) {
      alert(err.response?.data?.detail || 'Delete karne mein error aaya!')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6">
      <h1 className="text-4xl font-bold text-center mb-8">ADMIN PORTAL</h1>

      {/* Add Job Form */}
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl card-strong mb-10">
        <h2 className="text-2xl font-bold mb-4">âž• ADD NEW JOB</h2>

        <div className="mb-3">
          <label className="block text-gray-700 mb-1">Job Title</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="e.g. Python Developer"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </div>

        <div className="mb-3">
          <label className="block text-gray-700 mb-1">Company</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="e.g. TechCorp"
            value={form.company}
            onChange={(e) => setForm({ ...form, company: e.target.value })}
          />
        </div>

        <div className="mb-3">
          <label className="block text-gray-700 mb-1">Location</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="e.g. Delhi"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
          />
        </div>

        <div className="mb-3">
          <label className="block text-gray-700 mb-1">Description</label>
          <textarea
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Job description likho"
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-1">Required Skills (comma separated)</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="e.g. Python, Django, SQL"
            value={form.skills}
            onChange={(e) => setForm({ ...form, skills: e.target.value })}
          />
        </div>

        <button
          onClick={handleAdd}
          disabled={loading}
          className="w-full neon-btn"
        >
          {loading ? 'Adding...' : 'âž• Job Add Karo'}
        </button>
      </div>

      {/* Jobs List */}
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">ðŸ“‹ Current Jobs ({jobs.length})</h2>
        {jobs.length === 0 ? (
          <p className="text-gray-500 text-center">No jobs for now!</p>
        ) : (
          <div className="flex flex-col gap-4">
            {jobs.map((job) => (
              <div key={job.id} className="bg-white p-5 rounded-xl card-strong flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold">{job.title}</h3>
                  <p className="text-gray-500 text-sm">{job.company} â€” {job.location}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {job.required_skills.map((skill, i) => (
                      <span key={i} className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(job.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Admin
