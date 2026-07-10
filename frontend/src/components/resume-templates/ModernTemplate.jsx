import React from 'react'
import BrandIcon from '../BrandIcon'

export default function ModernTemplate({ resume }) {
  const c = resume.contact || {}

  return (
    <div className="font-sans text-slate-800 bg-white shadow-xl mx-auto flex overflow-hidden min-h-[1056px] w-[816px] text-[13px] leading-relaxed">
      
      {/* Left Sidebar */}
      <aside className="w-[32%] bg-slate-50 border-r border-slate-200 p-8 flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-blue-600 leading-tight mb-1">{c.full_name}</h1>
          {c.target_role && <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{c.target_role}</p>}
        </div>

        <div className="space-y-3 text-sm">
          {c.email && (
            <div className="flex items-center gap-2 text-slate-600">
              <span className="text-blue-500 text-lg">✉</span>
              <span className="break-all">{c.email}</span>
            </div>
          )}
          {c.phone && (
            <div className="flex items-center gap-2 text-slate-600">
              <span className="text-blue-500 text-lg">☎</span>
              <span>{c.phone}</span>
            </div>
          )}
          {c.location && (
            <div className="flex items-center gap-2 text-slate-600">
              <span className="text-blue-500 text-lg">📍</span>
              <span>{c.location}</span>
            </div>
          )}
          {c.linkedin && (
            <div className="flex items-center gap-2 text-slate-600">
              <BrandIcon url="linkedin" className="w-4 h-4 text-blue-500" />
              <span className="break-all">{c.linkedin}</span>
            </div>
          )}
        </div>

        {resume.skills?.length > 0 && (
          <div>
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-3 border-b pb-1">Skills</h2>
            <div className="flex flex-wrap gap-1.5">
              {resume.skills.map((s, i) => (
                <span key={i} className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-semibold">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {resume.certifications?.length > 0 && (
          <div>
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-3 border-b pb-1">Certifications</h2>
            <ul className="space-y-2 text-sm">
              {resume.certifications.map((cert, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-blue-500">▹</span>
                  <span>{cert}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </aside>

      {/* Right Main Content */}
      <main className="w-[68%] p-8 bg-white flex flex-col gap-6">
        
        {resume.summary && (
          <section>
            <h2 className="text-lg font-bold text-slate-800 mb-2 flex items-center gap-2">
              <span className="w-6 h-0.5 bg-blue-500 inline-block"></span> Profile
            </h2>
            <p className="text-justify text-slate-600">{resume.summary}</p>
          </section>
        )}

        {resume.experience?.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <span className="w-6 h-0.5 bg-blue-500 inline-block"></span> Experience
            </h2>
            <div className="space-y-5">
              {resume.experience.map((e, i) => (
                <div key={i} className="relative pl-4 border-l-2 border-slate-200">
                  <div className="absolute w-2 h-2 bg-blue-500 rounded-full -left-[5px] top-1.5 border border-white"></div>
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-bold text-slate-800 text-[14px]">{e.role}</h3>
                    <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded whitespace-nowrap">{e.duration}</span>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-500 mb-2">{e.company}</h4>
                  <ul className="list-disc list-inside space-y-1 text-slate-600 text-sm">
                    {(e.bullets || []).map((b, j) => <li key={j}>{b}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

        {resume.projects?.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <span className="w-6 h-0.5 bg-blue-500 inline-block"></span> Projects
            </h2>
            <div className="grid grid-cols-1 gap-4">
              {resume.projects.map((p, i) => (
                <div key={i} className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                  <h3 className="font-bold text-slate-800 text-[14px] mb-2">{p.name}</h3>
                  <ul className="list-disc list-inside space-y-1 text-slate-600 text-sm">
                    {(p.bullets || []).map((b, j) => <li key={j}>{b}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

        {resume.education?.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <span className="w-6 h-0.5 bg-blue-500 inline-block"></span> Education
            </h2>
            <div className="space-y-4">
              {resume.education.map((e, i) => (
                <div key={i}>
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-bold text-slate-800 text-[14px]">{e.degree}</h3>
                    <span className="text-xs font-semibold text-slate-500">{e.year}</span>
                  </div>
                  <h4 className="text-sm text-slate-600">{e.institution}</h4>
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
