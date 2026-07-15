import { useEffect, useState } from 'react'
import API from '../api/axios'
import BrandIcon from '../components/BrandIcon'

function Admin() {
  const [platforms, setPlatforms] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const { data } = await API.get('/jobs/', { params: { category: 'all' } })
        if (alive) setPlatforms(data.platforms || [])
      } catch (error) {
        console.error('Platform load error:', error)
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
      <h1 className="text-4xl font-bold text-center mb-8">External Sources Admin</h1>

      <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow mb-8">
        <h2 className="text-2xl font-bold mb-4">Manual Posting Disabled</h2>
        <p className="text-gray-600 mb-3">
          This portal no longer creates or stores its own job posts. Users are now sent directly to external
          job platforms and official recruitment portals.
        </p>
        <p className="text-gray-500 text-sm">
          AI Match builds live search links from a resume or skill list, and the Jobs page acts as a launchpad
          to those external sources.
        </p>
      </div>

      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Connected Platforms</h2>
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {platforms.map((platform) => (
              <div key={platform.id} className="bg-white p-5 rounded-xl shadow border border-gray-200">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs font-bold text-blue-600 bg-slate-100 p-2 rounded-full flex items-center justify-center">
                    <BrandIcon url={platform.url} name={platform.site} className="w-5 h-5" />
                  </span>
                  <h3 className="text-lg font-bold">{platform.site}</h3>
                </div>
                <p className="text-sm text-gray-600 mb-3">{platform.description}</p>
                <a
                  href={platform.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline"
                >
                  Open platform
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Admin
