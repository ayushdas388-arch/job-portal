import { useState, useRef, useEffect } from 'react'
import API from '../api/axios'
import BrandIcon from '../components/BrandIcon'
import { toast } from 'react-toastify'

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
  const [expandedReasons, setExpandedReasons] = useState([])

  // Search autocomplete state
  const [searchQuery, setSearchQuery] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

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
    setFile(null)
    setSelectedSkills([])
    setExpandedReasons([])
  }

  const toggleReason = (idx) => {
    setExpandedReasons((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    )
  }

  const handleMatch = async () => {
    if (mode === 'skills' && selectedSkills.length === 0) {
      toast.error('Please select at least one skill.')
      return
    }

    if (mode === 'resume' && !file) {
      toast.error('Please upload a resume PDF.')
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
      console.error('Matching failed:', error)
      const detail = error.response?.data?.detail
      toast.error(detail || 'Matching failed. Is the backend running? Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const filteredSkills = allSkills.filter(skill =>
    skill.toLowerCase().includes(searchQuery.toLowerCase()) &&
    !selectedSkills.includes(skill)
  )

  return (
    <div className="wander-light-theme min-h-screen p-4 md:p-8 md:pl-24 flex flex-col font-sans select-none overflow-x-hidden relative">
      {/* UHD Background Wallpaper */}
      <img
        src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=2560&auto=format&fit=crop&q=90"
        alt="Direct Platform Matcher background"
        className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none z-0"
      />
      {/* Soft Pure White Overlay */}
      <div className="absolute inset-0 z-0 pointer-events-none" style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(2px)' }} />

      <div className="max-w-4xl mx-auto w-full space-y-12 relative z-10">
        {/* Page Header */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight" style={{ color: '#0f172a' }}>SKILL2JOB</h1>
          <p className="text-xs md:text-sm font-bold max-w-lg mx-auto" style={{ color: '#475569' }}>
            Turn your skills or resume into live job searches across external platforms instantly.
          </p>
        </div>

        {/* Mode Toggles */}
        <div className="max-w-md mx-auto flex gap-4 p-1.5 wander-bg-gray border border-slate-200/80 rounded-full">
          <button
            onClick={() => switchMode('skills')}
            className={`flex-1 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer ${mode === 'skills'
                ? 'wander-bg-white wander-text-dark shadow-sm border border-slate-200/60'
                : 'wander-text-muted hover:text-slate-800'
              }`}
          >
            Match from Skills
          </button>
          <button
            onClick={() => switchMode('resume')}
            className={`flex-1 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer ${mode === 'resume'
                ? 'wander-bg-white wander-text-dark shadow-sm border border-slate-200/60'
                : 'wander-text-muted hover:text-slate-800'
              }`}
          >
            Match from Resume
          </button>
        </div>

        {/* Main Card Panel */}
        <div className="max-w-2xl mx-auto wander-bg-white border border-slate-200/80 p-6 md:p-8 rounded-3xl wander-badge-shadow space-y-6">
          {mode === 'skills' ? (
            <div className="space-y-4" ref={dropdownRef}>
              <h2 className="text-xl font-extrabold wander-text-dark tracking-tight">Select Your Skills</h2>

              {/* Selected skill chips with remove handler */}
              {selectedSkills.length > 0 && (
                <div className="flex flex-wrap gap-2 p-3.5 bg-slate-50 border border-slate-200/60 rounded-2xl">
                  {selectedSkills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-200/60 text-blue-700 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => toggleSkill(skill)}
                        className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 flex items-center justify-center font-bold text-[10px] cursor-pointer"
                        title="Remove"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Autocomplete Skill Search box */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Type to search and add skills (e.g. React, Python...)"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setShowDropdown(true)
                  }}
                  onFocus={() => setShowDropdown(true)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && searchQuery.trim() !== '') {
                      e.preventDefault()
                      const cleanSkill = searchQuery.trim()
                      if (!selectedSkills.includes(cleanSkill)) {
                        setSelectedSkills(prev => [...prev, cleanSkill])
                      }
                      setSearchQuery('')
                      setShowDropdown(false)
                    }
                  }}
                  className="w-full bg-slate-100 hover:bg-slate-200/50 border border-slate-200 focus:bg-white text-slate-800 wander-search-input text-xs rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-semibold"
                />

                {showDropdown && searchQuery.trim() !== '' && (
                  <div className="absolute left-0 right-0 mt-1.5 wander-bg-white border border-slate-200/80 rounded-2xl shadow-xl max-h-60 overflow-y-auto z-20 divide-y divide-slate-100">
                    {filteredSkills.length > 0 ? (
                      filteredSkills.map((skill) => (
                        <div
                          key={skill}
                          onClick={() => {
                            toggleSkill(skill)
                            setSearchQuery('')
                            setShowDropdown(false)
                          }}
                          className="px-4 py-2.5 hover:bg-slate-50 text-xs text-slate-700 font-bold cursor-pointer transition-colors text-left"
                        >
                          + {skill}
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-xs text-slate-400 font-semibold text-left">
                        No matching skills found. Press Enter to add "{searchQuery.trim()}".
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Popular Skill suggestions */}
              <div className="pt-2">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Popular Skill Suggestions
                </span>
                <div className="flex flex-wrap gap-2">
                  {allSkills.slice(0, 15).map((skill) => {
                    const isSelected = selectedSkills.includes(skill)
                    return (
                      <button
                        key={skill}
                        onClick={() => toggleSkill(skill)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${isSelected
                            ? 'bg-blue-50 text-blue-600 border-blue-200/60 shadow-sm'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200/70 border-slate-200 hover:border-blue-400'
                          }`}
                      >
                        {skill}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="text-xl font-extrabold wander-text-dark tracking-tight">Upload Resume (PDF)</h2>
              <div className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-3xl p-8 text-center transition-colors">
                <input
                  type="file"
                  accept=".pdf"
                  id="resume-file"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="hidden"
                />
                <label htmlFor="resume-file" className="cursor-pointer space-y-2 block">
                  <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-xl text-blue-600 mx-auto border border-blue-200/50 shadow-sm">
                    📄
                  </div>
                  <span className="block text-xs font-bold wander-text-dark">
                    Click to select file or drag & drop
                  </span>
                  <span className="block text-[10px] text-slate-400 font-semibold">
                    PDF format, max 2MB
                  </span>
                </label>
                {file && (
                  <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-2.5 text-xs font-bold text-green-700 flex items-center justify-center gap-2 animate-in fade-in duration-200">
                    ✓ {file.name} selected
                  </div>
                )}
              </div>
            </div>
          )}

          <button
            onClick={handleMatch}
            disabled={loading}
            className="w-full bg-[#0f172a] hover:bg-blue-600 disabled:bg-slate-300 text-white text-xs font-bold py-3.5 rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
          >
            {loading ? 'Searching platforms...' : 'Find'}
          </button>
        </div>

        {/* Results Sections */}
        {searched && (
          <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom duration-300">
            {/* Match Summary Panel */}
            <div className="wander-bg-white border border-slate-200/80 p-6 md:p-8 rounded-3xl wander-badge-shadow space-y-6">
              <h2 className="text-xl font-extrabold wander-text-dark tracking-tight">Match Summary</h2>
              <p className="text-slate-600 text-xs md:text-sm leading-relaxed font-semibold">
                {summary || 'Mapped your profile to external job platforms and search queries.'}
              </p>

              {detectedSkills.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Detected Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {detectedSkills.map((skill) => (
                      <span key={skill} className="text-xs bg-blue-50 border border-blue-200/50 text-blue-700 font-bold rounded-full px-3 py-1.5">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {recommendedRoles.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-[10px] font-bold uppercase tracking-wider text-green-600">Recommended Search Roles</h3>
                  <div className="flex flex-wrap gap-2">
                    {recommendedRoles.map((role) => (
                      <span key={role} className="text-xs bg-green-50 border border-green-200/50 text-green-700 font-bold rounded-full px-3 py-1.5">
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Match Results */}
            {results.length > 0 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-extrabold wander-text-dark tracking-tight">Recommended External Searches</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {results.map((job, i) => (
                    <div key={`${job.title}-${job.source_site}-${i}`} className="wander-bg-white border border-slate-200/80 p-6 rounded-3xl wander-badge-shadow hover:shadow-md transition-shadow flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="flex justify-between items-start gap-3">
                          <div className="min-w-0">
                            <p className="text-xs uppercase tracking-wide text-blue-500 font-bold mb-2 flex items-center gap-1.5">
                              <BrandIcon url={job.url} name={job.source_site} className="w-5 h-5" />
                              {job.source_site}
                            </p>
                            <h3 className="text-base font-extrabold wander-text-dark truncate">{job.title}</h3>
                            <p className="text-slate-400 text-xs font-semibold">{job.location}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-green-600 font-black text-xl">{job.match_percent}%</span>
                            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Match</p>
                          </div>
                        </div>
                        <p 
                          onClick={() => toggleReason(i)}
                          className={`text-slate-500 text-xs leading-relaxed font-semibold cursor-pointer transition-all ${expandedReasons.includes(i) ? '' : 'line-clamp-3'}`}
                          title="Click to expand/collapse"
                        >
                          {job.reason}
                        </p>
                        <p className="text-[10px] text-slate-400 font-semibold bg-slate-50 border border-slate-200/50 p-2.5 rounded-xl">Search query: <code className="font-mono text-blue-600 font-bold">{job.query}</code></p>
                      </div>

                      <a
                        href={job.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full text-center bg-[#0f172a] hover:bg-blue-600 text-white text-xs font-bold py-2.5 rounded-xl transition-all shadow-sm cursor-pointer mt-5 inline-block"
                      >
                        Open Live Search
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Platform Links */}
            {externalSources.length > 0 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-extrabold wander-text-dark tracking-tight">Quick Platform Links</h2>
                  <p className="text-xs text-slate-500 font-semibold mt-1">
                    These links open the same keywords directly on major external job platforms.
                  </p>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  {externalSources.map((src) => (
                    <a
                      key={src.site}
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 wander-bg-white border border-slate-200/80 p-4 rounded-3xl wander-badge-shadow hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                    >
                      <span className="text-xs font-bold text-blue-600 bg-slate-50 border border-slate-200/50 p-2 rounded-full flex items-center justify-center shrink-0">
                        <BrandIcon url={src.url} name={src.site} className="w-6 h-6" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-extrabold wander-text-dark text-sm">{src.site}</p>
                        <p className="text-slate-400 text-[10px] font-semibold truncate">Search: {src.query}</p>
                      </div>
                      <span className="text-blue-500 font-bold text-xs shrink-0 bg-blue-50/50 px-3 py-1 rounded-full border border-blue-200/40">Open</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {!loading && results.length === 0 && externalSources.length === 0 && (
              <div className="wander-bg-white border border-slate-200/80 p-8 rounded-3xl wander-badge-shadow text-center space-y-3">
                <h2 className="text-lg font-extrabold wander-text-dark">No external searches generated</h2>
                <p className="text-slate-500 text-xs font-semibold">
                  Try adding more specific skills or upload a clearer resume.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default AIMatch
