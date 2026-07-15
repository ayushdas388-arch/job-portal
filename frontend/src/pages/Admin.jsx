import { useEffect, useState } from 'react'
import API from '../api/axios'
import BrandIcon from '../components/BrandIcon'

function Admin() {
  const [platforms, setPlatforms] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('users')

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const [jobsRes, usersRes] = await Promise.all([
          API.get('/jobs/', { params: { category: 'all' } }).catch(() => ({ data: { platforms: [] } })),
          API.get('/auth/users').catch(() => ({ data: { users: [] } }))
        ])
        
        if (alive) {
          setPlatforms(jobsRes.data.platforms || [])
          setUsers(usersRes.data.users || [])
        }
      } catch (error) {
        console.error('Admin data load error:', error)
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => {
      alive = false
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6">
      <h1 className="text-4xl font-bold text-center mb-8">Admin Dashboard</h1>

      {/* Tabs */}
      <div className="max-w-5xl mx-auto flex gap-4 mb-8 justify-center">
        <button 
          onClick={() => setActiveTab('users')}
          className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all shadow-sm ${activeTab === 'users' ? 'bg-[#0f172a] text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}
        >
          User Management
        </button>
        <button 
          onClick={() => setActiveTab('platforms')}
          className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all shadow-sm ${activeTab === 'platforms' ? 'bg-[#0f172a] text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}
        >
          System Configuration
        </button>
      </div>

      {loading ? (
        <p className="text-center text-gray-500 font-bold">Loading admin data...</p>
      ) : activeTab === 'users' ? (
        <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gray-50">
            <h2 className="text-2xl font-bold text-gray-800">Registered Users ({users.length})</h2>
            <p className="text-sm text-gray-500 font-medium">View and manage all registered users on the platform.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider">
                  <th className="p-4 border-b border-gray-200 font-bold">Name</th>
                  <th className="p-4 border-b border-gray-200 font-bold">Email</th>
                  <th className="p-4 border-b border-gray-200 font-bold">Role</th>
                  <th className="p-4 border-b border-gray-200 font-bold">Joined At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 font-bold text-gray-800 text-sm">{user.name}</td>
                    <td className="p-4 text-gray-600 text-sm">{user.email}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold rounded-full ${user.role === 'admin' ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-blue-50 text-blue-700 border border-blue-200'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4 text-gray-500 text-xs font-semibold">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan="4" className="p-8 text-center text-gray-500 font-semibold">No users found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <h2 className="text-2xl font-bold mb-4">Manual Posting Disabled</h2>
            <p className="text-gray-600 mb-3 font-medium">
              This portal no longer creates or stores its own job posts. Users are now sent directly to external
              job platforms and official recruitment portals.
            </p>
            <p className="text-gray-500 text-sm font-medium">
              AI Match builds live search links from a resume or skill list, and the Jobs page acts as a launchpad
              to those external sources.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4 px-2">Connected Platforms</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {platforms.map((platform) => (
                <div key={platform.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4 mb-3">
                    <span className="text-xs font-bold text-blue-600 bg-slate-100 p-2.5 rounded-full flex items-center justify-center shrink-0">
                      <BrandIcon url={platform.url} name={platform.site} className="w-6 h-6" />
                    </span>
                    <h3 className="text-lg font-bold text-gray-800">{platform.site}</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-4 font-medium leading-relaxed">{platform.description}</p>
                  <a
                    href={platform.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors inline-block"
                  >
                    Open Platform URL
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Admin
