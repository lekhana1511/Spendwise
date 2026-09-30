import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import { loginUser } from '../services/authService';
import { INITIAL_MOCK_USER } from '../data/mockUser';
import { isValidEmail } from '../utils/validation';
import { Sparkles, ArrowRight, AlertCircle, Info } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, showToast } = useApp();

  const [email, setEmail] = useState('aarav.mehta@example.com');
  const [password, setPassword] = useState('password123');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForgotNote, setShowForgotNote] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !isValidEmail(email)) {
      setError('Please provide a valid email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const user = await loginUser(email, password);
      login(user);
      showToast({
        type: 'success',
        title: `Welcome back, ${user.name}!`,
        message: 'Your spending data has been loaded.'
      });
      navigate('/dashboard');
    } catch {
      setError('Failed to log in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUseDemoAccount = () => {
    login(INITIAL_MOCK_USER);
    showToast({
      type: 'success',
      title: 'Demo Session Active',
      message: 'Logged in as Aarav Mehta with verified mock bank transactions.'
    });
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2 mb-6">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-xs">
            S
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">Spendwise</span>
        </Link>
        <h2 className="text-center text-2xl font-bold tracking-tight text-slate-900">
          Sign in to your account
        </h2>
        <p className="mt-1.5 text-center text-xs text-slate-500">
          Or{' '}
          <Link to="/signup" className="font-semibold text-blue-600 hover:text-blue-500">
            create a new account and start onboarding
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-8 shadow-sm border border-slate-200/90 rounded-2xl space-y-6">
          {/* Quick Demo Button */}
          <div className="p-3.5 bg-blue-50/80 border border-blue-200/80 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                Hackathon Demo Mode
              </span>
              <span className="text-[10px] text-blue-700 bg-white px-1.5 py-0.5 rounded font-mono font-medium">
                1-Click
              </span>
            </div>
            <p className="text-[11px] text-blue-700/90 leading-relaxed">
              Instant login using preloaded Indian financial records (Aarav Mehta, HDFC Bank, 23+ transactions).
            </p>
            <button
              type="button"
              onClick={handleUseDemoAccount}
              className="w-full py-2 px-3 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Use demo account</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200" />
            <span className="shrink-0 mx-3 text-slate-400 text-xs uppercase tracking-wider">
              Or sign in with email
            </span>
            <div className="flex-grow border-t border-slate-200" />
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="aarav.mehta@example.com"
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-slate-900"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">Password</label>
                <button
                  type="button"
                  onClick={() => setShowForgotNote(true)}
                  className="text-xs text-blue-600 hover:text-blue-500 font-medium"
                >
                  Forgot password?
                </button>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-slate-900"
              />
            </div>

            {showForgotNote && (
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 flex items-center gap-2">
                <Info className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Password reset is unavailable in this prototype. Use demo credentials or sign up.</span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500/20"
                />
                <span>Remember me for 30 days</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 rounded-lg shadow-xs transition-colors"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
