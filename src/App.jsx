import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import MotionDemo from './components/MotionDemo'
import Dashboard from './pages/Dashboard'
import StudentsDashboard from './pages/StudentsDashboard'
import StudentDetails from './pages/StudentDetails'
import Attendance from './pages/Attendance'
import Calendar from './pages/Calendar'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/demo" element={<MotionDemo />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/students-dashboard" element={<StudentsDashboard />} />
            <Route path="/student/:id" element={<StudentDetails />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/calendar" element={<Calendar />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App