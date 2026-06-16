import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router';
import {
  ChevronLeft,
  Shield,
  Eye,
  Lock,
  MapPin,
  Users,
  Clock,
  FileText,
  Key,
  AlertTriangle
} from 'lucide-react';
import Modal from '../components/Modal';

export default function PrivacySecurity() {
  const navigate = useNavigate();

  // Modal states
  const [showPinModal, setShowPinModal] = useState(false);
  const [showPinVerifyModal, setShowPinVerifyModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showPasswordSuccess, setShowPasswordSuccess] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pin, setPin] = useState('');
  const [verifyPin, setVerifyPin] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [modalError, setModalError] = useState('');

  // Load settings from localStorage or use defaults
  const [hiddenMode, setHiddenMode] = useState(() => {
    const saved = localStorage.getItem('privacy_hiddenMode');
    return saved !== null ? JSON.parse(saved) : false;
  });
  
  const [autoDeleteLocation, setAutoDeleteLocation] = useState(() => {
    const saved = localStorage.getItem('privacy_autoDeleteLocation');
    return saved !== null ? JSON.parse(saved) : true;
  });
  
  const [requirePin, setRequirePin] = useState(() => {
    const saved = localStorage.getItem('privacy_requirePin');
    return saved !== null ? JSON.parse(saved) : false;
  });
  
  const [biometricLock, setBiometricLock] = useState(() => {
    const saved = localStorage.getItem('privacy_biometricLock');
    return saved !== null ? JSON.parse(saved) : true;
  });
  
  const [shareOnlyWhenActive, setShareOnlyWhenActive] = useState(() => {
    const saved = localStorage.getItem('privacy_shareOnlyWhenActive');
    return saved !== null ? JSON.parse(saved) : false;
  });

  const [locationHistoryDays, setLocationHistoryDays] = useState(() => {
    const saved = localStorage.getItem('privacy_locationHistoryDays');
    return saved !== null ? parseInt(saved) : 7;
  });

  // Save to localStorage whenever settings change
  useEffect(() => {
    localStorage.setItem('privacy_hiddenMode', JSON.stringify(hiddenMode));
  }, [hiddenMode]);

  useEffect(() => {
    localStorage.setItem('privacy_autoDeleteLocation', JSON.stringify(autoDeleteLocation));
  }, [autoDeleteLocation]);

  useEffect(() => {
    localStorage.setItem('privacy_requirePin', JSON.stringify(requirePin));
  }, [requirePin]);

  useEffect(() => {
    localStorage.setItem('privacy_biometricLock', JSON.stringify(biometricLock));
  }, [biometricLock]);

  useEffect(() => {
    localStorage.setItem('privacy_shareOnlyWhenActive', JSON.stringify(shareOnlyWhenActive));
  }, [shareOnlyWhenActive]);

  useEffect(() => {
    localStorage.setItem('privacy_locationHistoryDays', locationHistoryDays.toString());
  }, [locationHistoryDays]);

  // Mark this as the last page visited
  useEffect(() => {
    sessionStorage.setItem('last_page', '/privacy-security');
  }, []);

  const handleSetPin = () => {
    setModalError('');
    if (pin.length !== 4 || !/^\d+$/.test(pin)) {
      setModalError('PIN must be 4 digits');
      return;
    }
    localStorage.setItem('quietsafe_pin', pin);
    setRequirePin(true);
    setShowPinModal(false);
    setPin('');
  };

  const handleVerifyPinToDisable = () => {
    setModalError('');
    const savedPin = localStorage.getItem('quietsafe_pin');
    if (verifyPin !== savedPin) {
      setModalError('Incorrect PIN');
      return;
    }
    setRequirePin(false);
    localStorage.removeItem('quietsafe_pin');
    setShowPinVerifyModal(false);
    setVerifyPin('');
  };

  const handleChangePassword = () => {
    setModalError('');
    const authData = localStorage.getItem('quietsafe_auth');
    if (!authData) {
      setModalError('Not logged in');
      return;
    }

    const auth = JSON.parse(authData);
    const users = JSON.parse(localStorage.getItem('quietsafe_users') || '[]');
    const user = users.find((u: any) => u.email === auth.user.email);

    if (!user || user.password !== currentPassword) {
      setModalError('Current password is incorrect');
      return;
    }

    if (newPassword.length < 6) {
      setModalError('New password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setModalError('Passwords do not match');
      return;
    }

    user.password = newPassword;
    localStorage.setItem('quietsafe_users', JSON.stringify(users));
    setShowPasswordModal(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowPasswordSuccess(true);
    // Hide success message after 3 seconds
    setTimeout(() => setShowPasswordSuccess(false), 3000);
  };

  const handleDeleteAccount = () => {
    localStorage.clear();
    navigate('/auth');
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
          <h1 className="text-white text-2xl">Privacy & Security</h1>
        </div>
      </div>

      <div className="px-6 pb-24 space-y-6">
        {/* Privacy Settings */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <h3 className="text-white/60 text-xs uppercase tracking-wider mb-3 px-1">Privacy</h3>
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
            
            {/* Share Only When Active */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                  <MapPin className="text-green-400" size={20} />
                </div>
                <div>
                  <h4 className="text-white font-medium">Share Only When Active</h4>
                  <p className="text-white/60 text-xs">Stop sharing when app closes</p>
                </div>
              </div>
              <ToggleSwitch enabled={shareOnlyWhenActive} onChange={() => setShareOnlyWhenActive(!shareOnlyWhenActive)} />
            </div>

            {/* Auto-Delete Location History */}
            <div className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                  <Clock className="text-red-400" size={20} />
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-medium">Auto-Delete Location History</h4>
                  <p className="text-white/60 text-xs">After {locationHistoryDays} days</p>
                </div>
              </div>
              <div className="space-y-2">
                <input
                  type="range"
                  min="1"
                  max="90"
                  value={locationHistoryDays}
                  onChange={(e) => setLocationHistoryDays(parseInt(e.target.value))}
                  className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, rgb(59 130 246) 0%, rgb(59 130 246) ${(locationHistoryDays / 90) * 100}%, rgba(255,255,255,0.2) ${(locationHistoryDays / 90) * 100}%, rgba(255,255,255,0.2) 100%)`
                  }}
                />
                <div className="flex justify-between text-white/40 text-xs">
                  <span>1 day</span>
                  <span>90 days</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Security Settings */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <h3 className="text-white/60 text-xs uppercase tracking-wider mb-3 px-1">Security</h3>
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
            
            {/* Biometric Lock */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <Shield className="text-blue-400" size={20} />
                </div>
                <div>
                  <h4 className="text-white font-medium">Face ID / Touch ID</h4>
                  <p className="text-white/60 text-xs">Unlock with biometrics</p>
                </div>
              </div>
              <ToggleSwitch enabled={biometricLock} onChange={() => setBiometricLock(!biometricLock)} />
            </div>

            {/* Require PIN */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center">
                  <Lock className="text-indigo-400" size={20} />
                </div>
                <div>
                  <h4 className="text-white font-medium">Require PIN</h4>
                  <p className="text-white/60 text-xs">Set passcode for app access</p>
                </div>
              </div>
              <ToggleSwitch enabled={requirePin} onChange={() => {
                if (!requirePin) {
                  setShowPinModal(true);
                } else {
                  setShowPinVerifyModal(true);
                }
              }} />
            </div>

            {/* Change Password */}
            <button
              onClick={() => setShowPasswordModal(true)}
              className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <Key className="text-amber-400" size={20} />
                </div>
                <div className="text-left">
                  <h4 className="text-white font-medium">Change Password</h4>
                  <p className="text-white/60 text-xs">Update your account password</p>
                </div>
              </div>
              <ChevronLeft className="text-white/40 rotate-180" size={20} />
            </button>
          </div>
        </motion.div>

        {/* Account Actions */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-white/60 text-xs uppercase tracking-wider mb-3 px-1">Account</h3>
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
            <button
              onClick={() => setShowDeleteModal(true)}
              className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                  <Users className="text-red-400" size={20} />
                </div>
                <div className="text-left">
                  <h4 className="text-white font-medium">Delete Account</h4>
                  <p className="text-white/60 text-xs">Permanently remove your account</p>
                </div>
              </div>
              <ChevronLeft className="text-white/40 rotate-180" size={20} />
            </button>
          </div>
        </motion.div>

        {/* Info */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="bg-indigo-500/10 backdrop-blur-sm rounded-2xl border border-indigo-500/20 p-4">
            <div className="flex gap-3">
              <Shield className="text-indigo-400 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className="text-white/80 text-sm">
                  Your privacy and security are our top priorities. All location data is encrypted 
                  and only shared with contacts you explicitly trust.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* PIN Modal */}
      <Modal isOpen={showPinModal} onClose={() => { setShowPinModal(false); setPin(''); setModalError(''); }} title="Set PIN">
        <div className="space-y-4">
          <p className="text-white/80 text-sm">Enter a 4-digit PIN to secure your app</p>
          <input
            type="tel"
            maxLength={4}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
            placeholder="Enter 4-digit PIN"
            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-white/40 outline-none focus:border-blue-500 text-center text-2xl tracking-widest"
          />
          {modalError && (
            <div className="flex items-center gap-2 bg-red-500/20 border border-red-500/50 rounded-xl p-3">
              <AlertTriangle className="text-red-400" size={16} />
              <p className="text-red-300 text-sm">{modalError}</p>
            </div>
          )}
          <button
            onClick={handleSetPin}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl font-semibold transition-colors"
          >
            Set PIN
          </button>
        </div>
      </Modal>

      {/* Change Password Modal */}
      <Modal isOpen={showPasswordModal} onClose={() => { setShowPasswordModal(false); setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); setModalError(''); }} title="Change Password">
        <div className="space-y-4">
          <div>
            <label className="block text-white/80 text-sm mb-2">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-white/40 outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-white/80 text-sm mb-2">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-white/40 outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-white/80 text-sm mb-2">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-white/40 outline-none focus:border-blue-500"
            />
          </div>
          {modalError && (
            <div className="flex items-center gap-2 bg-red-500/20 border border-red-500/50 rounded-xl p-3">
              <AlertTriangle className="text-red-400" size={16} />
              <p className="text-red-300 text-sm">{modalError}</p>
            </div>
          )}
          <button
            onClick={handleChangePassword}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl font-semibold transition-colors"
          >
            Change Password
          </button>
        </div>
      </Modal>

      {/* PIN Verification Modal */}
      <Modal isOpen={showPinVerifyModal} onClose={() => { setShowPinVerifyModal(false); setVerifyPin(''); setModalError(''); }} title="Verify PIN">
        <div className="space-y-4">
          <p className="text-white/80 text-sm">Enter your PIN to disable PIN protection</p>
          <input
            type="tel"
            maxLength={4}
            value={verifyPin}
            onChange={(e) => setVerifyPin(e.target.value.replace(/\D/g, ''))}
            placeholder="Enter your PIN"
            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-white/40 outline-none focus:border-blue-500 text-center text-2xl tracking-widest"
          />
          {modalError && (
            <div className="flex items-center gap-2 bg-red-500/20 border border-red-500/50 rounded-xl p-3">
              <AlertTriangle className="text-red-400" size={16} />
              <p className="text-red-300 text-sm">{modalError}</p>
            </div>
          )}
          <button
            onClick={handleVerifyPinToDisable}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl font-semibold transition-colors"
          >
            Verify & Disable
          </button>
        </div>
      </Modal>

      {/* Password Success Modal */}
      <Modal isOpen={showPasswordSuccess} onClose={() => setShowPasswordSuccess(false)} title="Success">
        <div className="space-y-4">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
              <Shield className="text-green-400" size={32} />
            </div>
          </div>
          <p className="text-white text-center font-semibold">Password Changed Successfully!</p>
          <p className="text-white/80 text-sm text-center">Your account password has been updated.</p>
          <button
            onClick={() => setShowPasswordSuccess(false)}
            className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-semibold transition-colors"
          >
            Done
          </button>
        </div>
      </Modal>

      {/* Delete Account Modal */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Account">
        <div className="space-y-4">
          <div className="flex items-start gap-3 bg-red-500/20 border border-red-500/50 rounded-xl p-3">
            <AlertTriangle className="text-red-400 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <p className="text-red-300 font-semibold text-sm mb-1">Warning</p>
              <p className="text-red-300/80 text-xs">This action cannot be undone. All your data will be permanently deleted.</p>
            </div>
          </div>
          <p className="text-white/80 text-sm">Are you sure you want to delete your account?</p>
          <div className="flex gap-3">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="flex-1 bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteAccount}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-semibold transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
