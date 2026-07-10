import React from 'react'

export default function MinimalistTemplate({ resume }) {
  const c = resume.contact || {}

  return (
    <div className="font-sans text-gray-800 bg-white p-12 max-w-3xl mx-auto text-[13px] leading-relaxed tracking-wide min-h-[1056px]">
      
      {/* Header */}
      <header className="mb-10">
        <h1 className="text-4xl font-light tracking-widest text-black mb-2 uppercase">{c.full_name}</h1>
        {c.target_role && <p className="text-sm font-medium tracking-widest text-gray-400 uppercase mb-4">{c.target_role}</p>}
        
        <div className="flex flex-wrap gap-4 text-xs text-gray-500 tracking-wider">
          {c.email && <span>{c.email}</span>}
          {c.phone && <span>{c.phone}</span>}
          {c.location && <span>{c.location}</span>}
          {c.linkedin && <span>{c.linkedin}</span>}
        </div>
      </header>

      <div className="space-y-8">
        
        {/* Summary */}
        {resume.summary && (
          <section className="grid grid-cols-4 gap-6">
            <div className="col-span-1">
              <h2 className="text-xs font-bold uppercase tracking-widest text-black">Profile</h2>
            </div>
            <div className="col-span-3">
              <p className="text-justify text-gray-600 leading-loose">{resume.summary}</p>
            </div>
          </section>
        )}

        {/* Experience */}
        {resume.experience?.length > 0 && (
          <section className="grid grid-cols-4 gap-6">
            <div className="col-span-1">
              <h2 className="text-xs font-bold uppercase tracking-widest text-black">Experience</h2>
            </div>
            <div className="col-span-3 space-y-6">
              {resume.experience.map((e, i) => (
                <div key={i}>
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-medium text-black">{e.role}</h3>
                    <span className="text-xs text-gray-400">{e.duration}</span>
                  </div>
                  <h4 className="text-xs text-gray-500 mb-2 uppercase tracking-wider">{e.company}</h4>
                  <ul className="list-none space-y-1 text-gray-600">
                    {(e.bullets || []).map((b, j) => (
                      <li key={j} className="relative pl-3">
                        <span className="absolute left-0 top-0 text-gray-300">-</span>
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Projects */}
        {resume.projects?.length > 0 && (
          <section className="grid grid-cols-4 gap-6">
            <div className="col-span-1">
              <h2 className="text-xs font-bold uppercase tracking-widest text-black">Projects</h2>
            </div>
            <div className="col-span-3 space-y-5">
              {resume.projects.map((p, i) => (
                <div key={i}>
                  <h3 className="font-medium text-black mb-1">{p.name}</h3>
                  <ul className="list-none space-y-1 text-gray-600">
                    {(p.bullets || []).map((b, j) => (
                      <li key={j} className="relative pl-3">
                        <span className="absolute left-0 top-0 text-gray-300">-</span>
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education */}
        {resume.education?.length > 0 && (
          <section className="grid grid-cols-4 gap-6">
            <div className="col-span-1">
              <h2 className="text-xs font-bold uppercase tracking-widest text-black">Education</h2>
            </div>
            <div className="col-span-3 space-y-4">
              {resume.education.map((e, i) => (
                <div key={i} className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-black">{e.degree}</h3>
                    <h4 className="text-xs text-gray-500 uppercase tracking-wider mt-1">{e.institution}</h4>
                    {e.details && <p className="text-xs text-gray-400 mt-1">{e.details}</p>}
                  </div>
                  <span className="text-xs text-gray-400">{e.year}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills */}
        {resume.skills?.length > 0 && (
          <section className="grid grid-cols-4 gap-6">
            <div className="col-span-1">
              <h2 className="text-xs font-bold uppercase tracking-widest text-black">Skills</h2>
            </div>
            <div className="col-span-3">
              <p className="text-gray-600 leading-loose">{resume.skills.join(', ')}</p>
            </div>
          </section>
        )}

        {/* Certifications */}
        {resume.certifications?.length > 0 && (
          <section className="grid grid-cols-4 gap-6">
            <div className="col-span-1">
              <h2 className="text-xs font-bold uppercase tracking-widest text-black">Awards</h2>
            </div>
            <div className="col-span-3">
              <p className="text-gray-600 leading-loose">{resume.certifications.join(', ')}</p>
            </div>
          </section>
        )}

      </div>
    </div>
  )
}
