import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router';
import { 
  ChevronLeft, 
  Radio,
  AlertTriangle,
  MapPin,
  Clock,
  Volume2,
  Shield,
  Info,
  Navigation,
  WifiOff,
  CheckCircle2
} from 'lucide-react';

interface Tracker {
  id: string;
  name: string;
  type: string;
  lastSeen: string;
  duration: string;
  distance: string;
  batteryLevel: number;
  isActive: boolean;
  firstDetected: string;
  locations: string[];
}

export default function TrackingDetection() {
  const navigate = useNavigate();
  const [selectedTracker, setSelectedTracker] = useState<Tracker | null>(null);
  const [playingSound, setPlayingSound] = useState(false);
  const [showDisableInstructions, setShowDisableInstructions] = useState(false);

  // Initialize trackers from localStorage or use default
  const defaultTrackers: Tracker[] = [
    {
      id: 'AT-3847-XK',
      name: 'Unknown AirTag',
      type: 'Apple AirTag',
      lastSeen: '2 minutes ago',
      duration: '2 hours 34 minutes',
      distance: '~15 feet',
      batteryLevel: 78,
      isActive: true,
      firstDetected: 'Today at 3:47 PM',
      locations: [
        'Franklin Delano Roosevelt HS',
        'Bay Parkway Station',
        '20th Avenue',
        'Your current location'
      ]
    }
  ];

  // Load trackers from localStorage or use defaults
  const [detectedTrackers, setDetectedTrackers] = useState<Tracker[]>(() => {
    const saved = localStorage.getItem('quietsafe_disabled_trackers');
    if (saved) {
      const disabledIds = JSON.parse(saved);
      return defaultTrackers.filter(t => !disabledIds.includes(t.id));
    }
    return defaultTrackers;
  });

  const [previousTrackers, setPreviousTrackers] = useState<Tracker[]>([
    {
      id: 'TB-9234-LP',
      name: 'Tile Pro',
      type: 'Tile Tracker',
      lastSeen: '3 days ago',
      duration: '45 minutes',
      distance: 'N/A',
      batteryLevel: 0,
      isActive: false,
      firstDetected: 'March 23 at 11:20 AM',
      locations: [
        'Atlantic Terminal',
        'Flatbush Avenue'
      ]
    }
  ]);

  const handlePlaySound = () => {
    setPlayingSound(true);
    // Simulate playing sound for 3 seconds
    setTimeout(() => {
      setPlayingSound(false);
    }, 3000);
  };

  const handleShowDisableInstructions = () => {
    setShowDisableInstructions(true);
  };

  // Mark this as the last page visited
  useEffect(() => {
    sessionStorage.setItem('last_page', '/tracking-detection');
  }, []);

  const handleMarkAsDisabled = (trackerId: string) => {
    // Save disabled tracker ID to localStorage
    const saved = localStorage.getItem('quietsafe_disabled_trackers');
    const disabledIds = saved ? JSON.parse(saved) : [];
    if (!disabledIds.includes(trackerId)) {
      disabledIds.push(trackerId);
      localStorage.setItem('quietsafe_disabled_trackers', JSON.stringify(disabledIds));
    }

    // Remove from active trackers
    setDetectedTrackers(prev => prev.filter(t => t.id !== trackerId));
    setSelectedTracker(null);
    setShowDisableInstructions(false);
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
          <h1 className="text-white text-2xl">Tracking Detection</h1>
        </div>
      </div>

      <div className="px-6 pb-24 space-y-6">
        {/* Active Alert */}
        {detectedTrackers.length > 0 && (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl p-6 shadow-2xl shadow-red-500/30"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="text-white" size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-bold text-lg mb-1">Unknown Tracker Detected</h3>
                <p className="text-white/90 text-sm mb-4">
                  An unrecognized Bluetooth tracker has been moving with you for over 2 hours.
                </p>
                <button
                  onClick={() => setSelectedTracker(detectedTrackers[0])}
                  className="bg-white text-red-600 px-6 py-2.5 rounded-xl font-semibold hover:bg-white/90 transition-colors"
                >
                  View Details & Actions
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Status */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                detectedTrackers.length > 0 ? 'bg-red-500/20' : 'bg-green-500/20'
              }`}>
                <Radio className={detectedTrackers.length > 0 ? 'text-red-400' : 'text-green-400'} size={20} />
              </div>
              <div className="flex-1">
                <h4 className="text-white font-medium">Bluetooth Scanning</h4>
                <p className="text-white/60 text-xs">
                  {detectedTrackers.length > 0 
                    ? `${detectedTrackers.length} active tracker${detectedTrackers.length > 1 ? 's' : ''} detected`
                    : 'No suspicious trackers detected'
                  }
                </p>
              </div>
              <div className={`w-3 h-3 rounded-full ${
                detectedTrackers.length > 0 ? 'bg-red-500 animate-pulse' : 'bg-green-500'
              }`} />
            </div>
          </div>
        </motion.div>

        {/* Active Trackers */}
        {detectedTrackers.length > 0 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="text-white/60 text-xs uppercase tracking-wider mb-3 px-1">Active Trackers</h3>
            <div className="space-y-3">
              {detectedTrackers.map((tracker, index) => (
                <motion.button
                  key={tracker.id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setSelectedTracker(tracker)}
                  className="w-full bg-white/5 backdrop-blur-sm rounded-2xl border border-red-500/30 p-4 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                      <Radio className="text-red-400" size={24} />
                    </div>
                    <div className="flex-1 text-left">
                      <h4 className="text-white font-semibold">{tracker.name}</h4>
                      <p className="text-white/60 text-sm">{tracker.type}</p>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-white/5 rounded-lg p-2">
                      <div className="text-white/60 mb-1">Last Seen</div>
                      <div className="text-white font-medium">{tracker.lastSeen}</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-2">
                      <div className="text-white/60 mb-1">Duration</div>
                      <div className="text-white font-medium">{tracker.duration}</div>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Previous Detections */}
        {previousTrackers.length > 0 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-white/60 text-xs uppercase tracking-wider mb-3 px-1">Previous Detections</h3>
            <div className="space-y-3">
              {previousTrackers.map((tracker, index) => (
                <motion.button
                  key={tracker.id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  onClick={() => setSelectedTracker(tracker)}
                  className="w-full bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-4 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                      <CheckCircle2 className="text-white/60" size={20} />
                    </div>
                    <div className="flex-1 text-left">
                      <h4 className="text-white font-medium">{tracker.name}</h4>
                      <p className="text-white/60 text-sm">{tracker.lastSeen}</p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* How It Works */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-white/60 text-xs uppercase tracking-wider mb-3 px-1">How It Works</h3>
          <div className="bg-blue-500/10 backdrop-blur-sm rounded-2xl border border-blue-500/20 p-4">
            <div className="flex gap-3 mb-4">
              <Shield className="text-blue-400 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <h4 className="text-white font-medium mb-2">Protection Against Unwanted Tracking</h4>
                <p className="text-white/80 text-sm mb-3">
                  QuietSafe continuously scans for Bluetooth trackers (AirTags, Tiles, etc.) that might be following you.
                </p>
                <ul className="space-y-2 text-white/70 text-sm">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />
                    <span>Alerts you if an unknown tracker moves with you for 15+ minutes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />
                    <span>Shows the tracker's location history and distance</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />
                    <span>Helps you play a sound to locate the physical tracker</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />
                    <span>Provides instructions to disable the tracker</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Tracker Detail Modal */}
      <AnimatePresence>
        {selectedTracker && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTracker(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50"
            />

            {/* Modal */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="absolute inset-x-0 bottom-0 bg-slate-900 rounded-t-3xl z-50 max-h-[85vh] overflow-y-auto"
            >
              <div className="px-6 py-6">
                {/* Handle */}
                <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-6" />

                {/* Header */}
                <div className="flex items-start gap-4 mb-6">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                    selectedTracker.isActive ? 'bg-red-500/20' : 'bg-white/10'
                  }`}>
                    <Radio className={selectedTracker.isActive ? 'text-red-400' : 'text-white/60'} size={28} />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-white text-2xl font-bold mb-1">{selectedTracker.name}</h2>
                    <p className="text-white/60">{selectedTracker.type}</p>
                    <p className="text-white/40 text-sm mt-1">ID: {selectedTracker.id}</p>
                  </div>
                  {selectedTracker.isActive && (
                    <div className="flex items-center gap-2 bg-red-500/20 px-3 py-1.5 rounded-full">
                      <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      <span className="text-red-400 text-sm font-medium">Active</span>
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="bg-white/5 rounded-xl p-4">
                    <Clock className="text-white/60 mb-2" size={20} />
                    <div className="text-white/60 text-xs mb-1">Following Duration</div>
                    <div className="text-white font-semibold">{selectedTracker.duration}</div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4">
                    <MapPin className="text-white/60 mb-2" size={20} />
                    <div className="text-white/60 text-xs mb-1">Distance</div>
                    <div className="text-white font-semibold">{selectedTracker.distance}</div>
                  </div>
                </div>

                {/* First Detected */}
                <div className="bg-white/5 rounded-xl p-4 mb-6">
                  <div className="text-white/60 text-sm mb-1">First Detected</div>
                  <div className="text-white font-medium">{selectedTracker.firstDetected}</div>
                </div>

                {/* Location History */}
                <div className="mb-6">
                  <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <MapPin size={18} />
                    Location History
                  </h3>
                  <div className="space-y-2">
                    {selectedTracker.locations.map((location, index) => (
                      <div key={index} className="flex items-center gap-3 bg-white/5 rounded-lg p-3">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                        <span className="text-white/80 text-sm">{location}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                {selectedTracker.isActive && !showDisableInstructions && (
                  <div className="space-y-3">
                    <button
                      onClick={handlePlaySound}
                      disabled={playingSound}
                      className={`w-full flex items-center justify-center gap-3 py-4 rounded-xl font-semibold transition-colors ${
                        playingSound
                          ? 'bg-green-500 text-white'
                          : 'bg-blue-500 hover:bg-blue-600 text-white'
                      }`}
                    >
                      <Volume2 size={20} />
                      {playingSound ? 'Playing Sound...' : 'Play Sound to Locate'}
                    </button>

                    <button
                      onClick={() => navigate('/map')}
                      className="w-full flex items-center justify-center gap-3 bg-purple-500 hover:bg-purple-600 text-white py-4 rounded-xl font-semibold transition-colors"
                    >
                      <Navigation size={20} />
                      View on Map
                    </button>

                    <button
                      onClick={handleShowDisableInstructions}
                      className="w-full flex items-center justify-center gap-3 bg-red-500 hover:bg-red-600 text-white py-4 rounded-xl font-semibold transition-colors"
                    >
                      <WifiOff size={20} />
                      Get Disable Instructions
                    </button>

                    <button
                      onClick={() => {
                        setSelectedTracker(null);
                        setShowDisableInstructions(false);
                      }}
                      className="w-full bg-white/10 hover:bg-white/20 text-white py-4 rounded-xl font-semibold transition-colors"
                    >
                      Close
                    </button>
                  </div>
                )}

                {/* Disable Instructions */}
                {selectedTracker.isActive && showDisableInstructions && (
                  <div className="space-y-4">
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                      <h4 className="text-red-400 font-semibold mb-3 flex items-center gap-2">
                        <WifiOff size={18} />
                        How to Disable an AirTag
                      </h4>
                      <ol className="space-y-3 text-white/80 text-sm">
                        <li className="flex gap-3">
                          <span className="text-red-400 font-bold flex-shrink-0">1.</span>
                          <span>Locate the AirTag by playing sound or following the distance indicator</span>
                        </li>
                        <li className="flex gap-3">
                          <span className="text-red-400 font-bold flex-shrink-0">2.</span>
                          <span>Press down on the white side of the AirTag and rotate counterclockwise until the cover stops rotating</span>
                        </li>
                        <li className="flex gap-3">
                          <span className="text-red-400 font-bold flex-shrink-0">3.</span>
                          <span>Remove the cover and the battery</span>
                        </li>
                        <li className="flex gap-3">
                          <span className="text-red-400 font-bold flex-shrink-0">4.</span>
                          <span>Keep the AirTag and battery as evidence for law enforcement</span>
                        </li>
                        <li className="flex gap-3">
                          <span className="text-red-400 font-bold flex-shrink-0">5.</span>
                          <span>Contact local police and file a report for potential stalking</span>
                        </li>
                      </ol>
                    </div>

                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                      <p className="text-blue-400 text-xs">
                        <Info className="inline mr-1" size={14} />
                        <strong>Important:</strong> Do not throw away the tracker. It can be used as evidence. Take photos and document the serial number.
                      </p>
                    </div>

                    <button
                      onClick={() => handleMarkAsDisabled(selectedTracker.id)}
                      className="w-full flex items-center justify-center gap-3 bg-green-500 hover:bg-green-600 text-white py-4 rounded-xl font-semibold transition-colors"
                    >
                      <CheckCircle2 size={20} />
                      Mark as Disabled
                    </button>

                    <button
                      onClick={() => setShowDisableInstructions(false)}
                      className="w-full bg-white/10 hover:bg-white/20 text-white py-4 rounded-xl font-semibold transition-colors"
                    >
                      Back
                    </button>
                  </div>
                )}

                {!selectedTracker.isActive && (
                  <button
                    onClick={() => setSelectedTracker(null)}
                    className="w-full bg-white/10 hover:bg-white/20 text-white py-4 rounded-xl font-semibold transition-colors"
                  >
                    Close
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
