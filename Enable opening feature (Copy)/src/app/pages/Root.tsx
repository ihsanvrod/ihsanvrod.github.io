import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router';
import {
  Shield,
  Users,
  Map,
  Bell,
  User,
  Camera,
  MessageSquare,
  Phone,
  Mail,
  Music,
  Compass,
  Cloud,
  Calendar,
  Clock,
  Calculator,
  Settings,
  Heart,
  BookOpen,
  Flashlight,
  Battery,
  Wifi,
  Signal,
  Power,
  Delete,
  Lock
} from 'lucide-react';
import BottomNav from '../components/BottomNav';
import { motion, AnimatePresence } from 'motion/react';
import logoDefault from '../quietSafeLogo.jpg';
import logoPurple from '../quietSafeLogo_PURPLE.jpg';
import logoGreen from '../quietSafeLogo_GREEN.jpg';
import logoRed from '../quietSafeLogo_RED.jpg';
import logoOrange from '../quietSafeLogo_ORANGE.jpg';
import logoBlue from '../quietSafeLogo_BLUE.jpg';

export default function Root() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLocked, setIsLocked] = useState(true);
  const [isAppOpen, setIsAppOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [swipeStartY, setSwipeStartY] = useState<number | null>(null);
  const [swipeCurrentY, setSwipeCurrentY] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [appIcon, setAppIcon] = useState(logoDefault);
  const [showPinEntry, setShowPinEntry] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  // Check authentication on mount
  useEffect(() => {
    // Initialize test credentials if not exists
    const existingUsers = localStorage.getItem('quietsafe_users');
    if (!existingUsers) {
      const testUser = {
        name: 'tester',
        email: 'abc@gmail.com',
        password: 'abcdef'
      };
      localStorage.setItem('quietsafe_users', JSON.stringify([testUser]));
    }

    const authData = localStorage.getItem('quietsafe_auth');
    if (authData) {
      try {
        const auth = JSON.parse(authData);
        setIsAuthenticated(auth.isAuthenticated || false);
      } catch (e) {
        setIsAuthenticated(false);
      }
    }
    setIsCheckingAuth(false);
  }, []);

  // Re-check authentication when location changes (for logout)
  useEffect(() => {
    const authData = localStorage.getItem('quietsafe_auth');
    if (authData) {
      try {
        const auth = JSON.parse(authData);
        setIsAuthenticated(auth.isAuthenticated || false);
      } catch (e) {
        setIsAuthenticated(false);
      }
    } else {
      setIsAuthenticated(false);
    }

    // Load app icon
    const iconId = localStorage.getItem('app_icon') || 'default';
    const iconImages: Record<string, string> = {
      'default': logoDefault,
      'purple': logoPurple,
      'green': logoGreen,
      'red': logoRed,
      'orange': logoOrange,
      'blue': logoBlue,
    };
    setAppIcon(iconImages[iconId] || logoDefault);
  }, [location.pathname]);

  const handleIconClick = () => {
    // If not authenticated, go straight to auth - no PIN needed
    if (!isAuthenticated) {
      setIsAppOpen(true);
      navigate('/auth');
      return;
    }

    // Only check for PIN if user is authenticated
    const savedPin = localStorage.getItem('quietsafe_pin');
    const requirePin = localStorage.getItem('privacy_requirePin');

    if (savedPin && requirePin === 'true') {
      // Show PIN entry
      setShowPinEntry(true);
      setPinInput('');
      setPinError('');
    } else {
      // Open app directly
      setIsAppOpen(true);
    }
  };

  const handlePinSubmit = () => {
    const savedPin = localStorage.getItem('quietsafe_pin');
    if (pinInput === savedPin) {
      // Correct PIN
      setShowPinEntry(false);
      setPinInput('');
      setPinError('');
      setIsAppOpen(true);
      // If not authenticated, navigate to auth page
      if (!isAuthenticated) {
        navigate('/auth');
      }
    } else {
      // Wrong PIN
      setPinError('Incorrect PIN');
      setPinInput('');
    }
  };

  const handlePinButtonPress = (num: string) => {
    if (pinInput.length < 4) {
      const newPin = pinInput + num;
      setPinInput(newPin);
      setPinError('');

      // Auto-submit when 4 digits entered
      if (newPin.length === 4) {
        setTimeout(() => {
          const savedPin = localStorage.getItem('quietsafe_pin');
          if (newPin === savedPin) {
            setShowPinEntry(false);
            setPinInput('');
            setPinError('');
            setIsAppOpen(true);
            if (!isAuthenticated) {
              navigate('/auth');
            }
          } else {
            setPinError('Incorrect PIN');
            setPinInput('');
          }
        }, 100);
      }
    }
  };

  const handlePinDelete = () => {
    setPinInput(pinInput.slice(0, -1));
    setPinError('');
  };

  const handlePinCancel = () => {
    setShowPinEntry(false);
    setPinInput('');
    setPinError('');
  };

  const handleCloseApp = () => {
    setIsAppOpen(false);
    setTimeout(() => navigate('/'), 300);
  };

  // Universal pointer handlers for lock screen
  const handleLockPointerDown = (e: React.PointerEvent | React.TouchEvent) => {
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setSwipeStartY(clientY);
    setIsDragging(true);
  };

  const handleLockPointerMove = (e: React.PointerEvent | React.TouchEvent) => {
    if (swipeStartY !== null && isDragging) {
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      setSwipeCurrentY(clientY);
    }
  };

  const handleLockPointerUp = () => {
    if (swipeStartY !== null && swipeCurrentY !== null) {
      const diff = swipeStartY - swipeCurrentY;
      if (diff > 80) { // Swiped up at least 80px
        setIsLocked(false);
      }
    }
    setSwipeStartY(null);
    setSwipeCurrentY(null);
    setIsDragging(false);
  };

  // Universal pointer handlers for app close
  const handleAppPointerDown = (e: React.PointerEvent | React.TouchEvent) => {
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const rect = e.currentTarget.getBoundingClientRect();
    const relativeY = clientY - rect.top;
    
    // Only handle swipe from bottom 25% of screen
    if (relativeY > rect.height * 0.75) {
      setSwipeStartY(clientY);
      setIsDragging(true);
    }
  };

  const handleAppPointerMove = (e: React.PointerEvent | React.TouchEvent) => {
    if (swipeStartY !== null && isDragging) {
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      setSwipeCurrentY(clientY);
    }
  };

  const handleAppPointerUp = () => {
    if (swipeStartY !== null && swipeCurrentY !== null) {
      const diff = swipeStartY - swipeCurrentY;
      if (diff > 100) { // Swiped up at least 100px from bottom
        handleCloseApp();
      }
    }
    setSwipeStartY(null);
    setSwipeCurrentY(null);
    setIsDragging(false);
  };

  // Don't render until we've checked authentication
  if (isCheckingAuth) {
    return null;
  }

  const navItems = [
    { path: '/', icon: Users, label: 'People' },
    { path: '/map', icon: Map, label: 'Map' },
    { path: '/notifications', icon: Bell, label: 'Alerts' },
    { path: '/me', icon: User, label: 'Me' },
  ];

  // Default iPhone apps for home screen
  const defaultApps = [
    { name: 'Camera', icon: Camera, color: 'from-gray-600 to-gray-800' },
    { name: 'Messages', icon: MessageSquare, color: 'from-green-500 to-green-600' },
    { name: 'Phone', icon: Phone, color: 'from-green-400 to-green-500' },
    { name: 'Mail', icon: Mail, color: 'from-blue-500 to-blue-600' },
    { name: 'Music', icon: Music, color: 'from-pink-500 to-red-500' },
    { name: 'Safari', icon: Compass, color: 'from-blue-400 to-blue-500' },
    { name: 'QuietSafe', icon: Shield, color: 'from-blue-500 to-purple-600', action: handleIconClick },
    { name: 'Weather', icon: Cloud, color: 'from-sky-400 to-blue-500' },
    { name: 'Calendar', icon: Calendar, color: 'from-red-500 to-red-600' },
    { name: 'Clock', icon: Clock, color: 'from-orange-500 to-orange-600' },
    { name: 'Calculator', icon: Calculator, color: 'from-gray-700 to-gray-800' },
    { name: 'Settings', icon: Settings, color: 'from-gray-600 to-gray-700' },
    { name: 'Health', icon: Heart, color: 'from-pink-500 to-pink-600' },
    { name: 'Books', icon: BookOpen, color: 'from-orange-500 to-red-500' },
  ];

  const swipeOffset = swipeStartY !== null && swipeCurrentY !== null 
    ? Math.max(0, Math.min(300, swipeStartY - swipeCurrentY))
    : 0;

  // Always render the iPhone frame
  return (
    <div className="size-full flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="relative w-[375px] h-[812px] bg-black rounded-[50px] shadow-2xl p-3">
        {/* Notch */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-40 h-7 bg-black rounded-b-3xl z-50" />
        
        <div className="relative size-full bg-gradient-to-br from-blue-950 via-purple-950 to-indigo-950 rounded-[42px] overflow-hidden">
          
          {/* Lock Screen */}
          {isLocked && (
            <div 
              className="absolute inset-0 bg-gradient-to-b from-indigo-900 via-purple-900 to-pink-900 select-none"
              onPointerDown={handleLockPointerDown}
              onPointerMove={handleLockPointerMove}
              onPointerUp={handleLockPointerUp}
              onPointerLeave={handleLockPointerUp}
              onTouchStart={handleLockPointerDown}
              onTouchMove={handleLockPointerMove}
              onTouchEnd={handleLockPointerUp}
              style={{ touchAction: 'none' }}
            >
              {/* Status Bar */}
              <div className="absolute top-0 left-0 right-0 h-11 flex items-center justify-between px-8 pt-2 text-white z-10">
                <div className="flex items-center gap-1">
                  <Signal size={14} />
                  <Wifi size={14} />
                </div>
                <div className="flex items-center gap-1">
                  <Battery size={18} />
                  <span className="text-xs">100%</span>
                </div>
              </div>

              {/* Time and Date */}
              <div className="absolute top-24 left-0 right-0 flex flex-col items-center">
                <div className="text-white text-7xl font-light tracking-tight">9:41</div>
                <div className="text-white text-lg font-medium mt-1">Monday, March 30</div>
              </div>

              {/* Notification Cards */}
              <div className="absolute top-64 left-4 right-4 space-y-3">
                <div className="bg-white/15 backdrop-blur-xl rounded-3xl p-4 border border-white/10">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                      <img src={appIcon} alt="QuietSafe Logo" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-semibold text-sm">QuietSafe</div>
                      <div className="text-white/80 text-sm mt-0.5">Your safety companion is ready</div>
                    </div>
                    <div className="text-white/60 text-xs flex-shrink-0">now</div>
                  </div>
                </div>
              </div>

              {/* Bottom Controls */}
              <div 
                className="absolute bottom-8 left-0 right-0 flex flex-col items-center transition-transform"
                style={{ 
                  transform: `translateY(-${swipeOffset * 0.5}px)`,
                  opacity: Math.max(0.3, 1 - swipeOffset / 200)
                }}
              >
                {/* Flashlight and Camera buttons */}
                <div className="flex items-center justify-between w-full px-12 mb-8">
                  <button className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center">
                    <Flashlight className="text-white" size={22} />
                  </button>
                  <button className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center">
                    <Camera className="text-white" size={22} />
                  </button>
                </div>

                {/* Swipe indicator */}
                <div className="flex flex-col items-center gap-2">
                  <div className="w-32 h-1.5 bg-white/40 rounded-full" />
                  <div className="text-white/70 text-sm font-medium">Swipe up to unlock</div>
                </div>
              </div>

              {/* Unlock animation overlay */}
              {swipeOffset > 50 && (
                <div 
                  className="absolute inset-0 bg-black/50 backdrop-blur-sm pointer-events-none"
                  style={{ opacity: Math.min(1, swipeOffset / 150) }}
                />
              )}
            </div>
          )}

          {/* PIN Entry Screen */}
          <AnimatePresence>
            {showPinEntry && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-gradient-to-b from-slate-900 to-slate-800 z-50 flex flex-col items-center justify-between py-20"
              >
                {/* Header */}
                <div className="flex flex-col items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-blue-500/20 flex items-center justify-center overflow-hidden">
                    <img src={appIcon} alt="QuietSafe Logo" className="w-full h-full object-cover" />
                  </div>
                  <h2 className="text-white text-2xl font-semibold">Enter PIN</h2>
                  {pinError && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-400 text-sm"
                    >
                      {pinError}
                    </motion.p>
                  )}
                </div>

                {/* PIN Dots */}
                <div className="flex items-center gap-4">
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={`w-4 h-4 rounded-full border-2 transition-all ${
                        pinInput.length > i
                          ? 'bg-blue-500 border-blue-500'
                          : 'bg-transparent border-white/40'
                      }`}
                    />
                  ))}
                </div>

                {/* Number Pad */}
                <div className="w-full max-w-xs px-8">
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                      <button
                        key={num}
                        onClick={() => handlePinButtonPress(num.toString())}
                        className="w-full aspect-square rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 text-white text-2xl font-light transition-colors flex items-center justify-center"
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <button
                      onClick={handlePinCancel}
                      className="w-full aspect-square rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 text-white text-sm font-medium transition-colors flex items-center justify-center"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handlePinButtonPress('0')}
                      className="w-full aspect-square rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 text-white text-2xl font-light transition-colors flex items-center justify-center"
                    >
                      0
                    </button>
                    <button
                      onClick={handlePinDelete}
                      className="w-full aspect-square rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 text-white transition-colors flex items-center justify-center"
                    >
                      <Delete size={24} />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Home Screen */}
          {!isLocked && !isAppOpen && !showPinEntry && (
            <div className="absolute inset-0 flex flex-col p-8 pt-16">
              {/* Status Bar */}
              <div className="flex items-center justify-between mb-8 text-white text-xs">
                <div className="flex items-center gap-1">
                  <Signal size={12} />
                  <Wifi size={12} />
                  <span>Carrier</span>
                </div>
                <span>9:41</span>
                <div className="flex items-center gap-1">
                  <Battery size={14} />
                  <button 
                    onClick={() => setIsLocked(true)}
                    className="ml-2 p-1.5 hover:bg-white/10 rounded-full transition-colors"
                    title="Lock screen"
                  >
                    <Power size={12} />
                  </button>
                </div>
              </div>
              
              <div className="flex-1 grid grid-cols-4 gap-6 content-start">
                {defaultApps.map((app, index) => {
                  const Icon = app.icon;
                  return (
                    <button
                      key={index}
                      onClick={app.action || undefined}
                      className="flex flex-col items-center gap-2 cursor-pointer group"
                    >
                      <div className={`w-14 h-14 bg-gradient-to-br ${app.color} rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform ${app.name === 'QuietSafe' ? 'overflow-hidden p-0' : ''}`}>
                        {app.name === 'QuietSafe' ? (
                          <img src={appIcon} alt="QuietSafe Logo" className="w-full h-full object-cover" />
                        ) : (
                          <Icon className="text-white" size={28} />
                        )}
                      </div>
                      <span className={`text-white text-xs ${app.name === 'QuietSafe' ? 'font-bold' : ''}`}>{app.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Dock */}
              <div className="mt-auto h-24 bg-white/10 backdrop-blur-xl rounded-3xl p-4 flex items-center justify-around">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-xl">
                  <Phone className="text-white" size={28} />
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-sky-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-xl">
                  <Compass className="text-white" size={28} />
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-xl">
                  <MessageSquare className="text-white" size={28} />
                </div>
              </div>

              {/* Home indicator */}
              <div className="h-8 flex items-center justify-center">
                <div className="w-32 h-1 bg-white/30 rounded-full" />
              </div>
            </div>
          )}
          
          {/* App Open */}
          {isAppOpen && (
            <div 
              className="absolute inset-0 bg-slate-900 flex flex-col"
              onPointerDown={handleAppPointerDown}
              onPointerMove={handleAppPointerMove}
              onPointerUp={handleAppPointerUp}
              onPointerLeave={handleAppPointerUp}
              onTouchStart={handleAppPointerDown}
              onTouchMove={handleAppPointerMove}
              onTouchEnd={handleAppPointerUp}
              style={{ touchAction: 'pan-y' }}
            >
              {/* Status Bar */}
              <div className="h-11 flex items-center justify-between px-6 pt-2">
                <div className="flex items-center gap-1 text-white text-xs">
                  <Signal size={12} />
                  <Wifi size={12} />
                </div>
                <span className="text-white text-sm">9:41</span>
                <div className="flex items-center gap-1 text-white text-xs">
                  <Battery size={14} />
                </div>
              </div>
              
              {/* Main Content */}
              <div className="flex-1 overflow-hidden">
                <Outlet />
              </div>
              
              {/* Bottom Navigation - hide on auth page and special pages */}
              {location.pathname !== '/auth' &&
               location.pathname !== '/privacy-security' &&
               location.pathname !== '/device-settings' &&
               location.pathname !== '/tracking-detection' &&
               location.pathname !== '/app-icon' && (
                <BottomNav onClose={handleCloseApp} />
              )}

              {/* Home indicator bar at bottom */}
              <div className="h-8 flex items-center justify-center bg-slate-900">
                <div className="w-32 h-1 bg-white/30 rounded-full" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}