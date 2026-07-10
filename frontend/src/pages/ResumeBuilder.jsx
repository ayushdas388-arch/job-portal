import { useState, useEffect } from 'react'
import API from '../api/axios'
import { render as renderStackOverflow } from '@jsonresume/theme-stackoverflow'

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
    photo: null,
  })
  const [education, setEducation] = useState([{ ...emptyEducation }])
  const [experience, setExperience] = useState([{ ...emptyExperience }])
  const [projects, setProjects] = useState([{ ...emptyProject }])
  const [loading, setLoading] = useState(false)
  const [previewHtml, setPreviewHtml] = useState('')

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setForm((f) => ({ ...f, photo: reader.result }))
      }
      reader.readAsDataURL(file)
    }
  }

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

  const toJSONResume = (form, edu, exp, proj) => {
    return {
      basics: {
        name: form.full_name || 'Your Name',
        label: form.target_role || 'Professional',
        image: form.photo || '',
        email: form.email || 'email@example.com',
        phone: form.phone || '',
        url: form.linkedin || '',
        summary: form.summary || 'Summary will appear here.',
        location: {
          address: form.location || ''
        },
        profiles: form.linkedin ? [{ network: "LinkedIn", url: form.linkedin }] : []
      },
      work: exp.filter(e => e.company || e.role).map(e => ({
        name: e.company || 'Company',
        position: e.role || 'Role',
        startDate: e.duration ? e.duration.split('-')[0]?.trim() : '2020',
        endDate: e.duration && e.duration.includes('-') ? e.duration.split('-')[1]?.trim() : 'Present',
        summary: e.description || '',
        highlights: e.description ? e.description.split('\n').filter(Boolean) : []
      })),
      education: edu.filter(e => e.institution || e.degree).map(e => ({
        institution: e.institution || 'University',
        area: e.degree || 'Degree',
        studyType: '',
        startDate: e.year || '2016',
        endDate: e.year || '2020',
        score: e.details || '',
      })),
      skills: form.skills ? [
        {
          name: "Skills",
          level: "Advanced",
          keywords: form.skills.split(',').map(s => s.trim()).filter(Boolean)
        }
      ] : [],
      certificates: form.certifications ? form.certifications.split(',').map(c => ({
        name: c.trim(),
        date: '',
        issuer: '',
        url: ''
      })).filter(c => c.name) : [],
      projects: proj.filter(p => p.name || p.description).map(p => ({
        name: p.name || 'Project Name',
        description: p.description || '',
        highlights: p.description ? p.description.split('\n').filter(Boolean) : [],
        keywords: []
      }))
    }
  }

  // Update preview automatically when form changes
  useEffect(() => {
    try {
      const jsonResumeData = toJSONResume(form, education, experience, projects)
      const html = renderStackOverflow(jsonResumeData)
      setPreviewHtml(html)
    } catch (e) {
      console.error("Preview Render Error:", e)
    }
  }, [form, education, experience, projects])

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
      // Auto-fill fields from AI enhancement
      setForm(f => ({ ...f, summary: data.summary || f.summary }))
      if (data.experience) setExperience(data.experience)
      if (data.projects) setProjects(data.projects)
      alert("AI has enhanced your resume details!")
    } catch (error) {
      console.error('Resume build error:', error)
      alert('There was a problem generating the resume. Please check the backend logs.')
    } finally {
      setLoading(false)
    }
  }

  const exportJSON = () => {
    const jsonResumeData = toJSONResume(form, education, experience, projects)
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(jsonResumeData, null, 2))
    const downloadAnchorNode = document.createElement('a')
    downloadAnchorNode.setAttribute("href", dataStr)
    downloadAnchorNode.setAttribute("download", "resume.json")
    document.body.appendChild(downloadAnchorNode)
    downloadAnchorNode.click()
    downloadAnchorNode.remove()
  }

  const inputClass = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400'

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6">
      <h1 className="text-4xl font-bold text-center text-blue-600 mb-2">📝 AI Resume Builder</h1>
      <p className="text-center text-gray-500 mb-8">Fill in your details and AI will build a professional resume</p>

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
              
              <div className="col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-1">Profile Photo (Optional)</label>
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                {form.photo && <p className="text-xs text-green-600 mt-1">Photo uploaded successfully!</p>}
              </div>
            </div>
          </section>

          {/* Summary */}
          <section>
            <h2 className="text-xl font-bold mb-3">Summary <span className="text-sm font-normal text-gray-400">(optional — AI will write it)</span></h2>
            <textarea className={inputClass} rows={3} placeholder="A short intro about yourself..." value={form.summary} onChange={update('summary')} />
          </section>

          {/* Skills */}
          <section>
            <h2 className="text-xl font-bold mb-3">Skills</h2>
            <input className={inputClass} placeholder="Separate with commas: Python, React, SQL" value={form.skills} onChange={update('skills')} />
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
                <textarea className={inputClass} rows={2} placeholder="What you did (AI will turn this into bullet points)" value={item.description} onChange={updateList(setExperience)(i, 'description')} />
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
                <textarea className={inputClass} rows={2} placeholder="About the project" value={item.description} onChange={updateList(setProjects)(i, 'description')} />
                <button onClick={removeItem(setProjects)(i)} className="text-red-500 text-xs hover:underline">Remove</button>
              </div>
            ))}
          </section>

          {/* Certifications */}
          <section>
            <h2 className="text-xl font-bold mb-3">Certifications</h2>
            <input className={inputClass} placeholder="Separate with commas" value={form.certifications} onChange={update('certifications')} />
          </section>

          <button onClick={handleBuild} disabled={loading} className="w-full neon-btn">
            {loading ? '⏳ Generating...' : '🚀 Generate Resume'}
          </button>
        </div>

        {/* ---------------- Preview ---------------- */}
        <div>
          <div className="flex flex-col gap-4 mb-4 no-print">
            <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-lg text-sm">
              <h3 className="font-bold mb-1">JSON Resume Integration</h3>
              <p>Your resume is powered by the <strong>JSON Resume Ecosystem</strong>. The live preview uses the official React StackOverflow theme.</p>
              <p className="mt-2 text-xs">To apply 100+ other open-source themes, export your data to <code>resume.json</code> and use the JSON Resume Registry.</p>
            </div>
            
            <div className="flex gap-3 justify-end mt-2">
              <button onClick={exportJSON} className="px-4 py-2 bg-slate-800 text-white rounded-lg shadow font-bold text-sm hover:bg-slate-700 transition">
                📥 Export resume.json
              </button>
              <button 
                onClick={() => {
                  const iframe = document.getElementById('resume-iframe')
                  if(iframe) iframe.contentWindow.print()
                }} 
                className="neon-btn md:w-auto"
              >
                🖨️ Download PDF
              </button>
            </div>
          </div>

          <div id="resume-preview" className="shadow-2xl border border-gray-200 bg-white mx-auto print-resume-wrapper rounded-lg overflow-hidden h-[800px] w-full">
            <iframe 
              id="resume-iframe"
              srcDoc={previewHtml} 
              className="w-full h-full border-none" 
              title="Resume Preview"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResumeBuilder
