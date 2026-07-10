import { useEffect, useState } from 'react'
import API from '../api/axios'
import BrandIcon from '../components/BrandIcon'

const inputClass =
  'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400'

function EligibilityChecker() {
  const [options, setOptions] = useState({ qualifications: [], categories: [], job_types: [], states: [] })
  const [form, setForm] = useState({ 
    age: '', qualifications: ['graduate'], category: 'general', job_type: 'all', state: '',
    gender: 'any', marital_status: 'any', physical_fitness: true
  })
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
    if (!age || age < 18 || age > 55) {
      setErr('Please enter a valid age (18-55).')
      return
    }
    setErr('')
    setLoading(true)
    setResult(null)
    try {
      const { data } = await API.post('/eligibility/check', { ...form, age })
      setResult(data)
    } catch (error) {
      setErr(error?.response?.data?.detail?.[0]?.msg || 'Could not check. Please try again.')
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
      <h1 className="text-4xl font-bold text-center text-blue-600 mb-2">Eligibility Checker</h1>
      <p className="text-center text-gray-500 mb-8">
        Enter your age, qualification, and category to see which exams you are eligible for.
      </p>

      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white p-6 rounded-xl shadow">
          <div className="grid md:grid-cols-4 gap-4 mb-4">
            <label className="text-xs text-gray-500">Age
              <input
                type="number"
                min="18"
                max="55"
                className={inputClass}
                placeholder="18-55"
                value={form.age}
                onChange={(e) => setForm({ ...form, age: e.target.value })}
              />
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
            <label className="text-xs text-gray-500">Job Type
              <select
                className={inputClass}
                value={form.job_type}
                onChange={(e) => setForm({ ...form, job_type: e.target.value })}
              >
                {options.job_types?.map((j) => (
                  <option key={j.value} value={j.value}>{j.label}</option>
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

          <div className="mb-4">
            <label className="text-xs text-gray-500">Qualifications</label>
            <div className="space-y-2 mt-1">
              {form.qualifications.map((q, idx) => (
                <div key={idx} className="flex gap-2">
                  <select
                    className={inputClass}
                    value={q}
                    onChange={(e) => {
                      const newQ = [...form.qualifications];
                      newQ[idx] = e.target.value;
                      setForm({ ...form, qualifications: newQ });
                    }}
                  >
                    {options.qualifications.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  {form.qualifications.length > 1 && (
                    <button type="button" onClick={() => {
                      const newQ = form.qualifications.filter((_, i) => i !== idx);
                      setForm({ ...form, qualifications: newQ });
                    }} className="text-red-500 hover:text-red-700 text-sm px-2 font-bold">✕</button>
                  )}
                </div>
              ))}
            </div>
            <button 
              type="button" 
              onClick={() => setForm({ ...form, qualifications: [...form.qualifications, 'graduate'] })} 
              className="text-blue-600 hover:text-blue-800 text-xs font-semibold mt-2"
            >
              + Add Qualification
            </button>
          </div>
          <div className="grid md:grid-cols-3 gap-4 border-t border-gray-100 pt-4">
            <label className="text-xs text-gray-500">Gender
              <select
                className={inputClass}
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value })}
              >
                <option value="any">Any</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </label>
            <label className="text-xs text-gray-500">Marital Status
              <select
                className={inputClass}
                value={form.marital_status}
                onChange={(e) => setForm({ ...form, marital_status: e.target.value })}
              >
                <option value="any">Any</option>
                <option value="unmarried">Unmarried</option>
                <option value="married">Married</option>
              </select>
            </label>
            <label className="text-xs text-gray-500 flex flex-col justify-end pb-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                  checked={form.physical_fitness}
                  onChange={(e) => setForm({ ...form, physical_fitness: e.target.checked })}
                />
                <span className="text-sm font-medium text-gray-700 cursor-pointer" onClick={() => setForm({ ...form, physical_fitness: !form.physical_fitness })}>
                  Meet standard physical & medical requirements
                </span>
              </div>
            </label>
          </div>
          {err && <p className="text-sm text-red-500 mt-3">{err}</p>}
          <button onClick={check} disabled={loading} className="neon-btn w-full mt-4">
            {loading ? 'Checking...' : 'Check Eligibility'}
          </button>
        </div>

        {result && (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <p className="text-gray-700">
                <span className="text-2xl font-bold text-green-600">{result.eligible_count}</span>
                <span className="text-gray-400"> / {result.total} exams eligible</span>
                {result.relaxation_applied > 0 && (
                  <span className="ml-2 text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                    +{result.relaxation_applied} yr age relaxation applied
                  </span>
                )}
              </p>
              <label className="text-sm text-gray-500 flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={onlyEligible}
                  onChange={(e) => setOnlyEligible(e.target.checked)}
                />
                Show only eligible
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
                      {r.eligible ? 'Eligible' : 'Not eligible'}
                    </span>
                  </div>

                  <div className="text-xs text-gray-500 mt-2 space-y-0.5">
                    <p>Age: {r.age_window}</p>
                    <p>Qualification: {r.min_qualification}</p>
                  </div>

                  {!r.eligible && r.reasons.length > 0 && (
                    <ul className="mt-2 text-xs text-red-600 list-disc list-inside">
                      {r.reasons.map((reason, i) => (
                        <li key={i}>{reason}</li>
                      ))}
                    </ul>
                  )}

                  {r.state_note && <p className="mt-2 text-xs text-yellow-600">{r.state_note}</p>}
                  {r.note && <p className="mt-2 text-xs text-gray-500">{r.note}</p>}

                  {r.link && (
                    <a
                      href={r.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-2 text-xs text-blue-500 hover:underline"
                    >
                      <BrandIcon url={r.link} className="w-3 h-3" /> Visit official site
                    </a>
                  )}
                </div>
              ))}
            </div>

            <p className="text-xs text-gray-400 text-center">
              This is general guidance only. Please read the official notification for final eligibility.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default EligibilityChecker
