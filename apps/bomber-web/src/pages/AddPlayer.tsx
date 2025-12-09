import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import MainNav from '@/components/layout/MainNav';
import SocialSidebar from '@/components/layout/SocialSidebar';
import { api } from '@/api/Client';
import { useAuth } from '@/contexts/AuthContext';
import SchoolInput from '@/components/ui/SchoolInput';
import type { FlatSchool } from '@/utils/school';

// Enum options - same as PlayerSignup
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

type Step =
  | 'START'
  | 'TEAM'
  | 'CHOICE_14U'
  | 'INFO'
  | 'SPORT'
  | 'GEAR'
  | 'SUMMARY';
type Selection14U = 'parent' | 'self' | null;

interface FormState {
  teamCode?: string;
  teamName?: string | null;
  ageDivision?: string | null;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  dob?: string;
  password?: string;
  confirmPass?: string;
  sameAsParent?: boolean;
  address?: string;
  state?: string;
  city?: string;
  zip?: string;
  pos1?: string;
  pos2?: string;
  jerseyNum?: string;
  gradYear?: string;
  committed?: boolean;
  college?: string;
  commitId?: string;
  jerseySize?: string | null;
  pantSize?: string | null;
  stirrupSize?: string | null;
  shortSize?: string | null;
  practiceShirtSize?: string | null;
  isTrusted?: boolean;
}

export default function AddPlayer() {
  const navigate = useNavigate();
  const { user, checkAuth, loading } = useAuth(); // Add loading to destructure
  const [step, setStep] = useState<Step>('START');
  const [form, setForm] = useState<FormState>({ teamCode: '' });
  const [players, setPlayers] = useState<FormState[]>([]);
  const [selection, setSelection] = useState<Selection14U>(null);
  const [isLinkFlow, setIsLinkFlow] = useState(false);
  const [isParentFlow, setIsParentFlow] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // College state
  const [committed, setCommitted] = useState(false);
  const [collegeSchool, setCollegeSchool] = useState<FlatSchool | null>(null);
  const [commitDate, setCommitDate] = useState('');

  // Team code lookup
  const [teamCode, setTeamCode] = useState('');
  const [teamData, setTeamData] = useState<any>(null);
  const [teamLoading, setTeamLoading] = useState(false);
  const [teamError, setTeamError] = useState('');

  // Get parent ID from user context or fetch directly
  const [parentId, setParentId] = useState<string | undefined>(undefined);

  useEffect(() => {
    // Wait for auth to finish loading before checking parentId
    if (loading) return;

    // Check if we're in the signup flow
    const inSignupFlow = sessionStorage.getItem('inAddPlayerSignup') === 'true';

    // If we're in signup flow, allow access (parentId will be available after auth loads)
    if (inSignupFlow) {
      // Fetch parent ID from API if user is loaded
      if (user?.id) {
        api
          .get('/auth/me')
          .then((response) => {
            const parentIdFromApi = response.data?.parent?.id;
            if (parentIdFromApi) {
              setParentId(parentIdFromApi);
            }
          })
          .catch(() => {
            // If no parent, that's okay during signup flow
          });
      }
      return;
    }

    // If not in signup flow, fetch parent ID and check
    if (user?.id) {
      api
        .get('/auth/me')
        .then((response) => {
          const parentIdFromApi = response.data?.parent?.id;
          if (parentIdFromApi) {
            setParentId(parentIdFromApi);
          } else {
            navigate('/');
          }
        })
        .catch(() => {
          navigate('/');
        });
    } else if (!user) {
      navigate('/');
    }
  }, [user, navigate, loading]);

  useEffect(() => {
    if (teamCode.length === 5) {
      fetchTeam();
    } else {
      setTeamData(null);
      setTeamError('');
    }
  }, [teamCode]);

  const fetchTeam = async () => {
    setTeamLoading(true);
    setTeamError('');
    try {
      const response = await api.get(`/teams/code/${teamCode.toUpperCase()}`);
      setTeamData(response.data);
      setForm((f) => ({
        ...f,
        teamCode: teamCode.toUpperCase(),
        teamName: response.data.name,
        ageDivision: response.data.ageGroup,
      }));
      // Auto-advance to next step
      const nextStep = nextAfterTeam(response.data.ageGroup);
      if (nextStep !== 'TEAM') {
        setStep(nextStep);
      }
    } catch (err: any) {
      setTeamData(null);
      if (err.response?.status === 404) {
        setTeamError('Team not found. Please check your team code.');
      } else {
        setTeamError('Failed to fetch team. Please try again.');
      }
    } finally {
      setTeamLoading(false);
    }
  };

  const nextAfterTeam = (ageDiv?: string | null): Step => {
    if (!ageDiv) return 'TEAM';
    if (ageDiv === 'U14') return 'CHOICE_14U';
    if (ageDiv === 'U16' || ageDiv === 'U18') return 'INFO';
    return 'INFO';
  };

  const isLinkFlowOrUpper =
    form.ageDivision === 'U16' || form.ageDivision === 'U18' || isLinkFlow;

  const validPass = (p?: string, c?: string) =>
    !!p && !!c && p.length >= 8 && p === c;

  const isTrustedByAge = (age?: string, self14?: boolean) =>
    age === 'U16' || age === 'U18' || !!self14;

  const canContinue = () => {
    if (step === 'TEAM') return !!form.teamName;
    if (step === 'CHOICE_14U')
      return selection === 'parent' || selection === 'self';
    if (step === 'INFO') {
      const needEmailPass = isLinkFlowOrUpper;
      if (needEmailPass) {
        return (
          !!form.firstName &&
          !!form.lastName &&
          !!form.email &&
          validPass(form.password, form.confirmPass)
        );
      }
      return (
        !!form.firstName &&
        !!form.lastName &&
        !!form.dob &&
        validPass(form.password, form.confirmPass)
      );
    }
    if (step === 'SPORT') {
      const base =
        !!form.pos1 && !!form.pos2 && !!form.jerseyNum && !!form.gradYear;
      return committed ? base && !!collegeSchool : base;
    }
    if (step === 'GEAR') {
      return (
        !!form.jerseySize &&
        !!form.pantSize &&
        !!form.stirrupSize &&
        !!form.shortSize &&
        !!form.practiceShirtSize
      );
    }
    return true;
  };

  const handleBack = () => {
    if (step === 'INFO') {
      if (form.ageDivision === 'U14') {
        setStep('CHOICE_14U');
        return;
      }
      setStep('TEAM');
      return;
    }
    if (step === 'SPORT') {
      setStep('INFO');
      return;
    }
    if (step === 'GEAR') {
      setStep('SPORT');
      return;
    }
    if (step === 'CHOICE_14U') {
      setSelection(null);
      setIsLinkFlow(false);
      setIsParentFlow(false);
      setStep('TEAM');
      return;
    }
    if (step === 'TEAM') {
      setStep('START');
      return;
    }
    if (step === 'SUMMARY') {
      setStep('GEAR');
      return;
    }
    navigate('/');
  };

  const goNext = async () => {
    if (!canContinue()) return;

    if (step === 'TEAM') {
      setStep(nextAfterTeam(form.ageDivision || undefined));
      return;
    }

    if (step === 'CHOICE_14U') {
      setIsLinkFlow(selection === 'self');
      setIsParentFlow(selection === 'parent');
      setStep('INFO');
      return;
    }

    if (step === 'INFO') {
      if (isLinkFlowOrUpper) {
        // Self-link flow - create with defaults
        const self14 = form.ageDivision === 'U14' && isLinkFlow;
        const athlete: FormState = {
          ...form,
          teamCode: form.teamCode || '',
          teamName: form.teamName || '',
          ageDivision: form.ageDivision || '',
          firstName: form.firstName || 'TBD',
          lastName: form.lastName || 'Player',
          email: form.email!,
          phone: form.phone || '0000000000',
          dob: form.dob || '2005-01-01',
          password: form.password!,
          confirmPass: form.confirmPass!,
          address: form.address || '123 Main St',
          city: form.city || 'Anytown',
          state: form.state || 'Texas',
          zip: form.zip || '00000',
          pos1: form.pos1 || 'PITCHER',
          pos2: form.pos2 || 'FIRST_BASE',
          jerseyNum: form.jerseyNum || '0',
          gradYear: form.gradYear || `${new Date().getFullYear()}`,
          committed: form.committed ?? false,
          college: form.college || '',
          jerseySize: form.jerseySize || 'AM',
          pantSize: form.pantSize || 'SIZE_20',
          stirrupSize: form.stirrupSize || 'ADULT',
          shortSize: form.shortSize || 'ASM',
          practiceShirtSize: form.practiceShirtSize || 'ASM',
          isTrusted: isTrustedByAge(form.ageDivision ?? undefined, self14),
        };

        setPlayers((prev) =>
          editingIndex !== null
            ? prev.map((p, i) => (i === editingIndex ? athlete : p))
            : [...prev, athlete]
        );

        setForm({
          teamCode: form.teamCode,
          teamName: form.teamName ?? null,
          ageDivision: form.ageDivision ?? null,
        });
        setSelection(null);
        setIsLinkFlow(false);
        setIsParentFlow(false);
        setEditingIndex(null);
        setCollegeSchool(null);
        setStep('SUMMARY');
        return;
      }

      setStep('SPORT');
      return;
    }

    if (step === 'SPORT') {
      if (committed && collegeSchool) {
        try {
          const payload = {
            name: collegeSchool.name,
            state: collegeSchool.state ?? '',
            city: collegeSchool.city ?? '',
            imageUrl: collegeSchool.imageUrl ?? '',
            committedDate: commitDate ? new Date(commitDate) : new Date(),
          };
          const { data: created } = await api.post('/commits', payload);
          setForm((f) => ({
            ...f,
            committed: true,
            college: collegeSchool.name,
            commitId: created.id,
          }));
        } catch (err) {
          console.error('Commit create error:', err);
        }
      }
      setStep('GEAR');
      return;
    }

    if (step === 'GEAR') {
      const self14 = form.ageDivision === 'U14' && isLinkFlow;
      const parent14 = form.ageDivision === 'U14' && isParentFlow;

      const athlete: FormState = {
        ...form,
        isTrusted: isTrustedByAge(form.ageDivision ?? undefined, self14),
        ...((form.ageDivision === 'U8' ||
          form.ageDivision === 'U10' ||
          form.ageDivision === 'U12' ||
          parent14) && {
          email:
            form.email ||
            `${form.teamCode?.toLowerCase()}+${Math.random()
              .toString(36)
              .slice(2, 6)}@bomber.app`,
          phone: form.phone || '1111111111',
        }),
      };

      setPlayers((prev) =>
        editingIndex !== null
          ? prev.map((p, i) => (i === editingIndex ? athlete : p))
          : [...prev, athlete]
      );

      setForm({
        teamCode: form.teamCode,
        teamName: form.teamName ?? null,
        ageDivision: form.ageDivision ?? null,
      });
      setSelection(null);
      setIsLinkFlow(false);
      setIsParentFlow(false);
      setEditingIndex(null);
      setCollegeSchool(null);
      setStep('SUMMARY');
      return;
    }
  };

  const handleAddAnother = () => {
    setStep(nextAfterTeam(form.ageDivision));
  };

  const handleDeletePlayer = (idx: number) => {
    setPlayers((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleEditPlayer = (ath: FormState, idx: number) => {
    setForm({ ...ath });
    const { ageDivision, isTrusted } = ath;
    if (
      isTrusted ||
      ageDivision === 'U14' ||
      ageDivision === 'U16' ||
      ageDivision === 'U18'
    ) {
      setIsLinkFlow(
        isTrusted || ageDivision === 'U16' || ageDivision === 'U18'
      );
      setIsParentFlow(
        !(isTrusted || ageDivision === 'U16' || ageDivision === 'U18')
      );
    } else {
      setIsLinkFlow(false);
      setIsParentFlow(true);
    }
    setSelection(null);
    setEditingIndex(idx);
    setStep('INFO');
  };

  const handleSubmitAll = async () => {
    try {
      // Get parent address ID and parent ID from API
      const { data: userData } = await api.get('/auth/me');
      const parentAddrId = userData.parent?.address?.id;
      const parentIdFromApi = userData.parent?.id;

      if (!parentIdFromApi) {
        alert('Parent ID missing. Please try again.');
        return;
      }

      for (const ath of players) {
        let athleteAddrId: string | undefined;

        if (ath.sameAsParent && parentAddrId) {
          athleteAddrId = parentAddrId;
        } else if (ath.address && ath.city && ath.state && ath.zip) {
          const { data: newAddr } = await api.post('/users/address', {
            address1: ath.address,
            city: ath.city,
            state: ath.state,
            zip: ath.zip,
          });
          athleteAddrId = newAddr.id;
        }

        const playerPayload = {
          email: ath.email,
          password: ath.password ?? ath.confirmPass,
          fname: ath.firstName,
          lname: ath.lastName,
          role: 'PLAYER',
          phone: ath.phone,
          // Parent ID should be at top level, not inside player
          parent: { id: parentIdFromApi },
          player: {
            pos1: ath.pos1!,
            pos2: ath.pos2!,
            jerseyNum: ath.jerseyNum!,
            gradYear: ath.gradYear!,
            ageGroup: ath.ageDivision!,
            jerseySize: ath.jerseySize || 'AM',
            pantSize: ath.pantSize || 'AM',
            stirrupSize: ath.stirrupSize || 'ADULT',
            shortSize: ath.shortSize || 'AS',
            practiceShortSize: ath.practiceShirtSize || 'AS',
            isTrusted: ath.isTrusted,
            // Only include college if it's not empty
            ...(ath.college && ath.college.trim() !== ''
              ? { college: ath.college }
              : {}),
            ...(ath.commitId
              ? { commit: { connect: { id: ath.commitId } } }
              : {}),
            team: { connect: { teamCode: ath.teamCode! } },
            // Address should be inside player, not at top level
            ...(athleteAddrId
              ? { address: { connect: { id: athleteAddrId } } }
              : {}),
          },
        };

        await api.post('/auth/signup', playerPayload);
      }

      await checkAuth();
      // Clear the signup flow flag
      sessionStorage.removeItem('inAddPlayerSignup');
      navigate('/');
    } catch (err: any) {
      console.error('Submit all error:', err);
      alert(
        err.response?.data?.message ||
          'Failed to create players. Please try again.'
      );
    }
  };

  const renderStart = () => (
    <div className="space-y-6">
      <h2 className="text-2xl md:text-3xl font-black mb-2 text-white text-center">
        Add a Player to Your Account
      </h2>
      <p className="text-neutral-400 text-sm text-center mb-4">
        Choose one of the options below:
      </p>
      <div className="space-y-3 text-neutral-300 text-sm">
        <p>
          • <span className="font-bold">Create a new player profile now</span> –
          for players not already in the app.
        </p>
        <p>
          • <span className="font-bold">Skip for now</span> – you can still add
          players later from inside the app, either by{' '}
          <span className="font-bold">creating a new profile</span> or{' '}
          <span className="font-bold">linking an existing one</span>.
        </p>
        <p className="text-xs text-neutral-500 mt-4">
          To add later: App Settings → Players
        </p>
        <p className="text-xs text-neutral-500 mt-4">
          (must have app to create players after signup. IOS only. )
        </p>
      </div>
      <button
        onClick={() => setStep('TEAM')}
        className="w-full px-8 py-4 bg-gradient-to-r from-[#57a4ff] via-[#6bb0ff] to-[#57a4ff] text-white font-black uppercase tracking-widest rounded-lg hover:shadow-[0_0_30px_rgba(87,164,255,0.6)] transition-all duration-300"
      >
        Create a New Player Now
      </button>
      <button
        onClick={() => {
          sessionStorage.removeItem('inAddPlayerSignup');
          navigate('/');
        }}
        className="w-full px-8 py-4 bg-neutral-800/50 border border-white/30 text-white font-semibold uppercase tracking-widest rounded-lg hover:bg-neutral-800 transition-all duration-300"
      >
        I'll Add a Player Later
      </button>
    </div>
  );

  const renderTeam = () => (
    <div className="space-y-6">
      <h2 className="text-2xl md:text-3xl font-black mb-2 text-white text-center">
        Step 1: Enter Team Code
      </h2>
      <p className="text-neutral-400 text-sm text-center">
        Start by entering the 5-character code you received in your Bomber
        Welcome email for your player.
      </p>
      <p className="text-neutral-500 text-xs text-center">
        Bomber codes are unique make sure the team code matches for your players
        team.
      </p>

      <div>
        <label className="block text-sm font-bold text-white/80 mb-2 uppercase tracking-wider">
          Team Code
        </label>
        <div className="flex gap-2 justify-center">
          {[0, 1, 2, 3, 4].map((index) => (
            <input
              key={index}
              type="text"
              maxLength={1}
              value={teamCode[index] || ''}
              onChange={(e) => {
                const value = e.target.value
                  .toUpperCase()
                  .replace(/[^A-Z0-9]/g, '');
                if (value) {
                  const newCode =
                    teamCode.slice(0, index) +
                    value +
                    teamCode.slice(index + 1);
                  setTeamCode(newCode.slice(0, 5));
                  if (index < 4 && value) {
                    const nextInput = document.getElementById(
                      `code-${index + 1}`
                    );
                    nextInput?.focus();
                  }
                } else {
                  setTeamCode(
                    teamCode.slice(0, index) + teamCode.slice(index + 1)
                  );
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Backspace' && !teamCode[index] && index > 0) {
                  const prevInput = document.getElementById(
                    `code-${index - 1}`
                  );
                  prevInput?.focus();
                }
              }}
              id={`code-${index}`}
              className="w-14 h-14 text-center text-2xl font-bold bg-neutral-950/50 border-2 border-[#57a4ff]/30 rounded-lg text-white focus:outline-none focus:border-[#57a4ff] focus:ring-1 focus:ring-[#57a4ff] transition-all duration-300"
            />
          ))}
        </div>
        {teamLoading && (
          <p className="mt-2 text-sm text-neutral-400 text-center">
            Validating...
          </p>
        )}
        {teamError && (
          <p className="mt-2 text-sm text-red-400 text-center">{teamError}</p>
        )}
        {teamData && !teamError && (
          <div className="mt-4 p-4 bg-[#57a4ff]/20 border border-[#57a4ff]/30 rounded-lg text-center">
            <p className="text-xs text-white/60 uppercase mb-2">
              Selected Team
            </p>
            <p className="text-xl font-bold text-white">{teamData.name}</p>
            {teamData.ageGroup && (
              <p className="text-sm text-white/70 mt-1">
                Age Group: {teamData.ageGroup}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const renderChoice14U = () => (
    <div className="space-y-6">
      <h2 className="text-2xl md:text-3xl font-black mb-2 text-white text-center">
        14U Team Choice
      </h2>
      <p className="text-neutral-400 text-sm text-center mb-6">
        14U teams need a choice—who fills out player info?
      </p>
      <div className="space-y-4">
        <button
          onClick={() => setSelection('parent')}
          className={`w-full p-6 rounded-lg border-2 transition-all duration-300 text-left ${
            selection === 'parent'
              ? 'border-[#57a4ff] bg-[#57a4ff]/20'
              : 'border-white/30 bg-white/5 hover:border-white/50'
          }`}
        >
          <p className="text-white font-semibold">I (Parent) fill it out</p>
        </button>
        <button
          onClick={() => setSelection('self')}
          className={`w-full p-6 rounded-lg border-2 transition-all duration-300 text-left ${
            selection === 'self'
              ? 'border-[#57a4ff] bg-[#57a4ff]/20'
              : 'border-white/30 bg-white/5 hover:border-white/50'
          }`}
        >
          <p className="text-white font-semibold">Athlete fills out</p>
        </button>
      </div>
    </div>
  );

  const renderInfo = () => (
    <div className="space-y-4">
      {!isLinkFlowOrUpper && (
        <p className="text-neutral-400 text-sm text-center mb-4">Step 1 of 3</p>
      )}

      {isLinkFlowOrUpper ? (
        <>
          <h2 className="text-2xl md:text-3xl font-black mb-2 text-white text-center">
            Self-Link Players
          </h2>
          <p className="text-neutral-400 text-sm text-center mb-6">
            Your player is on 16U/18U or a trusted 14U team and should download
            the app to finish setup. You can create their account, so all they
            need to do is login.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-white/80 mb-2 uppercase tracking-wider">
                First Name
              </label>
              <input
                type="text"
                value={form.firstName || ''}
                onChange={(e) =>
                  setForm({ ...form, firstName: e.target.value })
                }
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
                value={form.lastName || ''}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                className="w-full px-4 py-3 bg-neutral-950/50 border border-[#57a4ff]/30 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-[#57a4ff] focus:ring-1 focus:ring-[#57a4ff] transition-all duration-300"
                placeholder="Doe"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-white/80 mb-2 uppercase tracking-wider">
              Email
            </label>
            <input
              type="email"
              value={form.email || ''}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-4 py-3 bg-neutral-950/50 border border-[#57a4ff]/30 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-[#57a4ff] focus:ring-1 focus:ring-[#57a4ff] transition-all duration-300"
              placeholder="player@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-white/80 mb-2 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={form.password || ''}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-4 py-3 pr-12 bg-neutral-950/50 border border-[#57a4ff]/30 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-[#57a4ff] focus:ring-1 focus:ring-[#57a4ff] transition-all duration-300"
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
                        ? 'M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21'
                        : 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
                    }
                  />
                </svg>
              </button>
            </div>
            <p className="mt-1 text-xs text-neutral-500">
              Must be at least 8 characters
            </p>
          </div>

          <div>
            <label className="block text-sm font-bold text-white/80 mb-2 uppercase tracking-wider">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={form.confirmPass || ''}
                onChange={(e) =>
                  setForm({ ...form, confirmPass: e.target.value })
                }
                className="w-full px-4 py-3 pr-12 bg-neutral-950/50 border border-[#57a4ff]/30 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-[#57a4ff] focus:ring-1 focus:ring-[#57a4ff] transition-all duration-300"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                        ? 'M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21'
                        : 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
                    }
                  />
                </svg>
              </button>
            </div>
          </div>
        </>
      ) : (
        <>
          <h2 className="text-2xl md:text-3xl font-black mb-2 text-white text-center">
            Fill Player Info
          </h2>
          <p className="text-neutral-400 text-sm text-center mb-6">
            Let's finish setting up your players account
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-white/80 mb-2 uppercase tracking-wider">
                Athlete First Name
              </label>
              <input
                type="text"
                value={form.firstName || ''}
                onChange={(e) =>
                  setForm({ ...form, firstName: e.target.value })
                }
                className="w-full px-4 py-3 bg-neutral-950/50 border border-[#57a4ff]/30 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-[#57a4ff] focus:ring-1 focus:ring-[#57a4ff] transition-all duration-300"
                placeholder="John"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-white/80 mb-2 uppercase tracking-wider">
                Athlete Last Name
              </label>
              <input
                type="text"
                value={form.lastName || ''}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                className="w-full px-4 py-3 bg-neutral-950/50 border border-[#57a4ff]/30 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-[#57a4ff] focus:ring-1 focus:ring-[#57a4ff] transition-all duration-300"
                placeholder="Doe"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-white/80 mb-2 uppercase tracking-wider">
              Athlete Email (Optional)
            </label>
            <input
              type="email"
              value={form.email || ''}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-4 py-3 bg-neutral-950/50 border border-[#57a4ff]/30 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-[#57a4ff] focus:ring-1 focus:ring-[#57a4ff] transition-all duration-300"
              placeholder="player@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-white/80 mb-2 uppercase tracking-wider">
              Athlete Phone Number (Optional)
            </label>
            <input
              type="tel"
              value={form.phone || ''}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full px-4 py-3 bg-neutral-950/50 border border-[#57a4ff]/30 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-[#57a4ff] focus:ring-1 focus:ring-[#57a4ff] transition-all duration-300"
              placeholder="(555) 555-5555"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-white/80 mb-2 uppercase tracking-wider">
              Date of Birth
            </label>
            <input
              type="date"
              value={form.dob || ''}
              onChange={(e) => setForm({ ...form, dob: e.target.value })}
              className="w-full px-4 py-3 bg-neutral-950/50 border border-[#57a4ff]/30 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-[#57a4ff] focus:ring-1 focus:ring-[#57a4ff] transition-all duration-300"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-white/80 mb-2 uppercase tracking-wider">
              Athlete Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={form.password || ''}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-4 py-3 pr-12 bg-neutral-950/50 border border-[#57a4ff]/30 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-[#57a4ff] focus:ring-1 focus:ring-[#57a4ff] transition-all duration-300"
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
                        ? 'M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21'
                        : 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
                    }
                  />
                </svg>
              </button>
            </div>
            <p className="mt-1 text-xs text-neutral-500">
              Must be at least 8 characters
            </p>
          </div>

          <div>
            <label className="block text-sm font-bold text-white/80 mb-2 uppercase tracking-wider">
              Athlete Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={form.confirmPass || ''}
                onChange={(e) =>
                  setForm({ ...form, confirmPass: e.target.value })
                }
                className="w-full px-4 py-3 pr-12 bg-neutral-950/50 border border-[#57a4ff]/30 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-[#57a4ff] focus:ring-1 focus:ring-[#57a4ff] transition-all duration-300"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                        ? 'M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21'
                        : 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
                    }
                  />
                </svg>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={!!form.sameAsParent}
              onChange={(e) =>
                setForm({ ...form, sameAsParent: e.target.checked })
              }
              className="w-5 h-5 rounded border-[#57a4ff]/30 bg-neutral-950/50 text-[#57a4ff] focus:ring-[#57a4ff]"
            />
            <label className="text-sm font-bold text-white/80 uppercase tracking-wider">
              Same as Parent/Guardian
            </label>
          </div>

          {!form.sameAsParent && (
            <div className="space-y-4 pt-4 border-t border-white/10">
              <div>
                <label className="block text-sm font-bold text-white/80 mb-2 uppercase tracking-wider">
                  Address
                </label>
                <input
                  type="text"
                  value={form.address || ''}
                  onChange={(e) =>
                    setForm({ ...form, address: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-neutral-950/50 border border-[#57a4ff]/30 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-[#57a4ff] focus:ring-1 focus:ring-[#57a4ff] transition-all duration-300"
                  placeholder="123 Main St"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-white/80 mb-2 uppercase tracking-wider">
                  State
                </label>
                <select
                  value={form.state || ''}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
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
                    value={form.city || ''}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
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
                    value={form.zip || ''}
                    onChange={(e) => setForm({ ...form, zip: e.target.value })}
                    className="w-full px-4 py-3 bg-neutral-950/50 border border-[#57a4ff]/30 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-[#57a4ff] focus:ring-1 focus:ring-[#57a4ff] transition-all duration-300"
                    placeholder="12345"
                  />
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );

  const renderSport = () => (
    <div className="space-y-4">
      <p className="text-neutral-400 text-sm text-center mb-4">Step 2 of 3</p>
      <h2 className="text-2xl md:text-3xl font-black mb-2 text-white text-center">
        Sport Info
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-white/80 mb-2 uppercase tracking-wider">
            Primary Position
          </label>
          <select
            value={form.pos1 || ''}
            onChange={(e) => setForm({ ...form, pos1: e.target.value })}
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
            Secondary Position
          </label>
          <select
            value={form.pos2 || ''}
            onChange={(e) => setForm({ ...form, pos2: e.target.value })}
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

      <div>
        <label className="block text-sm font-bold text-white/80 mb-2 uppercase tracking-wider">
          Jersey #
        </label>
        <input
          type="number"
          value={form.jerseyNum || ''}
          onChange={(e) => setForm({ ...form, jerseyNum: e.target.value })}
          className="w-full px-4 py-3 bg-neutral-950/50 border border-[#57a4ff]/30 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-[#57a4ff] focus:ring-1 focus:ring-[#57a4ff] transition-all duration-300"
          placeholder="12"
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-white/80 mb-2 uppercase tracking-wider">
          Graduation Year
        </label>
        <input
          type="number"
          value={form.gradYear || ''}
          onChange={(e) => setForm({ ...form, gradYear: e.target.value })}
          className="w-full px-4 py-3 bg-neutral-950/50 border border-[#57a4ff]/30 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-[#57a4ff] focus:ring-1 focus:ring-[#57a4ff] transition-all duration-300"
          placeholder="2026"
        />
      </div>

      <div>
        <div className="flex items-center gap-3 mb-4">
          <input
            type="checkbox"
            checked={committed}
            onChange={(e) => {
              setCommitted(e.target.checked);
              setForm({ ...form, committed: e.target.checked });
            }}
            className="w-5 h-5 rounded border-[#57a4ff]/30 bg-neutral-950/50 text-[#57a4ff] focus:ring-[#57a4ff]"
          />
          <label className="text-sm font-bold text-white/80 uppercase tracking-wider">
            Is this athlete committed to a college?
          </label>
        </div>

        {committed && (
          <div className="space-y-4">
            <SchoolInput
              label="College"
              value={collegeSchool}
              onChange={(school) => {
                setCollegeSchool(school);
                setForm({ ...form, college: school?.name || '' });
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
    </div>
  );

  const renderGear = () => (
    <div className="space-y-4">
      <p className="text-neutral-400 text-sm text-center mb-4">Step 3 of 3</p>
      <h2 className="text-2xl md:text-3xl font-black mb-2 text-white text-center">
        Gear Info
      </h2>

      <div>
        <label className="block text-sm font-bold text-white/80 mb-2 uppercase tracking-wider">
          Jersey Top Size
        </label>
        <select
          value={form.jerseySize || ''}
          onChange={(e) => setForm({ ...form, jerseySize: e.target.value })}
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
          value={form.pantSize || ''}
          onChange={(e) => setForm({ ...form, pantSize: e.target.value })}
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
          value={form.stirrupSize || ''}
          onChange={(e) => setForm({ ...form, stirrupSize: e.target.value })}
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
          value={form.shortSize || ''}
          onChange={(e) => setForm({ ...form, shortSize: e.target.value })}
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
          value={form.practiceShirtSize || ''}
          onChange={(e) =>
            setForm({ ...form, practiceShirtSize: e.target.value })
          }
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
    </div>
  );

  const renderSummary = () => (
    <div className="space-y-6">
      <h2 className="text-2xl md:text-3xl font-black mb-2 text-white text-center">
        Players Added
      </h2>
      <p className="text-neutral-400 text-sm text-center mb-4">
        Please double-check your players before submitting.
      </p>
      <p className="text-neutral-500 text-xs text-center mb-6 italic">
        (Click on a player's card to edit their info, or click the trash to
        remove.)
      </p>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {players.map((player, index) => (
          <div
            key={index}
            className="p-4 bg-neutral-800/50 border border-white/20 rounded-lg"
          >
            <div className="flex items-center justify-between">
              <button
                onClick={() => handleEditPlayer(player, index)}
                className="flex-1 text-left"
              >
                <p className="text-white font-semibold">
                  {index + 1}. {player.firstName} {player.lastName} —{' '}
                  {player.teamName} ({player.ageDivision})
                </p>
              </button>
              <button
                onClick={() => handleDeletePlayer(index)}
                className="ml-4 text-red-400 hover:text-red-300"
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
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <button
          onClick={handleAddAnother}
          className="w-full px-8 py-4 bg-neutral-800/50 border border-white/30 text-white font-semibold uppercase tracking-widest rounded-lg hover:bg-neutral-800 transition-all duration-300"
        >
          Add Another Player
        </button>
        <button
          onClick={handleSubmitAll}
          disabled={players.length === 0}
          className="w-full px-8 py-4 bg-gradient-to-r from-[#57a4ff] via-[#6bb0ff] to-[#57a4ff] text-white font-black uppercase tracking-widest rounded-lg hover:shadow-[0_0_30px_rgba(87,164,255,0.6)] transition-all duration-300 relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="relative z-10">Submit All Players</span>
          {players.length > 0 && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
          )}
        </button>
      </div>
    </div>
  );

  const renderBody = () => {
    if (step === 'START') return renderStart();
    if (step === 'TEAM') return renderTeam();
    if (step === 'CHOICE_14U') return renderChoice14U();
    if (step === 'INFO') return renderInfo();
    if (step === 'SPORT') return renderSport();
    if (step === 'GEAR') return renderGear();
    if (step === 'SUMMARY') return renderSummary();
    return null;
  };

  const showPrimaryButton = step !== 'SUMMARY' && step !== 'START';
  const primaryTitle =
    step === 'GEAR' ? 'Add Player' : step === 'TEAM' ? 'Continue' : 'Continue';

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
            {/* Back Button */}
            {step !== 'START' && (
              <button
                onClick={handleBack}
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
            )}

            {renderBody()}

            {showPrimaryButton && (
              <button
                onClick={goNext}
                disabled={!canContinue()}
                className="w-full mt-6 px-8 py-4 bg-gradient-to-r from-[#57a4ff] via-[#6bb0ff] to-[#57a4ff] text-white font-black uppercase tracking-widest rounded-lg hover:shadow-[0_0_30px_rgba(87,164,255,0.6)] transition-all duration-300 relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="relative z-10">{primaryTitle}</span>
                {canContinue() && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                )}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
