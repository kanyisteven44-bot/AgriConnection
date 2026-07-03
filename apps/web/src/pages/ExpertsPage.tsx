import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Award, Search, ListFilter as Filter, Star, MapPin, Phone, MessageCircle, Calendar, Clock, Loader as Loader2, CircleAlert as AlertCircle, X, CircleCheck as CheckCircle, Video, Users, Building, ChevronDown, Globe, BookOpen, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';

interface Expert {
  id: string;
  name: string;
  avatar_url?: string;
  phone: string;
  location: string;
  specialization: 'agronomy' | 'livestock' | 'pest_control' | 'irrigation' | 'agribusiness' | 'soil_science';
  qualifications: string[];
  experience_years: number;
  rating: number;
  total_consultations: number;
  verified: boolean;
  available: boolean;
  consultation_fee: number;
  consultation_types: ('online' | 'physical')[];
  languages: string[];
  bio?: string;
  next_available?: string;
}

const specializationIcons: Record<string, string> = {
  agronomy: '🌾',
  livestock: '🐄',
  pest_control: '🐛',
  irrigation: '💧',
  agribusiness: '📊',
  soil_science: '🌍',
};

const specializationLabels: Record<string, string> = {
  agronomy: 'Agronomy & Crop Science',
  livestock: 'Livestock & Animal Health',
  pest_control: 'Pest & Disease Control',
  irrigation: 'Irrigation & Water Management',
  agribusiness: 'Agribusiness & Marketing',
  soil_science: 'Soil Science & Fertility',
};

const sampleExperts: Expert[] = [
  {
    id: 'e1',
    name: 'Dr. Mary Wambui',
    phone: '+254 700 123 456',
    location: 'Nairobi',
    specialization: 'agronomy',
    qualifications: ['PhD Crop Science', 'MSc Agronomy (UoN)'],
    experience_years: 15,
    rating: 4.9,
    total_consultations: 342,
    verified: true,
    available: true,
    consultation_fee: 2500,
    consultation_types: ['online', 'physical'],
    languages: ['English', 'Swahili', 'Kikuyu'],
    bio: 'Expert in sustainable crop production with focus on smallholder farming systems. Former KALI researcher with 15+ years experience.',
    next_available: 'Today, 2:00 PM',
  },
  {
    id: 'e2',
    name: 'Dr. James Ochieng',
    phone: '+254 733 234 567',
    location: 'Kisumu',
    specialization: 'livestock',
    qualifications: ['PhD Veterinary Medicine', 'BVM (UoN)'],
    experience_years: 20,
    rating: 4.8,
    total_consultations: 567,
    verified: true,
    available: true,
    consultation_fee: 3000,
    consultation_types: ['online', 'physical'],
    languages: ['English', 'Swahili', 'Dholuo'],
    bio: 'Specialized in dairy cattle health and production. 20 years of practical veterinary experience across Kenya.',
    next_available: 'Tomorrow, 9:00 AM',
  },
  {
    id: 'e3',
    name: 'Prof. Samuel Kiprop',
    phone: '+254 722 345 678',
    location: 'Eldoret',
    specialization: 'soil_science',
    qualifications: ['PhD Soil Science', 'MSc Agriculture (Egerton)'],
    experience_years: 18,
    rating: 4.7,
    total_consultations: 234,
    verified: true,
    available: false,
    consultation_fee: 2000,
    consultation_types: ['online'],
    languages: ['English', 'Swahili', 'Kalenjin'],
    bio: 'Expert in soil fertility management and conservation agriculture. Leading researcher in soil health for smallholders.',
    next_available: 'Friday, 10:00 AM',
  },
  {
    id: 'e4',
    name: 'Jane Muthoni',
    phone: '+254 711 456 789',
    location: 'Nakuru',
    specialization: 'pest_control',
    qualifications: ['MSc Plant Protection', 'BSc Agriculture'],
    experience_years: 12,
    rating: 4.6,
    total_consultations: 189,
    verified: true,
    available: true,
    consultation_fee: 1800,
    consultation_types: ['online', 'physical'],
    languages: ['English', 'Swahili', 'Kikuyu'],
    bio: 'Integrated pest management specialist with focus on eco-friendly solutions. Trained over 1000 farmers.',
    next_available: 'Today, 4:00 PM',
  },
  {
    id: 'e5',
    name: 'Michael Njoroge',
    phone: '+254 700 567 890',
    location: 'Nairobi',
    specialization: 'agribusiness',
    qualifications: ['MBA Agribusiness', 'BSc Economics'],
    experience_years: 10,
    rating: 4.5,
    total_consultations: 156,
    verified: true,
    available: true,
    consultation_fee: 3500,
    consultation_types: ['online', 'physical'],
    languages: ['English', 'Swahili'],
    bio: 'Expert in farm business planning, financing, and market access. Helped farmers access over KES 50M in financing.',
    next_available: 'Tomorrow, 11:00 AM',
  },
];

export default function ExpertsPage() {
  const [search, setSearch] = useState('');
  const [specializationFilter, setSpecializationFilter] = useState<string>('all');
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    type: 'online' as 'online' | 'physical',
    date: '',
    time: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const filteredExperts = sampleExperts.filter(expert => {
    const matchesSearch = expert.name.toLowerCase().includes(search.toLowerCase()) ||
      expert.location.toLowerCase().includes(search.toLowerCase());
    const matchesSpecialization = specializationFilter === 'all' || expert.specialization === specializationFilter;
    const matchesAvailability = !showAvailableOnly || expert.available;
    return matchesSearch && matchesSpecialization && matchesAvailability;
  });

  const handleBooking = async () => {
    if (!bookingForm.date || !bookingForm.time) {
      toast.error('Please select date and time');
      return;
    }

    setSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    toast.success('Consultation booked successfully! You will receive a confirmation shortly.');
    setSubmitting(false);
    setShowBookingModal(false);
    setBookingForm({ type: 'online', date: '', time: '', notes: '' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Expert Consultants</h1>
        <p className="text-gray-600 mt-2">Connect with agricultural experts for professional advice</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6 mb-6">
        {[
          { icon: '🌾', label: 'Agronomy', count: 12, key: 'agronomy' },
          { icon: '🐄', label: 'Livestock', count: 8, key: 'livestock' },
          { icon: '🐛', label: 'Pest Control', count: 6, key: 'pest_control' },
          { icon: '💧', label: 'Irrigation', count: 4, key: 'irrigation' },
          { icon: '📊', label: 'Agribusiness', count: 5, key: 'agribusiness' },
          { icon: '🌍', label: 'Soil Science', count: 7, key: 'soil_science' },
        ].map(cat => (
          <button
            key={cat.key}
            onClick={() => setSpecializationFilter(specializationFilter === cat.key ? 'all' : cat.key)}
            className={`card p-4 text-center transition-all ${
              specializationFilter === cat.key
                ? 'ring-2 ring-primary-500 bg-primary-50'
                : 'hover:shadow-lg'
            }`}
          >
            <div className="text-3xl mb-2">{cat.icon}</div>
            <div className="font-medium text-gray-900">{cat.label}</div>
            <div className="text-sm text-gray-500">{cat.count} experts</div>
          </button>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search experts by name or location..."
            className="input pl-12"
          />
        </div>
        <label className="flex items-center gap-2 px-4 bg-white border rounded-lg cursor-pointer">
          <input
            type="checkbox"
            checked={showAvailableOnly}
            onChange={(e) => setShowAvailableOnly(e.target.checked)}
            className="rounded"
          />
          <span className="text-sm whitespace-nowrap">Available Now</span>
        </label>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredExperts.map(expert => (
          <div
            key={expert.id}
            className="card overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className={`px-4 py-2 ${expert.available ? 'bg-green-600' : 'bg-gray-400'} text-white text-sm flex items-center justify-between`}>
              <span className="font-medium">{expert.available ? 'Available' : 'Unavailable'}</span>
              {expert.next_available && !expert.available && (
                <span className="text-xs opacity-90">{expert.next_available}</span>
              )}
            </div>

            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="relative">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center text-2xl">
                    {specializationIcons[expert.specialization]}
                  </div>
                  {expert.verified && (
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{expert.name}</h3>
                  <p className="text-sm text-purple-600 font-medium">
                    {specializationLabels[expert.specialization]}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    <span className="font-medium text-sm">{expert.rating}</span>
                    <span className="text-xs text-gray-500">({expert.total_consultations} consultations)</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  {expert.location}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  {expert.experience_years} years experience
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <DollarSign className="h-4 w-4" />
                  KSh {expert.consultation_fee} per session
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                {expert.consultation_types.includes('online') && (
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                    <Video className="h-3 w-3 inline mr-1" />
                    Online
                  </span>
                )}
                {expert.consultation_types.includes('physical') && (
                  <span className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded">
                    <Building className="h-3 w-3 inline mr-1" />
                    Physical
                  </span>
                )}
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => { setSelectedExpert(expert); setShowBookingModal(true); }}
                  disabled={!expert.available}
                  className="btn btn-primary flex-1 text-sm"
                >
                  <Calendar className="h-4 w-4" />
                  Book
                </button>
                <button className="btn btn-secondary">
                  <MessageCircle className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredExperts.length === 0 && (
        <div className="text-center py-12">
          <Award className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-600">No experts found matching your criteria.</p>
        </div>
      )}

      {showBookingModal && selectedExpert && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[2000] p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Book Consultation</h2>
              <button onClick={() => setShowBookingModal(false)}>
                <X className="h-6 w-6 text-gray-400" />
              </button>
            </div>

            <div className="mb-4 p-3 bg-gray-50 rounded-lg flex items-center gap-3">
              <div className="text-2xl">{specializationIcons[selectedExpert.specialization]}</div>
              <div>
                <div className="font-medium">{selectedExpert.name}</div>
                <div className="text-sm text-gray-600">{specializationLabels[selectedExpert.specialization]}</div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="label">Consultation Type</label>
                <div className="flex gap-4">
                  {selectedExpert.consultation_types.includes('online') && (
                    <label className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer flex-1 ${
                      bookingForm.type === 'online' ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
                    }`}>
                      <input
                        type="radio"
                        name="type"
                        value="online"
                        checked={bookingForm.type === 'online'}
                        onChange={() => setBookingForm({ ...bookingForm, type: 'online' })}
                        className="text-primary-600"
                      />
                      <div>
                        <div className="font-medium text-sm flex items-center gap-1">
                          <Video className="h-4 w-4" /> Online
                        </div>
                      </div>
                    </label>
                  )}
                  {selectedExpert.consultation_types.includes('physical') && (
                    <label className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer flex-1 ${
                      bookingForm.type === 'physical' ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
                    }`}>
                      <input
                        type="radio"
                        name="type"
                        value="physical"
                        checked={bookingForm.type === 'physical'}
                        onChange={() => setBookingForm({ ...bookingForm, type: 'physical' })}
                        className="text-primary-600"
                      />
                      <div>
                        <div className="font-medium text-sm flex items-center gap-1">
                          <Building className="h-4 w-4" /> Physical
                        </div>
                      </div>
                    </label>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Date</label>
                  <input
                    type="date"
                    value={bookingForm.date}
                    onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })}
                    className="input"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <label className="label">Time</label>
                  <input
                    type="time"
                    value={bookingForm.time}
                    onChange={(e) => setBookingForm({ ...bookingForm, time: e.target.value })}
                    className="input"
                  />
                </div>
              </div>

              <div>
                <label className="label">What do you need help with?</label>
                <textarea
                  value={bookingForm.notes}
                  onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })}
                  className="input min-h-24"
                  placeholder="Describe your farming challenge or question..."
                />
              </div>
            </div>

            <div className="flex items-center justify-between mt-4 p-3 bg-primary-50 rounded-lg">
              <span className="font-medium text-gray-900">Consultation Fee</span>
              <span className="text-lg font-bold text-primary-600">KSh {selectedExpert.consultation_fee}</span>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowBookingModal(false)} className="btn btn-secondary flex-1">
                Cancel
              </button>
              <button
                onClick={handleBooking}
                disabled={submitting}
                className="btn btn-primary flex-1"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Booking...
                  </>
                ) : (
                  'Confirm Booking'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
