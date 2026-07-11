import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import API from '../api/axios'

/**
 * AtsHistoryPanel
 *
 * Self-contained card that fetches and shows the logged-in user's recent
 * ATS scores, with latest/best stats and a mini score bar per entry.
 *
 * Drop it into Dashboard.jsx anywhere in the JSX, no props needed:
 *   import AtsHistoryPanel from '../components/AtsHistoryPanel'
 *   ...
 *   <AtsHistoryPanel />
 *
 * It fetches its own data from GET /dashboard/ats-history, so it does not
 * depend on the rest of the dashboard's state.
 */
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
        s >= 85 ? 'oklch(62% 0.15 150)' : s >= 70 ? 'oklch(65% 0.14 230)' : s >= 55 ? 'oklch(72% 0.15 75)' : 'oklch(62% 0.19 25)'

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
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="font-bold text-slate-800">ATS Score History</h3>
                <Link
                    to="/ats"
                    className="rounded-full bg-[#0f172a] px-4 py-1.5 text-xs font-bold text-white transition-all hover:bg-blue-600"
                >
                    New scan
                </Link>
            </div>

            {loading ? (
                <p className="py-6 text-center text-sm text-slate-400">Loading your scores...</p>
            ) : history.length === 0 ? (
                <div className="py-8 text-center">
                    <p className="text-sm text-slate-500">No ATS scores yet.</p>
                    <Link to="/ats" className="mt-2 inline-block text-sm font-semibold text-blue-600 hover:underline">
                        Scan your resume &rarr;
                    </Link>
                </div>
            ) : (
                <>
                    {/* Latest / best stats */}
                    <div className="mb-4 flex gap-3">
                        <Stat label="Latest" value={data.latest} color={barColor(data.latest)} />
                        <Stat label="Best" value={data.best} color={barColor(data.best)} />
                        <Stat label="Scans" value={data.count} plain />
                    </div>

                    {/* History rows */}
                    <div className="space-y-3">
                        {history.map((h) => (
                            <div key={h.id} className="group flex items-center gap-3">
                                <div className="min-w-0 flex-1">
                                    <div className="truncate text-sm font-semibold text-slate-700">
                                        {h.file_name || 'Resume'}
                                    </div>
                                    <div className="text-xs text-slate-400">
                                        {(h.target_role || 'General')}{h.created_at ? ` \u00b7 ${fmtDate(h.created_at)}` : ''}
                                    </div>
                                </div>
                                <div className="flex flex-none items-center gap-2">
                                    <div className="h-2 w-20 overflow-hidden rounded-full bg-slate-100">
                                        <div className="h-full rounded-full" style={{ width: `${h.score}%`, background: barColor(h.score) }} />
                                    </div>
                                    <span className="w-8 text-right text-sm font-bold text-slate-700">{h.score}</span>
                                    <button
                                        onClick={() => remove(h.id)}
                                        title="Remove"
                                        className="text-slate-300 opacity-0 transition-opacity hover:text-red-500 group-hover:opacity-100"
                                    >
                                        &times;
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}

function Stat({ label, value, color, plain }) {
    return (
        <div className="flex-1 rounded-xl bg-slate-50 px-3 py-2 text-center">
            <div className="text-lg font-extrabold" style={{ color: plain ? '#334155' : color }}>
                {value ?? '--'}{!plain && value != null ? <span className="text-xs font-medium text-slate-400">/100</span> : ''}
            </div>
            <div className="text-xs font-medium text-slate-400">{label}</div>
        </div>
    )
}