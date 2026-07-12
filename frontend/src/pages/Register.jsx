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
  const [agreeTerms, setAgreeTerms] = useState(false)
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

    if (!agreeTerms) {
      setError('You must agree to the Terms & Conditions to register.')
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
    <div className="wander-light-theme relative min-h-screen flex items-center justify-center p-4 overflow-hidden select-none">
      {/* Specific HD Onboarding/Collaboration Wallpaper */}
      <img 
        src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1600&auto=format&fit=crop&q=80" 
        alt="Register background" 
        className="absolute inset-0 w-full h-full object-cover"
      />
      {/* Soft Light Overlay */}
      <div className="absolute inset-0 bg-[#f8fafc]/75 backdrop-blur-[2px]" />

      {/* Form Container */}
      <div className="relative z-10 wander-bg-white border border-slate-200/80 p-8 rounded-3xl shadow-2xl w-full max-w-md space-y-6">
        <div className="text-center space-y-1">
          <div className="text-xl font-black tracking-widest wander-text-dark font-mono mb-2">
            CAREERBUILDER
          </div>
          <h2 className="text-2xl font-black wander-text-dark tracking-tight">Create Account</h2>
          <p className="text-xs text-slate-500 font-medium">Get started with your career dashboard</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-xs font-semibold p-3.5 rounded-xl text-center">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {/* Name fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold wander-text-dark uppercase tracking-wider">First Name*</label>
              <input
                id="firstName"
                type="text"
                className="w-full bg-slate-100 hover:bg-slate-200/50 border border-slate-200 focus:bg-white text-slate-800 wander-search-input text-xs rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                placeholder="First name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, 'lastName')}
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold wander-text-dark uppercase tracking-wider">Last Name*</label>
              <input
                id="lastName"
                type="text"
                className="w-full bg-slate-100 hover:bg-slate-200/50 border border-slate-200 focus:bg-white text-slate-800 wander-search-input text-xs rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                placeholder="Last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, 'email')}
              />
            </div>
          </div>

          {/* Email field */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold wander-text-dark uppercase tracking-wider">Email Address*</label>
            <input
              id="email"
              type="email"
              className="w-full bg-slate-100 hover:bg-slate-200/50 border border-slate-200 focus:bg-white text-slate-800 wander-search-input text-xs rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, 'phone')}
            />
          </div>

          {/* Phone field */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold wander-text-dark uppercase tracking-wider">Phone Number*</label>
            <div className="flex">
              <select
                className="bg-slate-100 hover:bg-slate-200/50 border border-slate-200 text-slate-800 text-xs rounded-l-xl px-3 py-3 border-r-0 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-bold"
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
                className="w-full bg-slate-100 hover:bg-slate-200/50 border border-slate-200 focus:bg-white text-slate-800 wander-search-input text-xs rounded-r-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                placeholder="Enter 10-digit number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, 'password')}
              />
            </div>
          </div>

          {/* Password field */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold wander-text-dark uppercase tracking-wider">Password*</label>
            <input
              id="password"
              type="password"
              className="w-full bg-slate-100 hover:bg-slate-200/50 border border-slate-200 focus:bg-white text-slate-800 wander-search-input text-xs rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
              placeholder="Create strong password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, 'registerBtn')}
            />
          </div>
        </div>

        {captchaEnabled && siteKey && (
          <div className="flex justify-center">
            <Recaptcha
              ref={captchaRef}
              siteKey={siteKey}
              onChange={setCaptchaToken}
            />
          </div>
        )}

        {/* Terms & Conditions Checkbox */}
        <div className="flex items-center gap-2.5 select-none py-1">
          <input
            id="agreeTerms"
            type="checkbox"
            checked={agreeTerms}
            onChange={(e) => setAgreeTerms(e.target.checked)}
            className="w-4.5 h-4.5 rounded border-slate-200 accent-[#0f172a] focus:ring-0 cursor-pointer"
          />
          <label htmlFor="agreeTerms" className="text-xs text-slate-600 font-semibold cursor-pointer">
            I agree to the{' '}
            <Link to="/terms" target="_blank" className="text-blue-600 hover:underline font-bold">
              Terms & Conditions
            </Link>
          </label>
        </div>

        <button
          id="registerBtn"
          onClick={handleRegister}
          disabled={loading}
          className="w-full bg-[#0f172a] hover:bg-blue-600 disabled:bg-slate-400 text-white text-xs font-bold py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg disabled:shadow-none flex items-center justify-center cursor-pointer"
        >
          {loading ? 'Registering...' : 'Register'}
        </button>

        <p className="text-center text-xs text-slate-500 font-semibold pt-2">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:underline font-bold">Login</Link>
        </p>
      </div>
    </div>
  )
}

export default Register
