import { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router';
import { Users, MapPin, User, X, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getTranslation } from '../utils/translations';

interface BottomNavProps {
  onClose: () => void;
}

export default function BottomNav({ onClose }: BottomNavProps) {
  const navigate = useNavigate();
  const [isHolding, setIsHolding] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [isActivated, setIsActivated] = useState(false);
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('device_language') || 'English';
  });
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const holdStartRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);
  const activatedTimerRef = useRef<NodeJS.Timeout | null>(null);

  const HOLD_DURATION = 2000; // 2 seconds to activate

  const t = (key: string) => getTranslation(key, language);

  // Listen for language changes
  useEffect(() => {
    const handleLanguageChange = (e: CustomEvent) => {
      setLanguage(e.detail);
    };
    window.addEventListener('language-changed', handleLanguageChange as EventListener);
    return () => {
      window.removeEventListener('language-changed', handleLanguageChange as EventListener);
    };
  }, []);

  const startHold = () => {
    setIsHolding(true);
    holdStartRef.current = Date.now();

    const updateProgress = () => {
      const elapsed = Date.now() - holdStartRef.current;
      const progress = Math.min((elapsed / HOLD_DURATION) * 100, 100);
      setHoldProgress(progress);

      if (progress < 100) {
        animationFrameRef.current = requestAnimationFrame(updateProgress);
      }
    };

    animationFrameRef.current = requestAnimationFrame(updateProgress);

    holdTimerRef.current = setTimeout(() => {
      // SOS activated!
      setHoldProgress(100);
      setIsHolding(false);
      setIsActivated(true);

      // Reset safe days counter
      const now = Date.now();
      localStorage.setItem('quietsafe_last_emergency', now.toString());
      console.log('SOS activated! Safe days reset. Timestamp:', now);

      // Trigger haptic feedback if available
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100, 50, 100]);
      }

      // Dispatch a custom event to notify other components
      window.dispatchEvent(new CustomEvent('sos-activated'));

      // Reset after 3 seconds
      activatedTimerRef.current = setTimeout(() => {
        setIsActivated(false);
        resetHold();
      }, 3000);
    }, HOLD_DURATION);
  };

  const resetHold = () => {
    setIsHolding(false);
    setHoldProgress(0);
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (activatedTimerRef.current) clearTimeout(activatedTimerRef.current);
    };
  }, []);

  return (
    <div className="flex-shrink-0 bg-slate-900/95 backdrop-blur-xl border-t border-white/10 pb-6 pt-10">
      <div className="grid grid-cols-5 items-center px-4 relative">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-1 py-2 rounded-lg transition-colors ${
              isActive ? 'text-blue-400' : 'text-white/60'
            }`
          }
        >
          <Users size={24} />
          <span className="text-xs">{t('people')}</span>
        </NavLink>

        <NavLink
          to="/map"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-1 py-2 rounded-lg transition-colors ${
              isActive ? 'text-blue-400' : 'text-white/60'
            }`
          }
        >
          <MapPin size={24} />
          <span className="text-xs">{t('map')}</span>
        </NavLink>

        {/* Emergency SOS Button - Center */}
        <div className="flex items-center justify-center -mt-10 col-start-3">
          <motion.button
            onTouchStart={startHold}
            onTouchEnd={resetHold}
            onMouseDown={startHold}
            onMouseUp={resetHold}
            onMouseLeave={resetHold}
            whileTap={{ scale: 0.95 }}
            className={`relative w-16 h-16 rounded-full shadow-2xl flex flex-col items-center justify-center text-white transition-all ${
              isActivated
                ? 'bg-gradient-to-br from-green-500 to-green-600 shadow-green-500/50'
                : 'bg-gradient-to-br from-red-500 to-red-600 shadow-red-500/50'
            }`}
          >
            {/* Progress Ring */}
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="rgba(255, 255, 255, 0.2)"
                strokeWidth="3"
                fill="none"
              />
              <motion.circle
                cx="32"
                cy="32"
                r="28"
                stroke="white"
                strokeWidth="3"
                fill="none"
                strokeDasharray={176}
                strokeDashoffset={176 - (176 * holdProgress) / 100}
                strokeLinecap="round"
                transition={{ duration: 0.1 }}
              />
            </svg>

            <AlertTriangle size={20} className={isHolding ? 'animate-pulse' : ''} />
            <span className="text-[10px] font-bold mt-0.5">SOS</span>

            {/* Hold instruction / Activation message */}
            <AnimatePresence>
              {(isHolding || isActivated) && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className={`absolute -top-16 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap shadow-lg ${
                    isActivated
                      ? 'bg-green-500 text-white'
                      : 'bg-red-500 text-white'
                  }`}
                >
                  {isActivated
                    ? 'Alert Sent!'
                    : holdProgress < 100
                    ? 'Hold to activate...'
                    : 'Activating...'}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Success message below button */}
            <AnimatePresence>
              {isActivated && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute -bottom-12 left-1/2 -translate-x-1/2 bg-green-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap shadow-lg text-center"
                >
                  Emergency contacts notified
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>

        <NavLink
          to="/me"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-1 py-2 rounded-lg transition-colors ${
              isActive ? 'text-blue-400' : 'text-white/60'
            }`
          }
        >
          <User size={24} />
          <span className="text-xs">{t('profile')}</span>
        </NavLink>

        <button
          onClick={onClose}
          className="flex flex-col items-center justify-center gap-1 py-2 rounded-lg text-white/60 hover:text-white transition-colors"
        >
          <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
            <X size={16} />
          </div>
          <span className="text-xs">{t('close')}</span>
        </button>
      </div>
    </div>
  );
}
