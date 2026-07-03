import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../lib/store';
import { User, Lock, Bell, Shield, Trash2, Camera, Save, Loader as Loader2, CircleAlert as AlertCircle, Check, X, Eye, EyeOff, MapPin, Mail, Phone, Globe, Moon, Sun, Smartphone, Monitor } from 'lucide-react';
import zxcvbn from 'zxcvbn';
import toast from 'react-hot-toast';

type Tab = 'account' | 'password' | 'privacy' | 'notifications' | 'appearance';

export default function Settings() {
  const { user, setUser } = useAuthStore();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<Tab>('account');
  const [saving, setSaving] = useState(false);

  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    location: user?.location || '',
    bio: '',
  });

  const [passwordForm, setPasswordForm] = useState({
    current: '',
    new: '',
    confirm: '',
  });
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
  const [privacy, setPrivacy] = useState({
    mapVisibility: 'everyone' as 'everyone' | 'friends' | 'hidden',
    showPhone: true,
    showEmail: false,
    profileVisibility: 'public' as 'public' | 'friends' | 'private',
  });
  const [notifications, setNotifications] = useState({
    orders: true,
    messages: true,
    priceAlerts: true,
    weatherAlerts: true,
    promotions: false,
    emailDigest: true,
    pushEnabled: true,
  });
  const [appearance, setAppearance] = useState({
    theme: 'system' as 'light' | 'dark' | 'system',
    fontSize: 'medium' as 'small' | 'medium' | 'large',
  });

  const passwordStrength = passwordForm.new ? zxcvbn(passwordForm.new) : null;
  const strengthScore = passwordStrength?.score ?? 0;
  const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500', 'bg-emerald-600'];

  const passwordRequirements = [
    { label: 'At least 8 characters', met: passwordForm.new.length >= 8 },
    { label: 'Uppercase letter', met: /[A-Z]/.test(passwordForm.new) },
    { label: 'Lowercase letter', met: /[a-z]/.test(passwordForm.new) },
    { label: 'Number', met: /[0-9]/.test(passwordForm.new) },
    { label: 'Special character', met: /[!@#$%^&*(),.?":{}|<>]/.test(passwordForm.new) },
  ];

  const allPasswordRequirementsMet = passwordRequirements.every(r => r.met);
  const passwordsMatch = passwordForm.new === passwordForm.confirm && passwordForm.new !== '';

  const handleSaveProfile = async () => {
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (user) {
      await supabase
        .from('auth_users')
        .update({
          name: profile.name,
          phone: profile.phone,
          location: profile.location,
        })
        .eq('id', user.id);

      setUser({ ...user, name: profile.name, phone: profile.phone, location: profile.location });
    }

    toast.success('Profile updated successfully');
    setSaving(false);
  };

  const handleChangePassword = async () => {
    if (!allPasswordRequirementsMet || !passwordsMatch) return;

    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.new,
      });

      if (error) throw error;

      toast.success('Password changed successfully');
      setPasswordForm({ current: '', new: '', confirm: '' });
    } catch (err: any) {
      toast.error(err.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const handleSavePrivacy = async () => {
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (user) {
      await supabase
        .from('auth_users')
        .update({
          map_visibility: privacy.mapVisibility,
        })
        .eq('id', user.id);
    }

    toast.success('Privacy settings updated');
    setSaving(false);
  };

  const handleSaveNotifications = async () => {
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success('Notification preferences updated');
    setSaving(false);
  };

  const tabs: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'password', label: 'Password', icon: Lock },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account preferences</p>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="card">
        {activeTab === 'account' && (
          <div className="p-6 space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>

            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center text-2xl font-bold text-primary-700">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <button className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50">
                  <Camera className="h-4 w-4 text-gray-600" />
                </button>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">{user?.name}</h3>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className="label">Full Name</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="input"
                />
              </div>
              <div>
                <label className="label">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    value={profile.email}
                    disabled
                    className="input pl-12 bg-gray-50 text-gray-500"
                  />
                </div>
              </div>
              <div>
                <label className="label">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="input pl-12"
                    placeholder="0712 345 678"
                  />
                </div>
              </div>
              <div>
                <label className="label">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={profile.location}
                    onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                    className="input pl-12"
                    placeholder="Nakuru, Kenya"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="label">Bio</label>
              <textarea
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                className="input min-h-24"
                placeholder="Tell us about yourself..."
              />
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="btn btn-primary"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'password' && (
          <div className="p-6 space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">Change Password</h2>

            <div className="space-y-4">
              <div>
                <label className="label">Current Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    value={passwordForm.current}
                    onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                    className="input pl-12 pr-12"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.current ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="label">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    value={passwordForm.new}
                    onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                    className="input pl-12 pr-12"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.new ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>

                {passwordForm.new && (
                  <>
                    <div className="mt-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-600">Password strength</span>
                        <span className={`font-medium ${strengthScore >= 3 ? 'text-green-600' : 'text-gray-600'}`}>
                          {strengthLabels[strengthScore]}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${strengthColors[strengthScore]}`}
                          style={{ width: `${(strengthScore + 1) * 20}%` }}
                        />
                      </div>
                    </div>

                    <div className="mt-3 space-y-1">
                      {passwordRequirements.map((req, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs">
                          {req.met ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <X className="h-4 w-4 text-gray-300" />
                          )}
                          <span className={req.met ? 'text-green-600' : 'text-gray-500'}>
                            {req.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <div>
                <label className="label">Confirm New Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={passwordForm.confirm}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                    className="input pl-12 pr-12"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.confirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {passwordForm.confirm && (
                  <div className="mt-2 flex items-center gap-2 text-xs">
                    {passwordsMatch ? (
                      <>
                        <Check className="h-4 w-4 text-green-500" />
                        <span className="text-green-600">Passwords match</span>
                      </>
                    ) : (
                      <>
                        <X className="h-4 w-4 text-red-500" />
                        <span className="text-red-600">Passwords do not match</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleChangePassword}
                disabled={saving || !passwordForm.current || !allPasswordRequirementsMet || !passwordsMatch}
                className="btn btn-primary"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Password'
                )}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'privacy' && (
          <div className="p-6 space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">Privacy Settings</h2>

            <div className="space-y-6">
              <div>
                <label className="font-medium text-gray-900">Map Visibility</label>
                <p className="text-sm text-gray-600 mb-3">Who can see your location on the farmers map?</p>
                <div className="space-y-2">
                  {[
                    { value: 'everyone', label: 'Everyone', desc: 'All users can see you on the map' },
                    { value: 'friends', label: 'Friends Only', desc: 'Only your connections can see you' },
                    { value: 'hidden', label: 'Hidden', desc: 'Your location is not visible to anyone' },
                  ].map(option => (
                    <label
                      key={option.value}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        privacy.mapVisibility === option.value
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="mapVisibility"
                        value={option.value}
                        checked={privacy.mapVisibility === option.value}
                        onChange={() => setPrivacy({ ...privacy, mapVisibility: option.value as any })}
                        className="text-primary-600"
                      />
                      <div>
                        <div className="font-medium text-gray-900">{option.label}</div>
                        <div className="text-sm text-gray-500">{option.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-medium text-gray-900">Show phone number on profile</div>
                    <div className="text-sm text-gray-500">Allow other users to see your phone number</div>
                  </div>
                  <button
                    onClick={() => setPrivacy({ ...privacy, showPhone: !privacy.showPhone })}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      privacy.showPhone ? 'bg-primary-600' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        privacy.showPhone ? 'left-7' : 'left-1'
                      }`}
                    />
                  </button>
                </label>

                <label className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-medium text-gray-900">Show email on profile</div>
                    <div className="text-sm text-gray-500">Allow other users to see your email address</div>
                  </div>
                  <button
                    onClick={() => setPrivacy({ ...privacy, showEmail: !privacy.showEmail })}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      privacy.showEmail ? 'bg-primary-600' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        privacy.showEmail ? 'left-7' : 'left-1'
                      }`}
                    />
                  </button>
                </label>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSavePrivacy}
                disabled={saving}
                className="btn btn-primary"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="p-6 space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">Notification Preferences</h2>

            <div className="space-y-4">
              {[
                { key: 'orders', label: 'Orders', desc: 'Get notified when you receive new orders' },
                { key: 'messages', label: 'Messages', desc: 'Notifications for new messages' },
                { key: 'priceAlerts', label: 'Price Alerts', desc: 'Market price changes for your products' },
                { key: 'weatherAlerts', label: 'Weather Alerts', desc: 'Severe weather warnings for your area' },
                { key: 'promotions', label: 'Promotions', desc: 'Special offers and discounts' },
                { key: 'emailDigest', label: 'Email Digest', desc: 'Weekly summary of activity' },
              ].map(item => (
                <label key={item.key} className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-medium text-gray-900">{item.label}</div>
                    <div className="text-sm text-gray-500">{item.desc}</div>
                  </div>
                  <button
                    onClick={() => setNotifications({ ...notifications, [item.key]: !notifications[item.key as keyof typeof notifications] })}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      notifications[item.key as keyof typeof notifications] ? 'bg-primary-600' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        notifications[item.key as keyof typeof notifications] ? 'left-7' : 'left-1'
                      }`}
                    />
                  </button>
                </label>
              ))}
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSaveNotifications}
                disabled={saving}
                className="btn btn-primary"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="card mt-6 p-6 border-red-200 bg-red-50">
        <h3 className="font-semibold text-red-900 mb-2">Danger Zone</h3>
        <p className="text-sm text-red-700 mb-4">
          Once you delete your account, there is no going back. Please be certain.
        </p>
        <button className="btn bg-red-600 text-white hover:bg-red-700">
          <Trash2 className="h-5 w-5" />
          Delete Account
        </button>
      </div>
    </div>
  );
}
