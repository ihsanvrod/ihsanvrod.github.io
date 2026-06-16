import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { ChevronLeft, Check } from 'lucide-react';
import logoDefault from '../quietSafeLogo.jpg';
import logoPurple from '../quietSafeLogo_PURPLE.jpg';
import logoGreen from '../quietSafeLogo_GREEN.jpg';
import logoRed from '../quietSafeLogo_RED.jpg';
import logoOrange from '../quietSafeLogo_ORANGE.jpg';
import logoBlue from '../quietSafeLogo_BLUE.jpg';

export default function AppIcon() {
  const navigate = useNavigate();

  const [selectedIcon, setSelectedIcon] = useState(() => {
    return localStorage.getItem('app_icon') || 'default';
  });

  // Mark this as the last page visited
  useEffect(() => {
    sessionStorage.setItem('last_page', '/app-icon');
  }, []);

  const iconOptions = [
    { id: 'default', name: 'Default', description: 'Original QuietSafe', image: logoDefault },
    { id: 'purple', name: 'Purple', description: 'Violet colorway', image: logoPurple },
    { id: 'green', name: 'Green', description: 'Forest colorway', image: logoGreen },
    { id: 'red', name: 'Red', description: 'Ruby colorway', image: logoRed },
    { id: 'orange', name: 'Orange', description: 'Sunset colorway', image: logoOrange },
    { id: 'blue', name: 'Blue', description: 'Ocean colorway', image: logoBlue },
  ];

  const handleSelectIcon = (iconId: string) => {
    setSelectedIcon(iconId);
    localStorage.setItem('app_icon', iconId);
  };

  return (
    <div className="h-full overflow-y-auto">
      {/* Header */}
      <div className="px-6 pt-4 pb-6 sticky top-0 bg-gradient-to-b from-slate-900 to-slate-900/95 backdrop-blur-xl z-10">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate('/device-settings')}
            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <ChevronLeft className="text-white" size={24} />
          </button>
          <h1 className="text-white text-2xl">App Icon</h1>
        </div>
        <p className="text-white/60 text-sm">Choose your preferred icon colorway</p>
      </div>

      <div className="px-6 pb-24">
        <div className="grid grid-cols-3 gap-4">
          {iconOptions.map((option, index) => (
            <motion.button
              key={option.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => handleSelectIcon(option.id)}
              className={`relative bg-white/5 backdrop-blur-sm rounded-2xl border transition-all p-4 ${
                selectedIcon === option.id
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-white/10 hover:bg-white/10'
              }`}
            >
              {/* Selected Indicator */}
              {selectedIcon === option.id && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                  <Check className="text-white" size={14} />
                </div>
              )}

              {/* Icon Preview */}
              <div className="w-full aspect-square rounded-2xl overflow-hidden mb-3 shadow-xl">
                <img
                  src={option.image}
                  alt={option.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Icon Info */}
              <div className="text-center">
                <h3 className="text-white font-semibold text-sm mb-0.5">{option.name}</h3>
                <p className="text-white/60 text-xs">{option.description}</p>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6 bg-blue-500/10 backdrop-blur-sm rounded-2xl border border-blue-500/20 p-4"
        >
          <p className="text-white/80 text-sm">
            Your selected icon will be displayed on the home screen. This feature allows you to personalize
            your QuietSafe experience while maintaining discretion.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
