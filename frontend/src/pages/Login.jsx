import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import API from '../api/axios'
import Recaptcha from '../components/Recaptcha'
import { toast } from 'react-toastify'

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
      localStorage.setItem('profile_image', response.data.profile_image || '')
      toast.success(`Welcome back ${response.data.name}!`)
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
    <div className="wander-light-theme relative min-h-screen flex items-center justify-center p-4 overflow-hidden select-none">
      {/* Specific HD Career Wallpaper */}
      <img 
        src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&auto=format&fit=crop&q=80" 
        alt="Login background" 
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
          <h2 className="text-2xl font-black wander-text-dark tracking-tight">Welcome Back</h2>
          <p className="text-xs text-slate-500 font-medium">Please enter your credentials to login</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-xs font-semibold p-3.5 rounded-xl text-center">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold wander-text-dark uppercase tracking-wider">Email Address</label>
            <input
              type="email"
              className="w-full bg-slate-100 hover:bg-slate-200/50 border border-slate-200 focus:bg-white text-slate-800 wander-search-input text-xs rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold wander-text-dark uppercase tracking-wider">Password</label>
            <input
              type="password"
              className="w-full bg-slate-100 hover:bg-slate-200/50 border border-slate-200 focus:bg-white text-slate-800 wander-search-input text-xs rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="flex justify-end">
            <Link to="/forgot-password" className="text-[10px] text-blue-600 hover:underline font-bold">
              Forgot Password?
            </Link>
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

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-[#0f172a] hover:bg-blue-600 disabled:bg-slate-400 text-white text-xs font-bold py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg disabled:shadow-none flex items-center justify-center cursor-pointer"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>

        <p className="text-center text-xs text-slate-500 font-semibold pt-2">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-600 hover:underline font-bold">Register</Link>
        </p>
      </div>
    </div>
  )
}

export default Login
