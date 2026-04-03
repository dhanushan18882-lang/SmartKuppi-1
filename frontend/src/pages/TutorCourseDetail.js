// src/pages/TutorCourseDetail.js
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Layout, Users, BookOpen, Calendar, Bell, Clock, BarChart3,
  Plus, ArrowUpRight, Video, MessageSquare, DollarSign, 
  Settings, LogOut, Menu, X, FileText, Search, Star, AlertCircle,
  ChevronDown, Mail, Phone, Award, CheckCircle, XCircle, GraduationCap,
  FolderOpen, Inbox, Edit3, Upload, Download, ExternalLink, MoreVertical
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000/api';

const TutorCourseDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [profileDropdown, setProfileDropdown] = useState(false);
  const [tutor, setTutor] = useState(null);
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [resources, setResources] = useState([]);
  const [students, setStudents] = useState([]);
  const [activeTab, setActiveTab] = useState('lessons');
  const [loading, setLoading] = useState(true);
  const [unreadMessages, setUnreadMessages] = useState(0);

  // Check authentication
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
      fetchUnreadMessages(token);
    } catch (error) {
      console.error('Error:', error);
      navigate('/login');
    }
  }, [navigate]);

  const fetchUnreadMessages = async (token) => {
    try {
      const inboxRes = await fetch(`${API_BASE_URL}/messages/inbox`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const inboxData = await inboxRes.json();
      if (inboxData.success) {
        const unread = inboxData.data.filter(m => !m.read).length;
        setUnreadMessages(unread);
      }
    } catch (error) {
      console.error('Error fetching unread messages:', error);
    }
  };

  const fetchCourseData = useCallback(async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      // Fetch course details
      const courseRes = await fetch(`${API_BASE_URL}/courses/${courseId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const courseData = await courseRes.json();
      if (courseData.success) setCourse(courseData.data);

      // Fetch lessons
      const lessonsRes = await fetch(`${API_BASE_URL}/lessons/courses/${courseId}/lessons`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const lessonsData = await lessonsRes.json();
      if (lessonsData.success) setLessons(lessonsData.data);

      // Fetch resources
      const resourcesRes = await fetch(`${API_BASE_URL}/resources/courses/${courseId}/resources`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const resourcesData = await resourcesRes.json();
      if (resourcesData.success) setResources(resourcesData.data);

      // Fetch enrolled students
      const studentsRes = await fetch(`${API_BASE_URL}/enrollments/courses/${courseId}/students`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const studentsData = await studentsRes.json();
      if (studentsData.success) setStudents(studentsData.data);
    } catch (error) {
      console.error('Error fetching course data:', error);
    } finally {
      setLoading(false);
    }
  }, [courseId, navigate]);

  useEffect(() => {
    fetchCourseData();
  }, [fetchCourseData]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'T';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const formatTime = (dateStr) => {
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const navLinks = [
    { name: 'Dashboard', icon: Layout, path: '/tutor-dashboard' },
    { name: 'My Courses', icon: FolderOpen, path: '/tutor/courses' },
    { name: 'Schedule', icon: Calendar, path: '/tutor/schedule' },
    { name: 'Create Course', icon: Plus, path: '/tutor/create-course' },
    { name: 'Messages', icon: MessageSquare, path: '/tutor/messages', badge: unreadMessages },
    { name: 'Resources', icon: FileText, path: '/tutor/resources' },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-500">Course not found.</p>
          <button onClick={() => navigate('/tutor/courses')} className="mt-4 text-indigo-600 hover:underline">
            Back to My Courses
          </button>
        </div>
      </div>
    );
  }

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
            {navLinks.map((link) => {
              const isActive = link.path === `/tutor/courses/${courseId}` ? false : window.location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`flex items-center justify-between w-full px-4 py-3 rounded-xl transition-all text-left ${
                    isActive ? 'bg-indigo-600/10 text-indigo-600 font-medium' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <link.icon className="h-5 w-5" />
                    <span>{link.name}</span>
                  </div>
                  {link.badge > 0 && (
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-500 text-white rounded-full">{link.badge}</span>
                  )}
                </Link>
              );
            })}
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
            <div className="hidden md:flex items-center bg-slate-100 rounded-xl px-4 py-2 w-64 lg:w-96">
              <Search className="h-4 w-4 text-slate-400 mr-2" />
              <input type="text" placeholder="Search students, courses..." className="bg-transparent border-none focus:ring-0 text-sm w-full" />
            </div>
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
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">{course.title}</h1>
                <p className="text-slate-500 mt-1">{course.subject} • {course.enrolledCount || 0} students enrolled</p>
              </div>
              <div className="flex gap-3">
                <Link
                  to={`/tutor/courses/${courseId}/edit`}
                  className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all duration-200 shadow-lg shadow-indigo-200"
                >
                  <Edit3 className="h-4 w-4" />
                  <span>Edit Course Content</span>
                </Link>
                <Link
                  to={`/tutor/create-lesson?course=${courseId}`}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-xl text-sm font-semibold hover:bg-indigo-100 transition-all duration-200"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Lesson</span>
                </Link>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="border-b border-slate-100">
                <div className="flex gap-2 p-2">
                  {['lessons', 'resources', 'students'].map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === tab ? 'bg-indigo-50 text-indigo-600 border-b-2 border-indigo-500' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                      {tab === 'lessons' && <><Video className="h-4 w-4 inline mr-2" />Lessons ({lessons.length})</>}
                      {tab === 'resources' && <><FileText className="h-4 w-4 inline mr-2" />Resources ({resources.length})</>}
                      {tab === 'students' && <><Users className="h-4 w-4 inline mr-2" />Students ({students.length})</>}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-6">
                {/* Lessons Tab */}
                {activeTab === 'lessons' && (
                  <div className="space-y-4">
                    {lessons.length > 0 ? (
                      lessons.map(lesson => (
                        <div key={lesson._id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:shadow-md transition-all">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-4">
                               <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm"><Video className="h-6 w-6" /></div>
                               <div>
                                 <h3 className="font-bold text-slate-900">{lesson.title}</h3>
                                 <div className="flex items-center gap-4 text-xs text-slate-500 mt-1">
                                   <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(lesson.date).toLocaleDateString()}</span>
                                   <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {formatTime(lesson.date)}</span>
                                   <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {lesson.duration} min</span>
                                 </div>
                               </div>
                            </div>
                            <div className="flex gap-2">
                              <a href={lesson.meetingLink} target="_blank" rel="noopener noreferrer" className="px-5 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-md">
                                Start Session
                              </a>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400"><Video className="h-8 w-8" /></div>
                        <p className="text-slate-500 font-medium">No lessons scheduled yet.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Resources Tab */}
                {activeTab === 'resources' && (
                  <div className="space-y-4">
                    {resources.length > 0 ? (
                      resources.map(res => (
                        <div key={res._id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between hover:shadow-md transition-all">
                          <div className="flex items-center gap-4">
                             <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-emerald-600 shadow-sm"><FileText className="h-6 w-6" /></div>
                             <div>
                               <h4 className="font-bold text-slate-900">{res.title}</h4>
                               <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider">{res.fileType?.toUpperCase() || 'FILE'} • {res.downloads} downloads</p>
                             </div>
                          </div>
                          <a href={`${API_BASE_URL}${res.fileUrl}`} download className="p-2.5 bg-white text-slate-400 hover:text-indigo-600 rounded-xl transition-all shadow-sm border border-slate-200">
                            <Download className="h-5 w-5" />
                          </a>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12">
                         <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400"><FileText className="h-8 w-8" /></div>
                         <p className="text-slate-500 font-medium">No resources uploaded yet.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Students Tab */}
                {activeTab === 'students' && (
                  <div className="space-y-4">
                    {students.length > 0 ? (
                      students.map(enrollment => (
                        <div key={enrollment._id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between hover:shadow-md transition-all">
                          <div className="flex items-center gap-4">
                             <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-rose-600 shadow-sm"><Users className="h-6 w-6" /></div>
                             <div>
                               <h3 className="font-bold text-slate-900">{enrollment.student?.name || 'Unknown'}</h3>
                               <p className="text-xs text-slate-500 mt-1">{enrollment.student?.email || ''}</p>
                             </div>
                          </div>
                          <Link to={`/tutor/messages?student=${enrollment.student._id}&course=${course._id}`} className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
                            <MessageSquare className="h-3.5 w-3.5 inline mr-1.5" /> Message
                          </Link>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400"><Users className="h-8 w-8" /></div>
                        <p className="text-slate-500 font-medium">No students enrolled yet.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
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

export default TutorCourseDetail;