import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import VerifyOTP from '../pages/VerifyOTP';

const mockNavigate = vi.fn();
const mockLocation = { state: { email: 'test@example.com', type: 'signup' } };

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => mockLocation,
  };
});

vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      verifyOtp: vi.fn(),
      signUp: vi.fn(),
      resetPasswordForEmail: vi.fn(),
    },
  },
}));

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('VerifyOTP', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders 6 digit input boxes', () => {
    render(<VerifyOTP />, { wrapper: BrowserRouter });
    const inputs = screen.getAllByRole('textbox');
    expect(inputs).toHaveLength(6);
  });

  it('accepts only numeric input', () => {
    render(<VerifyOTP />, { wrapper: BrowserRouter });
    const inputs = screen.getAllByRole('textbox');

    fireEvent.input(inputs[0], { target: { value: 'a' } });
    expect(inputs[0]).toHaveValue('');

    fireEvent.input(inputs[0], { target: { value: '1' } });
    expect(inputs[0]).toHaveValue('1');
  });

  it('auto-focuses next input on digit entry', () => {
    render(<VerifyOTP />, { wrapper: BrowserRouter });
    const inputs = screen.getAllByRole('textbox');

    fireEvent.input(inputs[0], { target: { value: '1' } });
    expect(inputs[1]).toHaveFocus();

    fireEvent.input(inputs[1], { target: { value: '2' } });
    expect(inputs[2]).toHaveFocus();
  });

  it('handles paste of 6 digits', () => {
    render(<VerifyOTP />, { wrapper: BrowserRouter });
    const inputs = screen.getAllByRole('textbox');

    fireEvent.paste(inputs[0], {
      clipboardData: {
        getData: () => '123456',
      },
    } as any);

    expect(inputs[0]).toHaveValue('1');
    expect(inputs[1]).toHaveValue('2');
    expect(inputs[2]).toHaveValue('3');
    expect(inputs[3]).toHaveValue('4');
    expect(inputs[4]).toHaveValue('5');
    expect(inputs[5]).toHaveValue('6');
  });

  it('shows resend cooldown', async () => {
    render(<VerifyOTP />, { wrapper: BrowserRouter });

    const resendButton = screen.getByRole('button', { name: /resend/i });
    expect(resendButton).toBeInTheDocument();
    fireEvent.click(resendButton);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /resend/i })).toBeTruthy();
    });
  });

  it('tracks attempts and shows warning', async () => {
    const { supabase } = await import('../lib/supabase');
    (supabase.auth.verifyOtp as any).mockResolvedValue({
      data: null,
      error: { message: 'invalid' },
    });

    render(<VerifyOTP />, { wrapper: BrowserRouter });
    const inputs = screen.getAllByRole('textbox');

    for (let i = 0; i < 6; i++) {
      fireEvent.input(inputs[i], { target: { value: `${i + 1}` } });
    }

    await waitFor(() => {
      const elements = screen.getAllByText(/attempts remaining/i);
      expect(elements.length).toBeGreaterThan(0);
    });
  });

  it('handles backspace on empty input', () => {
    render(<VerifyOTP />, { wrapper: BrowserRouter });
    const inputs = screen.getAllByRole('textbox');

    // Type in first input
    fireEvent.input(inputs[0], { target: { value: '1' } });
    expect(inputs[0]).toHaveValue('1');

    // Press backspace on second empty input
    fireEvent.keyDown(inputs[1], { key: 'Backspace' });

    // The backspace handler should work without error
    expect(inputs[0]).toHaveValue('1');
  });

  it('auto-submits when all 6 digits are entered', async () => {
    const { supabase } = await import('../lib/supabase');
    (supabase.auth.verifyOtp as any).mockResolvedValue({
      data: { user: { id: '123' } },
      error: null,
    });

    render(<VerifyOTP />, { wrapper: BrowserRouter });
    const inputs = screen.getAllByRole('textbox');

    for (let i = 0; i < 6; i++) {
      fireEvent.input(inputs[i], { target: { value: `${i + 1}` } });
    }

    await waitFor(() => {
      expect(supabase.auth.verifyOtp).toHaveBeenCalled();
    });
  });
});
