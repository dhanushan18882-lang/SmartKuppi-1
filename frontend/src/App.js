// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import AdminDashboard from './pages/AdminDashboard';
import TutorDashboard from './pages/TutorDashboard';
import StudentDashboard from './pages/StudentDashboard';
import TutorCourses from './pages/TutorCourses';
import TutorCourseCreate from './pages/TutorCourseCreate';
import TutorCourseDetail from './pages/TutorCourseDetail';
import TutorMessages from './pages/TutorMessages';
import StudentCourseDetail from './pages/StudentCourseDetail';
import TutorLessonCreate from './pages/TutorLessonCreate';
import TutorResourceUpload from './pages/TutorResourceUpload';
import BrowseCourses from './pages/BrowseCourses';
import DiscussionForum from './pages/DiscussionForum';
import StudentCourses from './pages/StudentCourses'; 
import StudentSchedule from './pages/StudentSchedule';
import TutorSchedule from './pages/TutorSchedule';
import Resources from './pages/Resources';



import TutorCourseEdit from './pages/TutorCourseEdit';

// Create a wrapper component to use useNavigate
const AppRoutes = () => {
  const navigate = useNavigate();
  
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Admin Routes */}
      <Route path="/admin-dashboard" element={<AdminDashboard />} />

      {/* Tutor Routes */}
      <Route path="/tutor-dashboard" element={<TutorDashboard />} />
      <Route path="/tutor/courses" element={<TutorDashboard initialView="courses" />} />
      <Route path="/tutor/create-course" element={<TutorDashboard initialView="create-course" />} />
      <Route path="/tutor/courses/:courseId" element={<TutorCourseDetail />} />
      <Route path="/tutor/courses/:courseId/edit" element={<TutorCourseEdit />} />
      <Route path="/tutor/messages" element={<TutorDashboard initialView="messages" />} />
      <Route path="/tutor/create-lesson" element={<TutorLessonCreate />} />
      <Route path="/tutor/upload-resource" element={<TutorResourceUpload />} />
      <Route path="/tutor/schedule" element={<TutorDashboard initialView="schedule" />} />


      {/* Student Routes */}
      <Route path="/student-dashboard" element={<StudentDashboard />} />
      <Route path="/student/courses/:courseId" element={<StudentCourseDetail />} />
      <Route path="/courses" element={<StudentCourses onBack={() => navigate(-1)} />} />
      <Route path="/browse-courses" element={<BrowseCourses onBack={() => navigate(-1)} />} />
      <Route path="/discussions" element={<DiscussionForum onBack={() => navigate(-1)} />} />
      <Route path="/schedule" element={<StudentSchedule onBack={() => navigate(-1)} />} />
      <Route path="/resources" element={<Resources onBack={() => navigate(-1)} />} />

    </Routes>
  );
};

function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;