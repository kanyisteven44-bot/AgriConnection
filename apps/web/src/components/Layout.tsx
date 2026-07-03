import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuthStore } from '../lib/store';
import { supabase } from '../lib/supabase';
import { Sprout, Menu, X, User, Bell, MessageCircle, LogOut, Settings, MapPin, ShoppingCart, Truck, Award, Hop as Home, Cloud, Bot, BookOpen, Users, ChevronDown, CircleAlert as AlertCircle } from 'lucide-react';

export default function Layout() {
  const { user, isAuthenticated, setUser } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const navLinks = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/marketplace', label: 'Market', icon: ShoppingCart },
    { to: '/map', label: 'Map', icon: MapPin },
    { to: '/drivers', label: 'Transport', icon: Truck },
    { to: '/experts', label: 'Experts', icon: Award },
    { to: '/weather', label: 'Weather', icon: Cloud },
    { to: '/advisor', label: 'AI Advisor', icon: Bot },
    { to: '/learning', label: 'Learn', icon: BookOpen },
    { to: '/community', label: 'Community', icon: Users },
  ];

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchUnreadNotifications();
    }
  }, [isAuthenticated, user]);

  const fetchUnreadNotifications = async () => {
    try {
      const { count } = await supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user?.id)
        .eq('is_read', false);
      setUnreadNotifications(count || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'farmer': return '/farmer/dashboard';
      case 'buyer': return '/buyer/dashboard';
      case 'admin': return '/admin/dashboard';
      default: return '/';
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuOpen) setUserMenuOpen(false);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [userMenuOpen]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-primary-900 text-white sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 flex-shrink-0">
              <Sprout className="h-8 w-8 text-accent-400" />
              <div className="hidden sm:block">
                <span className="text-lg font-bold">Agri</span>
                <span className="text-lg font-bold text-accent-400">Connection</span>
              </div>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-1 overflow-x-auto">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.to;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                      isActive
                        ? 'bg-primary-700 text-white'
                        : 'text-primary-100 hover:bg-primary-800'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {isAuthenticated && user ? (
                <>
                  <Link to="/notifications" className="relative p-2 hover:bg-primary-800 rounded-lg transition-colors">
                    <Bell className="h-5 w-5" />
                    {unreadNotifications > 0 && (
                      <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full text-xs flex items-center justify-center font-medium">
                        {unreadNotifications > 9 ? '9+' : unreadNotifications}
                      </span>
                    )}
                  </Link>
                  <Link to="/chat" className="p-2 hover:bg-primary-800 rounded-lg transition-colors">
                    <MessageCircle className="h-5 w-5" />
                  </Link>
                  <div className="relative">
                    <button
                      onClick={(e) => { e.stopPropagation(); setUserMenuOpen(!userMenuOpen); }}
                      className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-primary-800 transition-colors"
                    >
                      <div className="w-8 h-8 bg-primary-700 rounded-full flex items-center justify-center text-sm font-bold">
                        {user.name?.charAt(0) || <User className="h-4 w-4" />}
                      </div>
                      <span className="text-sm font-medium hidden md:inline max-w-[120px] truncate">
                        {user.name}
                      </span>
                      <ChevronDown className="h-4 w-4 hidden md:inline" />
                    </button>
                    {userMenuOpen && (
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl py-2 text-gray-800 z-50">
                        <div className="px-4 py-2 border-b">
                          <div className="font-semibold">{user.name}</div>
                          <div className="text-sm text-gray-500 truncate">{user.email}</div>
                        </div>
                        <Link to={getDashboardLink()} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50" onClick={() => setUserMenuOpen(false)}>
                          <Home className="h-4 w-4" /> Dashboard
                        </Link>
                        <Link to="/profile" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50" onClick={() => setUserMenuOpen(false)}>
                          <User className="h-4 w-4" /> Profile
                        </Link>
                        <Link to="/settings" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50" onClick={() => setUserMenuOpen(false)}>
                          <Settings className="h-4 w-4" /> Settings
                        </Link>
                        <hr className="my-2" />
                        <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                          <LogOut className="h-4 w-4" /> Logout
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/login" className="px-4 py-2 text-sm font-medium text-white hover:text-primary-200 transition-colors">
                    Sign In
                  </Link>
                  <Link to="/register" className="px-4 py-2 text-sm font-medium bg-accent-500 text-gray-900 rounded-lg hover:bg-accent-400 transition-colors">
                    Get Started
                  </Link>
                </div>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 hover:bg-primary-800 rounded-lg"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <nav className="lg:hidden bg-primary-800 px-4 py-4 space-y-1 max-h-[70vh] overflow-y-auto">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-primary-100 hover:bg-primary-700 transition-colors"
                >
                  <Icon className="h-5 w-5" />
                  {link.label}
                </Link>
              );
            })}
            <div className="border-t border-primary-700 mt-4 pt-4">
              <Link to="/chat" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-lg text-primary-100 hover:bg-primary-700">
                <MessageCircle className="h-5 w-5" /> Chat
              </Link>
            </div>
          </nav>
        )}
      </header>

      {/* Main Content */}
      <main className="min-h-[calc(100vh-64px)]">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2 md:col-span-1">
              <Link to="/" className="flex items-center gap-2 mb-4">
                <Sprout className="h-8 w-8 text-primary-400" />
                <span className="text-xl font-bold">AgriConnection</span>
              </Link>
              <p className="text-gray-400 text-sm">
                Kenya's #1 Smart Agriculture Platform connecting farmers, buyers, drivers, and experts.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link to="/marketplace" className="hover:text-white transition-colors">Marketplace</Link></li>
                <li><Link to="/map" className="hover:text-white transition-colors">Farmers Map</Link></li>
                <li><Link to="/drivers" className="hover:text-white transition-colors">Transport</Link></li>
                <li><Link to="/experts" className="hover:text-white transition-colors">Experts</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Community</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link to="/community" className="hover:text-white transition-colors">Forum</Link></li>
                <li><Link to="/chat" className="hover:text-white transition-colors">Chat</Link></li>
                <li><Link to="/learning" className="hover:text-white transition-colors">Learning Hub</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>Help Center</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
                <li className="text-accent-400 font-medium">Emergency: 0800 AGRIC</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} AgriConnection. Made with care for Kenyan farmers.
          </div>
        </div>
      </footer>
    </div>
  );
}
