import {useState} from 'react'
import API from '../api/axios'
const allSkills = [
  // Tech Skills
  "Python", "JavaScript", "React", "Node.js", "MongoDB", "SQL",
  "Java", "C++", "C#", "PHP", "Ruby", "Swift", "Kotlin",
  "CSS", "HTML", "TypeScript", "Angular", "Vue.js", "Next.js",
  "Django", "FastAPI", "Flask", "Spring Boot", "Express.js",
  "Machine Learning", "Deep Learning", "AI", "Data Science",
  "Data Analysis", "Power BI", "Tableau", "Excel", "R",
  "AWS", "Azure", "Google Cloud", "Docker", "Kubernetes",
  "DevOps", "CI/CD", "Linux", "Git", "Cybersecurity",
  "Blockchain", "Web3", "Solidity", "Unity", "Unreal Engine",
  "Figma", "Adobe XD", "Photoshop", "Illustrator", "UI/UX",
  "Android Development", "iOS Development", "Flutter", "React Native",
  "SEO", "Digital Marketing", "Content Writing", "Copywriting",
  "Graphic Design", "Video Editing", "After Effects", "Premiere Pro",

  // Business Skills
  "Accounting", "Tally", "GST", "Finance", "Banking",
  "Marketing", "Sales", "Business Development", "CRM",
  "HR Management", "Recruitment", "Payroll", "Leadership",
  "Project Management", "Agile", "Scrum", "Product Management",
  "Communication", "Public Speaking", "Presentation",
  "Customer Service", "Operations", "Supply Chain", "Logistics",

  // Government Exam Skills
  "General Knowledge", "Current Affairs", "Reasoning",
  "Quantitative Aptitude", "English Grammar", "Hindi",
  "UPSC Preparation", "SSC Preparation", "Banking Preparation",
  "Teaching", "NTT", "B.Ed", "CTET",

  // Other Skills
  "Typing", "MS Office", "Tally ERP", "AutoCAD",
  "Electrical", "Mechanical", "Civil Engineering",
  "Nursing", "Pharmacy", "Medical Coding",
  "Legal", "Law", "Paralegal",
  "Photography", "Journalism", "Media",
]

function AIMatch() {
  const [selectedSkills, setSelectedSkills] = useState([])
  const [file, setFile] = useState(null)
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState('skills')
  const [searched, setSearched] = useState(false)

  const toggleSkill = (skill) => {
    setSelectedSkills(prev =>
      prev.includes(skill)
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    )
  }

  const switchMode = (newMode) => {
    setMode(newMode)
    setResults([])
    setSearched(false)
  }

  const handleMatch = async () => {
    if (mode === 'skills' && selectedSkills.length === 0) {
      alert('Please select at least one skill.')
      return
    }

    if (mode === 'resume' && !file) {
      alert('Please upload a resume PDF.')
      return
    }

    setLoading(true)
    try {
      const response = mode === 'skills'
        ? await API.post('/ai/match-skills', selectedSkills)
        : await API.post('/ai/match-resume', (() => {
            const formData = new FormData()
            formData.append('file', file)
            return formData
          })(), {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          })

      const jobs = response.data?.matched_jobs || []
      const mapped = jobs.map((job) => ({
        title: job.title,
        company: job.company || '',
        location: job.location || '',
        match: job.match_percent ?? job.match ?? 0,
        reason: job.reason || ''
      }))
      setResults(mapped)
      setSearched(true)
    } catch (error) {
      console.error('AI match error:', error)
      const detail = error.response?.data?.detail
      alert(detail || 'AI matching failed. Backend chal raha hai? Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6">
      <h1 className="text-4xl font-bold text-center text-blue-600 mb-2">🤖 AI Job Match</h1>
      <p className="text-center text-gray-500 mb-8">Select Skills or Upload Resume</p>

      {/* Mode Toggle */}
      <div className="max-w-2xl mx-auto flex gap-4 mb-8">
        <button
          onClick={() => switchMode('skills')}
          className={`flex-1 py-2 rounded-lg font-semibold ${mode === 'skills' ? 'neon-btn' : 'neon-outline'}`}
        >
          Skills Select karo
        </button>
        <button
          onClick={() => switchMode('resume')}
          className={`flex-1 py-2 rounded-lg font-semibold ${mode === 'resume' ? 'neon-btn' : 'neon-outline'}`}
        >
          Resume Upload karo
        </button>
      </div>

      <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow mb-8">
        {mode === 'skills' ? (
          <>
            <h2 className="text-xl font-bold mb-4">Select Your Skills</h2>
            <div className="flex flex-wrap gap-2 mb-4">
              {allSkills.map((skill) => (
                <button
                  key={skill}
                  onClick={() => toggleSkill(skill)}
                  className={`px-3 py-1 rounded-full text-sm font-medium border ${
                    selectedSkills.includes(skill)
                      ? 'neon-btn'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
            {selectedSkills.length > 0 && (
              <p className="text-sm text-gray-500 mb-2">Selected: {selectedSkills.join(', ')}</p>
            )}
          </>
        ) : (
          <>
            <h2 className="text-xl font-bold mb-4">UPLOAD RESUME (PDF)</h2>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
            />
            {file && <p className="text-green-600 mt-2 text-sm">✅ {file.name} selected</p>}
          </>
        )}

        <button
          onClick={handleMatch}
          disabled={loading}
          className="w-full mt-4 neon-btn"
        >
          {loading ? '🔍 Matching...' : '🚀 Find Matching Jobs'}
        </button>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-700 mb-4">✅ Matched Jobs ({results.length})</h2>
          <div className="flex flex-col gap-4">
            {results.map((job, i) => (
              <div key={i} className="bg-white p-5 rounded-xl shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold">{job.title}</h3>
                    <p className="text-gray-500 text-sm">{job.company} — {job.location}</p>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <span className="text-green-600 font-bold text-xl">{job.match}%</span>
                    <p className="text-gray-400 text-xs">Match</p>
                  </div>
                </div>
                {job.reason && (
                  <p className="text-gray-600 text-sm mt-3 border-t pt-3">💡 {job.reason}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state — searched but nothing matched */}
      {searched && !loading && results.length === 0 && (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow text-center">
          <p className="text-5xl mb-3">🔍</p>
          <h2 className="text-xl font-bold text-gray-700 mb-2">Koi matching job nahi mili</h2>
          <p className="text-gray-500 text-sm">
            {mode === 'skills'
              ? 'Aapki selected skills kisi bhi available job se match nahi hui. Alag skills try karo, ya abhi kam jobs posted hain — baad me dobara dekho.'
              : 'Resume se koi match nahi mila. Abhi kam jobs posted hain — baad me dobara try karo.'}
          </p>
        </div>
      )}
    </div>
  )
}

export default AIMatch