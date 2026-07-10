import { useState } from 'react'

function GovtUpdates() {
  const [tab, setTab] = useState('admit_cards')

  const dummyData = {
    admit_cards: [
      { id: 1, title: 'SSC CGL Tier 1 Admit Card 2026', date: 'July 5, 2026', link: 'https://ssc.gov.in/' },
      { id: 2, title: 'UPSC Civil Services Prelims e-Admit Card', date: 'June 28, 2026', link: 'https://upsc.gov.in/' },
      { id: 3, title: 'IBPS PO Prelims Call Letter', date: 'June 15, 2026', link: 'https://www.ibps.in/' },
    ],
    results: [
      { id: 4, title: 'SSC CHSL 2025 Final Result', date: 'July 1, 2026', link: 'https://ssc.gov.in/' },
      { id: 5, title: 'RRB NTPC CBT-2 Scorecard', date: 'June 20, 2026', link: 'https://rrbapply.gov.in/' },
    ],
    calendar: [
      { id: 6, title: 'UPSC Annual Calendar 2027', date: 'Upcoming', link: 'https://upsc.gov.in/' },
      { id: 7, title: 'SSC Examination Calendar 2026-27', date: 'Released', link: 'https://ssc.gov.in/' },
    ]
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4">
      
      {/* Header */}
      <div className="bg-emerald-600 rounded-2xl p-8 text-center text-white shadow-md relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-white opacity-10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-2xl"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full translate-x-1/2 translate-y-1/2 blur-2xl"></div>
        
        <h1 className="text-3xl font-extrabold mb-2 relative z-10">Government Exam Updates</h1>
        <p className="text-emerald-100 relative z-10">Latest admit cards, results, and official calendars at a glance.</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap justify-center gap-4">
        {[
          { id: 'admit_cards', label: 'Admit Cards' },
          { id: 'results', label: 'Results' },
          { id: 'calendar', label: 'Exam Calendar' }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-6 py-2 rounded-full font-medium transition-all ${
              tab === t.id 
                ? 'bg-emerald-500 text-white shadow-lg' 
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-bold text-emerald-400 mb-4 border-b border-slate-700 pb-2 capitalize">
          {tab.replace('_', ' ')}
        </h2>
        
        {dummyData[tab].length === 0 ? (
          <p className="text-slate-400 text-center py-8">No new updates found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dummyData[tab].map((item) => (
              <a 
                key={item.id}
                href={item.link}
                target="_blank"
                rel="noreferrer"
                className="bg-slate-900 border border-slate-700 rounded-lg p-5 flex flex-col justify-between hover:border-emerald-500 transition-colors group"
              >
                <div>
                  <h3 className="font-bold text-slate-200 group-hover:text-emerald-400 transition-colors">{item.title}</h3>
                  <p className="text-sm text-slate-500 mt-2">Date / Status: <span className="text-slate-300">{item.date}</span></p>
                </div>
                <div className="mt-4 flex items-center text-sm font-medium text-emerald-500">
                  View Official Source 
                  <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                  </svg>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
      
    </div>
  )
}

export default GovtUpdates
