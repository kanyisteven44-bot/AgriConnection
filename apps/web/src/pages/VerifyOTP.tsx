import { useState, useRef, useEffect, FormEvent, KeyboardEvent, ClipboardEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Loader as Loader2, CircleAlert as AlertCircle, Mail, ArrowLeft, Sprout } from 'lucide-react';
import toast from 'react-hot-toast';

export default function VerifyOTP() {
  const navigate = useNavigate();
  const location = useLocation();
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [cooldown, setCooldown] = useState(0);
  const initialRef = useRef(true);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const email = (location.state as { email?: string })?.email || '';
  const type = (location.state as { type?: 'signup' | 'login' | 'reset_password' })?.type || 'signup';

  const maxAttempts = 5;

  useEffect(() => {
    if (!email) {
      navigate('/register');
    }
  }, [email, navigate]);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  useEffect(() => {
    if (initialRef.current && inputRefs.current[0]) {
      inputRefs.current[0].focus();
      initialRef.current = false;
    }
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError('');

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newOtp.every(d => d !== '') && index === 5) {
      handleSubmit(newOtp);
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    if (e.key === 'Enter' && otp.every(d => d !== '')) {
      handleSubmit(otp);
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData.length === 0) return;

    const newOtp = [...otp];
    for (let i = 0; i < Math.min(6, pastedData.length); i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);
    setError('');

    if (pastedData.length === 6) {
      handleSubmit(newOtp);
    } else {
      inputRefs.current[Math.min(pastedData.length, 5)]?.focus();
    }
  };

  const handleSubmit = async (otpCode: string[] = otp) => {
    const code = otpCode.join('');
    if (code.length !== 6) return;

    if (attempts >= maxAttempts) {
      setError('Maximum attempts exceeded. Please request a new code.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email: email.toLowerCase(),
        token: code,
        type: type === 'reset_password' ? 'recovery' : type,
      });

      if (verifyError) {
        setAttempts(a => a + 1);
        if (attempts + 1 >= maxAttempts) {
          setError('Maximum attempts exceeded. Please request a new code.');
        } else if (verifyError.message.includes('invalid') || verifyError.message.includes('expired')) {
          setError(`Invalid code. ${maxAttempts - attempts - 1} attempts remaining.`);
        } else {
          setError(verifyError.message);
        }
        setLoading(false);
        setOtp(Array(6).fill(''));
        inputRefs.current[0]?.focus();
        return;
      }

      toast.success('Email verified successfully!');

      if (type === 'reset_password') {
        navigate('/reset-password');
      } else {
        const { data: userData } = await supabase
          .from('auth_users')
          .select('*')
          .eq('email', email.toLowerCase())
          .maybeSingle();

        if (userData) {
          navigate('/login', { state: { message: 'Account verified! Please sign in.' } });
        } else {
          navigate('/login');
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;

    setResending(true);
    setError('');

    try {
      if (type === 'signup') {
        const { error } = await supabase.auth.signUp({
          email: email.toLowerCase(),
          password: Math.random().toString(36).slice(-12),
          options: {
            data: { resending: true },
          },
        });
        if (error && !error.message.includes('already registered')) {
          setError('Failed to resend code. Please try again.');
          setResending(false);
          return;
        }
      } else if (type === 'reset_password') {
        const { error } = await supabase.auth.resetPasswordForEmail(email.toLowerCase(), {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) {
          setError('Failed to resend code. Please try again.');
          setResending(false);
          return;
        }
      }

      setCooldown(60);
      setOtp(Array(6).fill(''));
      setAttempts(0);
      inputRefs.current[0]?.focus();
      toast.success('New verification code sent!');
    } catch (err) {
      setError('Failed to resend code. Please try again.');
    } finally {
      setResending(false);
    }
  };

  const getBackLink = () => {
    switch (type) {
      case 'signup': return '/register';
      case 'login': return '/login';
      case 'reset_password': return '/forgot-password';
      default: return '/register';
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'signup': return 'Verify Your Email';
      case 'login': return 'Two-Factor Authentication';
      case 'reset_password': return 'Verify Code';
      default: return 'Verify Code';
    }
  };

  const getSubtitle = () => {
    switch (type) {
      case 'signup': return 'Enter the 6-digit code sent to your email';
      case 'login': return 'Enter the verification code to continue';
      case 'reset_password': return 'Enter the code to reset your password';
      default: return 'Enter the verification code';
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-8">
            <Sprout className="h-10 w-10 text-primary-600" />
            <span className="text-2xl font-bold text-gray-900">AgriConnection</span>
          </Link>
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="h-8 w-8 text-primary-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">{getTitle()}</h1>
          <p className="text-gray-600 mt-2">{getSubtitle()}</p>
          <p className="text-sm text-primary-600 font-medium mt-1">{email}</p>
        </div>

        <div className="card p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-6">
            <div className="flex justify-center gap-3">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  disabled={loading || attempts >= maxAttempts}
                  className={`w-12 h-14 text-center text-xl font-bold border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all ${
                    error
                      ? 'border-red-300 bg-red-50'
                      : digit
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-300 bg-white hover:border-gray-400'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                />
              ))}
            </div>

            {attempts > 0 && attempts < maxAttempts && (
              <p className="text-center text-sm text-gray-500">
                Attempts remaining: {maxAttempts - attempts}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || otp.some(d => d === '') || attempts >= maxAttempts}
              className="btn btn-primary w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify Code'
              )}
            </button>
          </form>

          <div className="mt-6 space-y-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Didn't receive the code?</p>
              <button
                onClick={handleResend}
                disabled={cooldown > 0 || resending || attempts >= maxAttempts}
                className="mt-2 text-sm text-primary-600 hover:text-primary-700 font-medium disabled:text-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 mx-auto"
              >
                {resending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : cooldown > 0 ? (
                  `Resend in ${cooldown}s`
                ) : (
                  'Resend Code'
                )}
              </button>
            </div>

            {attempts >= maxAttempts && (
              <div className="text-center">
                <Link to={getBackLink()} className="text-sm text-gray-600 hover:text-gray-900">
                  Start over
                </Link>
              </div>
            )}
          </div>

          <Link
            to={getBackLink()}
            className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            {type === 'signup' ? 'Back to registration' : 'Back'}
          </Link>
        </div>
      </div>
    </div>
  );
}
