// src/components/Students.jsx
import React, { useState, useEffect } from 'react';
import { IoMdAdd } from "react-icons/io";
import { motion } from "motion/react";
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import Navbar from "./Navbar";

const Students = () => {
  const navigate = useNavigate();
  // Toast functionality
  const { showToast, ToastContainer } = useToast();
  
  // State declarations
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen,setIsAddDialogOpen] = useState(false);
  const [newStudent, setNewStudent] = useState({
  name: '',
  phone: '',
  email: '',
  address: '',
  age: '',
  level: '',
  batch: ''
});
const [isCreating, setIsCreating] = useState(false);

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
        // Sort students by createdAt date (latest first)
        const sortedStudents = data.data.sort((a, b) => {
          const dateA = new Date(a.createdAt || 0);
          const dateB = new Date(b.createdAt || 0);
          return dateB - dateA; // Latest dates first
        });
        setStudents(sortedStudents);
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



  // Event Handlers
  const createNewStudent = async (studentData) => {
  try {
    setIsCreating(true);
    
    // Validate required fields
    if (!studentData.name.trim() || !studentData.phone.trim()) {
      showToast('Name and phone number are required', 'error');
      return;
    }

    // Get the auth token from localStorage
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      showToast('No authentication token found. Please login again.', 'error');
      return;
    }

    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/students`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(studentData),
    });

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        showToast('Session expired. Please login again.', 'error');
        return;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.success) {
      // Add the new student at the top of the list (since it's the latest)
      setStudents(prevStudents => [data.data, ...prevStudents]);
      setIsAddDialogOpen(false);
      setNewStudent({ name: '', phone: '', email: '', address: '', age: '', level: '', batch: '' });
      showToast('Added successfully!', 'success');
    } else {
      throw new Error(data.error || 'Failed to create student');
    }
  } catch (err) {
    console.error('Error creating student:', err);
    showToast('Failed to create student. Please try again.', 'error');
  } finally {
    setIsCreating(false);
  }
};



  const handleViewStudent = (student) => {
    navigate(`/student/${student.id}`);
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
  const filteredStudents = query
    ? students.filter((student) => {
        const name = (student.name || "").toLowerCase();
        const email = (student.email || "").toLowerCase();
        const level = (student.level || "").toLowerCase();
        const batch = (student.batch || "").toLowerCase();
        const phone = (student.phone || "").toString().toLowerCase();
        const status = (student.status || "").toLowerCase();
        return (
          name.includes(query) ||
          email.includes(query) ||
          level.includes(query) ||
          batch.includes(query) ||
          phone.includes(query) ||
          status.includes(query)
        );
      })
    : students;

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
    <div className="relative min-h-screen bg-black overflow-hidden ">
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
            className="lg:col-span-4 w-full h-full min-h-0"
          >
            <Card className="w-full h-full shadow-xl border border-white/10 bg-black/40 backdrop-blur-md rounded-xl relative overflow-hidden mt-0 flex flex-col min-h-0">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/15 via-transparent to-purple-500/15 pointer-events-none" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.1)_1px,transparent_0)] bg-[length:3px_3px] opacity-30 pointer-events-none" />
              
              <CardHeader className="relative z-10">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <CardTitle className="text-2xl font-bold text-white">
                    Students Management [{loading ? 'Loading…' : ` ${students.length}`}]
                  </CardTitle>
                  
                  <div className="hidden md:flex items-center gap-3">
                    <div className="relative">
                      <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search...."
                        aria-label="Search students"
                        className="h-9 w-72 bg-white/5 border-white/20 text-white placeholder:text-gray-500 focus:border-white/40 focus:ring-white/20"
                      />
                    </div>
                  
                    <Button
                    onClick={() => setIsAddDialogOpen(true)}
                    variant="outline"
                    size="sm"
                    className="h-9 p-2 bg-white/10 rounded-md border border-white/20 text-white hover:bg-white/10 transition-colors hover:text-white"
                  >
                    <IoMdAdd />
                  </Button>
                    <button
                      type="button"
                      onClick={fetchStudents}
                      aria-label="Refresh students"
                      className="p-2 bg-white/10 rounded-md border border-white/20 text-white hover:bg-white/10 transition-colors"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`}
                      >
                        <path d="M21 12a9 9 0 1 1-3.16-6.84"/>
                        <path d="M21 3v6h-6"/>
                      </svg>
                    </button>
                  </div>
                </div>
                
                <CardDescription className="text-gray-400">
                  Manage and view all your enrolled students (sorted by latest enrollment)
                </CardDescription>
              </CardHeader>
              
              <CardContent className="relative z-10 flex-1 overflow-hidden min-h-0">
                {loading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full bg-white/10" />
                    ))}
                  </div>
                ) : (
                  <div className="min-w-full h-full">
                    <div className="nice-scrollbar h-full overflow-y-auto">
                      <Table className="w-full table-auto">
                        <TableHeader>
                          <TableRow className="border-white/10">
                            <TableHead className="text-white font-medium sticky top-0 z-20 bg-black/60 backdrop-blur supports-[backdrop-filter]:bg-black/40">
                              Name
                            </TableHead>
                            <TableHead className="text-white font-medium sticky top-0 z-20 bg-black/60 backdrop-blur supports-[backdrop-filter]:bg-black/40">
                              Age
                            </TableHead>
                            <TableHead className="text-white font-medium sticky top-0 z-20 bg-black/60 backdrop-blur supports-[backdrop-filter]:bg-black/40">
                              Phone
                            </TableHead>
                            <TableHead className="text-white font-medium sticky top-0 z-20 bg-black/60 backdrop-blur supports-[backdrop-filter]:bg-black/40">
                              Email
                            </TableHead>
                            <TableHead className="text-white font-medium sticky top-0 z-20 bg-black/60 backdrop-blur supports-[backdrop-filter]:bg-black/40">
                              Status
                            </TableHead>
                            <TableHead className="text-white font-medium sticky top-0 z-20 bg-black/60 backdrop-blur supports-[backdrop-filter]:bg-black/40">
                              Batch
                            </TableHead>
                            <TableHead className="text-right text-white font-medium sticky top-0 z-20 bg-black/60 backdrop-blur supports-[backdrop-filter]:bg-black/40">
                              Actions
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        
                        <TableBody>
                          {filteredStudents.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={7} className="text-center py-12 text-gray-400">
                                <div className="space-y-2">
                                  <div className="w-16 h-16 mx-auto bg-white/10 rounded-full flex items-center justify-center">
                                    <span className="text-2xl">🎓</span>
                                  </div>
                                  <p className="text-lg font-medium">No students found</p>
                                  <p className="text-sm">Try a different search.</p>
                                </div>
                              </TableCell>
                            </TableRow>
                          ) : (
                            filteredStudents.map((student, index) => (
                              <motion.tr
                                key={student.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.02, duration: 0.3 }}
                                className="border-white/10 hover:bg-white/5 transition-colors"
                              >
                                <TableCell className="font-medium text-white">
                                  {student.name}
                                </TableCell>
                                
                                <TableCell className="text-white">
                                  {student.age || 'N/A'}
                                </TableCell>
                                
                                <TableCell className="text-white">
                                  {student.phone || 'N/A'}
                                </TableCell>
                                
                                <TableCell className="text-white">
                                  {student.email || 'N/A'}
                                </TableCell>
                                
                                <TableCell>
                                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                    student.status === 'Active' 
                                      ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                                      : student.status === 'Inactive'
                                      ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                                      : student.status === 'Graduated'
                                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                      : student.status === 'Discontinued'
                                      ? 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                                      : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                  }`}>
                                    {student.status || 'Enrolled'}
                                  </span>
                                </TableCell>
                                
                                <TableCell className="text-gray-300">
                                  {student.batch || 'No Batch'}
                                </TableCell>
                                
                                <TableCell className="text-right">
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    className="border-white/20 bg-white/10 text-white"
                                    onClick={() => handleViewStudent(student)}
                                  >
                                    View
                                  </Button>
                                </TableCell>
                              </motion.tr>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          
        </div>
      </div>

      <ToastContainer />

      {/* Add Student Dialog */}
      {isAddDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsAddDialogOpen(false)}
          />
          
          <div className="relative w-full max-w-md bg-black/95 backdrop-blur-xl border border-white/20 text-white rounded-xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.1)_1px,transparent_0)] bg-[length:3px_3px] opacity-30" />
            
            <div className="relative z-10">
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-white to-gray-300 rounded-lg flex items-center justify-center">
                    <span className="text-black font-bold text-sm">🎓</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      Add New Student
                    </h2>
                    <p className="text-gray-400">
                      Enter the student's information
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">Full Name *</label>
                    <Input
                      value={newStudent.name}
                      onChange={(e) => setNewStudent({...newStudent, name: e.target.value})}
                      className="bg-white/10 border-white/20 text-white"
                      placeholder="Enter full name"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">Email</label>
                    <Input
                      value={newStudent.email}
                      onChange={(e) => setNewStudent({...newStudent, email: e.target.value})}
                      className="bg-white/10 border-white/20 text-white"
                      placeholder="Enter email address"
                      type="email"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">Phone *</label>
                    <Input
                      value={newStudent.phone}
                      onChange={(e) => setNewStudent({...newStudent, phone: e.target.value})}
                      className="bg-white/10 border-white/20 text-white"
                      placeholder="Enter phone number"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">Address</label>
                    <Input
                      value={newStudent.address}
                      onChange={(e) => setNewStudent({...newStudent, address: e.target.value})}
                      className="bg-white/10 border-white/20 text-white"
                      placeholder="Enter address"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm text-gray-400 mb-1 block">Age</label>
                      <Input
                        value={newStudent.age}
                        onChange={(e) => setNewStudent({...newStudent, age: e.target.value})}
                        className="bg-white/10 border-white/20 text-white"
                        placeholder="Age"
                        type="number"
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm text-gray-400 mb-1 block">Level</label>
                      <Input
                        value={newStudent.level}
                        onChange={(e) => setNewStudent({...newStudent, level: e.target.value})}
                        className="bg-white/10 border-white/20 text-white"
                        placeholder="Level"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">Batch</label>
                    <Input
                      value={newStudent.batch}
                      onChange={(e) => setNewStudent({...newStudent, batch: e.target.value})}
                      className="bg-white/10 border-white/20 text-white"
                      placeholder="e.g. Morning, Evening, Weekend"
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-white/10 bg-gradient-to-r from-white/5 via-transparent to-white/5">
                <div className="flex items-center justify-end gap-3">
                  <Button
                    onClick={() => setIsAddDialogOpen(false)}
                    variant="outline"
                    className="border-white/20 text-white bg-red-500/50 hover:text-white hover:bg-red-500"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => createNewStudent(newStudent)}
                    disabled={isCreating || !newStudent.name || !newStudent.phone}
                    className="bg-white text-black hover:bg-gray-200"
                  >
                    {isCreating ? 'Creating...' : 'Add Student'}
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

export default Students;