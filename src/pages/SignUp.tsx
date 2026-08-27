import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, type UserRole } from '../context/AuthContext';
import { supabase } from '../services/supabaseClient';
import VerificationModal from '../components/VerificationModal';
import type { GhanaCardData } from '../services/ghanaCardVerification';

const DISTRICTS = [
  // Greater Accra Region
  'Accra Metropolitan',
  'Tema Metropolitan',
  'Adenta Municipal',
  'Ashaiman Municipal',
  'La Nkwantanang Madina Municipal',
  'Ledzokuku Municipal',
  'Kpone-Katamanso Municipal',
  'Ga Central Municipal',
  'Ga East Municipal',
  'Ga North Municipal',
  'Ga South Municipal',
  'Ga West Municipal',
  'Weija-Gbawe Municipal',
  'Ablekuma North Municipal',
  'Ablekuma Central Municipal',
  'Ablekuma West Municipal',
  'Ayawaso Central Municipal',
  'Ayawaso East Municipal',
  'Ayawaso North Municipal',
  'Ayawaso West Municipal',
  'Okaikwei Central Municipal',
  'Okaikwei North Municipal',
  'Korle Klottey Municipal',
  'Shai Osudoku',
  'Ningo Prampram',
  'Ada East',
  'Ada West',
  'Krowor Municipal',
  'Amasaman Municipal',
  'Trobu Municipal',
  
  // Ashanti Region
  'Kumasi Metropolitan',
  'Obuasi Municipal',
  'Ejisu Municipal',
  'Asokore Mampong Municipal',
  'Afigya Kwabre South',
  'Afigya Kwabre North',
  'Atwima Kwanwoma',
  'Atwima Mponua',
  'Atwima Nwabiagya Municipal',
  'Atwima Nwabiagya North',
  'Bekwai Municipal',
  'Bosome Freho',
  'Bosomtwe',
  'Ejura Sekyedumase Municipal',
  'Juaben Municipal',
  'Kwabre East Municipal',
  'Kwadaso Municipal',
  'Mampong Municipal',
  'Offinso Municipal',
  'Offinso North',
  'Old Tafo Municipal',
  'Oforikrom Municipal',
  'Suame Municipal',
  
  // Western Region
  'Sekondi-Takoradi Metropolitan',
  'Tarkwa-Nsuaem Municipal',
  'Effia-Kwesimintsim Municipal',
  'Shama',
  'Ahanta West Municipal',
  'Wassa East',
  'Prestea Huni Valley Municipal',
  'Ellembelle',
  'Nzema East Municipal',
  
  // Central Region
  'Cape Coast Metropolitan',
  'Komenda Edina Eguafo Abirem Municipal',
  'Abura Asebu Kwamankese',
  'Mfantsiman Municipal',
  'Agona East',
  'Agona West Municipal',
  'Awutu Senya East Municipal',
  'Awutu Senya West',
  'Effutu Municipal',
  'Gomoa East',
  'Gomoa West',
  'Asikuma Odoben Brakwa',
  'Assin Central Municipal',
  'Assin North Municipal',
  'Assin South',
  'Twifo Atti-Morkwa',
  'Upper Denkyira East Municipal',
  'Upper Denkyira West',
  
  // Eastern Region
  'New Juaben Municipal',
  'New Juaben South Municipal',
  'Akuapem North Municipal',
  'Akuapem South',
  'Suhum Municipal',
  'Nsawam Adoagyire Municipal',
  'Ayensuano',
  'Fanteakwa North',
  'Fanteakwa South',
  'Kwahu East',
  'Kwahu South',
  'Kwahu West Municipal',
  'Kwahu Afram Plains North',
  'Kwahu Afram Plains South',
  'Atiwa East',
  'Atiwa West',
  'Akyemansa',
  'Birim Central Municipal',
  'Birim North',
  'Birim South',
  'Denkyembour',
  'West Akim Municipal',
  'Yilo Krobo Municipal',
  'Lower Manya Krobo Municipal',
  'Upper Manya Krobo',
  'Asuogyaman',
  
  // Volta Region
  'Ho Municipal',
  'Hohoe Municipal',
  'Keta Municipal',
  'Ketu North Municipal',
  'Ketu South Municipal',
  'Akatsi North',
  'Akatsi South',
  'Adaklu',
  'Afadjato South',
  'Agotime Ziope',
  'North Dayi',
  'South Dayi',
  'Central Tongu',
  'North Tongu',
  'South Tongu',
  'Anloga',
  'Kpando Municipal',
  'Biakoye',
  'Jasikan',
  'Kadjebi',
  'Krachi East',
  'Krachi Nchumuru',
  'Krachi West',
  'Nkwanta North',
  'Nkwanta South Municipal',
  
  // Northern Region
  'Tamale Metropolitan',
  'Yendi Municipal',
  'Zabzugu',
  'Tatale Sanguli',
  'Gushegu Municipal',
  'Karaga',
  'Kumbungu',
  'Mion',
  'Nanumba North Municipal',
  'Nanumba South',
  'Saboba',
  'Sagnarigu Municipal',
  'Savelugu Municipal',
  'Tolon',
  'Kpandai',
  'Bunkpurugu Nakpanduri',
  'Yunyoo Nasuan',
  'Mamprugu Moagduri',
  'East Mamprusi Municipal',
  'West Mamprusi Municipal',
  
  // Upper East Region
  'Bolgatanga Municipal',
  'Bawku Municipal',
  'Bawku West',
  'Binduri',
  'Bongo',
  'Builsa North Municipal',
  'Builsa South',
  'Garu',
  'Kassena Nankana Municipal',
  'Kassena Nankana West',
  'Nabdam',
  'Pusiga',
  'Talensi',
  'Tempane',
  
  // Upper West Region
  'Wa Municipal',
  'Daffiama Bussie Issa',
  'Jirapa Municipal',
  'Lambussie Karni',
  'Lawra Municipal',
  'Nadowli Kaleo',
  'Nandom Municipal',
  'Sissala East Municipal',
  'Sissala West',
  'Wa East',
  'Wa West',
  
  // Bono Region
  'Sunyani Municipal',
  'Berekum Municipal',
  'Dormaa Central Municipal',
  'Dormaa East',
  'Dormaa West',
  'Jaman North',
  'Jaman South Municipal',
  'Tain',
  'Banda',
  'Wenchi Municipal',
  
  // Bono East Region
  'Techiman Municipal',
  'Techiman North',
  'Kintampo North Municipal',
  'Kintampo South',
  'Nkoranza North',
  'Nkoranza South Municipal',
  'Atebubu Amantin Municipal',
  'Pru East',
  'Pru West',
  'Sene East',
  'Sene West',
  
  // Ahafo Region
  'Goaso Municipal',
  'Asunafo North Municipal',
  'Asunafo South',
  'Asutifi North',
  'Asutifi South',
  'Tano North Municipal',
  
  // Oti Region
  'Jasikan',
  'Kadjebi',
  'Krachi East Municipal',
  'Krachi Nchumuru',
  'Krachi West',
  'Nkwanta North',
  'Nkwanta South Municipal',
  'Biakoye',
  
  // North East Region
  'Nalerigu Gambaga Municipal',
  'Bunkpurugu Nakpanduri',
  'Yunyoo Nasuan',
  'East Mamprusi Municipal',
  'West Mamprusi Municipal',
  'Mamprugu Moagduri',
  
  // Savannah Region
  'Damongo Municipal',
  'Bole',
  'Central Gonja',
  'East Gonja Municipal',
  'North Gonja',
  'Sawla Tuna Kalba',
  'West Gonja Municipal',
].sort();

export default function SignUp() {
  const { signUp, markVerified, user } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [district, setDistrict] = useState(DISTRICTS[0]);
  const [showVerification, setShowVerification] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await signUp({ name, email, password, district, role: 'citizen' });
      setSubmitting(false);
      setShowVerification(true);
    } catch (err: any) {
      console.error('Signup error:', err);
      setError(err.message || 'Could not create your account. Please try again.');
      setSubmitting(false);
    }
  };

  const handleVerified = async (cardData: GhanaCardData) => {
    try {
      // Calculate age to check eligibility
      const age = cardData.dateOfBirth ? calculateAge(cardData.dateOfBirth) : 0;
      const isEligible = age >= 18;
      
      // Save Ghana Card data to user profile
      if (user) {
        const { error } = await supabase
          .from('users')
          .update({
            verified: isEligible, // Only verify if 18+
            ghana_card_number: cardData.cardNumber,
            date_of_birth: cardData.dateOfBirth,
            gender: cardData.gender,
          })
          .eq('id', user.id);
        
        if (error) {
          console.error('Error saving verification data:', error);
        }
      }
      
      // Only mark as verified if eligible
      if (isEligible) {
        markVerified();
      }
      
      setShowVerification(false);
      navigate('/');
    } catch (error) {
      console.error('Error saving verification data:', error);
      // Still continue but don't mark as verified if under 18
      setShowVerification(false);
      navigate('/');
    }
  };

  // Helper function to calculate age
  const calculateAge = (dateOfBirth: string): number => {
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
          <div className="rounded-lg bg-ghana-green/10 p-2">
            <img 
              src="/src/assets/logo.png" 
              alt="Ghana Logo" 
              className="h-8 w-8 object-contain"
            />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Create your account</h1>
          <p className="text-sm text-slate-500">Register now, then verify with Ghana Card</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Info banner about Ghana Card verification */}
          <div className="rounded-lg border border-ghana-gold/30 bg-ghana-gold/5 p-3">
            <p className="text-xs text-slate-700">
              <span className="font-semibold">Next step:</span> After creating your account, you'll verify your identity with your Ghana Card to vote and post anonymously.
            </p>
          </div>

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

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-md bg-ghana-green px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {submitting ? 'Creating account…' : 'Create Account'}
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
