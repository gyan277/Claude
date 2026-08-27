import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import VerificationModal from './VerificationModal';
import UnderageNotice from './UnderageNotice';
import type { GhanaCardData } from '../services/ghanaCardVerification';

interface ContributeGateProps {
  action: string;
  children: ReactNode;
}

export default function ContributeGate({ action, children }: ContributeGateProps) {
  const { user, markVerified } = useAuth();
  const [showVerify, setShowVerify] = useState(false);

  // Check if user is underage (has card data but not verified)
  const isUnderage = user && !user.verified && user.id; // Has account but not verified

  if (user?.verified) return <>{children}</>;

  // Show underage notice if user is logged in but not verified
  if (isUnderage) {
    return (
      <div>
        <UnderageNotice />
        <div className="rounded-md border border-slate-300 bg-slate-50 p-4 text-center">
          <p className="text-sm text-slate-600">
            You cannot {action} until you are 18 years old.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-ghana-gold/40 bg-ghana-gold/5 p-4">
      <div className="flex items-start gap-2">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-ghana-gold" />
        <p className="text-sm text-slate-600">
          Everyone can see this. Verify your Ghana Card to {action} your vote and posts still stay anonymous.
        </p>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {user ? (
          <button
            onClick={() => setShowVerify(true)}
            className="rounded-md bg-ghana-green px-4 py-2 text-sm font-medium text-white"
          >
            Verify with Ghana Card
          </button>
        ) : (
          <>
            <Link to="/signup" className="rounded-md bg-ghana-green px-4 py-2 text-sm font-medium text-white">
              Create account
            </Link>
            <Link
              to="/login"
              className="rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Sign in
            </Link>
          </>
        )}
      </div>

      <VerificationModal
        open={showVerify}
        onClose={() => setShowVerify(false)}
        onVerified={(cardData: GhanaCardData) => {
          // Check age before marking as verified
          if (cardData.dateOfBirth) {
            const age = calculateAge(cardData.dateOfBirth);
            if (age >= 18) {
              markVerified();
            }
          }
          setShowVerify(false);
        }}
      />
    </div>
  );
}

// Helper function to calculate age
function calculateAge(dateOfBirth: string): number {
  try {
    const parts = dateOfBirth.split('/');
    if (parts.length !== 3) return 0;
    
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    
    const birthDate = new Date(year, month, day);
    const today = new Date();
    
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  } catch (error) {
    return 0;
  }
}
