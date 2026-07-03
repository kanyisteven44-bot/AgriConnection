import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { Suspense, lazy, useEffect } from 'react';
import { useAuthStore } from './lib/store';
import { supabase } from './lib/supabase';
import LoadingSpinner from './components/LoadingSpinner';

// Lazy load pages for code splitting
const Layout = lazy(() => import('./components/Layout'));
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const VerifyOTP = lazy(() => import('./pages/VerifyOTP'));
const Marketplace = lazy(() => import('./pages/Marketplace'));
const Weather = lazy(() => import('./pages/Weather'));
const AIAdvisor = lazy(() => import('./pages/AIAdvisor'));
const LearningHub = lazy(() => import('./pages/LearningHub'));
const Community = lazy(() => import('./pages/Community'));
const ChatPage = lazy(() => import('./pages/ChatPage'));
const Profile = lazy(() => import('./pages/Profile'));
const Notifications = lazy(() => import('./pages/Notifications'));
const Settings = lazy(() => import('./pages/Settings'));
const FarmersMap = lazy(() => import('./pages/FarmersMap'));
const DriversPage = lazy(() => import('./pages/DriversPage'));
const ExpertsPage = lazy(() => import('./pages/ExpertsPage'));
const FarmerDashboard = lazy(() => import('./pages/farmer/Dashboard'));
const BuyerDashboard = lazy(() => import('./pages/buyer/Dashboard'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 2,
    },
  },
});

function App() {
  const { setUser, setLoading } = useAuthStore();

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user && mounted) {
          const { data: userData } = await supabase
            .from('auth_users')
            .select('*')
            .eq('email', session.user.email)
            .maybeSingle();

          if (userData && mounted) setUser(userData);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user && mounted) {
          const { data: userData } = await supabase
            .from('auth_users')
            .select('*')
            .eq('email', session.user.email)
            .maybeSingle();
          if (userData && mounted) setUser(userData);
        } else if (mounted) {
          setUser(null);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [setUser, setLoading]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Suspense fallback={<LoadingSpinner fullScreen />}>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="forgot-password" element={<ForgotPassword />} />
              <Route path="reset-password/:token?" element={<ResetPassword />} />
              <Route path="verify-otp" element={<VerifyOTP />} />
              <Route path="marketplace" element={<Marketplace />} />
              <Route path="weather" element={<Weather />} />
              <Route path="advisor" element={<AIAdvisor />} />
              <Route path="learning" element={<LearningHub />} />
              <Route path="community" element={<Community />} />
              <Route path="chat" element={<ChatPage />} />
              <Route path="chat/:userId" element={<ChatPage />} />
              <Route path="profile" element={<Profile />} />
              <Route path="profile/:userId" element={<Profile />} />
              <Route path="settings" element={<Settings />} />
              <Route path="map" element={<FarmersMap />} />
              <Route path="drivers" element={<DriversPage />} />
              <Route path="experts" element={<ExpertsPage />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="farmer/dashboard" element={<FarmerDashboard />} />
              <Route path="buyer/dashboard" element={<BuyerDashboard />} />
              <Route path="admin/dashboard" element={<AdminDashboard />} />
            </Route>
          </Routes>
        </Suspense>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: { background: '#1B5E20', color: '#fff', borderRadius: '12px' },
            success: { iconTheme: { primary: '#4CAF50', secondary: '#fff' } },
            error: { iconTheme: { primary: '#f44336', secondary: '#fff' } },
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
