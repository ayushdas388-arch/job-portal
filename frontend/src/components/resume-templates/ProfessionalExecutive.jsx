import React from 'react'

export default function ProfessionalExecutive({ resume }) {
  const c = resume.contact || {}

  return (
    <div className="font-sans text-gray-900 bg-white p-12 mx-auto min-h-[1056px] w-[816px] text-[13px] leading-relaxed">
      
      {/* Header */}
      <header className="mb-8 flex items-center gap-6">
        {resume.photo && (
          <img src={resume.photo} alt="Profile" className="w-24 h-24 object-cover border border-gray-300 shadow-sm" />
        )}
        <div className="flex-1">
          <h1 className="text-4xl font-light tracking-tight mb-1">{c.full_name}</h1>
          {c.target_role && <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">{c.target_role}</p>}
        </div>
        <div className="text-right text-xs text-gray-500 space-y-1 font-medium">
          {c.email && <p>{c.email}</p>}
          {c.phone && <p>{c.phone}</p>}
          {c.location && <p>{c.location}</p>}
          {c.linkedin && <p>{c.linkedin}</p>}
        </div>
      </header>

      {/* Summary */}
      {resume.summary && (
        <section className="mb-6 flex">
          <div className="w-[20%] font-bold uppercase tracking-widest text-xs text-gray-400 mt-1">Profile</div>
          <div className="w-[80%] border-l-2 border-gray-200 pl-6 pb-2">
            <p className="text-justify text-gray-700">{resume.summary}</p>
          </div>
        </section>
      )}

      {/* Experience */}
      {resume.experience?.length > 0 && (
        <section className="mb-6 flex">
          <div className="w-[20%] font-bold uppercase tracking-widest text-xs text-gray-400 mt-1">Experience</div>
          <div className="w-[80%] border-l-2 border-gray-200 pl-6 pb-2 space-y-5">
            {resume.experience.map((e, i) => (
              <div key={i}>
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-bold text-[14px] text-gray-900">{e.role}</h3>
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{e.duration}</span>
                </div>
                <h4 className="text-[13px] font-semibold text-gray-600 mb-2">{e.company}</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  {(e.bullets || []).map((b, j) => <li key={j}>{b}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Projects */}
      {resume.projects?.length > 0 && (
        <section className="mb-6 flex">
          <div className="w-[20%] font-bold uppercase tracking-widest text-xs text-gray-400 mt-1">Projects</div>
          <div className="w-[80%] border-l-2 border-gray-200 pl-6 pb-2 space-y-5">
            {resume.projects.map((p, i) => (
              <div key={i}>
                <h3 className="font-bold text-[14px] text-gray-900 mb-1">{p.name}</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  {(p.bullets || []).map((b, j) => <li key={j}>{b}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {resume.education?.length > 0 && (
        <section className="mb-6 flex">
          <div className="w-[20%] font-bold uppercase tracking-widest text-xs text-gray-400 mt-1">Education</div>
          <div className="w-[80%] border-l-2 border-gray-200 pl-6 pb-2 space-y-4">
            {resume.education.map((e, i) => (
              <div key={i} className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-[14px] text-gray-900">{e.degree}</h3>
                  <h4 className="text-[13px] text-gray-600 font-semibold">{e.institution}</h4>
                  {e.details && <p className="text-xs text-gray-500 mt-1">{e.details}</p>}
                </div>
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{e.year}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills & Certs */}
      <section className="flex">
        <div className="w-[20%] font-bold uppercase tracking-widest text-xs text-gray-400 mt-1">Additional</div>
        <div className="w-[80%] border-l-2 border-gray-200 pl-6 space-y-4">
          
          {resume.skills?.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-gray-500 uppercase mb-1">Skills</h3>
              <p className="text-gray-700">{resume.skills.join(' • ')}</p>
            </div>
          )}

          {resume.certifications?.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-gray-500 uppercase mb-1">Certifications</h3>
              <p className="text-gray-700">{resume.certifications.join(' • ')}</p>
            </div>
          )}

        </div>
      </section>

    </div>
  )
}
