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

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/jobs" element={<Jobs/>} />
        <Route path="/login" element={<Login/>} />
        <Route path="/register" element={<Register/>} />
        <Route path="/ai-match" element={<AIMatch/>} />
        <Route path="/resume-builder" element={<ResumeBuilder/>} />
        <Route path="/skill-gap" element={<SkillGap/>} />
        <Route path="/dashboard" element={<Dashboard/>} />
        <Route path="/applications" element={<ApplicationTracker/>} />
        <Route path="/notifications" element={<Notifications/>} />
        <Route path="/prep" element={<PreparationHub/>} />
        <Route path="/eligibility" element={<EligibilityChecker/>} />
        <Route path="/admin" element={<Admin/>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App