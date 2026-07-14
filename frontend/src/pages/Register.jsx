import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import API from '../api/axios'
import Recaptcha from '../components/Recaptcha'
import { toast } from 'react-toastify'

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

  const [showGoogleChooser, setShowGoogleChooser] = useState(false)
  const [customEmail, setCustomEmail] = useState('')
  const [customName, setCustomName] = useState('')

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

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

  useEffect(() => {
    if (!googleClientId) return

    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleGoogleResponse,
        })
        window.google.accounts.id.renderButton(
          document.getElementById('google-signup-btn'),
          { theme: 'outline', size: 'large', width: '380' }
        )
      }
    }
    document.body.appendChild(script)
    return () => {
      document.body.removeChild(script)
    }
  }, [googleClientId])

  const handleGoogleResponse = async (response) => {
    setLoading(true)
    setError('')
    try {
      const payload = JSON.parse(atob(response.credential.split('.')[1]))
      const res = await API.post('/auth/google', {
        email: payload.email,
        name: payload.name,
        profile_image: payload.picture,
        credential: response.credential,
      })
      localStorage.setItem('token', res.data.access_token)
      localStorage.setItem('name', res.data.name)
      localStorage.setItem('role', res.data.role)
      localStorage.setItem('profile_image', res.data.profile_image || '')
      toast.success(`Welcome ${res.data.name}!`)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.detail || 'Google Login failed!')
    } finally {
      setLoading(false)
    }
  }

  const handleDemoGoogleLogin = async (email, name, picture) => {
    setShowGoogleChooser(false)
    setLoading(true)
    setError('')
    try {
      const res = await API.post('/auth/google', {
        email,
        name,
        profile_image: picture,
      })
      localStorage.setItem('token', res.data.access_token)
      localStorage.setItem('name', res.data.name)
      localStorage.setItem('role', res.data.role)
      localStorage.setItem('profile_image', res.data.profile_image || '')
      toast.success(`Welcome ${res.data.name}!`)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.detail || 'Google Login failed!')
    } finally {
      setLoading(false)
    }
  }

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
      toast.success('Registration successful! Please login now.')
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
            CAREERPILOT
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

        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t wander-divider-line"></div>
          <span className="flex-shrink mx-4 wander-divider-text text-[10px] font-bold uppercase tracking-wider">or</span>
          <div className="flex-grow border-t wander-divider-line"></div>
        </div>

        {googleClientId ? (
          <div className="flex justify-center" id="google-signup-btn"></div>
        ) : (
          <button
            onClick={() => setShowGoogleChooser(true)}
            type="button"
            className="w-full wander-google-btn text-xs font-extrabold py-3.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" width="16" height="16">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            Continue with Google
          </button>
        )}

        <p className="text-center text-xs text-slate-500 font-semibold pt-2">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:underline font-bold">Login</Link>
        </p>
      </div>

      {showGoogleChooser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden text-slate-800 space-y-6 p-6">
            <div className="text-center space-y-2">
              <svg className="w-8 h-8 mx-auto" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <h3 className="text-md font-bold tracking-tight text-slate-800">Sign in with Google</h3>
              <p className="text-[11px] text-slate-500 font-semibold bg-blue-50/50 text-blue-700 py-1.5 px-3 rounded-lg inline-block">
                Demo Mode: Select or enter a profile
              </p>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => handleDemoGoogleLogin('ayushdas388@gmail.com', 'Ayush Das', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150')}
                type="button"
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-all text-left cursor-pointer"
              >
                <img 
                  className="w-9 h-9 rounded-full object-cover border border-slate-200" 
                  src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150" 
                  alt="Ayush"
                />
                <div className="leading-tight">
                  <div className="text-xs font-black text-slate-800">Ayush Das</div>
                  <div className="text-[10px] text-slate-500 font-medium">ayushdas388@gmail.com</div>
                </div>
              </button>

              <button
                onClick={() => handleDemoGoogleLogin('guest.pilot@gmail.com', 'Guest Pilot', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150')}
                type="button"
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-all text-left cursor-pointer"
              >
                <img 
                  className="w-9 h-9 rounded-full object-cover border border-slate-200" 
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150" 
                  alt="Guest"
                />
                <div className="leading-tight">
                  <div className="text-xs font-black text-slate-800">Guest Pilot</div>
                  <div className="text-[10px] text-slate-500 font-medium">guest.pilot@gmail.com</div>
                </div>
              </button>
            </div>

            <div className="border-t border-slate-100 pt-4 space-y-3">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Use custom email</div>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-slate-400 text-slate-800 font-semibold"
                />
                <input
                  type="email"
                  placeholder="Email address"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-slate-400 text-slate-800 font-semibold"
                />
              </div>
              <button
                onClick={() => {
                  if (customEmail.trim() && customName.trim()) {
                    handleDemoGoogleLogin(customEmail.trim(), customName.trim(), '')
                  }
                }}
                disabled={!customEmail.trim() || !customName.trim()}
                type="button"
                className="w-full bg-[#0f172a] hover:bg-blue-600 disabled:bg-slate-200 text-white text-xs font-extrabold py-2.5 rounded-lg transition-all cursor-pointer"
              >
                Sign in with Custom Profile
              </button>
            </div>

            <button
              onClick={() => setShowGoogleChooser(false)}
              type="button"
              className="w-full border border-slate-200 text-slate-600 text-xs font-bold py-2.5 rounded-lg hover:bg-slate-50 transition-all cursor-pointer text-center"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Register
