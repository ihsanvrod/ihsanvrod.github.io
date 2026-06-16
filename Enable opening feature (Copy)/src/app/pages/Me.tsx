import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router';
import { getTranslation, speak } from '../utils/translations';
import {
  User,
  Bell,
  Shield,
  Activity,
  AlertTriangle,
  MapPin,
  ChevronRight,
  ChevronLeft,
  Moon,
  Smartphone,
  Radio,
  LogOut,
  Volume2,
  Globe
} from 'lucide-react';

export default function Me() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  // Get user info from auth
  const [userInfo, setUserInfo] = useState<{ name: string; email: string }>({
    name: 'You',
    email: 'you@example.com'
  });

  const [safeDays, setSafeDays] = useState(0);
  const [activeTrackers, setActiveTrackers] = useState(1);
  const [showLanguageConfirm, setShowLanguageConfirm] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showScreenReaderConfirm, setShowScreenReaderConfirm] = useState(false);

  useEffect(() => {
    // Only restore scroll position if coming from a subpage, not from other main pages
    const lastPage = sessionStorage.getItem('last_page');
    const savedScrollPosition = sessionStorage.getItem('me_scroll_position');

    if (savedScrollPosition && containerRef.current &&
        (lastPage === '/notifications' || lastPage === '/privacy-security' ||
         lastPage === '/device-settings' || lastPage === '/tracking-detection' ||
         lastPage === '/app-icon')) {
      // Coming back from a subpage, restore position
      containerRef.current.scrollTop = parseInt(savedScrollPosition);
    } else {
      // Coming from a different main page or first visit, start at top
      if (containerRef.current) {
        containerRef.current.scrollTop = 0;
      }
      sessionStorage.removeItem('me_scroll_position');
    }

    // Save current page
    sessionStorage.setItem('last_page', '/me');

    // Check for disabled trackers
    const disabledTrackers = localStorage.getItem('quietsafe_disabled_trackers');
    const disabledIds = disabledTrackers ? JSON.parse(disabledTrackers) : [];
    // Default is 1 tracker (AT-3847-XK), subtract if it's been disabled
    const activeCount = disabledIds.includes('AT-3847-XK') ? 0 : 1;
    setActiveTrackers(activeCount);
    const authData = localStorage.getItem('quietsafe_auth');
    if (authData) {
      try {
        const auth = JSON.parse(authData);
        if (auth.user) {
          setUserInfo(auth.user);
        }
      } catch (error) {
        console.error('Error loading user info:', error);
      }
    }

    // Calculate safe days
    const calculateSafeDays = () => {
      const lastEmergency = localStorage.getItem('quietsafe_last_emergency');
      if (!lastEmergency) {
        // If no emergency recorded, initialize with account creation or default date
        const defaultStart = new Date('2024-01-01').getTime();
        const daysSince = Math.floor((Date.now() - defaultStart) / (1000 * 60 * 60 * 24));
        setSafeDays(daysSince);
      } else {
        const lastDate = parseInt(lastEmergency);
        const daysSince = Math.floor((Date.now() - lastDate) / (1000 * 60 * 60 * 24));
        setSafeDays(daysSince);
      }
    };

    calculateSafeDays();
    // Update every minute in case day changes
    const interval = setInterval(calculateSafeDays, 60000);

    // Listen for SOS activation events
    const handleSOSActivated = () => {
      console.log('SOS event received, recalculating safe days');
      calculateSafeDays();
    };
    window.addEventListener('sos-activated', handleSOSActivated);

    // Save scroll position on scroll
    const handleScroll = () => {
      if (containerRef.current) {
        sessionStorage.setItem('me_scroll_position', containerRef.current.scrollTop.toString());
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
    }

    return () => {
      clearInterval(interval);
      window.removeEventListener('sos-activated', handleSOSActivated);
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);
  
  // Load settings from localStorage or use defaults
  const [motionTracking, setMotionTracking] = useState(() => {
    const saved = localStorage.getItem('safety_motionTracking');
    return saved !== null ? JSON.parse(saved) : true;
  });
  
  const [dangerDetection, setDangerDetection] = useState(() => {
    const saved = localStorage.getItem('safety_dangerDetection');
    return saved !== null ? JSON.parse(saved) : true;
  });
  
  const [locationSharing, setLocationSharing] = useState(() => {
    const saved = localStorage.getItem('safety_locationSharing');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [screenReader, setScreenReader] = useState(() => {
    const saved = localStorage.getItem('accessibility_screenReader');
    return saved !== null ? JSON.parse(saved) : false;
  });

  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('device_language');
    return saved || 'English';
  });

  // Save to localStorage when toggles change
  const toggleMotionTracking = () => {
    const newValue = !motionTracking;
    setMotionTracking(newValue);
    localStorage.setItem('safety_motionTracking', JSON.stringify(newValue));
  };

  const toggleDangerDetection = () => {
    const newValue = !dangerDetection;
    setDangerDetection(newValue);
    localStorage.setItem('safety_dangerDetection', JSON.stringify(newValue));
  };

  const toggleLocationSharing = () => {
    const newValue = !locationSharing;
    setLocationSharing(newValue);
    localStorage.setItem('safety_locationSharing', JSON.stringify(newValue));
  };

  const toggleScreenReader = () => {
    const newValue = !screenReader;
    setScreenReader(newValue);
    localStorage.setItem('accessibility_screenReader', JSON.stringify(newValue));

    // Speak confirmation immediately with the new state
    const message = newValue
      ? getTranslation('screenReaderEnabled', language)
      : getTranslation('screenReaderDisabled', language);

    // Force speak even if screen reader was previously off
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.lang = language === 'Spanish' ? 'es-ES' :
                     language === 'French' ? 'fr-FR' :
                     language === 'German' ? 'de-DE' :
                     language === 'Chinese' ? 'zh-CN' :
                     language === 'Japanese' ? 'ja-JP' :
                     language === 'Korean' ? 'ko-KR' :
                     language === 'Portuguese' ? 'pt-PT' :
                     language === 'Italian' ? 'it-IT' :
                     language === 'Russian' ? 'ru-RU' :
                     language === 'Arabic' ? 'ar-SA' : 'en-US';
    window.speechSynthesis.speak(utterance);

    // Show brief confirmation
    setShowScreenReaderConfirm(true);
    setTimeout(() => setShowScreenReaderConfirm(false), 2000);
  };

  const handleButtonClick = (text: string) => {
    speak(text, language);
  };

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    localStorage.setItem('device_language', newLanguage);
    // Dispatch event to notify other components
    window.dispatchEvent(new CustomEvent('language-changed', { detail: newLanguage }));
    // Show brief confirmation
    setShowLanguageConfirm(true);
    setTimeout(() => setShowLanguageConfirm(false), 2000);
    setShowLanguageModal(false);
  };

  const t = (key: string) => getTranslation(key, language);

  return (
    <div ref={containerRef} className="h-full overflow-y-auto">
      {/* Header */}
      <div className="px-6 pt-4 pb-6 sticky top-0 bg-gradient-to-b from-slate-900 to-slate-900/95 backdrop-blur-xl z-10">
        <h1 className="text-white text-3xl mb-6">{t('profileTitle')}</h1>
        
        {/* Profile Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-6"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-3xl">
              🙋‍♀️
            </div>
            <div className="flex-1">
              <h2 className="text-white text-xl font-semibold">{userInfo.name}</h2>
              <p className="text-white/80 text-sm">{userInfo.email}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/10 rounded-xl p-3">
              <div className="text-white/60 text-xs mb-1">{t('contacts')}</div>
              <div className="text-white text-xl font-semibold">5</div>
            </div>
            <div className="bg-white/10 rounded-xl p-3">
              <div className="text-white/60 text-xs mb-1">{t('safeDays')}</div>
              <div className="text-white text-xl font-semibold">{safeDays}</div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="px-6 pb-24 space-y-6">
        {/* Safety Settings */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <h3 className="text-white/60 text-xs uppercase tracking-wider mb-3 px-1">{t('safetyFeatures')}</h3>
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
            
            {/* Motion Tracking */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <Activity className="text-blue-400" size={20} />
                </div>
                <div>
                  <h4 className="text-white font-medium">{t('motionTracking')}</h4>
                  <p className="text-white/60 text-xs">{t('motionTrackingDesc')}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  toggleMotionTracking();
                  handleButtonClick(t('motionTracking'));
                }}
                className={`w-12 h-7 rounded-full transition-colors relative ${
                  motionTracking ? 'bg-blue-500' : 'bg-white/20'
                }`}
              >
                <div
                  className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-transform ${
                    motionTracking ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Danger Detection */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                  <AlertTriangle className="text-red-400" size={20} />
                </div>
                <div>
                  <h4 className="text-white font-medium">{t('dangerDetection')}</h4>
                  <p className="text-white/60 text-xs">{t('dangerDetectionDesc')}</p>
                </div>
              </div>
              <button
                onClick={toggleDangerDetection}
                className={`w-12 h-7 rounded-full transition-colors relative ${
                  dangerDetection ? 'bg-blue-500' : 'bg-white/20'
                }`}
              >
                <div
                  className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-transform ${
                    dangerDetection ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Location Sharing */}
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                  <MapPin className="text-green-400" size={20} />
                </div>
                <div>
                  <h4 className="text-white font-medium">Location Sharing</h4>
                  <p className="text-white/60 text-xs">Share with trusted contacts</p>
                </div>
              </div>
              <button
                onClick={toggleLocationSharing}
                className={`w-12 h-7 rounded-full transition-colors relative ${
                  locationSharing ? 'bg-blue-500' : 'bg-white/20'
                }`}
              >
                <div
                  className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-transform ${
                    locationSharing ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Tracking Detection */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
        >
          <h3 className="text-white/60 text-xs uppercase tracking-wider mb-3 px-1">{t('security')}</h3>
          <button
            onClick={() => navigate('/tracking-detection')}
            className={`w-full backdrop-blur-sm rounded-2xl border p-4 transition-colors ${
              activeTrackers > 0
                ? 'bg-gradient-to-br from-red-500/10 to-orange-500/10 border-red-500/30 hover:bg-red-500/20'
                : 'bg-gradient-to-br from-green-500/10 to-green-500/10 border-green-500/30 hover:bg-green-500/20'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                activeTrackers > 0 ? 'bg-red-500/20' : 'bg-green-500/20'
              }`}>
                <Radio className={activeTrackers > 0 ? 'text-red-400' : 'text-green-400'} size={24} />
              </div>
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-white font-semibold">Tracking Detection</h4>
                  {activeTrackers > 0 ? (
                    <div className="flex items-center gap-1 bg-red-500/20 px-2 py-0.5 rounded-full">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                      <span className="text-red-400 text-xs font-medium">{activeTrackers} Active</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 bg-green-500/20 px-2 py-0.5 rounded-full">
                      <Shield className="text-green-400" size={12} />
                      <span className="text-green-400 text-xs font-medium">Clear</span>
                    </div>
                  )}
                </div>
                <p className="text-white/70 text-sm">
                  {activeTrackers > 0 ? 'Unknown tracker detected nearby' : 'No trackers detected'}
                </p>
              </div>
              <ChevronRight className="text-white/40" size={20} />
            </div>
          </button>
        </motion.div>

        {/* Preferences */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-white/60 text-xs uppercase tracking-wider mb-3 px-1">{t('preferences')}</h3>
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
            
            <button 
              onClick={() => navigate('/notifications')}
              className="w-full flex items-center justify-between p-4 border-b border-white/10 hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <Bell className="text-purple-400" size={20} />
                </div>
                <span className="text-white font-medium">{t('notifications')}</span>
              </div>
              <ChevronRight className="text-white/40" size={20} />
            </button>

            <button 
              onClick={() => navigate('/privacy-security')}
              className="w-full flex items-center justify-between p-4 border-b border-white/10 hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center">
                  <Shield className="text-indigo-400" size={20} />
                </div>
                <span className="text-white font-medium">{t('privacySecurity')}</span>
              </div>
              <ChevronRight className="text-white/40" size={20} />
            </button>

            <button
              onClick={() => navigate('/device-settings')}
              className="w-full flex items-center justify-between p-4 border-b border-white/10 hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-500/20 flex items-center justify-center">
                  <Smartphone className="text-slate-400" size={20} />
                </div>
                <span className="text-white font-medium">{t('deviceSettings')}</span>
              </div>
              <ChevronRight className="text-white/40" size={20} />
            </button>

            {/* Screen Reader */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center">
                  <Volume2 className="text-cyan-400" size={20} />
                </div>
                <div>
                  <h4 className="text-white font-medium">{t('screenReader')}</h4>
                  <p className="text-white/60 text-xs">{t('screenReaderDesc')}</p>
                </div>
              </div>
              <button
                onClick={toggleScreenReader}
                className={`w-12 h-7 rounded-full transition-colors relative ${
                  screenReader ? 'bg-blue-500' : 'bg-white/20'
                }`}
              >
                <div
                  className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-transform ${
                    screenReader ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Language Selection */}
            <button
              onClick={() => {
                setShowLanguageModal(true);
                handleButtonClick(t('language'));
              }}
              className="w-full p-4 hover:bg-white/5 transition-colors text-left"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-teal-500/20 flex items-center justify-center">
                  <Globe className="text-teal-400" size={20} />
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-medium">{t('language')}</h4>
                  <p className="text-white/60 text-xs">{t('languageDesc')}</p>
                </div>
                <ChevronLeft className="text-white/40 rotate-180" size={20} />
              </div>
              <div className="ml-13 bg-white/10 border border-white/20 rounded-xl px-4 py-3">
                <p className="text-white text-sm">{language}</p>
              </div>
            </button>
          </div>
        </motion.div>

        {/* About */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-white/60 text-xs uppercase tracking-wider mb-3 px-1">About</h3>
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-4">
            <div className="text-center">
              <h4 className="text-white font-semibold mb-1">QuietSafe</h4>
              <p className="text-white/60 text-sm mb-2">Version 1.0.0</p>
              <p className="text-white/40 text-xs">Your personal safety companion</p>
            </div>
          </div>
        </motion.div>

        {/* Logout */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-white/60 text-xs uppercase tracking-wider mb-3 px-1">Account</h3>
          <button
            onClick={() => {
              localStorage.removeItem('quietsafe_auth');
              navigate('/auth');
            }}
            className="w-full bg-gradient-to-br from-red-500/10 to-orange-500/10 backdrop-blur-sm rounded-2xl border border-red-500/30 p-4 hover:bg-red-500/20 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                <LogOut className="text-red-400" size={24} />
              </div>
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-white font-semibold">Logout</h4>
                </div>
                <p className="text-white/70 text-sm">Sign out of your account</p>
              </div>
              <ChevronRight className="text-white/40" size={20} />
            </div>
          </button>
        </motion.div>
      </div>

      {/* Language Change Confirmation */}
      <AnimatePresence>
        {showLanguageConfirm && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2"
          >
            <Globe size={18} />
            <span className="font-medium">{t('languageChanged')} {language}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Screen Reader Confirmation */}
      <AnimatePresence>
        {showScreenReaderConfirm && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-blue-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2"
          >
            <Volume2 size={18} />
            <span className="font-medium">{screenReader ? t('screenReaderEnabled') : t('screenReaderDisabled')}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Language Selection Modal */}
      <AnimatePresence>
        {showLanguageModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => setShowLanguageModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-800 rounded-2xl border border-white/10 max-w-md w-full max-h-[90vh] shadow-2xl overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-white/10 flex-shrink-0">
                <h2 className="text-white text-xl font-semibold">{t('language')}</h2>
                <p className="text-white/60 text-sm mt-1">{t('languageDesc')}</p>
              </div>

              {/* Modal Content */}
              <div className="overflow-y-auto flex-1">
                <div className="p-3">
                  {[
                    { value: 'English', label: 'English' },
                    { value: 'Spanish', label: 'Español' },
                    { value: 'French', label: 'Français' },
                    { value: 'German', label: 'Deutsch' },
                    { value: 'Portuguese', label: 'Português' },
                    { value: 'Italian', label: 'Italiano' },
                    { value: 'Russian', label: 'Русский' },
                    { value: 'Chinese', label: '中文' },
                    { value: 'Japanese', label: '日本語' },
                    { value: 'Korean', label: '한국어' },
                    { value: 'Arabic', label: 'العربية' },
                  ].map((lang) => (
                    <button
                      key={lang.value}
                      onClick={() => handleLanguageChange(lang.value)}
                      className={`w-full p-4 rounded-xl mb-2 transition-all text-left ${
                        language === lang.value
                          ? 'bg-blue-500 text-white'
                          : 'bg-white/5 text-white hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{lang.label}</span>
                        {language === lang.value && (
                          <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-white/10 flex-shrink-0">
                <button
                  onClick={() => setShowLanguageModal(false)}
                  className="w-full py-3 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors font-medium"
                >
                  {t('close')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}