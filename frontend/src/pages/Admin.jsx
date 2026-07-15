import { useEffect, useState } from 'react'
import API from '../api/axios'
import BrandIcon from '../components/BrandIcon'
import { toast } from 'react-toastify'

function Admin() {
  const [platforms, setPlatforms] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('users')

  const currentUserId = localStorage.getItem('userId') // Will use token or email to prevent self-deletion if ID isn't in storage
  const currentUserEmail = localStorage.getItem('email') || ''

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [jobsRes, usersRes] = await Promise.all([
        API.get('/jobs/', { params: { category: 'all' } }).catch(() => ({ data: { platforms: [] } })),
        API.get('/auth/users').catch(() => ({ data: { users: [] } }))
      ])
      
      setPlatforms(jobsRes.data?.platforms || [])
      setUsers(usersRes.data?.users || [])
    } catch (error) {
      console.error('Admin data load error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async (userId, userEmail) => {
    if (!window.confirm(`Are you sure you want to permanently delete user ${userEmail}?`)) return
    
    try {
      await API.delete(`/auth/users/${userId}`)
      toast.success('User deleted successfully')
      // Remove from UI without reloading
      setUsers(users.filter(u => u.id !== userId))
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to delete user')
    }
  }

  // Calculate stats
  const totalUsers = users.length
  
  const getNewUsersThisWeek = () => {
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    
    return users.filter(u => {
      if (!u.created_at) return false
      return new Date(u.created_at) > oneWeekAgo
    }).length
  }
  const newUsersThisWeek = getNewUsersThisWeek()

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
          Connected Platforms
        </button>
      </div>

      {loading ? (
        <p className="text-center text-gray-500 font-bold">Loading admin data...</p>
      ) : activeTab === 'users' ? (
        <div className="max-w-5xl mx-auto space-y-6">
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex items-center gap-4">
              <div className="bg-blue-100 p-4 rounded-full text-blue-600">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
              </div>
              <div>
                <p className="text-gray-500 text-sm font-bold">Total Registered Users</p>
                <p className="text-3xl font-black text-gray-800">{totalUsers}</p>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex items-center gap-4">
              <div className="bg-green-100 p-4 rounded-full text-green-600">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>
              </div>
              <div>
                <p className="text-gray-500 text-sm font-bold">New Users (This Week)</p>
                <p className="text-3xl font-black text-gray-800">{newUsersThisWeek}</p>
              </div>
            </div>
          </div>

          {/* User Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50">
              <h2 className="text-2xl font-bold text-gray-800">All Users</h2>
              <p className="text-sm text-gray-500 font-medium">View and manage all registered users.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider">
                    <th className="p-4 border-b border-gray-200 font-bold">Name</th>
                    <th className="p-4 border-b border-gray-200 font-bold">Email</th>
                    <th className="p-4 border-b border-gray-200 font-bold">Role</th>
                    <th className="p-4 border-b border-gray-200 font-bold">Joined At</th>
                    <th className="p-4 border-b border-gray-200 font-bold text-right">Actions</th>
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
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleDeleteUser(user.id, user.email)}
                          className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-xs font-bold transition-colors"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-gray-500 font-semibold">No users found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-5xl mx-auto space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-4 px-2">Connected Job Platforms</h2>
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
