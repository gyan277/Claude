import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, MapPin, CalendarDays, ShieldCheck, ShieldAlert, LogOut, UserRound } from 'lucide-react';
import Layout from '../components/Layout';
import VerificationModal from '../components/VerificationModal';
import { useAuth } from '../context/AuthContext';

const ROLE_LABEL: Record<string, string> = {
  citizen: 'Citizen',
  assembly: 'Assembly Member',
  minister: 'Minister',
};

export default function Profile() {
  const { user, logout, markVerified } = useAuth();
  const navigate = useNavigate();
  const [showVerify, setShowVerify] = useState(false);

  if (!user) {
    return (
      <Layout>
        <div className="mx-auto max-w-sm rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
          <UserRound className="mx-auto h-10 w-10 text-slate-300" />
          <h1 className="mt-3 text-lg font-semibold text-slate-900">You're not signed in</h1>
          <p className="mt-1 text-sm text-slate-500">Sign in or create an account to see your profile.</p>
          <div className="mt-5 flex justify-center gap-2">
            <Link to="/signup" className="rounded-md bg-ghana-green px-4 py-2 text-sm font-medium text-white">
              Create account
            </Link>
            <Link
              to="/login"
              className="rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Sign in
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const initials = user.name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const joined = new Date(user.joinedAt).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <Layout>
      <div className="mx-auto max-w-lg space-y-6">
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-ghana-green/10 text-xl font-bold text-ghana-green">
              {initials}
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-xl font-bold text-slate-900">{user.name}</h1>
              <span className="mt-1 inline-block rounded-full bg-ghana-gold/20 px-2 py-0.5 text-xs font-semibold capitalize text-ghana-black">
                {ROLE_LABEL[user.role]}
              </span>
            </div>
          </div>

          <dl className="mt-6 space-y-4 border-t border-slate-100 pt-5 text-sm">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 shrink-0 text-slate-400" />
              <dt className="sr-only">Email</dt>
              <dd className="text-slate-700">{user.email}</dd>
            </div>
            {user.district && (
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 shrink-0 text-slate-400" />
                <dt className="sr-only">District</dt>
                <dd className="text-slate-700">{user.district}</dd>
              </div>
            )}
            <div className="flex items-center gap-3">
              <CalendarDays className="h-4 w-4 shrink-0 text-slate-400" />
              <dt className="sr-only">Member since</dt>
              <dd className="text-slate-700">Member since {joined}</dd>
            </div>
            <div className="flex items-center gap-3">
              {user.verified ? (
                <>
                  <ShieldCheck className="h-4 w-4 shrink-0 text-ghana-green" />
                  <dt className="sr-only">Verification status</dt>
                  <dd className="text-ghana-green">Ghana Card verified</dd>
                </>
              ) : (
                <>
                  <ShieldAlert className="h-4 w-4 shrink-0 text-ghana-gold" />
                  <dt className="sr-only">Verification status</dt>
                  <dd className="text-slate-600">Not yet verified</dd>
                </>
              )}
            </div>
          </dl>

          {!user.verified && (
            <button
              onClick={() => setShowVerify(true)}
              className="mt-5 w-full rounded-md bg-ghana-green px-4 py-2 text-sm font-medium text-white"
            >
              Verify with Ghana Card
            </button>
          )}
        </div>

        <div className="rounded-lg border border-ghana-green/30 bg-ghana-green/5 p-4 text-sm text-slate-600">
          Your Ghana Card details are used only to verify you're a real, unique citizen. Your votes, posts, and
          forum activity are never linked back to your identity.
        </div>

        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          <LogOut className="h-4 w-4" />
          Log out
        </button>
      </div>

      <VerificationModal
        open={showVerify}
        onClose={() => setShowVerify(false)}
        onVerified={() => {
          markVerified();
          setShowVerify(false);
        }}
      />
    </Layout>
  );
}
