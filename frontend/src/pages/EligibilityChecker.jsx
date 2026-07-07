import { useEffect, useState } from 'react'
import API from '../api/axios'

const inputClass =
  'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400'

function EligibilityChecker() {
  const [options, setOptions] = useState({ qualifications: [], categories: [], states: [] })
  const [form, setForm] = useState({ age: '', qualification: 'graduate', category: 'general', state: '' })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')
  const [onlyEligible, setOnlyEligible] = useState(false)

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const { data } = await API.get('/eligibility/options')
        if (alive) setOptions(data)
      } catch (error) {
        console.error('Options load error:', error)
      }
    })()
    return () => {
      alive = false
    }
  }, [])

  const check = async () => {
    const age = Number(form.age)
    if (!age || age < 10 || age > 100) {
      setErr('Sahi age daalein (10–100).')
      return
    }
    setErr('')
    setLoading(true)
    setResult(null)
    try {
      const { data } = await API.post('/eligibility/check', { ...form, age })
      setResult(data)
    } catch (error) {
      setErr(error?.response?.data?.detail?.[0]?.msg || 'Check nahi ho paya.')
    } finally {
      setLoading(false)
    }
  }

  const visible = result
    ? onlyEligible
      ? result.results.filter((r) => r.eligible)
      : result.results
    : []

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6">
      <h1 className="text-4xl font-bold text-center text-blue-600 mb-2">🎓 Eligibility Checker</h1>
      <p className="text-center text-gray-500 mb-8">
        Age, qualification aur category daalo — dekho kaunse exams ke liye eligible ho
      </p>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Form */}
        <div className="bg-white p-6 rounded-xl shadow">
          <div className="grid md:grid-cols-4 gap-3">
            <label className="text-xs text-gray-500">Age
              <input
                type="number"
                min="10"
                max="100"
                className={inputClass}
                placeholder="e.g. 24"
                value={form.age}
                onChange={(e) => setForm({ ...form, age: e.target.value })}
              />
            </label>
            <label className="text-xs text-gray-500">Qualification
              <select
                className={inputClass}
                value={form.qualification}
                onChange={(e) => setForm({ ...form, qualification: e.target.value })}
              >
                {options.qualifications.map((q) => (
                  <option key={q.value} value={q.value}>{q.label}</option>
                ))}
              </select>
            </label>
            <label className="text-xs text-gray-500">Category
              <select
                className={inputClass}
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {options.categories.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}{c.relaxation ? ` (+${c.relaxation} yr)` : ''}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs text-gray-500">State
              <select
                className={inputClass}
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
              >
                <option value="">Select...</option>
                {options.states.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </label>
          </div>
          {err && <p className="text-sm text-red-500 mt-3">{err}</p>}
          <button onClick={check} disabled={loading} className="neon-btn w-full mt-4">
            {loading ? 'Check kar rahe...' : 'Check Eligibility'}
          </button>
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <p className="text-gray-700">
                <span className="text-2xl font-bold text-green-600">{result.eligible_count}</span>
                <span className="text-gray-400"> / {result.total} exams me eligible</span>
                {result.relaxation_applied > 0 && (
                  <span className="ml-2 text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                    +{result.relaxation_applied} yr age relaxation lagu
                  </span>
                )}
              </p>
              <label className="text-sm text-gray-500 flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={onlyEligible}
                  onChange={(e) => setOnlyEligible(e.target.checked)}
                />
                Sirf eligible dikhao
              </label>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {visible.map((r) => (
                <div
                  key={r.name}
                  className={`bg-white p-5 rounded-xl shadow border-l-4 ${
                    r.eligible ? 'border-green-400' : 'border-red-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-gray-800">{r.name}</h3>
                      <p className="text-xs text-gray-400">{r.sector}</p>
                    </div>
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded-full shrink-0 ${
                        r.eligible ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {r.eligible ? '✅ Eligible' : '❌ Not eligible'}
                    </span>
                  </div>

                  <div className="text-xs text-gray-500 mt-2 space-y-0.5">
                    <p>🎂 Age: {r.age_window}</p>
                    <p>🎓 Qualification: {r.min_qualification}</p>
                  </div>

                  {!r.eligible && r.reasons.length > 0 && (
                    <ul className="mt-2 text-xs text-red-600 list-disc list-inside">
                      {r.reasons.map((reason, i) => (
                        <li key={i}>{reason}</li>
                      ))}
                    </ul>
                  )}

                  {r.state_note && <p className="mt-2 text-xs text-yellow-600">📍 {r.state_note}</p>}
                  {r.note && <p className="mt-2 text-xs text-gray-500">{r.note}</p>}

                  {r.link && (
                    <a
                      href={r.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-2 text-xs text-blue-500 hover:underline"
                    >
                      Official site →
                    </a>
                  )}
                </div>
              ))}
            </div>

            <p className="text-xs text-gray-400 text-center">
              ⚠️ Ye general guidance hai. Final eligibility ke liye official notification zarur padho.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default EligibilityChecker
