import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import API from '../api/axios'
import Recaptcha from '../components/Recaptcha'

function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('jobseeker')
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
        if (active) setCaptchaEnabled(false)
      })
    return () => {
      active = false
    }
  }, [])

  const handleRegister = async () => {
    if (captchaEnabled && !captchaToken) {
      setError('Please complete the captcha.')
      return
    }
    setLoading(true)
    setError('')
    try {
      await API.post('/auth/register', {
        name,
        email,
        password,
        role,
        captcha_token: captchaToken,
      })
      alert('Registration successful! Ab login karo.')
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed!')
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
        <h2 className="text-3xl font-bold text-center mb-6">Register</h2>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Name</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Apna naam likho"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

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

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Password</label>
          <input
            type="password"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Password likho"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 mb-2">Role</label>
          <select
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="jobseeker">Job Seeker</option>
            <option value="company">Company</option>
          </select>
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
          onClick={handleRegister}
          disabled={loading}
          className="w-full neon-btn"
        >
          {loading ? 'Registering...' : 'Register'}
        </button>

        <p className="text-center text-gray-600 mt-4">
          Already account hai?{' '}
          <Link to="/login" className="neon-outline px-3 py-1 rounded">Login karo</Link>
        </p>
      </div>
    </div>
  )
}

export default Register
