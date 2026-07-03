import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../lib/store';
import { formatCurrency, formatDate } from '../../lib/utils';
import { Users, ShoppingCart, DollarSign, TriangleAlert as AlertTriangle, TrendingUp, TrendingDown, Package, FileText, MessageCircle, Settings, Shield, Bell, ChevronRight, Clock, CircleCheck as CheckCircle, Circle as XCircle, Eye, MapPin, Leaf } from 'lucide-react';

interface Stat {
  label: string;
  value: string | number;
  change?: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  onClick?: () => void;
}

interface Report {
  id: string;
  type: 'user' | 'listing' | 'transaction' | 'fraud';
  subject: string;
  reporter: string;
  created_at: string;
  status: 'pending' | 'reviewing' | 'resolved';
  priority: 'low' | 'medium' | 'high';
}

const sampleReports: Report[] = [
  { id: 'R001', type: 'user', subject: 'Suspicious account activity', reporter: 'Mary Wanjiku', created_at: new Date().toISOString(), status: 'pending', priority: 'high' },
  { id: 'R002', type: 'listing', subject: 'Misleading product description', reporter: 'John Kamau', created_at: new Date(Date.now() - 3600000).toISOString(), status: 'reviewing', priority: 'medium' },
  { id: 'R003', type: 'fraud', subject: 'Suspected price manipulation', reporter: 'System', created_at: new Date(Date.now() - 86400000).toISOString(), status: 'pending', priority: 'high' },
];

interface Activity {
  id: string;
  action: string;
  user: string;
  type: 'registration' | 'listing' | 'transaction' | 'report';
  time: string;
}

const recentActivity: Activity[] = [
  { id: 'a1', action: 'New farmer registration', user: 'Grace Muthoni', type: 'registration', time: '5 min ago' },
  { id: 'a2', action: 'Product listed', user: 'James Kiprop', type: 'listing', time: '15 min ago' },
  { id: 'a3', action: 'Transaction completed', user: 'Mary Wanjiku', type: 'transaction', time: '32 min ago' },
  { id: 'a4', action: 'Report submitted', user: 'Peter Ochieng', type: 'report', time: '1 hour ago' },
];

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('today');

  const stats: Stat[] = [
    {
      label: 'Total Users',
      value: '15,234',
      change: 8.5,
      icon: Users,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      label: 'Active Listings',
      value: '5,847',
      change: 12.3,
      icon: Package,
      color: 'bg-green-100 text-green-600',
    },
    {
      label: 'Transactions',
      value: 'KSh 52.3M',
      change: 15.2,
      icon: DollarSign,
      color: 'bg-primary-100 text-primary-600',
    },
    {
      label: 'Open Reports',
      value: 23,
      change: -5,
      icon: AlertTriangle,
      color: 'bg-orange-100 text-orange-600',
    },
  ];

  const getReportColor = (status: Report['status']) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-700',
      reviewing: 'bg-blue-100 text-blue-700',
      resolved: 'bg-green-100 text-green-700',
    };
    return colors[status];
  };

  const getPriorityColor = (priority: Report['priority']) => {
    const colors = {
      low: 'border-gray-400',
      medium: 'border-orange-400',
      high: 'border-red-500',
    };
    return colors[priority];
  };

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'registration': return <Users className="h-4 w-4 text-blue-500" />;
      case 'listing': return <Package className="h-4 w-4 text-green-500" />;
      case 'transaction': return <DollarSign className="h-4 w-4 text-primary-500" />;
      case 'report': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Platform overview and management</p>
        </div>
        <div className="flex gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="input"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
          <Link to="/settings" className="btn btn-secondary">
            <Settings className="h-5 w-5" />
          </Link>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="card p-6">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <div className="text-sm text-gray-600">{stat.label}</div>
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                </div>
              </div>
              {stat.change !== undefined && (
                <div className="mt-4 flex items-center gap-1 text-sm">
                  {stat.change >= 0 ? (
                    <>
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="text-green-600 font-medium">+{stat.change}%</span>
                    </>
                  ) : (
                    <>
                      <TrendingDown className="h-4 w-4 text-red-500" />
                      <span className="text-red-600 font-medium">{stat.change}%</span>
                    </>
                  )}
                  <span className="text-gray-500">vs last period</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Pending Reports
              </h2>
              <Link to="/admin/reports" className="text-sm text-primary-600 hover:underline flex items-center gap-1">
                View all <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="space-y-4">
              {sampleReports.map(report => (
                <div
                  key={report.id}
                  className={`p-4 border-l-4 rounded-lg bg-gray-50 ${getPriorityColor(report.priority)}`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{report.subject}</div>
                      <div className="text-sm text-gray-600 mt-1">
                        Reported by {report.reporter} • {report.type}
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        {formatDate(report.created_at)}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs px-2 py-1 rounded-full ${getReportColor(report.status)}`}>
                        {report.status}
                      </span>
                      <div className="flex gap-2 mt-3">
                        <button className="text-xs text-primary-600 hover:underline">Review</button>
                        <button className="text-xs text-green-600 hover:underline">Resolve</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Platform Metrics</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="text-sm text-gray-600">User Growth</div>
                <div className="text-xl font-bold text-gray-900">+324 today</div>
                <div className="text-xs text-gray-500">82% farmers, 18% buyers</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="text-sm text-gray-600">Transaction Volume</div>
                <div className="text-xl font-bold text-gray-900">{formatCurrency(12500000)}</div>
                <div className="text-xs text-gray-500">856 transactions today</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="text-sm text-gray-600">Verification Queue</div>
                <div className="text-xl font-bold text-gray-900">47 pending</div>
                <div className="text-xs text-gray-500">12 high priority</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="text-sm text-gray-600">Support Tickets</div>
                <div className="text-xl font-bold text-gray-900">89 open</div>
                <div className="text-xs text-gray-500">23 unresolved for 48h+</div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary-600" />
              Recent Activity
            </h2>
            <div className="space-y-3">
              {recentActivity.map(activity => (
                <div key={activity.id} className="flex items-center gap-3 p-2">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{activity.action}</div>
                    <div className="text-xs text-gray-600">{activity.user}</div>
                  </div>
                  <span className="text-xs text-gray-400">{activity.time}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link to="/admin/users" className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100">
                <Users className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-gray-900">Manage Users</span>
              </Link>
              <Link to="/admin/verifications" className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100">
                <Shield className="h-5 w-5 text-green-600" />
                <span className="font-medium text-gray-900">Review Verifications</span>
              </Link>
              <Link to="/admin/listings" className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100">
                <Package className="h-5 w-5 text-primary-600" />
                <span className="font-medium text-gray-900">Moderate Listings</span>
              </Link>
              <Link to="/admin/logs" className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100">
                <FileText className="h-5 w-5 text-gray-600" />
                <span className="font-medium text-gray-900">Audit Logs</span>
              </Link>
            </div>
          </div>

          <div className="card p-6 bg-gradient-to-br from-orange-500 to-red-600 text-white">
            <div className="flex items-center gap-3 mb-3">
              <Shield className="h-6 w-6" />
              <h3 className="font-bold">Fraud Detection</h3>
            </div>
            <p className="text-sm opacity-90 mb-4">
              3 accounts flagged for suspicious activity. Review now to prevent potential fraud.
            </p>
            <button className="btn bg-white text-red-600 hover:bg-orange-50 w-full">
              Review Flagged Accounts
            </button>
          </div>

          <div className="card p-6">
            <h3 className="font-semibold text-gray-900 mb-3">System Status</h3>
            <div className="space-y-2">
              {[
                { name: 'API Server', status: true },
                { name: 'Database', status: true },
                { name: 'Chat Service', status: true },
                { name: 'Payment Gateway', status: false },
              ].map(service => (
                <div key={service.name} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{service.name}</span>
                  <span className={`flex items-center gap-1 text-xs ${service.status ? 'text-green-600' : 'text-yellow-600'}`}>
                    {service.status ? (
                      <>
                        <CheckCircle className="h-3 w-3" /> Online
                      </>
                    ) : (
                      <>
                        <Clock className="h-3 w-3" /> Degraded
                      </>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
