import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainNav from '@/components/layout/MainNav';
import SocialSidebar from '@/components/layout/SocialSidebar';

// US States - same as PlayerSignup
const US_STATES = [
  { label: 'Alabama', value: 'Alabama' },
  { label: 'Alaska', value: 'Alaska' },
  { label: 'Arizona', value: 'Arizona' },
  { label: 'Arkansas', value: 'Arkansas' },
  { label: 'California', value: 'California' },
  { label: 'Colorado', value: 'Colorado' },
  { label: 'Connecticut', value: 'Connecticut' },
  { label: 'Delaware', value: 'Delaware' },
  { label: 'Florida', value: 'Florida' },
  { label: 'Georgia', value: 'Georgia' },
  { label: 'Hawaii', value: 'Hawaii' },
  { label: 'Idaho', value: 'Idaho' },
  { label: 'Illinois', value: 'Illinois' },
  { label: 'Indiana', value: 'Indiana' },
  { label: 'Iowa', value: 'Iowa' },
  { label: 'Kansas', value: 'Kansas' },
  { label: 'Kentucky', value: 'Kentucky' },
  { label: 'Louisiana', value: 'Louisiana' },
  { label: 'Maine', value: 'Maine' },
  { label: 'Maryland', value: 'Maryland' },
  { label: 'Massachusetts', value: 'Massachusetts' },
  { label: 'Michigan', value: 'Michigan' },
  { label: 'Minnesota', value: 'Minnesota' },
  { label: 'Mississippi', value: 'Mississippi' },
  { label: 'Missouri', value: 'Missouri' },
  { label: 'Montana', value: 'Montana' },
  { label: 'Nebraska', value: 'Nebraska' },
  { label: 'Nevada', value: 'Nevada' },
  { label: 'New Hampshire', value: 'New Hampshire' },
  { label: 'New Jersey', value: 'New Jersey' },
  { label: 'New Mexico', value: 'New Mexico' },
  { label: 'New York', value: 'New York' },
  { label: 'North Carolina', value: 'North Carolina' },
  { label: 'North Dakota', value: 'North Dakota' },
  { label: 'Ohio', value: 'Ohio' },
  { label: 'Oklahoma', value: 'Oklahoma' },
  { label: 'Oregon', value: 'Oregon' },
  { label: 'Pennsylvania', value: 'Pennsylvania' },
  { label: 'Rhode Island', value: 'Rhode Island' },
  { label: 'South Carolina', value: 'South Carolina' },
  { label: 'South Dakota', value: 'South Dakota' },
  { label: 'Tennessee', value: 'Tennessee' },
  { label: 'Texas', value: 'Texas' },
  { label: 'Utah', value: 'Utah' },
  { label: 'Vermont', value: 'Vermont' },
  { label: 'Virginia', value: 'Virginia' },
  { label: 'Washington', value: 'Washington' },
  { label: 'West Virginia', value: 'West Virginia' },
  { label: 'Wisconsin', value: 'Wisconsin' },
  { label: 'Wyoming', value: 'Wyoming' },
];

export default function CoachAddress() {
  const navigate = useNavigate();
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');

  useEffect(() => {
    // Load from sessionStorage if exists
    const saved = sessionStorage.getItem('coachSignupData');
    if (!saved) {
      navigate('/signup/coach');
      return;
    }
  }, [navigate]);

  const isValid = !!address && !!city && !!state && !!zip;

  const handleContinue = () => {
    if (!isValid) return;

    // Update sessionStorage
    const saved = JSON.parse(sessionStorage.getItem('coachSignupData') || '{}');
    sessionStorage.setItem(
      'coachSignupData',
      JSON.stringify({ ...saved, address, city, state, zip })
    );
    navigate('/signup/coach/team-code');
  };

  return (
    <div className="relative bg-neutral-950 min-h-screen overflow-x-hidden">
      {/* Background Image Layer */}
      <div className="fixed inset-0 z-0">
        <img
          src="https://linedrivemedia.com/wp-content/uploads/2024/07/Texas_Bombers_Gold_Smith_18U_AFCS_champs_2024.jpg"
          alt="Texas Bombers Team"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black/85" />
        <div className="absolute inset-0 bg-neutral-950/60" />
      </div>

      <MainNav />
      <SocialSidebar />

      <main className="relative z-20 pt-32 pb-20 flex items-center justify-center min-h-screen">
        <div className="w-full max-w-2xl px-4">
          <div className="relative bg-gradient-to-br from-neutral-900/50 to-neutral-950/50 backdrop-blur-sm rounded-2xl border border-[#57a4ff]/20 p-8 shadow-2xl">
            {/* Header */}
            <div className="mb-6">
              <button
                onClick={() => navigate('/signup/coach')}
                className="mb-4 flex items-center gap-2 text-[#57a4ff] hover:text-[#6bb0ff] transition-colors duration-300"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                <span className="text-sm font-semibold">Back</span>
              </button>

              <h2 className="text-2xl md:text-3xl font-black mb-2 text-white">
                Address Info
              </h2>
              <p className="text-neutral-400 text-sm">
                Please enter your address information.
              </p>
            </div>

            {/* Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-white/80 mb-2 uppercase tracking-wider">
                  Street Address
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-4 py-3 bg-neutral-950/50 border border-[#57a4ff]/30 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-[#57a4ff] focus:ring-1 focus:ring-[#57a4ff] transition-all duration-300"
                  placeholder="123 Main St"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-white/80 mb-2 uppercase tracking-wider">
                  City
                </label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-4 py-3 bg-neutral-950/50 border border-[#57a4ff]/30 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-[#57a4ff] focus:ring-1 focus:ring-[#57a4ff] transition-all duration-300"
                  placeholder="City"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-white/80 mb-2 uppercase tracking-wider">
                  State
                </label>
                <select
                  required
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-4 py-3 bg-neutral-950/50 border border-[#57a4ff]/30 rounded-lg text-white focus:outline-none focus:border-[#57a4ff] focus:ring-1 focus:ring-[#57a4ff] transition-all duration-300"
                >
                  <option value="">Select State</option>
                  {US_STATES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-white/80 mb-2 uppercase tracking-wider">
                  Zip Code
                </label>
                <input
                  type="text"
                  required
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
                  className="w-full px-4 py-3 bg-neutral-950/50 border border-[#57a4ff]/30 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-[#57a4ff] focus:ring-1 focus:ring-[#57a4ff] transition-all duration-300"
                  placeholder="12345"
                />
              </div>

              <button
                onClick={handleContinue}
                disabled={!isValid}
                className="w-full px-8 py-4 bg-gradient-to-r from-[#57a4ff] via-[#6bb0ff] to-[#57a4ff] text-white font-black uppercase tracking-widest rounded-lg hover:shadow-[0_0_30px_rgba(87,164,255,0.6)] transition-all duration-300 relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="relative z-10">Continue to Team Code</span>
                {isValid && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                )}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
