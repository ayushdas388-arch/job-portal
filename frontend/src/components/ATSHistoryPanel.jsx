import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import API from '../api/axios'

export default function AtsHistoryPanel() {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)

    const load = async () => {
        setLoading(true)
        try {
            const res = await API.get('/dashboard/ats-history')
            setData(res.data)
        } catch (err) {
            console.error('ATS history load error:', err)
            setData({ history: [], latest: null, best: null, count: 0 })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        load()
    }, [])

    const remove = async (id) => {
        try {
            await API.delete(`/dashboard/ats-history/${id}`)
            load()
        } catch (err) {
            console.error('ATS history delete error:', err)
        }
    }

    const barColor = (s) =>
        s >= 85 ? '#10b981' : s >= 70 ? '#3b82f6' : s >= 55 ? '#f59e0b' : '#f43f5e'

    const fmtDate = (iso) => {
        if (!iso) return ''
        try {
            return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })
        } catch {
            return ''
        }
    }

    const history = data?.history || []

    return (
        <div className="wander-bg-white border border-slate-200/80 p-6 rounded-3xl shadow-xl space-y-4">
            <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-black text-slate-800 tracking-tight">ATS Score History</h3>
                <Link
                    to="/ats"
                    className="bg-[#0f172a] hover:bg-blue-600 px-4 py-1.5 text-[10px] font-extrabold text-white rounded-full transition-all shadow-sm"
                >
                    New scan
                </Link>
            </div>

            {loading ? (
                <p className="py-6 text-center text-xs font-bold text-slate-400">Loading your scores...</p>
            ) : history.length === 0 ? (
                <div className="py-8 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                    <p className="text-xs font-bold text-slate-400">No resume scans recorded yet.</p>
                    <Link to="/ats" className="mt-2 inline-block text-xs font-black text-blue-600 hover:underline">
                        Upload & scan your resume &rarr;
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {/* Latest / best stats */}
                    <div className="flex gap-3">
                        <Stat label="Latest Score" value={data.latest} color={barColor(data.latest)} />
                        <Stat label="Best Score" value={data.best} color={barColor(data.best)} />
                        <Stat label="Scans Run" value={data.count} plain />
                    </div>

                    {/* History rows */}
                    <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                        {history.map((h) => (
                            <div key={h.id} className="group flex items-center justify-between gap-4 p-3 bg-slate-50/30 hover:bg-slate-50 border border-slate-100 hover:border-slate-200/80 rounded-2xl transition-all">
                                <div className="min-w-0 flex-1">
                                    <div className="truncate text-xs font-black text-slate-800">
                                        {h.file_name || 'Resume.pdf'}
                                    </div>
                                    <div className="text-[10px] text-slate-400 font-bold mt-0.5">
                                        {(h.target_role || 'General')}{h.created_at ? ` \u00b7 ${fmtDate(h.created_at)}` : ''}
                                    </div>
                                </div>
                                <div className="flex flex-none items-center gap-3">
                                    <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-200/60">
                                        <div className="h-full rounded-full" style={{ width: `${h.score}%`, background: barColor(h.score) }} />
                                    </div>
                                    <span className="w-6 text-right text-xs font-black text-slate-700">{h.score}</span>
                                    <button
                                        onClick={() => remove(h.id)}
                                        title="Remove"
                                        className="text-slate-300 hover:text-rose-500 font-bold cursor-pointer text-sm transition-colors"
                                    >
                                        &times;
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

function Stat({ label, value, color, plain }) {
    return (
        <div className="flex-1 rounded-2xl bg-slate-50/50 border border-slate-100 px-3 py-2.5 text-center">
            <div className="text-lg font-black tracking-tight" style={{ color: plain ? '#475569' : color }}>
                {value ?? '--'}{!plain && value != null ? <span className="text-[10px] font-bold text-slate-400">/100</span> : ''}
            </div>
            <div className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 mt-0.5">{label}</div>
        </div>
    )
}