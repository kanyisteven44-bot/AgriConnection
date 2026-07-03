import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../lib/store';
import { formatCurrency, formatDate } from '../../lib/utils';
import { Package, ShoppingCart, TrendingUp, DollarSign, Plus, Eye, Clock, Star, CircleAlert as AlertCircle, Leaf, Truck, Calendar, ArrowRight, Loader as Loader2, ChartBar as BarChart3, Users, MapPin } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  price: number;
  unit: string;
  quantity: number;
  status: string;
  views: number;
  created_at: string;
}

interface Order {
  id: string;
  buyer_name: string;
  product_name: string;
  quantity: number;
  total: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered';
  created_at: string;
}

const sampleProducts: Product[] = [
  { id: 1, name: 'Fresh Tomatoes', price: 80, unit: 'kg', quantity: 200, status: 'available', views: 45, created_at: new Date().toISOString() },
  { id: 2, name: 'Organic Kale', price: 50, unit: 'kg', quantity: 100, status: 'available', views: 32, created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: 3, name: 'Maize', price: 45, unit: 'kg', quantity: 500, status: 'available', views: 78, created_at: new Date(Date.now() - 172800000).toISOString() },
];

const sampleOrders: Order[] = [
  { id: 'ORD001', buyer_name: 'Mary Wanjiku', product_name: 'Fresh Tomatoes', quantity: 50, total: 4000, status: 'pending', created_at: new Date().toISOString() },
  { id: 'ORD002', buyer_name: 'John Kamau', product_name: 'Organic Kale', quantity: 30, total: 1500, status: 'confirmed', created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: 'ORD003', buyer_name: 'Peter Ochieng', product_name: 'Maize', quantity: 100, total: 4500, status: 'shipped', created_at: new Date(Date.now() - 172800000).toISOString() },
];

export default function FarmerDashboard() {
  const { user } = useAuthStore();
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'year'>('month');

  const stats = [
    {
      label: 'Total Earnings',
      value: formatCurrency(45600),
      change: '+12%',
      icon: DollarSign,
      color: 'bg-green-100 text-green-600',
    },
    {
      label: 'Orders',
      value: '24',
      change: '+8%',
      icon: ShoppingCart,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      label: 'Products',
      value: '8',
      change: '0',
      icon: Package,
      color: 'bg-purple-100 text-purple-600',
    },
    {
      label: 'Avg Rating',
      value: '4.8',
      change: '+0.2',
      icon: Star,
      color: 'bg-yellow-100 text-yellow-600',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Farmer Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back, {user?.name}!</p>
        </div>
        <Link to="/marketplace" className="btn btn-primary">
          <Plus className="h-5 w-5" />
          Add Product
        </Link>
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
                <div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1 text-sm">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-green-600 font-medium">{stat.change}</span>
                <span className="text-gray-500">vs last month</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Recent Orders</h2>
              <Link to="/orders" className="text-sm text-primary-600 hover:underline flex items-center gap-1">
                View all <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="space-y-4">
              {sampleOrders.map(order => (
                <div key={order.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Package className="h-6 w-6 text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{order.buyer_name}</div>
                    <div className="text-sm text-gray-600">
                      {order.product_name} x {order.quantity}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-900">{formatCurrency(order.total)}</div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      order.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                      order.status === 'shipped' ? 'bg-purple-100 text-purple-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Your Products</h2>
              <Link to="/marketplace" className="text-sm text-primary-600 hover:underline flex items-center gap-1">
                Manage <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="space-y-3">
              {sampleProducts.map(product => (
                <div key={product.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Leaf className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{product.name}</div>
                    <div className="text-sm text-gray-600">
                      {formatCurrency(product.price)}/{product.unit} • {product.quantity} {product.unit} available
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Eye className="h-4 w-4" />
                    {product.views}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link to="/marketplace" className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100">
                <Plus className="h-5 w-5 text-primary-600" />
                <span className="font-medium text-gray-900">Add New Product</span>
              </Link>
              <Link to="/orders" className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100">
                <ShoppingCart className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-gray-900">View Orders</span>
              </Link>
              <Link to="/drivers" className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100">
                <Truck className="h-5 w-5 text-orange-600" />
                <span className="font-medium text-gray-900">Find Transport</span>
              </Link>
              <Link to="/advisor" className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100">
                <Leaf className="h-5 w-5 text-green-600" />
                <span className="font-medium text-gray-900">AI Farm Advisor</span>
              </Link>
            </div>
          </div>

          <div className="card p-6 bg-gradient-to-br from-primary-600 to-primary-800 text-white">
            <h3 className="font-bold mb-2">Need Expert Advice?</h3>
            <p className="text-sm text-primary-100 mb-4">
              Book a consultation with agricultural experts for personalized guidance.
            </p>
            <Link to="/experts" className="btn bg-white text-primary-700 hover:bg-primary-50">
              Find Experts
            </Link>
          </div>

          <div className="card p-6">
            <h3 className="font-bold text-gray-900 mb-3">Weather Alert</h3>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-700">Heavy rain expected this weekend.</p>
                <p className="text-xs text-gray-500">Consider harvesting ripe crops.</p>
              </div>
            </div>
            <Link to="/weather" className="btn btn-secondary w-full mt-4">
              View Full Forecast
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
