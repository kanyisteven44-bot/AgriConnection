import { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Truck, Search, ListFilter as Filter, Star, Phone, MapPin, Clock, Package, Loader as Loader2, CircleAlert as AlertCircle, X, Navigation, MessageCircle, CircleCheck as CheckCircle, Calendar, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';

interface Driver {
  id: string;
  name: string;
  phone: string;
  avatar_url?: string;
  latitude: number;
  longitude: number;
  location: string;
  vehicle_type: 'pickup' | 'truck' | 'trailer' | 'motorcycle';
  vehicle_make?: string;
  vehicle_plate?: string;
  capacity_kg: number;
  rating: number;
  total_trips: number;
  verified: boolean;
  available: boolean;
  rate_per_km?: number;
}

const vehicleIcons: Record<string, string> = {
  pickup: '🚐',
  truck: '🚛',
  trailer: '🚚',
  motorcycle: '🏍️',
};

const createDriverIcon = (available: boolean) => {
  return L.divIcon({
    className: 'driver-marker',
    html: `
      <div style="
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: ${available ? '#ea580c' : '#9ca3af'};
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
      ">
        🚛
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
};

const sampleDrivers: Driver[] = [
  {
    id: 'd1',
    name: 'Samuel Mwangi',
    phone: '+254 712 345 678',
    latitude: -1.2864,
    longitude: 36.8172,
    location: 'Nairobi CBD',
    vehicle_type: 'pickup',
    vehicle_make: 'Toyota Hilux',
    vehicle_plate: 'KDA 123A',
    capacity_kg: 1000,
    rating: 4.8,
    total_trips: 156,
    verified: true,
    available: true,
    rate_per_km: 50,
  },
  {
    id: 'd2',
    name: 'James Kiprop',
    phone: '+254 722 456 789',
    latitude: -1.291,
    longitude: 36.825,
    location: 'Westlands',
    vehicle_type: 'truck',
    vehicle_make: 'Isuzu NPR',
    vehicle_plate: 'KBC 456X',
    capacity_kg: 5000,
    rating: 4.6,
    total_trips: 89,
    verified: true,
    available: true,
    rate_per_km: 80,
  },
  {
    id: 'd3',
    name: 'Francis Otieno',
    phone: '+254 733 567 890',
    latitude: -1.28,
    longitude: 36.81,
    location: 'Industrial Area',
    vehicle_type: 'trailer',
    vehicle_make: 'Mercedes Benz',
    vehicle_plate: 'KDE 789Z',
    capacity_kg: 15000,
    rating: 4.9,
    total_trips: 234,
    verified: true,
    available: false,
    rate_per_km: 120,
  },
  {
    id: 'd4',
    name: 'Peter Macharia',
    phone: '+254 744 678 901',
    latitude: -1.295,
    longitude: 36.83,
    location: 'Kilimani',
    vehicle_type: 'motorcycle',
    vehicle_make: 'Honda CB150',
    vehicle_plate: 'KMZ 123B',
    capacity_kg: 50,
    rating: 4.5,
    total_trips: 312,
    verified: false,
    available: true,
    rate_per_km: 25,
  },
];

export default function DriversPage() {
  const [search, setSearch] = useState('');
  const [vehicleFilter, setVehicleFilter] = useState<string>('all');
  const [showAvailableOnly, setShowAvailableOnly] = useState(true);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestForm, setRequestForm] = useState({
    pickup: '',
    dropoff: '',
    weight: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const filteredDrivers = sampleDrivers.filter(driver => {
    const matchesSearch = driver.name.toLowerCase().includes(search.toLowerCase()) ||
      driver.location.toLowerCase().includes(search.toLowerCase());
    const matchesVehicle = vehicleFilter === 'all' || driver.vehicle_type === vehicleFilter;
    const matchesAvailability = !showAvailableOnly || driver.available;
    return matchesSearch && matchesVehicle && matchesAvailability;
  });

  const handleRequest = async () => {
    if (!requestForm.pickup || !requestForm.dropoff || !requestForm.weight) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    toast.success('Transport request sent to driver!');
    setSubmitting(false);
    setShowRequestModal(false);
    setRequestForm({ pickup: '', dropoff: '', weight: '', notes: '' });
  };

  return (
    <div className="h-[calc(100vh-64px)] relative">
      <MapContainer
        center={[-1.2864, 36.8172]}
        zoom={14}
        className="h-full w-full z-0"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {filteredDrivers.map(driver => (
          <Marker
            key={driver.id}
            position={[driver.latitude, driver.longitude]}
            icon={createDriverIcon(driver.available)}
            eventHandlers={{ click: () => setSelectedDriver(driver) }}
          >
            <Popup>
              <div className="min-w-[180px]">
                <div className="font-semibold">{driver.name}</div>
                <div className="text-sm text-gray-600">{vehicleIcons[driver.vehicle_type]} {driver.vehicle_make}</div>
                <div className="text-sm font-medium mt-1">{driver.capacity_kg}kg capacity</div>
                <button
                  className="w-full mt-2 bg-primary-600 text-white text-sm px-3 py-1 rounded"
                  onClick={() => setShowRequestModal(true)}
                >
                  Request Transport
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      <div className="absolute top-4 left-4 right-4 md:right-auto md:w-96 z-[1000]">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-4 border-b">
            <h1 className="text-xl font-bold text-gray-900">Transport Services</h1>
            <p className="text-sm text-gray-600">Find drivers to deliver your produce</p>
          </div>

          <div className="p-3 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search drivers or locations..."
                className="input pl-10"
              />
            </div>

            <div className="flex gap-2">
              <select
                value={vehicleFilter}
                onChange={(e) => setVehicleFilter(e.target.value)}
                className="flex-1 input"
              >
                <option value="all">All Vehicles</option>
                <option value="motorcycle">Motorcycle (50kg)</option>
                <option value="pickup">Pickup (1 ton)</option>
                <option value="truck">Truck (5 tons)</option>
                <option value="trailer">Trailer (15+ tons)</option>
              </select>
              <label className="flex items-center gap-2 px-3 bg-gray-100 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={showAvailableOnly}
                  onChange={(e) => setShowAvailableOnly(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm whitespace-nowrap">Available</span>
              </label>
            </div>
          </div>

          <div className="max-h-[40vh] overflow-y-auto">
            {filteredDrivers.map(driver => (
              <button
                key={driver.id}
                onClick={() => setSelectedDriver(driver)}
                className={`w-full p-4 flex items-center gap-3 hover:bg-gray-50 border-t text-left ${
                  selectedDriver?.id === driver.id ? 'bg-primary-50' : ''
                }`}
              >
                <div className="relative">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-xl">
                    {vehicleIcons[driver.vehicle_type]}
                  </div>
                  <div
                    className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                      driver.available ? 'bg-green-500' : 'bg-gray-400'
                    }`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 truncate">{driver.name}</span>
                    {driver.verified && (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>{driver.vehicle_make || driver.vehicle_type}</span>
                    <span>•</span>
                    <span>{driver.capacity_kg}kg</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                    <span>{driver.rating}</span>
                    <span className="text-gray-400">({driver.total_trips} trips)</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-primary-600">
                    KSh {driver.rate_per_km}/km
                  </div>
                  <div className="text-xs text-gray-500">{driver.location}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {selectedDriver && (
        <div className="absolute bottom-4 right-4 z-[1000] w-80 bg-white rounded-xl shadow-lg overflow-hidden">
          <div className={`px-4 py-2 ${selectedDriver.available ? 'bg-green-600' : 'bg-gray-500'} text-white`}>
            <span className="text-sm font-medium">
              {selectedDriver.available ? 'Available Now' : 'Currently Busy'}
            </span>
          </div>

          <div className="p-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center text-2xl">
                {vehicleIcons[selectedDriver.vehicle_type]}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  {selectedDriver.name}
                  {selectedDriver.verified && (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                </h3>
                <p className="text-sm text-gray-600">{selectedDriver.vehicle_make}</p>
                <p className="text-sm text-gray-600">{selectedDriver.vehicle_plate}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="font-semibold text-gray-900">{selectedDriver.capacity_kg}kg</div>
                <div className="text-gray-500">Capacity</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="font-semibold text-gray-900">KSh {selectedDriver.rate_per_km}</div>
                <div className="text-gray-500">Per km</div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                <span className="font-medium">{selectedDriver.rating}</span>
              </div>
              <div className="text-sm text-gray-600">{selectedDriver.total_trips} completed trips</div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowRequestModal(true)}
                disabled={!selectedDriver.available}
                className="btn btn-primary flex-1"
              >
                <Truck className="h-4 w-4" />
                Request
              </button>
              <button className="btn btn-secondary">
                <Phone className="h-4 w-4" />
              </button>
              <button className="btn btn-secondary">
                <MessageCircle className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {showRequestModal && selectedDriver && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[2000] p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Request Transport</h2>
              <button onClick={() => setShowRequestModal(false)}>
                <X className="h-6 w-6 text-gray-400" />
              </button>
            </div>

            <div className="mb-4 p-3 bg-gray-50 rounded-lg flex items-center gap-3">
              <div className="text-xl">{vehicleIcons[selectedDriver.vehicle_type]}</div>
              <div>
                <div className="font-medium">{selectedDriver.name}</div>
                <div className="text-sm text-gray-600">{selectedDriver.vehicle_make} • {selectedDriver.capacity_kg}kg</div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="label">Pickup Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={requestForm.pickup}
                    onChange={(e) => setRequestForm({ ...requestForm, pickup: e.target.value })}
                    className="input pl-10"
                    placeholder="Farm location"
                  />
                </div>
              </div>

              <div>
                <label className="label">Drop-off Location</label>
                <div className="relative">
                  <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={requestForm.dropoff}
                    onChange={(e) => setRequestForm({ ...requestForm, dropoff: e.target.value })}
                    className="input pl-10"
                    placeholder="Destination"
                  />
                </div>
              </div>

              <div>
                <label className="label">Total Weight (kg)</label>
                <input
                  type="number"
                  value={requestForm.weight}
                  onChange={(e) => setRequestForm({ ...requestForm, weight: e.target.value })}
                  className="input"
                  placeholder="Estimated weight"
                  max={selectedDriver.capacity_kg}
                />
              </div>

              <div>
                <label className="label">Additional Notes</label>
                <textarea
                  value={requestForm.notes}
                  onChange={(e) => setRequestForm({ ...requestForm, notes: e.target.value })}
                  className="input min-h-20"
                  placeholder="Any special instructions..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowRequestModal(false)} className="btn btn-secondary flex-1">
                Cancel
              </button>
              <button
                onClick={handleRequest}
                disabled={submitting}
                className="btn btn-primary flex-1"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Request'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
