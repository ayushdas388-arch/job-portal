import { useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import API from '../api/axios'
import { toast } from 'react-toastify'

function GoogleCallback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const exchangeAttempted = useRef(false)

  useEffect(() => {
    const code = searchParams.get('code')
    if (!code) {
      toast.error('No authorization code received from Google.')
      navigate('/login')
      return
    }

    if (exchangeAttempted.current) return
    exchangeAttempted.current = true

    const exchangeCode = async () => {
      try {
        const redirectUri = `${window.location.origin}/google-callback`
        const { data } = await API.post('/auth/google-callback', {
          code,
          redirect_uri: redirectUri
        })

        localStorage.setItem('token', data.access_token)
        localStorage.setItem('name', data.name)
        localStorage.setItem('role', data.role)
        localStorage.setItem('profile_image', data.profile_image || '')
        toast.success(`Welcome ${data.name}!`)
        navigate('/')
      } catch (error) {
        console.error('Google OAuth exchange error:', error)
        toast.error(error.response?.data?.detail || 'Google authentication failed.')
        navigate('/login')
      }
    }

    exchangeCode()
  }, [searchParams, navigate])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0f172a] text-white">
      <div className="space-y-4 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
        <h2 className="text-xl font-bold tracking-tight">Authenticating with Google...</h2>
        <p className="text-slate-400 text-sm">Please wait while we secure your connection.</p>
      </div>
    </div>
  )
}

export default GoogleCallback
