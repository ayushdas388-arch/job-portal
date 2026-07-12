import { useState } from 'react'
import API from '../api/axios'

function AIInterview() {
  const [started, setStarted] = useState(false)
  const [round, setRound] = useState('hr')
  const [role, setRole] = useState('Software Developer')
  const [limit, setLimit] = useState(5)
  const [history, setHistory] = useState([]) // list of { role: 'interviewer' | 'candidate', text: '' }
  const [currentQuestion, setCurrentQuestion] = useState('')
  const [answerInput, setAnswerInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [finished, setFinished] = useState(false)
  const [feedback, setFeedback] = useState(null) // { reply, score, strengths, improvements }

  const startInterview = async () => {
    if (!role.trim()) {
      alert('Please enter a target role.')
      return
    }

    setLoading(true)
    setStarted(true)
    setFinished(false)
    setFeedback(null)
    setHistory([])
    try {
      const response = await API.post('/interview/chat', {
        round,
        role: role.trim(),
        history: [],
        question_limit: limit
      })
      setCurrentQuestion(response.data.reply)
      setHistory([{ role: 'interviewer', text: response.data.reply }])
    } catch (err) {
      console.error('Start interview error:', err)
      alert('Failed to start interview. Please make sure the backend is running.')
      setStarted(false)
    } finally {
      setLoading(false)
    }
  }

  const submitAnswer = async () => {
    if (!answerInput.trim() || loading) return

    setLoading(true)
    const candidateTurn = { role: 'candidate', text: answerInput.trim() }
    const updatedHistory = [...history, candidateTurn]
    setHistory(updatedHistory)
    setAnswerInput('')

    try {
      const response = await API.post('/interview/chat', {
        round,
        role: role.trim(),
        history: updatedHistory,
        question_limit: limit
      })

      if (response.data.done) {
        setFinished(true)
        setFeedback({
          reply: response.data.reply,
          score: response.data.score || 70,
          strengths: response.data.strengths || [],
          improvements: response.data.improvements || []
        })
      } else {
        setCurrentQuestion(response.data.reply)
        setHistory([...updatedHistory, { role: 'interviewer', text: response.data.reply }])
      }
    } catch (err) {
      console.error('Submit answer error:', err)
      alert('Failed to submit answer. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const ringColor = (s) =>
    s >= 85 ? 'oklch(62% 0.15 150)' : s >= 70 ? 'oklch(65% 0.14 230)' : s >= 55 ? 'oklch(72% 0.15 75)' : 'oklch(62% 0.19 25)'

  const inputClass =
    'w-full bg-slate-100/50 hover:bg-slate-200/40 border border-slate-200 focus:bg-white text-slate-800 wander-search-input text-xs rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-semibold'

  const currentQuestionsAsked = history.filter(t => t.role === 'interviewer').length

  return (
    <div className="wander-light-theme min-h-screen p-4 md:p-8 md:pl-24 flex flex-col font-sans select-none overflow-x-hidden relative">
      {/* UHD Background Wallpaper */}
      <img 
        src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=2560&auto=format&fit=crop&q=90" 
        alt="Mock Interview background" 
        className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none z-0"
      />
      {/* Soft Pure White Overlay */}
      <div className="absolute inset-0 z-0 pointer-events-none" style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(2px)' }} />

      <div className="max-w-3xl mx-auto w-full space-y-12 relative z-10">
        {/* Page Header */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight" style={{ color: '#0f172a' }}>Mock Interview Practice</h1>
          <p className="text-xs md:text-sm font-bold max-w-lg mx-auto" style={{ color: '#475569' }}>
            Simulate live HR and Technical rounds with professional feedback.
          </p>
        </div>

        {!started ? (
          /* Setup Interview Panel */
          <div className="wander-bg-white border border-slate-200/80 p-6 md:p-8 rounded-3xl wander-badge-shadow space-y-6">
            <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Configure Practice Session</h2>
            
            <div className="space-y-4">
              {/* Target Role */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Target Job Role</label>
                <input 
                  className={inputClass} 
                  placeholder="e.g. Backend Developer, Frontend Developer" 
                  value={role} 
                  onChange={(e) => setRole(e.target.value)} 
                />
              </div>

              {/* Round Selection */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Round Type</label>
                <div className="flex gap-4 p-1 bg-slate-100 border border-slate-200/80 rounded-2xl max-w-sm">
                  <button
                    type="button"
                    onClick={() => setRound('hr')}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      round === 'hr'
                        ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60'
                        : 'text-slate-500 hover:text-slate-950'
                    }`}
                  >
                    HR Round (Behavioral)
                  </button>
                  <button
                    type="button"
                    onClick={() => setRound('technical')}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      round === 'technical'
                        ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60'
                        : 'text-slate-500 hover:text-slate-950'
                    }`}
                  >
                    Technical Round
                  </button>
                </div>
              </div>

              {/* Questions Limit */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Number of Questions</label>
                <select 
                  className={inputClass} 
                  value={limit} 
                  onChange={(e) => setLimit(Number(e.target.value))}
                >
                  <option value={3}>3 Questions (Express)</option>
                  <option value={5}>5 Questions (Standard)</option>
                  <option value={8}>8 Questions (Detailed)</option>
                  <option value={10}>10 Questions (Comprehensive)</option>
                </select>
              </div>
            </div>

            <button 
              onClick={startInterview}
              disabled={loading}
              className="w-full bg-[#0f172a] hover:bg-blue-600 disabled:opacity-50 text-white text-xs font-bold py-3.5 rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 mt-4"
            >
              {loading ? 'Starting...' : 'Start Practice Session'}
            </button>
          </div>
        ) : finished ? (
          /* Feedback Report Panel */
          <div className="wander-bg-white border border-slate-200/80 p-6 md:p-8 rounded-3xl wander-badge-shadow space-y-8 animate-in fade-in slide-in-from-bottom duration-300">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Interview Performance Report</h2>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Evaluation completed successfully</p>
            </div>

            {/* Score Metric Ring */}
            {feedback && (
              <div className="flex flex-col sm:flex-row items-center gap-6 justify-center bg-slate-50 border border-slate-200/60 p-6 rounded-3xl">
                <div
                  className="relative grid h-28 w-28 flex-none place-items-center rounded-full"
                  style={{
                    background: `conic-gradient(${ringColor(feedback.score)} ${feedback.score * 3.6}deg, oklch(93% 0.01 260) 0deg)`,
                  }}
                >
                  <div 
                    className="grid h-20 w-20 place-items-center rounded-full shadow-sm"
                    style={{ backgroundColor: '#ffffff' }}
                  >
                    <span 
                      className="text-2xl font-black" 
                      style={{ color: ringColor(feedback.score) }}
                    >
                      {feedback.score}%
                    </span>
                  </div>
                </div>
                <div className="text-center sm:text-left space-y-2 max-w-md">
                  <h3 className="font-extrabold text-slate-800 text-lg">Overall Interview Feedback</h3>
                  <p className="text-xs md:text-sm leading-relaxed font-semibold text-slate-600">
                    {feedback.reply}
                  </p>
                </div>
              </div>
            )}

            {/* Strengths & Improvements */}
            {feedback && (
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-green-600 uppercase tracking-wider">✓ Key Strengths</h3>
                  <ul className="space-y-2">
                    {feedback.strengths.length === 0 && <li className="text-xs text-slate-400 font-semibold">None reported.</li>}
                    {feedback.strengths.map((str, idx) => (
                      <li key={idx} className="bg-green-50 border border-green-200/50 text-green-700 text-xs font-bold p-3 rounded-2xl">
                        {str}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-red-500 uppercase tracking-wider">⚡ Areas of Improvement</h3>
                  <ul className="space-y-2">
                    {feedback.improvements.length === 0 && <li className="text-xs text-slate-400 font-semibold">Great job, no major gaps!</li>}
                    {feedback.improvements.map((imp, idx) => (
                      <li key={idx} className="bg-red-50 border border-red-200/50 text-red-700 text-xs font-bold p-3 rounded-2xl">
                        {imp}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            <button 
              onClick={() => setStarted(false)}
              className="w-full bg-[#0f172a] hover:bg-blue-600 text-white text-xs font-bold py-3.5 rounded-xl transition-all shadow-md cursor-pointer"
            >
              Start New Interview
            </button>
          </div>
        ) : (
          /* Live Chat Practice Session */
          <div className="wander-bg-white border border-slate-200/80 p-6 md:p-8 rounded-3xl wander-badge-shadow space-y-6 flex flex-col h-[600px] justify-between relative animate-in fade-in zoom-in duration-200">
            {/* Header info */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 shrink-0">
              <div>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                  {round === 'hr' ? 'HR Session' : 'Technical Session'} &bull; {role}
                </span>
                <h2 className="text-base font-extrabold text-slate-800 tracking-tight">Active Interview Chat</h2>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Progress</span>
                <span className="text-xs font-black text-slate-700">{currentQuestionsAsked} of {limit} questions</span>
              </div>
            </div>

            {/* Conversation transcript */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4 px-2 my-2 scrollbar-thin">
              {history.map((turn, idx) => {
                const isInterviewer = turn.role === 'interviewer'
                return (
                  <div 
                    key={idx} 
                    className={`flex flex-col max-w-[82%] ${isInterviewer ? 'mr-auto items-start' : 'ml-auto items-end'}`}
                  >
                    <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider mb-1 px-1">
                      {isInterviewer ? 'Interviewer' : 'Candidate'}
                    </span>
                    <div 
                      className={`p-4 rounded-2xl text-xs leading-relaxed font-semibold shadow-sm ${
                        isInterviewer 
                          ? 'bg-blue-50/70 border border-blue-100 text-slate-800 rounded-tl-none' 
                          : 'bg-[#0f172a] text-white rounded-tr-none'
                      }`}
                    >
                      {turn.text}
                    </div>
                  </div>
                )
              })}

              {loading && (
                <div className="mr-auto items-start max-w-[80%] flex flex-col animate-pulse">
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider mb-1 px-1">Interviewer</span>
                  <div className="bg-blue-50/50 border border-blue-100/60 p-4 rounded-2xl text-xs font-bold text-slate-500 rounded-tl-none flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-75"></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-150"></div>
                  </div>
                </div>
              )}
            </div>

            {/* Input message form */}
            <div className="border-t border-slate-100 pt-4 shrink-0 space-y-3">
              <div className="flex gap-3">
                <textarea 
                  rows={2}
                  placeholder="Type your answer here..." 
                  className="flex-1 bg-slate-100/50 hover:bg-slate-200/40 border border-slate-200 focus:bg-white text-slate-800 wander-search-input text-xs rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-semibold resize-none"
                  value={answerInput}
                  onChange={(e) => setAnswerInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      submitAnswer()
                    }
                  }}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={submitAnswer}
                  disabled={loading || !answerInput.trim()}
                  className="bg-[#0f172a] hover:bg-blue-600 disabled:opacity-50 text-white rounded-2xl p-4 transition-all shadow-md flex items-center justify-center shrink-0 w-12 h-12"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                  </svg>
                </button>
              </div>
              
              <div className="flex justify-between items-center px-1">
                <span className="text-[10px] text-slate-400 font-semibold">Press Enter to submit, Shift+Enter for new line.</span>
                <button 
                  type="button"
                  onClick={() => setStarted(false)}
                  className="text-xs text-red-500 hover:text-red-600 font-bold"
                >
                  Quit Practice
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AIInterview
