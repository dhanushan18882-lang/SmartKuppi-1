// src/pages/TutorResourceUpload.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Upload, X, CheckCircle, FileText, Link as LinkIcon } from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000/api';

const TutorResourceUpload = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get('course');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [fileType, setFileType] = useState('other');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [courseTitle, setCourseTitle] = useState('');
  const [category, setCategory] = useState('lecture_material');

  useEffect(() => {
    if (!courseId) {
      navigate('/tutor/courses');
      return;
    }
    const fetchCourse = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await fetch(`${API_BASE_URL}/courses/${courseId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) setCourseTitle(data.data.title);
      } catch (error) {
        console.error('Error fetching course:', error);
      }
    };
    fetchCourse();
  }, [courseId, navigate]);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      // Auto-detect file type based on extension
      const ext = selected.name.split('.').pop().toLowerCase();
      if (['pdf'].includes(ext)) setFileType('pdf');
      else if (['mp4', 'mov', 'avi'].includes(ext)) setFileType('video');
      else if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) setFileType('image');
      else setFileType('other');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Please enter a title');
      return;
    }
    if (!file) {
      alert('Please select a file');
      return;
    }
    setIsSubmitting(true);
    const token = localStorage.getItem('token');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('fileType', fileType);
    formData.append('category', category);

    try {
      const res = await fetch(`${API_BASE_URL}/resources/courses/${courseId}/resources`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // Do NOT set Content-Type – browser will set it with boundary
        },
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setTimeout(() => navigate(`/tutor/courses/${courseId}`), 2000);
      } else {
        alert(data.message || 'Failed to upload resource');
      }
    } catch (error) {
      console.error('Error uploading resource:', error);
      alert('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-3xl p-12 text-center max-w-md mx-auto shadow-2xl">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle className="h-10 w-10 text-emerald-600" /></div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Resource Uploaded!</h2>
        <p className="text-slate-500">The file has been added to the course.</p>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(`/tutor/courses/${courseId}`)} className="p-2 hover:bg-white border border-transparent hover:border-slate-200 rounded-xl transition-all text-slate-500">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Upload Resource</h1>
          <p className="text-slate-500 mt-1">for {courseTitle || 'course'}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden p-6 space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Title *</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-brand-500 rounded-xl focus:outline-none transition-all"
              placeholder="e.g. Lecture Slides"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Description (optional)</label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-brand-500 rounded-xl focus:outline-none transition-all resize-none"
              placeholder="Brief description of the resource"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">File *</label>
            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:border-brand-500 transition-colors cursor-pointer" onClick={() => document.getElementById('fileInput').click()}>
              {file ? (
                <div className="flex items-center justify-center gap-3">
                  <FileText className="h-8 w-8 text-brand-500" />
                  <span className="text-slate-700 font-medium">{file.name}</span>
                  <button type="button" onClick={(e) => { e.stopPropagation(); setFile(null); }} className="p-1 text-slate-400 hover:text-rose-500">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="h-10 w-10 text-slate-400 mx-auto mb-2" />
                  <p className="text-slate-500">Click to select a file (PDF, video, image, etc.)</p>
                  <p className="text-xs text-slate-400 mt-1">Max 10 MB</p>
                </>
              )}
              <input id="fileInput" type="file" className="hidden" onChange={handleFileChange} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">File Type</label>
            <select
              value={fileType}
              onChange={e => setFileType(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-xl focus:outline-none transition-all"
            >
              <option value="pdf">PDF</option>
              <option value="video">Video</option>
              <option value="image">Image</option>
              <option value="link">Link (will be stored as a URL)</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Category</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-xl focus:outline-none transition-all"
            >
              <option value="lecture_material">Lecture Material</option>
              <option value="past_paper">Past Paper</option>
              <option value="paper_discussion">Paper Discussion</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <button type="button" onClick={() => navigate(`/tutor/courses/${courseId}`)} className="flex-1 py-4 bg-white border-2 border-slate-200 text-slate-700 font-bold rounded-2xl hover:bg-slate-50">Cancel</button>
          <button type="submit" disabled={isSubmitting} className="flex-1 py-4 bg-white border-2 border-slate-200 text-slate-700 font-bold rounded-2xl hover:bg-slate-50 disabled:opacity-70 flex items-center justify-center gap-2">
            {isSubmitting ? <div className="w-5 h-5 border-2 border-slate-700 border-t-transparent rounded-full animate-spin"></div> : <Upload className="h-5 w-5" />}
            {isSubmitting ? 'Uploading...' : 'Upload Resource'}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default TutorResourceUpload;