// src/pages/ForgotPassword.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, Lock, ArrowLeft, ChevronRight, 
  CheckCircle, AlertCircle, ShieldCheck, 
  Key, RefreshCw, Eye, EyeOff
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000/api';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // Step 1: Send OTP using backend
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Call backend to generate and send OTP
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      const data = await response.json();
      console.log('Backend response:', data);
      
      if (data.success) {
        setCurrentStep('otp');
        setTimer(60);
      } else {
        setError(data.message || 'Failed to send reset code');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to send reset code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP with backend
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    
    if (!otp) {
      setError('Please enter the verification code');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });
      
      const data = await response.json();
      console.log('Verify response:', data);
      
      if (data.success) {
        setCurrentStep('reset');
      } else {
        setError(data.message || 'Invalid verification code');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to verify code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Reset password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setCurrentStep('success');
      } else {
        setError(data.message || 'Failed to reset password');
      }
    } catch (err) {
      console.error('Reset password error:', err);
      setError('Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const stepVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-100 rounded-full blur-[120px] opacity-50"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-100 rounded-full blur-[120px] opacity-50"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl shadow-indigo-200/50 overflow-hidden relative z-10 border border-white p-8 sm:p-12"
      >
        <div className="mb-10 text-center">
          <Link to="/login" className="inline-flex items-center space-x-2 text-slate-400 hover:text-indigo-600 transition-colors mb-8 group">
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-bold uppercase tracking-widest">Back to Login</span>
          </Link>
          
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg mx-auto mb-6">
            <Key className="h-8 w-8" />
          </div>
          
          <h3 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">
            {currentStep === 'email' && 'Forgot Password?'}
            {currentStep === 'otp' && 'Verify Email'}
            {currentStep === 'reset' && 'New Password'}
            {currentStep === 'success' && 'All Set!'}
          </h3>
          <p className="text-slate-500 font-medium">
            {currentStep === 'email' && "No worries, we'll send you reset instructions."}
            {currentStep === 'otp' && `We've sent a code to ${email}`}
            {currentStep === 'reset' && 'Please enter a strong new password.'}
            {currentStep === 'success' && 'Your password has been successfully reset.'}
          </p>
        </div>

        {/* Progress Bar */}
        {currentStep !== 'success' && (
          <div className="flex items-center justify-between mb-10 px-4">
            {[1, 2, 3].map((s) => {
              const stepMap = { 1: 'email', 2: 'otp', 3: 'reset' };
              const isActive = currentStep === stepMap[s];
              const isCompleted = (s === 1 && (currentStep === 'otp' || currentStep === 'reset')) || (s === 2 && currentStep === 'reset');
              
              return (
                <div key={s} className="flex items-center flex-1 last:flex-none">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-110' : 
                    isCompleted ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'
                  }`}>
                    {isCompleted ? <CheckCircle className="h-4 w-4" /> : s}
                  </div>
                  {s < 3 && (
                    <div className={`flex-1 h-1 mx-2 rounded-full transition-all ${
                      isCompleted ? 'bg-emerald-500' : 'bg-slate-100'
                    }`}></div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* Step 1: Email */}
          {currentStep === 'email' && (
            <motion.form 
              key="email"
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              onSubmit={handleSendOtp}
              className="space-y-6"
            >
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-widest ml-1">Email Address</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-2xl focus:outline-none transition-all text-slate-900 font-medium placeholder:text-slate-400"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              {error && (
                <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-center space-x-3 text-rose-600">
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  <p className="text-xs font-bold">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full relative py-4 px-6 bg-indigo-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:shadow-indigo-300 transition-all active:scale-[0.98] disabled:opacity-70 group"
              >
                <div className="flex items-center justify-center">
                  {isLoading ? (
                    <RefreshCw className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <span>Send Reset Code</span>
                      <ChevronRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </div>
              </button>
            </motion.form>
          )}

          {/* Step 2: OTP */}
          {currentStep === 'otp' && (
            <motion.form 
              key="otp"
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              onSubmit={handleVerifyOtp}
              className="space-y-6"
            >
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-widest ml-1">Verification Code</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <ShieldCheck className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="block w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-2xl focus:outline-none transition-all text-slate-900 font-bold tracking-[1em] placeholder:tracking-normal placeholder:text-slate-400"
                    placeholder="000000"
                  />
                </div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-2 ml-1">
                  Enter the 6-digit code sent to your email
                </p>
              </div>

              {error && (
                <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-center space-x-3 text-rose-600">
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  <p className="text-xs font-bold">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full relative py-4 px-6 bg-indigo-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:shadow-indigo-300 transition-all active:scale-[0.98] disabled:opacity-70"
              >
                {isLoading ? <RefreshCw className="h-5 w-5 animate-spin" /> : "Verify Code"}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  disabled={timer > 0}
                  onClick={handleSendOtp}
                  className={`text-sm font-bold transition-colors ${
                    timer > 0 ? 'text-slate-300 cursor-not-allowed' : 'text-indigo-600 hover:text-indigo-700'
                  }`}
                >
                  {timer > 0 ? `Resend code in ${timer}s` : "Didn't receive code? Resend"}
                </button>
              </div>
            </motion.form>
          )}

          {/* Step 3: Reset Password */}
          {currentStep === 'reset' && (
            <motion.form 
              key="reset"
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              onSubmit={handleResetPassword}
              className="space-y-6"
            >
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-widest ml-1">New Password</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="block w-full pl-12 pr-12 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-2xl focus:outline-none transition-all text-slate-900 font-medium placeholder:text-slate-400"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-indigo-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-widest ml-1">Confirm New Password</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="block w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-2xl focus:outline-none transition-all text-slate-900 font-medium placeholder:text-slate-400"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-center space-x-3 text-rose-600">
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  <p className="text-xs font-bold">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full relative py-4 px-6 bg-indigo-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:shadow-indigo-300 transition-all active:scale-[0.98] disabled:opacity-70"
              >
                {isLoading ? <RefreshCw className="h-5 w-5 animate-spin mx-auto" /> : "Reset Password"}
              </button>
            </motion.form>
          )}

          {/* Step 4: Success */}
          {currentStep === 'success' && (
            <motion.div 
              key="success"
              variants={stepVariants}
              initial="initial"
              animate="animate"
              className="text-center space-y-8"
            >
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-100/50">
                <CheckCircle className="h-10 w-10" />
              </div>
              
              <div className="space-y-2">
                <p className="text-slate-500 font-medium">
                  You can now sign in with your new password.
                </p>
              </div>

              <button
                onClick={() => navigate('/login')}
                className="w-full py-4 px-6 bg-indigo-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:shadow-indigo-300 transition-all active:scale-[0.98]"
              >
                Continue to Login
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;