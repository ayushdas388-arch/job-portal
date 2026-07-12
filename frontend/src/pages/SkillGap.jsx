import { useState } from 'react'
import API from '../api/axios'

const popularSkills = [
  'Python', 'JavaScript', 'React', 'Node.js', 'SQL', 'MongoDB',
  'Java', 'C++', 'HTML', 'CSS', 'Git', 'Docker', 'AWS',
  'Machine Learning', 'Data Analysis', 'Excel', 'Power BI',
  'Communication', 'Reasoning', 'Quantitative Aptitude', 'Current Affairs',
]

function SkillGap() {
  const [skillInput, setSkillInput] = useState('')
  const [skills, setSkills] = useState([])
  const [targetRole, setTargetRole] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const addSkill = (skill) => {
    const s = skill.trim()
    if (s && !skills.some((x) => x.toLowerCase() === s.toLowerCase())) {
      setSkills((prev) => [...prev, s])
    }
    setSkillInput('')
  }

  const removeSkill = (skill) => setSkills((prev) => prev.filter((s) => s !== skill))

  const handleAnalyze = async () => {
    if (!targetRole.trim()) {
      alert('Please enter a target role first (for example, "Frontend Developer").')
      return
    }
    setLoading(true)
    try {
      const { data } = await API.post('/ai/skill-gap', {
        current_skills: skills,
        target_role: targetRole.trim(),
      })
      setResult(data)
    } catch (error) {
      console.error('Skill gap error:', error)
      alert('Analysis failed. Please check the backend logs.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = 'w-full bg-slate-100/50 hover:bg-slate-200/40 border border-slate-200 focus:bg-white text-slate-800 wander-search-input text-xs rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-semibold'

  const readiness = result?.readiness_percent ?? 0
  const barColor = readiness >= 70 ? 'bg-emerald-500' : readiness >= 40 ? 'bg-amber-500' : 'bg-rose-500'

  return (
    <div className="wander-light-theme min-h-screen p-4 md:p-8 md:pl-24 flex flex-col font-sans select-none overflow-x-hidden relative">
      {/* UHD Background Wallpaper */}
      <img
        src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1600&auto=format&fit=crop&q=80"
        alt="Skill Gap Background"
        className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none z-0"
      />
      {/* Soft Pure White Overlay */}
      <div className="absolute inset-0 z-0 bg-[#f8fafc]/75 backdrop-blur-[2px] pointer-events-none" />

      <div className="max-w-5xl mx-auto w-full space-y-8 relative z-10">
        {/* Page Header */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl md:text-5xl font-black wander-text-dark tracking-tight">Skill Gap Analysis</h1>
          <p className="text-xs md:text-sm font-bold text-slate-500 max-w-lg mx-auto">
            Compare your skillset against your dream job role and discover target topics to study.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* Input Card */}
          <div className="wander-bg-white border border-slate-200/80 p-6 md:p-8 rounded-3xl shadow-xl space-y-6">
            <section className="space-y-2">
              <h2 className="text-sm font-bold text-slate-700">Target Role</h2>
              <input
                className={inputClass}
                placeholder="e.g. Frontend Developer, Data Analyst, SSC CGL"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
              />
            </section>

            <section className="space-y-3">
              <h2 className="text-sm font-bold text-slate-700">Your Current Skills</h2>
              <div className="flex gap-2">
                <input
                  className={inputClass}
                  placeholder="Type a skill and press Enter"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addSkill(skillInput)
                    }
                  }}
                />
                <button 
                  onClick={() => addSkill(skillInput)} 
                  className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 rounded-xl border border-slate-950 transition-all cursor-pointer"
                >
                  Add
                </button>
              </div>

              {skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5 p-3 bg-slate-50/50 rounded-2xl border border-slate-100">
                  {skills.map((s) => (
                    <span key={s} className="flex items-center gap-1.5 bg-blue-50/80 border border-blue-200/60 text-blue-700 rounded-full px-3 py-1 text-xs font-semibold">
                      {s}
                      <button onClick={() => removeSkill(s)} className="text-blue-400 hover:text-rose-500 font-bold ml-0.5 cursor-pointer">×</button>
                    </span>
                  ))}
                </div>
              )}

              <p className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400">Quick add skills:</p>
              <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto pr-1">
                {popularSkills.map((s) => (
                  <button
                    key={s}
                    onClick={() => addSkill(s)}
                    className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-50 hover:bg-blue-50 text-slate-600 border border-slate-200 hover:border-blue-400 cursor-pointer transition-colors"
                  >
                    + {s}
                  </button>
                ))}
              </div>
            </section>

            <button 
              onClick={handleAnalyze} 
              disabled={loading} 
              className="w-full bg-[#0f172a] hover:bg-blue-600 text-white text-xs font-bold py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Analyzing Profile...' : 'Analyze Skill Gap'}
            </button>
          </div>

          {/* Results Side */}
          <div className="space-y-6">
            {result ? (
              <div className="wander-bg-white border border-slate-200/80 p-6 md:p-8 rounded-3xl shadow-xl space-y-6">
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <h2 className="text-sm font-black text-slate-800">Job Readiness for <span className="text-blue-600">{result.target_role}</span></h2>
                    <span className="text-2xl font-black text-slate-800">{readiness}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200/60">
                    <div className={`${barColor} h-3 rounded-full transition-all duration-700`} style={{ width: `${readiness}%` }} />
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xs uppercase tracking-widest font-black text-emerald-600">Skills You Have</h3>
                  {result.matched_skills?.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {result.matched_skills.map((s, i) => (
                        <span key={i} className="text-xs font-semibold bg-emerald-50/60 border border-emerald-200 text-emerald-700 rounded-full px-3 py-1.5">{s}</span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs font-bold text-slate-400">No matching skills found.</p>
                  )}
                </div>

                <div className="space-y-3">
                  <h3 className="text-xs uppercase tracking-widest font-black text-rose-500">Skills To Learn</h3>
                  {result.missing_skills?.length > 0 ? (
                    <div className="space-y-2.5">
                      {result.missing_skills.map((m, i) => (
                        <div key={i} className="border border-slate-200/80 bg-slate-50/30 rounded-2xl p-4 space-y-1">
                          <p className="font-extrabold text-xs text-slate-800">{m.skill}</p>
                          {m.why && <p className="text-xs text-slate-500 leading-relaxed">{m.why}</p>}
                          {m.resource && (
                            <p className="text-xs font-bold text-blue-600 mt-1.5">💡 Course: {m.resource}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs font-bold text-emerald-600">Perfect! You possess all required skills.</p>
                  )}
                </div>

                {result.advice && (
                  <div className="bg-blue-50/60 border border-blue-200/80 p-4 rounded-2xl">
                    <p className="text-xs font-medium text-slate-700 leading-relaxed">{result.advice}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="wander-bg-white border border-slate-200/80 p-8 rounded-3xl shadow-xl text-center text-slate-400 flex flex-col items-center justify-center min-h-[350px] space-y-3">
                <span className="text-4xl">📊</span>
                <p className="text-xs font-bold text-slate-400">Your custom skill gap analysis and advice report will appear here after search.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SkillGap
