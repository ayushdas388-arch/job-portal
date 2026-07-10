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
    <div className="min-h-screen bg-gray-50 py-10 px-6">
      <h1 className="text-4xl font-bold text-center text-blue-600 mb-2">Preparation Hub</h1>
      <p className="text-center text-gray-500 mb-8">Resources, an AI study plan, and a practice quiz - all in one place.</p>

      <div className="max-w-4xl mx-auto">
        <div className="flex gap-2 mb-6 justify-center flex-wrap">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                tab === t.key ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:shadow'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'resources' && <Resources />}
        {tab === 'plan' && <StudyPlan />}
        {tab === 'quiz' && <Quiz />}
        {tab === 'video' && <VideoCourses />}
      </div>
    </div>
  )
}

function VideoCourses() {
  return (
    <div className="bg-white p-12 rounded-xl shadow-lg text-center border-t-4 border-blue-600">
      <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
          <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Video Courses</h2>
      <p className="text-gray-500 max-w-md mx-auto mb-6">
        We are partnering with top educators to bring you high-quality video lectures for various competitive exams and tech stacks.
      </p>
      <span className="inline-block bg-blue-100 text-blue-700 font-bold px-4 py-2 rounded-full text-sm">
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

  if (loading) return <p className="text-center text-gray-400">Loading...</p>

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {library.map((cat) => (
        <div key={cat.category} className="bg-white p-5 rounded-xl shadow">
          <h3 className="text-lg font-bold mb-2">
            <span className="mr-2">{cat.icon}</span>
            {cat.category}
          </h3>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {cat.topics.map((t) => (
              <span key={t} className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                {t}
              </span>
            ))}
          </div>
          <ul className="space-y-1">
            {cat.resources.map((r) => (
              <li key={r.name}>
                <a
                  href={r.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-700 hover:text-blue-600 hover:underline flex items-center gap-1.5"
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
  'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400'

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
    <div className="space-y-4">
      <div className="bg-white p-6 rounded-xl shadow space-y-3">
        <div className="grid md:grid-cols-2 gap-3">
          <label className="text-xs text-gray-500">What are you preparing for?
            <input
              className={inputClass}
              placeholder="SSC CGL / Bank PO / React Interview..."
              value={form.target}
              onChange={(e) => setForm({ ...form, target: e.target.value })}
            />
          </label>
          <label className="text-xs text-gray-500">Exam or target date (optional)
            <input
              type="date"
              className={inputClass}
              value={form.exam_date}
              onChange={(e) => setForm({ ...form, exam_date: e.target.value })}
            />
          </label>
          <label className="text-xs text-gray-500">How many hours per day?
            <input
              type="number"
              min="1"
              max="16"
              className={inputClass}
              value={form.hours_per_day}
              onChange={(e) => setForm({ ...form, hours_per_day: e.target.value })}
            />
          </label>
          <label className="text-xs text-gray-500">Level
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
        {err && <p className="text-sm text-red-500">{err}</p>}
        <button onClick={generate} disabled={loading} className="neon-btn w-full">
          {loading ? 'Generating...' : 'Generate Study Plan'}
        </button>
      </div>

      {plan && (
        <div className="bg-white p-6 rounded-xl shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">{plan.target} - {plan.weeks} weeks</h3>
            <span className={`text-xs px-2 py-0.5 rounded-full ${plan.source === 'gemini' ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>
              {plan.source === 'gemini' ? 'AI' : 'Basic'}
            </span>
          </div>
          {plan.summary && <p className="text-sm text-gray-600 mb-4">{plan.summary}</p>}
          <div className="space-y-3">
            {plan.plan.map((w) => (
              <div key={w.week} className="border-l-4 border-blue-400 pl-4 py-1">
                <p className="font-semibold text-gray-800">
                  Week {w.week}: <span className="text-blue-600">{w.focus}</span>
                </p>
                <ul className="list-disc list-inside text-sm text-gray-600 mt-1">
                  {w.tasks.map((task, i) => (
                    <li key={i}>{task}</li>
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
      <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-8 rounded-2xl shadow-md border border-indigo-100">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-indigo-900 mb-2">Practice Quiz Arena</h2>
          <p className="text-indigo-700">Test your knowledge with 30+ randomized questions across different domains. Select your topic and difficulty to begin.</p>
        </div>
        <div className="flex flex-col md:flex-row gap-3">
          <input
            className={`${inputClass} flex-1 border-indigo-200 focus:border-indigo-500`}
            placeholder="Topic: Aptitude / Reasoning / Python / SQL / DBMS..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && generate()}
          />
          <select 
            className={`${inputClass} w-full md:w-48 border-indigo-200 focus:border-indigo-500`}
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
          >
            <option value="easy">Easy (Beginner)</option>
            <option value="medium">Medium (Intermediate)</option>
            <option value="hard">Hard (Advanced)</option>
          </select>
          <button onClick={generate} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg transition-colors shadow-md shrink-0">
            {loading ? 'Generating 30 Qs...' : 'Start Quiz'}
          </button>
        </div>
        {err && <p className="text-sm text-red-500 mt-3 bg-red-50 p-2 rounded">{err}</p>}
      </div>

      {quiz && (
        <div className="bg-white p-6 rounded-xl shadow space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">Topic: {quiz.topic}</h3>
            {answeredCount === quiz.questions.length && (
              <span className="text-sm font-semibold text-blue-600">
                Score: {score}/{quiz.questions.length}
              </span>
            )}
          </div>
          {quiz.note && <p className="text-xs text-yellow-600 bg-yellow-50 rounded p-2">{quiz.note}</p>}

          {quiz.questions.map((q, qi) => {
            const chosen = answers[qi]
            const answered = chosen !== undefined
            return (
              <div key={qi} className="border-b border-gray-100 pb-4 last:border-0">
                <p className="font-medium text-gray-800 mb-2">
                  {qi + 1}. {q.question}
                </p>
                <div className="space-y-1.5">
                  {q.options.map((opt, oi) => {
                    let cls = 'border-gray-200 hover:border-blue-300'
                    if (answered) {
                      if (oi === q.answer_index) cls = 'border-green-400 bg-green-50 text-green-700'
                      else if (oi === chosen) cls = 'border-red-400 bg-red-50 text-red-700'
                      else cls = 'border-gray-200 opacity-60'
                    }
                    return (
                      <button
                        key={oi}
                        onClick={() => choose(qi, oi)}
                        disabled={answered}
                        className={`w-full text-left text-sm border rounded-lg px-3 py-2 transition ${cls}`}
                      >
                        {String.fromCharCode(65 + oi)}. {opt}
                        {answered && oi === q.answer_index && ' (Correct)'}
                        {answered && oi === chosen && oi !== q.answer_index && ' (Incorrect)'}
                      </button>
                    )
                  })}
                </div>
                {answered && q.explanation && (
                  <p className="text-xs text-gray-500 mt-2">Explanation: {q.explanation}</p>
                )}
              </div>
            )
          })}
          
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
