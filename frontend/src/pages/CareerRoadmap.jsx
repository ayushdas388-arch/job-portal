import { useState } from 'react'
import API from '../api/axios'

function CareerRoadmap() {
  const [role, setRole] = useState('')
  const [roadmap, setRoadmap] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showQuestionnaire, setShowQuestionnaire] = useState(false)

  // Questionnaire details state
  const [education, setEducation] = useState('Graduation (Tech / IT)')
  const [currentSkills, setCurrentSkills] = useState('')
  const [experienceLevel, setExperienceLevel] = useState('Absolute Beginner (Fresher)')
  const [learningPace, setLearningPace] = useState('3-5 hours/day')

  const handleInitialSubmit = () => {
    const trimmed = role.trim()
    if (!trimmed) return
    setError('')
    setShowQuestionnaire(true)
  }

  const generateRoadmap = async () => {
    const trimmed = role.trim()
    if (!trimmed) return

    setError('')
    setLoading(true)
    setRoadmap(null)
    setShowQuestionnaire(false)

    try {
      const response = await API.post('/ai/roadmap', {
        target_role: trimmed,
        education,
        current_skills: currentSkills.trim(),
        experience_level: experienceLevel,
        learning_pace: learningPace
      })
      setRoadmap(response.data || [])
    } catch (err) {
      console.error('Roadmap generate error:', err)
      setError(err.response?.data?.detail || 'Failed to generate career roadmap. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="wander-light-theme min-h-screen p-4 md:p-8 md:pl-24 flex flex-col font-sans select-none overflow-x-hidden relative">
      {/* UHD Background Wallpaper */}
      <img 
        src="https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=2560&auto=format&fit=crop&q=90" 
        alt="Career Roadmap background" 
        className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none z-0"
      />
      {/* Soft Pure White Overlay */}
      <div className="absolute inset-0 z-0 pointer-events-none" style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(2px)' }} />

      <div className="max-w-3xl mx-auto w-full space-y-12 relative z-10">
        {/* Page Header */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight" style={{ color: '#0f172a' }}>Career Roadmap</h1>
          <p className="text-xs md:text-sm font-bold max-w-lg mx-auto" style={{ color: '#475569' }}>
            Not sure where to start? Enter your dream role and get a step-by-step path to success.
          </p>
        </div>

        {/* Input Bar Card */}
        <div className="wander-bg-white border border-slate-200/80 p-5 rounded-3xl wander-badge-shadow flex flex-col sm:flex-row gap-3">
          <input 
            type="text" 
            placeholder="e.g. Backend Developer, Data Scientist, Bank PO..." 
            className="flex-1 bg-slate-100/50 hover:bg-slate-200/40 border border-slate-200 focus:bg-white text-slate-800 wander-search-input text-xs rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-semibold"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleInitialSubmit()}
            disabled={loading}
          />
          <button 
            onClick={handleInitialSubmit}
            disabled={loading}
            className="bg-[#0f172a] hover:bg-blue-600 disabled:opacity-50 text-white text-xs font-bold py-3.5 px-8 rounded-xl transition-all shadow-md cursor-pointer whitespace-nowrap flex items-center justify-center gap-2"
          >
            {loading ? 'Designing path...' : 'Generate Path'}
          </button>
        </div>

        {/* Questionnaire Modal */}
        {showQuestionnaire && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div 
              className="wander-bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl border border-slate-200 space-y-6 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
              style={{ backgroundColor: '#ffffff', color: '#0f172a', borderColor: '#e2e8f0' }}
            >
              <div className="space-y-1">
                <h3 className="text-xl font-extrabold text-slate-900" style={{ color: '#0f172a' }}>Personalize Your "{role}" Path</h3>
                <p className="text-xs text-slate-500 font-bold" style={{ color: '#64748b' }}>Help our career AI build the most effective route for you.</p>
              </div>

              <div className="space-y-4">
                {/* Education Background */}
                <div className="space-y-2">
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-wider" style={{ color: '#475569' }}>Education Level</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      "High School / 12th Pass",
                      "Graduation (Non-Tech)",
                      "Graduation (Tech / IT)",
                      "Post-Graduation / PhD",
                      "Self-Taught / Other"
                    ].map((edu) => (
                      <button
                        key={edu}
                        type="button"
                        onClick={() => setEducation(edu)}
                        className="text-[10px] md:text-[11px] font-bold py-2.5 px-3 rounded-xl border text-left transition-all cursor-pointer"
                        style={
                          education === edu 
                            ? { backgroundColor: '#eff6ff', borderColor: '#3b82f6', color: '#1d4ed8' } 
                            : { backgroundColor: '#f8fafc', borderColor: '#e2e8f0', color: '#475569' }
                        }
                      >
                        {edu}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Current Skills / Background */}
                <div className="space-y-2">
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-wider" style={{ color: '#475569' }}>Current Skills & Technologies</label>
                  <textarea
                    rows="2"
                    placeholder="e.g. Python basics, MS Excel, HTML/CSS, basic maths, fast typing..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 text-slate-800 transition-all placeholder:text-slate-400 wander-textarea"
                    value={currentSkills}
                    onChange={(e) => setCurrentSkills(e.target.value)}
                    style={{ color: '#0f172a', backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }}
                  />
                </div>

                {/* Prior Experience */}
                <div className="space-y-2">
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-wider" style={{ color: '#475569' }}>Prior Technical Experience</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "Absolute Beginner (Fresher)",
                      "Basic Practice / Academic Projects",
                      "Experienced (Switching Role)"
                    ].map((exp) => (
                      <button
                        key={exp}
                        type="button"
                        onClick={() => setExperienceLevel(exp)}
                        className="text-[10px] md:text-[11px] font-bold py-2.5 px-3 rounded-xl border text-left transition-all cursor-pointer"
                        style={
                          experienceLevel === exp 
                            ? { backgroundColor: '#eff6ff', borderColor: '#3b82f6', color: '#1d4ed8' } 
                            : { backgroundColor: '#f8fafc', borderColor: '#e2e8f0', color: '#475569' }
                        }
                      >
                        {exp}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Daily Study Commitment / Pace */}
                <div className="space-y-2">
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-wider" style={{ color: '#475569' }}>Daily Study Commitment</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      "1-2 hours/day",
                      "3-5 hours/day",
                      "Full-time (6+ hrs)"
                    ].map((pace) => (
                      <button
                        key={pace}
                        type="button"
                        onClick={() => setLearningPace(pace)}
                        className="text-[10px] md:text-[11px] font-bold py-2.5 px-3 rounded-xl border text-center transition-all cursor-pointer"
                        style={
                          learningPace === pace 
                            ? { backgroundColor: '#eff6ff', borderColor: '#3b82f6', color: '#1d4ed8' } 
                            : { backgroundColor: '#f8fafc', borderColor: '#e2e8f0', color: '#475569' }
                        }
                      >
                        {pace}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowQuestionnaire(false)}
                  className="flex-1 font-bold text-xs py-3 rounded-xl transition-all cursor-pointer border"
                  style={{ backgroundColor: '#f1f5f9', color: '#475569', borderColor: '#cbd5e1' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={generateRoadmap}
                  className="flex-1 font-bold text-xs py-3 rounded-xl transition-all shadow-md cursor-pointer"
                  style={{ backgroundColor: '#2563eb', color: '#ffffff' }}
                >
                  Create Roadmap
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="wander-bg-white border border-red-200 p-4 rounded-2xl text-center text-xs font-bold text-red-600 shadow-sm animate-in fade-in duration-200">
            {error}
          </div>
        )}

        {/* Loading placeholder */}
        {loading && (
          <div className="wander-bg-white border border-slate-200/80 p-8 rounded-3xl wander-badge-shadow text-center space-y-3">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs font-bold text-slate-500">Creating custom skill milestones for "{role}"...</p>
          </div>
        )}

        {/* Roadmap milestones */}
        {roadmap && (
          <div className="relative animate-in fade-in slide-in-from-bottom duration-300">
            {/* Vertical timeline connector line */}
            <div className="absolute left-[27px] top-6 bottom-6 w-1 bg-blue-200/60 rounded"></div>
            
            <div className="space-y-8">
              {roadmap.map((item, index) => (
                <div key={item.step || index} className="flex gap-6 relative">
                  {/* Number Milestone Indicator */}
                  <div className="w-14 h-14 shrink-0 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl shadow-lg border-4 border-white relative z-10">
                    {item.step}
                  </div>
                  {/* Info Card */}
                  <div className="wander-bg-white p-6 rounded-3xl border border-slate-200/80 wander-badge-shadow flex-1 hover:shadow-md transition-shadow space-y-4">
                    <div className="space-y-1">
                      <h3 className="text-lg font-extrabold text-slate-800 tracking-tight">{item.title}</h3>
                      <p className="text-xs md:text-sm leading-relaxed font-semibold text-slate-600">{item.desc}</p>
                    </div>

                    {/* Sub points / Bullet objectives */}
                    {item.bullets && item.bullets.length > 0 && (
                      <div className="pt-3 border-t border-slate-100 space-y-2.5">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Key Action Steps / Objective</h4>
                        <ul className="space-y-2">
                          {item.bullets.map((bullet, bIdx) => (
                            <li key={bIdx} className="flex items-start gap-2.5 text-xs text-slate-600 font-semibold leading-relaxed">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 shrink-0"></span>
                              <span>{bullet}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CareerRoadmap
