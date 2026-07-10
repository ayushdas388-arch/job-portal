import { useState } from 'react'

function AIInterview() {
  const [started, setStarted] = useState(false)

  return (
    <div className="max-w-4xl mx-auto p-4 py-8">
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-2xl p-8 md:p-12 text-white shadow-xl text-center">
        <h1 className="text-4xl font-extrabold mb-4">AI Interview Practice</h1>
        <p className="text-blue-200 mb-8 max-w-2xl mx-auto text-lg">
          Practice HR and Technical interviews with our advanced AI voice bot. Get real-time feedback on your confidence, tone, and technical accuracy.
        </p>

        {!started ? (
          <div className="bg-white/10 p-6 rounded-xl border border-white/20 inline-block text-left">
            <h3 className="font-bold text-xl mb-4 text-center">Select Interview Type</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition">
                <input type="radio" name="type" defaultChecked className="w-4 h-4" />
                <span>HR Round (Behavioral & Culture Fit)</span>
              </label>
              <label className="flex items-center gap-3 p-3 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition">
                <input type="radio" name="type" className="w-4 h-4" />
                <span>Technical Round (React / Node / Frontend)</span>
              </label>
            </div>
            <button 
              onClick={() => setStarted(true)}
              className="mt-6 w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-lg"
            >
              Start Practice Session
            </button>
          </div>
        ) : (
          <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 shadow-2xl relative overflow-hidden">
            <div className="absolute top-4 right-4 flex gap-1">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
              <span className="text-xs text-red-400 font-bold">REC</span>
            </div>
            
            <div className="w-32 h-32 mx-auto bg-slate-700 rounded-full flex items-center justify-center mb-6 relative">
               <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
               <svg className="w-12 h-12 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path>
               </svg>
            </div>

            <h3 className="text-2xl font-bold text-blue-400 mb-2">Listening...</h3>
            <p className="text-slate-300 italic">"Tell me about a time you faced a difficult challenge at work..."</p>
            
            <div className="mt-8">
              <button 
                onClick={() => setStarted(false)}
                className="bg-red-500/20 text-red-400 hover:bg-red-500/30 px-6 py-2 rounded-full font-medium transition"
              >
                End Session
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AIInterview
