import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { 
  ChevronLeft, 
  Bell, 
  MessageSquare, 
  AlertTriangle, 
  MapPin,
  Users,
  BellRing,
  Volume2
} from 'lucide-react';

export default function Notifications() {
  const navigate = useNavigate();
  
  // Load settings from localStorage or use defaults
  const [emergencyAlerts, setEmergencyAlerts] = useState(() => {
    const saved = localStorage.getItem('notif_emergencyAlerts');
    return saved !== null ? JSON.parse(saved) : true;
  });
  
  const [contactRequests, setContactRequests] = useState(() => {
    const saved = localStorage.getItem('notif_contactRequests');
    return saved !== null ? JSON.parse(saved) : true;
  });
  
  const [locationUpdates, setLocationUpdates] = useState(() => {
    const saved = localStorage.getItem('notif_locationUpdates');
    return saved !== null ? JSON.parse(saved) : true;
  });
  
  const [checkInReminders, setCheckInReminders] = useState(() => {
    const saved = localStorage.getItem('notif_checkInReminders');
    return saved !== null ? JSON.parse(saved) : true;
  });
  
  const [soundEffects, setSoundEffects] = useState(() => {
    const saved = localStorage.getItem('notif_soundEffects');
    return saved !== null ? JSON.parse(saved) : true;
  });
  
  const [vibration, setVibration] = useState(() => {
    const saved = localStorage.getItem('notif_vibration');
    return saved !== null ? JSON.parse(saved) : true;
  });

  // Mark this as the last page visited
  useEffect(() => {
    sessionStorage.setItem('last_page', '/notifications');
  }, []);

  // Save to localStorage whenever settings change
  useEffect(() => {
    localStorage.setItem('notif_emergencyAlerts', JSON.stringify(emergencyAlerts));
  }, [emergencyAlerts]);

  useEffect(() => {
    localStorage.setItem('notif_contactRequests', JSON.stringify(contactRequests));
  }, [contactRequests]);

  useEffect(() => {
    localStorage.setItem('notif_locationUpdates', JSON.stringify(locationUpdates));
  }, [locationUpdates]);

  useEffect(() => {
    localStorage.setItem('notif_checkInReminders', JSON.stringify(checkInReminders));
  }, [checkInReminders]);

  useEffect(() => {
    localStorage.setItem('notif_soundEffects', JSON.stringify(soundEffects));
  }, [soundEffects]);

  useEffect(() => {
    localStorage.setItem('notif_vibration', JSON.stringify(vibration));
  }, [vibration]);

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
          <h1 className="text-white text-2xl">Notifications</h1>
        </div>
      </div>

      <div className="px-6 pb-24 space-y-6">
        {/* Alert Types */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <h3 className="text-white/60 text-xs uppercase tracking-wider mb-3 px-1">Alert Types</h3>
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
            
            {/* Emergency Alerts */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                  <AlertTriangle className="text-red-400" size={20} />
                </div>
                <div>
                  <h4 className="text-white font-medium">Emergency Alerts</h4>
                  <p className="text-white/60 text-xs">Urgent safety notifications</p>
                </div>
              </div>
              <ToggleSwitch enabled={emergencyAlerts} onChange={() => setEmergencyAlerts(!emergencyAlerts)} />
            </div>

            {/* Contact Requests */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <Users className="text-blue-400" size={20} />
                </div>
                <div>
                  <h4 className="text-white font-medium">Contact Requests</h4>
                  <p className="text-white/60 text-xs">New trusted contact invitations</p>
                </div>
              </div>
              <ToggleSwitch enabled={contactRequests} onChange={() => setContactRequests(!contactRequests)} />
            </div>

            {/* Location Updates */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                  <MapPin className="text-green-400" size={20} />
                </div>
                <div>
                  <h4 className="text-white font-medium">Location Updates</h4>
                  <p className="text-white/60 text-xs">When contacts share locations</p>
                </div>
              </div>
              <ToggleSwitch enabled={locationUpdates} onChange={() => setLocationUpdates(!locationUpdates)} />
            </div>

            {/* Check-in Reminders */}
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <BellRing className="text-purple-400" size={20} />
                </div>
                <div>
                  <h4 className="text-white font-medium">Check-in Reminders</h4>
                  <p className="text-white/60 text-xs">Scheduled safety check-ins</p>
                </div>
              </div>
              <ToggleSwitch enabled={checkInReminders} onChange={() => setCheckInReminders(!checkInReminders)} />
            </div>
          </div>
        </motion.div>

        {/* Notification Settings */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <h3 className="text-white/60 text-xs uppercase tracking-wider mb-3 px-1">Sound & Haptics</h3>
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
            
            {/* Sound Effects */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <Volume2 className="text-amber-400" size={20} />
                </div>
                <div>
                  <h4 className="text-white font-medium">Sound Effects</h4>
                  <p className="text-white/60 text-xs">Play sounds for notifications</p>
                </div>
              </div>
              <ToggleSwitch enabled={soundEffects} onChange={() => setSoundEffects(!soundEffects)} />
            </div>

            {/* Vibration */}
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center">
                  <Bell className="text-pink-400" size={20} />
                </div>
                <div>
                  <h4 className="text-white font-medium">Vibration</h4>
                  <p className="text-white/60 text-xs">Haptic feedback for alerts</p>
                </div>
              </div>
              <ToggleSwitch enabled={vibration} onChange={() => setVibration(!vibration)} />
            </div>
          </div>
        </motion.div>

        {/* Info */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="bg-blue-500/10 backdrop-blur-sm rounded-2xl border border-blue-500/20 p-4">
            <div className="flex gap-3">
              <Bell className="text-blue-400 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className="text-white/80 text-sm">
                  Emergency alerts will always show, even when notifications are disabled. 
                  You can manage app notification permissions in your iPhone Settings.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
