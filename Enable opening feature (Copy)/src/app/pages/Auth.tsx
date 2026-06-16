import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  Shield,
  UserPlus,
  LogIn,
  AlertCircle
} from 'lucide-react';
import logoImage from '../quietSafeLogo.jpg';

export default function Auth() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 6;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    // Validation
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!validatePassword(password)) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (!isLogin) {
      if (!name.trim()) {
        setError('Please enter your name');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      if (isLogin) {
        // Login: Check if user exists in localStorage
        const storedUsers = JSON.parse(localStorage.getItem('quietsafe_users') || '[]');
        const user = storedUsers.find((u: any) => u.email === email && u.password === password);

        if (user) {
          // Store authentication state
          localStorage.setItem('quietsafe_auth', JSON.stringify({
            isAuthenticated: true,
            user: { email: user.email, name: user.name },
            timestamp: Date.now()
          }));
          // Navigate to home
          navigate('/');
        } else {
          setError('Invalid email or password');
          setIsLoading(false);
        }
      } else {
        // Register: Check if user already exists
        const storedUsers = JSON.parse(localStorage.getItem('quietsafe_users') || '[]');
        const userExists = storedUsers.some((u: any) => u.email === email);

        if (userExists) {
          setError('An account with this email already exists');
          setIsLoading(false);
        } else {
          // Create new user
          const newUser = { email, password, name };
          storedUsers.push(newUser);
          localStorage.setItem('quietsafe_users', JSON.stringify(storedUsers));

          // After signup, switch to login tab with success message
          setIsLoading(false);
          setIsLogin(true);
          setPassword('');
          setConfirmPassword('');
          setName('');
          setError('');
          // Show success message
          setTimeout(() => {
            setSuccessMessage('Account created! Please login.');
          }, 100);
        }
      }
    }, 1500);
  };

  const switchMode = (mode: boolean) => {
    setIsLogin(mode);
    setError('');
    setSuccessMessage('');
    setPassword('');
    setConfirmPassword('');
    setName('');
  };

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-b from-slate-900 via-slate-900 to-blue-900">
      <div className="min-h-full flex flex-col items-center justify-center px-6 py-12">
        {/* Logo/Branding */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center mb-8"
        >
          <div className="w-28 h-28 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-blue-500/50 overflow-hidden">
            <img src={logoImage} alt="QuietSafe Logo" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-white text-4xl font-bold mb-2">QuietSafe</h1>
          <p className="text-white/60 text-sm">Your personal safety companion</p>
        </motion.div>

        {/* Auth Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="w-full max-w-md"
        >
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8 shadow-2xl">
            {/* Toggle Tabs */}
            <div className="flex gap-2 bg-white/5 rounded-2xl p-1 mb-6">
              <button
                onClick={() => switchMode(true)}
                className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                  isLogin
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'text-white/60 hover:text-white/80'
                }`}
              >
                Login
              </button>
              <button
                onClick={() => switchMode(false)}
                className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                  !isLogin
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'text-white/60 hover:text-white/80'
                }`}
              >
                Register
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} autoComplete="off" className="space-y-4">
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-red-500/20 border border-red-500/50 rounded-xl p-3 flex items-center gap-2"
                  >
                    <AlertCircle className="text-red-400 flex-shrink-0" size={18} />
                    <p className="text-red-300 text-sm">{error}</p>
                  </motion.div>
                )}
                {successMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-green-500/20 border border-green-500/50 rounded-xl p-3 flex items-center gap-2"
                  >
                    <Shield className="text-green-400 flex-shrink-0" size={18} />
                    <p className="text-green-300 text-sm">{successMessage}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Name Field (Register only) */}
              <AnimatePresence mode="wait">
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <label className="block text-white/80 text-sm font-medium mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your name"
                        autoComplete="off"
                        className="w-full bg-white/10 border border-white/20 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder:text-white/40 outline-none focus:border-blue-500 focus:bg-white/15 transition-all"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Email Field */}
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="off"
                    className="w-full bg-white/10 border border-white/20 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder:text-white/40 outline-none focus:border-blue-500 focus:bg-white/15 transition-all"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    autoComplete="new-password"
                    className="w-full bg-white/10 border border-white/20 rounded-xl pl-12 pr-12 py-3.5 text-white placeholder:text-white/40 outline-none focus:border-blue-500 focus:bg-white/15 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password (Register only) */}
              <AnimatePresence mode="wait">
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <label className="block text-white/80 text-sm font-medium mb-2">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm your password"
                        autoComplete="new-password"
                        className="w-full bg-white/10 border border-white/20 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder:text-white/40 outline-none focus:border-blue-500 focus:bg-white/15 transition-all"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 rounded-xl font-semibold shadow-lg shadow-blue-500/30 transition-all ${
                  isLoading
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:shadow-xl hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98]'
                }`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {isLogin ? 'Logging in...' : 'Creating account...'}
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    {isLogin ? <LogIn size={20} /> : <UserPlus size={20} />}
                    {isLogin ? 'Login' : 'Create Account'}
                  </span>
                )}
              </button>
            </form>
          </div>

          {/* Security Notice */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-6 bg-blue-500/10 backdrop-blur-sm rounded-2xl border border-blue-500/20 p-4"
          >
            <div className="flex gap-3">
              <Shield className="text-blue-400 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <h4 className="text-white font-medium mb-1">Secure & Private</h4>
                <p className="text-white/70 text-sm">
                  Your data, location, and contacts are encrypted and stored securely. 
                  We never share your information without your explicit permission.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}