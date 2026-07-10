import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import API from '../api/axios'
import Recaptcha from '../components/Recaptcha'

function Register() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [countryCode, setCountryCode] = useState('+91')
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

  const handleKeyDown = (e, nextFieldId) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      document.getElementById(nextFieldId)?.focus()
    }
  }

  const handleRegister = async () => {
    if (!firstName || !lastName || !email || !phone || !password) {
      setError('Please fill the required fields.')
      return
    }

    if (!/^\d{10}$/.test(phone)) {
      setError('Invalid phone number. Please enter a 10-digit number.')
      return
    }

    if (captchaEnabled && !captchaToken) {
      setError('Please complete the captcha.')
      return
    }
    setLoading(true)
    setError('')
    try {
      await API.post('/auth/register', {
        first_name: firstName,
        last_name: lastName,
        email,
        phone: `${countryCode}${phone}`,
        password,
        role: 'jobseeker',
        captcha_token: captchaToken,
      })
      alert('Registration successful! Please login now.')
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
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 mb-2">First Name*</label>
                <input
                  id="firstName"
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="First name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, 'lastName')}
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Last Name*</label>
                <input
                  id="lastName"
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, 'email')}
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Email ID*</label>
              <input
                id="email"
                type="email"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, 'phone')}
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Phone Number*</label>
              <div className="flex">
                <select
                  className="border border-gray-300 rounded-l-lg px-2 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 border-r-0"
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                >
                  <option value="+91">+91 (IN)</option>
                  <option value="+1">+1 (US)</option>
                  <option value="+44">+44 (UK)</option>
                  <option value="+61">+61 (AU)</option>
                </select>
                <input
                  id="phone"
                  type="text"
                  className="w-full border border-gray-300 rounded-r-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Enter 10-digit number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, 'password')}
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Password*</label>
              <input
                id="password"
                type="password"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, 'registerBtn')}
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
              id="registerBtn"
              onClick={handleRegister}
              disabled={loading}
              className="w-full neon-btn"
            >
              {loading ? 'Registering...' : 'Register'}
            </button>


        <p className="text-center text-gray-600 mt-4">
          Already have an account?{' '}
          <Link to="/login" className="neon-outline px-3 py-1 rounded">Login</Link>
        </p>
      </div>
    </div>
  )
}

export default Register
