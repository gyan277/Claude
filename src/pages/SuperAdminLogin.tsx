import { useState, type FormEvent } from 'react';
import { Shield, Lock, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SuperAdminLogin() {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const correctPassword = import.meta.env.VITE_SUPER_ADMIN_PASSWORD;

    if (password === correctPassword) {
      // Store super admin session in sessionStorage (cleared when browser closes)
      sessionStorage.setItem('superAdminAuth', 'true');
      navigate('/admin');
    } else {
      setError('Invalid super admin password');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-ghana-red via-ghana-gold to-ghana-green flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="card p-8 animate-scale-in">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="rounded-full bg-ghana-red/10 p-4">
              <Shield className="h-12 w-12 text-ghana-red" />
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              Super Admin Access
            </h1>
            <p className="text-sm text-slate-600">
              Enter super admin password to manage the system
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-700">
                Super Admin Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pl-10 pr-10"
                  placeholder="Enter password"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Access Admin Panel'}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-xs text-slate-500">
              This page is for super administrators only
            </p>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-4 card p-4 bg-blue-50 border-blue-200">
          <p className="text-xs text-blue-800">
            <strong>Note:</strong> Assembly Members and Ministers should use the regular login page.
          </p>
        </div>
      </div>
    </div>
  );
}
