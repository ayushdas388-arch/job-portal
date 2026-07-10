import { Link, useLocation, useNavigate } from 'react-router-dom';

function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const userName = localStorage.getItem('name') || 'Guest User';
  const token = localStorage.getItem('token');
  const role = (localStorage.getItem('role') || '').toLowerCase();
  const canManageJobs = role === 'company' || role === 'admin';

  // Sidebar ke navigation links - fixed paths to match App.jsx
  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Dashboard', path: '/dashboard', auth: true },
    { name: 'Jobs', path: '/jobs' },
    { name: 'AI Match', path: '/ai-match' },
    { name: 'Resume Builder', path: '/resume-builder' },
    { name: 'Skill Gap', path: '/skill-gap' },
    { name: 'Tracker', path: '/applications', auth: true }, 
    { name: 'Preparation', path: '/prep' },
    { name: 'Admit Cards/Results', path: '/updates' },
    { name: 'AI Interview', path: '/ai-interview' },
    { name: 'Career Roadmap', path: '/roadmap' },
    { name: 'Eligibility', path: '/eligibility' },
    { name: 'Alerts', path: '/notifications', auth: true },
  ];

  if (canManageJobs) {
    navItems.push({ name: 'Admin', path: '/admin', auth: true });
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('name')
    localStorage.removeItem('role')
    navigate('/login')
  }

  return (
    <div className="flex h-screen bg-slate-900 font-sans text-slate-100">
      
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-slate-800 border-r border-slate-700 hidden md:flex flex-col shadow-sm">
        {/* Brand Logo / Title */}
        <div className="p-6 border-b border-slate-700 flex items-center justify-center">
          <Link to="/" className="text-2xl font-extrabold tracking-tight drop-shadow neon-text">
            JobPortal.
          </Link>
        </div>
        
        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.filter(item => !item.auth || token).map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isActive 
                    ? 'bg-emerald-500/20 text-emerald-400 shadow-sm border border-emerald-500/30' 
                    : 'text-slate-400 hover:bg-slate-700 hover:text-emerald-400'
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User Profile Section */}
        <div className="p-4 border-t border-slate-700 bg-slate-800">
          {token ? (
            <div className="flex items-center justify-between px-2 py-2">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-900 flex items-center justify-center text-emerald-400 font-bold shadow-sm border border-emerald-500/30">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-slate-200">{userName}</span>
                  <button onClick={handleLogout} className="text-xs text-red-400 hover:underline text-left">Logout</button>
                </div>
              </div>
            </div>
          ) : (
             <div className="flex flex-col gap-2">
                <Link to="/login" className="text-center text-sm text-slate-300 hover:text-emerald-400">Login</Link>
                <Link to="/register" className="neon-btn text-center text-sm py-2">Register</Link>
             </div>
          )}
        </div>
      </aside>

      {/* Main Content Area jahan baaki pages dikhenge */}
      <main className="flex-1 overflow-y-auto bg-slate-900">
        <div className="w-full h-full">
          {children}
        </div>
      </main>

    </div>
  );
}

export default Layout;