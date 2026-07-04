import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../lib/store';
import { formatDate, formatTime, getInitials } from '../lib/utils';
import { User, MapPin, Phone, Mail, Calendar, Star, CreditCard as Edit2, Settings, Package, Leaf, Award, Truck, ShoppingCart, Heart, MessageCircle, Loader as Loader2, CircleAlert as AlertCircle, Camera, Share2, Shield, BadgeCheck, Users, Clock, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  avatar_url?: string;
  role: 'farmer' | 'buyer' | 'admin';
  bio?: string;
  created_at: string;
  verified: boolean;
  stats?: {
    products: number;
    orders: number;
    rating: number;
    reviews: number;
    joined: string;
  };
}

export default function Profile() {
  const { userId } = useParams();
  const { user: currentUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'reviews' | 'activity'>('overview');
  const isOwnProfile = !userId || userId === String(currentUser?.id);

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['profile', userId],
    queryFn: async (): Promise<UserProfile | null> => {
      const targetId = userId || currentUser?.id;
      if (!targetId) return null;

      const { data, error } = await supabase
        .from('auth_users')
        .select('*')
        .eq('id', targetId)
        .maybeSingle();

      if (error) throw error;

      return data ? {
        ...data,
        id: String(data.id),
        stats: {
          products: Math.floor(Math.random() * 20),
          orders: Math.floor(Math.random() * 50),
          rating: 4.5 + Math.random() * 0.5,
          reviews: Math.floor(Math.random() * 30),
          joined: data.created_at,
        },
      } : null;
    },
    enabled: !!currentUser || !!userId,
  });

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Profile not found</h2>
          <Link to="/" className="btn btn-primary">Go Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="relative">
        <div className="h-48 bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl overflow-hidden">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M20 20.5V18H0v-2h20v-2.5L25 18l-5 2.5z\' fill=\'%23fff\' fill-opacity=\'0.4\'/%3E%3C/svg%3E")',
            }}
          />
        </div>

        <div className="relative px-6 -mt-16 sm:-mt-20">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className="relative">
              <div className="w-32 h-32 sm:w-40 sm:h-40 bg-white rounded-2xl shadow-lg flex items-center justify-center text-5xl font-bold text-primary-600 border-4 border-white overflow-hidden">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt={profile.name} className="w-full h-full object-cover" />
                ) : (
                  getInitials(profile.name)
                )}
              </div>
              {isOwnProfile && (
                <button className="absolute bottom-2 right-2 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50">
                  <Camera className="h-4 w-4 text-gray-600" />
                </button>
              )}
              {profile.verified && (
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                  <BadgeCheck className="h-5 w-5 text-white" />
                </div>
              )}
            </div>

            <div className="flex-1 pt-4 sm:pt-20">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    {profile.name}
                    {profile.verified && (
                      <span title="Verified">
                        <Shield className="h-5 w-5 text-green-500" />
                      </span>
                    )}
                  </h1>
                  <span className="inline-flex items-center gap-1 text-sm text-gray-600 capitalize mt-1">
                    <Leaf className="h-4 w-4 text-green-600" />
                    {profile.role}
                  </span>
                </div>
                <div className="flex gap-3">
                  {isOwnProfile ? (
                    <>
                      <Link to="/settings" className="btn btn-secondary">
                        <Edit2 className="h-4 w-4" />
                        Edit Profile
                      </Link>
                      <Link to="/settings" className="btn btn-secondary">
                        <Settings className="h-4 w-4" />
                        Settings
                      </Link>
                    </>
                  ) : (
                    <>
                      <button className="btn btn-primary">
                        <MessageCircle className="h-4 w-4" />
                        Message
                      </button>
                      <button className="btn btn-secondary">
                        <Heart className="h-4 w-4" />
                        Follow
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 grid sm:grid-cols-4 gap-4">
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="h-5 w-5 text-gray-400" />
              <span>{profile.location || 'Location not set'}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="h-5 w-5 text-gray-400" />
              <span>Joined {formatDate(profile.created_at)}</span>
            </div>
            {profile.phone && (
              <div className="flex items-center gap-2 text-gray-600">
                <Phone className="h-5 w-5 text-gray-400" />
                <span>{profile.phone}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-gray-600">
              <Mail className="h-5 w-5 text-gray-400" />
              <span>{profile.email}</span>
            </div>
          </div>

          {profile.bio && (
            <p className="mt-4 text-gray-700">{profile.bio}</p>
          )}
        </div>
      </div>

      <div className="grid sm:grid-cols-4 gap-4 mt-8">
        <div className="card p-4 text-center">
          <Package className="h-8 w-8 mx-auto mb-2 text-primary-600" />
          <div className="text-2xl font-bold text-gray-900">{profile.stats?.products || 0}</div>
          <div className="text-sm text-gray-600">Products</div>
        </div>
        <div className="card p-4 text-center">
          <ShoppingCart className="h-8 w-8 mx-auto mb-2 text-blue-600" />
          <div className="text-2xl font-bold text-gray-900">{profile.stats?.orders || 0}</div>
          <div className="text-sm text-gray-600">Orders</div>
        </div>
        <div className="card p-4 text-center">
          <Star className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
          <div className="text-2xl font-bold text-gray-900">{profile.stats?.rating.toFixed(1)}</div>
          <div className="text-sm text-gray-600">Rating</div>
        </div>
        <div className="card p-4 text-center">
          <Users className="h-8 w-8 mx-auto mb-2 text-green-600" />
          <div className="text-2xl font-bold text-gray-900">{profile.stats?.reviews || 0}</div>
          <div className="text-sm text-gray-600">Reviews</div>
        </div>
      </div>

      <div className="mt-8">
        <div className="flex gap-4 border-b overflow-x-auto">
          {(['overview', 'products', 'reviews', 'activity'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 px-4 font-medium capitalize whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="py-6">
          {activeTab === 'overview' && (
            <div className="grid md:grid-cols-2 gap-6">
              <div className="card p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary-600" />
                  Recent Activity
                </h3>
                <div className="space-y-4">
                  {[
                    { action: 'Listed new product', item: 'Fresh Tomatoes - 200kg', time: '2 hours ago' },
                    { action: 'Received order', item: 'Order #123 from Mary W.', time: '1 day ago' },
                    { action: 'Got a review', item: '5 stars from John K.', time: '2 days ago' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                        <Clock className="h-5 w-5 text-primary-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{item.action}</p>
                        <p className="text-sm text-gray-600">{item.item}</p>
                        <p className="text-xs text-gray-400">{item.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Award className="h-5 w-5 text-yellow-500" />
                  Achievements
                </h3>
                <div className="space-y-3">
                  {[
                    { icon: '🌱', title: 'Newcomer', desc: 'Joined the platform' },
                    { icon: '📦', title: 'First Sale', desc: 'Made your first sale' },
                    { icon: '⭐', title: 'Highly Rated', desc: 'Received 10+ positive reviews' },
                    { icon: '🚀', title: 'Top Seller', desc: '50+ successful orders' },
                  ].map((badge, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-3 p-3 rounded-lg ${
                        i < 2 ? 'bg-primary-50' : 'bg-gray-50 opacity-50'
                      }`}
                    >
                      <span className="text-2xl">{badge.icon}</span>
                      <div>
                        <p className="font-medium text-gray-900">{badge.title}</p>
                        <p className="text-sm text-gray-600">{badge.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div className="text-center py-12 text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No products to display</p>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="text-center py-12 text-gray-500">
              <Star className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No reviews yet</p>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="text-center py-12 text-gray-500">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No recent activity</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
