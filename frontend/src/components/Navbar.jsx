import { Link, useNavigate } from 'react-router-dom'

function Navbar() {
  const navigate = useNavigate()
  const name = localStorage.getItem('name')
  const token = localStorage.getItem('token')
  const role = (localStorage.getItem('role') || '').toLowerCase()
  const canManageJobs = role === 'company' || role === 'admin'

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('name')
    localStorage.removeItem('role')
    navigate('/login')
  }

  return (
    <nav className="brand-gradient text-white px-6 py-4 shadow-lg sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-extrabold tracking-tight drop-shadow neon-text">JobPortal</Link>
        <div className="flex gap-4 items-center">
          <Link to="/dashboard" className="hover:text-white/90 transition">Dashboard</Link>
          <Link to="/ai-match" className="hover:text-white/90 transition">Direct Matcher</Link>
          <Link to="/resume-builder" className="hover:text-white/90 transition">Resume Builder</Link>
          <Link to="/ats" className="hover:text-white/90 transition">ATS Score</Link>
          <Link to="/skill-gap" className="hover:text-white/90 transition">Skill Gap</Link>
          <Link to="/prep" className="hover:text-white/90 transition">Prep Hub</Link>
          <Link to="/jobs" className="hover:text-white/90 transition">Jobs</Link>
          <Link to="/updates" className="hover:text-white/90 transition">Govt Exam Updates</Link>
          <Link to="/eligibility" className="hover:text-white/90 transition">Eligibility</Link>
          {token ? (
            <>
              <span className="text-white/90">Hi, {name}!</span>
              <Link to="/applications" className="hover:text-white/90 transition">Applications</Link>
              <Link to="/notifications" className="hover:text-white/90 transition">Alerts</Link>
              {canManageJobs && (
                <Link to="/admin" className="hover:text-white/90 transition">Admin</Link>
              )}
              <button
                onClick={handleLogout}
                className="neon-btn"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-white/90 transition">Login</Link>
              <Link to="/register" className="neon-btn">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
