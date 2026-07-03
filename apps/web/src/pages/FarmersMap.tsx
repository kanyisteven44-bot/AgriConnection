import { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { MapPin, Search, ListFilter as Filter, Locate, Layers, X, User, Leaf, ShoppingCart, Truck, Award, Loader as Loader2, CircleAlert as AlertCircle, Navigation, Users, RefreshCw, List, Grid2x2 as Grid, Map, Phone, MessageCircle, Star, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

interface MapUser {
  id: string;
  name: string;
  role: 'farmer' | 'buyer' | 'driver' | 'expert';
  latitude: number;
  longitude: number;
  location: string;
  verified: boolean;
  rating?: number;
  online: boolean;
  distance?: number;
}

const createIcon = (type: string, online: boolean = true) => {
  const colors: Record<string, string> = {
    farmer: '#16a34a',
    buyer: '#2563eb',
    driver: '#ea580c',
    expert: '#9333ea',
  };
  const color = colors[type] || '#6b7280';
  const opacity = online ? 1 : 0.5;

  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: ${color};
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: ${opacity};
        position: relative;
      ">
        ${getTypeIcon(type)}
        ${online ? '<div style="position:absolute;bottom:-2px;right:-2px;width:10px;height:10px;background:#22c55e;border-radius:50%;border:2px solid white;"></div>' : ''}
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20],
  });
};

const getTypeIcon = (type: string) => {
  const icons: Record<string, string> = {
    farmer: '<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" width="18" height="18"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>',
    buyer: '<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" width="18" height="18"><circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2"/></svg>',
    driver: '<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" width="18" height="18"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h5l3 4v5h-8V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>',
    expert: '<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" width="18" height="18"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>',
  };
  return icons[type] || icons.farmer;
};

const sampleUsers: MapUser[] = [
  { id: '1', name: 'John Kamau', role: 'farmer', latitude: -1.2864, longitude: 36.8172, location: 'Nairobi', verified: true, rating: 4.8, online: true },
  { id: '2', name: 'Mary Wanjiku', role: 'farmer', latitude: -1.2921, longitude: 36.8219, location: 'Nairobi West', verified: true, rating: 4.5, online: true },
  { id: '3', name: 'Peter Ochieng', role: 'buyer', latitude: -1.2841, longitude: 36.8123, location: 'Nairobi CBD', verified: false, rating: 4.2, online: false },
  { id: '4', name: 'Driver Sam', role: 'driver', latitude: -1.2889, longitude: 36.8284, location: 'Kilimani', verified: true, rating: 4.7, online: true },
  { id: '5', name: 'Dr. Jane Karanja', role: 'expert', latitude: -1.27, longitude: 36.86, location: 'Juja', verified: true, rating: 4.9, online: true },
];

function LocationFindButton({ onLocate }: { onLocate: (lat: number, lng: number) => void }) {
  const map = useMap();

  return (
    <button
      className="absolute bottom-24 right-4 z-[1000] bg-white px-3 py-2 rounded-lg shadow-lg flex items-center gap-2 hover:bg-gray-50"
      onClick={() => {
        map.locate();
        map.on('locationfound', (e) => {
          onLocate(e.latlng.lat, e.latlng.lng);
          map.setView(e.latlng, 14);
        });
        map.on('locationerror', () => {
          toast.error('Could not get your location');
        });
      }}
    >
      <Locate className="h-5 w-5 text-primary-600" />
      My Location
    </button>
  );
}

function MapEvents({ onZoom, onMove }: { onZoom: (z: number) => void; onMove: (center: [number, number]) => void }) {
  const map = useMap();
  useMapEvents({
    zoomend: () => onZoom(map.getZoom()),
    moveend: () => onMove([map.getCenter().lat, map.getCenter().lng]),
  });
  return null;
}

export default function FarmersMap() {
  const [filters, setFilters] = useState({
    farmers: true,
    buyers: true,
    drivers: true,
    experts: false,
    onlineOnly: false,
  });
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<MapUser | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [mapLayer, setMapLayer] = useState<'street' | 'satellite'>('street');
  const [zoom, setZoom] = useState(13);
  const [center, setCenter] = useState<[number, number]>([-1.2864, 36.8172]);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');

  const { isLoading } = useQuery({
    queryKey: ['map_users', center, filters],
    queryFn: async () => {
      return sampleUsers;
    },
  });

  const filteredUsers = useMemo(() => {
    return sampleUsers.filter(user => {
      if (!filters[user.role + 's' as keyof typeof filters] && !(user.role === 'farmer' && filters.farmers)) return false;
      if (filters.onlineOnly && !user.online) return false;
      if (search && !user.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [sampleUsers, filters, search]);

  const handleLocate = (lat: number, lng: number) => {
    setUserLocation([lat, lng]);
    toast.success('Location updated');
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      farmer: 'Farmer',
      buyer: 'Buyer',
      driver: 'Driver',
      expert: 'Expert',
    };
    return labels[role] || role;
  };

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      farmer: 'bg-green-100 text-green-700',
      buyer: 'bg-blue-100 text-blue-700',
      driver: 'bg-orange-100 text-orange-700',
      expert: 'bg-purple-100 text-purple-700',
    };
    return colors[role] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="h-[calc(100vh-64px)] relative">
      {viewMode === 'map' && (
        <MapContainer
          center={center}
          zoom={zoom}
          className="h-full w-full z-0"
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url={mapLayer === 'satellite'
              ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
              : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
            }
          />
          <MapEvents onZoom={setZoom} onMove={setCenter} />

          {filteredUsers.map(user => (
            <Marker
              key={user.id}
              position={[user.latitude, user.longitude]}
              icon={createIcon(user.role, user.online)}
              eventHandlers={{
                click: () => setSelectedUser(user),
              }}
            >
              <Popup>
                <div className="min-w-[200px] p-1">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center font-bold text-primary-700">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold">{user.name}</div>
                      <div className={`text-xs px-2 py-0.5 rounded-full inline-block ${getRoleColor(user.role)}`}>
                        {getRoleLabel(user.role)}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button className="flex-1 text-xs bg-primary-600 text-white px-2 py-1 rounded">
                      View Profile
                    </button>
                    <button className="flex-1 text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                      Message
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

          {userLocation && (
            <Marker
              position={userLocation}
              icon={L.divIcon({
                className: 'user-location-marker',
                html: `
                  <div style="
                    width: 16px;
                    height: 16px;
                    border-radius: 50%;
                    background: #3b82f6;
                    border: 3px solid white;
                    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.3);
                  "></div>
                `,
                iconSize: [16, 16],
                iconAnchor: [8, 8],
              })}
            />
          )}

          <LocationFindButton onLocate={handleLocate} />
        </MapContainer>
      )}

      <div className="absolute top-4 left-4 right-4 z-[1000] md:right-auto md:w-80">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-3 flex items-center gap-2">
            <Search className="h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name..."
              className="flex-1 outline-none text-sm"
            />
            <button onClick={() => setShowFilters(!showFilters)} className="p-1">
              <Filter className={`h-5 w-5 ${showFilters ? 'text-primary-600' : 'text-gray-400'}`} />
            </button>
          </div>

          {showFilters && (
            <div className="p-3 border-t space-y-3">
              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">Show on map</div>
                <div className="space-y-2">
                  {[
                    { key: 'farmers', label: 'Farmers', icon: Leaf },
                    { key: 'buyers', label: 'Buyers', icon: ShoppingCart },
                    { key: 'drivers', label: 'Drivers', icon: Truck },
                    { key: 'experts', label: 'Experts', icon: Award },
                  ].map(item => (
                    <label key={item.key} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={filters[item.key as keyof typeof filters]}
                        onChange={() => setFilters({ ...filters, [item.key]: !filters[item.key as keyof typeof filters] })}
                        className="rounded"
                      />
                      <item.icon className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={filters.onlineOnly}
                  onChange={() => setFilters({ ...filters, onlineOnly: !filters.onlineOnly })}
                  className="rounded"
                />
                <span className="text-sm">Online only</span>
              </label>
            </div>
          )}
        </div>
      </div>

      <div className="absolute bottom-4 left-4 z-[1000] flex gap-2">
        <button
          onClick={() => setMapLayer(mapLayer === 'street' ? 'satellite' : 'street')}
          className="bg-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 hover:bg-gray-50"
        >
          <Layers className="h-5 w-5 text-gray-600" />
          <span className="text-sm">{mapLayer === 'street' ? 'Satellite' : 'Street'}</span>
        </button>
        <div className="bg-white rounded-lg shadow-lg flex overflow-hidden">
          <button
            onClick={() => setViewMode('map')}
            className={`px-3 py-2 flex items-center gap-1 ${viewMode === 'map' ? 'bg-primary-50 text-primary-600' : ''}`}
          >
            <Map className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-2 flex items-center gap-1 ${viewMode === 'list' ? 'bg-primary-50 text-primary-600' : ''}`}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {selectedUser && (
        <div className="absolute bottom-4 right-4 z-[1000] w-80 bg-white rounded-xl shadow-lg overflow-hidden">
          <button
            onClick={() => setSelectedUser(null)}
            className="absolute top-2 right-2 p-1 hover:bg-gray-100 rounded"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>

          <div className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center font-bold text-primary-700 text-lg">
                {selectedUser.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  {selectedUser.name}
                  {selectedUser.verified && (
                    <span className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </span>
                  )}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${getRoleColor(selectedUser.role)}`}>
                    {getRoleLabel(selectedUser.role)}
                  </span>
                  {selectedUser.rating && (
                    <span className="flex items-center gap-1 text-xs text-gray-600">
                      <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                      {selectedUser.rating}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-3 text-sm text-gray-600">
              <MapPin className="h-4 w-4" />
              {selectedUser.location}
              <span className={`ml-auto flex items-center gap-1 text-xs ${selectedUser.online ? 'text-green-600' : 'text-gray-400'}`}>
                <span className={`w-2 h-2 rounded-full ${selectedUser.online ? 'bg-green-500' : 'bg-gray-400'}`} />
                {selectedUser.online ? 'Online' : 'Offline'}
              </span>
            </div>

            <div className="flex gap-2 mt-4">
              <button className="btn btn-primary flex-1 text-sm">
                <MessageCircle className="h-4 w-4" />
                Message
              </button>
              <button className="btn btn-secondary flex-1 text-sm">
                <User className="h-4 w-4" />
                Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {viewMode === 'list' && (
        <div className="absolute inset-0 bg-gray-50 z-[999] overflow-y-auto pt-4 pb-20 px-4">
          <div className="max-w-xl mx-auto space-y-3">
            {filteredUsers.map(user => (
              <button
                key={user.id}
                onClick={() => {
                  setSelectedUser(user);
                  setViewMode('map');
                  setCenter([user.latitude, user.longitude]);
                }}
                className="w-full card p-4 flex items-center gap-3"
              >
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center font-bold text-primary-700">
                  {user.name.charAt(0)}
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-medium text-gray-900">{user.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getRoleColor(user.role)}`}>
                      {getRoleLabel(user.role)}
                    </span>
                    <MapPin className="h-3 w-3" />
                    {user.location}
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
