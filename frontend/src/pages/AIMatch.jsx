import { useState } from 'react'
import API from '../api/axios'
import BrandIcon from '../components/BrandIcon'

const allSkills = [
  'Python', 'JavaScript', 'React', 'Node.js', 'MongoDB', 'SQL',
  'Java', 'C++', 'C#', 'PHP', 'Ruby', 'Swift', 'Kotlin',
  'CSS', 'HTML', 'TypeScript', 'Angular', 'Vue.js', 'Next.js',
  'Django', 'FastAPI', 'Flask', 'Spring Boot', 'Express.js',
  'Machine Learning', 'Deep Learning', 'AI', 'Data Science',
  'Data Analysis', 'Power BI', 'Tableau', 'Excel', 'R',
  'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes',
  'DevOps', 'CI/CD', 'Linux', 'Git', 'Cybersecurity',
  'Figma', 'Adobe XD', 'Photoshop', 'Illustrator', 'UI/UX',
  'Android Development', 'iOS Development', 'Flutter', 'React Native',
  'SEO', 'Digital Marketing', 'Content Writing', 'Accounting', 'Tally',
]

function AIMatch() {
  const [selectedSkills, setSelectedSkills] = useState([])
  const [file, setFile] = useState(null)
  const [results, setResults] = useState([])
  const [externalSources, setExternalSources] = useState([])
  const [detectedSkills, setDetectedSkills] = useState([])
  const [recommendedRoles, setRecommendedRoles] = useState([])
  const [summary, setSummary] = useState('')
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState('skills')
  const [searched, setSearched] = useState(false)

  const toggleSkill = (skill) => {
    setSelectedSkills((prev) =>
      prev.includes(skill)
        ? prev.filter((s) => s !== skill)
        : [...prev, skill]
    )
  }

  const switchMode = (newMode) => {
    setMode(newMode)
    setResults([])
    setExternalSources([])
    setDetectedSkills([])
    setRecommendedRoles([])
    setSummary('')
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
        : await API.post(
            '/ai/match-resume',
            (() => {
              const formData = new FormData()
              formData.append('file', file)
              return formData
            })(),
            {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            }
          )

      setResults(response.data?.matched_jobs || [])
      setExternalSources(response.data?.external_sources || [])
      setDetectedSkills(response.data?.detected_skills || [])
      setRecommendedRoles(response.data?.recommended_roles || [])
      setSummary(response.data?.summary || '')
      setSearched(true)
    } catch (error) {
      console.error('AI match error:', error)
      const detail = error.response?.data?.detail
      alert(detail || 'AI matching failed. Is the backend running? Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6">
      <h1 className="text-4xl font-bold text-center text-blue-600 mb-2">AI External Job Match</h1>
      <p className="text-center text-gray-500 mb-8">
        Let AI turn your skills or resume into live job searches across external platforms.
      </p>

      <div className="max-w-2xl mx-auto flex gap-4 mb-8">
        <button
          onClick={() => switchMode('skills')}
          className={`flex-1 py-2 rounded-lg font-semibold ${mode === 'skills' ? 'neon-btn' : 'neon-outline'}`}
        >
          Match from Skills
        </button>
        <button
          onClick={() => switchMode('resume')}
          className={`flex-1 py-2 rounded-lg font-semibold ${mode === 'resume' ? 'neon-btn' : 'neon-outline'}`}
        >
          Match from Resume
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
            <h2 className="text-xl font-bold mb-4">Upload Resume (PDF)</h2>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
            />
            {file && <p className="text-green-600 mt-2 text-sm">{file.name} selected</p>}
          </>
        )}

        <button
          onClick={handleMatch}
          disabled={loading}
          className="w-full mt-4 neon-btn"
        >
          {loading ? 'Building live searches...' : 'Find External Jobs'}
        </button>
      </div>

      {searched && (
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="bg-white rounded-xl shadow p-5">
            <h2 className="text-xl font-bold mb-3">AI Summary</h2>
            <p className="text-gray-600 text-sm mb-4">
              {summary || 'AI mapped your profile to external job platforms and search queries.'}
            </p>

            {detectedSkills.length > 0 && (
              <>
                <h3 className="text-sm font-bold uppercase tracking-wide text-blue-600 mb-2">Detected Skills</h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  {detectedSkills.map((skill) => (
                    <span key={skill} className="text-xs bg-blue-50 border border-blue-300 text-blue-700 rounded-full px-3 py-1">
                      {skill}
                    </span>
                  ))}
                </div>
              </>
            )}

            {recommendedRoles.length > 0 && (
              <>
                <h3 className="text-sm font-bold uppercase tracking-wide text-green-600 mb-2">Recommended Search Roles</h3>
                <div className="flex flex-wrap gap-2">
                  {recommendedRoles.map((role) => (
                    <span key={role} className="text-xs bg-green-50 border border-green-300 text-green-700 rounded-full px-3 py-1">
                      {role}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>

          {results.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-700 mb-4">AI Recommended External Searches</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {results.map((job, i) => (
                  <div key={`${job.title}-${job.source_site}-${i}`} className="bg-white p-5 rounded-xl shadow">
                    <div className="flex justify-between items-start gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-blue-500 font-semibold mb-2 flex items-center">
                          <BrandIcon url={job.url} name={job.source_site} className="w-4 h-4 mr-1.5" />
                          {job.source_site}
                        </p>
                        <h3 className="text-lg font-bold">{job.title}</h3>
                        <p className="text-gray-500 text-sm">{job.location}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-green-600 font-bold text-xl">{job.match_percent}%</span>
                        <p className="text-gray-400 text-xs">Match</p>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm mt-3">{job.reason}</p>
                    <p className="text-gray-400 text-xs mt-2">Search query: {job.query}</p>
                    <a
                      href={job.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-4 neon-btn px-4 py-2 text-sm"
                    >
                      Open Live Search
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {externalSources.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-700 mb-1">Quick Platform Links</h2>
              <p className="text-gray-500 text-sm mb-4">
                These links open the same keywords directly on major external job platforms.
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                {externalSources.map((src) => (
                  <a
                    key={src.site}
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 bg-white p-4 rounded-xl shadow hover:shadow-lg hover:-translate-y-0.5 transition border border-gray-100"
                  >
                    <span className="text-xs font-bold text-blue-600 bg-slate-100 p-2 rounded-full flex items-center justify-center">
                      <BrandIcon url={src.url} name={src.site} className="w-6 h-6" />
                    </span>
                    <div className="min-w-0">
                      <p className="font-bold text-gray-800">{src.site}</p>
                      <p className="text-gray-400 text-xs truncate">Search: {src.query}</p>
                    </div>
                    <span className="ml-auto text-blue-500 font-bold shrink-0">Open</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {!loading && results.length === 0 && externalSources.length === 0 && (
            <div className="bg-white p-8 rounded-xl shadow text-center">
              <h2 className="text-xl font-bold text-gray-700 mb-2">No external searches generated</h2>
              <p className="text-gray-500 text-sm">
                Try adding more specific skills or upload a clearer resume.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default AIMatch
