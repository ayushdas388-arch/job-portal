import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import API from '../api/axios'
import { toast } from 'react-toastify'

function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [step, setStep] = useState(1) // 1 = Request code, 2 = Verify and reset
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const navigate = useNavigate()

  const handleRequestCode = async () => {
    if (!email.trim()) {
      setError('Please enter your email address.')
      return
    }
    setLoading(true)
    setError('')
    setMessage('')
    try {
      const response = await API.post('/auth/forgot-password', { email })
      setMessage(response.data.message)
      setStep(2)
    } catch (err) {
      setError(err.response?.data?.detail || 'No user found or server error.')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async () => {
    if (!otp.trim() || otp.length !== 6) {
      setError('Please enter the 6-digit verification code.')
      return
    }
    if (!newPassword.trim() || newPassword.length < 8) {
      setError('Password must be at least 8 characters long.')
      return
    }
    setLoading(true)
    setError('')
    try {
      await API.post('/auth/reset-password', {
        email,
        otp,
        new_password: newPassword,
      })
      toast.success('Your password has been successfully updated. Please login.')
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to reset password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="wander-light-theme relative min-h-screen flex items-center justify-center p-4 overflow-hidden select-none">
      {/* Background HD Wallpaper */}
      <img 
        src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&auto=format&fit=crop&q=80" 
        alt="Login background" 
        className="absolute inset-0 w-full h-full object-cover"
      />
      {/* Soft Light Overlay */}
      <div className="absolute inset-0 bg-[#f8fafc]/75 backdrop-blur-[2px]" />

      {/* Form Container */}
      <div className="relative z-10 wander-bg-white border border-slate-200/80 p-8 rounded-3xl shadow-2xl w-full max-w-md space-y-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="text-center space-y-1">
          <div className="text-xl font-black tracking-widest wander-text-dark font-mono mb-2">
            CAREERPILOT
          </div>
          <h2 className="text-2xl font-black wander-text-dark tracking-tight">Account Recovery</h2>
          <p className="text-xs text-slate-500 font-medium">
            {step === 1 ? 'Enter your email to request a reset code' : 'Verify the code and set your new password'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-xs font-semibold p-3.5 rounded-xl text-center">
            {error}
          </div>
        )}

        {message && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold p-3.5 rounded-xl text-center">
            {message}
          </div>
        )}



        {step === 1 ? (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold wander-text-dark uppercase tracking-wider">Email Address</label>
              <input
                type="email"
                className="w-full bg-slate-100 hover:bg-slate-200/50 border border-slate-200 focus:bg-white text-slate-800 wander-search-input text-xs rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                placeholder="Enter registered email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <button
              onClick={handleRequestCode}
              disabled={loading}
              className="w-full bg-[#0f172a] hover:bg-blue-600 disabled:bg-slate-400 text-white text-xs font-bold py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg disabled:shadow-none flex items-center justify-center cursor-pointer border-0 uppercase tracking-wider"
            >
              {loading ? 'Requesting...' : 'Request Reset Code'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold wander-text-dark uppercase tracking-wider">Verification Code (6-digit)</label>
              <input
                type="text"
                maxLength={6}
                className="w-full bg-slate-100 hover:bg-slate-200/50 border border-slate-200 focus:bg-white text-slate-800 wander-search-input text-xs rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-mono font-bold tracking-widest text-center"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold wander-text-dark uppercase tracking-wider">New Password</label>
              <input
                type="password"
                className="w-full bg-slate-100 hover:bg-slate-200/50 border border-slate-200 focus:bg-white text-slate-800 wander-search-input text-xs rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                placeholder="Enter new password (min 8 chars)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            <button
              onClick={handleResetPassword}
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-400 text-white text-xs font-bold py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg disabled:shadow-none flex items-center justify-center cursor-pointer border-0 uppercase tracking-wider"
            >
              {loading ? 'Resetting Password...' : 'Reset Password'}
            </button>
          </div>
        )}

        <p className="text-center text-xs text-slate-500 font-semibold pt-2">
          Remembered your password?{' '}
          <Link to="/login" className="text-blue-600 hover:underline font-bold">Login</Link>
        </p>
      </div>
    </div>
  )
}

export default ForgotPassword
