import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Clock, AlertCircle, Shield, UserPlus, Copy, Check } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';

const contacts = [
  {
    id: 1,
    name: 'Sarah Johnson',
    location: 'Downtown Coffee Shop',
    distance: '0.3 mi away',
    lastSeen: '2 min ago',
    status: 'safe',
    avatar: '👩‍💼',
    coords: { lat: 37.7749, lng: -122.4194 },
    safeDays: 87
  },
  {
    id: 2,
    name: 'Mike Chen',
    location: 'Golden Gate Park',
    distance: '1.2 mi away',
    lastSeen: '5 min ago',
    status: 'safe',
    avatar: '👨‍💻',
    coords: { lat: 37.7694, lng: -122.4862 },
    safeDays: 142
  },
  {
    id: 3,
    name: 'Emma Davis',
    location: 'Home',
    distance: '2.5 mi away',
    lastSeen: '10 min ago',
    status: 'safe',
    avatar: '👩‍🎨',
    coords: { lat: 37.7599, lng: -122.4148 },
    safeDays: 23
  },
  {
    id: 4,
    name: 'James Wilson',
    location: 'Location unavailable',
    distance: 'Unknown',
    lastSeen: '2 hours ago',
    status: 'unavailable',
    avatar: '👨‍🏫',
    coords: null,
    safeDays: 5
  },
  {
    id: 5,
    name: 'Lisa Anderson',
    location: 'City Gym',
    distance: '0.8 mi away',
    lastSeen: '1 min ago',
    status: 'safe',
    avatar: '👩‍⚕️',
    coords: { lat: 37.7739, lng: -122.4312 },
    safeDays: 201
  }
];

export default function People() {
  const [isHolding, setIsHolding] = useState(false);
  const [isActivated, setIsActivated] = useState(false);
  const [notifiedContacts, setNotifiedContacts] = useState<Set<number>>(new Set());
  const [showAddPeopleModal, setShowAddPeopleModal] = useState(false);
  const [friendCode, setFriendCode] = useState('');
  const [userCode, setUserCode] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [addError, setAddError] = useState('');
  const holdTimerRef = useRef<number | null>(null);
  const navigate = useNavigate();

  // Generate user code on mount
  useEffect(() => {
    // Mark this as the last page visited
    sessionStorage.setItem('last_page', '/');

    let code = localStorage.getItem('quietsafe_user_code');
    if (!code) {
      // Generate a random 8-character code
      code = Math.random().toString(36).substring(2, 10).toUpperCase();
      localStorage.setItem('quietsafe_user_code', code);
    }
    setUserCode(code);
  }, []);

  const handlePointerDown = () => {
    setIsHolding(true);
    holdTimerRef.current = window.setTimeout(() => {
      setIsActivated(true);
      setIsHolding(false);
      // Reset safe days counter
      const now = Date.now();
      localStorage.setItem('quietsafe_last_emergency', now.toString());
      console.log('SOS activated from People page! Safe days reset. Timestamp:', now);
      // Dispatch event to notify other components
      window.dispatchEvent(new CustomEvent('sos-activated'));
    }, 2000); // 2 seconds hold time
  };

  const handlePointerUp = () => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    if (!isActivated) {
      setIsHolding(false);
    }
  };

  const handleNotify = (contactId: number) => {
    setNotifiedContacts(prev => new Set(prev).add(contactId));
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(userCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const handleCopyLink = async () => {
    try {
      const link = `https://quietsafe.app/invite/${userCode}`;
      await navigator.clipboard.writeText(link);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleAddFriend = () => {
    if (!friendCode.trim()) {
      setAddError('Please enter a friend code');
      return;
    }
    if (friendCode.trim().length < 6) {
      setAddError('Invalid friend code');
      return;
    }
    // Simulate adding friend
    console.log('Adding friend with code:', friendCode);
    setAddError('');
    setFriendCode('');
    setShowAddPeopleModal(false);
    // Could show a success message here
  };

  return (
    <div className="h-full overflow-y-auto">
      {/* Header */}
      <div className="px-6 pt-4 pb-6 sticky top-0 bg-gradient-to-b from-slate-900 to-slate-900/95 backdrop-blur-xl z-10">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-white text-3xl">People</h1>
          <button
            onClick={() => setShowAddPeopleModal(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors text-sm"
          >
            <UserPlus size={18} />
            <span>Add People</span>
          </button>
        </div>
        <p className="text-white/60 text-sm">{contacts.filter(c => c.status === 'safe').length} people sharing location</p>
      </div>

      {/* Emergency Alert Section */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`mx-6 mb-6 rounded-2xl p-6 shadow-lg transition-all duration-300 ${
          isActivated 
            ? 'bg-gradient-to-br from-green-500 to-green-600' 
            : isHolding
            ? 'bg-gradient-to-br from-orange-500 to-orange-600'
            : 'bg-gradient-to-br from-red-500 to-red-600'
        }`}
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
            <AlertCircle className="text-white" size={24} />
          </div>
          <div className="flex-1">
            <h3 className="text-white font-semibold">Emergency SOS</h3>
            <p className="text-white/80 text-sm">Press and hold to alert contacts</p>
          </div>
        </div>
        <button 
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          className={`w-full py-3 rounded-xl transition-all select-none touch-none ${
            isActivated
              ? 'bg-white/30 text-white'
              : 'bg-white/20 hover:bg-white/30 text-white'
          }`}
        >
          {isActivated ? 'Alert Sent!' : isHolding ? 'Keep Holding...' : 'Hold to Activate'}
        </button>
        {isActivated && (
          <motion.p 
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-white/90 text-xs text-center mt-2"
          >
            emergency services & trusted contacts will be notified
          </motion.p>
        )}
      </motion.div>

      {/* Contacts List */}
      <div className="px-6 pb-6 space-y-3">
        {contacts.map((contact, index) => {
          const isNotified = notifiedContacts.has(contact.id);
          return (
            <motion.div
              key={contact.id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
            >
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-2xl flex-shrink-0">
                  {contact.avatar}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="text-white font-semibold truncate">{contact.name}</h3>
                    {contact.status === 'safe' && (
                      <span className="w-2 h-2 rounded-full bg-green-400 ml-2 mt-1.5 flex-shrink-0" />
                    )}
                  </div>
                  
                  <div className="flex items-center gap-1.5 text-white/60 text-sm mb-1">
                    <MapPin size={14} />
                    <span className="truncate">{contact.location}</span>
                  </div>

                  <div className="flex items-center gap-4 text-white/50 text-xs mb-2">
                    <span>{contact.distance}</span>
                    <div className="flex items-center gap-1">
                      <Clock size={12} />
                      <span>{contact.lastSeen}</span>
                    </div>
                  </div>

                  {/* Safe Days Badge */}
                  <div className="inline-flex items-center gap-1.5 bg-green-500/10 border border-green-500/30 rounded-lg px-2 py-1">
                    <Shield size={12} className="text-green-400" />
                    <span className="text-green-400 text-xs font-semibold">{contact.safeDays} safe days</span>
                  </div>
                </div>

                {/* Action */}
                {contact.status === 'safe' && (
                  <button
                    onClick={() => handleNotify(contact.id)}
                    className={`text-sm px-4 py-2 rounded-lg transition-colors flex-shrink-0 ${
                      isNotified
                        ? 'text-green-400 bg-green-400/10 hover:bg-green-400/20'
                        : 'text-blue-400 bg-blue-400/10 hover:bg-blue-400/20'
                    }`}
                  >
                    {isNotified ? 'Notified' : 'Notify'}
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Add People Modal */}
      <AnimatePresence>
        {showAddPeopleModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => setShowAddPeopleModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-800 rounded-2xl border border-white/10 max-w-md w-full max-h-[90vh] shadow-2xl overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-white/10">
                <h2 className="text-white text-xl font-semibold">Add People</h2>
                <p className="text-white/60 text-sm mt-1">Share your code or enter a friend's code</p>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-4 overflow-y-auto flex-1">
                {/* Enter Friend Code */}
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Enter Friend's Code
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={friendCode}
                      onChange={(e) => {
                        setFriendCode(e.target.value.toUpperCase());
                        setAddError('');
                      }}
                      placeholder="XXXXXXXX"
                      className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-white/40 outline-none focus:border-blue-500 focus:bg-white/15 transition-all uppercase"
                      maxLength={8}
                    />
                    <button
                      onClick={handleAddFriend}
                      className="px-5 py-3 rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition-colors font-medium"
                    >
                      Add
                    </button>
                  </div>
                  {addError && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-400 text-xs mt-2"
                    >
                      {addError}
                    </motion.p>
                  )}
                </div>

                <div className="border-t border-white/10 pt-4">
                  <p className="text-white/60 text-sm mb-3">Or share your code:</p>

                  {/* Your Code */}
                  <div className="mb-3">
                    <label className="block text-white/80 text-sm font-medium mb-2">
                      Your Code
                    </label>
                    <div className="flex gap-2">
                      <div className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white font-mono text-lg flex items-center justify-center">
                        {userCode}
                      </div>
                      <button
                        onClick={handleCopyCode}
                        className={`px-4 py-3 rounded-xl transition-all font-medium flex items-center gap-2 ${
                          copiedCode
                            ? 'bg-green-500 text-white'
                            : 'bg-white/10 text-white hover:bg-white/20'
                        }`}
                      >
                        {copiedCode ? (
                          <>
                            <Check size={18} />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy size={18} />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Your Link */}
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">
                      Shareable Link
                    </label>
                    <div className="flex gap-2">
                      <div className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white text-sm truncate">
                        quietsafe.app/invite/{userCode}
                      </div>
                      <button
                        onClick={handleCopyLink}
                        className={`px-4 py-3 rounded-xl transition-all font-medium flex items-center gap-2 ${
                          copiedLink
                            ? 'bg-green-500 text-white'
                            : 'bg-white/10 text-white hover:bg-white/20'
                        }`}
                      >
                        {copiedLink ? (
                          <>
                            <Check size={18} />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy size={18} />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-white/10">
                <button
                  onClick={() => setShowAddPeopleModal(false)}
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