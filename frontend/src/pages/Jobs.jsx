import { useState } from 'react'
import API from '../api/axios'

const govtJobs = [
  {
    name: "SSC (Staff Selection Commission)",
    description: "SSC CGL, CHSL, MTS aur baaki exams ke liye",
    link: "https://ssc.gov.in",
    color: "bg-orange-100 border-orange-400"
  },
  {
    name: "UPSC (Union Public Service Commission)",
    description: "IAS, IPS, Civil Services aur baaki exams",
    link: "https://upsc.gov.in",
    color: "bg-blue-100 border-blue-400"
  },
  {
    name: "Indian Railways (RRB)",
    description: "Railway jobs — Group D, NTPC, ALP etc.",
    link: "https://indianrailways.gov.in",
    link: "https://rrbapply.gov.in",
    color: "bg-green-100 border-green-400"
  },
  {
    name: "IBPS (Banking Jobs)",
    description: "Bank PO, Clerk, SO ke liye",
    link: "https://ibps.in",
    color: "bg-purple-100 border-purple-400"
  },
  {
    name: "NCS (National Career Service)",
    description: "Govt aur private dono jobs ek jagah",
    link: "https://www.ncs.gov.in",
    color: "bg-red-100 border-red-400"
  },
  {
    name: "UPPSC (UP State Jobs)",
    description: "Uttar Pradesh state government jobs",
    link: "https://uppsc.up.nic.in",
    color: "bg-yellow-100 border-yellow-400"
  },
  {
    name: "DSSSB (Delhi Jobs)",
    description: "Delhi state government jobs",
    link: "https://dsssb.delhi.gov.in",
    color: "bg-pink-100 border-pink-400"
  },
  {
    name: "MPSC (Maharashtra Jobs)",
    description: "Maharashtra state government jobs",
    link: "https://mpsc.gov.in",
    color: "bg-teal-100 border-teal-400"
  },
]

const privateJobs = [
  {
    name: "LinkedIn",
    description: "India ka sabse bada professional network",
    link: "https://linkedin.com/jobs",
    color: "bg-blue-100 border-blue-600"
  },
  {
    name: "Naukri.com",
    description: "India ka #1 job portal",
    link: "https://naukri.com",
    color: "bg-orange-100 border-orange-500"
  },
  {
    name: "Indeed",
    description: "Worldwide jobs — IT, sales, marketing etc.",
    link: "https://indeed.com",
    color: "bg-indigo-100 border-indigo-400"
  },
  {
    name: "Internshala",
    description: "Internships aur fresher jobs",
    link: "https://internshala.com",
    color: "bg-green-100 border-green-500"
  },
  {
    name: "Shine.com",
    description: "IT aur non-IT private jobs",
    link: "https://shine.com",
    color: "bg-yellow-100 border-yellow-500"
  },
  {
    name: "Glassdoor",
    description: "Jobs + company reviews + salary info",
    link: "https://glassdoor.co.in",
    color: "bg-green-100 border-green-600"
  },
  {
    name: "Foundit (Monster)",
    description: "Tech aur management jobs",
    link: "https://foundit.in",
    color: "bg-purple-100 border-purple-500"
  },
  {
    name: "Freshersworld",
    description: "Freshers ke liye entry level jobs",
    link: "https://freshersworld.com",
    color: "bg-red-100 border-red-400"
  },
  {
    name: "AngelList (Wellfound)",
    description: "Startup jobs aur remote jobs",
    link: "https://wellfound.com",
    color: "bg-gray-100 border-gray-500"
  },
  {
    name: "Instahyre",
    description: "AI based job matching platform",
    link: "https://instahyre.com",
    color: "bg-pink-100 border-pink-500"
  },
]

function Jobs() {
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState('govt')
  const [saved, setSaved] = useState([])

  const handleSave = async (job, category) => {
    if (!localStorage.getItem('token')) {
      alert('Save karne ke liye pehle login karein.')
      return
    }
    try {
      await API.post('/dashboard/saved-jobs', {
        name: job.name,
        description: job.description,
        link: job.link,
        category,
      })
      setSaved((prev) => [...prev, job.name])
    } catch (error) {
      console.error('Save job error:', error)
      alert('Save nahi hua. Dobara try karein.')
    }
  }

  const filteredGovt = govtJobs.filter(job =>
    job.name.toLowerCase().includes(search.toLowerCase())
  )

  const filteredPrivate = privateJobs.filter(job =>
    job.name.toLowerCase().includes(search.toLowerCase())
  )

  const renderCards = (list, category) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {list.map((job, index) => {
        const isSaved = saved.includes(job.name)
        return (
          <div key={index} className={`border-l-4 ${job.color} p-6 rounded-xl shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition`}>
            <h3 className="text-lg font-bold mb-1">{job.name}</h3>
            <p className="text-gray-600 text-sm mb-3">{job.description}</p>
            <div className="flex gap-2 items-center">
              <a
                href={job.link}
                target="_blank"
                rel="noopener noreferrer"
                className="neon-btn px-4 py-2 text-sm inline-block"
              >
                Official Website →
              </a>
              <button
                onClick={() => handleSave(job, category)}
                disabled={isSaved}
                className="neon-outline px-3 py-2 text-sm rounded-lg disabled:opacity-60"
              >
                {isSaved ? '✅ Saved' : '🔖 Save'}
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6">
      <h1 className="text-4xl font-bold text-center text-blue-600 mb-2">Job Listings</h1>
      <p className="text-center text-gray-500 mb-8">Government aur Private portals ke direct links</p>

      {/* Search */}
      <div className="max-w-xl mx-auto mb-8">
        <input
          type="text"
          placeholder="Search jobs..."
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Tabs */}
      <div className="max-w-4xl mx-auto mb-8 flex gap-4">
        <button
          onClick={() => setTab('govt')}
          className={`px-6 py-2 rounded-lg font-semibold ${tab === 'govt' ? 'bg-blue-600 text-white' : 'bg-white border border-blue-600 text-blue-600'}`}
        >
          🏛️ Government Jobs
        </button>
        <button
          onClick={() => setTab('private')}
          className={`px-6 py-2 rounded-lg font-semibold ${tab === 'private' ? 'bg-blue-600 text-white' : 'bg-white border border-blue-600 text-blue-600'}`}
        >
          💼 Private Jobs
        </button>
      </div>

      {/* Cards */}
      <div className="max-w-4xl mx-auto">
        {tab === 'govt' ? renderCards(filteredGovt, 'Government') : renderCards(filteredPrivate, 'Private')}
      </div>
    </div>
  )
}

export default Jobs