import { useState } from 'react'
import API from '../api/axios'

/**
 * ATS Score page.
 *
 * Upload a resume PDF, optionally add a target role or paste a job
 * description, and get a 0-100 ATS score with a breakdown and concrete fixes.
 *
 * Backend: POST /ats/score  (multipart: file, target_role, job_description)
 * Add a route in App.jsx: <Route path="/ats" element={<ATSScore />} />
 */
export default function ATSScore() {
    const [file, setFile] = useState(null)
    const [role, setRole] = useState('')
    const [jd, setJd] = useState('')
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState(null)
    const [error, setError] = useState('')

    const submit = async () => {
        if (!file) {
            setError('Please choose a PDF resume first.')
            return
        }
        setError('')
        setLoading(true)
        setResult(null)
        try {
            const fd = new FormData()
            fd.append('file', file)
            fd.append('target_role', role)
            fd.append('job_description', jd)
            const { data } = await API.post('/ats/score', fd, {
                headers: { 'Content-Type': 'multipart/form-data' },
            })
            setResult(data)
        } catch (err) {
            setError(err?.response?.data?.detail || 'Something went wrong scoring the resume.')
        } finally {
            setLoading(false)
        }
    }

    // Color the score ring by band.
    const ringColor = (s) =>
        s >= 85 ? 'oklch(62% 0.15 150)' : s >= 70 ? 'oklch(65% 0.14 230)' : s >= 55 ? 'oklch(72% 0.15 75)' : 'oklch(62% 0.19 25)'

    const input = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400'

    return (
        <div className="max-w-3xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-1">ATS Resume Score</h1>
            <p className="text-gray-500 mb-6">
                See how your resume scores against an Applicant Tracking System, and exactly what to fix.
            </p>

            {/* Input card */}
            <div className="space-y-4 rounded-xl border border-gray-200 p-5">
                <div>
                    <label className="text-sm font-medium text-gray-700">Resume (PDF)</label>
                    <input
                        type="file"
                        accept="application/pdf"
                        onChange={(e) => setFile(e.target.files[0])}
                        className="block mt-1 text-sm"
                    />
                    {file && <span className="text-xs text-green-600">{file.name}</span>}
                </div>
                <div>
                    <label className="text-sm font-medium text-gray-700">Target role (optional)</label>
                    <input className={input} placeholder="e.g. Backend Developer" value={role} onChange={(e) => setRole(e.target.value)} />
                </div>
                <div>
                    <label className="text-sm font-medium text-gray-700">
                        Job description (optional, gives a sharper score)
                    </label>
                    <textarea className={input} rows={4} placeholder="Paste the job description here..." value={jd} onChange={(e) => setJd(e.target.value)} />
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <button
                    onClick={submit}
                    disabled={loading}
                    className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                    {loading ? 'Scoring...' : 'Score my resume'}
                </button>
            </div>

            {/* Results */}
            {result && (
                <div className="mt-8 space-y-6">
                    {/* Score header */}
                    <div className="flex items-center gap-6">
                        <div
                            className="relative grid h-28 w-28 flex-none place-items-center rounded-full"
                            style={{
                                background: `conic-gradient(${ringColor(result.score)} ${result.score * 3.6}deg, oklch(93% 0.01 260) 0deg)`,
                            }}
                        >
                            <div className="grid h-20 w-20 place-items-center rounded-full bg-white">
                                <span className="text-2xl font-bold" style={{ color: ringColor(result.score) }}>
                                    {result.score}
                                </span>
                            </div>
                        </div>
                        <div>
                            <div className="text-lg font-semibold">{result.rating}</div>
                            <p className="text-sm text-gray-500">
                                Scored against {jd.trim() ? 'the job description' : role.trim() ? `the ${role} role` : 'a general tech baseline'}.
                            </p>
                        </div>
                    </div>

                    {/* Breakdown bars */}
                    <div>
                        <h2 className="mb-3 font-semibold">Breakdown</h2>
                        <div className="space-y-3">
                            {result.breakdown.map((b) => (
                                <div key={b.label}>
                                    <div className="flex items-baseline justify-between text-sm">
                                        <span className="font-medium text-gray-700">{b.label}</span>
                                        <span className="text-gray-500">{b.score}/{b.max}</span>
                                    </div>
                                    <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-[oklch(93%_0.01_260)]">
                                        <div
                                            className="h-full rounded-full"
                                            style={{ width: `${(b.score / b.max) * 100}%`, background: 'oklch(60% 0.13 250)' }}
                                        />
                                    </div>
                                    <p className="mt-0.5 text-xs text-gray-500">{b.detail}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Fixes */}
                    {result.fixes?.length > 0 && (
                        <div>
                            <h2 className="mb-2 font-semibold">Priority fixes</h2>
                            <ul className="space-y-2">
                                {result.fixes.map((f, i) => (
                                    <li key={i} className="flex gap-2 text-sm text-gray-700">
                                        <span className="font-semibold text-blue-600">{i + 1}.</span>
                                        <span>{f}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Keyword chips */}
                    <div className="grid gap-6 sm:grid-cols-2">
                        <div>
                            <h3 className="mb-2 text-sm font-semibold text-gray-700">Matched keywords</h3>
                            <div className="flex flex-wrap gap-2">
                                {result.matched_keywords.length === 0 && <span className="text-sm text-gray-400">None found.</span>}
                                {result.matched_keywords.map((k) => (
                                    <span key={k} className="rounded-full bg-[oklch(95%_0.04_150)] px-3 py-1 text-xs text-[oklch(40%_0.1_150)]">{k}</span>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h3 className="mb-2 text-sm font-semibold text-gray-700">Missing keywords</h3>
                            <div className="flex flex-wrap gap-2">
                                {result.missing_keywords.length === 0 && <span className="text-sm text-gray-400">Great, nothing major missing.</span>}
                                {result.missing_keywords.map((k) => (
                                    <span key={k} className="rounded-full bg-[oklch(95%_0.04_25)] px-3 py-1 text-xs text-[oklch(45%_0.15_25)]">{k}</span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* AI suggestions (optional) */}
                    {result.ai_suggestions?.length > 0 && (
                        <div className="rounded-xl border border-gray-200 p-5">
                            <h2 className="mb-2 font-semibold">AI suggestions</h2>
                            <ul className="space-y-2">
                                {result.ai_suggestions.map((s, i) => (
                                    <li key={i} className="text-sm text-gray-700">{s}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}