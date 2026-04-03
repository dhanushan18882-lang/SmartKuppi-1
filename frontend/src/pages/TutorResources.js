// src/pages/TutorResources.js
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layout, Users, BookOpen, Calendar, Bell, Clock, BarChart3,
  Plus, ArrowUpRight, Video, MessageSquare, DollarSign,
  Settings, LogOut, Menu, X, FileText, Search, Star, AlertCircle,
  ChevronDown, Mail, Phone, Award, CheckCircle, XCircle, GraduationCap,
  FolderOpen, Inbox, Edit3, Upload, Download, MoreVertical, ChevronRight, Filter,
  Trophy, TrendingUp, Save
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000/api';

const TutorResources = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [profileDropdown, setProfileDropdown] = useState(false);
  const [tutor, setTutor] = useState(null);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [loading, setLoading] = useState(true);

  const [resources, setResources] = useState([]);
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Preview / Edit State
  const [selectedResource, setSelectedResource] = useState(null); // For Detail Drawer
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

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
      fetchAllData(token);
    } catch (error) { navigate('/login'); }
  }, [navigate]);

  const fetchUnreadMessages = async (token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/messages/inbox`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) setUnreadMessages(data.data.filter(m => !m.read).length);
    } catch (error) { }
  };

  const fetchAllData = async (token) => {
    setLoading(true);
    try {
      // 1. Fetch all tutor's courses to get their resources
      const coursesRes = await fetch(`${API_BASE_URL}/courses/tutor/courses`, { headers: { Authorization: `Bearer ${token}` } });
      const coursesData = await coursesRes.json();
      if (coursesData.success) {
        setCourses(coursesData.data);
        const allRes = [];
        for (const course of coursesData.data) {
          const rRes = await fetch(`${API_BASE_URL}/resources/courses/${course._id}/resources`, { headers: { Authorization: `Bearer ${token}` } });
          const rData = await rRes.json();
          if (rData.success) {
            allRes.push(...rData.data.map(r => ({ ...r, courseName: course.title, courseId: course._id })));
          }
        }
        setResources(allRes);
      }
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const handleUpdateResource = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_BASE_URL}/resources/${editingResource._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editingResource)
      });
      const data = await res.json();
      if (data.success) {
        setResources(resources.map(r => r._id === editingResource._id ? { ...data.data, courseName: r.courseName, courseId: r.courseId } : r));
        setSelectedResource({ ...data.data, courseName: selectedResource.courseName, courseId: selectedResource.courseId });
        setIsEditModalOpen(false);
      }
    } catch (error) { } finally { setIsUpdating(false); }
  };

  const handleDeleteResource = async (id) => {
    if (!window.confirm('Are you sure you want to delete this resource?')) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_BASE_URL}/resources/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if ((await res.json()).success) {
        setResources(resources.filter(r => r._id !== id));
        setIsDrawerOpen(false);
      }
    } catch (error) { }
  };

  const filteredResources = resources.filter(r => {
    const matchesSearch = r.title.toLowerCase().includes(searchTerm.toLowerCase()) || r.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = selectedCourse === 'all' || r.courseId === selectedCourse;
    const matchesCategory = selectedCategory === 'all' || r.category === selectedCategory;
    return matchesSearch && matchesCourse && matchesCategory;
  });

  const totalDownloads = resources.reduce((sum, r) => sum + (r.downloads || 0), 0);
  const handleLogout = () => { localStorage.removeItem('user'); localStorage.removeItem('token'); navigate('/login'); };
  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || 'T';

  if (loading) return <div className="flex justify-center items-center min-h-screen"><div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 transition-transform duration-300 lg:translate-x-0 lg:static ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="h-20 flex items-center px-6 border-b border-slate-800">
            <Link to="/tutor-dashboard" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20"><GraduationCap className="h-6 w-6" /></div>
              <div className="flex flex-col"><span className="font-bold text-xl text-white tracking-tight">Smart<span className="text-indigo-400">Kuppi</span></span><span className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">Tutor Portal</span></div>
            </Link>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            {[
              { name: 'Dashboard', icon: Layout, path: '/tutor-dashboard' },
              { name: 'My Courses', icon: FolderOpen, path: '/tutor/courses' },
              { name: 'Schedule', icon: Calendar, path: '/tutor/schedule' },
              { name: 'Create Course', icon: Plus, path: '/tutor/create-course' },
              { name: 'Messages', icon: MessageSquare, path: '/tutor/messages', badge: unreadMessages },
              { name: 'Resources', icon: FileText, path: '/tutor/resources' },
            ].map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`flex items-center justify-between w-full px-4 py-3 rounded-xl transition-all text-left ${link.path === '/tutor/resources' ? 'bg-indigo-600/10 text-indigo-600 font-medium' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
              >
                <div className="flex items-center space-x-3"><link.icon className="h-5 w-5" /><span>{link.name}</span></div>
                {link.badge > 0 && <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-500 text-white rounded-full">{link.badge}</span>}
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
            <h2 className="text-lg font-bold text-slate-800">Resource Library</h2>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold">{getInitials(tutor?.name)}</div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center"><FileText className="h-8 w-8" /></div>
                <div><p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total materials</p><h3 className="text-2xl font-bold text-slate-900">{resources.length}</h3></div>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center"><TrendingUp className="h-8 w-8" /></div>
                <div><p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Downloads</p><h3 className="text-2xl font-bold text-slate-900">{totalDownloads}</h3></div>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center"><Trophy className="h-8 w-8" /></div>
                <div><p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Efficiency</p><h3 className="text-2xl font-bold text-slate-900">High</h3></div>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden p-6 sm:p-8">
              <div className="flex flex-col md:flex-row gap-6 mb-8 lg:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input type="text" placeholder="Search resources..." value={searchTerm} onChange={v => setSearchTerm(v.target.value)} className="w-full pl-12 pr-4 py-3 bg-slate-50 border-transparent focus:border-indigo-500 border-2 rounded-2xl transition-all" />
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2 md:pb-0">
                  <select value={selectedCourse} onChange={v => setSelectedCourse(v.target.value)} className="px-4 py-3 bg-slate-50 border-transparent border-2 focus:border-indigo-500 rounded-2xl text-sm font-bold text-slate-600 min-w-[160px]">
                    <option value="all">All Courses</option>
                    {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
                  </select>
                  <select value={selectedCategory} onChange={v => setSelectedCategory(v.target.value)} className="px-4 py-3 bg-slate-50 border-transparent border-2 focus:border-indigo-500 rounded-2xl text-sm font-bold text-slate-600">
                    <option value="all">All Categories</option>
                    <option value="lecture_material">Lecture Material</option>
                    <option value="past_paper">Past Paper</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredResources.length > 0 ? filteredResources.map(r => (
                  <motion.div layout key={r._id} onClick={() => { setSelectedResource(r); setIsDrawerOpen(true); }} className="group bg-white rounded-3xl border border-slate-100 p-5 hover:border-indigo-500/20 hover:shadow-xl transition-all cursor-pointer relative overflow-hidden">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-2xl ${r.fileType === 'pdf' ? 'bg-rose-50 text-rose-600' : 'bg-indigo-50 text-indigo-600'}`}><FileText className="h-6 w-6" /></div>
                      <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest"><TrendingUp className="h-3 w-3" /> {r.downloads} DL</div>
                    </div>
                    <h4 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">{r.title}</h4>
                    <p className="text-xs text-slate-500 mt-1">{r.courseName}</p>
                    <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                      <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg uppercase tracking-wider">{r.category?.replace('_', ' ')}</span>
                      <ChevronRight className="h-4 w-4 text-slate-300 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </motion.div>
                )) : (
                  <div className="col-span-full py-20 text-center"><div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4"><Search className="h-8 w-8 text-slate-300" /></div><p className="text-slate-500 font-medium tracking-tight">No resources found match your criteria.</p></div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Detail Drawer - "Show details before edit" */}
      <AnimatePresence>
        {isDrawerOpen && (
          <div className="fixed inset-0 z-[60] flex justify-end">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsDrawerOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col p-8 overflow-y-auto">
              <button onClick={() => setIsDrawerOpen(false)} className="absolute top-6 left-6 p-2 hover:bg-slate-50 rounded-xl transition-all"><X className="h-6 w-6 text-slate-400" /></button>

              <div className="mt-12 space-y-8">
                <div className="flex flex-col items-center text-center">
                  <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mb-4"><FileText className="h-10 w-10" /></div>
                  <h2 className="text-2xl font-bold text-slate-900 leading-tight">{selectedResource?.title}</h2>
                  <p className="text-indigo-600 font-bold text-sm mt-1">{selectedResource?.courseName}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-2xl text-center"><p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Downloads</p><p className="text-xl font-bold text-slate-900">{selectedResource?.downloads}</p></div>
                  <div className="bg-slate-50 p-4 rounded-2xl text-center"><p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Type</p><p className="text-lg font-bold text-slate-900">{selectedResource?.fileType?.toUpperCase() || 'FILE'}</p></div>
                </div>

                <div className="space-y-4">
                  <div><h4 className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Description</h4><p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl">{selectedResource?.description || 'No description provided.'}</p></div>
                  <div className="flex items-center justify-between py-4 border-b border-slate-100"><span className="text-sm text-slate-500">Category</span><span className="text-sm font-bold text-slate-900 bg-slate-100 px-3 py-1 rounded-lg">{selectedResource?.category?.replace('_', ' ')}</span></div>
                  <div className="flex items-center justify-between py-4 border-b border-slate-100"><span className="text-sm text-slate-500">Uploaded on</span><span className="text-sm font-bold text-slate-900">{new Date(selectedResource?.createdAt).toLocaleDateString()}</span></div>
                </div>

                <div className="flex flex-col gap-3 pt-6">
                  <a href={`${API_BASE_URL}${selectedResource?.fileUrl}`} download className="w-full flex items-center justify-center gap-2 py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"><Download className="h-5 w-5" /> Download File</a>
                  <div className="flex gap-3">
                    <button onClick={() => { setEditingResource({ ...selectedResource }); setIsEditModalOpen(true); }} className="flex-1 flex items-center justify-center gap-2 py-4 bg-white border-2 border-slate-100 text-slate-700 font-bold rounded-2xl hover:bg-slate-50 transition-all"><Edit3 className="h-5 w-5" /> Edit</button>
                    <button onClick={() => handleDeleteResource(selectedResource?._id)} className="flex-1 flex items-center justify-center gap-2 py-4 bg-rose-50 text-rose-600 font-bold rounded-2xl hover:bg-rose-100 transition-all"><XCircle className="h-5 w-5" /> Delete</button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Modal - Triggered from Detail Drawer */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
              <header className="px-8 py-6 border-b border-slate-100 flex items-center justify-between"><h3 className="text-xl font-bold text-slate-900">Edit Resource</h3><button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-slate-50 rounded-xl transition-colors"><X className="h-5 w-5 text-slate-400" /></button></header>
              <form onSubmit={handleUpdateResource} className="p-8 space-y-5">
                <div className="space-y-2"><label className="text-xs font-bold text-slate-700 uppercase tracking-widest ml-1">Resource Title</label><input type="text" value={editingResource.title} onChange={e => setEditingResource({ ...editingResource, title: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-xl focus:outline-none transition-all" required /></div>
                <div className="space-y-2"><label className="text-xs font-bold text-slate-700 uppercase tracking-widest ml-1">Description</label><textarea rows={3} value={editingResource.description} onChange={e => setEditingResource({ ...editingResource, description: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-xl focus:outline-none transition-all resize-none" /></div>
                <div className="space-y-2"><label className="text-xs font-bold text-slate-700 uppercase tracking-widest ml-1">Category</label><select value={editingResource.category} onChange={e => setEditingResource({ ...editingResource, category: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-xl focus:outline-none transition-all"><option value="lecture_material">Lecture Material</option><option value="past_paper">Past Paper</option><option value="paper_discussion">Paper Discussion</option><option value="other">Other</option></select></div>
                <div className="flex gap-4 pt-4"><button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-100 transition-all">Cancel</button><button type="submit" disabled={isUpdating} className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-70 flex items-center justify-center gap-2">{isUpdating ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Save className="h-4 w-4" />}{isUpdating ? 'Saving...' : 'Save Changes'}</button></div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TutorResources;
