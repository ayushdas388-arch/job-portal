import { useState } from 'react'
import API from '../api/axios'

const emptyEducation = { degree: '', institution: '', year: '', details: '' }
const emptyExperience = { role: '', company: '', duration: '', description: '' }
const emptyProject = { name: '', description: '' }

function ResumeBuilder() {
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    target_role: '',
    summary: '',
    skills: '',
    certifications: '',
  })
  const [education, setEducation] = useState([{ ...emptyEducation }])
  const [experience, setExperience] = useState([{ ...emptyExperience }])
  const [projects, setProjects] = useState([{ ...emptyProject }])
  const [resume, setResume] = useState(null)
  const [loading, setLoading] = useState(false)

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const updateList = (setter) => (index, key) => (e) =>
    setter((list) => list.map((item, i) => (i === index ? { ...item, [key]: e.target.value } : item)))

  const addItem = (setter, empty) => () => setter((list) => [...list, { ...empty }])
  const removeItem = (setter) => (index) => () =>
    setter((list) => (list.length > 1 ? list.filter((_, i) => i !== index) : list))

  const toList = (value) =>
    value
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)

  const handleBuild = async () => {
    if (!form.full_name.trim()) {
      alert('Please enter your full name.')
      return
    }

    setLoading(true)
    try {
      const payload = {
        ...form,
        skills: toList(form.skills),
        certifications: toList(form.certifications),
        education: education.filter((e) => e.degree || e.institution),
        experience: experience.filter((e) => e.role || e.company),
        projects: projects.filter((p) => p.name || p.description),
      }
      const { data } = await API.post('/ai/build-resume', payload)
      setResume(data)
    } catch (error) {
      console.error('Resume build error:', error)
      alert('Resume generate karne mein problem aayi. Backend logs check karein.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400'

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6">
      <h1 className="text-4xl font-bold text-center text-blue-600 mb-2">📝 AI Resume Builder</h1>
      <p className="text-center text-gray-500 mb-8">Details bharo, AI professional resume bana dega</p>

      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
        {/* ---------------- Form ---------------- */}
        <div className="bg-white p-6 rounded-xl shadow no-print space-y-6">
          {/* Contact */}
          <section>
            <h2 className="text-xl font-bold mb-3">Basic Info</h2>
            <div className="grid grid-cols-2 gap-3">
              <input className={inputClass} placeholder="Full Name *" value={form.full_name} onChange={update('full_name')} />
              <input className={inputClass} placeholder="Target Role" value={form.target_role} onChange={update('target_role')} />
              <input className={inputClass} placeholder="Email" value={form.email} onChange={update('email')} />
              <input className={inputClass} placeholder="Phone" value={form.phone} onChange={update('phone')} />
              <input className={inputClass} placeholder="Location" value={form.location} onChange={update('location')} />
              <input className={inputClass} placeholder="LinkedIn / Portfolio" value={form.linkedin} onChange={update('linkedin')} />
            </div>
          </section>

          {/* Summary */}
          <section>
            <h2 className="text-xl font-bold mb-3">Summary <span className="text-sm font-normal text-gray-400">(optional — AI likh dega)</span></h2>
            <textarea className={inputClass} rows={3} placeholder="Apne baare mein short intro..." value={form.summary} onChange={update('summary')} />
          </section>

          {/* Skills */}
          <section>
            <h2 className="text-xl font-bold mb-3">Skills</h2>
            <input className={inputClass} placeholder="Comma se alag karein: Python, React, SQL" value={form.skills} onChange={update('skills')} />
          </section>

          {/* Education */}
          <section>
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xl font-bold">Education</h2>
              <button onClick={addItem(setEducation, emptyEducation)} className="neon-outline text-sm px-3 py-1 rounded-lg">+ Add</button>
            </div>
            {education.map((item, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-3 mb-3 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <input className={inputClass} placeholder="Degree" value={item.degree} onChange={updateList(setEducation)(i, 'degree')} />
                  <input className={inputClass} placeholder="Year" value={item.year} onChange={updateList(setEducation)(i, 'year')} />
                </div>
                <input className={inputClass} placeholder="Institution" value={item.institution} onChange={updateList(setEducation)(i, 'institution')} />
                <input className={inputClass} placeholder="Details (grade, etc.)" value={item.details} onChange={updateList(setEducation)(i, 'details')} />
                <button onClick={removeItem(setEducation)(i)} className="text-red-500 text-xs hover:underline">Remove</button>
              </div>
            ))}
          </section>

          {/* Experience */}
          <section>
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xl font-bold">Experience</h2>
              <button onClick={addItem(setExperience, emptyExperience)} className="neon-outline text-sm px-3 py-1 rounded-lg">+ Add</button>
            </div>
            {experience.map((item, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-3 mb-3 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <input className={inputClass} placeholder="Role" value={item.role} onChange={updateList(setExperience)(i, 'role')} />
                  <input className={inputClass} placeholder="Company" value={item.company} onChange={updateList(setExperience)(i, 'company')} />
                </div>
                <input className={inputClass} placeholder="Duration (Jan 2023 - Present)" value={item.duration} onChange={updateList(setExperience)(i, 'duration')} />
                <textarea className={inputClass} rows={2} placeholder="Kya kaam kiya (AI ise bullet points mein badal dega)" value={item.description} onChange={updateList(setExperience)(i, 'description')} />
                <button onClick={removeItem(setExperience)(i)} className="text-red-500 text-xs hover:underline">Remove</button>
              </div>
            ))}
          </section>

          {/* Projects */}
          <section>
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xl font-bold">Projects</h2>
              <button onClick={addItem(setProjects, emptyProject)} className="neon-outline text-sm px-3 py-1 rounded-lg">+ Add</button>
            </div>
            {projects.map((item, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-3 mb-3 space-y-2">
                <input className={inputClass} placeholder="Project Name" value={item.name} onChange={updateList(setProjects)(i, 'name')} />
                <textarea className={inputClass} rows={2} placeholder="Project ke baare mein" value={item.description} onChange={updateList(setProjects)(i, 'description')} />
                <button onClick={removeItem(setProjects)(i)} className="text-red-500 text-xs hover:underline">Remove</button>
              </div>
            ))}
          </section>

          {/* Certifications */}
          <section>
            <h2 className="text-xl font-bold mb-3">Certifications</h2>
            <input className={inputClass} placeholder="Comma se alag karein" value={form.certifications} onChange={update('certifications')} />
          </section>

          <button onClick={handleBuild} disabled={loading} className="w-full neon-btn">
            {loading ? '⏳ Ban raha hai...' : '🚀 Generate Resume'}
          </button>
        </div>

        {/* ---------------- Preview ---------------- */}
        <div>
          {resume ? (
            <>
              <div className="flex justify-end mb-3 no-print">
                <button onClick={() => window.print()} className="neon-btn">🖨️ Download PDF</button>
              </div>
              <div id="resume-preview" className="bg-white p-8 rounded-xl shadow text-gray-800">
                <ResumePreview resume={resume} />
              </div>
            </>
          ) : (
            <div className="bg-white p-8 rounded-xl shadow text-center text-gray-400 flex items-center justify-center min-h-[300px]">
              Resume preview yahan dikhega
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ResumePreview({ resume }) {
  const c = resume.contact || {}
  const contactLine = [c.email, c.phone, c.location, c.linkedin].filter(Boolean).join('  •  ')

  return (
    <div className="space-y-5">
      <header className="text-center border-b pb-3">
        <h1 className="text-3xl font-bold">{c.full_name}</h1>
        {c.target_role && <p className="text-blue-600 font-medium">{c.target_role}</p>}
        {contactLine && <p className="text-sm text-gray-500 mt-1">{contactLine}</p>}
      </header>

      {resume.summary && (
        <Section title="Summary">
          <p className="text-sm leading-relaxed">{resume.summary}</p>
        </Section>
      )}

      {resume.skills?.length > 0 && (
        <Section title="Skills">
          <div className="flex flex-wrap gap-2">
            {resume.skills.map((s, i) => (
              <span key={i} className="text-xs bg-gray-100 rounded px-2 py-1">{s}</span>
            ))}
          </div>
        </Section>
      )}

      {resume.experience?.length > 0 && (
        <Section title="Experience">
          {resume.experience.map((e, i) => (
            <div key={i} className="mb-3">
              <div className="flex justify-between">
                <p className="font-semibold text-sm">{e.role}{e.company && ` — ${e.company}`}</p>
                <p className="text-xs text-gray-500">{e.duration}</p>
              </div>
              <ul className="list-disc list-inside text-sm text-gray-700 mt-1">
                {(e.bullets || []).map((b, j) => <li key={j}>{b}</li>)}
              </ul>
            </div>
          ))}
        </Section>
      )}

      {resume.projects?.length > 0 && (
        <Section title="Projects">
          {resume.projects.map((p, i) => (
            <div key={i} className="mb-3">
              <p className="font-semibold text-sm">{p.name}</p>
              <ul className="list-disc list-inside text-sm text-gray-700 mt-1">
                {(p.bullets || []).map((b, j) => <li key={j}>{b}</li>)}
              </ul>
            </div>
          ))}
        </Section>
      )}

      {resume.education?.length > 0 && (
        <Section title="Education">
          {resume.education.map((e, i) => (
            <div key={i} className="mb-2">
              <div className="flex justify-between">
                <p className="font-semibold text-sm">{e.degree}{e.institution && ` — ${e.institution}`}</p>
                <p className="text-xs text-gray-500">{e.year}</p>
              </div>
              {e.details && <p className="text-xs text-gray-600">{e.details}</p>}
            </div>
          ))}
        </Section>
      )}

      {resume.certifications?.length > 0 && (
        <Section title="Certifications">
          <ul className="list-disc list-inside text-sm text-gray-700">
            {resume.certifications.map((c2, i) => <li key={i}>{c2}</li>)}
          </ul>
        </Section>
      )}
    </div>
  )
}

function Section({ title, children }) {
  return (
    <section>
      <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500 border-b mb-2 pb-1">{title}</h2>
      {children}
    </section>
  )
}

export default ResumeBuilder
