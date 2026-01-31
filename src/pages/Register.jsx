import React, { useContext, useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Lottie from 'lottie-react';
import LottleData from '../assets/register.json';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  EyeIcon, EyeSlashIcon, ArrowPathIcon, 
  CheckCircleIcon, LockClosedIcon, 
  UserCircleIcon, EnvelopeIcon,
  ArrowRightIcon,
  PhotoIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../../firebase.init';
import useAxiosPublic from '../hooks/useAxiosPublic';
import useAuth from '../hooks/useAuth';
import { AuthContext } from '../provider/AuthProvider';

const IMGBB_API_KEY = '5208745dacce2f0b8ea7cce043481d64';

export default function Register() {
  const { register, handleSubmit, formState: { errors }, watch, trigger } = useForm();
  const { createUser, updateUserProfile, user } = useAuth();
  const { getUsers } = useContext(AuthContext);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [apiError, setApiError] = useState('');
  
  const formRef = useRef(null);
  const fileInputRef = useRef(null);
  const password = watch("password", "");
  const confirmPassword = watch("confirmPassword", "");
  const location = useLocation();
  const navigate = useNavigate();
  const form = location.state?.from?.pathname || '/';
  const googleProvider = new GoogleAuthProvider();
  const axiosPublic = useAxiosPublic();

  // Upload image to ImgBB
  const uploadImageToImgBB = async (file) => {
    if (!file) return null;
    
    setImageUploading(true);
    setApiError('');
    const formData = new FormData();
    formData.append('image', file);
    
    try {
      const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      if (data.success) {
        return data.data.url;
      }
      throw new Error(data.error?.message || 'Image upload failed');
    } catch (error) {
      console.error('Image upload error:', error);
      setApiError('Failed to upload profile image');
      return null;
    } finally {
      setImageUploading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setApiError('File size should be less than 5MB');
        return;
      }
      setProfileImage(file);
      setApiError('');
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setProfileImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validatePassword = (value) => {
    if (!value) return "Password is required";
    
    const strength = {
      length: value.length >= 8,
      uppercase: /[A-Z]/.test(value),
      lowercase: /[a-z]/.test(value),
      number: /\d/.test(value),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value)
    };
    
    const strengthScore = Object.values(strength).filter(Boolean).length;
    
    if (strengthScore < 3) return "Password is too weak";
    return true;
  };

  const validateConfirmPassword = (value) => {
    if (value !== password) return "Passwords do not match";
    return true;
  };

  // Handle form submission
  const onSubmit = async (data) => {
    setLoading(true);
    setSuccess(false);
    setApiError('');

    try {
      // Upload profile image if exists
      let imageUrl = "https://i.ibb.co/4g1L9Gf/avatar.png"; // default avatar
      if (profileImage) {
        imageUrl = await uploadImageToImgBB(profileImage);
        if (!imageUrl) {
          throw new Error('Failed to upload profile image');
        }
      }

      // Create user with Firebase
      const userCredential = await createUser(data.email, data.password);
      
      // Update Firebase profile
      await updateUserProfile(data.username, imageUrl);

      // Prepare user data for backend
      const userInfo = {
        name: data.username,
        email: data.email,
        photoURL: imageUrl,
        role: 'user', // Default role
        createdAt: new Date().toISOString()
      };

      // Save user to backend
      const backendResponse = await axiosPublic.post('/users', userInfo);
      
      if (backendResponse.data.success) {
        // Refresh users list
        if (getUsers) getUsers();
        
        setSuccess(true);
        setTimeout(() => {
          navigate(form, { replace: true });
        }, 1500);
      } else {
        throw new Error(backendResponse.data.message || 'Failed to save user data');
      }

    } catch (error) {
      console.error("🚨 Registration error:", error);
      setApiError(
        error.response?.data?.message || 
        error.message || 
        'Registration failed. Please try again.'
      );
      
      // If Firebase user was created but backend failed, delete Firebase user
      if (auth.currentUser) {
        try {
          await auth.currentUser.delete();
        } catch (deleteError) {
          console.error("Error cleaning up Firebase user:", deleteError);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle Google Sign In
  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setApiError('');

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Prepare user data for backend
      const userInfo = {
        name: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        role: 'user',
        provider: 'Google',
        createdAt: new Date().toISOString()
      };

      // Save user to backend
      const backendResponse = await axiosPublic.post('/users', userInfo);
      
      if (backendResponse.data.success) {
        // Refresh users list
        if (getUsers) getUsers();
        
        setSuccess(true);
        setTimeout(() => {
          navigate(form, { replace: true });
        }, 1000);
      } else {
        throw new Error(backendResponse.data.message || 'Failed to save user data');
      }

    } catch (error) {
      console.error('Google Sign In Error:', error);
      setApiError(
        error.response?.data?.message || 
        error.message || 
        'Google sign in failed. Please try again.'
      );
    } finally {
      setGoogleLoading(false);
    }
  };

  const getPasswordStrengthDetails = (pwd) => {
    if (!pwd) return null;
    
    const strength = {
      length: pwd.length >= 8,
      uppercase: /[A-Z]/.test(pwd),
      lowercase: /[a-z]/.test(pwd),
      number: /\d/.test(pwd),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)
    };
    
    return {
      ...strength,
      score: Object.values(strength).filter(Boolean).length,
      maxScore: 5
    };
  };

  const passwordStrength = () => {
    if (!password) return 0;
    return getPasswordStrengthDetails(password).score;
  };

  const steps = [
    { id: 1, title: 'Personal Info' },
    { id: 2, title: 'Security' },
    { id: 3, title: 'Preferences' }
  ];

  useEffect(() => {
    if (formRef.current) {
      formRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentStep]);

  const proceedToNextStep = async () => {
    let isValid = false;
    
    if (currentStep === 1) {
      isValid = await trigger(['username', 'email']);
    } else if (currentStep === 2) {
      isValid = await trigger(['password', 'confirmPassword']);
    }
    
    if (isValid) {
      setCurrentStep(s => s + 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl bg-white/5 dark:bg-gray-800/80 backdrop-blur-2xl rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden border border-white/10 dark:border-gray-700">
        {/* Animation Section */}
        <div className="md:w-1/2 p-12 bg-gradient-to-br from-white/10 to-transparent dark:from-gray-700/20 dark:to-gray-800/20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-blue-500/20 dark:from-purple-600/10 dark:to-blue-600/10" />
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative z-10 flex flex-col items-center justify-center h-full"
          >
            <Lottie 
              animationData={LottleData} 
              loop={true}
              className="hover:scale-105 transition-transform duration-300 max-h-96"
            />
            <h3 className="text-3xl font-bold text-white dark:text-gray-100 text-center mt-8">
              Join Our Community
            </h3>
            <p className="text-white/80 dark:text-gray-300 text-center mt-4 text-lg">
              Create an account to access exclusive features
            </p>
            
            <button
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              className="mt-8 w-full max-w-xs bg-white/90 hover:bg-white dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 font-medium py-3 px-6 rounded-xl flex items-center justify-center space-x-3 transition-all shadow-lg disabled:opacity-50"
            >
              {googleLoading ? (
                <ArrowPathIcon className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <img 
                    src="https://www.google.com/favicon.ico" 
                    alt="Google" 
                    className="h-5 w-5"
                  />
                  <span>Sign up with Google</span>
                </>
              )}
            </button>
            
            <div className="mt-6 text-white/70 dark:text-gray-400 text-sm">
              Already have an account?{' '}
              <button 
                onClick={() => navigate('/login')}
                className="text-white dark:text-gray-200 font-medium hover:underline"
              >
                Log in
              </button>
            </div>
          </motion.div>
        </div>

        {/* Form Section */}
        <div className="md:w-1/2 p-12 bg-white dark:bg-gray-900 relative">
          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl flex items-center justify-center rounded-2xl z-20"
              >
                <div className="text-center space-y-4">
                  <CheckCircleIcon className="h-20 w-20 text-emerald-600 dark:text-emerald-500 mx-auto animate-tick" />
                  <h3 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome!</h3>
                  <p className="text-gray-600 dark:text-gray-300 mt-2">Your account has been created successfully</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* API Error Display */}
          {apiError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl"
            >
              <p className="text-red-700 dark:text-red-400 text-sm flex items-center">
                <span className="mr-2">⚠️</span>
                {apiError}
              </p>
            </motion.div>
          )}

          {/* Progress Steps */}
          <div className="mb-12">
            <nav aria-label="Progress">
              <ol className="flex items-center justify-between">
                {steps.map((step, index) => (
                  <li key={step.id} className="relative flex-1">
                    <div className="flex items-center">
                      <div className={`h-1 w-full ${currentStep > index ? 'bg-purple-600 dark:bg-purple-500' : 'bg-gray-200 dark:bg-gray-700'}`} />
                      <div className={`relative flex h-8 w-8 items-center justify-center rounded-full ${currentStep > index ? 'bg-purple-600 dark:bg-purple-500' : currentStep === step.id ? 'bg-purple-200 dark:bg-purple-900' : 'bg-gray-200 dark:bg-gray-700'}`}>
                        {currentStep > index ? (
                          <CheckCircleIcon className="h-5 w-5 text-white" />
                        ) : (
                          <span className={`${currentStep === step.id ? 'text-purple-600 dark:text-purple-400' : 'text-gray-500 dark:text-gray-400'}`}>
                            {step.id}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className={`absolute mt-2 -left-10 w-24 text-center text-sm font-medium ${currentStep === step.id ? 'text-purple-600 dark:text-purple-400' : 'text-gray-600 dark:text-gray-400'}`}>
                      {step.title}
                    </span>
                  </li>
                ))}
              </ol>
            </nav>
          </div>

          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            ref={formRef}
            className="space-y-8"
          >
            <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-8 text-center bg-gradient-to-r from-purple-600 to-blue-500 dark:from-purple-500 dark:to-blue-400 bg-clip-text text-transparent">
              {currentStep === 1 ? 'Personal Information' : 
               currentStep === 2 ? 'Account Security' : 
               'Preferences'}
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Step 1: Personal Information */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      <PhotoIcon className="h-5 w-5 inline-block mr-2 text-purple-600 dark:text-purple-400" />
                      Profile Picture (Optional)
                    </label>
                    <div className="flex items-center space-x-6">
                      <div className="shrink-0">
                        {imagePreview ? (
                          <div className="relative">
                            <img
                              className="h-24 w-24 object-cover rounded-full border-2 border-purple-200 dark:border-purple-800"
                              src={imagePreview}
                              alt="Profile preview"
                            />
                            <button
                              type="button"
                              onClick={removeImage}
                              className="absolute -top-2 -right-2 bg-white dark:bg-gray-700 rounded-full p-1 shadow-md hover:bg-gray-100 dark:hover:bg-gray-600"
                            >
                              <XMarkIcon className="h-5 w-5 text-red-500 dark:text-red-400" />
                            </button>
                          </div>
                        ) : (
                          <div className="h-24 w-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                            <PhotoIcon className="h-10 w-10 text-gray-400 dark:text-gray-500" />
                          </div>
                        )}
                      </div>
                      <label className="block">
                        <span className="sr-only">Choose profile photo</span>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleImageChange}
                          accept="image/*"
                          className="block w-full text-sm text-gray-500 dark:text-gray-400
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-xl file:border-0
                            file:text-sm file:font-semibold
                            file:bg-purple-50 file:text-purple-700
                            hover:file:bg-purple-100
                            dark:file:bg-purple-900/50 dark:file:text-purple-300
                            dark:hover:file:bg-purple-900/70"
                        />
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          JPG, PNG or GIF (Max 5MB)
                        </p>
                      </label>
                    </div>
                    {imageUploading && (
                      <div className="mt-2 flex items-center text-purple-600 dark:text-purple-400">
                        <ArrowPathIcon className="h-4 w-4 animate-spin mr-2" />
                        <span className="text-sm">Uploading image...</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      <UserCircleIcon className="h-5 w-5 inline-block mr-2 text-purple-600 dark:text-purple-400" />
                      Username
                    </label>
                    <input
                      type="text"
                      {...register('username', { 
                        required: 'Username is required',
                        minLength: {
                          value: 3,
                          message: 'Username must be at least 3 characters'
                        },
                        maxLength: {
                          value: 20,
                          message: 'Username must be less than 20 characters'
                        }
                      })}
                      className="w-full px-5 py-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-purple-500 dark:focus:border-purple-400 focus:ring-4 focus:ring-purple-100 dark:focus:ring-purple-900/50 transition-all outline-none dark:bg-gray-800 dark:text-white"
                      placeholder="Enter your username"
                    />
                    {errors.username && (
                      <motion.p 
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-600 dark:text-red-500 text-sm mt-2 flex items-center gap-2"
                      >
                        <span>⚠️</span>{errors.username.message}
                      </motion.p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      <EnvelopeIcon className="h-5 w-5 inline-block mr-2 text-purple-600 dark:text-purple-400" />
                      Email Address
                    </label>
                    <input
                      type="email"
                      {...register('email', {
                        required: 'Email is required',
                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: 'Please enter a valid email address'
                        }
                      })}
                      className="w-full px-5 py-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-purple-500 dark:focus:border-purple-400 focus:ring-4 focus:ring-purple-100 dark:focus:ring-purple-900/50 transition-all outline-none dark:bg-gray-800 dark:text-white"
                      placeholder="yourname@example.com"
                    />
                    {errors.email && (
                      <motion.p 
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-600 dark:text-red-500 text-sm mt-2 flex items-center gap-2"
                      >
                        <span>⚠️</span>{errors.email.message}
                      </motion.p>
                    )}
                  </div>
                </div>
              )}

              {/* Step 2: Account Security */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      <LockClosedIcon className="h-5 w-5 inline-block mr-2 text-purple-600 dark:text-purple-400" />
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        {...register('password', {
                          required: 'Password is required',
                          validate: validatePassword
                        })}
                        className="w-full px-5 py-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-purple-500 dark:focus:border-purple-400 focus:ring-4 focus:ring-purple-100 dark:focus:ring-purple-900/50 transition-all outline-none pr-14 dark:bg-gray-800 dark:text-white"
                        placeholder="Create a strong password"
                        onChange={() => {
                          if (confirmPassword) {
                            trigger('confirmPassword');
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-4 text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                      >
                        {showPassword ? (
                          <EyeSlashIcon className="h-6 w-6" />
                        ) : (
                          <EyeIcon className="h-6 w-6" />
                        )}
                      </button>
                    </div>
                    
                    <div className="mt-4 space-y-3">
                      <div className="flex gap-2">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className={`h-2 w-full rounded-full transition-all duration-500 ${
                              i < passwordStrength() ? 'bg-purple-600 dark:bg-purple-500' : 'bg-gray-200 dark:bg-gray-700'
                            }`}
                          />
                        ))}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <span className={`flex items-center ${password?.match(/[A-Z]/) ? 'text-emerald-600 dark:text-emerald-500' : 'text-gray-400 dark:text-gray-500'}`}>
                          <CheckCircleIcon className="h-4 w-4 mr-1" /> Uppercase
                        </span>
                        <span className={`flex items-center ${password?.match(/[a-z]/) ? 'text-emerald-600 dark:text-emerald-500' : 'text-gray-400 dark:text-gray-500'}`}>
                          <CheckCircleIcon className="h-4 w-4 mr-1" /> Lowercase
                        </span>
                        <span className={`flex items-center ${password?.match(/\d/) ? 'text-emerald-600 dark:text-emerald-500' : 'text-gray-400 dark:text-gray-500'}`}>
                          <CheckCircleIcon className="h-4 w-4 mr-1" /> Number
                        </span>
                        <span className={`flex items-center ${password?.match(/[!@#$%^&*]/) ? 'text-emerald-600 dark:text-emerald-500' : 'text-gray-400 dark:text-gray-500'}`}>
                          <CheckCircleIcon className="h-4 w-4 mr-1" /> Special
                        </span>
                        <span className={`flex items-center ${password?.length >= 8 ? 'text-emerald-600 dark:text-emerald-500' : 'text-gray-400 dark:text-gray-500'}`}>
                          <CheckCircleIcon className="h-4 w-4 mr-1" /> 8+ chars
                        </span>
                      </div>
                    </div>
                    {errors.password && (
                      <motion.p 
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-600 dark:text-red-500 text-sm mt-2 flex items-center gap-2"
                      >
                        <span>⚠️</span>{errors.password.message}
                      </motion.p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      <LockClosedIcon className="h-5 w-5 inline-block mr-2 text-purple-600 dark:text-purple-400" />
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        {...register('confirmPassword', {
                          required: 'Please confirm your password',
                          validate: validateConfirmPassword
                        })}
                        className="w-full px-5 py-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-purple-500 dark:focus:border-purple-400 focus:ring-4 focus:ring-purple-100 dark:focus:ring-purple-900/50 transition-all outline-none pr-14 dark:bg-gray-800 dark:text-white"
                        placeholder="Re-enter your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-4 text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                      >
                        {showConfirmPassword ? (
                          <EyeSlashIcon className="h-6 w-6" />
                        ) : (
                          <EyeIcon className="h-6 w-6" />
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <motion.p 
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-600 dark:text-red-500 text-sm mt-2 flex items-center gap-2"
                      >
                        <span>⚠️</span>{errors.confirmPassword.message}
                      </motion.p>
                    )}
                  </div>
                </div>
              )}

              {/* Step 3: Preferences */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Privacy Settings
                    </h3>
                    <div className="space-y-3">
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          {...register('terms', { required: 'You must accept the terms' })}
                          className="h-5 w-5 text-purple-600 dark:text-purple-500 rounded-lg focus:ring-purple-500 border-gray-300 dark:border-gray-600 dark:bg-gray-800"
                        />
                        <span className="text-gray-700 dark:text-gray-300">
                          I agree to the{' '}
                          <a href="/terms" className="text-purple-600 dark:text-purple-400 hover:underline">
                            Terms of Service
                          </a>{' '}
                          and{' '}
                          <a href="/privacy" className="text-purple-600 dark:text-purple-400 hover:underline">
                            Privacy Policy
                          </a>
                        </span>
                      </label>
                      {errors.terms && (
                        <motion.p 
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-red-600 dark:text-red-500 text-sm mt-2 flex items-center gap-2"
                        >
                          <span>⚠️</span>{errors.terms.message}
                        </motion.p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Controls */}
              <div className="flex justify-between pt-4">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentStep(s => s - 1)}
                    className="px-8 py-3 text-purple-600 hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-purple-900/50 rounded-xl font-semibold transition-colors flex items-center"
                  >
                    <ArrowRightIcon className="h-5 w-5 rotate-180 mr-2" />
                    Back
                  </button>
                ) : (
                  <span className="px-8 py-3 opacity-0">Back</span>
                )}

                {currentStep < 3 ? (
                  <button
                    type="button"
                    onClick={proceedToNextStep}
                    className="ml-auto px-8 py-3 bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 text-white rounded-xl font-semibold transition-colors flex items-center disabled:opacity-50"
                  >
                    Continue
                    <ArrowRightIcon className="h-5 w-5 ml-2" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="ml-auto px-8 py-3 bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 text-white rounded-xl font-semibold transition-colors flex items-center justify-center min-w-[200px] disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <ArrowPathIcon className="w-5 h-5 animate-spin mr-2" />
                        Finalizing...
                      </>
                    ) : (
                      'Complete Registration'
                    )}
                  </button>
                )}
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}