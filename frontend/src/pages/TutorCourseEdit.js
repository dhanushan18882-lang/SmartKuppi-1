// src/pages/TutorCourseEdit.js
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Layout, Users, BookOpen, Calendar, Bell, Clock, BarChart3,
  Plus, ArrowUpRight, Video, MessageSquare, DollarSign, 
  Settings, LogOut, Menu, X, FileText, Search, Star, AlertCircle,
  ChevronDown, Mail, Phone, Award, CheckCircle, XCircle, GraduationCap,
  FolderOpen, Inbox, Edit3, Upload, ChevronLeft, Save, Download, MoreVertical
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000/api';

const TutorCourseEdit = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [profileDropdown, setProfileDropdown] = useState(false);
  const [tutor, setTutor] = useState(null);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [activeTab, setActiveTab] = useState('general'); // 'general', 'lessons', 'resources'
  const [lessons, setLessons] = useState([]);
  const [resources, setResources] = useState([]);

  // Lesson Edit State
  const [editingLesson, setEditingLesson] = useState(null);
  const [isEditLessonModalOpen, setIsEditLessonModalOpen] = useState(false);
  const [isUpdatingLesson, setIsUpdatingLesson] = useState(false);

  // Resource Edit State
  const [editingResource, setEditingResource] = useState(null);
  const [isEditResourceModalOpen, setIsEditResourceModalOpen] = useState(false);
  const [isUpdatingResource, setIsUpdatingResource] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    description: '',
    price: 0,
    thumbnail: '',
    status: 'published'
  });
  const [errors, setErrors] = useState({});

  const subjects = [
    'Mathematics', 'Physics', 'Chemistry', 'Biology',
    'Computer Science', 'Programming', 'Web Development',
    'Database Systems', 'Networking', 'English Literature',
    'Economics', 'Business Studies', 'Accounting'
  ];

  // Check authentication
  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (!userData || !token) { navigate('/login'); return; }
    try {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== 'tutor') { navigate('/'); return; }
      setTutor(parsedUser);
      fetchUnreadMessages(token);
    } catch (error) { navigate('/login'); }
  }, [navigate]);

  const fetchUnreadMessages = async (token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/messages/inbox`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) setUnreadMessages(data.data.filter(m => !m.read).length);
    } catch (error) {}
  };

  const fetchCourseData = useCallback(async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      // Fetch details
      const cRes = await fetch(`${API_BASE_URL}/courses/${courseId}`, { headers: { Authorization: `Bearer ${token}` } });
      const cData = await cRes.json();
      if (cData.success) {
        setFormData({ title: cData.data.title, subject: cData.data.subject, description: cData.data.description, price: cData.data.price, thumbnail: cData.data.thumbnail || '', status: cData.data.status });
      }

      // Fetch lessons
      const lRes = await fetch(`${API_BASE_URL}/lessons/courses/${courseId}/lessons`, { headers: { Authorization: `Bearer ${token}` } });
      const lData = await lRes.json();
      if (lData.success) setLessons(lData.data);

      // Fetch resources
      const rRes = await fetch(`${API_BASE_URL}/resources/courses/${courseId}/resources`, { headers: { Authorization: `Bearer ${token}` } });
      const rData = await rRes.json();
      if (rData.success) setResources(rData.data);

    } catch (error) { console.error(error); } finally { setLoading(false); }
  }, [courseId]);

  useEffect(() => { if (courseId) fetchCourseData(); }, [courseId, fetchCourseData]);

  const handleSubmitGeneral = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.subject || !formData.description.trim()) { setErrors({ title: !formData.title.trim() ? 'Required' : '', subject: !formData.subject ? 'Required' : '', description: !formData.description.trim() ? 'Required' : '' }); return; }
    setIsSubmitting(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_BASE_URL}/courses/${courseId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(formData) });
      const data = await res.json();
      if (data.success) { setSuccess(true); setTimeout(() => setSuccess(false), 2000); }
    } catch (error) { alert('Failed to update course'); } finally { setIsSubmitting(false); }
  };

  const handleDeleteLesson = async (id) => {
    if (!window.confirm('Delete this lesson?')) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_BASE_URL}/lessons/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if ((await res.json()).success) setLessons(lessons.filter(l => l._id !== id));
    } catch (error) {}
  };

  const handleDeleteResource = async (id) => {
    if (!window.confirm('Delete this resource?')) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_BASE_URL}/resources/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if ((await res.json()).success) setResources(resources.filter(r => r._id !== id));
    } catch (error) {}
  };

  const handleUpdateLesson = async (e) => {
    e.preventDefault();
    setIsUpdatingLesson(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_BASE_URL}/lessons/${editingLesson._id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(editingLesson) });
      const data = await res.json();
      if (data.success) { setLessons(lessons.map(l => l._id === editingLesson._id ? data.data : l)); setIsEditLessonModalOpen(false); }
    } catch (error) {} finally { setIsUpdatingLesson(false); }
  };

  const handleUpdateResource = async (e) => {
    e.preventDefault();
    setIsUpdatingResource(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_BASE_URL}/resources/${editingResource._id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(editingResource) });
      const data = await res.json();
      if (data.success) { setResources(resources.map(r => r._id === editingResource._id ? data.data : r)); setIsEditResourceModalOpen(false); }
    } catch (error) {} finally { setIsUpdatingResource(false); }
  };

  const formatTime = (dateStr) => new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const handleLogout = () => { localStorage.removeItem('user'); localStorage.removeItem('token'); navigate('/login'); };
  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || 'T';

  if (loading) return <div className="flex justify-center items-center min-h-screen"><div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      {/* Sidebar - Consistent with Tutor Portal */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 transition-transform duration-300 lg:translate-x-0 lg:static ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="h-20 flex items-center px-6 border-b border-slate-800">
            <Link to="/tutor-dashboard" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20"><GraduationCap className="h-6 w-6" /></div>
              <div className="flex flex-col"><span className="font-bold text-xl text-white tracking-tight">Smart<span className="text-indigo-400">Kuppi</span></span><span className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">Tutor Portal</span></div>
            </Link>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            <p className="px-2 mb-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Tutor Menu</p>
            {[ {name: 'Dashboard', icon: Layout, path: '/tutor-dashboard'}, {name: 'My Courses', icon: FolderOpen, path: '/tutor/courses'}, {name: 'Schedule', icon: Calendar, path: '/tutor/schedule'}, {name: 'Messages', icon: MessageSquare, path: '/tutor/messages', badge: unreadMessages}, {name: 'Resources', icon: FileText, path: '/tutor/resources'} ].map(l => (
              <Link key={l.name} to={l.path} className="flex items-center justify-between w-full px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all">
                <div className="flex items-center space-x-3"><l.icon className="h-5 w-5" /><span>{l.name}</span></div>
                {l.badge > 0 && <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-500 text-white rounded-full">{l.badge}</span>}
              </Link>
            ))}
          </nav>
          <div className="p-4 border-t border-slate-800"><button onClick={handleLogout} className="flex items-center space-x-3 px-4 py-3 w-full text-slate-400 hover:text-rose-400 hover:bg-rose-400/10 rounded-xl transition-all"><LogOut className="h-5 w-5" /><span>Sign Out</span></button></div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-30">
          <div className="flex items-center space-x-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden p-2 text-slate-600"><Menu className="h-6 w-6" /></button>
            <h2 className="text-lg font-bold text-slate-800">Manage Course</h2>
          </div>
          <div className="flex items-center space-x-3">
             <div className="flex flex-col items-end mr-2 hidden sm:flex"><span className="text-sm font-semibold text-slate-800">{tutor?.name}</span><span className="text-[10px] text-slate-500 uppercase tracking-widest">{tutor?.email}</span></div>
             <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold">{getInitials(tutor?.name)}</div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <button onClick={() => navigate(`/tutor/courses/${courseId}`)} className="flex items-center text-xs font-bold text-indigo-600 uppercase tracking-widest hover:underline mb-2"><ChevronLeft className="h-3 w-3 mr-1" /> Back to Dashboard</button>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">{formData.title || 'Edit Course'}</h1>
              </div>
              <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
                {[ {id: 'general', label: 'Details', icon: Settings}, {id: 'lessons', label: 'Lessons', icon: Video, count: lessons.length}, {id: 'resources', label: 'Resources', icon: FileText, count: resources.length} ].map(t => (
                  <button key={t.id} onClick={() => setActiveTab(t.id)} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === t.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-500 hover:bg-slate-50'}`}>
                    <t.icon className="h-4 w-4" /><span>{t.label}</span>
                    {t.count !== undefined && <span className={`px-2 py-0.5 text-[10px] rounded-full ${activeTab === t.id ? 'bg-indigo-500' : 'bg-slate-100 text-slate-500'}`}>{t.count}</span>}
                  </button>
                ))}
              </div>
            </div>

            <AnimatePresence mode="wait">
              {activeTab === 'general' && (
                <motion.div key="general" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <form onSubmit={handleSubmitGeneral} className="space-y-6">
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden p-8 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-700 uppercase tracking-widest ml-1">Course Title *</label>
                          <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-xl focus:outline-none transition-all" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-700 uppercase tracking-widest ml-1">Subject *</label>
                          <select value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-xl focus:outline-none transition-all">
                            {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                      </div>
                      <div className="space-y-2">
                         <label className="text-xs font-bold text-slate-700 uppercase tracking-widest ml-1">Description *</label>
                         <textarea rows={5} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-xl focus:outline-none transition-all resize-none" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                         <div className="space-y-2">
                           <label className="text-xs font-bold text-slate-700 uppercase tracking-widest ml-1">Price (LKR)</label>
                           <input type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-xl focus:outline-none transition-all" />
                         </div>
                         <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-700 uppercase tracking-widest ml-1">Status</label>
                            <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-xl focus:outline-none transition-all">
                              <option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option>
                            </select>
                         </div>
                         <div className="space-y-2">
                           <label className="text-xs font-bold text-slate-700 uppercase tracking-widest ml-1">Thumbnail URL</label>
                           <input type="url" value={formData.thumbnail} onChange={e => setFormData({...formData, thumbnail: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-xl focus:outline-none transition-all" />
                         </div>
                      </div>
                    </div>
                    <div className="flex justify-end gap-3">
                      <button type="button" onClick={() => navigate(-1)} className="px-8 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-all">Cancel</button>
                      <button type="submit" disabled={isSubmitting} className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-70 flex items-center gap-2">
                        {isSubmitting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Save className="h-4 w-4" />}
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              {activeTab === 'lessons' && (
                <motion.div key="lessons" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-slate-900">Manage Lessons</h2>
                    <Link to={`/tutor/create-lesson?course=${courseId}`} className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-md hover:shadow-lg"><Plus className="h-4 w-4" /> Add Lesson</Link>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    {lessons.length > 0 ? lessons.map(l => (
                      <div key={l._id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-md transition-all">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 font-bold"><Video className="h-6 w-6" /></div>
                          <div><h3 className="font-bold text-slate-900">{l.title}</h3><div className="flex items-center gap-3 text-xs text-slate-500 mt-1"><span>{new Date(l.date).toLocaleDateString()}</span>•<span>{formatTime(l.date)}</span>•<span>{l.duration} min</span></div></div>
                        </div>
                        <div className="flex items-center gap-2">
                           <button onClick={() => { setEditingLesson({...l, date: l.date.split('T')[0], time: new Date(l.date).toTimeString().split(' ')[0].substring(0, 5)}); setIsEditLessonModalOpen(true); }} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"><Edit3 className="h-5 w-5" /></button>
                           <button onClick={() => handleDeleteLesson(l._id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"><XCircle className="h-5 w-5" /></button>
                        </div>
                      </div>
                    )) : <div className="bg-white p-12 rounded-3xl border-2 border-dashed border-slate-100 text-center text-slate-400 font-medium">No lessons added yet.</div>}
                  </div>
                </motion.div>
              )}

              {activeTab === 'resources' && (
                <motion.div key="resources" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-slate-900">Manage Resources</h2>
                    <Link to={`/tutor/upload-resource?course=${courseId}`} className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition-all flex items-center gap-2 shadow-md hover:shadow-lg"><Upload className="h-4 w-4" /> Upload Material</Link>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {resources.length > 0 ? resources.map(r => (
                      <div key={r._id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-md transition-all">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 font-bold"><FileText className="h-6 w-6" /></div>
                          <div className="min-w-0 pr-4"><h3 className="font-bold text-slate-900 truncate">{r.title}</h3><p className="text-xs text-slate-500 mt-1 uppercase tracking-wider">{r.fileType || 'File'} • {r.downloads} downloads</p></div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button onClick={() => { setEditingResource({...r}); setIsEditResourceModalOpen(true); }} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"><Edit3 className="h-4 w-4" /></button>
                          <button onClick={() => handleDeleteResource(r._id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"><XCircle className="h-4 w-4" /></button>
                          <a href={`${API_BASE_URL}${r.fileUrl}`} download className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"><Download className="h-4 w-4" /></a>
                        </div>
                      </div>
                    )) : <div className="bg-white p-12 rounded-3xl border-2 border-dashed border-slate-100 text-center text-slate-400 font-medium w-full col-span-full">No resources uploaded yet.</div>}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Edit Lesson Modal */}
      <AnimatePresence>
        {isEditLessonModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden">
              <form onSubmit={handleUpdateLesson}>
                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between"><h3 className="text-xl font-bold text-slate-900">Edit Lesson</h3><button type="button" onClick={() => setIsEditLessonModalOpen(false)} className="p-2 hover:bg-slate-50 rounded-xl transition-colors"><X className="h-5 w-5 text-slate-400" /></button></div>
                <div className="p-8 space-y-5 max-h-[70vh] overflow-y-auto">
                  <div className="space-y-2"><label className="text-xs font-bold text-slate-700 uppercase tracking-widest ml-1">Lesson Title</label><input type="text" value={editingLesson.title} onChange={e => setEditingLesson({...editingLesson, title: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-xl focus:outline-none transition-all" required /></div>
                  <div className="space-y-2"><label className="text-xs font-bold text-slate-700 uppercase tracking-widest ml-1">Description</label><textarea rows={3} value={editingLesson.description} onChange={e => setEditingLesson({...editingLesson, description: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-xl focus:outline-none transition-all reszie-none" required /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><label className="text-xs font-bold text-slate-700 uppercase tracking-widest ml-1">Date</label><input type="date" value={editingLesson.date} onChange={e => setEditingLesson({...editingLesson, date: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-xl focus:outline-none transition-all" required /></div>
                    <div className="space-y-2"><label className="text-xs font-bold text-slate-700 uppercase tracking-widest ml-1">Time</label><input type="time" value={editingLesson.time} onChange={e => setEditingLesson({...editingLesson, time: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-xl focus:outline-none transition-all" required /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><label className="text-xs font-bold text-slate-700 uppercase tracking-widest ml-1">Duration (min)</label><input type="number" value={editingLesson.duration} onChange={e => setEditingLesson({...editingLesson, duration: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-xl focus:outline-none transition-all" required /></div>
                    <div className="space-y-2"><label className="text-xs font-bold text-slate-700 uppercase tracking-widest ml-1">Meeting Link</label><input type="url" value={editingLesson.meetingLink} onChange={e => setEditingLesson({...editingLesson, meetingLink: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-xl focus:outline-none transition-all" required /></div>
                  </div>
                </div>
                <div className="px-8 py-6 bg-slate-50 flex gap-4"><button type="button" onClick={() => setIsEditLessonModalOpen(false)} className="flex-1 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-100 transition-all">Cancel</button><button type="submit" disabled={isUpdatingLesson} className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-70 flex items-center justify-center gap-2">{isUpdatingLesson ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Save className="h-4 w-4" />}{isUpdatingLesson ? 'Saving...' : 'Save Changes'}</button></div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Resource Modal */}
      <AnimatePresence>
        {isEditResourceModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
              <header className="px-8 py-6 border-b border-slate-100 flex items-center justify-between"><h3 className="text-xl font-bold text-slate-900">Edit Resource</h3><button onClick={() => setIsEditResourceModalOpen(false)} className="p-2 hover:bg-slate-50 rounded-xl transition-colors"><X className="h-5 w-5 text-slate-400" /></button></header>
              <form onSubmit={handleUpdateResource} className="p-8 space-y-5">
                <div className="space-y-2"><label className="text-xs font-bold text-slate-700 uppercase tracking-widest ml-1">Resource Title</label><input type="text" value={editingResource.title} onChange={e => setEditingResource({...editingResource, title: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-xl focus:outline-none transition-all" required /></div>
                <div className="space-y-2"><label className="text-xs font-bold text-slate-700 uppercase tracking-widest ml-1">Description</label><textarea rows={3} value={editingResource.description} onChange={e => setEditingResource({...editingResource, description: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-xl focus:outline-none transition-all reszie-none" /></div>
                <div className="space-y-2"><label className="text-xs font-bold text-slate-700 uppercase tracking-widest ml-1">Category</label><select value={editingResource.category} onChange={e => setEditingResource({...editingResource, category: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-xl focus:outline-none transition-all"><option value="lecture_material">Lecture Material</option><option value="past_paper">Past Paper</option><option value="paper_discussion">Paper Discussion</option><option value="other">Other</option></select></div>
                <div className="flex gap-4 pt-4"><button type="button" onClick={() => setIsEditResourceModalOpen(false)} className="flex-1 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-100 transition-all">Cancel</button><button type="submit" disabled={isUpdatingResource} className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-70 flex items-center justify-center gap-2">{isUpdatingResource ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Save className="h-4 w-4" />}{isUpdatingResource ? 'Saving...' : 'Save Changes'}</button></div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Success Notification */}
      <AnimatePresence>
        {success && (
          <motion.div initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 100 }} className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] bg-emerald-600 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3">
            <CheckCircle className="h-6 w-6" />
            <span className="font-bold">Course settings saved successfully!</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TutorCourseEdit;
