import Layout from './components/Layout';
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Jobs from './pages/Jobs'
import AIMatch from './pages/AIMatch'
import ResumeBuilder from './pages/ResumeBuilder'
import SkillGap from './pages/SkillGap'
import Dashboard from './pages/Dashboard'
import ApplicationTracker from './pages/ApplicationTracker'
import Notifications from './pages/Notifications'
import PreparationHub from './pages/PreparationHub'
import EligibilityChecker from './pages/EligibilityChecker'
import Admin from './pages/Admin'
import ProtectedRoute from './components/ProtectedRoute'
import GovtUpdates from './pages/GovtUpdates'
import AIInterview from './pages/AIInterview'
import CareerRoadmap from './pages/CareerRoadmap'
import ATSScore from './pages/ATSScore'
import TermsConditions from './pages/TermsConditions'
import ForgotPassword from './pages/ForgotPassword'
import GoogleCallback from './pages/GoogleCallback'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

function App() {
  return (
    <BrowserRouter>
      <ToastContainer position="top-center" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick pauseOnFocusLoss draggable pauseOnHover theme="colored" />
      {/* Purana Navbar hata kar naya Layout lagaya hai */}
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/google-callback" element={<GoogleCallback />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/ai-match" element={<AIMatch />} />
          <Route path="/resume-builder" element={<ResumeBuilder />} />
          <Route path="/skill-gap" element={<SkillGap />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/applications" element={<ApplicationTracker />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/prep" element={<PreparationHub />} />
          <Route path="/updates" element={<GovtUpdates />} />
          <Route path="/ai-interview" element={<AIInterview />} />
          <Route path="/roadmap" element={<CareerRoadmap />} />
          <Route path="/eligibility" element={<EligibilityChecker />} />
          <Route path="/ats" element={<ATSScore />} />
          <Route path="/terms" element={<TermsConditions />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={['company', 'admin']}>
                <Admin />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;