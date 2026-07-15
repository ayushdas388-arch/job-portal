import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import {
  FaInstagram,
  FaFacebookF,
  FaSearch,
  FaBriefcase,
  FaHeadset,
  FaStar,
  FaChevronLeft,
  FaChevronRight,
  FaFileAlt,
  FaGraduationCap,
  FaArrowRight
} from 'react-icons/fa'
import { FaXTwitter } from 'react-icons/fa6'

function Home() {
  const [activeSlide, setActiveSlide] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/jobs?q=${encodeURIComponent(searchQuery.trim())}`)
    } else {
      toast.error('Please enter keywords to search')
    }
  }

  const heroSlides = [
    {
      title: "Software Engineering",
      url: "/images/software_team.jpg",
    },
    {
      title: "Hardware Engineering",
      url: "/images/hardware_engineer.jpg",
    },
    {
      title: "Indian Railways",
      url: "/images/indian_railways.jpg",
    },
    {
      title: "Defense Services",
      url: "/images/indian_army.jpg",
    },
    {
      title: "Indian Police Service (IPS)",
      url: "/images/ips_police.jpg",
    },
    {
      title: "Career Planning",
      url: "/images/career_prep.jpg",
      position: "right 20%",
    }
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % heroSlides.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="wander-light-theme min-h-screen p-4 md:p-8 flex flex-col font-sans select-none overflow-x-hidden">
      <div className="max-w-7xl mx-auto w-full space-y-12">

        {/* 1. Header Area */}
        <header className="flex flex-col md:flex-row items-center justify-between gap-4 py-4 border-b border-slate-200">
          {/* Menu icon and Logo */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onMouseEnter={() => window.dispatchEvent(new Event('open-sidebar'))}
              onClick={() => window.dispatchEvent(new Event('toggle-sidebar'))}
              className="flex flex-col gap-1 justify-center items-center w-8 h-8 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer shrink-0"
              title="Menu"
            >
              <span className="w-5 h-0.5 bg-slate-800 rounded-full"></span>
              <span className="w-5 h-0.5 bg-slate-800 rounded-full"></span>
              <span className="w-5 h-0.5 bg-slate-800 rounded-full"></span>
            </button>
            <div className="text-2xl font-black tracking-widest wander-text-dark font-mono">
              CAREERPILOT<span className="text-blue-600 font-sans"></span>
            </div>
          </div>

          {/* Search Pill & CTA */}
          <form onSubmit={handleSearch} className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:flex-none">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for jobs, skills..."
                className="w-full md:w-64 bg-slate-100 hover:bg-slate-200/70 focus:bg-white text-slate-800 wander-search-input text-xs rounded-full pl-8 pr-4 py-2 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
              />
              <FaSearch className="absolute left-3 top-2.5 text-slate-400 text-xs" />
            </div>
            <button
              type="submit"
              className="bg-[#0f172a] hover:bg-blue-600 text-white text-xs font-bold px-5 py-2.5 rounded-full shadow-sm hover:shadow-md transition-all whitespace-nowrap"
            >
              Search
            </button>
          </form>
        </header>

        {/* 2. Hero Section */}
        <section className="relative rounded-3xl overflow-hidden shadow-lg h-[400px] md:h-[500px]">
          {/* Full-width Background Slide Transition (goes left, next comes from right) */}
          <div className="absolute inset-0 w-full h-full overflow-hidden z-0">
            {heroSlides.map((slide, idx) => {
              const isActive = idx === activeSlide
              const isPrev = idx === (activeSlide - 1 + heroSlides.length) % heroSlides.length

              let positionClass = 'translate-x-full z-0'
              let transitionClass = ''

              if (isActive) {
                positionClass = 'translate-x-0 z-10'
                transitionClass = 'transition-transform duration-[1000ms] ease-in-out'
              } else if (isPrev) {
                positionClass = '-translate-x-full z-10'
                transitionClass = 'transition-transform duration-[1000ms] ease-in-out'
              }

              return (
                <div
                  key={idx}
                  className={`absolute inset-0 w-full h-full transform ${positionClass} ${transitionClass}`}
                  style={{ willChange: 'transform' }}
                >
                  <img
                    src={slide.url}
                    alt={slide.title}
                    className="w-full h-full object-cover"
                    style={{ objectPosition: slide.position || 'center' }}
                  />
                  <div className="absolute inset-0 bg-[#0f172a]/20" />
                </div>
              )
            })}
          </div>

          {/* Dark Overlay for readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0f172a]/95 via-[#0f172a]/55 to-transparent z-15 pointer-events-none" />

          {/* Hero Content */}
          <div className="absolute inset-y-0 left-0 flex flex-col justify-center p-8 md:p-16 text-white space-y-4 max-w-xl md:max-w-2xl z-20 animate-in fade-in slide-in-from-left duration-700">
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-widest text-white leading-none font-mono drop-shadow-md">
              CAREERPILOT
            </h1>
            <p className="text-sm md:text-base text-slate-200 max-w-xl font-medium leading-relaxed drop-shadow-sm">
              Discover breathtaking career opportunities across top platforms with curated jobs, AI insights, and hassle-free matching all in one platform.
            </p>
            <div className="flex gap-4 pt-2">
              <Link
                to="/roadmap"
                className="bg-white hover:bg-blue-600 hover:text-white text-slate-900 text-xs font-bold px-6 py-3 rounded-full transition-all shadow-md transform hover:-translate-y-0.5"
              >
                Plan Your Career
              </Link>
              <Link
                to="/jobs"
                className="border-2 border-white/80 hover:border-white hover:bg-white/10 text-white text-xs font-bold px-6 py-3 rounded-full transition-all shadow-md transform hover:-translate-y-0.5"
              >
                Explore Platforms
              </Link>
            </div>
          </div>
        </section>

        {/* 3. Why Choose Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 py-4">
          {/* Left Column */}
          <div className="space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-extrabold wander-text-dark tracking-tight leading-tight">
                Why Thousands of Job Seekers Choose CAREERPILOT for Their Career Adventures
              </h2>
              <p className="text-sm text-slate-500 leading-relaxed">
                From pristine platform mapping to smart resume building, we make exploring the careers marketplace easier, safer, and more exciting with expert-crafted AI matches and round-the-clock application support.
              </p>
              {/* Social Media Links */}
              <div className="flex gap-4 pt-2">
                <a href="#instagram" className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center text-slate-600 hover:text-blue-600 hover:border-blue-600 transition-colors">
                  <FaInstagram className="text-xs" />
                </a>
                <a href="#twitter" className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center text-slate-600 hover:text-blue-600 hover:border-blue-600 transition-colors">
                  <FaXTwitter className="text-xs" />
                </a>
                <a href="#facebook" className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center text-slate-600 hover:text-blue-600 hover:border-blue-600 transition-colors">
                  <FaFacebookF className="text-xs" />
                </a>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200">
              <div className="flex flex-col items-center md:items-start text-center md:text-left">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mb-2">
                  <FaBriefcase className="text-sm" />
                </div>
                <span className="text-xl font-black wander-text-dark">12k+</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Happy Candidates</span>
              </div>
              <div className="flex flex-col items-center md:items-start text-center md:text-left">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mb-2">
                  <FaStar className="text-sm" />
                </div>
                <span className="text-xl font-black wander-text-dark">1 Year+</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Match Experience</span>
              </div>
              <div className="flex flex-col items-center md:items-start text-center md:text-left">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mb-2">
                  <FaSearch className="text-sm" />
                </div>
                <span className="text-xl font-black wander-text-dark">50+</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Portals Covered</span>
              </div>
            </div>
          </div>

          {/* Right Column (Stacked Cards) */}
          <div className="space-y-4">
            {/* Box 1: AI Matcher */}
            <Link 
              to="/ai-match" 
              className="flex gap-4 p-5 wander-bg-white border border-slate-200/80 rounded-2xl wander-badge-shadow hover:shadow-md transition-all hover:-translate-y-0.5 duration-200 cursor-pointer block"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-lg shrink-0">
                <FaSearch />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold wander-text-dark">AI Matching & Fit</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Our advanced AI matching algorithm inspects your resume and constructs custom search intents targeting multiple external job portals instantly.
                </p>
              </div>
            </Link>

            {/* Box 2: Application Tracker */}
            <Link 
              to="/applications" 
              className="flex gap-4 p-5 wander-bg-white border border-slate-200/80 rounded-2xl wander-badge-shadow hover:shadow-md transition-all hover:-translate-y-0.5 duration-200 cursor-pointer block"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-lg shrink-0">
                <FaBriefcase />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold wander-text-dark">All-in-One</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Save roles directly into your dashboard to monitor application status, deadlines, exam alerts, and interview preparations in one unified place.
                </p>
              </div>
            </Link>

            {/* Box 3: Preparation Hub */}
            <Link 
              to="/prep" 
              className="flex gap-4 p-5 wander-bg-white border border-slate-200/80 rounded-2xl wander-badge-shadow hover:shadow-md transition-all hover:-translate-y-0.5 duration-200 cursor-pointer block"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-lg shrink-0">
                <FaHeadset />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold wander-text-dark">24/7 Career Assistance</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Access mock AI interview hubs, skill-gap analysis sheets, and structured roadmap guides anytime to keep your job search progressing smoothly.
                </p>
              </div>
            </Link>
          </div>
        </section>

        {/* 4. Top Platforms (Top Destinations) */}
        <section className="wander-bg-gray rounded-3xl p-6 md:p-10 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold wander-text-dark tracking-tight">Top Platforms</h2>
              <p className="text-xs text-slate-500 mt-1 max-w-md">
                From professional networking spaces to specific regional aggregators, find the platform that best fits your job profile.
              </p>
            </div>
            <div className="flex gap-2">
              <button className="w-9 h-9 rounded-full bg-white hover:bg-slate-200 flex items-center justify-center border border-slate-200 hover:border-slate-300 text-slate-700 transition-colors shadow-sm">
                <FaChevronLeft className="text-xs" />
              </button>
              <button className="w-9 h-9 rounded-full bg-white hover:bg-slate-200 flex items-center justify-center border border-slate-200 hover:border-slate-300 text-slate-700 transition-colors shadow-sm">
                <FaChevronRight className="text-xs" />
              </button>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

            {/* Card 1: LinkedIn */}
            <a 
              href="https://www.linkedin.com/jobs/"
              target="_blank"
              rel="noopener noreferrer"
              className="wander-bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all relative group cursor-pointer block hover:-translate-y-0.5 duration-200"
            >
              <div className="h-48 overflow-hidden relative">
                <img src="https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=600&auto=format&fit=crop&q=80" alt="LinkedIn Platform" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <span className="absolute top-3 right-3 bg-white/95 text-slate-900 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm">Starts at Free</span>
              </div>
              <div className="p-4 space-y-2">
                <div className="flex justify-between items-center text-xs text-slate-400 font-semibold">
                  <span>Professional Network</span>
                  <span className="flex items-center gap-1"><FaStar className="text-amber-400" /> 4.9 (1.2k)</span>
                </div>
                <h3 className="font-bold text-sm wander-text-dark">LinkedIn Jobs</h3>
                <span className="text-[10px] font-medium text-slate-400 block uppercase tracking-wider">Global Reach</span>
              </div>
            </a>

            {/* Card 2: Indeed */}
            <a 
              href="https://in.indeed.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="wander-bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all relative group cursor-pointer block hover:-translate-y-0.5 duration-200"
            >
              <div className="h-48 overflow-hidden relative">
                <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&auto=format&fit=crop&q=80" alt="Indeed Platform" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <span className="absolute top-3 right-3 bg-white/95 text-slate-900 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm">Starts at Free</span>
              </div>
              <div className="p-4 space-y-2">
                <div className="flex justify-between items-center text-xs text-slate-400 font-semibold">
                  <span>Standard Job Board</span>
                  <span className="flex items-center gap-1"><FaStar className="text-amber-400" /> 4.6 (950)</span>
                </div>
                <h3 className="font-bold text-sm wander-text-dark">Indeed Jobs</h3>
                <span className="text-[10px] font-medium text-slate-400 block uppercase tracking-wider">Multi-national</span>
              </div>
            </a>

            {/* Card 3: Naukri */}
            <a 
              href="https://www.naukri.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="wander-bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all relative group cursor-pointer block hover:-translate-y-0.5 duration-200"
            >
              <div className="h-48 overflow-hidden relative">
                <img src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&auto=format&fit=crop&q=80" alt="Naukri Platform" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <span className="absolute top-3 right-3 bg-white/95 text-slate-900 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm">Starts at Free</span>
              </div>
              <div className="p-4 space-y-2">
                <div className="flex justify-between items-center text-xs text-slate-400 font-semibold">
                  <span>Indian Market Leader</span>
                  <span className="flex items-center gap-1"><FaStar className="text-amber-400" /> 4.8 (2k)</span>
                </div>
                <h3 className="font-bold text-sm wander-text-dark">Naukri.com</h3>
                <span className="text-[10px] font-medium text-slate-400 block uppercase tracking-wider">India & Gulf</span>
              </div>
            </a>

            {/* Card 4: Upwork */}
            <a 
              href="https://www.upwork.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="wander-bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all relative group cursor-pointer block hover:-translate-y-0.5 duration-200"
            >
              <div className="h-48 overflow-hidden relative">
                <img src="https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=600&auto=format&fit=crop&q=80" alt="Upwork Platform" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <span className="absolute top-3 right-3 bg-white/95 text-slate-900 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm">Commission-Based</span>
              </div>
              <div className="p-4 space-y-2">
                <div className="flex justify-between items-center text-xs text-slate-400 font-semibold">
                  <span>Freelance Platform</span>
                  <span className="flex items-center gap-1"><FaStar className="text-amber-400" /> 4.7 (780)</span>
                </div>
                <h3 className="font-bold text-sm wander-text-dark">Upwork Freelance</h3>
                <span className="text-[10px] font-medium text-slate-400 block uppercase tracking-wider">Remote / Worldwide</span>
              </div>
            </a>

          </div>

          <div className="pt-2">
            <Link to="/jobs" className="bg-[#0f172a] hover:bg-blue-600 text-white text-xs font-bold px-6 py-3 rounded-full shadow-sm hover:shadow-md transition-all inline-block">
              View all platforms
            </Link>
          </div>
        </section>

        {/* 5. Tour Packages Section */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Card 1: Main packages box */}
          <div className="rounded-3xl overflow-hidden shadow-md relative min-h-[300px] flex flex-col justify-between p-8 group">
            <img
              src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&auto=format&fit=crop&q=80"
              alt="Career Services"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a]/95 via-[#0f172a]/75 to-[#0f172a]/50" />
            
            <div className="relative z-10 space-y-3">
              <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider block">Career Services</span>
              <h3 className="text-2xl font-black text-white leading-tight">Smart tools to level up your career game</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Unlock specialized AI analysis, template builders, and real-time trackers. Custom tools designed for modern candidate needs.
              </p>
            </div>
            <div className="relative z-10 pt-6">
              <button 
                onClick={() => window.dispatchEvent(new Event('open-sidebar'))}
                className="bg-white hover:bg-blue-600 hover:text-white text-slate-900 text-xs font-bold px-6 py-3 rounded-full transition-all inline-block shadow-sm"
              >
                Browse all tools
              </button>
            </div>
          </div>

          {/* Card 2: AI Interview Coaching */}
          <div className="rounded-3xl overflow-hidden shadow-md relative min-h-[300px] flex flex-col justify-end p-8 group">
            <img
              src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80"
              alt="Interview Prep"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a]/90 via-[#0f172a]/40 to-[#0f172a]/10" />
            <div className="relative z-10 space-y-2 text-white">
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest block">Preparation Hub</span>
              <h4 className="text-lg font-extrabold">AI Interview Coach</h4>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Practice customized mock interviews with instant AI audio/text analysis and comprehensive skill feedback dashboards.
              </p>
              <Link to="/ai-interview" className="text-xs font-bold text-white hover:text-blue-400 transition-colors flex items-center gap-1.5 pt-2">
                Start mock session <FaArrowRight className="text-[10px]" />
              </Link>
            </div>
          </div>

          {/* Card 3: Resume Builder */}
          <div className="rounded-3xl overflow-hidden shadow-md relative min-h-[300px] flex flex-col justify-end p-8 group">
            <img
              src="https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&auto=format&fit=crop&q=80"
              alt="Resume Building"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a]/90 via-[#0f172a]/40 to-[#0f172a]/10" />
            <div className="relative z-10 space-y-2 text-white">
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest block">Interactive Builder</span>
              <h4 className="text-lg font-extrabold">Resume Template Suite</h4>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Select from beautiful layouts, input standard fields, and download industry-approved PDFs matching top HR standards.
              </p>
              <Link to="/resume-builder" className="text-xs font-bold text-white hover:text-blue-400 transition-colors flex items-center gap-1.5 pt-2">
                Build new resume <FaArrowRight className="text-[10px]" />
              </Link>
            </div>
          </div>

        </section>

        {/* 6. Easy steps section */}
        <section className="text-center py-6 space-y-8">
          <div className="space-y-2">
            <h2 className="text-2xl md:text-3xl font-extrabold wander-text-dark tracking-tight">Job search made as easy as 1-2-3</h2>
            <p className="text-xs text-slate-400">Follow three simple milestones to begin applying across top global platforms.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 max-w-4xl mx-auto">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-200/50 flex items-center justify-center text-blue-600 font-bold mx-auto text-sm shadow-sm">
                <FaFileAlt />
              </div>
              <h3 className="font-bold text-sm wander-text-dark">1. Upload Resume</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Provide your existing CV or insert details manually inside our template builder to set up your primary profile.
              </p>
            </div>
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-200/50 flex items-center justify-center text-blue-600 font-bold mx-auto text-sm shadow-sm">
                <FaSearch />
              </div>
              <h3 className="font-bold text-sm wander-text-dark">2. Run AI Match</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Let AI map your skills, category, and preferences to build optimized query strings for active listings.
              </p>
            </div>
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-200/50 flex items-center justify-center text-blue-600 font-bold mx-auto text-sm shadow-sm">
                <FaGraduationCap />
              </div>
              <h3 className="font-bold text-sm wander-text-dark">3. Apply & Track</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Follow direct links to apply on source websites and save roles to your progress tracking panel.
              </p>
            </div>
          </div>
        </section>

      </div>
    </div>
  )
}

export default Home