import { Link } from 'react-router-dom'

export default function TermsConditions() {
  return (
    <div className="min-h-screen py-16 px-4 md:px-8 relative overflow-hidden flex flex-col justify-start">
      {/* Background HD Wallpaper */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1450133064473-71024230f91b?w=1600&auto=format&fit=crop&q=80" 
          alt="Professional document legal background" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-[#0f172a]/95 via-[#0f172a]/85 to-[#0f172a]/65" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto w-full">
        {/* Header Block */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-300 tracking-tight mb-3">
            Terms & Conditions
          </h1>
          <p className="text-sm md:text-base text-slate-300 max-w-xl mx-auto font-medium">
            Please read these terms and conditions carefully before using our career search and AI preparation tools.
          </p>
        </div>

        {/* Legal Text Panel */}
        <div className="wander-bg-white border border-slate-200/50 shadow-2xl p-8 md:p-10 rounded-3xl space-y-8 max-h-[70vh] overflow-y-auto leading-relaxed scrollbar-thin scrollbar-thumb-slate-300">
          <div>
            <h2 className="text-xl font-black wander-text-dark mb-3 border-b border-slate-100 pb-2">1. Agreement to Terms</h2>
            <p className="text-slate-600 text-sm font-semibold">
              By accessing and using CareerPilot, you agree to be bound by these Terms and Conditions and our Privacy Policy. If you do not agree to all of these terms, you are prohibited from using the platform.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-black wander-text-dark mb-3 border-b border-slate-100 pb-2">2. External Job Platforms (Aggregator Disclaimer)</h2>
            <p className="text-slate-600 text-sm font-semibold">
              CareerPilot is an aggregator platform. We index and generate direct redirection links to third-party recruitment sites (such as LinkedIn, Indeed, Naukri, Foundit, Internshala, and Wellfound) and government exam portals (such as UPSC, SSC, RRB, and IBPS). 
            </p>
            <p className="text-slate-600 text-sm font-semibold mt-2">
              Please note that CareerPilot does not host, manage, or publish independent job openings on its own database. We are not responsible for the content, privacy policies, validity, or hiring decisions of external websites. Redirections are performed at your own discretion.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-black wander-text-dark mb-3 border-b border-slate-100 pb-2">3. AI Insights and Preparation Services (Groq AI)</h2>
            <p className="text-slate-600 text-sm font-semibold">
              CareerPilot provides advanced educational tools—including the ATS Score Checker, AI Resume Builder, Skill Gap Analyzer, Week-by-Week Career Roadmaps, Practice Quizzes, and conversational Mock Interviews—powered by Groq AI's LLM services.
            </p>
            <p className="text-slate-600 text-sm font-semibold mt-2">
              All AI outputs, practice questions, interview responses, and roadmap advice are generated recommendations intended strictly for training and self-assessment purposes. CareerPilot does not warrant that AI suggestions will guarantee successful placement, recruitment, or passing score results in actual competitive examinations.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-black wander-text-dark mb-3 border-b border-slate-100 pb-2">4. User Account Registration</h2>
            <p className="text-slate-600 text-sm font-semibold">
              To save job portals, check eligibility, or track job applications, you must register a user account. You are responsible for keeping your login credentials confidential and secure. We encrypt your password information to protect your account integrity.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-black wander-text-dark mb-3 border-b border-slate-100 pb-2">5. Limitation of Liability</h2>
            <p className="text-slate-600 text-sm font-semibold">
              In no event shall CareerPilot, its creators, or partners be liable for any direct, indirect, incidental, or consequential damages (including loss of employment opportunities or test failures) arising out of the use of, or inability to use, our service.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-black wander-text-dark mb-3 border-b border-slate-100 pb-2">6. Changes to Terms</h2>
            <p className="text-slate-600 text-sm font-semibold">
              We reserve the right to review and update these terms at any time. Your continued use of the platform following the posting of modifications indicates your acknowledgment and acceptance of the revised conditions.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="text-center mt-10">
          <Link 
            to="/" 
            className="inline-block bg-white hover:bg-slate-100 text-[#0f172a] font-extrabold py-3 px-8 rounded-2xl transition-all shadow-lg hover:scale-105 duration-200 uppercase text-xs tracking-wider"
          >
            Accept & Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
