import React from 'react'

export default function ModernSplit({ resume }) {
  const c = resume.contact || {}

  return (
    <div className="font-sans bg-white shadow-xl mx-auto flex overflow-hidden min-h-[1056px] w-[816px] text-[13px] leading-relaxed">
      
      {/* Left Dark Sidebar */}
      <aside className="w-[40%] bg-slate-900 text-slate-300 p-8 flex flex-col gap-8">
        
        <div className="text-center border-b border-slate-700 pb-6">
          {resume.photo && (
            <img src={resume.photo} alt="Profile" className="w-32 h-32 object-cover rounded-full mx-auto mb-4 border-2 border-slate-700" />
          )}
          <h1 className="text-3xl font-light text-white tracking-wide mb-1 uppercase">{c.full_name}</h1>
          {c.target_role && <p className="text-sm font-semibold text-emerald-400 uppercase tracking-widest">{c.target_role}</p>}
        </div>

        <div className="space-y-4 text-sm font-medium">
          {c.email && (
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-0.5">Email</p>
              <p className="text-white break-all">{c.email}</p>
            </div>
          )}
          {c.phone && (
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-0.5">Phone</p>
              <p className="text-white">{c.phone}</p>
            </div>
          )}
          {c.location && (
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-0.5">Location</p>
              <p className="text-white">{c.location}</p>
            </div>
          )}
          {c.linkedin && (
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-0.5">LinkedIn / Portfolio</p>
              <p className="text-white break-all">{c.linkedin}</p>
            </div>
          )}
        </div>

        {resume.skills?.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-white mb-3 tracking-wide">Skills</h2>
            <ul className="space-y-2">
              {resume.skills.map((s, i) => (
                <li key={i} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                  {s}
                </li>
              ))}
            </ul>
          </div>
        )}

      </aside>

      {/* Right Main Content */}
      <main className="w-[60%] p-10 bg-slate-50 flex flex-col gap-8 text-slate-800">
        
        {resume.summary && (
          <section>
            <h2 className="text-xl font-black text-slate-900 mb-3 tracking-tight border-b-2 border-emerald-500 pb-2 inline-block">Profile</h2>
            <p className="text-justify text-slate-600 leading-loose">{resume.summary}</p>
          </section>
        )}

        {resume.experience?.length > 0 && (
          <section>
            <h2 className="text-xl font-black text-slate-900 mb-5 tracking-tight border-b-2 border-emerald-500 pb-2 inline-block">Experience</h2>
            <div className="space-y-6">
              {resume.experience.map((e, i) => (
                <div key={i}>
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-bold text-[15px] text-slate-900">{e.role}</h3>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-sm font-semibold text-emerald-600">{e.company}</h4>
                    <span className="text-xs font-bold text-slate-400 bg-white px-2 py-1 rounded shadow-sm">{e.duration}</span>
                  </div>
                  <ul className="list-none space-y-1.5 text-slate-600 text-sm">
                    {(e.bullets || []).map((b, j) => (
                      <li key={j} className="relative pl-4">
                        <span className="absolute left-0 top-0 text-emerald-500 font-bold">›</span> {b}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

        {resume.projects?.length > 0 && (
          <section>
            <h2 className="text-xl font-black text-slate-900 mb-5 tracking-tight border-b-2 border-emerald-500 pb-2 inline-block">Projects</h2>
            <div className="space-y-5">
              {resume.projects.map((p, i) => (
                <div key={i}>
                  <h3 className="font-bold text-[15px] text-slate-900 mb-1">{p.name}</h3>
                  <ul className="list-none space-y-1.5 text-slate-600 text-sm">
                    {(p.bullets || []).map((b, j) => (
                      <li key={j} className="relative pl-4">
                        <span className="absolute left-0 top-0 text-emerald-500 font-bold">›</span> {b}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

        {resume.education?.length > 0 && (
          <section>
            <h2 className="text-xl font-black text-slate-900 mb-5 tracking-tight border-b-2 border-emerald-500 pb-2 inline-block">Education</h2>
            <div className="space-y-4">
              {resume.education.map((e, i) => (
                <div key={i} className="bg-white p-4 rounded-lg shadow-sm border border-slate-100">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-bold text-[14px] text-slate-900">{e.degree}</h3>
                    <span className="text-xs font-bold text-slate-400">{e.year}</span>
                  </div>
                  <h4 className="text-sm font-semibold text-emerald-600">{e.institution}</h4>
                  {e.details && <p className="text-sm text-slate-500 mt-1">{e.details}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

      </main>
    </div>
  )
}
