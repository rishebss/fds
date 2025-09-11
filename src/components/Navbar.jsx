
import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useToast } from '@/components/ui/toast'


function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [user, setUser] = useState(null)
  const navigate = useNavigate()
  const { showToast, ToastContainer } = useToast()

  // Get user info from localStorage on component mount
  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      try {
        setUser(JSON.parse(userData))
      } catch (error) {
        console.error('Error parsing user data:', error)
      }
    }
  }, [])

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  // Optimized logout with reduced API dependency
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      
      // Clear authentication data immediately for better UX
      localStorage.removeItem('authToken')
      localStorage.removeItem('user')
      
      // Optional server-side logout (don't block user experience)
      const token = localStorage.getItem('authToken')
      if (token) {
        // Fire and forget - don't wait for this
        fetch(`${import.meta.env.VITE_API_URL}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }).catch(error => {
          console.error('Server logout error (non-blocking):', error)
        })
      }
      
      // Show success message and redirect immediately
      showToast('Logged out successfully', 'success')
      navigate('/')
      
    } catch (error) {
      console.error('Logout error:', error)
      showToast('Logout failed. Please try again.', 'error')
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <nav className="absolute top-0 left-0 right-0 z-20 flex w-full items-center justify-between px-4 md:px-6 py-4 md:py-6 bg-black/20 backdrop-blur-xl border-b border-white/10">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-gradient-to-br from-white to-gray-300 rounded-lg flex items-center justify-center">
          <span className="text-black font-bold text-sm">S</span>
        </div>
        <h1 className="text-lg font-bold md:text-xl text-white tracking-wide">
          STUDIO
        </h1>
      </div>
      
      {/* Desktop Menu */}
      <div className="hidden md:flex items-center gap-6">
        <Link 
          to="/dashboard" 
          className="text-gray-300 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-white/5 font-medium"
        >
          Leads
        </Link>
        <Link 
          to="/students-dashboard" 
          className="text-gray-300 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-white/5 font-medium"
        >
          Students
        </Link>
        <Link 
          to="/attendance" 
          className="text-gray-300 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-white/5 font-medium"
        >
          Attendance
        </Link>
        <Link 
          to="/calendar" 
          className="text-gray-300 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-white/5 font-medium"
        >
          Calendar
        </Link>
        <Link 
          to="/payments" 
          className="text-gray-300 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-white/5 font-medium"
        >
          Payments
        </Link>
        
       
        
        <button 
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="px-6 py-2.5 bg-white text-black font-medium rounded-lg transition-all duration-300 hover:bg-gray-200 hover:scale-105 transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {isLoggingOut ? 'Logging Out...' : 'Log Out'}
        </button>
      </div>

      {/* Mobile Menu Button */}
      <button
        onClick={toggleMenu}
        className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-colors"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {isMenuOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </button>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-black/95 backdrop-blur-xl border-b border-white/10 md:hidden">
          <div className="flex flex-col p-4 space-y-2">
            <Link 
              to="/dashboard" 
              className="text-gray-300 hover:text-white transition-colors px-4 py-3 rounded-lg hover:bg-white/5 font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Leads
            </Link>
            <Link 
              to="/students-dashboard" 
              className="text-gray-300 hover:text-white transition-colors px-4 py-3 rounded-lg hover:bg-white/5 font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Students
            </Link>
            <Link 
              to="/attendance" 
              className="text-gray-300 hover:text-white transition-colors px-4 py-3 rounded-lg hover:bg-white/5 font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Attendance
            </Link>
            <Link 
              to="/calendar" 
              className="text-gray-300 hover:text-white transition-colors px-4 py-3 rounded-lg hover:bg-white/5 font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Calendar
            </Link>
            <Link 
              to="/payments" 
              className="text-gray-300 hover:text-white transition-colors px-4 py-3 rounded-lg hover:bg-white/5 font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Payments
            </Link>
            <button 
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="text-left px-4 py-3 bg-white text-black font-medium rounded-lg transition-all duration-300 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {isLoggingOut ? 'Logging Out...' : 'Log Out'}
            </button>
          </div>
        </div>
      )}

   
      
   
      <ToastContainer />
    </nav>
  )
}

export default Navbar