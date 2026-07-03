import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../lib/store';
import { formatCurrency, formatDate } from '../../lib/utils';
import { ShoppingCart, Package, Heart, MapPin, Search, Star, TrendingUp, ArrowRight, Clock, Truck, CircleCheck as CheckCircle, Loader as Loader2, DollarSign, Eye, Leaf, Plus } from 'lucide-react';

interface Order {
  id: string;
  farmer_name: string;
  product_name: string;
  quantity: number;
  total: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered';
  created_at: string;
  image_url?: string;
}

interface WishlistItem {
  id: number;
  product_name: string;
  farmer_name: string;
  price: number;
  unit: string;
  in_stock: boolean;
}

const sampleOrders: Order[] = [
  { id: 'ORD001', farmer_name: 'John Kamau', product_name: 'Fresh Tomatoes', quantity: 50, total: 4000, status: 'shipped', created_at: new Date().toISOString() },
  { id: 'ORD002', farmer_name: 'Mary Wanjiku', product_name: 'Organic Kale', quantity: 30, total: 1500, status: 'confirmed', created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: 'ORD003', farmer_name: 'Peter Ochieng', product_name: 'Maize', quantity: 100, total: 4500, status: 'delivered', created_at: new Date(Date.now() - 172800000).toISOString() },
  { id: 'ORD004', farmer_name: 'Sarah Njeri', product_name: 'Irish Potatoes', quantity: 80, total: 6400, status: 'pending', created_at: new Date(Date.now() - 259200000).toISOString() },
];

const sampleWishlist: WishlistItem[] = [
  { id: 1, product_name: 'Fresh Tomatoes', farmer_name: 'John Kamau', price: 80, unit: 'kg', in_stock: true },
  { id: 2, product_name: 'Avocados', farmer_name: 'James Kiprop', price: 150, unit: 'kg', in_stock: true },
  { id: 3, product_name: 'Passion Fruit', farmer_name: 'Grace Muthoni', price: 200, unit: 'kg', in_stock: false },
];

export default function BuyerDashboard() {
  const { user } = useAuthStore();

  const stats = [
    {
      label: 'Total Spent',
      value: formatCurrency(127500),
      icon: DollarSign,
      color: 'bg-green-100 text-green-600',
    },
    {
      label: 'Orders',
      value: '18',
      icon: ShoppingCart,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      label: 'Farmers',
      value: '7',
      icon: Leaf,
      color: 'bg-primary-100 text-primary-600',
    },
    {
      label: 'Wishlist',
      value: '5',
      icon: Heart,
      color: 'bg-red-100 text-red-600',
    },
  ];

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending': return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'confirmed': return <CheckCircle className="h-5 w-5 text-blue-500" />;
      case 'shipped': return <Truck className="h-5 w-5 text-purple-500" />;
      case 'delivered': return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
  };

  const getStatusColor = (status: Order['status']) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-700',
      confirmed: 'bg-blue-100 text-blue-700',
      shipped: 'bg-purple-100 text-purple-700',
      delivered: 'bg-green-100 text-green-700',
    };
    return colors[status];
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Buyer Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back, {user?.name}!</p>
        </div>
        <Link to="/marketplace" className="btn btn-primary">
          <Search className="h-5 w-5" />
          Browse Products
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
                  <div className="w-16 h-16 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Package className="h-8 w-8 text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{order.product_name}</div>
                    <div className="text-sm text-gray-600">
                      from {order.farmer_name} • Qty: {order.quantity}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{formatDate(order.created_at)}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-900">{formatCurrency(order.total)}</div>
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                  {getStatusIcon(order.status)}
                </div>
              ))}
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Spending Overview</h2>
              <select className="text-sm border rounded-lg px-3 py-1">
                <option>Last 30 days</option>
                <option>Last 3 months</option>
                <option>Last year</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="text-sm text-gray-600">This Month</div>
                <div className="text-2xl font-bold text-gray-900">{formatCurrency(32500)}</div>
                <div className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3" /> 12% from last month
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="text-sm text-gray-600">Avg per Order</div>
                <div className="text-2xl font-bold text-gray-900">{formatCurrency(7083)}</div>
                <div className="text-xs text-gray-500">18 orders this month</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-700">Top Categories</div>
              {[
                { category: 'Vegetables', amount: 45000, color: 'bg-green-500', pct: 35 },
                { category: 'Grains', amount: 32000, color: 'bg-yellow-500', pct: 25 },
                { category: 'Fruits', amount: 28000, color: 'bg-orange-500', pct: 22 },
                { category: 'Dairy', amount: 22000, color: 'bg-blue-500', pct: 17 },
              ].map(item => (
                <div key={item.category} className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 w-24">{item.category}</span>
                  <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div className={`h-full ${item.color}`} style={{ width: `${item.pct}%` }} />
                  </div>
                  <span className="text-sm font-medium text-gray-900">{formatCurrency(item.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Wishlist</h2>
              <Link to="/wishlist" className="text-sm text-primary-600 hover:underline">View all</Link>
            </div>

            <div className="space-y-3">
              {sampleWishlist.slice(0, 3).map(item => (
                <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Leaf className="h-6 w-6 text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{item.product_name}</div>
                    <div className="text-sm text-gray-600">
                      {formatCurrency(item.price)}/{item.unit}
                    </div>
                  </div>
                  <div className="text-right">
                    {item.in_stock ? (
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                        In Stock
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-1 bg-gray-200 text-gray-600 rounded">
                        Out of Stock
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link to="/marketplace" className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100">
                <Search className="h-5 w-5 text-primary-600" />
                <span className="font-medium text-gray-900">Browse Products</span>
              </Link>
              <Link to="/map" className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100">
                <MapPin className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-gray-900">Find Farmers Nearby</span>
              </Link>
              <Link to="/cart" className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100">
                <ShoppingCart className="h-5 w-5 text-orange-600" />
                <span className="font-medium text-gray-900">View Cart</span>
              </Link>
            </div>
          </div>

          <div className="card p-6 bg-gradient-to-br from-primary-600 to-primary-800 text-white">
            <h3 className="font-bold mb-2">Transport Your Order</h3>
            <p className="text-sm text-primary-100 mb-4">
              Need delivery? Find verified drivers to transport your produce.
            </p>
            <Link to="/drivers" className="btn bg-white text-primary-700 hover:bg-primary-50">
              Find Drivers
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
