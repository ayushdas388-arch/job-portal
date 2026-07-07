import { useEffect, useState } from 'react'
import API from '../api/axios'

const TABS = [
  { key: 'resources', label: '📚 Resources' },
  { key: 'plan', label: '🗓️ Study Plan' },
  { key: 'quiz', label: '📝 Practice Quiz' },
]

function PreparationHub() {
  const [tab, setTab] = useState('resources')

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6">
      <h1 className="text-4xl font-bold text-center text-blue-600 mb-2">🎯 Preparation Hub</h1>
      <p className="text-center text-gray-500 mb-8">Resources, AI study plan aur practice quiz — ek hi jagah</p>

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
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------- Resources */

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
                  className="text-sm text-gray-700 hover:text-blue-600 hover:underline"
                >
                  🔗 {r.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

/* --------------------------------------------------------------- StudyPlan */

const inputClass =
  'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400'

function StudyPlan() {
  const [form, setForm] = useState({ target: '', exam_date: '', hours_per_day: 3, level: 'beginner' })
  const [plan, setPlan] = useState(null)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  const generate = async () => {
    if (!form.target.trim()) {
      setErr('Target likho (jaise "SSC CGL" ya "Frontend Interview").')
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
      setErr(error?.response?.data?.detail?.[0]?.msg || 'Plan generate nahi hua.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-white p-6 rounded-xl shadow space-y-3">
        <div className="grid md:grid-cols-2 gap-3">
          <label className="text-xs text-gray-500">Kis cheez ki tayari?
            <input
              className={inputClass}
              placeholder="SSC CGL / Bank PO / React Interview..."
              value={form.target}
              onChange={(e) => setForm({ ...form, target: e.target.value })}
            />
          </label>
          <label className="text-xs text-gray-500">Exam / target date (optional)
            <input
              type="date"
              className={inputClass}
              value={form.exam_date}
              onChange={(e) => setForm({ ...form, exam_date: e.target.value })}
            />
          </label>
          <label className="text-xs text-gray-500">Roz kitne ghante?
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
          {loading ? 'Ban raha hai...' : 'Generate Study Plan'}
        </button>
      </div>

      {plan && (
        <div className="bg-white p-6 rounded-xl shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">{plan.target} — {plan.weeks} weeks</h3>
            <span className={`text-xs px-2 py-0.5 rounded-full ${plan.source === 'gemini' ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-500'}`}>
              {plan.source === 'gemini' ? '✨ AI' : 'Basic'}
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

/* -------------------------------------------------------------------- Quiz */

function Quiz() {
  const [topic, setTopic] = useState('')
  const [quiz, setQuiz] = useState(null)
  const [answers, setAnswers] = useState({}) // index -> chosen option index
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  const generate = async () => {
    if (!topic.trim()) {
      setErr('Topic likho (jaise "Aptitude", "Python", "SQL").')
      return
    }
    setErr('')
    setLoading(true)
    setQuiz(null)
    setAnswers({})
    try {
      const { data } = await API.post('/prep/quiz', { topic, count: 5 })
      setQuiz(data)
    } catch (error) {
      setErr(error?.response?.data?.detail?.[0]?.msg || 'Quiz generate nahi hua.')
    } finally {
      setLoading(false)
    }
  }

  const choose = (qi, oi) => {
    if (answers[qi] !== undefined) return // lock after answering
    setAnswers((a) => ({ ...a, [qi]: oi }))
  }

  const score = quiz
    ? quiz.questions.reduce((acc, q, i) => acc + (answers[i] === q.answer_index ? 1 : 0), 0)
    : 0
  const answeredCount = Object.keys(answers).length

  return (
    <div className="space-y-4">
      <div className="bg-white p-6 rounded-xl shadow">
        <div className="flex gap-2">
          <input
            className={inputClass}
            placeholder="Topic: Aptitude / Reasoning / Python / SQL / DBMS..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && generate()}
          />
          <button onClick={generate} disabled={loading} className="neon-btn shrink-0">
            {loading ? '...' : 'Start Quiz'}
          </button>
        </div>
        {err && <p className="text-sm text-red-500 mt-2">{err}</p>}
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
                        {answered && oi === q.answer_index && ' ✅'}
                        {answered && oi === chosen && oi !== q.answer_index && ' ❌'}
                      </button>
                    )
                  })}
                </div>
                {answered && q.explanation && (
                  <p className="text-xs text-gray-500 mt-2">💡 {q.explanation}</p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default PreparationHub
