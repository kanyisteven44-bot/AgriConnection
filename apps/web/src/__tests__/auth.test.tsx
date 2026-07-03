import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Login from '../pages/Login';
import Register from '../pages/Register';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>{children}</BrowserRouter>
  </QueryClientProvider>
);

vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn(() => Promise.resolve({ data: null, error: null })),
        })),
      })),
      insert: vi.fn(() => Promise.resolve({ error: null })),
    })),
  },
  handleSupabaseError: vi.fn((err) => err.message),
}));

vi.mock('../lib/store', () => ({
  useAuthStore: vi.fn(() => ({
    setUser: vi.fn(),
    user: null,
    isAuthenticated: false,
  })),
}));

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('Authentication', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Login Page', () => {
    it('renders login form', () => {
      render(<Login />, { wrapper });
      expect(screen.getByText('Welcome Back')).toBeInTheDocument();
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('shows error for invalid credentials', async () => {
      const { supabase } = await import('../lib/supabase');
      (supabase.auth.signInWithPassword as any).mockResolvedValueOnce({
        data: null,
        error: { message: 'Invalid login credentials' },
      });

      render(<Login />, { wrapper });

      fireEvent.change(screen.getByLabelText(/email address/i), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/^password$/i), {
        target: { value: 'wrongpassword' },
      });

      fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument();
      });
    });

    it('has links to register and forgot password', () => {
      render(<Login />, { wrapper });
      expect(screen.getByText(/sign up/i)).toHaveAttribute('href', '/register');
      expect(screen.getByText(/forgot password/i)).toHaveAttribute('href', '/forgot-password');
    });

    it('has password visibility toggle', () => {
      render(<Login />, { wrapper });
      const passwordInput = screen.getByLabelText(/^password$/i);
      expect(passwordInput).toHaveAttribute('type', 'password');

      const toggleButton = screen.getByRole('button', { name: '' });
      fireEvent.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'text');
    });
  });

  describe('Register Page', () => {
    it('renders role selection initially', () => {
      render(<Register />, { wrapper });
      expect(screen.getByText('Create Account')).toBeInTheDocument();
      expect(screen.getByText(/^farmer$/i)).toBeInTheDocument();
      expect(screen.getByText(/^buyer$/i)).toBeInTheDocument();
    });

    it('progresses to step 2 after role selection', async () => {
      render(<Register />, { wrapper });

      fireEvent.click(screen.getByText(/^farmer$/i).closest('button')!);
      fireEvent.click(screen.getByRole('button', { name: /continue/i }));

      await waitFor(() => {
        expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
      });
    });

    it('validates password requirements', async () => {
      render(<Register />, { wrapper });

      fireEvent.click(screen.getByText(/^farmer$/i).closest('button')!);
      fireEvent.click(screen.getByRole('button', { name: /continue/i }));

      await waitFor(() => {
        fireEvent.click(screen.getByRole('button', { name: /continue/i }));
      });

      const nameInput = screen.getByLabelText(/full name/i);
      const emailInput = screen.getByLabelText(/email address/i);
      const phoneInput = screen.getByLabelText(/phone number/i);
      const locationInput = screen.getByLabelText(/location/i);

      fireEvent.change(nameInput, { target: { value: 'Test User' } });
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(phoneInput, { target: { value: '0712345678' } });
      fireEvent.change(locationInput, { target: { value: 'Nairobi' } });

      fireEvent.click(screen.getByRole('button', { name: /continue/i }));

      await waitFor(() => {
        const passwordInput = screen.getByLabelText(/^password$/i);
        fireEvent.change(passwordInput, { target: { value: 'weak' } });

        expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument();
        expect(screen.getByText(/uppercase letter/i)).toBeInTheDocument();
        expect(screen.getByText(/lowercase letter/i)).toBeInTheDocument();
        expect(screen.getByText(/number/i)).toBeInTheDocument();
        expect(screen.getByText(/special character/i)).toBeInTheDocument();
      });
    });

    it('shows password strength meter', async () => {
      render(<Register />, { wrapper });

      fireEvent.click(screen.getByText(/^farmer$/i).closest('button')!);
      fireEvent.click(screen.getByRole('button', { name: /continue/i }));

      await waitFor(() => {
        fireEvent.click(screen.getByRole('button', { name: /continue/i }));
      });

      const nameInput = screen.getByLabelText(/full name/i);
      const emailInput = screen.getByLabelText(/email address/i);
      const phoneInput = screen.getByLabelText(/phone number/i);
      const locationInput = screen.getByLabelText(/location/i);

      fireEvent.change(nameInput, { target: { value: 'Test User' } });
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(phoneInput, { target: { value: '0712345678' } });
      fireEvent.change(locationInput, { target: { value: 'Nairobi' } });

      fireEvent.click(screen.getByRole('button', { name: /continue/i }));

      await waitFor(() => {
        const passwordInput = screen.getByLabelText(/^password$/i);
        fireEvent.change(passwordInput, { target: { value: 'StrongP@ss123' } });

        expect(screen.getByText(/strong/i)).toBeInTheDocument();
      });
    });
  });
});
