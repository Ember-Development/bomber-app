import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import MainNav from '@/components/layout/MainNav';
import SocialSidebar from '@/components/layout/SocialSidebar';
import { api } from '@/api/Client';
import { useAuth } from '@/contexts/AuthContext';
import React from 'react';
import SchoolInput from '@/components/ui/SchoolInput';
import type { FlatSchool } from '@/utils/school';

// Enum options - you can extract these to a utils file
const POSITIONS = [
  { label: 'Pitcher', value: 'PITCHER' },
  { label: 'Catcher', value: 'CATCHER' },
  { label: 'First Base', value: 'FIRST_BASE' },
  { label: 'Second Base', value: 'SECOND_BASE' },
  { label: 'Third Base', value: 'THIRD_BASE' },
  { label: 'Shortstop', value: 'SHORTSTOP' },
  { label: 'Left Field', value: 'LEFT_FIELD' },
  { label: 'Center Field', value: 'CENTER_FIELD' },
  { label: 'Right Field', value: 'RIGHT_FIELD' },
  { label: 'Designated Hitter', value: 'DESIGNATED_HITTER' },
];

const JERSEY_SIZES = [
  { label: 'YXS', value: 'YXS' },
  { label: 'YS', value: 'YS' },
  { label: 'YM', value: 'YM' },
  { label: 'YL', value: 'YL' },
  { label: 'YXL', value: 'YXL' },
  { label: 'AS', value: 'AS' },
  { label: 'AM', value: 'AM' },
  { label: 'AL', value: 'AL' },
  { label: 'AXL', value: 'AXL' },
  { label: 'A2XL', value: 'A2XL' },
];

const PANT_SIZES = [
  { label: '20', value: 'SIZE_20' },
  { label: '22', value: 'SIZE_22' },
  { label: '24', value: 'SIZE_24' },
  { label: '26', value: 'SIZE_26' },
  { label: '27', value: 'SIZE_27' },
  { label: '28', value: 'SIZE_28' },
  { label: '30', value: 'SIZE_30' },
  { label: '32', value: 'SIZE_32' },
  { label: '33', value: 'SIZE_33' },
  { label: '34', value: 'SIZE_34' },
  { label: '36', value: 'SIZE_36' },
  { label: '38', value: 'SIZE_38' },
];

const STIRRUP_SIZES = [
  { label: 'ADULT', value: 'ADULT' },
  { label: 'ADULT_LONG', value: 'ADULT_LONG' },
  { label: 'XL', value: 'XL' },
  { label: 'XL_WIDE', value: 'XL_WIDE' },
];

const SHORTS_SIZES = [
  { label: 'YXL', value: 'YXL' },
  { label: 'ASM', value: 'ASM' },
  { label: 'AMD', value: 'AMD' },
  { label: 'ALG', value: 'ALG' },
  { label: 'AXL', value: 'AXL' },
  { label: 'A2XL', value: 'A2XL' },
];

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

type Step = 'INFO' | 'SPORT' | 'GEAR';

export default function PlayerSignup() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { checkAuth } = useAuth();

  const teamCode = searchParams.get('teamCode') || '';
  const teamName = searchParams.get('teamName') || '';
  const ageDivision = searchParams.get('ageDivision') || '';

  const [step, setStep] = useState<Step>('INFO');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 1: INFO fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [address, setAddress] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [zip, setZip] = useState('');

  // Password visibility toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Step 2: SPORT fields
  const [position1, setPosition1] = useState('');
  const [position2, setPosition2] = useState('');
  const [jerseyNum, setJerseyNum] = useState('');
  const [gradYear, setGradYear] = useState('');
  const [committed, setCommitted] = useState(false);
  const [college, setCollege] = useState('');
  const [commitDate, setCommitDate] = useState('');
  const [selectedCollege, setSelectedCollege] = useState<FlatSchool | null>(
    null
  );

  // Step 3: GEAR fields
  const [jerseySize, setJerseySize] = useState('');
  const [pantSize, setPantSize] = useState('');
  const [stirrupSize, setStirrupSize] = useState('');
  const [shortSize, setShortSize] = useState('');
  const [practiceShirtSize, setPracticeShirtSize] = useState('');

  // Validation
  const infoValid =
    !!firstName &&
    !!lastName &&
    !!email &&
    !!phone &&
    !!dob &&
    password.length >= 8 &&
    password === confirmPassword &&
    !!address &&
    !!state &&
    !!city &&
    !!zip;

  const sportValid =
    !!position1 &&
    !!position2 &&
    !!jerseyNum &&
    !!gradYear &&
    (!committed || !!college);

  const gearValid =
    !!jerseySize &&
    !!pantSize &&
    !!stirrupSize &&
    !!shortSize &&
    !!practiceShirtSize;

  const handleInfoNext = () => {
    if (infoValid) {
      setStep('SPORT');
    }
  };

  const handleSportNext = () => {
    if (sportValid) {
      setStep('GEAR');
    }
  };

  const handleSubmit = async () => {
    if (!gearValid) return;

    setLoading(true);
    setError('');

    try {
      // 1) Create address
      let addressID: string | undefined;
      if (address && city && state && zip) {
        const { data: addressData } = await api.post('/users/address', {
          address1: address,
          city,
          state,
          zip,
        });
        addressID = addressData.id;
      }

      // 2) Create commit if committed
      let commitId: string | undefined;
      if (committed && college) {
        try {
          const { data: commitData } = await api.post('/commits', {
            name: college,
            state: state || '',
            city: city || '',
            committedDate: commitDate
              ? new Date(commitDate).toISOString()
              : new Date().toISOString(),
          });
          commitId = commitData.id;
        } catch (commitErr) {
          console.error('Failed to create commit', commitErr);
          // Continue without commit
        }
      }

      // 3) Create user + player
      const { data } = await api.post('/auth/signup', {
        email: email.trim(),
        password,
        fname: firstName.trim(),
        lname: lastName.trim(),
        phone: phone.trim(),
        role: 'PLAYER',
        player: {
          pos1: position1,
          pos2: position2,
          jerseyNum,
          gradYear,
          college: committed ? college : '',
          commitId,
          ageGroup: ageDivision || undefined,
          jerseySize,
          pantSize,
          stirrupSize,
          shortSize,
          practiceShortSize: practiceShirtSize,
          addressID,
          isTrusted: true,
        },
      });

      const playerId = data.user.player?.id;

      // 4) Add to team
      if (playerId && teamCode) {
        await api.post('/players/add-to-team', {
          playerId,
          teamCode,
        });
      }

      // 5) Refresh auth and navigate
      await checkAuth();
      navigate('/');
    } catch (err: any) {
      console.error('Signup error:', err);
      setError(
        err.response?.data?.message ||
          'There was a problem creating your account. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const renderStepper = () => {
    const steps = [
      { key: 'INFO', label: 'Info', number: 1 },
      { key: 'SPORT', label: 'Sport', number: 2 },
      { key: 'GEAR', label: 'Gear', number: 3 },
    ];

    return (
      <div className="flex items-center justify-center gap-4 mb-8">
        {steps.map((s, index) => (
          <React.Fragment key={s.key}>
            <div className="flex items-center gap-2">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                  step === s.key
                    ? 'bg-[#57a4ff] text-white'
                    : ['INFO', 'SPORT', 'GEAR'].indexOf(step) > index
                      ? 'bg-green-500 text-white'
                      : 'bg-neutral-800 text-neutral-400'
                }`}
              >
                {['INFO', 'SPORT', 'GEAR'].indexOf(step) > index ? (
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  s.number
                )}
              </div>
              <span
                className={`text-sm font-semibold hidden sm:block ${
                  step === s.key ? 'text-[#57a4ff]' : 'text-neutral-400'
                }`}
              >
                {s.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`h-1 w-12 transition-all duration-300 ${
                  ['INFO', 'SPORT', 'GEAR'].indexOf(step) > index
                    ? 'bg-green-500'
                    : 'bg-neutral-800'
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    );
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
          {/* Glow orbs */}
          <div className="absolute top-20 left-20 w-64 h-64 bg-[#57a4ff]/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-64 h-64 bg-[#3b8aff]/10 rounded-full blur-3xl" />

          <div className="relative bg-gradient-to-br from-neutral-900/50 to-neutral-950/50 backdrop-blur-sm rounded-2xl border border-[#57a4ff]/20 p-8 shadow-2xl">
            {/* Header */}
            <div className="mb-6">
              <button
                onClick={() => {
                  if (step === 'INFO') {
                    navigate('/signup/player/team-code');
                  } else if (step === 'SPORT') {
                    setStep('INFO');
                  } else {
                    setStep('SPORT');
                  }
                }}
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
                {step === 'INFO'
                  ? 'Athlete Info'
                  : step === 'SPORT'
                    ? 'Athlete Sport Info'
                    : 'Athlete Gear Info'}
              </h2>
              <p className="text-neutral-400 text-sm">
                {step === 'INFO'
                  ? 'Please enter your player information'
                  : step === 'SPORT'
                    ? "We now need the athlete's specific sport information"
                    : "Lastly we need the athlete's gear sizes"}
              </p>
            </div>

            {/* Stepper */}
            {renderStepper()}

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Step Content */}
            <div className="space-y-4">
              {step === 'INFO' && (
                <>
                  {/* Team (read-only) */}
                  <div>
                    <label className="block text-sm font-bold text-white/80 mb-2 uppercase tracking-wider">
                      Team
                    </label>
                    <input
                      type="text"
                      value={teamName}
                      disabled
                      className="w-full px-4 py-3 bg-neutral-900/50 border border-neutral-700/50 rounded-lg text-white/60 cursor-not-allowed"
                    />
                  </div>

                  {/* Name */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-white/80 mb-2 uppercase tracking-wider">
                        First Name
                      </label>
                      <input
                        type="text"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full px-4 py-3 bg-neutral-950/50 border border-[#57a4ff]/30 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-[#57a4ff] focus:ring-1 focus:ring-[#57a4ff] transition-all duration-300"
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-white/80 mb-2 uppercase tracking-wider">
                        Last Name
                      </label>
                      <input
                        type="text"
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full px-4 py-3 bg-neutral-950/50 border border-[#57a4ff]/30 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-[#57a4ff] focus:ring-1 focus:ring-[#57a4ff] transition-all duration-300"
                        placeholder="Doe"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-bold text-white/80 mb-2 uppercase tracking-wider">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 bg-neutral-950/50 border border-[#57a4ff]/30 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-[#57a4ff] focus:ring-1 focus:ring-[#57a4ff] transition-all duration-300"
                      placeholder="your.email@example.com"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-bold text-white/80 mb-2 uppercase tracking-wider">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-3 bg-neutral-950/50 border border-[#57a4ff]/30 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-[#57a4ff] focus:ring-1 focus:ring-[#57a4ff] transition-all duration-300"
                      placeholder="(555) 555-5555"
                    />
                  </div>

                  {/* Date of Birth */}
                  <div>
                    <label className="block text-sm font-bold text-white/80 mb-2 uppercase tracking-wider">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      required
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="w-full px-4 py-3 bg-neutral-950/50 border border-[#57a4ff]/30 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-[#57a4ff] focus:ring-1 focus:ring-[#57a4ff] transition-all duration-300"
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-sm font-bold text-white/80 mb-2 uppercase tracking-wider">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-3 bg-neutral-950/50 border border-[#57a4ff]/30 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-[#57a4ff] focus:ring-1 focus:ring-[#57a4ff] transition-all duration-300"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        <svg
                          className="w-5 h-5 text-neutral-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d={
                              showPassword
                                ? 'M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z'
                                : 'M13.875 18.825A2.25 2.25 0 0 1 10.5 21h-3a2.25 2.25 0 0 1-2.25-2.25V15m1.5 6.75h3a2.25 2.25 0 0 0 2.25-2.25V15m-1.5 0h-3a2.25 2.25 0 0 0-2.25 2.25V18'
                            }
                          />
                        </svg>
                      </button>
                    </div>
                    <p className="mt-1 text-xs text-neutral-500">
                      Must be at least 8 characters
                    </p>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-bold text-white/80 mb-2 uppercase tracking-wider">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-3 bg-neutral-950/50 border border-[#57a4ff]/30 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-[#57a4ff] focus:ring-1 focus:ring-[#57a4ff] transition-all duration-300"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        <svg
                          className="w-5 h-5 text-neutral-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d={
                              showConfirmPassword
                                ? 'M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z'
                                : 'M13.875 18.825A2.25 2.25 0 0 1 10.5 21h-3a2.25 2.25 0 0 1-2.25-2.25V15m1.5 6.75h3a2.25 2.25 0 0 0 2.25-2.25V15m-1.5 0h-3a2.25 2.25 0 0 0-2.25 2.25V18'
                            }
                          />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Address Section */}
                  <div className="pt-4 border-t border-white/10">
                    <h3 className="text-lg font-bold text-[#57a4ff] mb-4">
                      Address Info
                    </h3>

                    <div className="mb-4">
                      <label className="block text-sm font-bold text-white/80 mb-2 uppercase tracking-wider">
                        Address
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

                    <div className="mb-4">
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    </div>
                  </div>

                  <button
                    onClick={handleInfoNext}
                    disabled={!infoValid}
                    className="w-full px-8 py-4 bg-gradient-to-r from-[#57a4ff] via-[#6bb0ff] to-[#57a4ff] text-white font-black uppercase tracking-widest rounded-lg hover:shadow-[0_0_30px_rgba(87,164,255,0.6)] transition-all duration-300 relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="relative z-10">
                      Continue to Sport Info
                    </span>
                    {infoValid && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                    )}
                  </button>
                </>
              )}

              {step === 'SPORT' && (
                <>
                  {/* Team (read-only) */}
                  <div>
                    <label className="block text-sm font-bold text-white/80 mb-2 uppercase tracking-wider">
                      Team
                    </label>
                    <input
                      type="text"
                      value={teamName}
                      disabled
                      className="w-full px-4 py-3 bg-neutral-900/50 border border-neutral-700/50 rounded-lg text-white/60 cursor-not-allowed"
                    />
                  </div>

                  {/* Positions */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-white/80 mb-2 uppercase tracking-wider">
                        Position 1
                      </label>
                      <select
                        required
                        value={position1}
                        onChange={(e) => setPosition1(e.target.value)}
                        className="w-full px-4 py-3 bg-neutral-950/50 border border-[#57a4ff]/30 rounded-lg text-white focus:outline-none focus:border-[#57a4ff] focus:ring-1 focus:ring-[#57a4ff] transition-all duration-300"
                      >
                        <option value="">Select Position</option>
                        {POSITIONS.map((p) => (
                          <option key={p.value} value={p.value}>
                            {p.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-white/80 mb-2 uppercase tracking-wider">
                        Position 2
                      </label>
                      <select
                        required
                        value={position2}
                        onChange={(e) => setPosition2(e.target.value)}
                        className="w-full px-4 py-3 bg-neutral-950/50 border border-[#57a4ff]/30 rounded-lg text-white focus:outline-none focus:border-[#57a4ff] focus:ring-1 focus:ring-[#57a4ff] transition-all duration-300"
                      >
                        <option value="">Select Position</option>
                        {POSITIONS.map((p) => (
                          <option key={p.value} value={p.value}>
                            {p.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Jersey Number */}
                  <div>
                    <label className="block text-sm font-bold text-white/80 mb-2 uppercase tracking-wider">
                      Jersey #
                    </label>
                    <input
                      type="number"
                      required
                      value={jerseyNum}
                      onChange={(e) => setJerseyNum(e.target.value)}
                      className="w-full px-4 py-3 bg-neutral-950/50 border border-[#57a4ff]/30 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-[#57a4ff] focus:ring-1 focus:ring-[#57a4ff] transition-all duration-300"
                      placeholder="12"
                    />
                  </div>

                  {/* Graduation Year */}
                  <div>
                    <label className="block text-sm font-bold text-white/80 mb-2 uppercase tracking-wider">
                      Graduation Year
                    </label>
                    <input
                      type="number"
                      required
                      value={gradYear}
                      onChange={(e) => setGradYear(e.target.value)}
                      className="w-full px-4 py-3 bg-neutral-950/50 border border-[#57a4ff]/30 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-[#57a4ff] focus:ring-1 focus:ring-[#57a4ff] transition-all duration-300"
                      placeholder="2026"
                    />
                  </div>

                  {/* College Commitment */}
                  <div>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={committed}
                        onChange={(e) => setCommitted(e.target.checked)}
                        className="w-5 h-5 rounded border-[#57a4ff]/30 bg-neutral-950/50 text-[#57a4ff] focus:ring-[#57a4ff]"
                      />
                      <span className="text-sm font-bold text-white/80 uppercase tracking-wider">
                        Is this athlete committed to a college?
                      </span>
                    </label>

                    {committed && (
                      <div className="mt-4 space-y-4">
                        <SchoolInput
                          label="College Name"
                          value={selectedCollege}
                          onChange={(school) => {
                            setSelectedCollege(school);
                            setCollege(school?.name || '');
                          }}
                          placeholder="Search for a college..."
                        />
                        <div>
                          <label className="block text-sm font-bold text-white/80 mb-2 uppercase tracking-wider">
                            Commitment Date (Optional)
                          </label>
                          <input
                            type="date"
                            value={commitDate}
                            onChange={(e) => setCommitDate(e.target.value)}
                            className="w-full px-4 py-3 bg-neutral-950/50 border border-[#57a4ff]/30 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-[#57a4ff] focus:ring-1 focus:ring-[#57a4ff] transition-all duration-300"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleSportNext}
                    disabled={!sportValid}
                    className="w-full px-8 py-4 bg-gradient-to-r from-[#57a4ff] via-[#6bb0ff] to-[#57a4ff] text-white font-black uppercase tracking-widest rounded-lg hover:shadow-[0_0_30px_rgba(87,164,255,0.6)] transition-all duration-300 relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="relative z-10">Continue to Gear Info</span>
                    {sportValid && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                    )}
                  </button>
                </>
              )}

              {step === 'GEAR' && (
                <>
                  {/* Team (read-only) */}
                  <div>
                    <label className="block text-sm font-bold text-white/80 mb-2 uppercase tracking-wider">
                      Team
                    </label>
                    <input
                      type="text"
                      value={teamName}
                      disabled
                      className="w-full px-4 py-3 bg-neutral-900/50 border border-neutral-700/50 rounded-lg text-white/60 cursor-not-allowed"
                    />
                  </div>

                  {/* Gear Sizes */}
                  <div>
                    <label className="block text-sm font-bold text-white/80 mb-2 uppercase tracking-wider">
                      Jersey Top Size
                    </label>
                    <select
                      required
                      value={jerseySize}
                      onChange={(e) => setJerseySize(e.target.value)}
                      className="w-full px-4 py-3 bg-neutral-950/50 border border-[#57a4ff]/30 rounded-lg text-white focus:outline-none focus:border-[#57a4ff] focus:ring-1 focus:ring-[#57a4ff] transition-all duration-300"
                    >
                      <option value="">Select Size</option>
                      {JERSEY_SIZES.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-white/80 mb-2 uppercase tracking-wider">
                      Pant Size
                    </label>
                    <select
                      required
                      value={pantSize}
                      onChange={(e) => setPantSize(e.target.value)}
                      className="w-full px-4 py-3 bg-neutral-950/50 border border-[#57a4ff]/30 rounded-lg text-white focus:outline-none focus:border-[#57a4ff] focus:ring-1 focus:ring-[#57a4ff] transition-all duration-300"
                    >
                      <option value="">Select Size</option>
                      {PANT_SIZES.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-white/80 mb-2 uppercase tracking-wider">
                      Stirrup Size
                    </label>
                    <select
                      required
                      value={stirrupSize}
                      onChange={(e) => setStirrupSize(e.target.value)}
                      className="w-full px-4 py-3 bg-neutral-950/50 border border-[#57a4ff]/30 rounded-lg text-white focus:outline-none focus:border-[#57a4ff] focus:ring-1 focus:ring-[#57a4ff] transition-all duration-300"
                    >
                      <option value="">Select Size</option>
                      {STIRRUP_SIZES.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-white/80 mb-2 uppercase tracking-wider">
                      Short Size
                    </label>
                    <select
                      required
                      value={shortSize}
                      onChange={(e) => setShortSize(e.target.value)}
                      className="w-full px-4 py-3 bg-neutral-950/50 border border-[#57a4ff]/30 rounded-lg text-white focus:outline-none focus:border-[#57a4ff] focus:ring-1 focus:ring-[#57a4ff] transition-all duration-300"
                    >
                      <option value="">Select Size</option>
                      {SHORTS_SIZES.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-white/80 mb-2 uppercase tracking-wider">
                      Practice Shirt Size
                    </label>
                    <select
                      required
                      value={practiceShirtSize}
                      onChange={(e) => setPracticeShirtSize(e.target.value)}
                      className="w-full px-4 py-3 bg-neutral-950/50 border border-[#57a4ff]/30 rounded-lg text-white focus:outline-none focus:border-[#57a4ff] focus:ring-1 focus:ring-[#57a4ff] transition-all duration-300"
                    >
                      <option value="">Select Size</option>
                      {SHORTS_SIZES.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={!gearValid || loading}
                    className="w-full px-8 py-4 bg-gradient-to-r from-[#57a4ff] via-[#6bb0ff] to-[#57a4ff] text-white font-black uppercase tracking-widest rounded-lg hover:shadow-[0_0_30px_rgba(87,164,255,0.6)] transition-all duration-300 relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="relative z-10">
                      {loading ? 'Creating Account...' : 'Create Player'}
                    </span>
                    {gearValid && !loading && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                    )}
                  </button>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="mt-6">
              <p className="text-xs text-neutral-400 text-center">
                By signing up you accept the{' '}
                <a
                  href="/terms"
                  className="text-[#57a4ff] hover:text-[#6bb0ff] underline transition-colors duration-300"
                >
                  Terms of Service
                </a>{' '}
                and{' '}
                <a
                  href="/privacy"
                  className="text-[#57a4ff] hover:text-[#6bb0ff] underline transition-colors duration-300"
                >
                  Privacy Policy
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
