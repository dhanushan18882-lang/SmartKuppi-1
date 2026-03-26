// src/pages/TutorCourses.js
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronLeft, FolderOpen, Plus, MoreVertical, Users, BookOpen, ExternalLink } from 'lucide-react';
import CourseCardHeader from '../components/CourseCardHeader';

const API_BASE_URL = 'http://localhost:5000/api';

const TutorCourses = ({ onBack = () => {} }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      const token = localStorage.getItem('token');
      try {
        const res = await fetch(`${API_BASE_URL}/courses/tutor/courses`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) setCourses(data.data);
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto space-y-8">
      {/* Header with back button and create button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-white border border-transparent hover:border-slate-200 rounded-xl transition-all text-slate-500"
            aria-label="Go back"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">My Courses</h1>
            <p className="text-slate-500 mt-1">Manage the courses you've created.</p>
          </div>
        </div>
          <button
            onClick={() => onBack('create-course')}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20"
          >
            <Plus className="h-5 w-5" />
            <span>Create New Course</span>
          </button>
      </div>

      {/* Empty state or course grid */}
      {courses.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-12 text-center">
          <FolderOpen className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-900 mb-2">No courses yet</h3>
          <p className="text-slate-500 mb-6">Create your first course to start teaching.</p>
            <button
              onClick={() => onBack('create-course')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-500/20"
            >
              <Plus className="h-5 w-5" />
              Create New Course
            </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map(course => (
            <div key={course._id} className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden group">
              <CourseCardHeader course={course} height="h-40">
                <span className="absolute top-3 right-3 px-2 py-1 bg-white/90 text-[10px] font-bold rounded-full">
                  {course.status === 'published' ? 'Published' : 'Draft'}
                </span>
              </CourseCardHeader>
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
                    {course.subject}
                  </span>
                  <button className="p-1 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
                  {course.title}
                </h3>
                <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {course.enrolledCount || 0} students
                  </div>
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    {course.lessonCount || 0} lessons
                  </div>
                </div>
                <Link
                  to={`/tutor/courses/${course._id}`}
                  className="inline-flex items-center text-sm font-bold text-indigo-600 hover:underline"
                >
                  View Course <ExternalLink className="h-4 w-4 ml-1" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default TutorCourses;