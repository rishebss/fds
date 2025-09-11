// src/pages/Attendance.jsx
import React, { useState, useEffect } from 'react';
import { motion } from "motion/react";
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import Navbar from "../components/Navbar";

const Attendance = () => {
  const navigate = useNavigate();
  const { showToast, ToastContainer } = useToast();
  
  // State declarations
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Get current date in Indian Standard Time (IST)
  const getCurrentDateInIST = () => {
    const now = new Date();
    // IST is UTC+5:30
    const istOffset = 5.5 * 60 * 60 * 1000; // 5.5 hours in milliseconds
    const istTime = new Date(now.getTime() + istOffset);
    return istTime.toISOString().split('T')[0];
  };
  
  const [selectedDate, setSelectedDate] = useState(getCurrentDateInIST());
  const [attendanceData, setAttendanceData] = useState({});
  const [isMarkingAttendance, setIsMarkingAttendance] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");


  // API Functions
  const fetchStudents = async () => {
    try {
      setLoading(true);
      
      // Get the auth token from localStorage
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        throw new Error('No authentication token found. Please login again.');
      }
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/students`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          // Token is invalid or expired
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          throw new Error('Session expired. Please login again.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setStudents(data.data);
        // Initialize attendance data for all students
        const initialAttendance = {};
        data.data.forEach(student => {
          initialAttendance[student.id] = {
            status: 'present',
            notes: ''
          };
        });
        setAttendanceData(initialAttendance);
      } else {
        throw new Error(data.error || 'Failed to fetch students');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching students:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAttendance = async () => {
    try {
      setIsMarkingAttendance(true);
      
      if (!selectedDate) {
        showToast('Please select a date', 'error');
        return;
      }

      // Get the auth token from localStorage
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        showToast('No authentication token found. Please login again.', 'error');
        return;
      }

      // Get all attendance records to mark
      const attendanceRecords = Object.entries(attendanceData).map(([studentId, data]) => ({
        studentId,
        date: selectedDate + 'T00:00:00.000Z', // Ensure proper ISO format
        status: data.status,
        notes: data.notes
      }));

      // Mark attendance for each student one by one to better handle errors
      let successCount = 0;
      let errorCount = 0;
      const errors = [];

      for (const record of attendanceRecords) {
        try {
          const response = await fetch(`${import.meta.env.VITE_API_URL}/api/attendance`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(record),
          });
          
          if (!response.ok) {
            if (response.status === 401) {
              localStorage.removeItem('authToken');
              localStorage.removeItem('user');
              showToast('Session expired. Please login again.', 'error');
              return;
            }
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
          }

          const result = await response.json();
          
          if (result.success) {
            successCount++;
          } else {
            errorCount++;
            errors.push(`Student ${record.studentId}: ${result.error}`);
          }
        } catch (err) {
          errorCount++;
          errors.push(`Student ${record.studentId}: ${err.message}`);
        }
      }

      if (errorCount === 0) {
        showToast(`Attendance marked`, 'success');
        // Reset notes after successful marking
        const resetAttendance = {};
        students.forEach(student => {
          resetAttendance[student.id] = {
            status: 'present',
            notes: ''
          };
        });
        setAttendanceData(resetAttendance);
      } else if (successCount > 0) {
        showToast(`Attendance marked for ${successCount} students. ${errorCount} failed.`, 'warning');
        console.error('Attendance errors:', errors);
      } else {
        throw new Error(`Failed to mark attendance for any students. Errors: ${errors.join(', ')}`);
      }
          } catch (err) {
        console.error('Error marking attendance:', err);
        showToast(`Failed to mark attendance: ${err.message}`, 'error');
      } finally {
      setIsMarkingAttendance(false);
    }
  };

  const handleAttendanceChange = (studentId, field, value) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value
      }
    }));
  };





  // Effects
  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('authToken');
    if (!token) {
      showToast('Please login to access this page', 'error');
      navigate('/');
      return;
    }
    
    fetchStudents();
  }, [navigate]);

  // Data filtering
  const query = searchQuery.trim().toLowerCase();
  const filteredStudents = students.filter((student) => {
    const name = (student.name || "").toLowerCase();
    const email = (student.email || "").toLowerCase();
    const phone = (student.phone || "").toString().toLowerCase();
    
    return name.includes(query) || email.includes(query) || phone.includes(query);
  });

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-black">
        <Navbar />
        <div className="px-4 py-10 md:py-20 w-full max-w-6xl mx-auto relative z-10">
          <Card className="w-full shadow-xl border border-white/10 bg-black/40 backdrop-blur-md rounded-xl">
            <CardContent className="pt-6">
              <div className="text-red-400 text-center">
                <h3 className="text-lg font-semibold">Error Loading Students</h3>
                <p className="text-gray-400 mt-2">{error}</p>
                <Button onClick={fetchStudents} className="mt-4 bg-white text-black hover:bg-gray-200">
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      <div className="sticky top-0 z-50">
        <Navbar />
      </div>
      
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/15 via-transparent to-purple-500/15 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.15)_1px,transparent_0)] bg-[length:4px_4px] opacity-20 pointer-events-none" />

      <div className="px-4 pt-24 pb-6 md:pt-28 md:pb-8 w-full max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          {/* Header Section */}
          <Card className="w-full shadow-xl border border-white/10 bg-black/40 backdrop-blur-md rounded-xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/15 via-transparent to-blue-500/15 pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.1)_1px,transparent_0)] bg-[length:3px_3px] opacity-30 pointer-events-none" />
            
            <CardHeader className="relative z-10">
              <div className="flex items-center justify-between gap-3 mb-2">
                <div className="flex items-center gap-3">
                  
                  <CardTitle className="text-2xl font-bold text-white">
                    Mark Attendance
                  </CardTitle>
                </div>
                
                                 <div className="flex items-center gap-3">
                   <Button
                     onClick={fetchStudents}
                     variant="outline"
                     size="sm"
                     className="border-white/20 bg-white/10 text-white hover:bg-white/20"
                   >
                     <svg
                       xmlns="http://www.w3.org/2000/svg"
                       viewBox="0 0 24 24"
                       fill="none"
                       stroke="currentColor"
                       strokeWidth="2"
                       strokeLinecap="round"
                       strokeLinejoin="round"
                       className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
                     >
                       <path d="M21 12a9 9 0 1 1-3.16-6.84"/>
                       <path d="M21 3v6h-6"/>
                     </svg>
                   </Button>
                 </div>
              </div>
              
              <CardDescription className="text-gray-400">
                Mark attendance for all students on {selectedDate} (IST)
              </CardDescription>
            </CardHeader>
            
            <CardContent className="relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Date Selection */}
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Date (IST)</label>
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="bg-white/10 border-white/20 text-white"
                    max={getCurrentDateInIST()}
                  />
                </div>

                {/* Search Students */}
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Search Students</label>
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name, email, or phone..."
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>

                {/* Mark Attendance Button */}
                <div className="flex items-end">
                  <Button
                    onClick={markAttendance}
                    disabled={isMarkingAttendance || !selectedDate || filteredStudents.length === 0}
                    className="w-full bg-white text-black hover:bg-white"
                  >
                    {isMarkingAttendance ? 'Marking...' : `Mark Attendance (${filteredStudents.length})`}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>



          {/* Students List */}
          <Card className="w-full shadow-xl border border-white/10 bg-black/40 backdrop-blur-md rounded-xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/15 via-transparent to-purple-500/15 pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.1)_1px,transparent_0)] bg-[length:3px_3px] opacity-30 pointer-events-none" />
            
            <CardHeader className="relative z-10">
              <CardTitle className="text-xl font-bold text-white">
                Students ({filteredStudents.length})
              </CardTitle>
              <CardDescription className="text-gray-400">
                Mark attendance for each student
              </CardDescription>
            </CardHeader>
            
            <CardContent className="relative z-10">
              {loading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full bg-white/10" />
                  ))}
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto bg-white/10 rounded-full flex items-center justify-center mb-4">
                    <span className="text-2xl">📚</span>
                  </div>
                  <p className="text-lg font-medium text-gray-400">No students found</p>
                  <p className="text-sm text-gray-500">Try adjusting your search or filters.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto nice-scrollbar">
                  {filteredStudents.map((student, index) => (
                    <motion.div
                      key={student.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.3 }}
                      className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-colors"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                        {/* Student Info */}
                        <div className="md:col-span-2">
                          <h3 className="font-semibold text-white">{student.name}</h3>
                          <div className="text-sm text-gray-400 space-y-1">
                            <p>{student.phone}</p>
                            {student.email && <p>{student.email}</p>}
                            <div className="flex gap-2">
                              {student.level && (
                                <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">
                                  {student.level}
                                </span>
                              )}
                              {student.batch && (
                                <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded text-xs">
                                  {student.batch}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Status Selection */}
                        <div>
                          <label className="text-xs text-gray-400 mb-1 block">Status</label>
                          <Select
                            value={attendanceData[student.id]?.status || 'present'}
                            onValueChange={(value) => handleAttendanceChange(student.id, 'status', value)}
                          >
                            <SelectTrigger className="w-full bg-gradient-to-r from-white/10 to-white/5 border-white/20 text-white hover:border-white/30 focus:border-white/40 focus:ring-2 focus:ring-white/10 transition-all duration-200 backdrop-blur-sm shadow-lg">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent className="bg-white/10 backdrop-blur-xl border-white/20">
                              <SelectItem value="present" className="text-white">
                                <span className="flex items-center gap-2">
                                  
                                  Present
                                </span>
                              </SelectItem>
                              <SelectItem value="absent" className="text-white">
                                <span className="flex items-center gap-2">
                                  
                                  Absent
                                </span>
                              </SelectItem>
                              <SelectItem value="leave" className="text-white">
                                <span className="flex items-center gap-2">
                                  
                                  Leave
                                </span>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Notes */}
                        <div>
                          <label className="text-xs text-gray-400 mb-1 block">Notes</label>
                          <Input
                            value={attendanceData[student.id]?.notes || ''}
                            onChange={(e) => handleAttendanceChange(student.id, 'notes', e.target.value)}
                            placeholder="Optional notes"
                            className="bg-white/10 border-white/20 text-white text-sm"
                          />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <ToastContainer />
    </div>
  );
};

export default Attendance;
