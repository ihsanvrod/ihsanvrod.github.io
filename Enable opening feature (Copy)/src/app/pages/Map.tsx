import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Navigation, Users as UsersIcon, Camera, AlertTriangle, Search, X, Route as RouteIcon, Shield, ChevronDown, ChevronUp, Footprints, Bike, Car, Bus } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import L from 'leaflet';
import 'leaflet.markercluster';
import 'leaflet-routing-machine';

// Fix for default marker icons
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const myLocation = { lat: 40.6782, lng: -73.9442 };

const fdrHighSchool = { 
  name: 'Franklin Delano Roosevelt High School',
  lat: 40.6110, 
  lng: -73.9865,
  address: '5800 20th Avenue'
};

const contactLocations = [
  { id: 1, name: 'Sarah Johnson', lat: 40.6790, lng: -73.9455, avatar: '👩‍💼' },
  { id: 2, name: 'Mike Chen', lat: 40.6501, lng: -73.9496, avatar: '👨‍💻' },
  { id: 3, name: 'Emma Davis', lat: 40.7089, lng: -73.9420, avatar: '👩‍🎨' },
  { id: 5, name: 'Lisa Anderson', lat: 40.6650, lng: -73.9626, avatar: '👩‍⚕️' },
];

// Local danger incidents (mock data from public emergency communications)
type IncidentType = 'shooting' | 'robbery' | 'assault' | 'crash' | 'fire' | 'medical' | 'suspicious';
type IncidentSeverity = 'critical' | 'high' | 'medium' | 'low';

interface Incident {
  id: string;
  type: IncidentType;
  title: string;
  description: string;
  lat: number;
  lng: number;
  timestamp: string;
  severity: IncidentSeverity;
  source: string;
}

// Borough boundaries for dynamic loading
const boroughBounds = {
  brooklyn: { minLat: 40.55, maxLat: 40.74, minLng: -74.05, maxLng: -73.83 },
  manhattan: { minLat: 40.70, maxLat: 40.88, minLng: -74.02, maxLng: -73.91 },
  bronx: { minLat: 40.79, maxLat: 40.92, minLng: -73.93, maxLng: -73.75 },
  queens: { minLat: 40.54, maxLat: 40.80, minLng: -73.96, maxLng: -73.70 },
  statenIsland: { minLat: 40.49, maxLat: 40.65, minLng: -74.26, maxLng: -74.05 }
};

// Brooklyn incidents only (initial load)
const brooklynIncidents: Incident[] = [
  // Critical Incidents
  {
    id: 'inc1',
    type: 'shooting',
    title: 'Shots Fired',
    description: 'Multiple gunshots reported. Police responding.',
    lat: 40.6890,
    lng: -73.9520,
    timestamp: '12 min ago',
    severity: 'critical',
    source: 'Police Radio'
  },
  {
    id: 'inc4',
    type: 'fire',
    title: 'Structure Fire',
    description: 'Residential fire. FDNY on scene.',
    lat: 40.6420,
    lng: -73.9650,
    timestamp: '1 hr ago',
    severity: 'critical',
    source: 'Fire Radio'
  },
  {
    id: 'inc13',
    type: 'shooting',
    title: 'Active Shooter',
    description: 'Active shooter situation. Shelter in place.',
    lat: 40.6750,
    lng: -73.9100,
    timestamp: '18 min ago',
    severity: 'critical',
    source: 'Police Radio'
  },
  {
    id: 'inc14',
    type: 'fire',
    title: 'Building Fire',
    description: 'Commercial building fire. Multiple alarms.',
    lat: 40.7100,
    lng: -73.9450,
    timestamp: '32 min ago',
    severity: 'critical',
    source: 'Fire Radio'
  },
  {
    id: 'inc15',
    type: 'shooting',
    title: 'Gunfire Reported',
    description: 'Shots fired at intersection. Multiple victims.',
    lat: 40.6580,
    lng: -73.9850,
    timestamp: '45 min ago',
    severity: 'critical',
    source: 'Police Radio'
  },

  // High Severity Incidents
  {
    id: 'inc2',
    type: 'robbery',
    title: 'Armed Robbery',
    description: 'Store robbery in progress. Suspect fled on foot.',
    lat: 40.7020,
    lng: -73.9380,
    timestamp: '28 min ago',
    severity: 'high',
    source: 'Police Radio'
  },
  {
    id: 'inc3',
    type: 'crash',
    title: 'Vehicle Accident',
    description: 'Multi-vehicle collision with injuries. Road blocked.',
    lat: 40.6650,
    lng: -73.9780,
    timestamp: '35 min ago',
    severity: 'high',
    source: 'Traffic Radio'
  },
  {
    id: 'inc6',
    type: 'medical',
    title: 'Medical Emergency',
    description: 'Cardiac arrest. EMS responding.',
    lat: 40.6580,
    lng: -73.9420,
    timestamp: '2 hrs ago',
    severity: 'high',
    source: 'EMS Radio'
  },
  {
    id: 'inc8',
    type: 'crash',
    title: 'Hit and Run',
    description: 'Vehicle struck pedestrian and fled scene.',
    lat: 40.6780,
    lng: -73.9580,
    timestamp: '3 hrs ago',
    severity: 'high',
    source: 'Police Radio'
  },
  {
    id: 'inc11',
    type: 'suspicious',
    title: 'Package Investigation',
    description: 'Unattended package. Bomb squad called.',
    lat: 40.7080,
    lng: -73.9750,
    timestamp: '6 hrs ago',
    severity: 'high',
    source: 'Police Radio'
  },
  {
    id: 'inc16',
    type: 'robbery',
    title: 'Armed Carjacking',
    description: 'Carjacking at gunpoint. Suspect vehicle fleeing.',
    lat: 40.6920,
    lng: -73.9680,
    timestamp: '22 min ago',
    severity: 'high',
    source: 'Police Radio'
  },
  {
    id: 'inc17',
    type: 'assault',
    title: 'Stabbing',
    description: 'Stabbing victim. Critical condition.',
    lat: 40.6380,
    lng: -73.9550,
    timestamp: '38 min ago',
    severity: 'high',
    source: 'Police Radio'
  },
  {
    id: 'inc18',
    type: 'crash',
    title: 'Multi-Car Pileup',
    description: 'Highway pileup. Multiple injuries.',
    lat: 40.6250,
    lng: -74.0100,
    timestamp: '1 hr ago',
    severity: 'high',
    source: 'Traffic Radio'
  },
  {
    id: 'inc19',
    type: 'robbery',
    title: 'Bank Robbery',
    description: 'Bank hold-up in progress.',
    lat: 40.6700,
    lng: -73.9900,
    timestamp: '1 hr ago',
    severity: 'high',
    source: 'Police Radio'
  },
  {
    id: 'inc20',
    type: 'medical',
    title: 'Mass Casualty',
    description: 'Multiple victims. All EMS units responding.',
    lat: 40.6450,
    lng: -73.9320,
    timestamp: '2 hrs ago',
    severity: 'high',
    source: 'EMS Radio'
  },

  // Medium Severity Incidents
  {
    id: 'inc5',
    type: 'assault',
    title: 'Assault Reported',
    description: 'Physical altercation. Victim transported to hospital.',
    lat: 40.7150,
    lng: -73.9580,
    timestamp: '1 hr ago',
    severity: 'medium',
    source: 'Police Radio'
  },
  {
    id: 'inc7',
    type: 'suspicious',
    title: 'Suspicious Activity',
    description: 'Suspicious person reported near school.',
    lat: 40.6950,
    lng: -73.9920,
    timestamp: '2 hrs ago',
    severity: 'medium',
    source: 'Community Report'
  },
  {
    id: 'inc9',
    type: 'robbery',
    title: 'Burglary',
    description: 'Residential break-in reported. Suspect unknown.',
    lat: 40.6320,
    lng: -73.9880,
    timestamp: '4 hrs ago',
    severity: 'medium',
    source: 'Police Radio'
  },
  {
    id: 'inc10',
    type: 'fire',
    title: 'Car Fire',
    description: 'Vehicle fire on highway. Lane closure.',
    lat: 40.6505,
    lng: -73.9920,
    timestamp: '5 hrs ago',
    severity: 'medium',
    source: 'Fire Radio'
  },
  {
    id: 'inc21',
    type: 'assault',
    title: 'Bar Fight',
    description: 'Brawl outside bar. Multiple people involved.',
    lat: 40.7180,
    lng: -73.9620,
    timestamp: '25 min ago',
    severity: 'medium',
    source: 'Police Radio'
  },
  {
    id: 'inc22',
    type: 'suspicious',
    title: 'Prowler',
    description: 'Suspicious person looking in car windows.',
    lat: 40.6480,
    lng: -73.9760,
    timestamp: '52 min ago',
    severity: 'medium',
    source: 'Community Report'
  },
  {
    id: 'inc23',
    type: 'robbery',
    title: 'Theft in Progress',
    description: 'Package theft from porch.',
    lat: 40.6620,
    lng: -73.9520,
    timestamp: '1 hr ago',
    severity: 'medium',
    source: 'Community Report'
  },
  {
    id: 'inc24',
    type: 'crash',
    title: 'Fender Bender',
    description: 'Minor collision. Traffic delays.',
    lat: 40.7050,
    lng: -73.9810,
    timestamp: '2 hrs ago',
    severity: 'medium',
    source: 'Traffic Radio'
  },
  {
    id: 'inc25',
    type: 'assault',
    title: 'Street Harassment',
    description: 'Aggressive panhandler. Police called.',
    lat: 40.6850,
    lng: -73.9440,
    timestamp: '2 hrs ago',
    severity: 'medium',
    source: 'Police Radio'
  },
  {
    id: 'inc26',
    type: 'suspicious',
    title: 'Trespassing',
    description: 'Unauthorized person in building.',
    lat: 40.6290,
    lng: -73.9720,
    timestamp: '3 hrs ago',
    severity: 'medium',
    source: 'Police Radio'
  },
  {
    id: 'inc27',
    type: 'robbery',
    title: 'Shoplifting',
    description: 'Store theft. Suspect detained.',
    lat: 40.6540,
    lng: -73.9640,
    timestamp: '3 hrs ago',
    severity: 'medium',
    source: 'Police Radio'
  },
  {
    id: 'inc28',
    type: 'fire',
    title: 'Trash Fire',
    description: 'Dumpster fire. FDNY responding.',
    lat: 40.6990,
    lng: -73.9280,
    timestamp: '4 hrs ago',
    severity: 'medium',
    source: 'Fire Radio'
  },
  {
    id: 'inc29',
    type: 'assault',
    title: 'Road Rage',
    description: 'Drivers fighting in street.',
    lat: 40.6150,
    lng: -73.9890,
    timestamp: '4 hrs ago',
    severity: 'medium',
    source: 'Police Radio'
  },
  {
    id: 'inc30',
    type: 'medical',
    title: 'Overdose',
    description: 'Drug overdose. Narcan administered.',
    lat: 40.6820,
    lng: -73.9200,
    timestamp: '5 hrs ago',
    severity: 'medium',
    source: 'EMS Radio'
  },

  // Low Severity Incidents
  {
    id: 'inc12',
    type: 'assault',
    title: 'Domestic Incident',
    description: 'Domestic disturbance call. Officers on scene.',
    lat: 40.6180,
    lng: -73.9680,
    timestamp: '7 hrs ago',
    severity: 'low',
    source: 'Police Radio'
  },
  {
    id: 'inc31',
    type: 'suspicious',
    title: 'Noise Complaint',
    description: 'Loud music complaint.',
    lat: 40.7120,
    lng: -73.9540,
    timestamp: '1 hr ago',
    severity: 'low',
    source: 'Community Report'
  },
  {
    id: 'inc32',
    type: 'crash',
    title: 'Parking Lot Bump',
    description: 'Minor parking lot collision.',
    lat: 40.6410,
    lng: -73.9580,
    timestamp: '2 hrs ago',
    severity: 'low',
    source: 'Traffic Radio'
  },
  {
    id: 'inc33',
    type: 'suspicious',
    title: 'Loitering',
    description: 'Group loitering near store.',
    lat: 40.6720,
    lng: -73.9350,
    timestamp: '3 hrs ago',
    severity: 'low',
    source: 'Community Report'
  },
  {
    id: 'inc34',
    type: 'medical',
    title: 'Minor Injury',
    description: 'Slip and fall. No transport needed.',
    lat: 40.6980,
    lng: -73.9890,
    timestamp: '4 hrs ago',
    severity: 'low',
    source: 'EMS Radio'
  },
  {
    id: 'inc35',
    type: 'suspicious',
    title: 'Stray Animal',
    description: 'Aggressive dog reported.',
    lat: 40.6350,
    lng: -73.9440,
    timestamp: '5 hrs ago',
    severity: 'low',
    source: 'Community Report'
  },

  // Additional spread across Brooklyn
  {
    id: 'inc36',
    type: 'shooting',
    title: 'Drive-by Shooting',
    description: 'Shots fired from vehicle.',
    lat: 40.6640,
    lng: -73.9220,
    timestamp: '40 min ago',
    severity: 'critical',
    source: 'Police Radio'
  },
  {
    id: 'inc37',
    type: 'robbery',
    title: 'ATM Robbery',
    description: 'Armed robbery at ATM.',
    lat: 40.6880,
    lng: -73.9760,
    timestamp: '55 min ago',
    severity: 'high',
    source: 'Police Radio'
  },
  {
    id: 'inc38',
    type: 'assault',
    title: 'Gang Activity',
    description: 'Gang confrontation. Weapons reported.',
    lat: 40.6550,
    lng: -73.9080,
    timestamp: '1 hr ago',
    severity: 'high',
    source: 'Police Radio'
  },
  {
    id: 'inc39',
    type: 'fire',
    title: 'Apartment Fire',
    description: 'Kitchen fire in apartment building.',
    lat: 40.6200,
    lng: -73.9580,
    timestamp: '2 hrs ago',
    severity: 'high',
    source: 'Fire Radio'
  },
  {
    id: 'inc40',
    type: 'crash',
    title: 'Motorcycle Crash',
    description: 'Motorcycle accident. Serious injuries.',
    lat: 40.7040,
    lng: -73.9640,
    timestamp: '2 hrs ago',
    severity: 'high',
    source: 'Traffic Radio'
  }
];

// Function to generate incidents for a specific borough
const generateBoroughIncidents = (borough: keyof typeof boroughBounds, startId: number): Incident[] => {
  const bounds = boroughBounds[borough];
  const incidents: Incident[] = [];

  const incidentTypes: IncidentType[] = ['shooting', 'robbery', 'assault', 'crash', 'fire', 'medical', 'suspicious'];
  const severities: IncidentSeverity[] = ['critical', 'high', 'medium', 'low'];
  const sources = ['Police Radio', 'Fire Radio', 'EMS Radio', 'Traffic Radio', 'Community Report'];

  const titles: Record<IncidentType, string[]> = {
    shooting: ['Shots Fired', 'Gunfire Reported', 'Active Shooter', 'Drive-by Shooting', 'Gunshots Reported'],
    robbery: ['Armed Robbery', 'Store Robbery', 'Commercial Burglary', 'Gas Station Robbery', 'Theft in Progress'],
    assault: ['Assault in Progress', 'Bar Fight', 'Domestic Dispute', 'Public Disturbance', 'Street Harassment'],
    crash: ['Vehicle Accident', 'Hit and Run', 'Pedestrian Struck', 'Taxi Collision', 'Highway Accident', 'Motorcycle Crash'],
    fire: ['Building Fire', 'Car Fire', 'Structure Fire', 'House Fire', 'Trash Fire', 'Brush Fire'],
    medical: ['Medical Emergency', 'Cardiac arrest', 'Overdose'],
    suspicious: ['Suspicious Activity', 'Prowler', 'Trespassing']
  };

  const descriptions: Record<IncidentType, string[]> = {
    shooting: ['Multiple gunshots reported.', 'Shots fired from vehicle.', 'Gunshots near subway station.', 'Multiple rounds fired.'],
    robbery: ['Armed suspect fled on foot.', 'Store robbery in progress.', 'Business break-in.', 'Armed robbery in progress.'],
    assault: ['Fight outside nightclub.', 'Violent altercation.', 'Multiple people fighting.', 'Aggressive individual.'],
    crash: ['Multi-vehicle collision.', 'Vehicle struck pedestrian.', 'Multiple vehicles involved.', 'Multi-car pileup.'],
    fire: ['Residential fire. FDNY on scene.', 'Vehicle fully engulfed.', 'Apartment fire. Evacuations in progress.', 'Multiple alarms.'],
    medical: ['EMS responding.', 'Cardiac arrest. EMS responding.', 'Drug overdose. Narcan administered.'],
    suspicious: ['Suspicious person reported.', 'Looking in car windows.', 'Unauthorized person in building.']
  };

  const timestamps = ['12 min ago', '15 min ago', '22 min ago', '28 min ago', '32 min ago', '45 min ago', '50 min ago', '1 hr ago', '1.5 hrs ago', '2 hrs ago', '3 hrs ago', '4 hrs ago'];

  // Generate ~40 incidents per borough (similar density to Brooklyn)
  for (let i = 0; i < 40; i++) {
    const type = incidentTypes[Math.floor(Math.random() * incidentTypes.length)];
    const severity = i < 5 ? 'critical' : i < 15 ? 'high' : i < 30 ? 'medium' : 'low';
    const titleOptions = titles[type];
    const descOptions = descriptions[type];

    incidents.push({
      id: `inc${startId + i}`,
      type,
      title: titleOptions[Math.floor(Math.random() * titleOptions.length)],
      description: descOptions[Math.floor(Math.random() * descOptions.length)],
      lat: bounds.minLat + Math.random() * (bounds.maxLat - bounds.minLat),
      lng: bounds.minLng + Math.random() * (bounds.maxLng - bounds.minLng),
      timestamp: timestamps[Math.floor(Math.random() * timestamps.length)],
      severity: severity as IncidentSeverity,
      source: sources[Math.floor(Math.random() * sources.length)]
    });
  }

  return incidents;
};

const cameraLocations = [
  // Brooklyn Heights & Downtown
  { id: 'cam1', name: 'Brooklyn Bridge Plaza', lat: 40.7061, lng: -73.9969, status: 'active' },
  { id: 'cam2', name: 'Tillary St & Jay St', lat: 40.6955, lng: -73.9875, status: 'active' },
  { id: 'cam3', name: 'Flatbush Ave & Atlantic', lat: 40.6838, lng: -73.9758, status: 'active' },
  { id: 'cam4', name: 'Atlantic Ave & Court St', lat: 40.6896, lng: -73.9910, status: 'active' },
  
  // Williamsburg & Greenpoint
  { id: 'cam5', name: 'Bedford Ave & N 7th St', lat: 40.7147, lng: -73.9614, status: 'active' },
  { id: 'cam6', name: 'Williamsburg Bridge', lat: 40.7134, lng: -73.9727, status: 'active' },
  { id: 'cam7', name: 'McGuinness Blvd & Nassau Ave', lat: 40.7274, lng: -73.9502, status: 'active' },
  { id: 'cam8', name: 'Metropolitan Ave & Union Ave', lat: 40.7139, lng: -73.9506, status: 'active' },
  { id: 'cam9', name: 'Grand St & Havemeyer St', lat: 40.7123, lng: -73.9570, status: 'active' },
  
  // Park Slope & Prospect Park
  { id: 'cam10', name: 'Grand Army Plaza', lat: 40.6743, lng: -73.9694, status: 'active' },
  { id: 'cam11', name: 'Prospect Park West & 9th St', lat: 40.6602, lng: -73.9690, status: 'active' },
  { id: 'cam12', name: '7th Ave & 9th St', lat: 40.6706, lng: -73.9782, status: 'active' },
  { id: 'cam13', name: 'Prospect Expressway & 4th Ave', lat: 40.6555, lng: -73.9888, status: 'active' },
  
  // Sunset Park & Bay Ridge
  { id: 'cam14', name: '4th Ave & 65th St', lat: 40.6337, lng: -74.0198, status: 'active' },
  { id: 'cam15', name: '86th St & 4th Ave', lat: 40.6228, lng: -74.0286, status: 'active' },
  { id: 'cam16', name: 'Belt Parkway & Bay Pkwy', lat: 40.6085, lng: -74.0158, status: 'active' },
  { id: 'cam17', name: '3rd Ave & 65th St', lat: 40.6346, lng: -74.0184, status: 'active' },
  
  // Bensonhurst & Dyker Heights
  { id: 'cam18', name: '86th St & 20th Ave', lat: 40.6071, lng: -73.9881, status: 'active' },
  { id: 'cam19', name: 'Bay Parkway & 86th St', lat: 40.5944, lng: -73.9941, status: 'active' },
  { id: 'cam20', name: '18th Ave & 65th St', lat: 40.6193, lng: -73.9931, status: 'active' },
  { id: 'cam21', name: '13th Ave & 65th St', lat: 40.6217, lng: -73.9852, status: 'active' },
  
  // Borough Park & Midwood
  { id: 'cam22', name: '13th Ave & 50th St', lat: 40.6352, lng: -73.9868, status: 'active' },
  { id: 'cam23', name: 'Ocean Parkway & Kings Hwy', lat: 40.6093, lng: -73.9684, status: 'active' },
  { id: 'cam24', name: 'Coney Island Ave & Ave J', lat: 40.6195, lng: -73.9626, status: 'active' },
  { id: 'cam25', name: 'Flatbush Ave & Ave U', lat: 40.6064, lng: -73.9291, status: 'active' },
  
  // Flatbush & East Flatbush
  { id: 'cam26', name: 'Flatbush Ave & Parkside Ave', lat: 40.6550, lng: -73.9614, status: 'active' },
  { id: 'cam27', name: 'Nostrand Ave & Ave H', lat: 40.6302, lng: -73.9453, status: 'active' },
  { id: 'cam28', name: 'Utica Ave & Flatbush Ave', lat: 40.6384, lng: -73.9289, status: 'active' },
  { id: 'cam29', name: 'Kings Highway & E 16th St', lat: 40.6086, lng: -73.9607, status: 'active' },
  
  // Crown Heights & Bed-Stuy
  { id: 'cam30', name: 'Eastern Parkway & Nostrand Ave', lat: 40.6696, lng: -73.9504, status: 'active' },
  { id: 'cam31', name: 'Atlantic Ave & Bedford Ave', lat: 40.6841, lng: -73.9547, status: 'active' },
  { id: 'cam32', name: 'Fulton St & Nostrand Ave', lat: 40.6808, lng: -73.9499, status: 'active' },
  { id: 'cam33', name: 'Ralph Ave & Eastern Pkwy', lat: 40.6695, lng: -73.9214, status: 'active' },
  
  // Bushwick & East NY
  { id: 'cam34', name: 'Broadway & Flushing Ave', lat: 40.6990, lng: -73.9415, status: 'active' },
  { id: 'cam35', name: 'Myrtle Ave & Wyckoff Ave', lat: 40.6995, lng: -73.9113, status: 'active' },
  { id: 'cam36', name: 'Atlantic Ave & Pennsylvania Ave', lat: 40.6752, lng: -73.8950, status: 'active' },
  { id: 'cam37', name: 'Linden Blvd & Flatlands Ave', lat: 40.6550, lng: -73.8950, status: 'active' },
  
  // Canarsie & Mill Basin
  { id: 'cam38', name: 'Flatlands Ave & Ralph Ave', lat: 40.6306, lng: -73.9209, status: 'active' },
  { id: 'cam39', name: 'Rockaway Pkwy & Ave N', lat: 40.6258, lng: -73.9019, status: 'active' },
  { id: 'cam40', name: 'Ave L & Flatbush Ave', lat: 40.6219, lng: -73.9325, status: 'active' },
  
  // Coney Island & Brighton Beach
  { id: 'cam41', name: 'Surf Ave & W 10th St', lat: 40.5755, lng: -73.9831, status: 'active' },
  { id: 'cam42', name: 'Ocean Pkwy & Brighton Beach Ave', lat: 40.5781, lng: -73.9614, status: 'active' },
  { id: 'cam43', name: 'Coney Island Ave & Ave X', lat: 40.5923, lng: -73.9639, status: 'active' },
  { id: 'cam44', name: 'Belt Parkway & Ocean Pkwy', lat: 40.5764, lng: -73.9755, status: 'maintenance' },
  
  // Additional Major Intersections
  { id: 'cam45', name: 'Flatbush Ave Extension', lat: 40.6929, lng: -73.9809, status: 'active' },
  { id: 'cam46', name: 'Gowanus Expressway & 9th St', lat: 40.6645, lng: -73.9934, status: 'active' },
  { id: 'cam47', name: 'BQE & Atlantic Ave', lat: 40.6843, lng: -73.9682, status: 'active' },
  { id: 'cam48', name: 'Manhattan Bridge Exit', lat: 40.7089, lng: -73.9892, status: 'active' },
  { id: 'cam49', name: 'Prospect Expressway', lat: 40.6502, lng: -73.9763, status: 'maintenance' },
  { id: 'cam50', name: 'Belt Parkway & Knapp St', lat: 40.5889, lng: -73.9343, status: 'active' },

  // Manhattan Cameras
  { id: 'cam51', name: 'Times Square & Broadway', lat: 40.7580, lng: -73.9855, status: 'active' },
  { id: 'cam52', name: 'Central Park South & 5th Ave', lat: 40.7648, lng: -73.9730, status: 'active' },
  { id: 'cam53', name: 'Columbus Circle', lat: 40.7681, lng: -73.9819, status: 'active' },
  { id: 'cam54', name: 'Union Square', lat: 40.7359, lng: -73.9911, status: 'active' },
  { id: 'cam55', name: 'Washington Square Park', lat: 40.7308, lng: -73.9973, status: 'active' },
  { id: 'cam56', name: 'Grand Central Terminal', lat: 40.7527, lng: -73.9772, status: 'active' },
  { id: 'cam57', name: 'Penn Station', lat: 40.7505, lng: -73.9934, status: 'active' },
  { id: 'cam58', name: 'World Trade Center', lat: 40.7115, lng: -74.0122, status: 'active' },
  { id: 'cam59', name: 'Brooklyn Bridge Manhattan Side', lat: 40.7061, lng: -74.0031, status: 'active' },
  { id: 'cam60', name: 'East Village & 1st Ave', lat: 40.7263, lng: -73.9812, status: 'active' },

  // Bronx Cameras
  { id: 'cam61', name: 'Yankee Stadium', lat: 40.8296, lng: -73.9262, status: 'active' },
  { id: 'cam62', name: 'Grand Concourse & 161st St', lat: 40.8255, lng: -73.9255, status: 'active' },
  { id: 'cam63', name: 'Fordham Road & Webster Ave', lat: 40.8609, lng: -73.8910, status: 'active' },
  { id: 'cam64', name: 'Cross Bronx Expressway', lat: 40.8448, lng: -73.8648, status: 'active' },
  { id: 'cam65', name: 'Pelham Parkway', lat: 40.8567, lng: -73.8673, status: 'active' },
  { id: 'cam66', name: 'Boston Road & 180th St', lat: 40.8575, lng: -73.8800, status: 'active' },
  { id: 'cam67', name: 'Major Deegan Expressway', lat: 40.8390, lng: -73.9180, status: 'active' },
  { id: 'cam68', name: 'Bruckner Boulevard', lat: 40.8117, lng: -73.8960, status: 'active' },

  // Queens Cameras
  { id: 'cam69', name: 'Queens Center Mall', lat: 40.7343, lng: -73.8699, status: 'active' },
  { id: 'cam70', name: 'Long Island Expressway', lat: 40.7282, lng: -73.7949, status: 'active' },
  { id: 'cam71', name: 'Jackson Heights & Roosevelt Ave', lat: 40.7461, lng: -73.8917, status: 'active' },
  { id: 'cam72', name: 'Flushing Main St', lat: 40.7596, lng: -73.8295, status: 'active' },
  { id: 'cam73', name: 'Astoria Boulevard', lat: 40.7706, lng: -73.9260, status: 'active' },
  { id: 'cam74', name: 'Jamaica Ave & Parsons Blvd', lat: 40.7023, lng: -73.8018, status: 'active' },
  { id: 'cam75', name: 'Forest Hills & Queens Blvd', lat: 40.7186, lng: -73.8448, status: 'active' },
  { id: 'cam76', name: 'Woodhaven Boulevard', lat: 40.6953, lng: -73.8569, status: 'active' },
  { id: 'cam77', name: 'LaGuardia Airport', lat: 40.7769, lng: -73.8740, status: 'active' },
  { id: 'cam78', name: 'JFK Airport', lat: 40.6413, lng: -73.7781, status: 'active' },

  // Staten Island Cameras
  { id: 'cam79', name: 'St George Ferry Terminal', lat: 40.6437, lng: -74.0737, status: 'active' },
  { id: 'cam80', name: 'Staten Island Mall', lat: 40.5795, lng: -74.1502, status: 'active' },
  { id: 'cam81', name: 'Victory Boulevard', lat: 40.6233, lng: -74.1147, status: 'active' },
  { id: 'cam82', name: 'Hylan Boulevard', lat: 40.5607, lng: -74.1407, status: 'active' },
  { id: 'cam83', name: 'Richmond Avenue', lat: 40.5980, lng: -74.1502, status: 'active' },
  { id: 'cam84', name: 'Staten Island Expressway', lat: 40.6078, lng: -74.1374, status: 'active' },
];

// Create custom camera icon
const cameraIcon = L.divIcon({
  html: '<div style="background-color: #8b5cf6; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg></div>',
  className: '',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

const cameraIconInactive = L.divIcon({
  html: '<div style="background-color: #6b7280; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg></div>',
  className: '',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

// Create custom star icon for FDR High School
const starIcon = L.divIcon({
  html: '<div style="background-color: #fbbf24; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 4px 8px rgba(0,0,0,0.4);"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></div>',
  className: '',
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

// Helper function to get incident icon based on type and severity
const getIncidentIcon = (type: IncidentType, severity: IncidentSeverity) => {
  const colors = {
    critical: '#dc2626',
    high: '#f97316',
    medium: '#eab308',
    low: '#3b82f6'
  };

  const icons = {
    shooting: '🔫',
    robbery: '💰',
    assault: '⚠️',
    crash: '🚗',
    fire: '🔥',
    medical: '🚑',
    suspicious: '👁️'
  };

  const color = colors[severity];
  const icon = icons[type];
  const size = severity === 'critical' ? 36 : severity === 'high' ? 32 : 28;

  return L.divIcon({
    html: `<div style="background-color: ${color}; width: ${size}px; height: ${size}px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.5); animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;"><span style="font-size: ${size * 0.5}px;">${icon}</span></div><style>@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .7; } }</style>`,
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

export default function Map() {
  const [showContacts, setShowContacts] = useState(true);
  const [showCameras, setShowCameras] = useState(true);
  const [showIncidents, setShowIncidents] = useState(true);
  const [loadedIncidents, setLoadedIncidents] = useState<Incident[]>(brooklynIncidents);
  const [loadedBoroughs, setLoadedBoroughs] = useState<Set<string>>(new Set(['brooklyn']));
  const [showRouteSearch, setShowRouteSearch] = useState(false);
  const [destination, setDestination] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [routeInfo, setRouteInfo] = useState<{distance: string; duration: string; safetyScore: number; camerasNearby: number; incidentsNearby: number} | null>(null);
  const [addressSuggestions, setAddressSuggestions] = useState<{display_name: string; lat: string; lon: string}[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRouteInfoCollapsed, setIsRouteInfoCollapsed] = useState(false);
  const [routeInstructions, setRouteInstructions] = useState<{text: string; distance: string; type: string}[]>([]);
  const [showAllDirections, setShowAllDirections] = useState(false);
  const [allRoutes, setAllRoutes] = useState<Array<{distance: string; duration: string; safetyScore: number; camerasNearby: number; incidentsNearby: number; type: 'safest' | 'fastest'; instructions: {text: string; distance: string; type: string}[]; rawDuration?: number}>>([]);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);
  const [showRouteSidebar, setShowRouteSidebar] = useState(true);
  const [transportMode, setTransportMode] = useState<'walking' | 'biking' | 'driving' | 'transit'>('walking');
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const cameraClusterRef = useRef<L.MarkerClusterGroup | null>(null);
  const incidentMarkersRef = useRef<L.Marker[]>([]);
  const circleRef = useRef<L.Circle | null>(null);
  const routingControlRef = useRef<any>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const routeLayersRef = useRef<any[]>([]);
  const routeMarkersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    // Mark this as the last page visited
    sessionStorage.setItem('last_page', '/map');
  }, []);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize map
    const map = L.map(mapRef.current, {
      zoomControl: false
    }).setView([myLocation.lat, myLocation.lng], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Add my location circle with pulsing animation
    const circle = L.circle([myLocation.lat, myLocation.lng], {
      color: '#3b82f6',
      fillColor: '#3b82f6',
      fillOpacity: 0.3,
      radius: 100
    }).addTo(map);
    circleRef.current = circle;

    // Add my location marker with custom prominent icon
    const myLocationIcon = L.divIcon({
      html: `<div style="position: relative;">
        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background-color: #3b82f6; width: 48px; height: 48px; border-radius: 50%; animation: pulse 2s ease-in-out infinite; opacity: 0.4;"></div>
        <div style="background-color: #3b82f6; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 4px solid white; box-shadow: 0 6px 16px rgba(59, 130, 246, 0.6); position: relative; z-index: 1;">
          <span style="font-size: 24px;">📍</span>
        </div>
      </div>
      <style>
        @keyframes pulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.4; }
          50% { transform: translate(-50%, -50%) scale(1.3); opacity: 0.1; }
        }
      </style>`,
      className: '',
      iconSize: [48, 48],
      iconAnchor: [24, 24],
    });

    const myMarker = L.marker([myLocation.lat, myLocation.lng], { icon: myLocationIcon })
      .bindPopup('<div style="text-align: center;"><div style="font-size: 24px; margin-bottom: 4px;">📍</div><strong>You</strong><p style="font-size: 12px; color: #666; margin: 4px 0 0;">Your current location</p></div>')
      .addTo(map);

    // Add FDR High School marker
    L.marker([fdrHighSchool.lat, fdrHighSchool.lng], { icon: starIcon })
      .bindPopup(`<div style="text-align: center;"><div style="font-size: 24px; margin-bottom: 4px;">⭐</div><strong>${fdrHighSchool.name}</strong><p style="font-size: 12px; color: #666; margin: 4px 0 0;">${fdrHighSchool.address}</p><p style="font-size: 11px; color: #fbbf24; margin: 4px 0 0; font-weight: 600;">Where QuietSafe was built</p></div>`)
      .addTo(map);

    markersRef.current = [myMarker];

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Remove existing contact markers
    markersRef.current.slice(1).forEach(marker => marker.remove());
    markersRef.current = markersRef.current.slice(0, 1);

    // Add contact markers if enabled
    if (showContacts) {
      contactLocations.forEach((contact) => {
        const marker = L.marker([contact.lat, contact.lng])
          .bindPopup(`<div style="text-align: center;"><div style="font-size: 24px; margin-bottom: 4px;">${contact.avatar}</div><strong>${contact.name}</strong><p style="font-size: 12px; color: #666; margin: 4px 0 0;">Shared location</p></div>`)
          .addTo(mapInstanceRef.current!);
        markersRef.current.push(marker);
      });
    }
  }, [showContacts]);

  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Remove existing camera markers
    if (cameraClusterRef.current) {
      mapInstanceRef.current.removeLayer(cameraClusterRef.current);
    }
    cameraClusterRef.current = null;

    // Add camera markers if enabled
    if (showCameras) {
      const cameraCluster = L.markerClusterGroup({
        iconCreateFunction: function(cluster) {
          const count = cluster.getChildCount();
          return L.divIcon({
            html: `<div style="background-color: #8b5cf6; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 3px 8px rgba(0,0,0,0.4); font-weight: bold; color: white; font-size: 14px;">${count}</div>`,
            className: '',
            iconSize: [40, 40],
          });
        },
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true,
        maxClusterRadius: 50,
      });
      cameraLocations.forEach((camera) => {
        const icon = camera.status === 'active' ? cameraIcon : cameraIconInactive;
        const statusColor = camera.status === 'active' ? '#10b981' : '#6b7280';
        const marker = L.marker([camera.lat, camera.lng], { icon })
          .bindPopup(`<div style="text-align: center;"><div style="font-size: 24px; margin-bottom: 4px;">📹</div><strong>${camera.name}</strong><p style="font-size: 12px; color: ${statusColor}; margin: 4px 0 0; text-transform: capitalize;">${camera.status}</p></div>`);
        cameraCluster.addLayer(marker);
      });
      mapInstanceRef.current.addLayer(cameraCluster);
      cameraClusterRef.current = cameraCluster;
    }
  }, [showCameras]);

  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Remove existing incident markers
    incidentMarkersRef.current.forEach(marker => marker.remove());
    incidentMarkersRef.current = [];

    // Add incident markers if enabled
    if (showIncidents) {
      loadedIncidents.forEach((incident) => {
        const icon = getIncidentIcon(incident.type, incident.severity);
        const marker = L.marker([incident.lat, incident.lng], { icon })
          .bindPopup(`<div style="text-align: center;"><div style="font-size: 24px; margin-bottom: 4px;">${icon.options.html}</div><strong>${incident.title}</strong><p style="font-size: 12px; color: #666; margin: 4px 0 0;">${incident.description}</p><p style="font-size: 11px; color: #fbbf24; margin: 4px 0 0; font-weight: 600;">${incident.timestamp}</p><p style="font-size: 11px; color: #fbbf24; margin: 4px 0 0; font-weight: 600;">${incident.source}</p></div>`);
        marker.addTo(mapInstanceRef.current!);
        incidentMarkersRef.current.push(marker);
      });
    }
  }, [showIncidents, loadedIncidents]);

  // Dynamic loading of incidents based on viewport
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const handleMapMove = () => {
      const map = mapInstanceRef.current;
      if (!map) return;

      const bounds = map.getBounds();
      const currentBoroughs = new Set<string>();

      // Check which boroughs are in viewport
      Object.entries(boroughBounds).forEach(([borough, bbox]) => {
        // Check if borough bounds intersect with viewport
        if (bounds.intersects(L.latLngBounds(
          [bbox.minLat, bbox.minLng],
          [bbox.maxLat, bbox.maxLng]
        ))) {
          currentBoroughs.add(borough);
        }
      });

      // Load incidents for boroughs that are now visible but weren't before
      const newIncidents: Incident[] = [...loadedIncidents];
      let hasChanges = false;
      let nextId = 1000; // Start IDs for generated incidents high to avoid conflicts

      currentBoroughs.forEach(borough => {
        if (!loadedBoroughs.has(borough)) {
          // Generate and add incidents for this borough
          const boroughIncidents = generateBoroughIncidents(borough as keyof typeof boroughBounds, nextId);
          newIncidents.push(...boroughIncidents);
          nextId += 100;
          hasChanges = true;
        }
      });

      // Remove incidents for boroughs that are no longer visible
      const visibleIncidents = newIncidents.filter(incident => {
        // Keep incident if it's within any visible borough
        for (const borough of currentBoroughs) {
          const bbox = boroughBounds[borough as keyof typeof boroughBounds];
          if (incident.lat >= bbox.minLat && incident.lat <= bbox.maxLat &&
              incident.lng >= bbox.minLng && incident.lng <= bbox.maxLng) {
            return true;
          }
        }
        return false;
      });

      if (hasChanges || visibleIncidents.length !== loadedIncidents.length) {
        setLoadedIncidents(visibleIncidents);
        setLoadedBoroughs(currentBoroughs);
      }
    };

    // Listen to map movement events
    mapInstanceRef.current.on('moveend', handleMapMove);
    mapInstanceRef.current.on('zoomend', handleMapMove);

    // Initial check
    handleMapMove();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.off('moveend', handleMapMove);
        mapInstanceRef.current.off('zoomend', handleMapMove);
      }
    };
  }, [loadedIncidents, loadedBoroughs]);

  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([myLocation.lat, myLocation.lng], 13);
    }
  };

  const handleRouteSearch = () => {
    setShowRouteSearch(true);
  };

  const handleRouteCancel = () => {
    setShowRouteSearch(false);
    setDestination('');
    setIsSearching(false);
    setRouteInfo(null);
    setError(null);
    setShowSuggestions(false);
    setAddressSuggestions([]);
    setIsRouteInfoCollapsed(false);
    setRouteInstructions([]);
    setShowAllDirections(false);
    setAllRoutes([]);
    setShowRouteSidebar(true);
    setSelectedRouteIndex(0);

    // Remove route polylines from map
    if (routeLayersRef.current && mapInstanceRef.current) {
      routeLayersRef.current.forEach((r: any) => {
        if (r.line) {
          mapInstanceRef.current!.removeLayer(r.line);
        }
      });
      routeLayersRef.current = [];
    }

    // Remove route markers from map
    if (routeMarkersRef.current && mapInstanceRef.current) {
      routeMarkersRef.current.forEach(marker => {
        mapInstanceRef.current!.removeLayer(marker);
      });
      routeMarkersRef.current = [];
    }

    // Remove old routing control if it exists
    if (routingControlRef.current) {
      mapInstanceRef.current?.removeControl(routingControlRef.current);
      routingControlRef.current = null;
    }
  };

  const handleMinimizeRoute = () => {
    setShowRouteSearch(false);
    setIsRouteInfoCollapsed(false);
  };

  const handleTransportModeChange = (mode: 'walking' | 'biking' | 'driving' | 'transit') => {
    setTransportMode(mode);

    // Clear existing route if one exists
    if (routeInfo) {
      setRouteInfo(null);
      setRouteInstructions([]);
      setAllRoutes([]);
      setSelectedRouteIndex(0);

      // Remove route polylines from map
      if (routeLayersRef.current && mapInstanceRef.current) {
        routeLayersRef.current.forEach((r: any) => {
          if (r.line) {
            mapInstanceRef.current!.removeLayer(r.line);
          }
        });
        routeLayersRef.current = [];
      }

      // Remove route markers from map
      if (routeMarkersRef.current && mapInstanceRef.current) {
        routeMarkersRef.current.forEach(marker => {
          mapInstanceRef.current!.removeLayer(marker);
        });
        routeMarkersRef.current = [];
      }
    }
  };

  const calculateDistanceToPoint = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  };

  const analyzeRouteSafety = (routeCoords: [number, number][], isSafestRoute: boolean = false) => {
    let totalSafetyScore = 100;
    const incidentsFound = new Set<string>();
    const camerasFound = new Set<string>();
    const safeDistance = 0.5; // km

    // Sample every 10th coordinate to avoid over-penalizing long routes
    const sampleRate = Math.max(1, Math.floor(routeCoords.length / 50));

    // Check each point along the route
    routeCoords.forEach((coord, index) => {
      if (index % sampleRate !== 0) return; // Skip some points for performance

      // Check for nearby incidents
      loadedIncidents.forEach(incident => {
        const distance = calculateDistanceToPoint(coord[0], coord[1], incident.lat, incident.lng);
        if (distance < safeDistance && !incidentsFound.has(incident.id)) {
          incidentsFound.add(incident.id);
          // Penalize safety score based on severity
          const penalties = { critical: 20, high: 12, medium: 6, low: 2 };
          totalSafetyScore -= penalties[incident.severity];
        }
      });

      // Check for nearby cameras
      cameraLocations.forEach(camera => {
        if (camera.status === 'active') {
          const distance = calculateDistanceToPoint(coord[0], coord[1], camera.lat, camera.lng);
          if (distance < safeDistance && !camerasFound.has(camera.id)) {
            camerasFound.add(camera.id);
            // Boost for camera coverage (more significant for safest route)
            totalSafetyScore += isSafestRoute ? 2 : 1;
          }
        }
      });
    });

    // For safest route, apply minimum threshold of 90%
    if (isSafestRoute && totalSafetyScore < 90) {
      // Calculate how much safer this route is compared to baseline
      const incidentAvoidanceBonus = Math.max(0, 15 - incidentsFound.size * 3);
      const cameraBonus = Math.min(10, camerasFound.size * 0.5);
      totalSafetyScore = Math.min(100, totalSafetyScore + incidentAvoidanceBonus + cameraBonus);

      // Still ensure minimum 90% for safest route
      totalSafetyScore = Math.max(90, totalSafetyScore);
    }

    // Ensure score stays within bounds
    totalSafetyScore = Math.max(0, Math.min(100, totalSafetyScore));

    return {
      safetyScore: Math.round(totalSafetyScore),
      camerasNearby: camerasFound.size,
      incidentsNearby: incidentsFound.size
    };
  };

  // Find safe waypoints that avoid high-incident areas
  const findSafeWaypoints = (startLat: number, startLng: number, endLat: number, endLng: number) => {
    // Calculate midpoint
    const midLat = (startLat + endLat) / 2;
    const midLng = (startLng + endLng) / 2;

    // Find incident clusters (critical and high severity incidents)
    const dangerZones = loadedIncidents
      .filter(inc => inc.severity === 'critical' || inc.severity === 'high')
      .map(inc => ({ lat: inc.lat, lng: inc.lng }));

    // Calculate offset perpendicular to direct route
    const deltaLat = endLat - startLat;
    const deltaLng = endLng - startLng;
    const perpLat = -deltaLng * 0.15; // Offset perpendicular to route
    const perpLng = deltaLat * 0.15;

    // Try offset in both directions and pick the safer one
    const waypoint1 = { lat: midLat + perpLat, lng: midLng + perpLng };
    const waypoint2 = { lat: midLat - perpLat, lng: midLng - perpLng };

    // Calculate danger score for each waypoint
    const scoreDanger = (lat: number, lng: number) => {
      let danger = 0;
      dangerZones.forEach(zone => {
        const dist = calculateDistanceToPoint(lat, lng, zone.lat, zone.lng);
        if (dist < 1) danger += (1 - dist) * 10; // Closer = more dangerous
      });
      return danger;
    };

    const danger1 = scoreDanger(waypoint1.lat, waypoint1.lng);
    const danger2 = scoreDanger(waypoint2.lat, waypoint2.lng);

    return danger1 < danger2 ? waypoint1 : waypoint2;
  };

  const calculateRealisticDuration = (distanceMeters: number, mode: 'walking' | 'biking' | 'driving' | 'transit') => {
    const distanceMiles = distanceMeters / 1609.34;

    // Get current hour for time-of-day adjustments
    const currentHour = new Date().getHours();
    const isRushHour = (currentHour >= 7 && currentHour <= 9) || (currentHour >= 16 && currentHour <= 19);
    const isNighttime = currentHour >= 22 || currentHour <= 5;

    let baseSpeed: number;
    let adjustmentFactor = 1.0;

    switch (mode) {
      case 'walking':
        // Baseline: 2.8-3.0 mph for urban walking
        baseSpeed = 2.9;
        // Adjust for time of day - slower at night for safety
        if (isNighttime) adjustmentFactor = 0.85;
        // Account for crosswalks and traffic lights (15% slowdown in city)
        adjustmentFactor *= 0.85;
        break;

      case 'biking':
        // Baseline: 10-12 mph for city cycling
        baseSpeed = 11;
        // Rush hour makes cycling slightly faster relative to cars
        if (isRushHour) adjustmentFactor = 1.1;
        // Night cycling is slower for visibility/safety
        if (isNighttime) adjustmentFactor = 0.9;
        // Account for stopping at lights (10% slowdown)
        adjustmentFactor *= 0.9;
        break;

      case 'driving':
        // Baseline: 20-25 mph in NYC traffic (varies by borough)
        baseSpeed = 22;
        // Rush hour significantly impacts driving speed
        if (isRushHour) {
          baseSpeed = 12; // Heavy traffic reduces to ~12 mph
        }
        // Late night has less traffic
        if (isNighttime) {
          baseSpeed = 28; // Can go faster with clear roads
        }
        // Account for traffic lights (20-30% slowdown depending on time)
        adjustmentFactor *= isRushHour ? 0.7 : 0.8;
        break;

      case 'transit':
        // Baseline: Walking speed + wait times + vehicle speed
        // Average NYC subway/bus: ~8-10 mph including stops and waits
        baseSpeed = 9;
        // Rush hour means more frequent service but more crowded
        if (isRushHour) adjustmentFactor = 1.1; // More frequent trains
        // Late night has less frequent service
        if (isNighttime) adjustmentFactor = 0.7; // Longer waits
        // Add average wait time of 5-7 minutes
        const averageWaitMinutes = isRushHour ? 5 : 7;
        const travelTimeMinutes = (distanceMiles / baseSpeed) * 60 * adjustmentFactor;
        return Math.round(travelTimeMinutes + averageWaitMinutes);
    }

    const adjustedSpeed = baseSpeed * adjustmentFactor;
    const timeHours = distanceMiles / adjustedSpeed;
    const timeMinutes = Math.round(timeHours * 60);

    return timeMinutes;
  };

  const handleRouteSubmit = async () => {
    if (!mapInstanceRef.current || !destination.trim()) return;

    setIsSearching(true);
    setError(null);
    setShowSuggestions(false);

    // Remove old route polylines if exist
    if (routeLayersRef.current && mapInstanceRef.current) {
      routeLayersRef.current.forEach((r: any) => {
        if (r.line) {
          mapInstanceRef.current!.removeLayer(r.line);
        }
      });
      routeLayersRef.current = [];
    }

    // Remove old route markers if exist
    if (routeMarkersRef.current && mapInstanceRef.current) {
      routeMarkersRef.current.forEach(marker => {
        mapInstanceRef.current!.removeLayer(marker);
      });
      routeMarkersRef.current = [];
    }

    // Remove old routing control if exists
    if (routingControlRef.current) {
      mapInstanceRef.current.removeControl(routingControlRef.current);
      routingControlRef.current = null;
    }

    try {
      // Geocode the destination address
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(destination)}&limit=1`);
      const data = await response.json();

      if (data && data.length > 0) {
        const destLat = parseFloat(data[0].lat);
        const destLng = parseFloat(data[0].lon);

        // Calculate a safe waypoint that avoids danger zones
        const safeWaypoint = findSafeWaypoints(myLocation.lat, myLocation.lng, destLat, destLng);

        // Map transport mode to OSRM profile
        const osrmProfile = transportMode === 'walking' ? 'foot' :
                           transportMode === 'biking' ? 'bike' :
                           transportMode === 'transit' ? 'foot' : 'car';

        // First, get the fastest direct route
        const fastestRouteResponse = await fetch(
          `https://router.project-osrm.org/route/v1/${osrmProfile}/${myLocation.lng},${myLocation.lat};${destLng},${destLat}?overview=full&steps=true&geometries=geojson`
        );
        const fastestRouteData = await fastestRouteResponse.json();

        // Then, get a safer route with waypoint
        const saferRouteResponse = await fetch(
          `https://router.project-osrm.org/route/v1/${osrmProfile}/${myLocation.lng},${myLocation.lat};${safeWaypoint.lng},${safeWaypoint.lat};${destLng},${destLat}?overview=full&steps=true&geometries=geojson`
        );
        const saferRouteData = await saferRouteResponse.json();

        if (fastestRouteData.routes && fastestRouteData.routes.length > 0 &&
            saferRouteData.routes && saferRouteData.routes.length > 0) {

          const allRoutesData = [];
          const routesToDisplay = [fastestRouteData.routes[0], saferRouteData.routes[0]];

          // Process both routes (analyze without labeling yet)
          routesToDisplay.forEach((route, idx) => {
            // Convert GeoJSON coordinates to [lat, lng]
            const routeCoords: [number, number][] = route.geometry.coordinates.map((c: [number, number]) => [c[1], c[0]]);
            // Initially analyze without isSafestRoute flag
            const safetyAnalysis = analyzeRouteSafety(routeCoords, false);

            const distanceMiles = (route.distance / 1609.34).toFixed(1);

            // Calculate realistic duration based on mode and current conditions
            const durationMins = calculateRealisticDuration(route.distance, transportMode);

            allRoutesData.push({
              distance: `${distanceMiles} miles`,
              duration: `${durationMins} mins`,
              ...safetyAnalysis,
              type: 'fastest' as 'safest' | 'fastest',
              rawDuration: route.duration,
              rawDistance: route.distance,
              coordinates: routeCoords,
              instructions: route.legs.flatMap((leg: any) =>
                leg.steps.map((step: any) => ({
                  text: step.maneuver.instruction || `${step.maneuver.type} onto ${step.name}`,
                  distance: step.distance >= 1609.34
                    ? `${(step.distance / 1609.34).toFixed(1)} mi`
                    : `${Math.round(step.distance * 3.28084)} ft`,
                  type: step.maneuver.type
                }))
              )
            });
          });

          // Determine which route is actually safest and fastest
          const safestIndex = allRoutesData[0].safetyScore > allRoutesData[1].safetyScore ? 0 : 1;
          const fastestIndex = allRoutesData[0].rawDuration < allRoutesData[1].rawDuration ? 0 : 1;

          // Re-analyze safest route with bonus to ensure 90%+ threshold
          const safestRouteCoords = allRoutesData[safestIndex].coordinates;
          const safestRouteAnalysis = analyzeRouteSafety(safestRouteCoords, true);
          allRoutesData[safestIndex].safetyScore = safestRouteAnalysis.safetyScore;
          allRoutesData[safestIndex].camerasNearby = safestRouteAnalysis.camerasNearby;
          allRoutesData[safestIndex].incidentsNearby = safestRouteAnalysis.incidentsNearby;

          // Label routes
          allRoutesData[safestIndex].type = 'safest';
          allRoutesData[fastestIndex].type = 'fastest';

          // Sort: safest first
          const finalRoutes = safestIndex === fastestIndex
            ? [allRoutesData[safestIndex]]
            : safestIndex === 0
              ? [allRoutesData[0], allRoutesData[1]]
              : [allRoutesData[1], allRoutesData[0]];

          console.log('Final routes:', finalRoutes.map(r => ({ type: r.type, safety: r.safetyScore, duration: r.duration })));

          setAllRoutes(finalRoutes);
          setShowRouteSidebar(finalRoutes.length > 1);

          // Draw routes on map
          if (mapInstanceRef.current) {
            finalRoutes.forEach((routeData, idx) => {
              const color = routeData.type === 'safest' ? '#10b981' : '#3b82f6';
              const weight = idx === 0 ? 6 : 6;
              const opacity = idx === 0 ? 0.85 : 0.75;
              const dashArray = routeData.type === 'fastest' ? '10, 5' : undefined;

              const polyline = L.polyline(
                routeData.coordinates,
                { color, weight, opacity, dashArray }
              ).addTo(mapInstanceRef.current!);

              // Store for later manipulation
              if (!routeLayersRef.current) routeLayersRef.current = [];
              routeLayersRef.current[idx] = { line: polyline, ...routeData };
            });

            // Add markers - using green theme for route markers to distinguish from current location
            const startIcon = L.divIcon({
              html: `<div style="background-color: #10b981; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.5);">
                <span style="font-size: 22px;">🚀</span>
              </div>`,
              className: '',
              iconSize: [36, 36],
              iconAnchor: [18, 18],
            });

            const endIcon = L.divIcon({
              html: `<div style="background-color: #10b981; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.5);">
                <span style="font-size: 22px;">🎯</span>
              </div>`,
              className: '',
              iconSize: [36, 36],
              iconAnchor: [18, 18],
            });

            const startMarker = L.marker([myLocation.lat, myLocation.lng], { icon: startIcon }).addTo(mapInstanceRef.current!);
            const endMarker = L.marker([destLat, destLng], { icon: endIcon }).addTo(mapInstanceRef.current!);
            routeMarkersRef.current = [startMarker, endMarker];

            // Fit bounds to show both routes
            const allCoords = finalRoutes.flatMap(r => r.coordinates);
            const bounds = L.latLngBounds(allCoords);
            mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
          }

          // Set the first route (safest) as default
          const firstRoute = finalRoutes[0];
          setRouteInstructions(firstRoute.instructions);
          setRouteInfo({
            distance: firstRoute.distance,
            duration: firstRoute.duration,
            safetyScore: firstRoute.safetyScore,
            camerasNearby: firstRoute.camerasNearby,
            incidentsNearby: firstRoute.incidentsNearby
          });
          setSelectedRouteIndex(0);
          setIsSearching(false);
        } else {
          setIsSearching(false);
          setError('Unable to find a valid route. Please try a different address.');
          setTimeout(() => setError(null), 5000);
        }
      } else {
        setIsSearching(false);
        setError('Address not found. Please try a valid Brooklyn address.');
        setTimeout(() => setError(null), 5000);
      }
    } catch (error) {
      setIsSearching(false);
      setError('Unable to connect to maps service. Please check your connection.');
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDestination(value);
    setError(null);

    if (value.trim().length < 3) {
      setAddressSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // Debounce search
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    debounceTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}&limit=5`);
        const data = await response.json();

        if (data && data.length > 0) {
          const suggestions = data.map((item: any) => ({
            display_name: item.display_name,
            lat: item.lat,
            lon: item.lon
          }));
          setAddressSuggestions(suggestions);
          setShowSuggestions(true);
        } else {
          setAddressSuggestions([]);
          setShowSuggestions(false);
        }
      } catch (error) {
        setAddressSuggestions([]);
        setShowSuggestions(false);
      }
    }, 500);
  };

  const handleAddressSelect = (suggestion: {display_name: string; lat: string; lon: string}) => {
    setDestination(suggestion.display_name);
    setAddressSuggestions([]);
    setShowSuggestions(false);
    setError(null);
  };

  return (
    <div className="h-full relative bg-slate-900">
      {/* Dynamic styling for zoom controls */}
      {/* Header */}
      {!showRouteSearch && (
        <div className="absolute top-0 left-0 right-0 z-[1000] px-6 pt-4 pb-4 bg-gradient-to-b from-slate-900 to-slate-900/95 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-white text-3xl">Map</h1>
            <button
              onClick={handleRouteSearch}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors text-sm"
            >
              <RouteIcon size={18} />
              <span>Safe Route</span>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowContacts(!showContacts)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors text-xs ${
                showContacts ? 'bg-blue-500 text-white' : 'bg-white/10 text-white/60'
              }`}
            >
              <UsersIcon size={16} />
              <span>People</span>
            </button>
            <button
              onClick={() => setShowCameras(!showCameras)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors text-xs ${
                showCameras ? 'bg-purple-500 text-white' : 'bg-white/10 text-white/60'
              }`}
            >
              <Camera size={16} />
              <span>Cameras</span>
            </button>
            <button
              onClick={() => setShowIncidents(!showIncidents)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors text-xs ${
                showIncidents ? 'bg-red-500 text-white' : 'bg-white/10 text-white/60'
              }`}
            >
              <AlertTriangle size={16} />
              <span>Incidents</span>
            </button>
          </div>
        </div>
      )}

      {/* Map Container */}
      <div className="h-full w-full">
        <div ref={mapRef} className="h-full w-full" />
      </div>

      {/* Floating Action Button - Hide when route is active */}
      {!routeInfo && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: 'spring' }}
          onClick={handleRecenter}
          className="absolute bottom-6 right-6 w-14 h-14 bg-blue-500 rounded-full shadow-lg flex items-center justify-center z-[999] hover:bg-blue-600 transition-colors"
        >
          <Navigation className="text-white" size={24} />
        </motion.button>
      )}

      {/* Info Card - Hide when route is active */}
      {!routeInfo && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="absolute bottom-6 left-6 right-20 z-[1000]"
        >
          <div className="bg-slate-900/95 backdrop-blur-xl rounded-2xl p-4 border border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                <Navigation className="text-white" size={20} />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-semibold text-sm">Your Location</h3>
                <p className="text-white/60 text-xs">Brooklyn, NY</p>
              </div>
              <span className="text-green-400 text-xs bg-green-400/10 px-2 py-1 rounded-lg">
                Active
              </span>
            </div>
            <div className="mt-3 pt-3 border-t border-white/10 space-y-2">
              {showIncidents && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="text-red-400" size={16} />
                    <span className="text-white/80 text-xs">{loadedIncidents.length} active incidents</span>
                  </div>
                  <span className="text-red-400 text-xs bg-red-400/10 px-2 py-0.5 rounded-lg">
                    {loadedIncidents.filter(i => i.severity === 'critical' || i.severity === 'high').length} critical
                  </span>
                </div>
              )}
              {showCameras && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Camera className="text-purple-400" size={16} />
                    <span className="text-white/80 text-xs">{cameraLocations.filter(c => c.status === 'active').length} cameras active</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Route Search */}
      <AnimatePresence>
        {showRouteSearch && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="absolute top-0 left-0 right-0 z-[1000]"
          >
            <div className="max-h-[65vh] overflow-y-auto bg-gradient-to-b from-slate-900 to-slate-900/95 backdrop-blur-xl border-b border-white/10">
              <div className="px-6 pt-4 pb-4">
              <div className="flex items-center justify-between mb-3">
                <h1 className="text-white text-2xl font-semibold">Safe Route</h1>
                <div className="flex items-center gap-2">
                  {routeInfo && (
                    <button
                      onClick={handleMinimizeRoute}
                      className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center"
                    >
                      <ChevronDown className="text-white" size={20} />
                    </button>
                  )}
                  <button
                    onClick={handleRouteCancel}
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center"
                  >
                    <X className="text-white" size={20} />
                  </button>
                </div>
              </div>

              {/* Transportation Mode Selector */}
              <div className="flex items-center gap-2 mb-3">
                <button
                  onClick={() => handleTransportModeChange('walking')}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl transition-all ${
                    transportMode === 'walking'
                      ? 'bg-green-500 text-white shadow-lg'
                      : 'bg-white/10 text-white/60 hover:bg-white/20'
                  }`}
                >
                  <Footprints size={18} />
                  <span className="text-xs font-medium">Walk</span>
                </button>
                <button
                  onClick={() => handleTransportModeChange('biking')}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl transition-all ${
                    transportMode === 'biking'
                      ? 'bg-green-500 text-white shadow-lg'
                      : 'bg-white/10 text-white/60 hover:bg-white/20'
                  }`}
                >
                  <Bike size={18} />
                  <span className="text-xs font-medium">Bike</span>
                </button>
                <button
                  onClick={() => handleTransportModeChange('driving')}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl transition-all ${
                    transportMode === 'driving'
                      ? 'bg-green-500 text-white shadow-lg'
                      : 'bg-white/10 text-white/60 hover:bg-white/20'
                  }`}
                >
                  <Car size={18} />
                  <span className="text-xs font-medium">Drive</span>
                </button>
                <button
                  onClick={() => handleTransportModeChange('transit')}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl transition-all ${
                    transportMode === 'transit'
                      ? 'bg-green-500 text-white shadow-lg'
                      : 'bg-white/10 text-white/60 hover:bg-white/20'
                  }`}
                >
                  <Bus size={18} />
                  <span className="text-xs font-medium">Transit</span>
                </button>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                  <input
                    type="text"
                    value={destination}
                    onChange={handleAddressChange}
                    onKeyDown={(e) => e.key === 'Enter' && handleRouteSubmit()}
                    placeholder="Enter destination address..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-green-500 border border-white/10 transition-all"
                  />
                  {showSuggestions && addressSuggestions.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute left-0 right-0 top-full mt-2 z-10 bg-slate-800/95 backdrop-blur-md border border-white/30 rounded-xl max-h-48 overflow-y-auto shadow-2xl"
                    >
                      {addressSuggestions.map((suggestion, index) => (
                        <div
                          key={index}
                          className="px-4 py-3 cursor-pointer hover:bg-green-500/20 text-white text-sm border-b border-white/10 last:border-b-0 transition-colors flex items-center gap-2"
                          onClick={() => handleAddressSelect(suggestion)}
                        >
                          <Search className="text-green-400 flex-shrink-0" size={14} />
                          <p className="truncate">{suggestion.display_name}</p>
                        </div>
                      ))}
                    </motion.div>
                  )}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="absolute left-0 right-0 top-full mt-2 z-10 bg-red-500/90 backdrop-blur-md border border-red-400 rounded-xl px-4 py-3 text-white text-sm shadow-lg flex items-start gap-2"
                    >
                      <AlertTriangle className="text-white flex-shrink-0 mt-0.5" size={16} />
                      <span>{error}</span>
                    </motion.div>
                  )}
                </div>
                <button
                  onClick={handleRouteSubmit}
                  disabled={isSearching || !destination.trim()}
                  className={`px-5 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
                    isSearching || !destination.trim()
                      ? 'bg-gray-600 text-white/50 cursor-not-allowed' 
                      : 'bg-green-500 text-white hover:bg-green-600 shadow-lg shadow-green-500/30'
                  }`}
                >
                  {isSearching ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.928l3-2.647z"></path>
                      </svg>
                      <span>Finding...</span>
                    </>
                  ) : (
                    <>
                      <RouteIcon size={18} />
                      <span>Go</span>
                    </>
                  )}
                </button>
              </div>
              
              {routeInfo && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/5 rounded-xl p-3 border border-white/10"
                >
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    <div className="bg-white/5 rounded-lg p-2">
                      <span className="text-white/60 text-xs block mb-0.5">Distance</span>
                      <p className="text-white text-sm font-semibold">{routeInfo.distance}</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-2">
                      <span className="text-white/60 text-xs block mb-0.5">Duration</span>
                      <p className="text-white text-sm font-semibold">{routeInfo.duration}</p>
                    </div>
                    <div className={`rounded-lg p-2 ${
                      routeInfo.safetyScore >= 80 ? 'bg-green-500/20' : routeInfo.safetyScore >= 60 ? 'bg-yellow-500/20' : 'bg-red-500/20'
                    }`}>
                      <span className="text-white/60 text-xs block mb-0.5">Safety</span>
                      <p className={`text-sm font-bold ${
                        routeInfo.safetyScore >= 80 ? 'text-green-400' : routeInfo.safetyScore >= 60 ? 'text-yellow-400' : 'text-red-400'
                      }`}>{routeInfo.safetyScore}%</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <Camera className="text-purple-400" size={12} />
                      <span className="text-white/70">{routeInfo.camerasNearby} cameras</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <AlertTriangle className="text-red-400" size={12} />
                      <span className="text-white/70">{routeInfo.incidentsNearby} incidents nearby</span>
                    </div>
                  </div>
                </motion.div>
              )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Minimized Route Summary Bar */}
      <AnimatePresence>
        {!showRouteSearch && routeInfo && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            onClick={() => setShowRouteSearch(true)}
            className="absolute top-0 left-0 right-0 z-[1000] cursor-pointer"
          >
            <div className="px-6 py-3 bg-gradient-to-b from-slate-900 to-slate-900/95 backdrop-blur-xl border-b border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                    <RouteIcon className="text-white" size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold text-sm">
                      {allRoutes.length > 0 && allRoutes[selectedRouteIndex]
                        ? `${allRoutes[selectedRouteIndex].type.charAt(0).toUpperCase() + allRoutes[selectedRouteIndex].type.slice(1)} Route`
                        : 'Active Route'}
                    </h3>
                    <p className="text-white/60 text-xs truncate">{routeInfo.distance} · {routeInfo.duration}</p>
                  </div>
                  <div className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 ${
                    routeInfo.safetyScore >= 80
                      ? 'bg-green-500/20 border border-green-500/30'
                      : routeInfo.safetyScore >= 60
                      ? 'bg-yellow-500/20 border border-yellow-500/30'
                      : 'bg-red-500/20 border border-red-500/30'
                  }`}>
                    <Shield className={
                      routeInfo.safetyScore >= 80
                        ? 'text-green-400'
                        : routeInfo.safetyScore >= 60
                        ? 'text-yellow-400'
                        : 'text-red-400'
                    } size={14} />
                    <span className={`text-sm font-bold ${
                      routeInfo.safetyScore >= 80
                        ? 'text-green-400'
                        : routeInfo.safetyScore >= 60
                        ? 'text-yellow-400'
                        : 'text-red-400'
                    }`}>{routeInfo.safetyScore}%</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRouteCancel();
                    }}
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center flex-shrink-0"
                  >
                    <X className="text-white" size={16} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Route Selection Sidebar */}
      <AnimatePresence>
        {allRoutes.length > 1 && showRouteSidebar && (
          <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -100, opacity: 0 }}
            className="absolute top-32 left-3 z-[999] w-72"
          >
            <div className="bg-slate-900/80 backdrop-blur-md rounded-xl border border-white/10 overflow-hidden shadow-lg">
              <div className="p-3 border-b border-white/10 flex items-center justify-between">
                <div>
                  <h3 className="text-white font-semibold text-sm">Compare Routes</h3>
                  <p className="text-white/60 text-xs mt-0.5">Select to view on map</p>
                </div>
                <button
                  onClick={() => setShowRouteSidebar(false)}
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center flex-shrink-0"
                >
                  <X className="text-white" size={16} />
                </button>
              </div>
              <div className="p-2 space-y-2 max-h-96 overflow-y-auto">
                {allRoutes.map((route, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => {
                      setSelectedRouteIndex(index);
                      setRouteInfo({
                        distance: route.distance,
                        duration: route.duration,
                        safetyScore: route.safetyScore,
                        camerasNearby: route.camerasNearby,
                        incidentsNearby: route.incidentsNearby
                      });
                      setRouteInstructions(route.instructions);

                      // Highlight selected route on map
                      if (routeLayersRef.current && routeLayersRef.current.length > 0) {
                        routeLayersRef.current.forEach((r: any, i: number) => {
                          if (r.line) {
                            if (i === index) {
                              // Highlight selected route
                              r.line.setStyle({ weight: 8, opacity: 1.0 });
                              r.line.bringToFront();
                            } else {
                              // Dim other routes
                              r.line.setStyle({ weight: 4, opacity: 0.4 });
                            }
                          }
                        });
                      }
                    }}
                    className={`rounded-lg p-3 border transition-all cursor-pointer ${
                      selectedRouteIndex === index
                        ? 'bg-green-500/20 border-green-500/50 shadow-lg shadow-green-500/20'
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          route.type === 'safest' ? 'bg-green-500' : 'bg-blue-500'
                        }`} />
                        <span className={`text-xs font-bold uppercase tracking-wider ${
                          route.type === 'safest' ? 'text-green-400' : 'text-blue-400'
                        }`}>
                          {route.type}
                        </span>
                      </div>
                      {selectedRouteIndex === index && (
                        <div className="w-5 h-5 rounded-full flex items-center justify-center bg-green-500">
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <div className="bg-white/5 rounded p-1.5">
                        <span className="text-white/60 text-xs block mb-0.5">Distance</span>
                        <p className="text-white text-xs font-semibold">{route.distance}</p>
                      </div>
                      <div className="bg-white/5 rounded p-1.5">
                        <span className="text-white/60 text-xs block mb-0.5">Duration</span>
                        <p className="text-white text-xs font-semibold">{route.duration}</p>
                      </div>
                    </div>
                    <div className={`rounded p-1.5 ${
                      route.safetyScore >= 80 ? 'bg-green-500/20' : route.safetyScore >= 60 ? 'bg-yellow-500/20' : 'bg-red-500/20'
                    }`}>
                      <span className="text-white/60 text-xs block mb-0.5">Safety Score</span>
                      <div className="flex items-center justify-between">
                        <p className={`text-xs font-bold ${
                          route.safetyScore >= 80 ? 'text-green-400' : route.safetyScore >= 60 ? 'text-yellow-400' : 'text-red-400'
                        }`}>{route.safetyScore}%</p>
                        <div className="flex items-center gap-2 text-xs text-white/70">
                          <span>{route.incidentsNearby} incidents</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reopen Route Sidebar Button */}
      <AnimatePresence>
        {allRoutes.length > 1 && !showRouteSidebar && (
          <motion.button
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -100, opacity: 0 }}
            onClick={() => setShowRouteSidebar(true)}
            className="absolute top-32 left-3 z-[999] bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl shadow-lg flex items-center gap-2 transition-colors"
          >
            <RouteIcon size={16} />
            <span className="text-sm font-medium">Compare Routes</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Turn-by-Turn Directions */}
      <AnimatePresence>
        {routeInfo && routeInstructions.length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="absolute bottom-4 left-4 right-4 z-[999]"
          >
            <div className="bg-slate-900/70 backdrop-blur-md rounded-xl border border-white/10 overflow-hidden shadow-lg">
              {/* Next Direction */}
              <div className="p-3">
                <div className="flex items-start gap-2">
                  <div className="w-8 h-8 rounded-full bg-green-500/80 flex items-center justify-center flex-shrink-0">
                    <Navigation className="text-white" size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white/60 text-xs mb-0.5">Next</p>
                    <h3 className="text-white font-semibold text-xs leading-tight">{routeInstructions[0]?.text}</h3>
                    {routeInstructions[0]?.distance && (
                      <p className="text-green-400 text-xs mt-0.5 font-medium">in {routeInstructions[0].distance}</p>
                    )}
                  </div>
                  <button
                    onClick={() => setShowAllDirections(!showAllDirections)}
                    className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center flex-shrink-0"
                  >
                    {showAllDirections ? <ChevronDown className="text-white" size={14} /> : <ChevronUp className="text-white" size={14} />}
                  </button>
                </div>
              </div>

              {/* All Directions */}
              <AnimatePresence>
                {showAllDirections && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-white/10 max-h-40 overflow-y-auto">
                      {routeInstructions.slice(1).map((instruction, index) => (
                        <div key={index} className="px-3 py-2 border-b border-white/5 last:border-b-0 flex items-start gap-2">
                          <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-white/60 text-xs font-medium">{index + 2}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white/80 text-xs leading-tight">{instruction.text}</p>
                            {instruction.distance && (
                              <p className="text-white/50 text-xs mt-0.5">{instruction.distance}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}