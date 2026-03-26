// src/pages/TutorDashboard.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layout, Users, BookOpen, Calendar, Bell, Clock, BarChart3,
  Plus, ArrowUpRight, Video, MessageSquare, DollarSign,
  Settings, LogOut, Menu, X, FileText, Search, Star, AlertCircle,
  ChevronDown, Mail, Phone, Award, CheckCircle, XCircle, GraduationCap,
  FolderOpen, Inbox, Edit3
} from 'lucide-react';

import TutorCourses from './TutorCourses';
import TutorCourseCreate from './TutorCourseCreate';
import TutorMessages from './TutorMessages';
import TutorSchedule from './TutorSchedule';

const API_BASE_URL = 'http://localhost:5000/api';

const TutorDashboard = ({ initialView = 'dashboard' }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [profileDropdown, setProfileDropdown] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [activeView, setActiveView] = useState(initialView);
  const [tutor, setTutor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tutorStatus, setTutorStatus] = useState('approved');
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCourses: 0,
    totalResources: 0,
    rating: 0
  });
  const [upcomingLessons, setUpcomingLessons] = useState([]);
  const [unreadMessages, setUnreadMessages] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (!userData || !token) {
      navigate('/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== 'tutor') {
        navigate('/');
        return;
      }
      setTutor(parsedUser);
      setTutorStatus(parsedUser.status);

      if (parsedUser.status === 'approved') {
        fetchDashboardData(parsedUser.id, token);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error:', error);
      navigate('/login');
    }
  }, [navigate]);

  const fetchDashboardData = async (tutorId, token) => {
    setLoading(true);
    try {
      // Fetch tutor's courses
      const coursesRes = await fetch(`${API_BASE_URL}/courses/tutor/courses`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const coursesData = await coursesRes.json();
      if (coursesData.success) {
        const courses = coursesData.data;
        const totalStudents = courses.reduce((sum, c) => sum + (c.enrolledCount || 0), 0);
        setStats({
          totalStudents,
          totalCourses: courses.length,
          totalResources: 0,
          rating: 4.9
        });
      }

      // Fetch unread messages
      const inboxRes = await fetch(`${API_BASE_URL}/messages/inbox`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const inboxData = await inboxRes.json();
      if (inboxData.success) {
        const unread = inboxData.data.filter(m => !m.read).length;
        setUnreadMessages(unread);
      }

      // Fetch upcoming lessons from all courses
      const allLessons = [];
      const coursesRes2 = await fetch(`${API_BASE_URL}/courses/tutor/courses`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const coursesData2 = await coursesRes2.json();
      if (coursesData2.success) {
        for (const course of coursesData2.data) {
          const lessonsRes = await fetch(`${API_BASE_URL}/lessons/courses/${course._id}/lessons`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const lessonsData = await lessonsRes.json();
          if (lessonsData.success) {
            const today = new Date().toISOString().split('T')[0];
            const todayLessons = lessonsData.data.filter(l => l.date.split('T')[0] === today);
            allLessons.push(...todayLessons.map(l => ({
              id: l._id,
              title: l.title,
              course: course.title,
              date: l.date,
              time: new Date(l.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              students: course.enrolledCount || 0,
              meetingLink: l.meetingLink
            })));
          }
        }
        setUpcomingLessons(allLessons);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Fallback mock data
      setStats({
        totalStudents: 156,
        totalCourses: 5,
        totalResources: 28,
        rating: 4.9
      });
      setUpcomingLessons([
        { id: 1, title: 'Advanced JavaScript', course: 'JavaScript Mastery', date: new Date().toISOString(), time: '10:00 AM', students: 12, meetingLink: 'https://meet.google.com/xxx' },
        { id: 2, title: 'React Hooks Deep Dive', course: 'React Masterclass', date: new Date().toISOString(), time: '02:00 PM', students: 8, meetingLink: 'https://zoom.us/j/123' }
      ]);
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'T';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Morning';
    if (hour < 18) return 'Afternoon';
    return 'Evening';
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Pending screen
  // ─────────────────────────────────────────────────────────────────────────
  if (tutorStatus === 'pending') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center border border-slate-100"
        >
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="h-10 w-10 text-amber-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Application Pending</h2>
          <p className="text-slate-600 mb-8">
            Your tutor application is currently under review. You'll receive an email once your account is approved.
          </p>
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 mb-8">
            <p className="text-sm text-amber-800 font-medium">
              Estimated review time: 2-3 business days
            </p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20"
          >
            Back to Home
          </button>
        </motion.div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Suspended screen
  // ─────────────────────────────────────────────────────────────────────────
  if (tutorStatus === 'suspended') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center border border-slate-100"
        >
          <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="h-10 w-10 text-rose-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Account Suspended</h2>
          <p className="text-slate-600 mb-8">
            Your account has been suspended. Please contact the administrator for more information.
          </p>
          <button
            onClick={() => navigate('/contact')}
            className="w-full bg-rose-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-rose-700 transition-all shadow-lg shadow-rose-600/20"
          >
            Contact Support
          </button>
        </motion.div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Loading spinner
  // ─────────────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    { title: 'Total Students', value: stats.totalStudents, change: '+8 this month', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Courses', value: stats.totalCourses, change: '+2 new', icon: FolderOpen, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { title: 'Resources', value: stats.totalResources, change: '+5 new', icon: FileText, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: 'Rating', value: stats.rating.toFixed(1), change: `⭐ ${stats.rating}/5`, icon: Star, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  const DashboardView = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl shadow-indigo-500/20">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="px-2 py-0.5 bg-white/20 rounded-full text-[10px] font-bold uppercase tracking-widest backdrop-blur-sm">Tutor Premium</span>
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Live</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight">Good {getTimeOfDay()}, {tutor?.name?.split(' ')[0] || 'Tutor'}! 👋</h2>
            <p className="text-indigo-100 mt-2 max-w-md font-medium opacity-90">
              You have {upcomingLessons.length} lessons today. Your overall rating is {stats.rating.toFixed(1)}/5.0. Keep inspiring!
            </p>
          </div>
          <button
            onClick={() => setActiveView('create-course')}
            className="flex items-center space-x-2 px-6 py-3 bg-white text-indigo-600 rounded-xl font-bold hover:bg-indigo-50 transition-all shadow-lg shadow-indigo-500/20 group"
          >
            <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform" />
            <span>Create New Course</span>
          </button>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="absolute bottom-0 right-10 opacity-10 pointer-events-none"><BookOpen className="w-64 h-64" /></div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.bg} ${stat.color} p-3 rounded-2xl`}><Icon className="h-6 w-6" /></div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">{stat.change}</span>
              </div>
              <p className="text-sm font-medium text-slate-500">{stat.title}</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</h3>
            </div>
          );
        })}
      </div>

      {/* Today's Lessons */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex items-center justify-between">
          <h3 className="font-bold text-slate-900">Today's Lessons</h3>
          <button onClick={() => setActiveView('schedule')} className="text-indigo-600 text-sm font-bold">View Full Schedule</button>
        </div>
        <div className="divide-y divide-slate-50">
          {upcomingLessons.length > 0 ? upcomingLessons.map(lesson => (
            <div key={lesson.id} className="p-6 flex items-center justify-between hover:bg-slate-50">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600"><Video className="h-6 w-6" /></div>
                <div>
                  <h4 className="font-bold text-slate-900">{lesson.title}</h4>
                  <p className="text-sm text-slate-500">Course: {lesson.course} • {lesson.students} enrolled</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-slate-900">{lesson.time}</p>
                {lesson.meetingLink && (
                  <a href={lesson.meetingLink} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block px-3 py-1 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700">Join</a>
                )}
              </div>
            </div>
          )) : <div className="p-12 text-center"><p className="text-slate-500">No lessons scheduled for today</p></div>}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Create Course', icon: Plus, color: 'text-blue-600', bg: 'bg-blue-50', action: () => setActiveView('create-course') },
            { label: 'Schedule', icon: Calendar, color: 'text-indigo-600', bg: 'bg-indigo-50', action: () => setActiveView('schedule') },
            { label: 'Messages', icon: MessageSquare, color: 'text-amber-600', bg: 'bg-amber-50', action: () => setActiveView('messages') },
            { label: 'Settings', icon: Settings, color: 'text-slate-600', bg: 'bg-slate-50', action: () => console.log('Settings') },
          ].map((action, i) => {
            const Icon = action.icon;
            return (
              <button key={i} onClick={action.action} className="group p-6 bg-white border border-slate-100 rounded-3xl hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-500/5 transition-all text-center">
                <div className={`${action.bg} ${action.color} w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="h-6 w-6" />
                </div>
                <span className="text-sm font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">{action.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );

  const navLinks = [
    { name: 'Dashboard', icon: Layout, view: 'dashboard', isActive: activeView === 'dashboard' },
    { name: 'My Courses', icon: FolderOpen, view: 'courses', isActive: activeView === 'courses' },
    { name: 'Schedule', icon: Calendar, view: 'schedule', isActive: activeView === 'schedule' },
    { name: 'Create Course', icon: Plus, view: 'create-course', isActive: activeView === 'create-course' },
    { name: 'Messages', icon: MessageSquare, view: 'messages', isActive: activeView === 'messages', badge: unreadMessages },
    { name: 'Resources', icon: FileText, view: 'resources', isActive: false },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 transition-transform duration-300 lg:translate-x-0 lg:static ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="h-20 flex items-center px-6 border-b border-slate-800">
            <Link to="/tutor-dashboard" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-xl text-white tracking-tight">Smart<span className="text-indigo-400">Kuppi</span></span>
                <span className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">Tutor Portal</span>
              </div>
            </Link>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white"><X className="h-6 w-6" /></button>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            <p className="px-2 mb-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Tutor Menu</p>
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => link.view && setActiveView(link.view)}
                className={`flex items-center justify-between w-full px-4 py-3 rounded-xl transition-all text-left ${link.isActive ? 'bg-indigo-600/10 text-indigo-600 font-medium' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
              >
                <div className="flex items-center space-x-3">
                  <link.icon className="h-5 w-5" />
                  <span>{link.name}</span>
                </div>
                {link.badge > 0 && (
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-500 text-white rounded-full">{link.badge}</span>
                )}
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-slate-800">
            <button onClick={handleLogout} className="flex items-center space-x-3 px-4 py-3 w-full text-slate-400 hover:text-rose-400 hover:bg-rose-400/10 rounded-xl transition-all">
              <LogOut className="h-5 w-5" /><span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-30">
          <div className="flex items-center space-x-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden p-2 text-slate-600">
              {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>

          </div>
          <div className="flex items-center space-x-4">
            <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="h-8 w-px bg-slate-200"></div>
            <div className="relative">
              <button onClick={() => setProfileDropdown(!profileDropdown)} className="flex items-center space-x-3 p-1.5 hover:bg-slate-100 rounded-xl transition-colors">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">{tutor ? getInitials(tutor.name) : 'T'}</div>
                <span className="hidden md:block text-sm font-medium text-slate-700">{tutor?.name || 'Tutor'}</span>
                <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${profileDropdown ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {profileDropdown && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50">
                    <div className="px-4 py-3 border-b border-slate-50"><p className="text-sm font-semibold text-slate-800">{tutor?.name}</p><p className="text-xs text-slate-500">{tutor?.email}</p></div>
                    <div className="p-1"><button className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-xl"><Users className="h-4 w-4" /><span>My Profile</span></button>
                      <button className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-xl"><Settings className="h-4 w-4" /><span>Account Settings</span></button></div>
                    <div className="p-1 border-t border-slate-50"><button onClick={handleLogout} className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 rounded-xl"><LogOut className="h-4 w-4" /><span>Sign Out</span></button></div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          <AnimatePresence mode="wait">
            {activeView === 'dashboard' && <DashboardView key="dashboard" />}
            {activeView === 'courses' && (
              <TutorCourses
                key="courses"
                onBack={(view) => {
                  if (view === 'create-course') {
                    setActiveView('create-course');
                  } else {
                    setActiveView('dashboard');
                  }
                }}
              />
            )}
            {activeView === 'schedule' && <TutorSchedule key="schedule" onBack={() => setActiveView('dashboard')} />}
            {activeView === 'create-course' && <TutorCourseCreate key="create-course" onBack={() => setActiveView('dashboard')} />}
            {activeView === 'messages' && <TutorMessages key="messages" onBack={() => setActiveView('dashboard')} />}
          </AnimatePresence>
        </main>

        <footer className="bg-white border-t border-slate-100 py-6 px-8">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-2"><BookOpen className="h-5 w-5 text-indigo-500" /><span className="font-bold text-slate-900">Smart<span className="text-indigo-500">Kuppi</span></span><span className="text-xs text-slate-400 ml-2">© 2024 Tutor Portal v1.2</span></div>
            <div className="flex items-center space-x-6 text-xs font-bold text-slate-400 uppercase tracking-widest"><button className="hover:text-indigo-500">Tutor Guide</button><button className="hover:text-indigo-500">Support</button><button className="hover:text-indigo-500">Privacy</button></div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default TutorDashboard;