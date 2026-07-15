import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const userName = localStorage.getItem('name') || 'Guest User';
  const token = localStorage.getItem('token');

  const [avatarUrl, setAvatarUrl] = useState(localStorage.getItem('profile_image') || '');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const handleAvatarChange = () => {
      setAvatarUrl(localStorage.getItem('profile_image') || '');
    };
    const toggleSidebar = () => setIsSidebarOpen(prev => !prev);
    const openSidebar = () => setIsSidebarOpen(true);
    const closeSidebar = () => setIsSidebarOpen(false);

    window.addEventListener('avatar-changed', handleAvatarChange);
    window.addEventListener('storage', handleAvatarChange);
    window.addEventListener('toggle-sidebar', toggleSidebar);
    window.addEventListener('open-sidebar', openSidebar);
    window.addEventListener('close-sidebar', closeSidebar);

    return () => {
      window.removeEventListener('avatar-changed', handleAvatarChange);
      window.removeEventListener('storage', handleAvatarChange);
      window.removeEventListener('toggle-sidebar', toggleSidebar);
      window.removeEventListener('open-sidebar', openSidebar);
      window.removeEventListener('close-sidebar', closeSidebar);
    };
  }, []);

  const role = (localStorage.getItem('role') || '').toLowerCase();
  const canManageJobs = role === 'company' || role === 'admin';
  const isHome = location.pathname === '/';

  // Sidebar ke navigation links - fixed paths to match App.jsx
  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Direct Matcher', path: '/ai-match' },
    { name: 'Resume Builder', path: '/resume-builder' },
    { name: 'Skill Gap', path: '/skill-gap' },
    { name: 'Tracker', path: '/applications', auth: true },
    { name: 'ATS Score', path: '/ats' },
    { name: 'Preparation', path: '/prep' },
    { name: 'Jobs', path: '/jobs' },
    { name: 'Govt Exam Updates', path: '/updates' },
    { name: 'Mock Interview', path: '/ai-interview' },
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
    setIsSidebarOpen(false)
    navigate('/login')
  }

  return (
    <div className="flex h-screen bg-slate-900 font-sans text-slate-100 relative overflow-hidden">

      {/* Backdrop for overlay drawer */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-slate-950/65 backdrop-blur-sm z-40 transition-opacity duration-300"
        />
      )}

      {/* Sidebar Navigation Drawer (Light themed matching Home page) */}
      <aside
        onMouseLeave={() => setIsSidebarOpen(false)}
        className={`fixed top-0 bottom-0 left-0 w-64 wander-bg-white border-r border-slate-200 flex flex-col shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Subtle Aesthetic Wallpaper watermark */}
        <div className="absolute inset-0 opacity-[0.15] pointer-events-none select-none z-0">
          <img
            src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80"
            alt="Minimalist abstract wallpaper background"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Brand Logo / Title */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between relative z-10">
          <Link to="/" onClick={() => setIsSidebarOpen(false)} className="text-2xl font-black tracking-widest text-[#0f172a] font-mono">
            CAREERPILOT
          </Link>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="text-slate-400 hover:text-slate-800 font-bold p-1 text-sm cursor-pointer transition-colors"
            title="Close Menu"
          >
            ✕
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto relative z-10">
          {navItems.filter(item => !item.auth || token).map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${isActive
                    ? 'bg-blue-50 text-blue-600 shadow-sm border border-blue-100/80'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-blue-600'
                  }`}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User Profile Section */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 relative z-10">
          {token ? (
            <div className="flex items-center justify-between px-2 py-2">
              <div className="flex items-center gap-3">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="User Profile"
                    className="w-9 h-9 rounded-full object-cover shadow-sm border border-blue-500/20"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold shadow-sm border border-blue-200/50">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex flex-col text-left">
                  <span className="text-sm font-bold text-slate-800">{userName}</span>
                  <button onClick={handleLogout} className="text-xs text-red-500 hover:underline text-left font-bold">Logout</button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Link to="/admin" onClick={() => setIsSidebarOpen(false)} className="text-center text-sm text-slate-600 hover:text-blue-600 font-bold py-1">Admin Panel</Link>
              <Link to="/login" onClick={() => setIsSidebarOpen(false)} className="text-center text-sm text-slate-600 hover:text-blue-600 font-bold py-1">Login</Link>
              <Link to="/register" onClick={() => setIsSidebarOpen(false)} className="bg-[#0f172a] text-white hover:bg-blue-600 text-center text-sm py-2.5 rounded-xl font-bold transition-all shadow-sm">Register</Link>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area jahan baaki pages dikhenge */}
      <main className="flex-1 overflow-y-auto bg-slate-900 relative">
        {/* Floating Hamburger Toggle Menu on Non-Home Pages */}
        {!isSidebarOpen && !isHome && (
          <button
            onMouseEnter={() => setIsSidebarOpen(true)}
            onClick={() => setIsSidebarOpen(true)}
            className="fixed top-6 left-6 z-30 p-2.5 bg-slate-800 border border-slate-700 hover:bg-slate-700 rounded-lg text-slate-200 shadow-lg cursor-pointer flex flex-col justify-center items-center gap-1 w-10 h-10 hover:scale-105 transition-all"
          >
            <span className="w-5 h-0.5 bg-slate-200 rounded-full"></span>
            <span className="w-5 h-0.5 bg-slate-200 rounded-full"></span>
            <span className="w-5 h-0.5 bg-slate-200 rounded-full"></span>
          </button>
        )}
        <div className="w-full h-full">
          {children}
        </div>
      </main>

    </div>
  );
}

export default Layout;