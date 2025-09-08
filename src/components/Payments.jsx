// src/components/Payments.jsx
import React, { useState, useEffect } from 'react';
import { motion } from "motion/react";
import { FaExternalLinkAlt } from "react-icons/fa";
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

const Payments = () => {
  const navigate = useNavigate();
  // Toast functionality
  const { showToast, ToastContainer } = useToast();
  
  // State declarations
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // API Functions
  const fetchPayments = async () => {
    try {
      setLoading(true);
      
      // Get the auth token from localStorage
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        throw new Error('No authentication token found. Please login again.');
      }
      
      const response = await fetch('https://fifac-backend.vercel.app/api/payments', {
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
        setPayments(data.data);
      } else {
        throw new Error(data.error || 'Failed to fetch payments');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching payments:', err);
    } finally {
      setLoading(false);
    }
  };

  // Event Handlers
  const handleRefresh = () => {
    fetchPayments();
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
    
    fetchPayments();
  }, [navigate]);

  // Data filtering
  const query = searchQuery.trim().toLowerCase();
  const filteredPayments = payments.filter((payment) => {
    const matchesSearch = query ? (
      (payment.studentName || "").toLowerCase().includes(query) ||
      (payment.studentId || "").toLowerCase().includes(query) ||
      (payment.paymentMethod || "").toLowerCase().includes(query) ||
      (payment.notes || "").toLowerCase().includes(query)
    ) : true;

    const matchesStatus = filterStatus === "all" || payment.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  // Calculate totals
  const totalAmount = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
  const paidAmount = payments
    .filter(payment => payment.status === 'completed')
    .reduce((sum, payment) => sum + (payment.amount || 0), 0);
  const pendingAmount = payments
    .filter(payment => payment.status === 'pending')
    .reduce((sum, payment) => sum + (payment.amount || 0), 0);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-black">
        <Navbar />
        <div className="px-4 py-10 md:py-20 w-full max-w-6xl mx-auto relative z-10">
          <Card className="w-full shadow-xl border border-white/10 bg-black/40 backdrop-blur-md rounded-xl">
            <CardContent className="pt-6">
              <div className="text-red-400 text-center">
                <h3 className="text-lg font-semibold">Error Loading Payments</h3>
                <p className="text-gray-400 mt-2">{error}</p>
                <Button onClick={fetchPayments} className="mt-4 bg-white text-black hover:bg-gray-200">
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
            className="lg:col-span-2 h-full min-h-0"
          >
            <Card className="w-full h-full shadow-xl border border-white/10 bg-black/40 backdrop-blur-md rounded-xl relative overflow-hidden mt-0 flex flex-col min-h-0">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/15 via-transparent to-purple-500/15 pointer-events-none" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.1)_1px,transparent_0)] bg-[length:3px_3px] opacity-30 pointer-events-none" />
              
              <CardHeader className="relative z-10">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <CardTitle className="text-2xl font-bold text-white">
                    Payments [{loading ? 'Loading…' : ` ${payments.length}`}]
                  </CardTitle>
                  
                  <div className="hidden md:flex items-center gap-3">
                    <div className="relative">
                      <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search payments..."
                        aria-label="Search payments"
                        className="h-9 w-72 bg-white/5 border-white/20 text-white placeholder:text-gray-500 focus:border-white/40 focus:ring-white/20"
                      />
                    </div>
                  
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="h-9 px-3 bg-white/5 border border-white/20 text-white rounded-md focus:border-white/40 focus:ring-white/20"
                    >
                      <option value="all" className="bg-black text-white">All Status</option>
                      <option value="completed" className="bg-black text-white">Paid</option>
                      <option value="pending" className="bg-black text-white">Pending</option>
                      <option value="failed" className="bg-black text-white">Failed</option>
                    </select>

                    <button
                      type="button"
                      onClick={handleRefresh}
                      aria-label="Refresh payments"
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
                  View and manage all payment transactions
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
                              Student
                            </TableHead>
                            <TableHead className="text-white font-medium sticky top-0 z-20 bg-black/60 backdrop-blur supports-[backdrop-filter]:bg-black/40">
                              Amount
                            </TableHead>
                            <TableHead className="text-white font-medium sticky top-0 z-20 bg-black/60 backdrop-blur supports-[backdrop-filter]:bg-black/40">
                              Method
                            </TableHead>
                            <TableHead className="text-white font-medium sticky top-0 z-20 bg-black/60 backdrop-blur supports-[backdrop-filter]:bg-black/40">
                              Status
                            </TableHead>
                            <TableHead className="text-white font-medium sticky top-0 z-20 bg-black/60 backdrop-blur supports-[backdrop-filter]:bg-black/40">
                              Date
                            </TableHead>
                            <TableHead className="text-white font-medium sticky top-0 z-20 bg-black/60 backdrop-blur supports-[backdrop-filter]:bg-black/40">
                              Notes
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        
                        <TableBody>
                          {filteredPayments.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={6} className="text-center py-12 text-gray-400">
                                <div className="space-y-2">
                                  <div className="w-16 h-16 mx-auto bg-white/10 rounded-full flex items-center justify-center">
                                    <span className="text-2xl">💳</span>
                                  </div>
                                  <p className="text-lg font-medium">No payments found</p>
                                  <p className="text-sm">Try a different search or filter.</p>
                                </div>
                              </TableCell>
                            </TableRow>
                          ) : (
                            filteredPayments.map((payment, index) => (
                              <motion.tr
                                key={payment.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.02, duration: 0.3 }}
                                className="border-white/10 hover:bg-white/5 transition-colors"
                              >
                                <TableCell className="font-medium text-white">
                                  {payment.studentName || 'Unknown Student'}
                                  {payment.studentId && (
                                    <span className="block text-sm text-gray-400">
                                      ID: {payment.studentId}
                                    </span>
                                  )}
                                </TableCell>
                                
                                <TableCell className="text-white font-semibold">
                                  {formatCurrency(payment.amount)}
                                </TableCell>
                                
                                <TableCell className="text-gray-300">
                                  {payment.paymentMethod || 'N/A'}
                                </TableCell>
                                
                                <TableCell>
                                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                    payment.status === 'completed' 
                                      ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                                      : payment.status === 'pending'
                                      ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                                      : payment.status === 'failed'
                                      ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                                      : 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                                  }`}>
                                    {payment.status === 'completed' ? 'Completed' : payment.status || 'Unknown'}
                                  </span>
                                </TableCell>
                                
                                <TableCell className="text-gray-300">
                                  {formatDate(payment.paymentDate)}
                                </TableCell>
                                
                                <TableCell className="text-gray-300 max-w-xs truncate">
                                  {payment.notes || 'No notes'}
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

          <div className="flex flex-col gap-6 lg:sticky lg:top-28 min-h-0 h-full mt-3">
            {/* Payment Summary Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
            >
              <Card className="shadow-xl border border-white/10 bg-black/40 backdrop-blur-md rounded-xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/15 via-transparent to-blue-500/15 pointer-events-none" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.1)_1px,transparent_0)] bg-[length:3px_3px] opacity-30 pointer-events-none" />
                
                <CardHeader className="relative z-10 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <span className="text-lg">💰</span>
                    </div>
                    <CardTitle className="text-lg font-semibold text-white">
                      Payment Summary
                    </CardTitle>
                  </div>
                </CardHeader>
                
                <CardContent className="relative z-10 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Total Amount:</span>
                    <span className="text-white font-semibold">{formatCurrency(totalAmount)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Paid:</span>
                    <span className="text-green-400 font-semibold">{formatCurrency(paidAmount)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Pending:</span>
                    <span className="text-yellow-400 font-semibold">{formatCurrency(pendingAmount)}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Actions */}
            {[
              {title: 'Students', emoji: '👥', path: '/students-dashboard'}
             
            ].map((item, idx) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * (idx + 2), duration: 0.6 }}
              >
                <Link to={item.path} className="block">
                  <Card className="shadow-xl border border-white/10 bg-black/40 backdrop-blur-md rounded-xl relative overflow-hidden flex-1 flex flex-col min-h-0 cursor-pointer hover:bg-white/5 transition-colors">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/15 via-transparent to-purple-500/15 pointer-events-none" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.1)_1px,transparent_0)] bg-[length:3px_3px] opacity-30 pointer-events-none" />
                    
                    <CardHeader className="relative z-10 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
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

            {/* Payment Portal Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <Button 
                onClick={() => window.open('https://fdspayments.vercel.app/', '_blank')}
                className="w-[70%] h-12 bg-gradient-to-br from-blue-500/15 via-transparent to-purple-500/15 border border-white/10 shadow-xl hover:bg-white/5 transition-colors"
              >
                <div className="flex flex-start gap-2">
                  
                  <span>Payment Portal</span>
                  <span className="text-lg"><FaExternalLinkAlt /></span>
                </div>
              </Button>
            </motion.div>
          </div>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
};

export default Payments;

