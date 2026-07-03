import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase, handleSupabaseError } from '../lib/supabase';
import { Mail, Lock, Eye, EyeOff, Sprout, Loader as Loader2, CircleAlert as AlertCircle, User, Phone, MapPin, Check, X } from 'lucide-react';
import zxcvbn from 'zxcvbn';
import toast from 'react-hot-toast';

type Role = 'farmer' | 'buyer';

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<Role>('farmer');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);

  const passwordStrength = password ? zxcvbn(password) : null;
  const strengthScore = passwordStrength?.score ?? 0;
  const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500', 'bg-emerald-600'];

  const passwordRequirements = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'Uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'Lowercase letter', met: /[a-z]/.test(password) },
    { label: 'Number', met: /[0-9]/.test(password) },
    { label: 'Special character', met: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
  ];

  const allPasswordRequirementsMet = passwordRequirements.every(r => r.met);
  const passwordsMatch = password === confirmPassword && password !== '';

  const validateStep1 = () => {
    if (!role) {
      setError('Please select a role');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!name.trim()) {
      setError('Name is required');
      return false;
    }
    if (!email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email');
      return false;
    }
    if (!phone.trim()) {
      setError('Phone number is required');
      return false;
    }
    if (!/^(0|254)[0-9]{9}$/.test(phone.replace(/\s/g, ''))) {
      setError('Please enter a valid Kenyan phone number');
      return false;
    }
    if (!location.trim()) {
      setError('Location is required');
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    if (!allPasswordRequirementsMet) {
      setError('Please meet all password requirements');
      return false;
    }
    if (!passwordsMatch) {
      setError('Passwords do not match');
      return false;
    }
    if (!acceptTerms) {
      setError('Please accept the terms and conditions');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    setError('');
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const handleBack = () => {
    setError('');
    setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep3()) return;

    setError('');
    setLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password,
        options: {
          data: {
            name: name.trim(),
            role,
          },
        },
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          setError('This email is already registered. Please sign in instead.');
        } else {
          setError(handleSupabaseError(authError));
        }
        setLoading(false);
        return;
      }

      if (data.user) {
        const { error: profileError } = await supabase
          .from('auth_users')
          .insert({
            id: data.user.id,
            email: email.toLowerCase().trim(),
            name: name.trim(),
            phone: phone.trim(),
            location: location.trim(),
            role,
            created_at: new Date().toISOString(),
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
          setError('Account created but profile setup failed. Please contact support.');
          setLoading(false);
          return;
        }

        toast.success('Account created! Please check your email to verify.');
        navigate('/verify-otp', { state: { email: email.toLowerCase(), type: 'signup' } });
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
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
          <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
          <p className="text-gray-600 mt-2">Step {step} of 3</p>

          <div className="flex items-center justify-center gap-2 mt-4">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2 rounded-full transition-all ${
                  s <= step ? 'bg-primary-600 w-12' : 'bg-gray-200 w-8'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="card p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 text-center">I am a...</h2>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setRole('farmer')}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    role === 'farmer'
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Sprout className={`h-12 w-12 mx-auto mb-3 ${role === 'farmer' ? 'text-primary-600' : 'text-gray-400'}`} />
                  <span className={`font-medium ${role === 'farmer' ? 'text-primary-900' : 'text-gray-700'}`}>
                    Farmer
                  </span>
                  <p className="text-xs text-gray-500 mt-1">Sell your produce</p>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('buyer')}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    role === 'buyer'
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <User className={`h-12 w-12 mx-auto mb-3 ${role === 'buyer' ? 'text-primary-600' : 'text-gray-400'}`} />
                  <span className={`font-medium ${role === 'buyer' ? 'text-primary-900' : 'text-gray-700'}`}>
                    Buyer
                  </span>
                  <p className="text-xs text-gray-500 mt-1">Buy fresh produce</p>
                </button>
              </div>
              <button
                type="button"
                onClick={handleNext}
                disabled={!role}
                className="btn btn-primary w-full"
              >
                Continue
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div>
                <label htmlFor="name" className="label">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input pl-12"
                    placeholder="John Kamau"
                    required
                    autoComplete="name"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="label">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input pl-12"
                    placeholder="you@example.com"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="label">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="input pl-12"
                    placeholder="0712 345 678"
                    required
                    autoComplete="tel"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="location" className="label">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="location"
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="input pl-12"
                    placeholder="Nakuru, Kenya"
                    required
                    autoComplete="address-level2"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleBack}
                  className="btn btn-secondary flex-1"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="btn btn-primary flex-1"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="password" className="label">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input pl-12 pr-12"
                    placeholder="Create a strong password"
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>

                {password && (
                  <>
                    <div className="mt-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-600">Password strength</span>
                        <span className={`font-medium ${strengthScore >= 3 ? 'text-green-600' : 'text-gray-600'}`}>
                          {strengthLabels[strengthScore]}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${strengthColors[strengthScore]}`}
                          style={{ width: `${(strengthScore + 1) * 20}%` }}
                        />
                      </div>
                    </div>

                    <div className="mt-3 space-y-1">
                      {passwordRequirements.map((req, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs">
                          {req.met ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <X className="h-4 w-4 text-gray-300" />
                          )}
                          <span className={req.met ? 'text-green-600' : 'text-gray-500'}>
                            {req.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="label">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input pl-12 pr-12"
                    placeholder="Confirm your password"
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {confirmPassword && (
                  <div className="mt-2 flex items-center gap-2 text-xs">
                    {passwordsMatch ? (
                      <>
                        <Check className="h-4 w-4 text-green-500" />
                        <span className="text-green-600">Passwords match</span>
                      </>
                    ) : (
                      <>
                        <X className="h-4 w-4 text-red-500" />
                        <span className="text-red-600">Passwords do not match</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="rounded border-gray-300 mt-1"
                />
                <span className="text-sm text-gray-600">
                  I agree to the{' '}
                  <Link to="/terms" className="text-primary-600 hover:underline">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-primary-600 hover:underline">
                    Privacy Policy
                  </Link>
                </span>
              </label>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleBack}
                  className="btn btn-secondary flex-1"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading || !allPasswordRequirementsMet || !passwordsMatch || !acceptTerms}
                  className="btn btn-primary flex-1"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </button>
              </div>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
