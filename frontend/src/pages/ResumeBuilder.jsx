import { useState } from 'react'
import API from '../api/axios'
import TemplateGallery from '../components/templateGallery'
import toast from 'react-hot-toast'

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
  const [showGallery, setShowGallery] = useState(false)

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
          address: form.location || '',
        },
        profiles: form.linkedin ? [{ network: 'LinkedIn', url: form.linkedin }] : [],
      },
      work: exp
        .filter((e) => e.company || e.role)
        .map((e) => ({
          name: e.company || 'Company',
          position: e.role || 'Role',
          startDate: e.duration ? e.duration.split('-')[0]?.trim() : '2020',
          endDate: e.duration && e.duration.includes('-') ? e.duration.split('-')[1]?.trim() : 'Present',
          summary: e.description || '',
          highlights: e.description ? e.description.split('\n').filter(Boolean) : [],
        })),
      education: edu
        .filter((e) => e.institution || e.degree)
        .map((e) => ({
          institution: e.institution || 'University',
          area: e.degree || 'Degree',
          studyType: '',
          startDate: e.year || '2016',
          endDate: e.year || '2020',
          score: e.details || '',
        })),
      skills: form.skills
        ? [
          {
            name: 'Skills',
            level: 'Advanced',
            keywords: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
          },
        ]
        : [],
      certificates: form.certifications
        ? form.certifications
          .split(',')
          .map((c) => ({ name: c.trim(), date: '', issuer: '', url: '' }))
          .filter((c) => c.name)
        : [],
      projects: proj
        .filter((p) => p.name || p.description)
        .map((p) => ({
          name: p.name || 'Project Name',
          description: p.description || '',
          highlights: p.description ? p.description.split('\n').filter(Boolean) : [],
          keywords: [],
        })),
    }
  }

  const handleBuild = async () => {
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
      // Auto-fill fields from backend response
      setForm((f) => ({ ...f, summary: data.summary || f.summary }))
      if (data.experience) setExperience(data.experience)
      if (data.projects) setProjects(data.projects)
    } catch (error) {
      console.error('Resume build error:', error)
      // Non-blocking: even if backend enhancement fails, we still open the gallery
      // with whatever the user has entered so the feature always works.
    } finally {
      setLoading(false)
    }
  }

  // Generate = enhance (best effort), then open the template gallery.
  const handleGenerate = async () => {
    if (!form.full_name.trim()) {
      toast.error('Please enter your full name.')
      return
    }
    await handleBuild()
    setShowGallery(true)
  }

  const inputClass =
    'w-full bg-slate-100/50 hover:bg-slate-200/40 border border-slate-200 focus:bg-white text-slate-800 wander-search-input text-xs rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-semibold'
  const btnAdd = 'text-xs text-blue-600 hover:text-blue-700 font-bold bg-blue-50 hover:bg-blue-100/70 border border-blue-200/50 px-3 py-1.5 rounded-full cursor-pointer transition-all'
  const btnRemove = 'text-xs text-red-500 hover:text-red-600 font-bold bg-red-50 hover:bg-red-100/70 border border-red-200/40 px-3 py-1.5 rounded-full cursor-pointer transition-all mt-1'

  return (
    <div className="wander-light-theme min-h-screen p-4 md:p-8 md:pl-24 flex flex-col font-sans select-none overflow-x-hidden relative">
      {/* UHD Background Wallpaper */}
      <img 
        src="https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=2560&auto=format&fit=crop&q=90" 
        alt="Resume Builder background" 
        className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none z-0"
      />
      {/* Soft Pure White Overlay */}
      <div className="absolute inset-0 z-0 pointer-events-none" style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(2px)' }} />

      <div className="max-w-3xl mx-auto w-full space-y-12 relative z-10">
        {/* Page Header */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight" style={{ color: '#0f172a' }}>Resume Builder</h1>
          <p className="text-xs md:text-sm font-bold max-w-lg mx-auto" style={{ color: '#475569' }}>
            Fill in your details, then pick from multiple professional templates.
          </p>
        </div>

        {/* Main Card Panel */}
        <div className="wander-bg-white border border-slate-200/80 p-6 md:p-8 rounded-3xl wander-badge-shadow space-y-8">
          {/* Basic Info */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Basic Info</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Full Name *</label>
                <input className={inputClass} placeholder="Full Name" value={form.full_name} onChange={update('full_name')} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Target Role</label>
                <input className={inputClass} placeholder="Target Role" value={form.target_role} onChange={update('target_role')} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                <input className={inputClass} placeholder="Email" value={form.email} onChange={update('email')} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Phone Number</label>
                <input className={inputClass} placeholder="Phone" value={form.phone} onChange={update('phone')} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Location (City, Country)</label>
                <input className={inputClass} placeholder="Location" value={form.location} onChange={update('location')} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">LinkedIn URL</label>
                <input className={inputClass} placeholder="LinkedIn URL" value={form.linkedin} onChange={update('linkedin')} />
              </div>
            </div>
            
            <div className="pt-2">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Profile Photo (Optional)</label>
              <div className="flex items-center gap-3">
                <input 
                  type="file" 
                  accept="image/*" 
                  id="profile-photo-upload"
                  onChange={handlePhotoUpload} 
                  className="hidden" 
                />
                <label 
                  htmlFor="profile-photo-upload"
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-xl border border-slate-200 cursor-pointer transition-all"
                >
                  Choose Image
                </label>
                {form.photo && (
                  <div className="flex items-center gap-2 animate-in fade-in duration-200">
                    <img src={form.photo} alt="Preview" className="w-9 h-9 rounded-full object-cover border border-slate-200" />
                    <span className="text-xs text-green-600 font-bold">✓ Photo uploaded</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Summary */}
          <div className="space-y-2">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Summary (Optional)</h2>
            <textarea className={inputClass} rows={3} placeholder="A short professional summary..." value={form.summary} onChange={update('summary')} />
          </div>

          <hr className="border-slate-100" />

          {/* Skills */}
          <div className="space-y-2">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Skills</h2>
            <input className={inputClass} placeholder="Comma separated, e.g. React, Node.js, SQL" value={form.skills} onChange={update('skills')} />
          </div>

          <hr className="border-slate-100" />

          {/* Education */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Education</h2>
              <button type="button" className={btnAdd} onClick={addItem(setEducation, emptyEducation)}>+ Add</button>
            </div>
            {education.map((item, i) => (
              <div key={i} className="p-4 bg-slate-50/50 border border-slate-200/60 rounded-2xl space-y-3 relative">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input className={inputClass} placeholder="Degree (e.g. B.Tech)" value={item.degree} onChange={updateList(setEducation)(i, 'degree')} />
                  <input className={inputClass} placeholder="Institution" value={item.institution} onChange={updateList(setEducation)(i, 'institution')} />
                  <input className={inputClass} placeholder="Year (e.g. 2024)" value={item.year} onChange={updateList(setEducation)(i, 'year')} />
                  <input className={inputClass} placeholder="Details (CGPA etc.)" value={item.details} onChange={updateList(setEducation)(i, 'details')} />
                </div>
                {education.length > 1 && (
                  <div className="flex justify-end">
                    <button type="button" className={btnRemove} onClick={removeItem(setEducation)(i)}>Remove</button>
                  </div>
                )}
              </div>
            ))}
          </div>

          <hr className="border-slate-100" />

          {/* Experience */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Experience</h2>
              <button type="button" className={btnAdd} onClick={addItem(setExperience, emptyExperience)}>+ Add</button>
            </div>
            {experience.map((item, i) => (
              <div key={i} className="p-4 bg-slate-50/50 border border-slate-200/60 rounded-2xl space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input className={inputClass} placeholder="Role" value={item.role} onChange={updateList(setExperience)(i, 'role')} />
                  <input className={inputClass} placeholder="Company" value={item.company} onChange={updateList(setExperience)(i, 'company')} />
                  <input className={inputClass} placeholder="Duration (e.g. 2022 - Present)" value={item.duration} onChange={updateList(setExperience)(i, 'duration')} />
                </div>
                <textarea className={inputClass} rows={2} placeholder="What you did (one point per line)" value={item.description} onChange={updateList(setExperience)(i, 'description')} />
                {experience.length > 1 && (
                  <div className="flex justify-end">
                    <button type="button" className={btnRemove} onClick={removeItem(setExperience)(i)}>Remove</button>
                  </div>
                )}
              </div>
            ))}
          </div>

          <hr className="border-slate-100" />

          {/* Projects */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Projects</h2>
              <button type="button" className={btnAdd} onClick={addItem(setProjects, emptyProject)}>+ Add</button>
            </div>
            {projects.map((item, i) => (
              <div key={i} className="p-4 bg-slate-50/50 border border-slate-200/60 rounded-2xl space-y-3">
                <input className={inputClass} placeholder="Project Name" value={item.name} onChange={updateList(setProjects)(i, 'name')} />
                <textarea className={inputClass} rows={2} placeholder="Description" value={item.description} onChange={updateList(setProjects)(i, 'description')} />
                {projects.length > 1 && (
                  <div className="flex justify-end">
                    <button type="button" className={btnRemove} onClick={removeItem(setProjects)(i)}>Remove</button>
                  </div>
                )}
              </div>
            ))}
          </div>

          <hr className="border-slate-100" />

          {/* Certifications */}
          <div className="space-y-2">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Certifications</h2>
            <input className={inputClass} placeholder="Comma separated" value={form.certifications} onChange={update('certifications')} />
          </div>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading}
            className="w-full bg-[#0f172a] hover:bg-blue-600 disabled:opacity-50 text-white text-xs font-bold py-3.5 rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 mt-4"
          >
            {loading ? 'Generating...' : 'Generate Resume'}
          </button>
        </div>
      </div>

      {/* Template gallery opens on Generate */}
      {showGallery && (
        <TemplateGallery
          resume={toJSONResume(form, education, experience, projects)}
          onClose={() => setShowGallery(false)}
        />
      )}
    </div>
  )
}

export default ResumeBuilder