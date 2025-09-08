// src/pages/Calendar.jsx
import React, { useState, useEffect } from 'react';
import { motion } from "motion/react";
import { useNavigate, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import Navbar from "../components/Navbar";

const Calendar = () => {
  console.log('✅ Calendar component is rendering');
  const navigate = useNavigate();
  const { showToast, ToastContainer } = useToast();
  
  // State declarations
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedStudentName, setSelectedStudentName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [attendanceData, setAttendanceData] = useState({});
  const [loading, setLoading] = useState(true);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAttendanceDialogOpen, setIsAttendanceDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDateAttendance, setSelectedDateAttendance] = useState({
    status: '',
    notes: ''
  });
  const [isSavingAttendance, setIsSavingAttendance] = useState(false);

  // Constants
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);

  // Helper functions
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  const formatDate = (year, month, day) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  // API Functions
  const fetchStudents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        throw new Error('No authentication token found. Please login again.');
      }
      
      const response = await fetch('https://fifac-backend.vercel.app/api/students', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          throw new Error('Session expired. Please login again.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setStudents(data.data);
        setFilteredStudents(data.data);
        if (data.data.length > 0 && !selectedStudent) {
          // Auto-select the first student
          const firstStudent = data.data[0];
          setSelectedStudent(firstStudent.id);
          setSelectedStudentName(firstStudent.name);
          setSearchQuery(firstStudent.name);
        }
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

  const fetchAttendanceData = async () => {
    if (!selectedStudent) return;
    
    try {
      setAttendanceLoading(true);
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        throw new Error('No authentication token found. Please login again.');
      }

      const url = `https://fifac-backend.vercel.app/api/attendance/student/${selectedStudent}?year=${selectedYear}&month=${selectedMonth + 1}`;
      console.log('📡 Fetching attendance data from:', url);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Response error text:', errorText);
        
        if (response.status === 401) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          throw new Error('Session expired. Please login again.');
        }
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        const attendanceMap = {};
        if (data.data && Array.isArray(data.data)) {
          data.data.forEach(record => {
            const date = new Date(record.date).toISOString().split('T')[0];
            attendanceMap[date] = {
              status: record.status,
              notes: record.notes || ''
            };
          });
        }
        setAttendanceData(attendanceMap);
        
        if (Object.keys(attendanceMap).length === 0) {
          showToast('No attendance records found for this month', 'info');
        }
      } else {
        throw new Error(data.error || 'Failed to fetch attendance data');
      }
    } catch (err) {
      console.error('❌ Error fetching attendance data:', err);
      showToast(`Failed to fetch attendance data: ${err.message}`, 'error');
    } finally {
      setAttendanceLoading(false);
    }
  };

  // Search functionality with Command component integration
  const handleSearchChange = (value) => {
    setSearchQuery(value);
    
    if (value.length > 0) {
      const filtered = students.filter(student => 
        student.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredStudents(filtered);
    } else {
      setFilteredStudents(students);
    }
  };

  const handleStudentSelect = (student) => {
    setSelectedStudent(student.id);
    setSelectedStudentName(student.name);
    setSearchQuery(student.name);
    setShowDropdown(false);
  };

  // Handle date click to open attendance dialog
  const handleDateClick = (year, month, day) => {
    if (!selectedStudent) {
      showToast('Please select a student first', 'error');
      return;
    }

    const dateStr = formatDate(year, month, day);
    const existingAttendance = attendanceData[dateStr];
    
    setSelectedDate({ year, month, day, dateStr });
    setSelectedDateAttendance({
      status: existingAttendance?.status || '',
      notes: existingAttendance?.notes || ''
    });
    setIsAttendanceDialogOpen(true);
  };

  // Save attendance data
  const saveAttendance = async () => {
    if (!selectedDate || !selectedStudent) return;

    try {
      setIsSavingAttendance(true);
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        throw new Error('No authentication token found. Please login again.');
      }

      const response = await fetch('https://fifac-backend.vercel.app/api/attendance', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          studentId: selectedStudent,
          date: selectedDate.dateStr,
          status: selectedDateAttendance.status,
          notes: selectedDateAttendance.notes
        })
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          throw new Error('Session expired. Please login again.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        // Update local attendance data
        setAttendanceData(prev => ({
          ...prev,
          [selectedDate.dateStr]: {
            status: selectedDateAttendance.status,
            notes: selectedDateAttendance.notes
          }
        }));
        
        setIsAttendanceDialogOpen(false);
        showToast('Updated successfully', 'success');
      } else {
        throw new Error(data.error || 'Failed to save attendance');
      }
    } catch (err) {
      console.error('Error saving attendance:', err);
      showToast(`Failed to save attendance: ${err.message}`, 'error');
    } finally {
      setIsSavingAttendance(false);
    }
  };

  // Effects
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.log('❌ No token found, redirecting to login');
      showToast('Please login to access this page', 'error');
      navigate('/');
      return;
    }
    
    console.log('✅ Token found, fetching students');
    fetchStudents();
  }, [navigate]);

  useEffect(() => {
    if (selectedStudent) {
      fetchAttendanceData();
    }
  }, [selectedStudent, selectedYear, selectedMonth]);

  // Calendar rendering
  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
    const firstDay = getFirstDayOfMonth(selectedYear, selectedMonth);
    const today = new Date();
    const isCurrentMonth = today.getFullYear() === selectedYear && today.getMonth() === selectedMonth;
    
    const calendarDays = [];
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      calendarDays.push(
        <div key={`empty-${i}`} className="h-12 border border-white/5"></div>
      );
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = formatDate(selectedYear, selectedMonth, day);
      const attendanceRecord = attendanceData[dateStr];
      const attendanceStatus = attendanceRecord?.status;
      const isToday = isCurrentMonth && today.getDate() === day;
      
      let dayClass = "h-12 border border-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors relative cursor-pointer";
      
      if (isToday) {
        dayClass += " ring-2 ring-blue-400";
      }
      
      if (attendanceStatus === 'present') {
        dayClass += " bg-green-500/20 text-green-300";
      } else if (attendanceStatus === 'absent') {
        dayClass += " bg-red-500/20 text-red-300";
      } else if (attendanceStatus === 'leave') {
        dayClass += " bg-yellow-500/20 text-yellow-300";
      }
      
      calendarDays.push(
        <div 
          key={day} 
          className={dayClass}
          onClick={() => handleDateClick(selectedYear, selectedMonth, day)}
        >
          <span className="text-sm font-medium">{day}</span>
        </div>
      );
    }
    
    return calendarDays;
  };

  // Error state
  if (error) {
    console.log('❌ Error state:', error);
    return (
      <div className="min-h-screen bg-black">
        <Navbar />
        <div className="px-4 py-10 md:py-20 w-full max-w-6xl mx-auto relative z-10">
          <Card className="w-full shadow-xl border border-white/10 bg-black/40 backdrop-blur-md rounded-xl">
            <CardContent className="pt-6">
              <div className="text-red-400 text-center">
                <h3 className="text-lg font-semibold">Error Loading Data</h3>
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start h-[calc(100vh-8rem)] md:h-[calc(100vh-10rem)] overflow-hidden min-h-0">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2 h-full min-h-0 space-y-6"
          >
          {/* Header Section */}
          <Card className="w-full shadow-xl border border-white/10 bg-black/40 backdrop-blur-md rounded-xl relative overflow-visible z-20">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-purple-500/15 via-transparent to-blue-500/15 pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.1)_1px,transparent_0)] bg-[length:3px_3px] opacity-30 pointer-events-none" />
            
            <CardContent className="relative z-10">
                
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 ">
                {/* Title Section */}
                <div className="flex items-end">
                  <h2 className="text-3xl font-bold text-white">CALENDAR</h2>
                </div>
                
                {/* Controls Section */}
                <div className="flex flex-col sm:flex-row sm:items-end gap-2">
                {/* Student Search with shadcn Popover + Command */}
                <div className="min-w-[200px] relative z-50">
                  <label className="text-sm text-gray-400 mb-1 block">Student</label>
                  <Popover open={showDropdown} onOpenChange={setShowDropdown}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={showDropdown}
                        className="w-full justify-between bg-white/10 border-white/20 text-white hover:bg-white/20 h-9"
                        disabled={loading}
                      >
                        {selectedStudentName || "Search student..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0 bg-white/10 backdrop-blur-2xl border-white/20">
                      <Command className="bg-transparent">
                        <CommandInput 
                          placeholder="Search student..." 
                          value={searchQuery}
                          onValueChange={handleSearchChange}
                          className="text-white placeholder:text-gray-400"
                        />
                        <CommandEmpty className="text-gray-400 py-6 text-center text-sm">
                          No student found.
                        </CommandEmpty>
                        <CommandGroup>
                          <CommandList className="scrollbar-hide">
                            {filteredStudents.map((student) => (
                              <CommandItem
                                key={student.id}
                                value={student.name}
                                onSelect={() => handleStudentSelect(student)}
                                className="text-white hover:bg-white/20 focus:bg-white/20 cursor-pointer"
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    selectedStudent === student.id ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                <div className="flex flex-col">
                                  <div className="font-medium">{student.name}</div>
                                  <div className="text-xs text-gray-400">{student.phone}</div>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandList>
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Year Selection */}
                <div className="min-w-[80px]">
                  <label className="text-sm text-gray-400 mb-1 block">Year</label>
                  <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white/10 backdrop-blur-xl border-white/20">
                      {years.map((year) => (
                        <SelectItem key={year} value={year.toString()} className="text-white">
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Month Selection */}
                <div className="min-w-[80px]">
                  <label className="text-sm text-gray-400 mb-1 block">Month</label>
                  <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white/10 backdrop-blur-xl border-white/20">
                      {months.map((month, index) => (
                        <SelectItem key={index} value={index.toString()} className="text-white">
                          {month}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Reload Button */}
                <div>
                  <Button
                    onClick={fetchStudents}
                    variant="outline"
                    size="sm"
                    className="border-white/20 bg-white/10 text-white hover:bg-white/20 h-9"
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
              </div>
            </CardContent>
          </Card>

          {/* Calendar Section */}
          <Card className="shadow-xl border border-white/10 bg-black/40 backdrop-blur-md rounded-xl relative overflow-hidden z-10">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/15 via-transparent to-blue-500/15 pointer-events-none" />
            
            <CardHeader className="relative z-10">
              <CardTitle className="text-xl font-bold text-white">
                {selectedStudentName ? `${selectedStudentName} - ${months[selectedMonth]} ${selectedYear}` : `${months[selectedMonth]} ${selectedYear}`}
              </CardTitle>
              {attendanceLoading && (
                <CardDescription className="text-blue-400">
                  Loading attendance data...
                </CardDescription>
              )}
              {!selectedStudent && (
                <CardDescription className="text-gray-400">
                  Select a student to view attendance
                </CardDescription>
              )}
            </CardHeader>
            
            <CardContent className="relative z-10">
              {loading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full bg-white/10" />
                  ))}
                </div>
              ) : !selectedStudent ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto bg-white/10 rounded-full flex items-center justify-center mb-4">
                    <span className="text-2xl">📅</span>
                  </div>
                  <p className="text-lg font-medium text-gray-400">No student selected</p>
                  <p className="text-sm text-gray-500">Search and select a student to view their attendance.</p>
                </div>
              ) : (
                <>
                  {/* Day headers */}
                  <div className="grid grid-cols-7 mb-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                      <div key={day} className="h-8 flex items-center justify-center text-gray-400 text-sm font-medium">
                        {day}
                      </div>
                    ))}
                  </div>
                  
                  {/* Calendar grid */}
                  <div className="grid grid-cols-7 gap-0 border border-white/10 rounded-lg overflow-hidden">
                    {renderCalendar()}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Sidebar Cards */}
        <div className="flex flex-col gap-6 lg:sticky lg:top-28 h-full min-h-0">
          {[
            {title: 'Payments', emoji: '💵', path: '/payments'}, 
            {title: 'Students', emoji: '🎓', path: '/students'}, 
            {title: 'Leads', emoji: '📊', path: '/dashboard'}
          ].map((item, idx) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * (idx + 1), duration: 0.6 }}
            >
              <Link to={item.path} className="block">
                <Card className="shadow-xl border border-white/10 bg-black/40 backdrop-blur-md rounded-xl relative overflow-hidden flex-1 flex flex-col min-h-0 cursor-pointer hover:bg-white/5 transition-colors">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/15 via-transparent to-purple-500/15 pointer-events-none" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.1)_1px,transparent_0)] bg-[length:3px_3px] opacity-30 pointer-events-none" />
                  
                  <CardHeader className="relative z-10 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 bg-white/10 rounded-lg flex items-center justify-center">
                        <span className="text-lg">{item.emoji}</span>
                      </div>
                      <CardTitle className="text-lg font-semibold text-white">
                        {item.title}
                      </CardTitle>
                    </div>
                    <CardDescription className="text-gray-400 mt-1">
                      <span className="text-sm text-gray-400 hover:text-white transition-colors font-bold">
                        Click to view 
                      </span>
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="relative z-10 flex-1">
                    <div className="h-full flex items-center justify-center text-gray-400">
                      
                        <span className="text-sm">View contents</span>
                      
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>

      <ToastContainer />

      {/* Attendance Dialog */}
      {isAttendanceDialogOpen && selectedDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsAttendanceDialogOpen(false)}
          />
          
          <div className="relative w-full max-w-md bg-black/95 backdrop-blur-xl border border-white/20 text-white rounded-xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.1)_1px,transparent_0)] bg-[length:3px_3px] opacity-30" />
            
            <div className="relative z-10">
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-white to-gray-300 rounded-lg flex items-center justify-center">
                    <span className="text-black font-bold text-sm">📅</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      Mark Attendance
                    </h2>
                    <p className="text-gray-400">
                      {selectedDate.dateStr} - {selectedStudentName}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400 mb-3 block">Attendance Status</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { value: 'present', label: 'Present', color: 'bg-green-500/20 border-green-500/40 text-green-300' },
                        { value: 'absent', label: 'Absent', color: 'bg-red-500/20 border-red-500/40 text-red-300' },
                        { value: 'leave', label: 'Leave', color: 'bg-yellow-500/20 border-yellow-500/40 text-yellow-300' }
                      ].map((status) => (
                        <button
                          key={status.value}
                          onClick={() => setSelectedDateAttendance({...selectedDateAttendance, status: status.value})}
                          className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                            selectedDateAttendance.status === status.value 
                              ? status.color + ' ring-2 ring-white/30'
                              : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                          }`}
                        >
                          {status.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Notes (Optional)</label>
                    <textarea
                      value={selectedDateAttendance.notes}
                      onChange={(e) => setSelectedDateAttendance({...selectedDateAttendance, notes: e.target.value})}
                      className="w-full p-3 bg-white/10 border border-white/20 text-white placeholder:text-gray-400 rounded-lg resize-none focus:border-white/40 focus:ring-white/20"
                      placeholder="Add any notes about attendance..."
                      rows="3"
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-white/10 bg-gradient-to-r from-white/5 via-transparent to-white/5">
                <div className="flex items-center justify-end gap-3">
                  <Button
                    onClick={() => setIsAttendanceDialogOpen(false)}
                    variant="outline"
                    className="border-white/20 text-white bg-transparent hover:text-white hover:bg-white/10"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={saveAttendance}
                    disabled={isSavingAttendance || !selectedDateAttendance.status}
                    className="bg-white text-black hover:bg-gray-200"
                  >
                    {isSavingAttendance ? 'Saving...' : 'Save Attendance'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;