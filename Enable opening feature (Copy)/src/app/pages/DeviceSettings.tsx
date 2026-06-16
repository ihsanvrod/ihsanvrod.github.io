import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router';
import {
  ChevronLeft,
  Smartphone,
  Battery,
  Wifi,
  Moon,
  Sun,
  Zap,
  HardDrive,
  Download,
  Globe,
  Palette
} from 'lucide-react';

export default function DeviceSettings() {
  const navigate = useNavigate();
  
  // Load settings from localStorage or use defaults
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('device_darkMode');
    return saved !== null ? JSON.parse(saved) : true;
  });
  
  const [batterySaver, setBatterySaver] = useState(() => {
    const saved = localStorage.getItem('device_batterySaver');
    return saved !== null ? JSON.parse(saved) : false;
  });
  
  const [offlineMode, setOfflineMode] = useState(() => {
    const saved = localStorage.getItem('device_offlineMode');
    return saved !== null ? JSON.parse(saved) : false;
  });
  
  const [autoSync, setAutoSync] = useState(() => {
    const saved = localStorage.getItem('device_autoSync');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [cacheSize, setCacheSize] = useState(() => {
    const saved = localStorage.getItem('device_cacheSize');
    return saved !== null ? parseInt(saved) : 250;
  });

  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('device_language');
    return saved || 'English';
  });

  const [showLanguageModal, setShowLanguageModal] = useState(false);

  // Mark this as the last page visited
  useEffect(() => {
    sessionStorage.setItem('last_page', '/device-settings');
  }, []);

  // Save to localStorage whenever settings change
  useEffect(() => {
    localStorage.setItem('device_darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('device_batterySaver', JSON.stringify(batterySaver));
  }, [batterySaver]);

  useEffect(() => {
    localStorage.setItem('device_offlineMode', JSON.stringify(offlineMode));
  }, [offlineMode]);

  useEffect(() => {
    localStorage.setItem('device_autoSync', JSON.stringify(autoSync));
  }, [autoSync]);

  useEffect(() => {
    localStorage.setItem('device_cacheSize', cacheSize.toString());
  }, [cacheSize]);

  useEffect(() => {
    localStorage.setItem('device_language', language);
  }, [language]);

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    setShowLanguageModal(false);
  };

  const ToggleSwitch = ({ enabled, onChange }: { enabled: boolean; onChange: () => void }) => (
    <button
      onClick={onChange}
      className={`w-12 h-7 rounded-full transition-colors relative ${
        enabled ? 'bg-blue-500' : 'bg-white/20'
      }`}
    >
      <div
        className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );

  const handleClearCache = () => {
    // Simulate clearing cache
    setCacheSize(0);
    setTimeout(() => {
      // Gradually rebuild cache
      setCacheSize(45);
    }, 500);
  };

  return (
    <div className="h-full overflow-y-auto">
      {/* Header */}
      <div className="px-6 pt-4 pb-6 sticky top-0 bg-gradient-to-b from-slate-900 to-slate-900/95 backdrop-blur-xl z-10">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate('/me')}
            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <ChevronLeft className="text-white" size={24} />
          </button>
          <h1 className="text-white text-2xl">Device Settings</h1>
        </div>
      </div>

      <div className="px-6 pb-24 space-y-6">
        {/* Display Settings */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <h3 className="text-white/60 text-xs uppercase tracking-wider mb-3 px-1">Display</h3>
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
            
            {/* Dark Mode */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-10 rounded-full bg-slate-500/20 flex items-center justify-center">
                  {darkMode ? <Moon className="text-slate-400" size={20} /> : <Sun className="text-yellow-400" size={20} />}
                </div>
                <div>
                  <h4 className="text-white font-medium">Dark Mode</h4>
                  <p className="text-white/60 text-xs">Always enabled for safety</p>
                </div>
              </div>
              <ToggleSwitch enabled={darkMode} onChange={() => setDarkMode(!darkMode)} />
            </div>

            {/* App Icon */}
            <button
              onClick={() => navigate('/app-icon')}
              className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <Palette className="text-purple-400" size={20} />
                </div>
                <div className="text-left">
                  <h4 className="text-white font-medium">App Icon</h4>
                  <p className="text-white/60 text-xs">Choose icon colorway</p>
                </div>
              </div>
              <ChevronLeft className="text-white/40 rotate-180" size={20} />
            </button>
          </div>
        </motion.div>

        {/* Performance Settings */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <h3 className="text-white/60 text-xs uppercase tracking-wider mb-3 px-1">Performance</h3>
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
            
            {/* Battery Saver */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Battery className="text-green-400" size={20} />
                </div>
                <div>
                  <h4 className="text-white font-medium">Battery Saver Mode</h4>
                  <p className="text-white/60 text-xs">Reduce background activity</p>
                </div>
              </div>
              <ToggleSwitch enabled={batterySaver} onChange={() => setBatterySaver(!batterySaver)} />
            </div>

            {/* Offline Mode */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                  <Wifi className="text-orange-400" size={20} />
                </div>
                <div>
                  <h4 className="text-white font-medium">Offline Mode</h4>
                  <p className="text-white/60 text-xs">Use cached data only</p>
                </div>
              </div>
              <ToggleSwitch enabled={offlineMode} onChange={() => setOfflineMode(!offlineMode)} />
            </div>

            {/* Auto Sync */}
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <Zap className="text-blue-400" size={20} />
                </div>
                <div>
                  <h4 className="text-white font-medium">Auto Sync</h4>
                  <p className="text-white/60 text-xs">Keep data up to date</p>
                </div>
              </div>
              <ToggleSwitch enabled={autoSync} onChange={() => setAutoSync(!autoSync)} />
            </div>
          </div>
        </motion.div>

        {/* Storage */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-white/60 text-xs uppercase tracking-wider mb-3 px-1">Storage</h3>
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
            
            {/* Cache Size */}
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <HardDrive className="text-purple-400" size={20} />
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-medium">Cache Storage</h4>
                  <p className="text-white/60 text-xs">{cacheSize} MB used</p>
                </div>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-full transition-all duration-500"
                  style={{ width: `${(cacheSize / 500) * 100}%` }}
                />
              </div>
            </div>

            {/* Clear Cache Button */}
            <button 
              onClick={handleClearCache}
              className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                  <Download className="text-red-400 rotate-180" size={20} />
                </div>
                <div className="text-left">
                  <h4 className="text-white font-medium">Clear Cache</h4>
                  <p className="text-white/60 text-xs">Free up storage space</p>
                </div>
              </div>
              <ChevronLeft className="text-white/40 rotate-180" size={20} />
            </button>
          </div>
        </motion.div>

        {/* Language & Region */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-white/60 text-xs uppercase tracking-wider mb-3 px-1">Language & Region</h3>
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
            
            {/* Language Selection */}
            <button
              onClick={() => setShowLanguageModal(true)}
              className="w-full p-4 hover:bg-white/5 transition-colors text-left"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center">
                  <Globe className="text-cyan-400" size={20} />
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-medium">Language</h4>
                  <p className="text-white/60 text-xs">Select your preferred language</p>
                </div>
                <ChevronLeft className="text-white/40 rotate-180" size={20} />
              </div>
              <div className="ml-13 bg-white/10 border border-white/20 rounded-xl px-4 py-3">
                <p className="text-white text-sm">{language}</p>
              </div>
            </button>
          </div>
        </motion.div>

        {/* Device Info */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-white/60 text-xs uppercase tracking-wider mb-3 px-1">Device Information</h3>
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-white/60 text-sm">Device Model</span>
              <span className="text-white text-sm">iPhone 14 Pro</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60 text-sm">iOS Version</span>
              <span className="text-white text-sm">17.4.1</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60 text-sm">App Version</span>
              <span className="text-white text-sm">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60 text-sm">Build Number</span>
              <span className="text-white text-sm">2024.03.26</span>
            </div>
          </div>
        </motion.div>

        {/* Info */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="bg-green-500/10 backdrop-blur-sm rounded-2xl border border-green-500/20 p-4">
            <div className="flex gap-3">
              <Smartphone className="text-green-400 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className="text-white/80 text-sm">
                  Battery Saver Mode will reduce location tracking frequency and limit background updates 
                  to preserve battery life while maintaining essential safety features.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

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
                <h2 className="text-white text-xl font-semibold">Language</h2>
                <p className="text-white/60 text-sm mt-1">Select your preferred language</p>
              </div>

              {/* Modal Content */}
              <div className="overflow-y-auto flex-1">
                <div className="p-3">
                  {[
                    { value: 'English', label: 'English' },
                    { value: 'Spanish', label: 'Español' },
                    { value: 'French', label: 'Français' },
                    { value: 'German', label: 'Deutsch' },
                    { value: 'Chinese', label: '中文' },
                    { value: 'Japanese', label: '日本語' },
                    { value: 'Korean', label: '한국어' },
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
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
