import { motion } from "motion/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/toast";

export default function Header() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { showToast, ToastContainer } = useToast();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('https://fifac-backend.vercel.app/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.success) {
        // Store token in localStorage
        localStorage.setItem('authToken', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        
        showToast('Login successful!', 'success');
        navigate('/dashboard'); // Redirect to dashboard
      } else {
        showToast(data.error || 'Login failed', 'error');
      }
    } catch (error) {
      console.error('Login error:', error);
      showToast('Network error. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-full min-h-screen flex flex-col items-center justify-center bg-black px-4 py-8">
      
      {/* Gradient overlays to match card aesthetic */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/15 via-transparent to-purple-500/15" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.5)_100%)]" />
      
      {/* Vercel-style background patterns */}
      
      {/* Texture overlay */}
      <div className="absolute inset-0 opacity-[0.15] bg-[url('data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjAwIDIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZmlsdGVyIGlkPSJub2lzZSI+PGZlVHVyYnVsZW5jZSB0eXBlPSJmcmFjdGFsTm9pc2UiIGJhc2VGcmVxdWVuY3k9IjAuNjUiIG51bU9jdGF2ZXM9IjMiIHN0aXRjaFRpbGVzPSJzdGl0Y2giLz48L2ZpbHRlcj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWx0ZXI9InVybCgjbm9pc2UpIiBvcGFjaXR5PSIwLjQiLz48L3N2Zz4=')]" />
      
      {/* Subtle grain texture */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.15)_1px,transparent_0)] bg-[length:4px_4px] opacity-20" />
      
      {/* Vercel-style border elements */}
      <div className="absolute inset-y-0 left-0 h-full w-px bg-gradient-to-b from-transparent via-white/20 to-transparent" />
      <div className="absolute inset-y-0 right-0 h-full w-px bg-gradient-to-b from-transparent via-white/20 to-transparent" />
      <div className="absolute inset-x-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-12 h-12 md:w-20 md:h-20 border-l border-t border-white/20" />
      <div className="absolute top-0 right-0 w-12 h-12 md:w-20 md:h-20 border-r border-t border-white/20" />
      <div className="absolute bottom-0 left-0 w-12 h-12 md:w-20 md:h-20 border-l border-b border-white/20" />
      <div className="absolute bottom-0 right-0 w-12 h-12 md:w-20 md:h-20 border-r border-b border-white/20" />

      <div className="w-full max-w-7xl mx-auto relative z-10 py-4 md:py-10 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 lg:gap-12 items-center">
          {/* Left Side - Hero Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6 md:space-y-8 order-2 lg:order-1 mt-8 lg:mt-0"
          >
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white/80 text-sm font-medium backdrop-blur-sm"
              >
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" />
                Studio Admin Panel
              </motion.div>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
              Transform Your{" "}
              <span className="bg-gradient-to-r from-white via-gray-300 to-white bg-clip-text text-transparent">
                Dance Studio
              </span>{" "}
              Management
            </h1>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="space-y-4"
            >
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0" />
                <span className="text-gray-300 text-sm md:text-base">Lead Generation & Tracking</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0" />
                <span className="text-gray-300 text-sm md:text-base">Student Enrollment System</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-purple-400 rounded-full flex-shrink-0" />
                <span className="text-gray-300 text-sm md:text-base">Attendance & Payment Management</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Side - Login Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex justify-center lg:justify-end order-1 lg:order-2"
          >
            <Card className="w-full max-w-md shadow-xl border border-white/10 bg-black/40 backdrop-blur-md rounded-xl relative overflow-hidden">
              {/* Gradient background overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/15 via-transparent to-purple-500/15" />
              {/* Card texture overlay */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.1)_1px,transparent_0)] bg-[length:3px_3px] opacity-30" />
              
              <CardHeader className="space-y-1 pb-4 md:pb-6 relative z-10">
                <CardTitle className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-white">Welcome Back</CardTitle>
                <CardDescription className="text-center text-gray-500 mt-2 md:mt-4 text-xs sm:text-sm">
                  Test account: admin<br />
                  Test password: admin123
                </CardDescription>
              </CardHeader>
              
              <CardContent className="relative z-10">
                <form onSubmit={handleLogin} className="space-y-4 md:space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-white">Username</Label>
                    <Input
                      id="username"
                      type="text"
                      placeholder="Enter your username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="h-10 md:h-12 bg-white/5 border-white/20 text-white placeholder:text-gray-500 focus:border-white/40 focus:ring-white/20 backdrop-blur-sm"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-white">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-10 md:h-12 bg-white/5 border-white/20 text-white placeholder:text-gray-500 focus:border-white/40 focus:ring-white/20 backdrop-blur-sm"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full h-10 md:h-12 text-base md:text-lg bg-white/80 text-black hover:bg-gray-200 rounded-lg font-medium relative overflow-hidden"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Signing In...' : 'Sign In'}
                  </Button>
                </form>
                
                <div className="mt-4 md:mt-6 text-center">
                  <p className="text-xs md:text-sm text-gray-400">
                    Enter your credentials to access your studio dashboard
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Floating elements for Vercel aesthetic */}
      <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white/20 rounded-full animate-pulse" />
      <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-white/30 rounded-full animate-pulse delay-1000" />
      <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-white/15 rounded-full animate-pulse delay-500" />
    </div>
  );
}