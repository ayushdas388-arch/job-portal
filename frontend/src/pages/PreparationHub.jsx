import { useEffect, useState } from 'react'
import API from '../api/axios'
import BrandIcon from '../components/BrandIcon'

const TABS = [
  { key: 'resources', label: 'Resources' },
  { key: 'plan', label: 'Study Plan' },
  { key: 'quiz', label: 'Practice Quiz' },
  { key: 'video', label: 'Video Courses' },
]

function PreparationHub() {
  const [tab, setTab] = useState('resources')

  return (
    <div className="min-h-screen py-16 px-4 md:px-8 relative overflow-hidden flex flex-col justify-start">
      {/* Background HD Wallpaper */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=1600&auto=format&fit=crop&q=80" 
          alt="Study Planner Desk" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-[#0f172a]/95 via-[#0f172a]/85 to-[#0f172a]/65" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto w-full">
        {/* Header Block */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-300 tracking-tight mb-3">
            Preparation Hub
          </h1>
          <p className="text-sm md:text-base text-slate-300 max-w-xl mx-auto font-medium">
            Master your goals with curated exam resources, AI-powered week-by-week study planners, and practice quizzes.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex gap-2.5 mb-10 justify-center flex-wrap">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-5 py-2.5 rounded-2xl text-xs md:text-sm font-extrabold transition-all duration-200 cursor-pointer ${
                tab === t.key 
                  ? 'bg-white text-[#0f172a] shadow-lg shadow-black/35 scale-105 border border-white' 
                  : 'bg-white/10 hover:bg-white/15 text-slate-200 border border-white/10'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Dynamic Glassmorphic Panel Content */}
        <div className="wander-bg-white border border-slate-200/50 shadow-2xl p-6 md:p-8 rounded-3xl">
          {tab === 'resources' && <Resources />}
          {tab === 'plan' && <StudyPlan />}
          {tab === 'quiz' && <Quiz />}
          {tab === 'video' && <VideoCourses />}
        </div>
      </div>
    </div>
  )
}

function VideoCourses() {
  return (
    <div className="py-12 px-6 text-center">
      <div className="w-20 h-20 bg-slate-100 text-slate-600 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-slate-200/80 shadow-inner">
        <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h1.5C5.4 19.5 6 18.9 6 18.25V6.75C6 6.07 5.4 5.5 4.875 5.5H3.375m17.25 14v-1.5c0-.65-.6-1.25-1.125-1.25h-1.5m2.625 2.75v-15c0-.62-.575-1.125-1.125-1.125H16.5m3.375 16.125H4.875M16.5 5.5v14m0-14h1.5m-1.5 0v14" />
        </svg>
      </div>
      <h2 className="text-2xl font-black text-[#0f172a] mb-2 tracking-tight">Video Courses</h2>
      <p className="text-slate-500 text-sm max-w-md mx-auto mb-6 leading-relaxed font-semibold">
        We are partnering with top educators to bring you high-quality video lectures for various competitive exams and tech stacks.
      </p>
      <span className="inline-block bg-slate-900 text-white font-black px-5 py-2.5 rounded-2xl text-xs tracking-wider uppercase">
        Coming Soon
      </span>
    </div>
  )
}

function Resources() {
  const [library, setLibrary] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const { data } = await API.get('/prep/resources')
        if (alive) setLibrary(data.library || [])
      } catch (error) {
        console.error('Resources load error:', error)
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => {
      alive = false
    }
  }, [])

  if (loading) return <p className="text-center text-slate-500 font-extrabold py-12">Loading resources...</p>

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {library.map((cat) => (
        <div key={cat.category} className="bg-gradient-to-br from-slate-50/50 to-white p-6 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-200">
          <h3 className="text-base font-black text-[#0f172a] mb-3 flex items-center gap-2">
            <span className="text-lg">{cat.icon}</span>
            {cat.category}
          </h3>
          <div className="flex flex-wrap gap-1.5 mb-4">
            {cat.topics.map((t) => (
              <span key={t} className="text-[10px] bg-slate-100 text-slate-700 border border-slate-200/50 font-black px-2.5 py-0.5 rounded-xl uppercase tracking-wider">
                {t}
              </span>
            ))}
          </div>
          <ul className="space-y-2">
            {cat.resources.map((r) => (
              <li key={r.name}>
                <a
                  href={r.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-bold text-slate-700 hover:text-[#0f172a] hover:underline flex items-center gap-2"
                >
                  <BrandIcon url={r.link} name={r.name} className="w-4 h-4 shrink-0" />
                  {r.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

const inputClass =
  'w-full bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-slate-400 text-[#0f172a] font-semibold wander-search-input transition-all'

function StudyPlan() {
  const [form, setForm] = useState({ target: '', exam_date: '', hours_per_day: 3, level: 'beginner' })
  const [plan, setPlan] = useState(null)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  const generate = async () => {
    if (!form.target.trim()) {
      setErr('Enter a target (for example, "SSC CGL" or "Frontend Interview").')
      return
    }
    setErr('')
    setLoading(true)
    setPlan(null)
    try {
      const { data } = await API.post('/prep/study-plan', {
        ...form,
        hours_per_day: Number(form.hours_per_day) || 3,
      })
      setPlan(data)
    } catch (error) {
      setErr(error?.response?.data?.detail?.[0]?.msg || 'Could not generate the study plan.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-200/60 space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <label className="text-xs font-black text-slate-700 uppercase tracking-wider space-y-1.5 flex flex-col">
            What are you preparing for?
            <input
              className={inputClass}
              placeholder="SSC CGL / Bank PO / React Interview..."
              value={form.target}
              onChange={(e) => setForm({ ...form, target: e.target.value })}
            />
          </label>
          <label className="text-xs font-black text-slate-700 uppercase tracking-wider space-y-1.5 flex flex-col">
            Exam or target date (optional)
            <input
              type="date"
              className={inputClass}
              value={form.exam_date}
              onChange={(e) => setForm({ ...form, exam_date: e.target.value })}
            />
          </label>
          <label className="text-xs font-black text-slate-700 uppercase tracking-wider space-y-1.5 flex flex-col">
            How many hours per day?
            <input
              type="number"
              min="1"
              max="16"
              className={inputClass}
              value={form.hours_per_day}
              onChange={(e) => setForm({ ...form, hours_per_day: e.target.value })}
            />
          </label>
          <label className="text-xs font-black text-slate-700 uppercase tracking-wider space-y-1.5 flex flex-col">
            Level
            <select
              className={inputClass}
              value={form.level}
              onChange={(e) => setForm({ ...form, level: e.target.value })}
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </label>
        </div>
        {err && <p className="text-sm font-bold text-red-600 mt-2">{err}</p>}
        <button 
          onClick={generate} 
          disabled={loading} 
          className="w-full bg-[#0f172a] hover:bg-[#1e293b] text-white text-xs font-extrabold py-3.5 rounded-xl transition-all shadow-md hover:scale-[1.01] duration-150 cursor-pointer uppercase tracking-wider"
        >
          {loading ? 'Generating Study Plan...' : 'Generate Study Plan'}
        </button>
      </div>

      {plan && (
        <div className="wander-bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-200/60 pb-4">
            <h3 className="text-lg font-black wander-text-dark tracking-tight">{plan.target} - {plan.weeks} weeks</h3>
            <span className={`text-[10px] font-black px-2.5 py-1 rounded-xl uppercase tracking-wider ${['gemini', 'groq'].includes(plan.source) ? 'bg-emerald-100 text-emerald-700 border border-emerald-200/50' : 'bg-slate-100 text-slate-600 border border-slate-200/50'}`}>
              {['gemini', 'groq'].includes(plan.source) ? 'AI Powered' : 'Basic Model'}
            </span>
          </div>
          {plan.summary && <p className="text-sm text-slate-600 font-semibold leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200/40">{plan.summary}</p>}
          <div className="space-y-4">
            {plan.plan.map((w) => (
              <div key={w.week} className="border-l-4 border-[#0f172a] pl-4 py-1.5 bg-slate-50/30 rounded-r-xl pr-3">
                <p className="font-black text-slate-800 text-sm">
                  Week {w.week}: <span className="wander-text-dark underline decoration-slate-300 decoration-2 underline-offset-4">{w.focus}</span>
                </p>
                <ul className="list-disc list-inside text-xs text-slate-600 font-semibold mt-2 space-y-1">
                  {w.tasks.map((task, i) => (
                    <li key={i} className="leading-relaxed">{task}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function Quiz() {
  const [topic, setTopic] = useState('')
  const [difficulty, setDifficulty] = useState('medium')
  const [quiz, setQuiz] = useState(null)
  const [answers, setAnswers] = useState({})
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  const generate = async () => {
    if (!topic.trim()) {
      setErr('Enter a topic (for example, "Aptitude", "Python", or "SQL").')
      return
    }
    setErr('')
    setLoading(true)
    setQuiz(null)
    setAnswers({})
    try {
      const seed = Math.random().toString(36).substring(7)
      const { data } = await API.post('/prep/quiz', { topic, count: 30, difficulty, seed })
      setQuiz(data)
    } catch (error) {
      setErr(error?.response?.data?.detail?.[0]?.msg || 'Could not generate the quiz.')
    } finally {
      setLoading(false)
    }
  }

  const choose = (qi, oi) => {
    if (answers[qi] !== undefined) return
    setAnswers((a) => ({ ...a, [qi]: oi }))
  }

  const score = quiz
    ? quiz.questions.reduce((acc, q, i) => acc + (answers[i] === q.answer_index ? 1 : 0), 0)
    : 0
  const answeredCount = Object.keys(answers).length

  return (
    <div className="space-y-6">
      <div className="wander-bg-white p-8 rounded-3xl border border-slate-200/60 shadow-sm relative overflow-hidden">
        {/* Decorative background watermark */}
        <div className="absolute right-0 top-0 opacity-40 pointer-events-none select-none translate-x-12 -translate-y-12">
          <svg className="w-64 h-64 text-slate-100" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10H7v-2h10v2zm0-4H7V7h10v2zm0 8H7v-2h10v2z"/>
          </svg>
        </div>

        <div className="mb-6 relative z-10">
          <h2 className="text-2xl font-black text-[#0f172a] mb-2 tracking-tight">Practice Quiz Arena</h2>
          <p className="text-slate-500 text-sm font-semibold max-w-xl">Test your knowledge with 30+ randomized questions across different domains. Select your topic and difficulty to begin.</p>
        </div>
        <div className="flex flex-col md:flex-row gap-3 relative z-10">
          <input
            className={`${inputClass} flex-1 border-slate-200/80 focus:border-slate-400 bg-white placeholder-slate-400`}
            placeholder="Topic: Aptitude / Reasoning / Python / SQL / DBMS..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && generate()}
          />
          <select 
            className={`${inputClass} w-full md:w-48 border-slate-200/80 focus:border-slate-400 bg-white`}
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
          >
            <option value="easy">Easy (Beginner)</option>
            <option value="medium">Medium (Intermediate)</option>
            <option value="hard">Hard (Advanced)</option>
          </select>
          <button 
            onClick={generate} 
            disabled={loading} 
            className="bg-[#0f172a] hover:bg-[#1e293b] text-white font-extrabold py-3.5 px-6 rounded-xl transition-all shadow-md shrink-0 cursor-pointer uppercase text-xs tracking-wider hover:scale-[1.03] duration-150 border-0"
          >
            {loading ? 'Generating 30 Qs...' : 'Start Quiz'}
          </button>
        </div>
        {err && <p className="text-sm font-bold text-red-600 mt-3 bg-red-50 border border-red-200/60 p-2.5 rounded-xl">{err}</p>}
      </div>

      {quiz && (
        <div className="wander-bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="text-lg font-black wander-text-dark">Topic: <span className="underline decoration-slate-300 underline-offset-4">{quiz.topic}</span></h3>
            {answeredCount === quiz.questions.length && (
              <span className="text-sm font-black wander-text-dark bg-slate-100 border border-slate-200 px-3 py-1 rounded-xl">
                Score: {score}/{quiz.questions.length}
              </span>
            )}
          </div>
          {quiz.note && <p className="text-xs font-semibold text-amber-700 bg-amber-50 rounded-xl border border-amber-200/50 p-3">{quiz.note}</p>}

          <div className="space-y-6 divide-y divide-slate-100">
            {quiz.questions.map((q, qi) => {
              const chosen = answers[qi]
              const answered = chosen !== undefined
              return (
                <div key={qi} className={`pt-6 first:pt-0 ${answered ? 'opacity-100' : ''}`}>
                  <p className="font-black wander-text-dark mb-3 text-sm leading-relaxed">
                    {qi + 1}. {q.question}
                  </p>
                  <div className="space-y-2">
                    {q.options.map((opt, oi) => {
                      let cls = 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 wander-text-dark'
                      if (answered) {
                        if (oi === q.answer_index) cls = 'border-emerald-400 bg-emerald-50 text-emerald-800 font-extrabold shadow-sm'
                        else if (oi === chosen) cls = 'border-rose-400 bg-rose-50 text-rose-800 font-extrabold'
                        else cls = 'border-slate-100 text-slate-400 opacity-60'
                      }
                      return (
                        <button
                          key={oi}
                          onClick={() => choose(qi, oi)}
                          disabled={answered}
                          className={`w-full text-left text-xs md:text-sm border rounded-xl px-4 py-3.5 transition font-semibold flex items-center justify-between ${cls} cursor-pointer`}
                        >
                          <span>{String.fromCharCode(65 + oi)}. {opt}</span>
                          {answered && oi === q.answer_index && (
                            <span className="text-[10px] uppercase tracking-wider font-extrabold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded border border-emerald-300/40">Correct</span>
                          )}
                          {answered && oi === chosen && oi !== q.answer_index && (
                            <span className="text-[10px] uppercase tracking-wider font-extrabold text-rose-700 bg-rose-100/60 px-2 py-0.5 rounded border border-rose-300/40">Selected</span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                  {answered && q.explanation && (
                    <div className="text-xs text-slate-500 font-semibold bg-slate-50 border border-slate-200/50 rounded-xl p-3.5 mt-3.5 leading-relaxed">
                      <span className="wander-text-dark font-black">Explanation:</span> {q.explanation}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          
          {answeredCount === quiz.questions.length && quiz.questions.length > 0 && (
            <div className="pt-6 border-t border-gray-200 flex flex-col items-center">
              <h3 className="text-xl font-bold text-gray-800 mb-2">Quiz Completed!</h3>
              <p className="text-gray-600 mb-6">You scored {score} out of {quiz.questions.length}.</p>
              <button 
                onClick={generate} 
                disabled={loading}
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg transition-colors"
              >
                {loading ? 'Generating new set...' : 'Retake with New Questions'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default PreparationHub
