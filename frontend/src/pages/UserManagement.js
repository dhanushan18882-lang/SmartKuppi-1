import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Plus, Filter, MoreVertical, Mail, Phone,
  UserCheck, UserX, Trash2, Edit2, Shield, User,
  GraduationCap, CheckCircle, XCircle, Clock, ChevronLeft,
  ArrowUpRight, Download, X, Award, BookOpen, Briefcase,
  Building2, Calendar, Globe, Save, AlertCircle, Eye, EyeOff
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000/api';

const UserManagement = ({ onBack }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Add User Form State
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'student',
    // Student fields
    studentId: '',
    university: '',
    faculty: '',
    academicYear: '',
    // Tutor fields
    qualifications: '',
    specialization: '',
    yearsOfExperience: '',
    bio: '',
    linkedin: '',
    subjects: []
  });

  const universities = [
    'Sri Lanka Institute of Information Technology - SLIIT',
    'University of Colombo',
    'University of Peradeniya',
    'University of Kelaniya',
    'University of Sri Jayewardenepura',
    'University of Moratuwa',
    'Open University of Sri Lanka',
    'Other'
  ];

  const faculties = [
    'Faculty of Computing',
    'School of Business',
    'Faculty of Engineering',
    'School of Architecture',
    'Faculty of Humanities & Sciences',
    'Faculty of Graduate Studies',
    'Other'
  ];

  const subjectsList = [
    'Mathematics', 'Physics', 'Chemistry', 'Biology',
    'Computer Science', 'Programming', 'Database Systems',
    'Web Development', 'Networking', 'English',
    'Economics', 'Accounting'
  ];

  const academicYears = [
    '1st Year',
    '2nd Year',
    '3rd Year',
    '4th Year',
    'Postgraduate'
  ];

  // Password strength checker
  const checkPasswordStrength = (password) => {
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    
    const passedCount = Object.values(checks).filter(Boolean).length;
    
    let score = 0;
    let text = '';
    let color = '';
    
    if (password.length === 0) {
      text = '';
      score = 0;
    } else if (passedCount <= 2) {
      score = 1;
      text = 'Weak';
      color = 'text-rose-500 bg-rose-50';
    } else if (passedCount === 3) {
      score = 2;
      text = 'Fair';
      color = 'text-amber-500 bg-amber-50';
    } else if (passedCount === 4) {
      score = 3;
      text = 'Good';
      color = 'text-blue-500 bg-blue-50';
    } else {
      score = 4;
      text = 'Strong';
      color = 'text-emerald-500 bg-emerald-50';
    }
    
    return { score, text, color, checks, passedCount };
  };

  const passwordStrength = checkPasswordStrength(newUser.password);
  const passwordsMatch = newUser.password && newUser.confirmPassword && newUser.password === newUser.confirmPassword;

  useEffect(() => {
    fetchUsers();
  }, [searchTerm, roleFilter, statusFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    
    try {
      let url = `${API_BASE_URL}/admin/users?`;
      if (searchTerm) url += `search=${searchTerm}&`;
      if (roleFilter !== 'all') url += `role=${roleFilter}&`;
      if (statusFilter !== 'all') url += `status=${statusFilter}&`;
      
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  // Validation functions
  const validatePhone = (phone) => {
    const phoneRegex = /^0[0-9]{9}$/;
    return phoneRegex.test(phone);
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

    const handleAddUser = async (e) => {
    e.preventDefault();
    setFormError('');

    // Name validation
    if (!newUser.name.trim()) {
        setFormError('Name is required');
        return;
    }

    // Email validation
    if (!newUser.email.trim()) {
        setFormError('Email is required');
        return;
    }
    if (!validateEmail(newUser.email)) {
        setFormError('Please enter a valid email address');
        return;
    }

    // Check if email already exists
    const emailExists = users.some(u => u.email.toLowerCase() === newUser.email.toLowerCase());
    if (emailExists) {
        setFormError('A user with this email already exists');
        return;
    }

    // Password validation
    if (!newUser.password) {
        setFormError('Password is required');
        return;
    }
    if (newUser.password.length < 8) {
        setFormError('Password must be at least 8 characters');
        return;
    }
    if (newUser.password !== newUser.confirmPassword) {
        setFormError('Passwords do not match');
        return;
    }

    // Password strength validation
    if (passwordStrength.passedCount < 3) {
        setFormError('Password is too weak. Please use at least 8 characters with uppercase, lowercase, number, or special character.');
        return;
    }

    // Phone validation
    if (!newUser.phone.trim()) {
        setFormError('Phone number is required');
        return;
    }
    if (!validatePhone(newUser.phone)) {
        setFormError('Phone number must start with 0 and be exactly 10 digits (e.g., 0712345678)');
        return;
    }

    // Student validation
    if (newUser.role === 'student') {
        if (!newUser.studentId.trim()) {
        setFormError('Student ID is required');
        return;
        }
        if (!newUser.university) {
        setFormError('University is required');
        return;
        }
        if (!newUser.faculty) {
        setFormError('Faculty is required');
        return;
        }
        if (!newUser.academicYear) {
        setFormError('Academic Year is required');
        return;
        }
    }

    // Tutor validation
    if (newUser.role === 'tutor') {
        if (!newUser.qualifications.trim()) {
        setFormError('Qualifications are required');
        return;
        }
        if (!newUser.specialization.trim()) {
        setFormError('Specialization is required');
        return;
        }
        if (!newUser.yearsOfExperience) {
        setFormError('Years of Experience is required');
        return;
        }
        if (!newUser.bio.trim()) {
        setFormError('Bio/Introduction is required');
        return;
        }
    }

    setFormLoading(true);
    const token = localStorage.getItem('token');

    const userToSend = { ...newUser };
    delete userToSend.confirmPassword;

    if (userToSend.role === 'tutor') {
    userToSend.status = 'approved'; // Admin-created tutors are automatically approved
    } else if (userToSend.role === 'student') {
    userToSend.status = 'active';
    } else if (userToSend.role === 'admin') {
    userToSend.status = 'active';
    }

    try {
        const response = await fetch(`${API_BASE_URL}/admin/users`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userToSend)
        });
        
        const data = await response.json();
        
        if (data.success) {
        setShowAddModal(false);
        fetchUsers();
        setNewUser({
            name: '', email: '', password: '', confirmPassword: '', phone: '', role: 'student',
            studentId: '', university: '', faculty: '', department: '', academicYear: '',
            qualifications: '', specialization: '', yearsOfExperience: '', bio: '', linkedin: '', subjects: []
        });
        } else {
        setFormError(data.message || 'Failed to create user');
        }
    } catch (error) {
        setFormError('Network error. Please try again.');
    } finally {
        setFormLoading(false);
    }
    };

  const handleToggleStatus = async (userId, currentStatus) => {
    const token = localStorage.getItem('token');
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/toggle-status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        fetchUsers();
      }
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to permanently delete this user? This action cannot be undone.')) return;
    
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      if (data.success) {
        fetchUsers();
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return <Shield className="h-4 w-4 text-rose-500" />;
      case 'tutor': return <GraduationCap className="h-4 w-4 text-brand-500" />;
      default: return <User className="h-4 w-4 text-slate-400" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Active</span>;
      case 'suspended':
        return <span className="px-2.5 py-0.5 bg-rose-100 text-rose-700 text-[10px] font-bold rounded-full flex items-center gap-1"><XCircle className="h-3 w-3" /> Suspended</span>;
      case 'pending':
        return <span className="px-2.5 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-full flex items-center gap-1"><Clock className="h-3 w-3" /> Pending</span>;
      default:
        return null;
    }
  };

  const filteredUsers = users;

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="max-w-7xl mx-auto space-y-8"
      >
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack}
              className="p-2 hover:bg-white border border-transparent hover:border-slate-200 rounded-xl transition-all text-slate-500"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">User Management</h1>
              <p className="text-slate-500 mt-1">View and manage all registered users on the platform.</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
              <Download className="h-4 w-4" /><span>Export CSV</span>
            </button>
            <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all shadow-md shadow-blue-500/20"
            >
            <Plus className="h-4 w-4" /><span>Add New User</span>
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Users', value: users.length, color: 'text-slate-900' },
            { label: 'Students', value: users.filter(u => u.role === 'student').length, color: 'text-brand-600' },
            { label: 'Tutors', value: users.filter(u => u.role === 'tutor').length, color: 'text-violet-600' },
            { label: 'Suspended', value: users.filter(u => u.status === 'suspended').length, color: 'text-rose-600' },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Filters & Search */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input 
                type="text" 
                placeholder="Search by name or email..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-2xl focus:outline-none transition-all text-sm"
                />
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center bg-slate-50 rounded-2xl px-3 border-2 border-transparent">
                <Filter className="h-4 w-4 text-slate-400 mr-2" />
                <select 
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="bg-transparent py-3 text-sm font-medium text-slate-700 focus:outline-none"
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Admins</option>
                  <option value="tutor">Tutors</option>
                  <option value="student">Students</option>
                </select>
              </div>
              <div className="flex items-center bg-slate-50 rounded-2xl px-3 border-2 border-transparent">
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-transparent py-3 text-sm font-medium text-slate-700 focus:outline-none"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
              <button 
                onClick={() => { setSearchTerm(''); setRoleFilter('all'); setStatusFilter('all'); }}
                className="px-4 py-3 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">User Details</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Role</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Joined Date</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Last Active</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                  </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4"><div className="h-10 w-40 bg-slate-100 rounded-lg"></div></td>
                      <td className="px-6 py-4"><div className="h-6 w-20 bg-slate-100 rounded-full"></div></td>
                      <td className="px-6 py-4"><div className="h-6 w-20 bg-slate-100 rounded-full"></div></td>
                      <td className="px-6 py-4"><div className="h-4 w-24 bg-slate-100 rounded-md"></div></td>
                      <td className="px-6 py-4"><div className="h-4 w-24 bg-slate-100 rounded-md"></div></td>
                      <td className="px-6 py-4 text-right"><div className="h-8 w-8 bg-slate-100 rounded-lg ml-auto"></div></td>
                    </tr>
                  ))
                ) : filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs border border-slate-200">
                            {user.name?.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">{user.name}</p>
                            <p className="text-[10px] text-slate-400 font-medium">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          {getRoleIcon(user.role)}
                          <span className="text-xs font-semibold text-slate-600 capitalize">{user.role}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(user.status)}</td>
                      <td className="px-6 py-4 text-sm text-slate-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-sm text-slate-500">{user.lastActive || 'Recently'}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleToggleStatus(user._id, user.status)}
                            className={`p-2 rounded-lg transition-colors ${user.status === 'active' ? 'text-amber-600 hover:bg-amber-50' : 'text-emerald-600 hover:bg-emerald-50'}`}
                            title={user.status === 'active' ? 'Suspend User' : 'Activate User'}
                          >
                            {user.status === 'active' ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                          </button>
                          <button 
                            onClick={() => handleDeleteUser(user._id)}
                            className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" 
                            title="Delete User"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-20 text-center">
                      <div className="max-w-xs mx-auto">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Search className="h-8 w-8 text-slate-300" />
                        </div>
                        <h3 className="text-slate-900 font-bold">No users found</h3>
                        <p className="text-slate-500 text-sm mt-1">We couldn't find any users matching your current search or filters.</p>
                        <button 
                          onClick={() => { setSearchTerm(''); setRoleFilter('all'); setStatusFilter('all'); }}
                          className="mt-4 text-brand-600 font-bold text-sm hover:underline"
                        >
                          Clear all filters
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Footer */}
          <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500">
              Showing <span className="text-slate-900">{filteredUsers.length}</span> of <span className="text-slate-900">{users.length}</span> users
            </p>
          </div>
        </div>
      </motion.div>

      {/* Add User Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white border-b border-slate-100 p-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-900">Add New User</h2>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleAddUser} className="p-6 space-y-6">
                {formError && (
                  <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-center gap-3 text-rose-600">
                    <AlertCircle className="h-5 w-5" />
                    <p className="text-sm font-medium">{formError}</p>
                  </div>
                )}

                {/* Basic Info - Always visible */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-1 block">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={newUser.name}
                        onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-brand-500 rounded-xl focus:outline-none transition-all"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-1 block">Email *</label>
                      <input
                        type="email"
                        required
                        value={newUser.email}
                        onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-brand-500 rounded-xl focus:outline-none transition-all"
                        placeholder="user@example.com"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-1 block">Password *</label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          value={newUser.password}
                          onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                          className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-brand-500 rounded-xl focus:outline-none transition-all pr-10"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {newUser.password && (
                        <div className="mt-2">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                className={`h-full transition-all duration-300 ${
                                  passwordStrength.score === 1 ? 'w-1/4 bg-rose-500' :
                                  passwordStrength.score === 2 ? 'w-2/4 bg-amber-500' :
                                  passwordStrength.score === 3 ? 'w-3/4 bg-blue-500' :
                                  passwordStrength.score === 4 ? 'w-full bg-emerald-500' : 'w-0'
                                }`}
                              />
                            </div>
                            {passwordStrength.text && (
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${passwordStrength.color}`}>
                                {passwordStrength.text}
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400 mt-1">Use 8+ chars with uppercase, lowercase, number, or special character</p>
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-1 block">Confirm Password *</label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          required
                          value={newUser.confirmPassword}
                          onChange={(e) => setNewUser({...newUser, confirmPassword: e.target.value})}
                          className={`w-full px-4 py-3 bg-slate-50 border-2 rounded-xl focus:outline-none transition-all pr-10 ${
                            newUser.confirmPassword && !passwordsMatch
                              ? 'border-rose-300 focus:border-rose-500'
                              : newUser.confirmPassword && passwordsMatch
                              ? 'border-emerald-300 focus:border-emerald-500'
                              : 'border-transparent focus:border-brand-500'
                          }`}
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {newUser.confirmPassword && (
                        <p className={`text-[10px] mt-1 ${passwordsMatch ? 'text-emerald-600' : 'text-rose-500'}`}>
                          {passwordsMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-1 block">Phone *</label>
                      <input
                        type="tel"
                        required
                        value={newUser.phone}
                        onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-brand-500 rounded-xl focus:outline-none transition-all"
                        placeholder="0712345678"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">Must start with 0 and be exactly 10 digits</p>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-1 block">Role *</label>
                      <select
                        value={newUser.role}
                        onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-brand-500 rounded-xl focus:outline-none transition-all"
                      >
                        <option value="student">Student</option>
                        <option value="tutor">Tutor</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Student Specific Fields */}
                {newUser.role === 'student' && (
                  <div className="space-y-4 border-t border-slate-100 pt-4">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Academic Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-1 block">Student ID</label>
                        <input
                          type="text"
                          value={newUser.studentId}
                          onChange={(e) => setNewUser({...newUser, studentId: e.target.value})}
                          className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-brand-500 rounded-xl focus:outline-none transition-all"
                          placeholder="IT20XXXXXX"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-1 block">University</label>
                        <select
                          value={newUser.university}
                          onChange={(e) => setNewUser({...newUser, university: e.target.value})}
                          className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-brand-500 rounded-xl focus:outline-none transition-all"
                        >
                          <option value="">Select University</option>
                          {universities.map(uni => <option key={uni} value={uni}>{uni}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-1 block">Faculty</label>
                        <select
                          value={newUser.faculty}
                          onChange={(e) => setNewUser({...newUser, faculty: e.target.value})}
                          className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-brand-500 rounded-xl focus:outline-none transition-all"
                        >
                          <option value="">Select Faculty</option>
                          {faculties.map(fac => <option key={fac} value={fac}>{fac}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-1 block">Academic Year</label>
                        <select
                          value={newUser.academicYear}
                          onChange={(e) => setNewUser({...newUser, academicYear: e.target.value})}
                          className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-brand-500 rounded-xl focus:outline-none transition-all"
                        >
                          <option value="">Select Year</option>
                          {academicYears.map(year => <option key={year} value={year}>{year}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tutor Specific Fields */}
                {newUser.role === 'tutor' && (
                  <div className="space-y-4 border-t border-slate-100 pt-4">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Professional Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-1 block">Qualifications</label>
                        <input
                          type="text"
                          value={newUser.qualifications}
                          onChange={(e) => setNewUser({...newUser, qualifications: e.target.value})}
                          className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-brand-500 rounded-xl focus:outline-none transition-all"
                          placeholder="B.Sc. in Computer Science"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-1 block">Specialization</label>
                        <input
                          type="text"
                          value={newUser.specialization}
                          onChange={(e) => setNewUser({...newUser, specialization: e.target.value})}
                          className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-brand-500 rounded-xl focus:outline-none transition-all"
                          placeholder="Web Development"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-1 block">Years of Experience</label>
                        <input
                          type="number"
                          value={newUser.yearsOfExperience}
                          onChange={(e) => setNewUser({...newUser, yearsOfExperience: e.target.value})}
                          className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-brand-500 rounded-xl focus:outline-none transition-all"
                          placeholder="3"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-1 block">Bio / Introduction</label>
                        <textarea
                          rows={3}
                          value={newUser.bio}
                          onChange={(e) => setNewUser({...newUser, bio: e.target.value})}
                          className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-brand-500 rounded-xl focus:outline-none transition-all resize-none"
                          placeholder="Tell us about your teaching style..."
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-1 block">LinkedIn Profile</label>
                        <input
                          type="url"
                          value={newUser.linkedin}
                          onChange={(e) => setNewUser({...newUser, linkedin: e.target.value})}
                          className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-brand-500 rounded-xl focus:outline-none transition-all"
                          placeholder="https://linkedin.com/in/..."
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-1 block">Subjects you can teach</label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {subjectsList.map(subject => (
                            <label key={subject} className="flex items-center space-x-2 cursor-pointer p-2 hover:bg-slate-50 rounded-lg transition-colors">
                              <input
                                type="checkbox"
                                checked={newUser.subjects.includes(subject)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setNewUser({...newUser, subjects: [...newUser.subjects, subject]});
                                  } else {
                                    setNewUser({...newUser, subjects: newUser.subjects.filter(s => s !== subject)});
                                  }
                                }}
                                className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                              />
                              <span className="text-sm text-slate-600">{subject}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Admin - No additional fields */}

                {/* Form Actions */}
                <div className="flex gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-3 bg-white border-2 border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {formLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Save className="h-4 w-4" />}
                    {formLoading ? 'Creating...' : 'Create User'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default UserManagement;