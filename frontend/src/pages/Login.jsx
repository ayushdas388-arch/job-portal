import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import API from '../api/axios'
import Recaptcha from '../components/Recaptcha'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [captchaEnabled, setCaptchaEnabled] = useState(false)
  const [siteKey, setSiteKey] = useState('')
  const [captchaToken, setCaptchaToken] = useState('')
  const captchaRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    let active = true
    API.get('/auth/config')
      .then((res) => {
        if (!active) return
        setCaptchaEnabled(res.data.captcha_enabled)
        setSiteKey(res.data.recaptcha_site_key || '')
      })
      .catch(() => {
        // config unreachable -> just skip captcha on the client
        if (active) setCaptchaEnabled(false)
      })
    return () => {
      active = false
    }
  }, [])

  const handleLogin = async () => {
    if (captchaEnabled && !captchaToken) {
      setError('Please complete the captcha.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const response = await API.post('/auth/login', {
        email,
        password,
        captcha_token: captchaToken,
      })
      localStorage.setItem('token', response.data.access_token)
      localStorage.setItem('name', response.data.name)
      localStorage.setItem('role', response.data.role)
      alert(`Welcome back ${response.data.name}!`)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed!')
      // token is single-use; clear it so the user solves a fresh challenge
      if (captchaEnabled) {
        setCaptchaToken('')
        captchaRef.current?.reset()
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl card-strong w-full max-w-md">
        <h2 className="text-3xl font-bold text-center mb-6">Login</h2>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Email</label>
          <input
            type="email"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Email likho"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 mb-2">Password</label>
          <input
            type="password"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Password likho"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {captchaEnabled && siteKey && (
          <div className="mb-6 flex justify-center">
            <Recaptcha
              ref={captchaRef}
              siteKey={siteKey}
              onChange={setCaptchaToken}
            />
          </div>
        )}

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full neon-btn"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>

        <p className="text-center text-gray-600 mt-4">
          Account nahi hai?{' '}
          <Link to="/register" className="neon-outline px-3 py-1 rounded">Register karo</Link>
        </p>
      </div>
    </div>
  )
}

export default Login
