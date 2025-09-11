// src/components/Leads.jsx
import React, { useState, useEffect } from 'react';
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { IoMdAdd } from "react-icons/io";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { Link } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/toast";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import Navbar from "./Navbar";

const Leads = () => {
  // Navigation
  const navigate = useNavigate();
  
  // Toast functionality
  const { showToast, ToastContainer } = useToast();
  
  // State declarations
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLead, setSelectedLead] = useState(null);
  const [isAddDialogOpen,setIsAddDialogOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newLead, setNewLead] = useState({
  name: '',
  phone: '',
  email: '',
  source: '',
  experienceLevel: ''
});
const [isCreating, setIsCreating] = useState(false);
  const [leadDetails, setLeadDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  // API Functions
  const fetchLeads = async () => {
    try {
      setLoading(true);
      
      // Get the auth token from localStorage
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        throw new Error('No authentication token found. Please login again.');
      }
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/leads`, {
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
        setLeads(data.data);
      } else {
        throw new Error(data.error || 'Failed to fetch leads');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching leads:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeadDetails = async (leadId) => {
    try {
      setDetailsLoading(true);
      
      // Get the auth token from localStorage
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        throw new Error('No authentication token found. Please login again.');
      }
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/leads/${leadId}`, {
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
        setLeadDetails(data.data);
      } else {
        throw new Error(data.error || 'Failed to fetch lead details');
      }
    } catch (err) {
      console.error('Error fetching lead details:', err);
      setLeadDetails(leads.find(lead => lead.id === leadId));
    } finally {
      setDetailsLoading(false);
    }
  };

  // Event Handlers
  const createNewLead = async (leadData) => {
  try {
    setIsCreating(true);
    
    // Validate required fields
    if (!leadData.name.trim() || !leadData.phone.trim()) {
      showToast('Name and phone number are required', 'error');
      return;
    }

    // Get the auth token from localStorage
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      showToast('No authentication token found. Please login again.', 'error');
      return;
    }

    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/leads`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(leadData),
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
      // Add the new lead to the local state
      setLeads(prevLeads => [data.data, ...prevLeads]);
      setIsAddDialogOpen(false);
      setNewLead({ name: '', phone: '', email: '', source: '', experienceLevel: '' });
      showToast('Added successfully!', 'success');
    } else {
      throw new Error(data.error || 'Failed to create lead');
    }
  } catch (err) {
    console.error('Error creating lead:', err);
    showToast('Failed to create lead. Please try again.', 'error');
  } finally {
    setIsCreating(false);
  }
};

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
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/leads/${selectedLead.id}`, {
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
        // Remove the lead from the local state
        setLeads(prevLeads => prevLeads.filter(lead => lead.id !== selectedLead.id));
        
        // Close dialogs
        setShowConfirmDelete(false);
        setIsDialogOpen(false);
        
        // Show success toast
        showToast(`Deleted successfully`, 'success');
      } else {
        throw new Error(data.error || 'Failed to delete lead');
      }
    } catch (err) {
      console.error('Error deleting lead:', err);
      showToast('Failed to delete lead. Please try again.', 'error');
    } finally {
      setIsDeleting(false);
      setShowConfirmDelete(false);
    }
  };

  const handleCancelDelete = () => {
    setShowConfirmDelete(false);
  };

  const handleViewLead = async (lead) => {
    setSelectedLead(lead);
    setIsDialogOpen(true);
    await fetchLeadDetails(lead.id);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditFormData(leadDetails || {});
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
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/leads/${selectedLead.id}`, {
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
        setLeadDetails(data.data);
        setLeads(prevLeads => 
          prevLeads.map(lead => 
            lead.id === selectedLead.id ? { ...lead, ...data.data } : lead
          )
        );
        setIsEditing(false);
        showToast(`Updated successfully`, 'success');
      } else {
        throw new Error(data.error || 'Failed to update lead');
      }
    } catch (err) {
      console.error('Error updating lead:', err);
      showToast('Failed to update lead. Please try again.', 'error');
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

  // Effects
  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('authToken');
    if (!token) {
      showToast('Please login to access this page', 'error');
      navigate('/');
      return;
    }
    
    fetchLeads();
  }, [navigate]);

  // Data filtering
  const query = searchQuery.trim().toLowerCase();
  const filteredLeads = query
    ? leads.filter((lead) => {
        const name = (lead.name || "").toLowerCase();
        const email = (lead.email || "").toLowerCase();
        const source = (lead.source || "").toLowerCase();
        const phone = (lead.phone || "").toString().toLowerCase();
        return (
          name.includes(query) ||
          email.includes(query) ||
          source.includes(query) ||
          phone.includes(query)
        );
      })
    : leads;

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-black">
        <Navbar />
        <div className="px-4 py-10 md:py-20 w-full max-w-6xl mx-auto relative z-10">
          <Card className="w-full shadow-xl border border-white/10 bg-black/40 backdrop-blur-md rounded-xl">
            <CardContent className="pt-6">
              <div className="text-red-400 text-center">
                <h3 className="text-lg font-semibold">Error Loading Leads</h3>
                <p className="text-gray-400 mt-2">{error}</p>
                <Button onClick={fetchLeads} className="mt-4 bg-white text-black hover:bg-gray-200">
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Main Render
  return (
    <div className={`relative min-h-screen bg-black overflow-hidden ${isDialogOpen ? 'backdrop-blur-sm' : ''}`}>
      {/* Background elements */}
      <div className="sticky top-0 z-50">
        <Navbar />
      </div>
      
      <div className={`absolute inset-0 bg-gradient-to-br from-blue-500/15 via-transparent to-purple-500/15 pointer-events-none ${isDialogOpen ? 'blur-sm' : ''}`} />
      <div className={`absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.5)_100%)] pointer-events-none ${isDialogOpen ? 'blur-sm' : ''}`} />
      <div className={`absolute inset-0 opacity-[0.15] bg-[url('data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjAwIDIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZmlsdGVyIGlkPSJub2lzZSI+PGZlVHVyYnVsZW5jZSB0eXBlPSJmcmFjdGFsTm9pc2UiIGJhc2VGcmVxdWVuY3k9IjAuNjUiIG51bU9jdGF2ZXM9IjMiIHN0aXRjaFRpbGVzPSJzdGl0Y2giLz48L2ZpbHRlcj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWx0ZXI=")] pointer-events-none ${isDialogOpen ? 'blur-sm' : ''}`} />
      <div className={`absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.15)_1px,transparent_0)] bg-[length:4px_4px] opacity-20 pointer-events-none ${isDialogOpen ? 'blur-sm' : ''}`} />

      {/* Main content */}
      <div className={`px-4 pt-24 pb-6 md:pt-28 md:pb-8 w-full max-w-7xl mx-auto relative z-10 ${isDialogOpen ? 'blur-sm' : ''}`}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start h-[calc(100vh-8rem)] md:h-[calc(100vh-10rem)] overflow-hidden min-h-0">
          
          {/* Leads Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-4 h-full min-h-0"
          >
            <Card className="w-full h-full shadow-xl border border-white/10 bg-black/40 backdrop-blur-md rounded-xl relative overflow-hidden mt-0 flex flex-col min-h-0">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/15 via-transparent to-purple-500/15 pointer-events-none" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.1)_1px,transparent_0)] bg-[length:3px_3px] opacity-30 pointer-events-none" />
              
              <CardHeader className="relative z-10">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <CardTitle className="text-2xl font-bold text-white">
                    Leads Management [{loading ? 'Loading…' : ` ${leads.length}`}]
                  </CardTitle>
                  
                  <div className="hidden md:flex items-center gap-3">
                    
                    <div className="relative">
                      <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search...."
                        aria-label="Search leads"
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
                      onClick={fetchLeads}
                      aria-label="Refresh leads"
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
                  Manage and view all your potential students
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
                              Contact
                            </TableHead>
                            <TableHead className="text-white font-medium sticky top-0 z-20 bg-black/60 backdrop-blur supports-[backdrop-filter]:bg-black/40">
                              Status
                            </TableHead>
                            <TableHead className="text-white font-medium sticky top-0 z-20 bg-black/60 backdrop-blur supports-[backdrop-filter]:bg-black/40">
                              Created
                            </TableHead>
                            <TableHead className="text-white font-medium sticky top-0 z-20 bg-black/60 backdrop-blur supports-[backdrop-filter]:bg-black/40">
                              Source
                            </TableHead>
                            <TableHead className="text-right text-white font-medium sticky top-0 z-20 bg-black/60 backdrop-blur supports-[backdrop-filter]:bg-black/40">
                              Actions
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        
                        
                        <TableBody>
                          {filteredLeads.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={6} className="text-center py-12 text-gray-400">
                                <div className="space-y-2">
                                  <div className="w-16 h-16 mx-auto bg-white/10 rounded-full flex items-center justify-center">
                                    <span className="text-2xl">📋</span>
                                  </div>
                                  <p className="text-lg font-medium">No leads found</p>
                                  <p className="text-sm">Try a different search.</p>
                                </div>
                              </TableCell>
                            </TableRow>
                          ) : (
                            filteredLeads.map((lead, index) => (
                              <motion.tr
                                key={lead.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.02, duration: 0.3 }}
                                className="border-white/10 hover:bg-white/5 transition-colors"
                              >
                                <TableCell className="font-medium text-white">
                                  {lead.name}
                                  {lead.studentAge && (
                                    <span className="block text-sm text-gray-400">
                                      Age: {lead.studentAge}
                                    </span>
                                  )}
                                </TableCell>
                                
                                <TableCell className="text-white">
                                  <div>{lead.phone}</div>
                                </TableCell>
                                
                                <TableCell>
                                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                    lead.status === 'New' 
                                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                      : lead.status === 'Contacted'
                                      ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                                      : lead.status === 'Qualified'
                                      ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                                      : lead.status === 'Enrolled'
                                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                      : lead.status === 'Not Interested'
                                      ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                                      : 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                                  }`}>
                                    {lead.status || 'New'}
                                  </span>
                                </TableCell>
                                
                                <TableCell className="text-gray-300">
                                  {lead.createdAt ? formatDate(lead.createdAt) : 'N/A'}
                                </TableCell>
                                
                                <TableCell className="text-gray-300">
                                  {lead.source || 'Unknown'}
                                </TableCell>
                                
                                <TableCell className="text-right">
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    className="border-white/20 bg-white/10 text-white"
                                    onClick={() => handleViewLead(lead)}
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

      {/* Lead Details Dialog */}
      {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsDialogOpen(false)}
          />
          
          <div className="relative w-full max-w-3xl max-h-[80vh] bg-black/95 backdrop-blur-xl border border-white/20 text-white rounded-xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.1)_1px,transparent_0)] bg-[length:3px_3px] opacity-30" />
            
            <div className="relative z-10">
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-white to-gray-300 rounded-lg flex items-center justify-center">
                    <span className="text-black font-bold text-sm">👤</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      Lead Details
                    </h2>
                    <p className="text-gray-400">
                      Complete information for {selectedLead?.name}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-6 max-h-[calc(80vh-200px)] overflow-y-auto nice-scrollbar">
                {detailsLoading ? (
                  <div className="space-y-6">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="space-y-2">
                        <Skeleton className="h-4 w-24 bg-white/10" />
                        <Skeleton className="h-8 w-full bg-white/10" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-8">
                    {/* Personal Information */}
                    <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                      <h3 className="text-lg font-semibold mb-4 text-blue-300 flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                        Personal Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <p className="text-sm text-gray-400 mb-1">Full Name</p>
                          {isEditing ? (
                            <Input
                              value={editFormData.name || ''}
                              onChange={(e) => handleInputChange('name', e.target.value)}
                              className="bg-white/10 border-white/20 text-white"
                            />
                          ) : (
                            <p className="font-medium text-white">{leadDetails?.name || 'N/A'}</p>
                          )}
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-400 mb-1">Email</p>
                          {isEditing ? (
                            <Input
                              value={editFormData.email || ''}
                              onChange={(e) => handleInputChange('email', e.target.value)}
                              className="bg-white/10 border-white/20 text-white"
                            />
                          ) : (
                            <p className="font-medium text-white">{leadDetails?.email || 'N/A'}</p>
                          )}
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-400 mb-1">Phone</p>
                          {isEditing ? (
                            <Input
                              value={editFormData.phone || ''}
                              onChange={(e) => handleInputChange('phone', e.target.value)}
                              className="bg-white/10 border-white/20 text-white"
                            />
                          ) : (
                            <p className="font-medium text-white">
                              {leadDetails?.phone ? formatPhone(leadDetails.phone) : 'N/A'}
                            </p>
                          )}
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-400 mb-1">Age</p>
                          {isEditing ? (
                            <Input
                              value={editFormData.studentAge || editFormData.age || ''}
                              onChange={(e) => handleInputChange('studentAge', e.target.value)}
                              className="bg-white/10 border-white/20 text-white"
                            />
                          ) : (
                            <p className="font-medium text-white">
                              {leadDetails?.age || leadDetails?.studentAge || 'N/A'}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Meta Information */}
                    <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                      <h3 className="text-lg font-semibold mb-4 text-green-300 flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                        Meta Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <p className="text-sm text-gray-400 mb-1">Status</p>
                          {isEditing ? (
                            <Input
                              value={editFormData.status || ''}
                              onChange={(e) => handleInputChange('status', e.target.value)}
                              placeholder="e.g. New, Contacted, Qualified, Enrolled"
                              className="bg-white/10 border-white/20 text-white"
                            />
                          ) : (
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              leadDetails?.status === 'New' 
                                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                : leadDetails?.status === 'Contacted'
                                ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                                : leadDetails?.status === 'Qualified'
                                ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                                : leadDetails?.status === 'Enrolled'
                                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                : leadDetails?.status === 'Not Interested'
                                ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                                : 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                            }`}>
                              {leadDetails?.status || 'New'}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="text-sm text-gray-400 mb-1">Source</p>
                            {isEditing ? (
                            <Input
                              value={editFormData.source || ''}
                              onChange={(e) => handleInputChange('source', e.target.value)}
                              placeholder="e.g. Google, Facebook, Instagram, etc."
                              className="bg-white/10 border-white/20 text-white"
                            />
                          ) : (
                              <p className="font-medium text-white">{leadDetails?.source || 'Unknown'}</p>

)
                          }
                        </div>
                        <div>
                          <p className="textsm text-gray-400 mb-1">Created Date</p>
                          {isEditing ? (
                            <Input
                              value={editFormData.createdAt || ''}
                              onChange={(e) => handleInputChange('createdAt', e.target.value)}
                              className="bg-white/10 border-white/20 text-white"
                            />
) : (
                          <p className="font-medium text-white">
                            {leadDetails?.createdAt ? formatDate(leadDetails.createdAt) : 'N/A'}
                          </p>
)}

                        </div>
                        <div>
                          <p className="text-sm text-gray-400 mb-1">Experience Level</p>
                          { isEditing ? (
                            <Input
                              value={editFormData.experienceLevel || ''}
                              onChange={(e) => handleInputChange('experienceLevel', e.target.value)}
                              className="bg-white/10 border-white/20 text-white"
                            />
                            ) : (
                            <p className="font-medium text-white">{leadDetails?.experienceLevel || 'Not specified'}</p>

)}
                        </div>
                      </div>
                    </div>



                    {(leadDetails?.company || leadDetails?.participantCount || leadDetails?.relationship) && (
                      <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                        <h3 className="text-lg font-semibold mb-4 text-yellow-300 flex items-center gap-2">
                          <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                          Additional Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {leadDetails?.company && (
                            <div>
                              <p className="text-sm text-gray-400 mb-1">Company</p>
                              <p className="font-medium text-white">{leadDetails.company}</p>
                            </div>
                          )}
                          {leadDetails?.participantCount && (
                            <div>
                              <p className="text-sm text-gray-400 mb-1">Participants</p>
                              <p className="font-medium text-white">{leadDetails.participantCount}</p>
                            </div>
                          )}
                          {leadDetails?.relationship && (
                            <div>
                              <p className="text-sm text-gray-400 mb-1">Relationship</p>
                              <p className="font-medium text-white">{leadDetails.relationship}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}


                  </div>
                )}
              </div>

              {/* Footer Section */}
              <div className="p-6 border-t border-white/10 bg-gradient-to-r from-white/5 via-transparent to-white/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={handleSave}
                          disabled={isSaving}
                          size="sm"
                          className="bg-white/60 text-black hover:bg-white"
                        >
                          {isSaving ? 'Saving...' : 'Save Changes'}
                        </Button>
                        <Button
                          onClick={handleCancelEdit}
                          disabled={isSaving}
                          variant="outline"
                          size="sm"
                          className="border-white/20 text-white hover:text-white bg-red-500/30 hover:bg-red-500/60"
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
                          className="border-white/20 bg-white/10 text-white hover:bg-white/20"
                        >
                          <FaEdit className="mr-1" /> Edit
                        </Button>
                        <Button
                          onClick={handleDeleteClick}
                          disabled={isDeleting}
                          variant="outline"
                          size="sm"
                          className="border-white/20 bg-red-500/50 text-white hover:bg-red-500/70"
                        >
                          <div className="flex items-center"> 
                            <MdDelete className="mr-1" /> Delete
                          </div>
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Button
                      onClick={() => {
                        setIsDialogOpen(false);
                        setIsEditing(false);
                      }}
                      size="sm"
                      className="bg-white text-black hover:bg-gray-200"
                    >
                      Close
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Lead Dialog */}
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
              <span className="text-black font-bold text-sm">👤</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                Add New Lead
              </h2>
              <p className="text-gray-400">
                Enter the lead's information
              </p>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Full Name *</label>
              <Input
                value={newLead.name}
                onChange={(e) => setNewLead({...newLead, name: e.target.value})}
                className="bg-white/10 border-white/20 text-white"
                placeholder="Enter full name"
                required
              />
            </div>
            
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Email *</label>
              <Input
                value={newLead.email}
                onChange={(e) => setNewLead({...newLead, email: e.target.value})}
                className="bg-white/10 border-white/20 text-white"
                placeholder="Enter email address"
                type="email"
              />
            </div>
            
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Phone</label>
              <Input
                value={newLead.phone}
                onChange={(e) => setNewLead({...newLead, phone: e.target.value})}
                className="bg-white/10 border-white/20 text-white"
                placeholder="Enter phone number"
                required
              />
            </div>
            
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Source</label>
              <Input
                value={newLead.source}
                onChange={(e) => setNewLead({...newLead, source: e.target.value})}
                className="bg-white/10 border-white/20 text-white"
                placeholder="Enter source"
              />
            </div>
            
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Experience Level</label>
              <Input
                value={newLead.experienceLevel}
                onChange={(e) => setNewLead({...newLead, experienceLevel: e.target.value})}
                className="bg-white/10 border-white/20 text-white"
                placeholder="Enter experience level"
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
              onClick={() => createNewLead(newLead)}
              disabled={isCreating || !newLead.name || !newLead.phone}
              className="bg-white text-black hover:bg-gray-200"
            >
              {isCreating ? 'Creating...' : 'Submit'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
)}

      {/* Floating elements */}
      <div className={`absolute top-1/4 left-1/4 w-2 h-2 bg-white/20 rounded-full animate-pulse ${isDialogOpen ? 'blur-sm' : ''}`} />
      <div className={`absolute top-1/3 right-1/3 w-1 h-1 bg-white/30 rounded-full animate-pulse delay-1000 ${isDialogOpen ? 'blur-sm' : ''}`} />
      <div className={`absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-white/15 rounded-full animate-pulse delay-500 ${isDialogOpen ? 'blur-sm' : ''}`} />
      
      {/* Toast Container */}
      <ToastContainer />
      
      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showConfirmDelete}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Delete Lead"
        message={`Are you sure you want to delete ${selectedLead?.name}? This action cannot be undone and will permanently remove all associated data.`}
        confirmText="Delete Lead"
        cancelText="Cancel"
        type="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default Leads;