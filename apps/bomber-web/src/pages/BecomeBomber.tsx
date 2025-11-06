import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainNav from '@/components/layout/MainNav';
import SocialSidebar from '@/components/layout/SocialSidebar';
import { submitRecruitment } from '@/api/recruitment';

type FormData = {
  // Basic Info
  name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  role: 'player' | 'coach' | 'parent' | '';
  type: 'team' | 'individual' | '';

  // Team Info
  teamName: string;
  headCoach: string;
  teamNotes: string;
  ageGroup: string;

  // Individual Info
  mostRecentTeam: string;
  yearsExperience: string;
  primaryPosition: string;
  individualNotes: string;
  playerAgeGroup: string;
};

export default function BecomeBomber() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    city: '',
    state: '',
    role: '',
    type: '',
    teamName: '',
    headCoach: '',
    teamNotes: '',
    ageGroup: '',
    mostRecentTeam: '',
    yearsExperience: '',
    primaryPosition: '',
    individualNotes: '',
    playerAgeGroup: '',
  });

  const ageGroups = ['8U', '10U', '12U', '14U', '16U', '18U'];

  const states = [
    'AL',
    'AK',
    'AZ',
    'AR',
    'CA',
    'CO',
    'CT',
    'DE',
    'FL',
    'GA',
    'HI',
    'ID',
    'IL',
    'IN',
    'IA',
    'KS',
    'KY',
    'LA',
    'ME',
    'MD',
    'MA',
    'MI',
    'MN',
    'MS',
    'MO',
    'MT',
    'NE',
    'NV',
    'NH',
    'NJ',
    'NM',
    'NY',
    'NC',
    'ND',
    'OH',
    'OK',
    'OR',
    'PA',
    'RI',
    'SC',
    'SD',
    'TN',
    'TX',
    'UT',
    'VT',
    'VA',
    'WA',
    'WV',
    'WI',
    'WY',
  ];

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate that role is set (TypeScript guard)
    if (!formData.role || !formData.type) {
      alert('Please complete all required fields.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Type assertion is safe here because we've validated above
      await submitRecruitment(formData as any);

      // Show success message
      alert(
        'Thank you for your interest! We will contact you soon. A confirmation email has been sent to your email address.'
      );

      // Navigate to home page
      navigate('/');
    } catch (error) {
      console.error('Error submitting form:', error);
      alert(
        'There was an error submitting your application. Please try again or contact us directly at bo@bombersfastpitch.net'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { title: 'Welcome', description: 'Get started' },
    { title: 'Basic Info', description: 'Tell us about yourself' },
    { title: 'Team Type', description: 'Team or Individual' },
    { title: 'Details', description: 'Additional information' },
    { title: 'Review', description: 'Confirm & Submit' },
  ];

  const canProceed = () => {
    if (currentStep === 1) {
      return (
        formData.name &&
        formData.email &&
        formData.phone &&
        formData.city &&
        formData.state &&
        formData.role
      );
    }
    if (currentStep === 2) {
      return formData.type !== '';
    }
    if (currentStep === 3) {
      if (formData.type === 'team') {
        return formData.teamName && formData.headCoach && formData.ageGroup;
      }
      if (formData.type === 'individual') {
        return (
          formData.yearsExperience &&
          formData.primaryPosition &&
          formData.playerAgeGroup
        );
      }
    }
    return true;
  };

  return (
    <div className="relative bg-neutral-950 min-h-screen overflow-x-hidden">
      <MainNav />
      <SocialSidebar />

      <main className="relative z-20 pt-32 pb-20">
        <div className="mx-auto max-w-4xl px-4 md:px-6">
          {/* Header */}
          <div className="mb-12 text-center">
            <div className="inline-flex items-center gap-2 mb-4 rounded-full bg-gradient-to-r from-[#57a4ff]/20 to-[#3b8aff]/20 px-4 py-1.5 backdrop-blur-sm border border-[#57a4ff]/30">
              <div className="h-1.5 w-1.5 rounded-full bg-[#57a4ff] animate-pulse" />
              <span className="text-[10px] font-black tracking-widest text-[#57a4ff] uppercase">
                Join The Team
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black mb-4">
              <span className="bg-gradient-to-br from-white via-neutral-200 to-neutral-400 bg-clip-text text-transparent drop-shadow-2xl">
                BECOME A
              </span>
              <br />
              <span className="bg-gradient-to-r from-[#57a4ff] via-[#6bb0ff] to-[#57a4ff] bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(87,164,255,0.5)]">
                BOMBER
              </span>
            </h1>
            <p className="text-neutral-400 text-lg">
              Join one of the most successful fastpitch organizations in the
              country
            </p>
          </div>

          {/* Stepper */}
          <div className="mb-12">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={index} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm transition-all duration-300 ${
                        index <= currentStep
                          ? 'bg-gradient-to-r from-[#57a4ff] to-[#3b8aff] text-white shadow-[0_0_20px_rgba(87,164,255,0.5)]'
                          : 'bg-neutral-800/50 text-neutral-500'
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div className="mt-2 text-center hidden md:block">
                      <div
                        className={`text-xs font-bold ${
                          index <= currentStep
                            ? 'text-white'
                            : 'text-neutral-500'
                        }`}
                      >
                        {step.title}
                      </div>
                      <div className="text-[10px] text-neutral-600">
                        {step.description}
                      </div>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`h-0.5 flex-1 mx-2 transition-all duration-300 ${
                        index < currentStep
                          ? 'bg-gradient-to-r from-[#57a4ff] to-[#3b8aff]'
                          : 'bg-neutral-800'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Form Content */}
          <div className="relative bg-gradient-to-br from-neutral-900/50 to-neutral-950/50 backdrop-blur-sm rounded-2xl border border-[#57a4ff]/20 p-8 shadow-2xl">
            <form onSubmit={handleSubmit}>
              {/* Step 0: Welcome */}
              {currentStep === 0 && (
                <div className="text-center py-12">
                  <div className="mb-6">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-[#57a4ff]/20 to-[#3b8aff]/20 flex items-center justify-center border border-[#57a4ff]/30">
                      <svg
                        className="w-10 h-10 text-[#57a4ff]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-black text-white mb-4">
                      Interested in Joining the Bombers?
                    </h2>
                    <p className="text-neutral-400 max-w-2xl mx-auto">
                      We're excited to learn more about you! This quick form
                      will help us understand your experience and find the
                      perfect fit for you or your team.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="px-8 py-4 bg-gradient-to-r from-[#57a4ff] via-[#6bb0ff] to-[#57a4ff] text-white font-black uppercase tracking-widest rounded-lg hover:shadow-[0_0_30px_rgba(87,164,255,0.6)] transition-all duration-300"
                  >
                    Get Started
                  </button>
                </div>
              )}

              {/* Step 1: Basic Info */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-black text-white mb-6">
                    Basic Information
                  </h2>

                  <div>
                    <label className="block text-sm font-bold text-white/80 mb-2 uppercase tracking-wider">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-neutral-950/50 border border-[#57a4ff]/30 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-[#57a4ff] focus:ring-1 focus:ring-[#57a4ff] transition-all duration-300"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-white/80 mb-2 uppercase tracking-wider">
                        Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-neutral-950/50 border border-[#57a4ff]/30 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-[#57a4ff] focus:ring-1 focus:ring-[#57a4ff] transition-all duration-300"
                        placeholder="your.email@example.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-white/80 mb-2 uppercase tracking-wider">
                        Phone *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-neutral-950/50 border border-[#57a4ff]/30 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-[#57a4ff] focus:ring-1 focus:ring-[#57a4ff] transition-all duration-300"
                        placeholder="(555) 123-4567"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-white/80 mb-2 uppercase tracking-wider">
                        City *
                      </label>
                      <input
                        type="text"
                        name="city"
                        required
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-neutral-950/50 border border-[#57a4ff]/30 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-[#57a4ff] focus:ring-1 focus:ring-[#57a4ff] transition-all duration-300"
                        placeholder="Your city"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-white/80 mb-2 uppercase tracking-wider">
                        State *
                      </label>
                      <select
                        name="state"
                        required
                        value={formData.state}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-neutral-950/50 border border-[#57a4ff]/30 rounded-lg text-white focus:outline-none focus:border-[#57a4ff] focus:ring-1 focus:ring-[#57a4ff] transition-all duration-300"
                      >
                        <option value="">Select state</option>
                        {states.map((state) => (
                          <option key={state} value={state}>
                            {state}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-white/80 mb-2 uppercase tracking-wider">
                      I am a *
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {['player', 'coach', 'parent'].map((roleOption) => (
                        <button
                          key={roleOption}
                          type="button"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              role: roleOption as 'player' | 'coach' | 'parent',
                            })
                          }
                          className={`px-6 py-4 rounded-lg font-bold uppercase tracking-wider transition-all duration-300 ${
                            formData.role === roleOption
                              ? 'bg-gradient-to-r from-[#57a4ff] to-[#3b8aff] text-white shadow-[0_0_20px_rgba(87,164,255,0.5)]'
                              : 'bg-neutral-800/50 text-neutral-400 hover:bg-neutral-800'
                          }`}
                        >
                          {roleOption}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Team Type */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-black text-white mb-6">
                    How are you joining?
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, type: 'team' })}
                      className={`p-8 rounded-xl border-2 transition-all duration-300 text-left ${
                        formData.type === 'team'
                          ? 'border-[#57a4ff] bg-gradient-to-br from-[#57a4ff]/20 to-[#3b8aff]/20 shadow-[0_0_30px_rgba(87,164,255,0.3)]'
                          : 'border-neutral-700 hover:border-[#57a4ff]/50'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-full bg-[#57a4ff]/20 flex items-center justify-center mb-4">
                        <svg
                          className="w-6 h-6 text-[#57a4ff]"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                      </div>
                      <h3 className="text-xl font-black text-white mb-2">
                        As a Team
                      </h3>
                      <p className="text-neutral-400 text-sm">
                        An existing team looking to join the Bombers
                        organization
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, type: 'individual' })
                      }
                      className={`p-8 rounded-xl border-2 transition-all duration-300 text-left ${
                        formData.type === 'individual'
                          ? 'border-[#57a4ff] bg-gradient-to-br from-[#57a4ff]/20 to-[#3b8aff]/20 shadow-[0_0_30px_rgba(87,164,255,0.3)]'
                          : 'border-neutral-700 hover:border-[#57a4ff]/50'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-full bg-[#57a4ff]/20 flex items-center justify-center mb-4">
                        <svg
                          className="w-6 h-6 text-[#57a4ff]"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      </div>
                      <h3 className="text-xl font-black text-white mb-2">
                        As an Individual
                      </h3>
                      <p className="text-neutral-400 text-sm">
                        A player looking to tryout and join an existing Bombers
                        team
                      </p>
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Details */}
              {currentStep === 3 && formData.type === 'team' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-black text-white mb-6">
                    Team Information
                  </h2>

                  <div>
                    <label className="block text-sm font-bold text-white/80 mb-2 uppercase tracking-wider">
                      Current Team Name *
                    </label>
                    <input
                      type="text"
                      name="teamName"
                      required
                      value={formData.teamName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-neutral-950/50 border border-[#57a4ff]/30 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-[#57a4ff] focus:ring-1 focus:ring-[#57a4ff] transition-all duration-300"
                      placeholder="Enter your team name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-white/80 mb-2 uppercase tracking-wider">
                      Head Coach *
                    </label>
                    <input
                      type="text"
                      name="headCoach"
                      required
                      value={formData.headCoach}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-neutral-950/50 border border-[#57a4ff]/30 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-[#57a4ff] focus:ring-1 focus:ring-[#57a4ff] transition-all duration-300"
                      placeholder="Head coach name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-white/80 mb-2 uppercase tracking-wider">
                      Age Group *
                    </label>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                      {ageGroups.map((age) => (
                        <button
                          key={age}
                          type="button"
                          onClick={() =>
                            setFormData({ ...formData, ageGroup: age })
                          }
                          className={`px-4 py-3 rounded-lg font-bold uppercase tracking-wider transition-all duration-300 ${
                            formData.ageGroup === age
                              ? 'bg-gradient-to-r from-[#57a4ff] to-[#3b8aff] text-white shadow-[0_0_20px_rgba(87,164,255,0.5)]'
                              : 'bg-neutral-800/50 text-neutral-400 hover:bg-neutral-800'
                          }`}
                        >
                          {age}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-white/80 mb-2 uppercase tracking-wider">
                      Additional Notes
                    </label>
                    <textarea
                      name="teamNotes"
                      value={formData.teamNotes}
                      onChange={handleInputChange}
                      rows={6}
                      className="w-full px-4 py-3 bg-neutral-950/50 border border-[#57a4ff]/30 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-[#57a4ff] focus:ring-1 focus:ring-[#57a4ff] transition-all duration-300 resize-none"
                      placeholder="Tell us more about your team, achievements, goals, etc."
                    />
                  </div>
                </div>
              )}

              {currentStep === 3 && formData.type === 'individual' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-black text-white mb-6">
                    Player Information
                  </h2>

                  <div>
                    <label className="block text-sm font-bold text-white/80 mb-2 uppercase tracking-wider">
                      Current or Most Recent Travel Team
                    </label>
                    <input
                      type="text"
                      name="mostRecentTeam"
                      value={formData.mostRecentTeam}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-neutral-950/50 border border-[#57a4ff]/30 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-[#57a4ff] focus:ring-1 focus:ring-[#57a4ff] transition-all duration-300"
                      placeholder="Team name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-white/80 mb-2 uppercase tracking-wider">
                      Years of Experience *
                    </label>
                    <input
                      type="number"
                      name="yearsExperience"
                      required
                      min="0"
                      max="20"
                      value={formData.yearsExperience}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-neutral-950/50 border border-[#57a4ff]/30 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-[#57a4ff] focus:ring-1 focus:ring-[#57a4ff] transition-all duration-300"
                      placeholder="Years playing fastpitch"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-white/80 mb-2 uppercase tracking-wider">
                      Primary Position *
                    </label>
                    <select
                      name="primaryPosition"
                      required
                      value={formData.primaryPosition}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-neutral-950/50 border border-[#57a4ff]/30 rounded-lg text-white focus:outline-none focus:border-[#57a4ff] focus:ring-1 focus:ring-[#57a4ff] transition-all duration-300"
                    >
                      <option value="">Select position</option>
                      <option value="P">Pitcher</option>
                      <option value="C">Catcher</option>
                      <option value="1B">First Base</option>
                      <option value="2B">Second Base</option>
                      <option value="3B">Third Base</option>
                      <option value="SS">Shortstop</option>
                      <option value="OF">Outfield</option>
                      <option value="UTIL">Utility</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-white/80 mb-2 uppercase tracking-wider">
                      Age Group *
                    </label>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                      {ageGroups.map((age) => (
                        <button
                          key={age}
                          type="button"
                          onClick={() =>
                            setFormData({ ...formData, playerAgeGroup: age })
                          }
                          className={`px-4 py-3 rounded-lg font-bold uppercase tracking-wider transition-all duration-300 ${
                            formData.playerAgeGroup === age
                              ? 'bg-gradient-to-r from-[#57a4ff] to-[#3b8aff] text-white shadow-[0_0_20px_rgba(87,164,255,0.5)]'
                              : 'bg-neutral-800/50 text-neutral-400 hover:bg-neutral-800'
                          }`}
                        >
                          {age}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-white/80 mb-2 uppercase tracking-wider">
                      Additional Notes
                    </label>
                    <textarea
                      name="individualNotes"
                      value={formData.individualNotes}
                      onChange={handleInputChange}
                      rows={6}
                      className="w-full px-4 py-3 bg-neutral-950/50 border border-[#57a4ff]/30 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-[#57a4ff] focus:ring-1 focus:ring-[#57a4ff] transition-all duration-300 resize-none"
                      placeholder="Tell us about your achievements, goals, strengths, etc."
                    />
                  </div>
                </div>
              )}

              {/* Step 4: Review */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-black text-white mb-6">
                    Review Your Information
                  </h2>

                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-neutral-900/50 border border-[#57a4ff]/20">
                      <h3 className="text-sm font-bold text-[#57a4ff] uppercase tracking-wider mb-3">
                        Basic Information
                      </h3>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-neutral-500">Name:</span>{' '}
                          <span className="text-white">{formData.name}</span>
                        </div>
                        <div>
                          <span className="text-neutral-500">Email:</span>{' '}
                          <span className="text-white">{formData.email}</span>
                        </div>
                        <div>
                          <span className="text-neutral-500">Phone:</span>{' '}
                          <span className="text-white">{formData.phone}</span>
                        </div>
                        <div>
                          <span className="text-neutral-500">Location:</span>{' '}
                          <span className="text-white">
                            {formData.city}, {formData.state}
                          </span>
                        </div>
                        <div>
                          <span className="text-neutral-500">Role:</span>{' '}
                          <span className="text-white capitalize">
                            {formData.role}
                          </span>
                        </div>
                        <div>
                          <span className="text-neutral-500">Type:</span>{' '}
                          <span className="text-white capitalize">
                            {formData.type}
                          </span>
                        </div>
                      </div>
                    </div>

                    {formData.type === 'team' && (
                      <div className="p-4 rounded-lg bg-neutral-900/50 border border-[#57a4ff]/20">
                        <h3 className="text-sm font-bold text-[#57a4ff] uppercase tracking-wider mb-3">
                          Team Information
                        </h3>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="text-neutral-500">Team Name:</span>{' '}
                            <span className="text-white">
                              {formData.teamName}
                            </span>
                          </div>
                          <div>
                            <span className="text-neutral-500">
                              Head Coach:
                            </span>{' '}
                            <span className="text-white">
                              {formData.headCoach}
                            </span>
                          </div>
                          <div>
                            <span className="text-neutral-500">Age Group:</span>{' '}
                            <span className="text-white">
                              {formData.ageGroup}
                            </span>
                          </div>
                          {formData.teamNotes && (
                            <div>
                              <span className="text-neutral-500">Notes:</span>{' '}
                              <span className="text-white">
                                {formData.teamNotes}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {formData.type === 'individual' && (
                      <div className="p-4 rounded-lg bg-neutral-900/50 border border-[#57a4ff]/20">
                        <h3 className="text-sm font-bold text-[#57a4ff] uppercase tracking-wider mb-3">
                          Player Information
                        </h3>
                        <div className="space-y-2 text-sm">
                          {formData.mostRecentTeam && (
                            <div>
                              <span className="text-neutral-500">
                                Recent Team:
                              </span>{' '}
                              <span className="text-white">
                                {formData.mostRecentTeam}
                              </span>
                            </div>
                          )}
                          <div>
                            <span className="text-neutral-500">
                              Experience:
                            </span>{' '}
                            <span className="text-white">
                              {formData.yearsExperience} years
                            </span>
                          </div>
                          <div>
                            <span className="text-neutral-500">Position:</span>{' '}
                            <span className="text-white">
                              {formData.primaryPosition}
                            </span>
                          </div>
                          <div>
                            <span className="text-neutral-500">Age Group:</span>{' '}
                            <span className="text-white">
                              {formData.playerAgeGroup}
                            </span>
                          </div>
                          {formData.individualNotes && (
                            <div>
                              <span className="text-neutral-500">Notes:</span>{' '}
                              <span className="text-white">
                                {formData.individualNotes}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full px-8 py-4 bg-gradient-to-r from-[#57a4ff] via-[#6bb0ff] to-[#57a4ff] text-white font-black uppercase tracking-widest rounded-lg hover:shadow-[0_0_30px_rgba(87,164,255,0.6)] transition-all duration-300 relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="relative z-10">
                      {isSubmitting ? 'Submitting...' : 'Submit Application'}
                    </span>
                    {!isSubmitting && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                    )}
                  </button>
                </div>
              )}

              {/* Navigation Buttons */}
              {currentStep > 0 && currentStep < 4 && (
                <div className="flex gap-4 mt-8">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(currentStep - 1)}
                    className="px-6 py-3 bg-neutral-800 text-white font-bold uppercase tracking-wider rounded-lg hover:bg-neutral-700 transition-all duration-300"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(currentStep + 1)}
                    disabled={!canProceed()}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-[#57a4ff] to-[#3b8aff] text-white font-bold uppercase tracking-wider rounded-lg hover:shadow-[0_0_20px_rgba(87,164,255,0.5)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
