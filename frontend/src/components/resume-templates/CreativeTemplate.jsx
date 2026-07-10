import React from 'react'
import BrandIcon from '../BrandIcon'

export default function CreativeTemplate({ resume }) {
  const c = resume.contact || {}

  return (
    <div className="font-sans text-slate-800 bg-white shadow-xl mx-auto flex flex-col overflow-hidden min-h-[1056px] w-[816px] text-[13px] leading-relaxed relative">
      
      {/* Decorative Header Block */}
      <div className="absolute top-0 left-0 w-full h-32 bg-amber-400"></div>

      {/* Header Profile */}
      <header className="relative z-10 px-12 pt-16 pb-8 flex justify-between items-end">
        <div className="bg-white p-6 shadow-xl rounded-xl border border-slate-100 max-w-xl">
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-1">{c.full_name}</h1>
          {c.target_role && <p className="text-lg font-bold text-amber-500 mb-4">{c.target_role}</p>}
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600 font-medium">
            {c.email && <span>{c.email}</span>}
            {c.phone && <span>{c.phone}</span>}
            {c.location && <span>{c.location}</span>}
            {c.linkedin && (
              <span className="flex items-center gap-1">
                <BrandIcon url="linkedin" className="w-4 h-4 text-slate-400" /> {c.linkedin}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Two Column Layout Below Header */}
      <div className="flex flex-1 px-12 pb-12 gap-10">
        
        {/* Main Column */}
        <main className="w-[65%] flex flex-col gap-8">
          
          {resume.summary && (
            <section>
              <h2 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">About Me</h2>
              <p className="text-slate-600 font-medium leading-loose text-justify">{resume.summary}</p>
            </section>
          )}

          {resume.experience?.length > 0 && (
            <section>
              <h2 className="text-2xl font-black text-slate-900 mb-5 tracking-tight">Work Experience</h2>
              <div className="space-y-6">
                {resume.experience.map((e, i) => (
                  <div key={i}>
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="font-bold text-[16px] text-slate-800">{e.role}</h3>
                      <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded">{e.duration}</span>
                    </div>
                    <h4 className="text-[14px] font-bold text-slate-400 mb-2">{e.company}</h4>
                    <ul className="list-none space-y-2 text-slate-600 font-medium">
                      {(e.bullets || []).map((b, j) => (
                        <li key={j} className="flex gap-2">
                          <span className="text-amber-400 font-black">→</span> {b}
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
              <h2 className="text-2xl font-black text-slate-900 mb-5 tracking-tight">Projects</h2>
              <div className="grid grid-cols-1 gap-4">
                {resume.projects.map((p, i) => (
                  <div key={i} className="border-l-4 border-amber-400 pl-4 py-1">
                    <h3 className="font-bold text-[15px] text-slate-800 mb-2">{p.name}</h3>
                    <ul className="list-disc list-inside space-y-1 text-slate-600 font-medium">
                      {(p.bullets || []).map((b, j) => <li key={j}>{b}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          )}

        </main>

        {/* Side Column */}
        <aside className="w-[35%] flex flex-col gap-8">
          
          {resume.skills?.length > 0 && (
            <section>
              <h2 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">Expertise</h2>
              <div className="flex flex-wrap gap-2">
                {resume.skills.map((s, i) => (
                  <span key={i} className="bg-slate-900 text-white px-3 py-1.5 rounded-md text-xs font-bold">
                    {s}
                  </span>
                ))}
              </div>
            </section>
          )}

          {resume.education?.length > 0 && (
            <section>
              <h2 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">Education</h2>
              <div className="space-y-4">
                {resume.education.map((e, i) => (
                  <div key={i} className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <h3 className="font-bold text-[14px] text-slate-800">{e.degree}</h3>
                    <h4 className="text-sm font-bold text-slate-500 mb-1">{e.institution}</h4>
                    <span className="text-xs font-bold text-amber-600 block mb-2">{e.year}</span>
                    {e.details && <p className="text-xs text-slate-600 font-medium">{e.details}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {resume.certifications?.length > 0 && (
            <section>
              <h2 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">Awards</h2>
              <ul className="space-y-3">
                {resume.certifications.map((cert, i) => (
                  <li key={i} className="flex gap-2 text-sm font-medium text-slate-600">
                    <span className="text-amber-500 text-lg leading-none">★</span> {cert}
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
