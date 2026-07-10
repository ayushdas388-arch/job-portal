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

  const inputClass = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400'

  const readiness = result?.readiness_percent ?? 0
  const barColor = readiness >= 70 ? 'bg-green-500' : readiness >= 40 ? 'bg-yellow-500' : 'bg-red-500'

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6">
      <h1 className="text-4xl font-bold text-center text-blue-600 mb-2">Skill Gap Analysis</h1>
      <p className="text-center text-gray-500 mb-8">
        Add your skills, choose a target role, and see what you should learn next.
      </p>

      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow space-y-6">
          <section>
            <h2 className="text-xl font-bold mb-3">Target Role</h2>
            <input
              className={inputClass}
              placeholder="e.g. Frontend Developer, Data Analyst, SSC CGL"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
            />
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">Your Current Skills</h2>
            <div className="flex gap-2 mb-3">
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
              <button onClick={() => addSkill(skillInput)} className="neon-outline px-4 rounded-lg text-sm">Add</button>
            </div>

            {skills.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {skills.map((s) => (
                  <span key={s} className="flex items-center gap-1 bg-blue-50 border border-blue-300 text-blue-700 rounded-full px-3 py-1 text-sm">
                    {s}
                    <button onClick={() => removeSkill(s)} className="text-blue-400 hover:text-red-500">x</button>
                  </span>
                ))}
              </div>
            )}

            <p className="text-xs text-gray-400 mb-2">Quick add:</p>
            <div className="flex flex-wrap gap-2">
              {popularSkills.map((s) => (
                <button
                  key={s}
                  onClick={() => addSkill(s)}
                  className="px-3 py-1 rounded-full text-xs font-medium bg-white text-gray-600 border border-gray-300 hover:border-blue-400"
                >
                  + {s}
                </button>
              ))}
            </div>
          </section>

          <button onClick={handleAnalyze} disabled={loading} className="w-full neon-btn">
            {loading ? 'Analyzing...' : 'Analyze Skill Gap'}
          </button>
        </div>

        <div>
          {result ? (
            <div className="bg-white p-6 rounded-xl shadow space-y-6">
              <div>
                <div className="flex justify-between items-end mb-1">
                  <h2 className="text-lg font-bold">Job Readiness for <span className="text-blue-600">{result.target_role}</span></h2>
                  <span className="text-2xl font-bold text-gray-700">{readiness}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className={`${barColor} h-3 rounded-full transition-all`} style={{ width: `${readiness}%` }} />
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold uppercase tracking-wide text-green-600 mb-2">Skills You Have</h3>
                {result.matched_skills?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {result.matched_skills.map((s, i) => (
                      <span key={i} className="text-xs bg-green-50 border border-green-300 text-green-700 rounded-full px-3 py-1">{s}</span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">No matching skills were found.</p>
                )}
              </div>

              <div>
                <h3 className="text-sm font-bold uppercase tracking-wide text-red-500 mb-2">Skills To Learn</h3>
                {result.missing_skills?.length > 0 ? (
                  <div className="space-y-3">
                    {result.missing_skills.map((m, i) => (
                      <div key={i} className="border border-gray-200 rounded-lg p-3">
                        <p className="font-semibold text-sm text-gray-800">{m.skill}</p>
                        {m.why && <p className="text-xs text-gray-500 mt-1">{m.why}</p>}
                        {m.resource && (
                          <p className="text-xs text-blue-600 mt-1">Recommended resource: {m.resource}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-green-600">No major gaps found - you look ready.</p>
                )}
              </div>

              {result.advice && (
                <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded">
                  <p className="text-sm text-gray-700">{result.advice}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white p-8 rounded-xl shadow text-center text-gray-400 flex items-center justify-center min-h-[300px]">
              Your analysis result will appear here.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SkillGap
