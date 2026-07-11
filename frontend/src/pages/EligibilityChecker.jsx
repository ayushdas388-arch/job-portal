import { useEffect, useState } from 'react'
import API from '../api/axios'
import BrandIcon from '../components/BrandIcon'
import { FaSearch, FaUserCheck, FaInfoCircle, FaTimes, FaPlus } from 'react-icons/fa'

const inputClass =
  'w-full bg-slate-100 hover:bg-slate-200/50 border border-slate-200 focus:bg-white text-slate-800 wander-search-input text-xs rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium mt-1.5'

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
    <div className="wander-light-theme relative min-h-screen p-4 md:p-8 flex flex-col items-center justify-start font-sans select-none overflow-x-hidden">
      {/* Specific HD Eligibility Wallpaper */}
      <img 
        src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1600&auto=format&fit=crop&q=80" 
        alt="Eligibility background" 
        className="absolute inset-0 w-full h-full object-cover"
      />
      {/* Soft Light Overlay */}
      <div className="absolute inset-0 bg-[#f8fafc]/85 backdrop-blur-[2px]" />

      <div className="relative z-10 max-w-4xl w-full space-y-8">
        
        {/* Page Header */}
        <div className="text-center space-y-2 py-4">
          <div className="text-xs font-bold text-blue-600 uppercase tracking-widest block">Core Tool</div>
          <h1 className="text-3xl md:text-4xl font-extrabold wander-text-dark tracking-tight">Eligibility Checker</h1>
          <p className="text-sm text-slate-500 max-w-xl mx-auto leading-relaxed">
            Enter your age, qualifications, and category details to check which public and private exams you are eligible to apply for.
          </p>
        </div>

        {/* Input Card Form */}
        <div className="wander-bg-white border border-slate-200/80 p-6 md:p-8 rounded-3xl shadow-xl space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            {/* Age input */}
            <div className="flex flex-col">
              <span className="text-[10px] font-bold wander-text-dark uppercase tracking-wider">Candidate Age *</span>
              <input
                type="number"
                min="18"
                max="55"
                className={inputClass}
                placeholder="e.g. 21"
                value={form.age}
                onChange={(e) => setForm({ ...form, age: e.target.value })}
              />
            </div>

            {/* Category selection */}
            <div className="flex flex-col">
              <span className="text-[10px] font-bold wander-text-dark uppercase tracking-wider">Category *</span>
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
            </div>

            {/* Job Type selection */}
            <div className="flex flex-col">
              <span className="text-[10px] font-bold wander-text-dark uppercase tracking-wider">Job Type *</span>
              <select
                className={inputClass}
                value={form.job_type}
                onChange={(e) => setForm({ ...form, job_type: e.target.value })}
              >
                {options.job_types?.map((j) => (
                  <option key={j.value} value={j.value}>{j.label}</option>
                ))}
              </select>
            </div>

            {/* State selection */}
            <div className="flex flex-col">
              <span className="text-[10px] font-bold wander-text-dark uppercase tracking-wider">Domicile State</span>
              <select
                className={inputClass}
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
              >
                <option value="">Select State...</option>
                {options.states.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Qualifications Block */}
          <div className="space-y-2 border-t border-slate-100 pt-4">
            <span className="text-[10px] font-bold wander-text-dark uppercase tracking-wider block mb-1">Qualifying Degrees *</span>
            <div className="space-y-3">
              {form.qualifications.map((q, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <select
                    className="w-full bg-slate-100 hover:bg-slate-200/50 border border-slate-200 focus:bg-white text-slate-800 wander-search-input text-xs rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
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
                    <button 
                      type="button" 
                      onClick={() => {
                        const newQ = form.qualifications.filter((_, i) => i !== idx);
                        setForm({ ...form, qualifications: newQ });
                      }} 
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2.5 rounded-xl transition-all cursor-pointer"
                      title="Remove"
                    >
                      <FaTimes className="text-xs" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button 
              type="button" 
              onClick={() => setForm({ ...form, qualifications: [...form.qualifications, 'graduate'] })} 
              className="text-blue-600 hover:text-blue-800 text-xs font-bold mt-2 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <FaPlus className="text-[10px]" /> Add Qualification
            </button>
          </div>

          {/* Demographics Block */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-slate-100 pt-5">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold wander-text-dark uppercase tracking-wider">Gender</span>
              <select
                className={inputClass}
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value })}
              >
                <option value="any">Any Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold wander-text-dark uppercase tracking-wider">Marital Status</span>
              <select
                className={inputClass}
                value={form.marital_status}
                onChange={(e) => setForm({ ...form, marital_status: e.target.value })}
              >
                <option value="any">Any Status</option>
                <option value="unmarried">Unmarried</option>
                <option value="married">Married</option>
              </select>
            </div>
            <div className="flex items-center pt-5">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500/20 cursor-pointer"
                  checked={form.physical_fitness}
                  onChange={(e) => setForm({ ...form, physical_fitness: e.target.checked })}
                />
                <span className="text-xs font-semibold text-slate-600 select-none">
                  Meet standard physical & medical requirements
                </span>
              </label>
            </div>
          </div>

          {err && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-xs font-semibold p-3.5 rounded-xl text-center animate-in fade-in duration-200">
              {err}
            </div>
          )}

          <button 
            onClick={check} 
            disabled={loading} 
            className="w-full bg-[#0f172a] hover:bg-blue-600 disabled:bg-slate-400 text-white text-xs font-bold py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg disabled:shadow-none flex items-center justify-center cursor-pointer"
          >
            {loading ? 'Checking...' : 'Check Eligibility'}
          </button>
        </div>

        {/* Results Block */}
        {result && (
          <div className="space-y-6 animate-in fade-in duration-300">
            
            <div className="flex items-center justify-between flex-wrap gap-2 py-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="text-3xl font-black text-green-600">{result.eligible_count}</span>
                <span className="text-sm font-bold text-slate-400">/ {result.total} Exams Eligible</span>
                {result.relaxation_applied > 0 && (
                  <span className="ml-2 text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100 px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0">
                    +{result.relaxation_applied} Yr Age Relaxation Applied
                  </span>
                )}
              </div>
              <label className="text-xs font-bold text-slate-500 flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500/20 cursor-pointer"
                  checked={onlyEligible}
                  onChange={(e) => setOnlyEligible(e.target.checked)}
                />
                Show only eligible exams
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {visible.map((r) => (
                <div
                  key={r.name}
                  className={`p-5 rounded-2xl border wander-bg-white border-slate-200/80 shadow-sm hover:shadow-md transition-shadow relative border-l-4 ${
                    r.eligible ? 'border-l-green-500' : 'border-l-red-500'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <h3 className="font-bold text-sm wander-text-dark leading-snug">{r.name}</h3>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">{r.sector}</p>
                    </div>
                    <span
                      className={`text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0 ${
                        r.eligible ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'
                      }`}
                    >
                      {r.eligible ? 'Eligible' : 'Not eligible'}
                    </span>
                  </div>

                  <div className="text-xs space-y-1 text-slate-500 mt-4 pt-3 border-t border-slate-100">
                    <div className="flex justify-between">
                      <span className="font-medium text-slate-400">Age Limit:</span>
                      <span className="font-bold wander-text-dark">{r.age_window}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-slate-400">Min Degree:</span>
                      <span className="font-bold wander-text-dark">{r.min_qualification}</span>
                    </div>
                  </div>

                  {!r.eligible && r.reasons.length > 0 && (
                    <div className="mt-3 bg-red-50/50 border border-red-100 p-3 rounded-xl">
                      <p className="text-[10px] font-bold text-red-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <FaInfoCircle /> Reasons:
                      </p>
                      <ul className="text-[11px] text-red-600 list-disc list-inside space-y-0.5 font-medium">
                        {r.reasons.map((reason, i) => (
                          <li key={i}>{reason}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {r.state_note && <p className="mt-3 text-xs text-yellow-700 font-semibold bg-yellow-50/50 border border-yellow-100 p-2.5 rounded-xl">{r.state_note}</p>}
                  {r.note && <p className="mt-3 text-xs text-slate-500 font-medium bg-slate-50 border border-slate-100 p-2.5 rounded-xl">{r.note}</p>}

                  {r.link && (
                    <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
                      <a
                        href={r.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <BrandIcon url={r.link} className="w-3.5 h-3.5" /> Visit official portal <span aria-hidden="true">&rarr;</span>
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="text-center py-4 bg-slate-50 border border-dashed border-slate-200 rounded-2xl max-w-xl mx-auto">
              <p className="text-[11px] text-slate-400 font-semibold leading-relaxed px-4">
                Disclaimer: The result shown above is for primary guidance based on core criteria. Candidates are requested to refer to the official exam notifications for full eligibility conditions.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default EligibilityChecker
