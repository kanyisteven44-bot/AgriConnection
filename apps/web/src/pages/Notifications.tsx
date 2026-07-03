import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { formatDate, formatTime } from '../lib/utils';
import { Bell, ShoppingCart, MessageCircle, Star, TriangleAlert as AlertTriangle, Check, Trash2, Settings, Loader as Loader2, X, Package, Truck, User, Shield, Calendar, MapPin, Coins, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';

interface Notification {
  id: string;
  type: 'order' | 'message' | 'review' | 'alert' | 'system' | 'price' | 'weather' | 'promotion';
  title: string;
  content: string;
  is_read: boolean;
  created_at: string;
  action_url?: string;
  image_url?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
}

const sampleNotifications: Notification[] = [
  {
    id: '1',
    type: 'order',
    title: 'New order received',
    content: 'Mary Wanjiku ordered 50kg of tomatoes for KSh 2,500.',
    is_read: false,
    created_at: new Date(Date.now() - 3600000).toISOString(),
    action_url: '/buyer/dashboard',
    priority: 'normal',
  },
  {
    id: '2',
    type: 'message',
    title: 'New message from John Kamau',
    content: 'Hi, I want to inquire about your maize prices...',
    is_read: false,
    created_at: new Date(Date.now() - 7200000).toISOString(),
    action_url: '/chat',
    priority: 'normal',
  },
  {
    id: '3',
    type: 'alert',
    title: 'Fall armyworm warning',
    content: 'Outbreak reported in Nakuru. Check your maize fields immediately.',
    is_read: false,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    action_url: '/advisor',
    priority: 'urgent',
  },
  {
    id: '4',
    type: 'price',
    title: 'Maize prices increased',
    content: 'Maize prices in Eldoret rose 5% today. Good time to sell.',
    is_read: true,
    created_at: new Date(Date.now() - 172800000).toISOString(),
    action_url: '/marketplace',
  },
  {
    id: '5',
    type: 'review',
    title: 'New 5-star review',
    content: 'Peter Ochieng: "Excellent quality tomatoes, very fresh!"',
    is_read: true,
    created_at: new Date(Date.now() - 259200000).toISOString(),
    action_url: '/profile',
  },
  {
    id: '6',
    type: 'weather',
    title: 'Heavy rain expected',
    content: 'Heavy rainfall predicted for tomorrow in your area. Protect sensitive crops.',
    is_read: true,
    created_at: new Date(Date.now() - 345600000).toISOString(),
    action_url: '/weather',
  },
  {
    id: '7',
    type: 'system',
    title: 'Profile verification approved',
    content: 'Congratulations! Your profile has been verified.',
    is_read: true,
    created_at: new Date(Date.now() - 432000000).toISOString(),
  },
];

const getNotificationIcon = (type: Notification['type']) => {
  const icons = {
    order: ShoppingCart,
    message: MessageCircle,
    review: Star,
    alert: AlertTriangle,
    system: Shield,
    price: TrendingUp,
    weather: Calendar,
    promotion: Coins,
  };
  return icons[type] || Bell;
};

const getNotificationColor = (type: Notification['type']) => {
  const colors = {
    order: 'bg-blue-100 text-blue-600',
    message: 'bg-green-100 text-green-600',
    review: 'bg-yellow-100 text-yellow-600',
    alert: 'bg-red-100 text-red-600',
    system: 'bg-purple-100 text-purple-600',
    price: 'bg-emerald-100 text-emerald-600',
    weather: 'bg-cyan-100 text-cyan-600',
    promotion: 'bg-pink-100 text-pink-600',
  };
  return colors[type] || 'bg-gray-100 text-gray-600';
};

const getPriorityBorder = (priority?: Notification['priority']) => {
  const borders = {
    low: '',
    normal: '',
    high: 'border-l-4 border-l-orange-400',
    urgent: 'border-l-4 border-l-red-500',
  };
  return borders[priority || 'normal'] || '';
};

export default function Notifications() {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selected, setSelected] = useState<string[]>([]);

  const notifications = sampleNotifications;
  const filteredNotifications = notifications
    .filter(n => filter === 'all' || (filter === 'unread' && !n.is_read))
    .filter(n => typeFilter === 'all' || n.type === typeFilter);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const markAsRead = (id: string) => {
    toast.success('Marked as read');
  };

  const markAllAsRead = () => {
    toast.success('All notifications marked as read');
  };

  const deleteNotification = (id: string) => {
    toast.success('Notification deleted');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Bell className="h-6 w-6 text-primary-600" />
            Notifications
            {unreadCount > 0 && (
              <span className="ml-2 px-2 py-1 bg-primary-600 text-white text-sm rounded-full">
                {unreadCount} new
              </span>
            )}
          </h1>
          <p className="text-gray-600 mt-1">Stay updated with your farm activities</p>
        </div>
        <div className="flex gap-3">
          {unreadCount > 0 && (
            <button onClick={markAllAsRead} className="btn btn-secondary text-sm">
              <Check className="h-4 w-4" />
              Mark all read
            </button>
          )}
          <Link to="/settings" className="btn btn-secondary text-sm">
            <Settings className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="flex gap-4 mb-6 overflow-x-auto pb-2">
        <button
          onClick={() => { setFilter('all'); setTypeFilter('all'); }}
          className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
            filter === 'all' && typeFilter === 'all'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
            filter === 'unread'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Unread ({unreadCount})
        </button>
        {['order', 'message', 'alert', 'price'].map(type => (
          <button
            key={type}
            onClick={() => { setTypeFilter(type); setFilter('all'); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize whitespace-nowrap ${
              typeFilter === type
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-600">No notifications to display</p>
          </div>
        ) : (
          filteredNotifications.map(notification => {
            const Icon = getNotificationIcon(notification.type);
            const colorClass = getNotificationColor(notification.type);
            const borderClass = getPriorityBorder(notification.priority);
            const isSelected = selected.includes(notification.id);

            return (
              <div
                key={notification.id}
                className={`card p-4 flex items-start gap-4 transition-all ${
                  !notification.is_read ? 'bg-primary-50/50' : ''
                } ${borderClass}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className={`font-medium ${!notification.is_read ? 'text-gray-900' : 'text-gray-700'}`}>
                        {notification.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">{notification.content}</p>
                    </div>
                    {!notification.is_read && (
                      <span className="w-2 h-2 bg-primary-600 rounded-full flex-shrink-0 mt-2" />
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-xs text-gray-500">
                      {formatTime(notification.created_at)} • {formatDate(notification.created_at)}
                    </span>
                    {notification.action_url && (
                      <Link
                        to={notification.action_url}
                        className="text-xs text-primary-600 hover:underline font-medium"
                      >
                        View details
                      </Link>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {!notification.is_read && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                      title="Mark as read"
                    >
                      <Check className="h-4 w-4 text-gray-400" />
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(notification.id)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4 text-gray-400" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
