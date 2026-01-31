import React, { useContext, useState, useEffect } from 'react';
import Lottie from 'lottie-react';
import LoginData from '../assets/logon.json';
import { useNavigate } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon, ArrowPathIcon, CheckCircleIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../../firebase.init';
import useAxiosPublic from '../hooks/useAxiosPublic';
import { AuthContext } from '../provider/AuthProvider';

const steps = [
  { id: 'welcome', title: 'Welcome' },
  { id: 'credentials', title: 'Login' },
];

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { loginUser, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const axiosPublic = useAxiosPublic();
  const provider = new GoogleAuthProvider();

  const handleGoogleLogin = () => {
    setGoogleLoading(true);
    setError(null);
    
    signInWithPopup(auth, provider)
      .then((res) => {
        const user = res.user;
        if (res) {
          const userInfo = {
            uid: user.uid,
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            provider: 'Google',
            status: 'User',
            amount: 0
          };
          axiosPublic.post('/users', userInfo);
        }
        setSuccessMessage('Login successful! Redirecting...');
        setTimeout(() => {
          navigate("/");
        }, 1500);
      })
      .catch((error) => {
        console.error('Google login error:', error);
        setError('Google login failed. Please try again.');
      })
      .finally(() => {
        setGoogleLoading(false);
      });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await loginUser(email, password);
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
      }

      setSuccessMessage('Login successful! Redirecting...');
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const nextStep = () => {
    setDirection(1);
    setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
  };

  const prevStep = () => {
    setDirection(-1);
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  useEffect(() => {
    if (user) navigate('/');
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-r from-teal-600 to-emerald-700 dark:from-teal-800 dark:to-emerald-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white/10 dark:bg-gray-900/20 backdrop-blur-lg rounded-2xl shadow-xl flex flex-col md:flex-row overflow-hidden border border-white/20 dark:border-gray-700/50">
        {/* Animation Section */}
        <div className="md:w-1/2 p-8 bg-gradient-to-br from-white/20 to-transparent dark:from-gray-800/30 dark:to-gray-900/20 flex flex-col">
          <div className="aspect-square">
            <Lottie 
              animationData={LoginData} 
              loop={true}
              className="hover:scale-105 transition-transform duration-300"
            />
          </div>
          
          {/* Step Progress */}
          <div className="mt-8">
            <nav aria-label="Progress">
              <ol className="space-y-4">
                {steps.map((step, index) => (
                  <li key={step.id} className="relative">
                    {index < currentStep ? (
                      <div className="group flex items-start">
                        <span className="flex items-center h-9">
                          <span className="relative z-10 flex items-center justify-center w-8 h-8 rounded-full bg-emerald-600 dark:bg-emerald-500 group-hover:bg-emerald-700 dark:group-hover:bg-emerald-600">
                            <CheckCircleIcon className="w-5 h-5 text-white" />
                          </span>
                        </span>
                        <span className="ml-4 flex flex-col">
                          <span className="text-sm font-medium text-white dark:text-gray-100">{step.title}</span>
                        </span>
                      </div>
                    ) : index === currentStep ? (
                      <div className="flex items-start" aria-current="step">
                        <span className="flex items-center h-9">
                          <span className="relative z-10 flex items-center justify-center w-8 h-8 rounded-full border-2 border-emerald-600 dark:border-emerald-500 bg-white dark:bg-gray-800">
                            <span className="h-2.5 w-2.5 rounded-full bg-emerald-600 dark:bg-emerald-500 animate-pulse" />
                          </span>
                        </span>
                        <span className="ml-4 flex flex-col">
                          <span className="text-sm font-medium text-white dark:text-gray-100">{step.title}</span>
                        </span>
                      </div>
                    ) : (
                      <div className="group flex items-start">
                        <span className="flex items-center h-9">
                          <span className="relative z-10 flex items-center justify-center w-8 h-8 rounded-full border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 group-hover:border-gray-400 dark:group-hover:border-gray-500">
                            <span className="h-2.5 w-2.5 rounded-full bg-transparent group-hover:bg-gray-300 dark:group-hover:bg-gray-500" />
                          </span>
                        </span>
                        <span className="ml-4 flex flex-col">
                          <span className="text-sm font-medium text-gray-300 dark:text-gray-400">{step.title}</span>
                        </span>
                      </div>
                    )}
                    
                    {index !== steps.length - 1 && (
                      <div 
                        className={`absolute top-8 left-4 -ml-px mt-0.5 h-10 w-0.5 ${index < currentStep ? 'bg-emerald-600 dark:bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'}`} 
                        aria-hidden="true"
                      />
                    )}
                  </li>
                ))}
              </ol>
            </nav>
          </div>
        </div>

        {/* Form Section */}
        <div className="md:w-1/2 p-8 md:p-12 bg-white dark:bg-gray-800 relative overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              initial={{ opacity: 0, x: direction > 0 ? 50 : -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction > 0 ? -50 : 50 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className=""
            >
              {currentStep === 0 && (
                <div className="h-full flex flex-col justify-between">
                  <div>
                    <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
                      Welcome Back!
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-8">
                      Sign in to access your personalized dashboard and continue your journey with us.
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <button
                      onClick={handleGoogleLogin}
                      disabled={googleLoading}
                      className="w-full bg-white hover:bg-gray-50 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 hover:shadow-lg flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {googleLoading ? (
                        <ArrowPathIcon className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
                          </svg>
                        </>
                      )}
                      <span>{googleLoading ? 'Signing in...' : 'Sign in with Google'}</span>
                    </button>
                    
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">Or continue with email</span>
                      </div>
                    </div>
                    
                    <button
                      onClick={nextStep}
                      className="w-full bg-gradient-to-r from-teal-600 to-emerald-700 dark:from-teal-700 dark:to-emerald-800 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 hover:shadow-lg"
                    >
                      Continue with Email
                    </button>
                  </div>
                </div>
              )}
              
              {currentStep === 1 && (
                <form onSubmit={handleSubmit} className="h-full flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
                        Login to your account
                      </h2>
                      <button
                        type="button"
                        onClick={handleGoogleLogin}
                        disabled={googleLoading}
                        className="text-sm text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-medium flex items-center gap-2 disabled:opacity-50"
                      >
                        {googleLoading ? (
                          <ArrowPathIcon className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <svg className="w-4 h-4" viewBox="0 0 24 24">
                              <path fill="currentColor" d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
                            </svg>
                          </>
                        )}
                        <span>Sign in with Google</span>
                      </button>
                    </div>
                    
                    {error && (
                      <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg flex items-center gap-2 mb-6">
                        <span className="text-red-600 dark:text-red-400 text-sm font-medium">⚠️ {error}</span>
                      </div>
                    )}

                    {successMessage && (
                      <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-lg flex items-center gap-2 mb-6">
                        <CheckCircleIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-emerald-600 dark:text-emerald-400 text-sm font-medium">{successMessage}</span>
                      </div>
                    )}

                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Email Address
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <EnvelopeIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                          </div>
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-10 px-4 py-3 rounded-lg border text-black border-gray-300 dark:border-gray-600 focus:border-teal-500 dark:focus:border-teal-400 focus:ring-2 focus:ring-teal-200 dark:focus:ring-teal-900/30 transition-all outline-none dark:bg-gray-700 dark:text-white"
                            placeholder="Enter your email"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border text-black border-gray-300 dark:border-gray-600 focus:border-teal-500 dark:focus:border-teal-400 focus:ring-2 focus:ring-teal-200 dark:focus:ring-teal-900/30 transition-all outline-none pr-12 dark:bg-gray-700 dark:text-white"
                            placeholder="••••••••"
                            required
                            minLength="6"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-3.5 text-gray-400 dark:text-gray-500 hover:text-teal-600 dark:hover:text-teal-400"
                          >
                            {showPassword ? (
                              <EyeSlashIcon className="h-6 w-6" />
                            ) : (
                              <EyeIcon className="h-6 w-6" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="h-4 w-4 text-teal-600 dark:text-teal-500 focus:ring-teal-500 border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700"
                          />
                          <span className="text-sm text-gray-600 dark:text-gray-300">Remember me</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => navigate('/forgot-password')}
                          className="text-sm text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-medium"
                        >
                          Forgot password?
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between mt-8">
                    <button
                      type="button"
                      onClick={prevStep}
                      className="px-6 py-2.5 text-gray-600 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading || successMessage}
                      className={`px-6 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-700 dark:from-teal-700 dark:to-emerald-800 text-white font-semibold rounded-lg transition-all duration-300 flex items-center justify-center hover:shadow-lg ${successMessage ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {loading ? (
                        <>
                          <ArrowPathIcon className="w-5 h-5 animate-spin mr-2" />
                          Signing in...
                        </>
                      ) : (
                        'Sign In'
                      )}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default Login;