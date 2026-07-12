import { useState } from 'react'
import API from '../api/axios'

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

    const ringColor = (s) =>
        s >= 85 ? 'oklch(62% 0.15 150)' : s >= 70 ? 'oklch(65% 0.14 230)' : s >= 55 ? 'oklch(72% 0.15 75)' : 'oklch(62% 0.19 25)'

    const inputClass = 'w-full bg-slate-100/50 hover:bg-slate-200/40 border border-slate-200 focus:bg-white text-slate-800 wander-search-input text-xs rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-semibold'

    return (
        <div className="wander-light-theme min-h-screen p-4 md:p-8 md:pl-24 flex flex-col font-sans select-none overflow-x-hidden relative">
            {/* UHD Background Wallpaper */}
            <img
                src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1600&auto=format&fit=crop&q=80"
                alt="ATS Score Background"
                className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none z-0"
            />
            {/* Soft Pure White Overlay */}
            <div className="absolute inset-0 z-0 bg-[#f8fafc]/75 backdrop-blur-[2px] pointer-events-none" />

            <div className="max-w-5xl mx-auto w-full space-y-8 relative z-10">
                {/* Page Header */}
                <div className="text-center space-y-3">
                    <h1 className="text-4xl md:text-5xl font-black wander-text-dark tracking-tight">ATS Resume Score</h1>
                    <p className="text-xs md:text-sm font-bold text-slate-500 max-w-lg mx-auto">
                        See how your resume scores against an Applicant Tracking System, and get actionable suggestions to optimize it.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 items-start">
                    {/* Input Form Card */}
                    <div className="wander-bg-white border border-slate-200/80 p-6 md:p-8 rounded-3xl shadow-xl space-y-5">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-700">Resume (PDF)</label>
                            <div className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-2xl p-6 text-center cursor-pointer transition-all bg-slate-50/50 relative">
                                <input
                                    type="file"
                                    accept="application/pdf"
                                    onChange={(e) => setFile(e.target.files[0])}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <div className="space-y-1">
                                    <span className="text-xs font-bold text-slate-700 block">
                                        {file ? file.name : "Click or drag your PDF resume here"}
                                    </span>
                                    <span className="text-[10px] text-slate-400 block">PDF format only</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-700">Target Role (optional)</label>
                            <input 
                                className={inputClass} 
                                placeholder="e.g. Backend Developer" 
                                value={role} 
                                onChange={(e) => setRole(e.target.value)} 
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-700">
                                Job Description (optional, for custom match)
                            </label>
                            <textarea 
                                className={inputClass} 
                                rows={4} 
                                placeholder="Paste the job description here..." 
                                value={jd} 
                                onChange={(e) => setJd(e.target.value)} 
                            />
                        </div>

                        {error && <p className="text-xs font-bold text-rose-500">{error}</p>}
                        
                        <button
                            onClick={submit}
                            disabled={loading}
                            className="w-full bg-[#0f172a] hover:bg-blue-600 text-white text-xs font-bold py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center cursor-pointer disabled:opacity-50"
                        >
                            {loading ? 'Analyzing Resume...' : 'Score My Resume'}
                        </button>
                    </div>

                    {/* Results Container */}
                    <div className="space-y-6">
                        {result ? (
                            <div className="wander-bg-white border border-slate-200/80 p-6 md:p-8 rounded-3xl shadow-xl space-y-6">
                                {/* Score header */}
                                <div className="flex items-center gap-6 p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                                    <div
                                        className="relative grid h-24 w-24 flex-none place-items-center rounded-full shadow"
                                        style={{
                                            background: `conic-gradient(${ringColor(result.score)} ${result.score * 3.6}deg, #e2e8f0 0deg)`,
                                        }}
                                    >
                                        <div className="grid h-18 w-18 place-items-center rounded-full bg-white shadow-sm">
                                            <span className="text-2xl font-black animate-pulse" style={{ color: ringColor(result.score) }}>
                                                {result.score}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-lg font-black text-slate-800">{result.rating}</div>
                                        <p className="text-xs font-bold text-slate-400">
                                            Scored against {jd.trim() ? 'the custom job description' : role.trim() ? `the ${role} role` : 'a general tech baseline'}.
                                        </p>
                                    </div>
                                </div>

                                {/* Breakdown bars */}
                                <div className="space-y-3">
                                    <h2 className="text-xs uppercase tracking-widest font-black text-slate-700">Score Breakdown</h2>
                                    <div className="space-y-4">
                                        {result.breakdown.map((b) => (
                                            <div key={b.label} className="space-y-1">
                                                <div className="flex justify-between items-baseline text-xs font-bold">
                                                    <span className="text-slate-700">{b.label}</span>
                                                    <span className="text-slate-500">{b.score}/{b.max}</span>
                                                </div>
                                                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 border border-slate-200/50">
                                                    <div
                                                        className="h-full rounded-full transition-all duration-700 bg-blue-500"
                                                        style={{ width: `${(b.score / b.max) * 100}%` }}
                                                    />
                                                </div>
                                                <p className="text-[10px] text-slate-400 font-medium">{b.detail}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Fixes */}
                                {result.fixes?.length > 0 && (
                                    <div className="space-y-2">
                                        <h2 className="text-xs uppercase tracking-widest font-black text-rose-500">Priority Fixes</h2>
                                        <ul className="space-y-2">
                                            {result.fixes.map((f, i) => (
                                                <li key={i} className="flex gap-2.5 text-xs text-slate-700 bg-rose-50/40 border border-rose-100 p-3 rounded-xl leading-relaxed">
                                                    <span className="font-extrabold text-rose-500">{i + 1}.</span>
                                                    <span>{f}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Keyword chips */}
                                <div className="grid gap-6 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <h3 className="text-xs uppercase tracking-widest font-black text-emerald-600">Matched Keywords</h3>
                                        <div className="flex flex-wrap gap-1.5">
                                            {result.matched_keywords.length === 0 && <span className="text-xs font-bold text-slate-400">None found.</span>}
                                            {result.matched_keywords.map((k) => (
                                                <span key={k} className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-xs font-semibold text-emerald-700">{k}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-xs uppercase tracking-widest font-black text-rose-500">Missing Keywords</h3>
                                        <div className="flex flex-wrap gap-1.5">
                                            {result.missing_keywords.length === 0 && <span className="text-xs font-bold text-slate-400">None missing.</span>}
                                            {result.missing_keywords.map((k) => (
                                                <span key={k} className="rounded-full bg-rose-50 border border-rose-200 px-2.5 py-1 text-xs font-semibold text-rose-700">{k}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* AI suggestions */}
                                {result.ai_suggestions?.length > 0 && (
                                    <div className="bg-blue-50/60 border border-blue-200/80 p-4 rounded-2xl space-y-2">
                                        <h2 className="text-xs uppercase tracking-widest font-black text-blue-700">AI Recommendations</h2>
                                        <ul className="space-y-1.5 list-disc list-inside">
                                            {result.ai_suggestions.map((s, i) => (
                                                <li key={i} className="text-xs text-slate-700 leading-relaxed">{s}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
							</div>
                        ) : (
                            <div className="wander-bg-white border border-slate-200/80 p-8 rounded-3xl shadow-xl text-center text-slate-400 flex flex-col items-center justify-center min-h-[350px] space-y-3">
                                <span className="text-4xl">📄</span>
                                <p className="text-xs font-bold text-slate-400">Your resume ATS score card and improvement tips will appear here after analysis.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}