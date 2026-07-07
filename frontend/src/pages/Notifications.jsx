import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import API from '../api/axios'

function Notifications() {
  const token = localStorage.getItem('token')

  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [connect, setConnect] = useState(null) // {code, deep_link, bot_username}
  const [busy, setBusy] = useState('')
  const [msg, setMsg] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await API.get('/notifications/status')
      setStatus(data)
    } catch (error) {
      console.error('Notifications status error:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (token) load()
  }, [token, load])

  const startConnect = async () => {
    setBusy('connect')
    setMsg('')
    try {
      const { data } = await API.post('/notifications/telegram/connect')
      setConnect(data)
    } catch (error) {
      setMsg(error?.response?.data?.detail || 'Connect nahi ho paya.')
    } finally {
      setBusy('')
    }
  }

  const verify = async () => {
    setBusy('verify')
    setMsg('')
    try {
      const { data } = await API.post('/notifications/telegram/verify')
      setStatus(data)
      setConnect(null)
      setMsg('✅ Telegram connect ho gaya!')
    } catch (error) {
      setMsg(error?.response?.data?.detail || 'Verify nahi hua.')
    } finally {
      setBusy('')
    }
  }

  const disconnect = async () => {
    setBusy('disconnect')
    setMsg('')
    try {
      const { data } = await API.post('/notifications/telegram/disconnect')
      setStatus(data)
      setMsg('Telegram disconnect ho gaya.')
    } catch (error) {
      setMsg(error?.response?.data?.detail || 'Disconnect nahi hua.')
    } finally {
      setBusy('')
    }
  }

  const sendTest = async () => {
    setBusy('test')
    setMsg('')
    try {
      await API.post('/notifications/test')
      setMsg('📨 Test message bhej diya — Telegram check karo!')
    } catch (error) {
      setMsg(error?.response?.data?.detail || 'Test message fail hua.')
    } finally {
      setBusy('')
    }
  }

  const togglePref = async (key) => {
    const next = !status.prefs[key]
    setStatus((s) => ({ ...s, prefs: { ...s.prefs, [key]: next } }))
    try {
      const { data } = await API.patch('/notifications/preferences', { [key]: next })
      setStatus(data)
    } catch (error) {
      console.error('Pref update error:', error)
      load()
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6 text-center">
        <h1 className="text-3xl font-bold text-blue-600 mb-3">🔔 Notifications</h1>
        <p className="text-gray-500 mb-6">Telegram alerts set karne ke liye login karein.</p>
        <Link to="/login" className="neon-btn">Login karo</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6">
      <h1 className="text-4xl font-bold text-center text-blue-600 mb-2">🔔 Notifications</h1>
      <p className="text-center text-gray-500 mb-8">Telegram pe naye jobs aur application updates ki alert pao</p>

      <div className="max-w-2xl mx-auto space-y-6">
        {msg && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 text-sm rounded-lg px-4 py-3">
            {msg}
          </div>
        )}

        {loading && <p className="text-center text-gray-400">Loading...</p>}

        {!loading && status && !status.configured && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm rounded-lg px-4 py-3">
            ⚠️ Telegram bot abhi server pe setup nahi hai. Admin ko <code>TELEGRAM_BOT_TOKEN</code> aur{' '}
            <code>TELEGRAM_BOT_USERNAME</code> <code>.env</code> me daalna hoga.
          </div>
        )}

        {!loading && status && status.configured && (
          <>
            {/* Connection card */}
            <div className="bg-white p-6 rounded-xl shadow">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Telegram</h2>
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full ${
                    status.connected
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {status.connected ? `Connected${status.telegram_name ? ` · ${status.telegram_name}` : ''}` : 'Not connected'}
                </span>
              </div>

              {status.connected ? (
                <div className="flex flex-wrap gap-3">
                  <button onClick={sendTest} disabled={busy === 'test'} className="neon-btn">
                    {busy === 'test' ? 'Bhej rahe...' : 'Send test message'}
                  </button>
                  <button
                    onClick={disconnect}
                    disabled={busy === 'disconnect'}
                    className="text-red-500 text-sm hover:underline"
                  >
                    Disconnect
                  </button>
                </div>
              ) : !connect ? (
                <button onClick={startConnect} disabled={busy === 'connect'} className="neon-btn">
                  {busy === 'connect' ? 'Ruko...' : 'Connect Telegram'}
                </button>
              ) : (
                <div className="border border-gray-200 rounded-lg p-4 space-y-3">
                  <p className="text-sm text-gray-600 font-semibold">3 step me connect karo:</p>
                  <ol className="text-sm text-gray-600 list-decimal list-inside space-y-1">
                    <li>
                      Bot kholo:{' '}
                      {connect.deep_link ? (
                        <a
                          href={connect.deep_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 font-semibold hover:underline"
                        >
                          @{connect.bot_username}
                        </a>
                      ) : (
                        <span className="font-semibold">@{connect.bot_username}</span>
                      )}
                    </li>
                    <li>Telegram me <b>Start</b> dabao (ya ye code bhejo)</li>
                    <li>Wapas aake niche <b>Verify</b> dabao</li>
                  </ol>
                  <div className="bg-gray-900 text-white text-center text-2xl font-mono tracking-widest rounded-lg py-3">
                    {connect.code}
                  </div>
                  <div className="flex gap-3">
                    <button onClick={verify} disabled={busy === 'verify'} className="neon-btn flex-1">
                      {busy === 'verify' ? 'Check kar rahe...' : "I've pressed Start — Verify"}
                    </button>
                    <button onClick={() => setConnect(null)} className="text-gray-500 text-sm hover:underline">
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Preferences card */}
            <div className="bg-white p-6 rounded-xl shadow">
              <h2 className="text-xl font-bold mb-4">Kis cheez ki alert chahiye?</h2>
              <PrefToggle
                label="Naye jobs post hone par"
                desc="Jab bhi koi naya job add ho, turant pata chale"
                on={status.prefs.new_jobs}
                onClick={() => togglePref('new_jobs')}
              />
              <PrefToggle
                label="Application status change par"
                desc="Tumhari tracker wali application ka status badle to alert"
                on={status.prefs.application_updates}
                onClick={() => togglePref('application_updates')}
              />
              {!status.connected && (
                <p className="text-xs text-gray-400 mt-3">
                  Alerts tab hi aayenge jab Telegram connect hoga.
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function PrefToggle({ label, desc, on, onClick }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <div className="pr-4">
        <p className="font-medium text-gray-800">{label}</p>
        <p className="text-xs text-gray-400">{desc}</p>
      </div>
      <button
        onClick={onClick}
        className={`w-12 h-6 rounded-full flex items-center px-0.5 transition shrink-0 ${
          on ? 'bg-blue-600 justify-end' : 'bg-gray-300 justify-start'
        }`}
        aria-pressed={on}
      >
        <span className="w-5 h-5 bg-white rounded-full shadow" />
      </button>
    </div>
  )
}

export default Notifications
