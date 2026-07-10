import { useState } from 'react'

function CareerRoadmap() {
  const [role, setRole] = useState('')
  const [roadmap, setRoadmap] = useState(null)

  const generateRoadmap = () => {
    if (!role.trim()) return
    // Mock roadmap generator
    setRoadmap([
      { step: 1, title: 'Learn the Basics', desc: 'Understand core concepts, internet fundamentals, and basic syntaxes.' },
      { step: 2, title: 'Build Projects', desc: 'Create 3-4 small projects to get hands-on experience and build confidence.' },
      { step: 3, title: 'Advanced Topics & Frameworks', desc: 'Dive into popular frameworks and learn architectural patterns.' },
      { step: 4, title: 'Interview Preparation', desc: 'Practice DSA, system design, and mock interviews.' },
      { step: 5, title: 'Apply & Network', desc: 'Optimize your resume, apply on portals, and reach out to recruiters.' },
    ])
  }

  return (
    <div className="max-w-3xl mx-auto p-4 py-10">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 mb-4">Career Roadmap Generator</h1>
        <p className="text-slate-500">Not sure where to start? Enter your dream role and get a step-by-step path to success.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row gap-4 mb-10">
        <input 
          type="text" 
          placeholder="e.g. Frontend Developer, Data Scientist, Bank PO..." 
          className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && generateRoadmap()}
        />
        <button 
          onClick={generateRoadmap}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors shadow-md"
        >
          Generate Path
        </button>
      </div>

      {roadmap && (
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[27px] top-4 bottom-4 w-1 bg-blue-200 rounded"></div>
          
          <div className="space-y-8">
            {roadmap.map((item, index) => (
              <div key={item.step} className="flex gap-6 relative">
                {/* Number Circle */}
                <div className="w-14 h-14 shrink-0 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl shadow-lg border-4 border-white relative z-10">
                  {item.step}
                </div>
                {/* Content Card */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex-1 hover:shadow-md transition-shadow">
                  <h3 className="text-xl font-bold text-slate-800 mb-2">{item.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default CareerRoadmap
