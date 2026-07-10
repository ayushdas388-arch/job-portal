import React from 'react'
import BrandIcon from '../BrandIcon'

export default function ModernCards({ resume }) {
  const c = resume.contact || {}

  return (
    <div className="font-sans text-slate-800 bg-slate-100 p-8 mx-auto flex flex-col gap-6 overflow-hidden min-h-[1056px] w-[816px] text-[13px] leading-relaxed">
      
      {/* Header Card */}
      <header className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-8">
        {resume.photo && (
          <img src={resume.photo} alt="Profile" className="w-28 h-28 object-cover rounded-2xl border border-slate-100 shadow-sm shrink-0" />
        )}
        <div className="flex-1">
          <h1 className="text-3xl font-black text-indigo-900 mb-1">{c.full_name}</h1>
          {c.target_role && <p className="text-lg font-bold text-indigo-500 mb-4">{c.target_role}</p>}
          
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600 font-medium">
            {c.email && <span className="flex items-center gap-1.5"><span className="text-indigo-400">@</span> {c.email}</span>}
            {c.phone && <span className="flex items-center gap-1.5"><span className="text-indigo-400">#</span> {c.phone}</span>}
            {c.location && <span className="flex items-center gap-1.5"><span className="text-indigo-400">📍</span> {c.location}</span>}
            {c.linkedin && (
              <span className="flex items-center gap-1.5">
                <BrandIcon url="linkedin" className="w-4 h-4 text-indigo-400" /> {c.linkedin}
              </span>
            )}
          </div>
        </div>
      </header>

      <div className="flex gap-6 flex-1">
        {/* Main Column */}
        <main className="w-[65%] flex flex-col gap-6">
          
          {resume.summary && (
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-lg font-black text-indigo-900 mb-3 tracking-tight">Summary</h2>
              <p className="text-justify text-slate-600 font-medium leading-loose">{resume.summary}</p>
            </section>
          )}

          {resume.experience?.length > 0 && (
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-lg font-black text-indigo-900 mb-5 tracking-tight">Experience</h2>
              <div className="space-y-6">
                {resume.experience.map((e, i) => (
                  <div key={i}>
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="font-bold text-[15px] text-slate-900">{e.role}</h3>
                      <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">{e.duration}</span>
                    </div>
                    <h4 className="text-[13px] font-bold text-slate-400 mb-2 uppercase tracking-wide">{e.company}</h4>
                    <ul className="list-disc list-inside space-y-1.5 text-slate-600 font-medium text-sm">
                      {(e.bullets || []).map((b, j) => (
                        <li key={j}>{b}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          )}

          {resume.projects?.length > 0 && (
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-lg font-black text-indigo-900 mb-5 tracking-tight">Projects</h2>
              <div className="space-y-5">
                {resume.projects.map((p, i) => (
                  <div key={i}>
                    <h3 className="font-bold text-[15px] text-slate-900 mb-1">{p.name}</h3>
                    <ul className="list-disc list-inside space-y-1.5 text-slate-600 font-medium text-sm">
                      {(p.bullets || []).map((b, j) => <li key={j}>{b}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>

        {/* Side Column */}
        <aside className="w-[35%] flex flex-col gap-6">
          
          {resume.skills?.length > 0 && (
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-lg font-black text-indigo-900 mb-4 tracking-tight">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {resume.skills.map((s, i) => (
                  <span key={i} className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold">
                    {s}
                  </span>
                ))}
              </div>
            </section>
          )}

          {resume.education?.length > 0 && (
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-lg font-black text-indigo-900 mb-4 tracking-tight">Education</h2>
              <div className="space-y-5">
                {resume.education.map((e, i) => (
                  <div key={i}>
                    <h3 className="font-bold text-[14px] text-slate-900">{e.degree}</h3>
                    <h4 className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">{e.institution}</h4>
                    <span className="text-xs font-bold text-indigo-500 block my-1">{e.year}</span>
                    {e.details && <p className="text-xs text-slate-600 font-medium">{e.details}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {resume.certifications?.length > 0 && (
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-lg font-black text-indigo-900 mb-4 tracking-tight">Certifications</h2>
              <ul className="space-y-3">
                {resume.certifications.map((cert, i) => (
                  <li key={i} className="flex gap-2 text-sm font-medium text-slate-600">
                    <span className="text-indigo-400">✓</span> {cert}
                  </li>
                ))}
              </ul>
            </section>
          )}

        </aside>
      </div>

    </div>
  )
}
