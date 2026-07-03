import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { formatCurrency } from '../lib/utils';
import { Search, ListFilter as Filter, MapPin, Star, ShoppingCart, Heart, Grid2x2 as Grid, List, Clock, ChevronDown, X, Leaf, Package, Loader as Loader2, CircleAlert as AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  unit: string;
  quantity: number;
  category: string;
  images: string[];
  location: string;
  farmer_id: number;
  farmer_name: string;
  created_at: string;
  verified: boolean;
}

const categories = [
  'All', 'Vegetables', 'Fruits', 'Grains', 'Dairy', 'Meat', 'Poultry',
  'Fish', 'Herbs', 'Spices', 'Nuts', 'Honey', 'Other'
];

const sortOptions = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'quantity', label: 'Quantity Available' },
];

export default function Marketplace() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [cart, setCart] = useState<{ productId: number; quantity: number }[]>([]);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);

  const { data: products, isLoading, error } = useQuery({
    queryKey: ['products', category, sortBy],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select('*, farmer:auth_users!farmer_id(name)')
        .eq('status', 'available');

      if (category !== 'All') {
        query = query.eq('category', category);
      }

      switch (sortBy) {
        case 'price-low':
          query = query.order('price', { ascending: true });
          break;
        case 'price-high':
          query = query.order('price', { ascending: false });
          break;
        case 'quantity':
          query = query.order('quantity', { ascending: false });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;
      if (error) throw error;
      return data?.map(p => ({
        ...p,
        farmer_name: p.farmer?.name || 'Unknown Farmer',
      })) as Product[];
    },
  });

  const filteredProducts = products?.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase()) ||
      p.location?.toLowerCase().includes(search.toLowerCase());
    const matchesPrice = p.price >= priceRange[0] && p.price <= priceRange[1];
    return matchesSearch && matchesPrice;
  });

  const addToCart = (productId: number) => {
    const existing = cart.find(c => c.productId === productId);
    if (existing) {
      setCart(cart.map(c => c.productId === productId ? { ...c, quantity: c.quantity + 1 } : c));
    } else {
      setCart([...cart, { productId, quantity: 1 }]);
    }
    toast.success('Added to cart');
  };

  const toggleWishlist = (productId: number) => {
    setWishlist(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Failed to load products</h2>
          <p className="text-gray-600">Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Farm Fresh Marketplace</h1>
          <p className="text-gray-600 mt-1">Buy directly from Kenyan farmers</p>
        </div>
        <Link
          to="/cart"
          className="btn btn-primary relative"
        >
          <ShoppingCart className="h-5 w-5" />
          Cart
          {totalCartItems > 0 && (
            <span className="absolute -top-2 -right-2 h-5 w-5 bg-red-500 rounded-full text-xs flex items-center justify-center text-white font-bold">
              {totalCartItems}
            </span>
          )}
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <aside className={`lg:w-64 flex-shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
          <div className="card p-4 space-y-6 sticky top-20">
            <div className="flex items-center justify-between lg:hidden">
              <h3 className="font-semibold text-gray-900">Filters</h3>
              <button onClick={() => setShowFilters(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Categories</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      category === cat
                        ? 'bg-primary-100 text-primary-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Price Range (KSh)</h4>
              <div className="space-y-3">
                <input
                  type="range"
                  min="0"
                  max="100000"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                  className="w-full accent-primary-600"
                />
                <div className="flex justify-between text-sm text-gray-600">
                  <span>0</span>
                  <span>{formatCurrency(priceRange[1])}</span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <div className="flex-1">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products, farmers, locations..."
                className="input pl-12"
              />
            </div>

            <div className="flex gap-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="input"
              >
                {sortOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="btn btn-secondary lg:hidden"
              >
                <Filter className="h-5 w-5" />
              </button>

              <div className="hidden sm:flex border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'text-gray-400'}`}
                >
                  <Grid className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-primary-100 text-primary-600' : 'text-gray-400'}`}
                >
                  <List className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            </div>
          ) : filteredProducts?.length === 0 ? (
            <div className="text-center py-16 card">
              <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-600">Try adjusting your filters or search terms.</p>
            </div>
          ) : (
            <div className={viewMode === 'grid' ? 'grid sm:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
              {filteredProducts?.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  viewMode={viewMode}
                  onAddToCart={() => addToCart(product.id)}
                  onToggleWishlist={() => toggleWishlist(product.id)}
                  isWishlisted={wishlist.includes(product.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ProductCard({
  product,
  viewMode,
  onAddToCart,
  onToggleWishlist,
  isWishlisted,
}: {
  product: Product;
  viewMode: 'grid' | 'list';
  onAddToCart: () => void;
  onToggleWishlist: () => void;
  isWishlisted: boolean;
}) {
  if (viewMode === 'list') {
    return (
      <div className="card p-4 flex gap-4">
        <img
          src={product.images?.[0] || 'https://images.pexels.com/photos/1300970/pexels-photo-1300970.jpeg?w=200&auto=format'}
          alt={product.name}
          className="w-32 h-32 object-cover rounded-lg flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-semibold text-gray-900">{product.name}</h3>
              <p className="text-sm text-gray-500 truncate">{product.description}</p>
            </div>
            <button onClick={onToggleWishlist} className="flex-shrink-0">
              <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
            </button>
          </div>
          <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4" />
            {product.location}
            <span className="mx-2">•</span>
            <span className="capitalize">{product.category}</span>
            {product.verified && (
              <>
                <span className="mx-2">•</span>
                <span className="text-green-600 flex items-center gap-1">
                  <Leaf className="h-4 w-4" /> Verified
                </span>
              </>
            )}
          </div>
          <div className="flex items-center justify-between mt-4">
            <div>
              <span className="text-xl font-bold text-primary-600">{formatCurrency(product.price)}</span>
              <span className="text-gray-600 text-sm ml-1">/ {product.unit}</span>
            </div>
            <button onClick={onAddToCart} className="btn btn-primary">
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card group overflow-hidden">
      <div className="relative">
        <img
          src={product.images?.[0] || 'https://images.pexels.com/photos/1300970/pexels-photo-1300970.jpeg?w=400&auto=format'}
          alt={product.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <button
          onClick={onToggleWishlist}
          className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform"
        >
          <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
        </button>
        {product.verified && (
          <div className="absolute top-3 left-3 bg-green-500 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
            <Leaf className="h-3 w-3" /> Verified
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="text-xs text-gray-500 capitalize">{product.category}</div>
        <h3 className="font-semibold text-gray-900 mt-1 truncate">{product.name}</h3>
        <p className="text-sm text-gray-600 mt-1 truncate">{product.description}</p>
        <div className="flex items-center gap-1 text-xs text-gray-500 mt-2">
          <MapPin className="h-3 w-3" />
          {product.location}
        </div>
        <div className="flex items-center justify-between mt-4">
          <div>
            <span className="text-lg font-bold text-primary-600">{formatCurrency(product.price)}</span>
            <span className="text-gray-600 text-sm ml-1">/ {product.unit}</span>
          </div>
          <button onClick={onAddToCart} className="btn btn-primary text-sm py-2">
            <ShoppingCart className="h-4 w-4" />
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
