import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Landmark } from 'lucide-react';
import { useAuth, type UserRole } from '../context/AuthContext';
import VerificationModal from '../components/VerificationModal';

const DISTRICTS = ['Accra Metropolitan', 'Kumasi Metropolitan', 'Tamale Metropolitan', 'Cape Coast Metropolitan'];

export default function SignUp() {
  const { signUp, markVerified } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [district, setDistrict] = useState(DISTRICTS[0]);
  const [role, setRole] = useState<UserRole>('citizen');
  const [showVerification, setShowVerification] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await signUp({ name, email, password, district, role });
      setSubmitting(false);
      setShowVerification(true);
    } catch {
      setError('Could not create your account. Please try again.');
      setSubmitting(false);
    }
  };

  const handleVerified = () => {
    markVerified();
    setShowVerification(false);
    navigate('/');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex h-1.5 w-full">
          <div className="flex-1 bg-ghana-red" />
          <div className="flex-1 bg-ghana-gold" />
          <div className="flex-1 bg-ghana-green" />
        </div>
        <div className="p-8">
        <div className="mb-6 flex flex-col items-center gap-2">
          <Landmark className="h-8 w-8 text-ghana-green" />
          <h1 className="text-xl font-bold text-slate-900">Create your account</h1>
          <p className="text-sm text-slate-500">Verified, anonymous civic participation</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Full name</label>
            <input
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-ghana-green focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-ghana-green focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-ghana-green focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">District</label>
            <select
              value={district}
              onChange={(event) => setDistrict(event.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-ghana-green focus:outline-none"
            >
              {DISTRICTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Role</label>
            <select
              value={role}
              onChange={(event) => setRole(event.target.value as UserRole)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-ghana-green focus:outline-none"
            >
              <option value="citizen">Citizen</option>
              <option value="assembly">Assembly Member</option>
              <option value="minister">Minister</option>
            </select>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-md bg-ghana-green px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {submitting ? 'Creating account…' : 'Continue to verification'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-ghana-green underline">
            Sign in
          </Link>
        </p>
        </div>
      </div>

      <VerificationModal
        open={showVerification}
        onClose={() => setShowVerification(false)}
        onVerified={handleVerified}
      />
    </div>
  );
}
