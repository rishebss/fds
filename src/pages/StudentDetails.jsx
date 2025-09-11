// src/pages/StudentDetails.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import Navbar from "../components/Navbar";

const StudentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast, ToastContainer } = useToast();
  
  // State declarations
  const [studentDetails, setStudentDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [attendance, setAttendance] = useState([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [payments, setPayments] = useState([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);

  // API Functions
  const fetchStudentDetails = async () => {
    try {
      setLoading(true);
      
      // Get the auth token from localStorage
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        throw new Error('No authentication token found. Please login again.');
      }
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/students/${id}`, {
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
        setStudentDetails(data.data);
      } else {
        throw new Error(data.error || 'Failed to fetch student details');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching student details:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendance = async () => {
    try {
      setAttendanceLoading(true);
      
      // Get the auth token from localStorage
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        throw new Error('No authentication token found. Please login again.');
      }
      
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/attendance/student/${id}?year=${currentYear}&month=${currentMonth}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
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
        setAttendance(data.data);
      } else {
        throw new Error(data.error || 'Failed to fetch attendance');
      }
    } catch (err) {
      console.error('Error fetching attendance:', err);
      showToast('Failed to load attendance records.', 'error');
    } finally {
      setAttendanceLoading(false);
    }
  };

  const fetchPayments = async () => {
    try {
      setPaymentsLoading(true);
      
      // Get the auth token from localStorage
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        throw new Error('No authentication token found. Please login again.');
      }
      
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/payments?studentId=${id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
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
        // Filter payments for this student and get latest 10
        const studentPayments = data.data
          .filter(payment => payment.studentId === id)
          .sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate))
          .slice(0, 10);
        setPayments(studentPayments);
      } else {
        throw new Error(data.error || 'Failed to fetch payments');
      }
    } catch (err) {
      console.error('Error fetching payments:', err);
      showToast('Failed to load payment records.', 'error');
    } finally {
      setPaymentsLoading(false);
    }
  };
  
  const handleDeleteMonth = async () => {
    if (!window.confirm(`Are you sure you want to delete all attendance records for ${currentMonth}/${currentYear}? This action cannot be undone.`)) {
      return;
    }
  
    try {
      // Get the auth token from localStorage
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        showToast('No authentication token found. Please login again.', 'error');
        return;
      }
      
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/attendance/student/${id}/month?year=${currentYear}&month=${currentMonth}`,
        { 
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
  
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
        showToast(`Deleted ${data.data.deletedCount} attendance records`, 'success');
        fetchAttendance(); // Refresh attendance data
      } else {
        throw new Error(data.error || 'Failed to delete attendance records');
      }
    } catch (err) {
      console.error('Error deleting attendance:', err);
      showToast('Failed to delete attendance records. Please try again.', 'error');
    }
  };

  // Effects - Consolidated to prevent double API calls
  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('authToken');
    if (!token) {
      showToast('Please login to access this page', 'error');
      navigate('/');
      return;
    }
    
    if (id) {
      // Fetch all data in parallel to avoid multiple sequential calls
      Promise.all([
        fetchStudentDetails(),
        fetchAttendance(),
        fetchPayments()
      ]).catch(error => {
        console.error('Error fetching initial data:', error);
      });
    }
  }, [id, navigate]);

  // Separate useEffect for month/year changes (only fetch attendance and payments)
  useEffect(() => {
    if (id && studentDetails) { // Only run if we already have student details
      fetchAttendance();
      fetchPayments();
    }
  }, [currentMonth, currentYear]);

  const handleDeleteClick = () => {
    setShowConfirmDelete(true);
  };

  const handleConfirmDelete = async () => {
    try {
      setIsDeleting(true);
      
      // Get the auth token from localStorage
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        showToast('No authentication token found. Please login again.', 'error');
        return;
      }
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/students/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
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
        showToast('Deleted successfully', 'success');
        navigate('/students-dashboard');
      } else {
        throw new Error(data.error || 'Failed to delete student');
      }
    } catch (err) {
      console.error('Error deleting student:', err);
      showToast('Failed to delete student. Please try again.', 'error');
    } finally {
      setIsDeleting(false);
      setShowConfirmDelete(false);
    }
  };

  const handleCancelDelete = () => {
    setShowConfirmDelete(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditFormData(studentDetails || {});
  };

  const handleInputChange = (field, value) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      // Get the auth token from localStorage
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        showToast('No authentication token found. Please login again.', 'error');
        return;
      }
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/students/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editFormData),
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
        setStudentDetails(data.data);
        setIsEditing(false);
        showToast('Updated successfully', 'success');
      } else {
        throw new Error(data.error || 'Failed to update student');
      }
    } catch (err) {
      console.error('Error updating student:', err);
      showToast('Failed to update student. Please try again.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditFormData({});
  };

  // Utility Functions
  const formatPhone = (phone) => {
    return phone?.replace(/(\d{3})-(\d{3})-(\d{4})/, '($1) $2-$3');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAttendanceDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      present: 'bg-green-500/20 text-green-300 border-green-500/30',
      absent: 'bg-red-500/20 text-red-300 border-red-500/30',
      leave: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
    };
    
    return `px-2 py-1 rounded-full text-xs font-medium border ${statusConfig[status] || 'bg-gray-500/20 text-gray-300 border-gray-500/30'}`;
  };

  const getPaymentStatusBadge = (status) => {
    const statusConfig = {
      completed: 'bg-green-500/20 text-green-300 border-green-500/30',
      pending: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      failed: 'bg-red-500/20 text-red-300 border-red-500/30'
    };
    
    return `px-2 py-1 rounded-full text-xs font-medium border ${statusConfig[status] || 'bg-gray-500/20 text-gray-300 border-gray-500/30'}`;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount || 0);
  };

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-black">
        <Navbar />
        <div className="px-4 py-10 md:py-20 w-full max-w-8xl mx-auto relative z-10">
          <Card className="w-full shadow-xl border border-white/10 bg-black/40 backdrop-blur-md rounded-xl">
            <CardContent className="pt-6">
              <div className="text-red-400 text-center">
                <h3 className="text-lg font-semibold">Error Loading Student Details</h3>
                <p className="text-gray-400 mt-2">{error}</p>
                <div className="flex gap-3 justify-center mt-4">
                  <Button onClick={fetchStudentDetails} className="bg-white text-black hover:bg-gray-200">
                    Try Again
                  </Button>
                  <Button onClick={() => navigate('/students-dashboard')} variant="outline" className="border-white/20 text-white">
                    Back to Students
                  </Button>
                </div>
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

      <div className="px-4 pt-24 pb-6 md:pt-28 md:pb-8 w-full max-w-8xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 lg:grid-cols-5 gap-3 items-start h-[calc(100vh-8rem)] md:h-[calc(100vh-10rem)]"
        >
          {/* Student Details Section */}
          <div className="lg:col-span-2">
            <Card className="w-full h-full shadow-xl border border-white/10 bg-black/40 backdrop-blur-md rounded-xl relative overflow-hidden flex flex-col">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/15 via-transparent to-purple-500/15 pointer-events-none" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.1)_1px,transparent_0)] bg-[length:3px_3px] opacity-30 pointer-events-none" />
              
              <CardHeader className="relative z-10 flex-shrink-0">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-3">
                    
                    <CardTitle className="text-xl font-bold text-white">
                      Student Details
                    </CardTitle>
                  </div>
                  
                  {!loading && studentDetails && (
                    <div className="flex items-center gap-2">
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={handleSave}
                            disabled={isSaving}
                            size="sm"
                            className="bg-white/60 text-black hover:bg-white text-xs"
                          >
                            {isSaving ? 'Saving...' : 'Save'}
                          </Button>
                          <Button
                            onClick={handleCancelEdit}
                            disabled={isSaving}
                            variant="outline"
                            size="sm"
                            className="border-white/20 text-white hover:text-white bg-red-500/30 hover:bg-red-500/60 text-xs"
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={handleEdit}
                            variant="outline"
                            size="sm"
                            className="border-white/20 bg-white/10 text-white hover:bg-white/20 text-xs"
                          >
                            <FaEdit className="mr-1" /> Edit
                          </Button>
                          <Button
                            onClick={handleDeleteClick}
                            disabled={isDeleting}
                            variant="outline"
                            size="sm"
                            className="border-white/20 bg-red-500/50 text-white hover:bg-red-500/70 text-xs"
                          >
                            <MdDelete className="mr-1" />
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                <CardDescription className="text-gray-400 text-sm">
                  {loading ? 'Loading student information...' : `Complete information for ${studentDetails?.name}`}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="relative z-10">
                {loading ? (
                  <div className="space-y-6">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="space-y-2">
                        <Skeleton className="h-4 w-20 bg-white/10" />
                        <Skeleton className="h-6 w-full bg-white/10" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Personal Information */}
                    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <h3 className="text-base font-semibold mb-3 text-blue-300 flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                        Personal Information
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Full Name</p>
                          {isEditing ? (
                            <Input
                              value={editFormData.name || ''}
                              onChange={(e) => handleInputChange('name', e.target.value)}
                              className="bg-white/10 border-white/20 text-white text-sm h-8"
                            />
                          ) : (
                            <p className="font-medium text-white text-sm">{studentDetails?.name || 'N/A'}</p>
                          )}
                        </div>
                        
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Email</p>
                          {isEditing ? (
                            <Input
                              value={editFormData.email || ''}
                              onChange={(e) => handleInputChange('email', e.target.value)}
                              className="bg-white/10 border-white/20 text-white text-sm h-8"
                            />
                          ) : (
                            <p className="font-medium text-white text-sm">{studentDetails?.email || 'N/A'}</p>
                          )}
                        </div>
                        
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Phone</p>
                          {isEditing ? (
                            <Input
                              value={editFormData.phone || ''}
                              onChange={(e) => handleInputChange('phone', e.target.value)}
                              className="bg-white/10 border-white/20 text-white text-sm h-8"
                            />
                          ) : (
                            <p className="font-medium text-white text-sm">
                              {studentDetails?.phone ? formatPhone(studentDetails.phone) : 'N/A'}
                            </p>
                          )}
                        </div>
                        
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Age</p>
                          {isEditing ? (
                            <Input
                              value={editFormData.age || ''}
                              onChange={(e) => handleInputChange('age', e.target.value)}
                              className="bg-white/10 border-white/20 text-white text-sm h-8"
                            />
                          ) : (
                            <p className="font-medium text-white text-sm">
                              {studentDetails?.age || 'N/A'}
                            </p>
                          )}
                        </div>
                        
                        <div className="sm:col-span-2">
                          <p className="text-xs text-gray-400 mb-1">Address</p>
                          {isEditing ? (
                            <Input
                              value={editFormData.address || ''}
                              onChange={(e) => handleInputChange('address', e.target.value)}
                              className="bg-white/10 border-white/20 text-white text-sm h-8"
                            />
                          ) : (
                            <p className="font-medium text-white text-sm">
                              {studentDetails?.address || 'N/A'}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Academic Information */}
                    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <h3 className="text-base font-semibold mb-3 text-green-300 flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                        Academic Information
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Level</p>
                          {isEditing ? (
                            <Input
                              value={editFormData.level || ''}
                              onChange={(e) => handleInputChange('level', e.target.value)}
                              placeholder="e.g. Beginner, Intermediate, Advanced"
                              className="bg-white/10 border-white/20 text-white text-sm h-8"
                            />
                          ) : (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              studentDetails?.level === 'Beginner' 
                                ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                                : studentDetails?.level === 'Intermediate'
                                ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                                : studentDetails?.level === 'Advanced'
                                ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                                : 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                            }`}>
                              {studentDetails?.level || 'Not Set'}
                            </span>
                          )}
                        </div>
                        
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Batch</p>
                          {isEditing ? (
                            <Input
                              value={editFormData.batch || ''}
                              onChange={(e) => handleInputChange('batch', e.target.value)}
                              placeholder="e.g. Morning, Evening, Weekend"
                              className="bg-white/10 border-white/20 text-white text-sm h-8"
                            />
                          ) : (
                            <p className="font-medium text-white text-sm">{studentDetails?.batch || 'No Batch Assigned'}</p>
                          )}
                        </div>
                        
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Enrollment Date</p>
                          <p className="font-medium text-white text-sm">
                            {studentDetails?.createdAt ? formatDate(studentDetails.createdAt) : 'N/A'}
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Status</p>
                          {isEditing ? (
                            <Input
                              value={editFormData.status || ''}
                              onChange={(e) => handleInputChange('status', e.target.value)}
                              placeholder="e.g. Active, Inactive, Graduated"
                              className="bg-white/10 border-white/20 text-white text-sm h-8"
                            />
                          ) : (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              studentDetails?.status === 'Active' 
                                ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                                : studentDetails?.status === 'Inactive'
                                ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                                : studentDetails?.status === 'Graduated'
                                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                : 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                            }`}>
                              {studentDetails?.status || 'Enrolled'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Attendance and Payments Section */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
              {/* Attendance Section */}
              <Card className="w-full shadow-xl border border-white/10 bg-black/40 backdrop-blur-md rounded-xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/15 via-transparent to-blue-500/15 pointer-events-none" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.1)_1px,transparent_0)] bg-[length:3px_3px] opacity-30 pointer-events-none" />
                
                <CardHeader className="relative z-10">
                  <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                    <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                    Attendance
                  </CardTitle>
                  <CardDescription className="text-gray-400 text-xs">
                    {new Date(currentYear, currentMonth - 1).toLocaleString('default', { month: 'short', year: 'numeric' })}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="relative z-10 space-y-3">
                  {/* Month/Year Selector */}
                  <div className="flex items-center gap-2">
                    <Select
                      value={currentMonth.toString()}
                      onValueChange={(value) => setCurrentMonth(parseInt(value))}
                    >
                      <SelectTrigger className="flex-1 bg-gradient-to-r from-white/10 to-white/5 border-white/20 text-white hover:border-white/30 focus:border-white/40 focus:ring-2 focus:ring-white/10 transition-all duration-200 backdrop-blur-sm shadow-lg text-xs">
                        <SelectValue placeholder="Month" />
                      </SelectTrigger>
                      <SelectContent className="bg-white/10 backdrop-blur-xl border-white/20">
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                          <SelectItem key={month} value={month.toString()} className="text-white">
                            {new Date(currentYear, month - 1).toLocaleString('default', { month: 'short' })}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Select
                      value={currentYear.toString()}
                      onValueChange={(value) => setCurrentYear(parseInt(value))}
                    >
                      <SelectTrigger className="flex-1 bg-gradient-to-r from-white/10 to-white/5 border-white/20 text-white hover:border-white/30 focus:border-white/40 focus:ring-2 focus:ring-white/10 transition-all duration-200 backdrop-blur-sm shadow-lg text-xs">
                        <SelectValue placeholder="Year" />
                      </SelectTrigger>
                      <SelectContent className="bg-white/10 backdrop-blur-xl border-white/20">
                        {Array.from({ length: 5 }, (_, i) => currentYear - 2 + i).map(year => (
                          <SelectItem key={year} value={year.toString()} className="text-white">
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                    onClick={handleDeleteMonth}
                    variant="outline"
                    size="sm"
                    className="border-red-500/50 text-white bg-red-500/50 text-xs h-8"
                  >
                    Delete Month
                  </Button>
                  </div>

                  

                  {/* Attendance Table */}
                  {attendanceLoading ? (
                    <div className="space-y-2">
                      {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-8 bg-white/10" />
                      ))}
                    </div>
                  ) : attendance.length === 0 ? (
                    <div className="text-center py-6">
                      <div className="w-12 h-12 mx-auto bg-white/10 rounded-full flex items-center justify-center mb-3">
                        <span className="text-lg">📅</span>
                      </div>
                      <p className="text-gray-400 text-xs">No attendance records found.</p>
                    </div>
                  ) : (
                    <div className="border border-white/10 rounded-lg h-[380px] overflow-y-auto nice-scrollbar">
                      <table className="w-full">
                        <thead className="sticky top-0 bg-black/90 backdrop-blur-sm z-10">
                          <tr className="border-b border-white/10">
                            <th className="text-left p-2 text-xs font-medium text-gray-400 bg-black/50">Date</th>
                            <th className="text-left p-2 text-xs font-medium text-gray-400 bg-black/50">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {attendance.map((record) => (
                            <tr key={record.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                              <td className="p-2 text-xs text-white">
                                {formatAttendanceDate(record.date)}
                              </td>
                              <td className="p-2">
                                <span className={`${getStatusBadge(record.status)} text-xs`}>
                                  {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Payments Section */}
              <Card className="w-full shadow-xl border border-white/10 bg-black/40 backdrop-blur-md rounded-xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/15 via-transparent to-blue-500/15 pointer-events-none" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.1)_1px,transparent_0)] bg-[length:3px_3px] opacity-30 pointer-events-none" />
                
                <CardHeader className="relative z-10">
                  <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                    Recent Payments
                  </CardTitle>
                  <CardDescription className="text-gray-400 text-xs">
                    Latest transactions
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="relative z-10 space-y-3">
                  {/* Payments Table */}
                  {paymentsLoading ? (
                    <div className="space-y-2">
                      {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-8 bg-white/10" />
                      ))}
                    </div>
                  ) : payments.length === 0 ? (
                    <div className="text-center py-6">
                      <div className="w-12 h-12 mx-auto bg-white/10 rounded-full flex items-center justify-center mb-3">
                        <span className="text-lg">💳</span>
                      </div>
                      <p className="text-gray-400 text-xs">No payment records found.</p>
                    </div>
                  ) : (
                    <div className="border border-white/10 rounded-lg h-[430px] overflow-y-auto nice-scrollbar">
                      <table className="w-full">
                        <thead className="sticky top-0 bg-black/90 backdrop-blur-sm z-10">
                          <tr className="border-b border-white/10">
                            <th className="text-left p-2 text-xs font-medium text-gray-400 bg-black/50">Date</th>
                            <th className="text-left p-2 text-xs font-medium text-gray-400 bg-black/50">Amount</th>
                            <th className="text-left p-2 text-xs font-medium text-gray-400 bg-black/50">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {payments.map((payment) => (
                            <tr key={payment.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                              <td className="p-2 text-xs text-white">
                                {formatAttendanceDate(payment.paymentDate)}
                              </td>
                              <td className="p-2 text-xs text-white font-semibold">
                                {formatCurrency(payment.amount)}
                              </td>
                              <td className="p-2">
                                <span className={`${getPaymentStatusBadge(payment.status)} text-xs`}>
                                  {payment.status === 'completed' ? 'Completed' : payment.status?.charAt(0).toUpperCase() + payment.status?.slice(1) || 'Unknown'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
      

      <ToastContainer />
      
      <ConfirmDialog
        isOpen={showConfirmDelete}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Delete Student"
        message={`Are you sure you want to delete ${studentDetails?.name}? This action cannot be undone.`}
        confirmText="Delete Student"
        cancelText="Cancel"
        type="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default StudentDetails;