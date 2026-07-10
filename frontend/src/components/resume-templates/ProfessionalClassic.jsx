import React from 'react'

export default function ProfessionalClassic({ resume }) {
  const c = resume.contact || {}
  const contactLine = [c.email, c.phone, c.location, c.linkedin].filter(Boolean).join('  |  ')

  return (
    <div className="font-serif text-slate-900 bg-white p-12 mx-auto min-h-[1056px] w-[816px] text-[13px] leading-relaxed">
      
      {/* Header */}
      <header className="text-center mb-6 relative">
        {resume.photo && (
          <img src={resume.photo} alt="Profile" className="w-24 h-24 object-cover absolute left-0 top-0 grayscale" />
        )}
        <h1 className="text-3xl uppercase font-bold tracking-widest mb-2">{c.full_name}</h1>
        {c.target_role && <p className="text-lg italic text-slate-700 mb-3">{c.target_role}</p>}
        {contactLine && <p className="text-sm text-slate-600">{contactLine}</p>}
      </header>

      {/* Summary */}
      {resume.summary && (
        <section className="mb-6">
          <h2 className="text-sm uppercase font-bold tracking-widest border-b-2 border-slate-900 mb-3 pb-1">Professional Summary</h2>
          <p className="text-justify">{resume.summary}</p>
        </section>
      )}

      {/* Experience */}
      {resume.experience?.length > 0 && (
        <section className="mb-6">
          <h2 className="text-sm uppercase font-bold tracking-widest border-b-2 border-slate-900 mb-3 pb-1">Experience</h2>
          {resume.experience.map((e, i) => (
            <div key={i} className="mb-4">
              <div className="flex justify-between items-baseline mb-1">
                <h3 className="font-bold text-[14px]">
                  {e.company} {e.company && e.role && <span className="font-normal mx-1">|</span>} <span className="italic font-normal">{e.role}</span>
                </h3>
                <span className="text-slate-600 whitespace-nowrap italic font-semibold">{e.duration}</span>
              </div>
              <ul className="list-disc list-outside ml-4 space-y-1 text-slate-800">
                {(e.bullets || []).map((b, j) => <li key={j}>{b}</li>)}
              </ul>
            </div>
          ))}
        </section>
      )}

      {/* Projects */}
      {resume.projects?.length > 0 && (
        <section className="mb-6">
          <h2 className="text-sm uppercase font-bold tracking-widest border-b-2 border-slate-900 mb-3 pb-1">Projects</h2>
          {resume.projects.map((p, i) => (
            <div key={i} className="mb-4">
              <h3 className="font-bold text-[14px] mb-1">{p.name}</h3>
              <ul className="list-disc list-outside ml-4 space-y-1 text-slate-800">
                {(p.bullets || []).map((b, j) => <li key={j}>{b}</li>)}
              </ul>
            </div>
          ))}
        </section>
      )}

      {/* Education */}
      {resume.education?.length > 0 && (
        <section className="mb-6">
          <h2 className="text-sm uppercase font-bold tracking-widest border-b-2 border-slate-900 mb-3 pb-1">Education</h2>
          {resume.education.map((e, i) => (
            <div key={i} className="mb-2">
              <div className="flex justify-between items-baseline">
                <h3 className="font-bold text-[14px]">{e.institution}</h3>
                <span className="text-slate-600 whitespace-nowrap italic font-semibold">{e.year}</span>
              </div>
              <div className="text-slate-700 italic">{e.degree}</div>
              {e.details && <div className="text-slate-600 mt-0.5">{e.details}</div>}
            </div>
          ))}
        </section>
      )}

      <div className="flex gap-8">
        {/* Skills */}
        {resume.skills?.length > 0 && (
          <section className="flex-1">
            <h2 className="text-sm uppercase font-bold tracking-widest border-b-2 border-slate-900 mb-3 pb-1">Skills</h2>
            <p>{resume.skills.join(' • ')}</p>
          </section>
        )}

        {/* Certifications */}
        {resume.certifications?.length > 0 && (
          <section className="flex-1">
            <h2 className="text-sm uppercase font-bold tracking-widest border-b-2 border-slate-900 mb-3 pb-1">Certifications</h2>
            <p>{resume.certifications.join(' • ')}</p>
          </section>
        )}
      </div>

    </div>
  )
}
