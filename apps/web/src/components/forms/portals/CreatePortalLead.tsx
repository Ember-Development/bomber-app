import React, { useMemo, useState } from 'react';
import SideDialog from '@/components/SideDialog';
import { useToast } from '@/context/ToastProvider';
import {
  createPortalLead,
  type LeadKind,
  type AgeGroup,
  type Position,
  type PortalLeadFE,
} from '@/api/portal';

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated?: (lead: PortalLeadFE) => void;
};

const AGE_GROUPS: AgeGroup[] = ['U8', 'U10', 'U12', 'U14', 'U16', 'U18']; // match mobile
const POS: Position[] = [
  'PITCHER',
  'CATCHER',
  'FIRST_BASE',
  'SECOND_BASE',
  'THIRD_BASE',
  'SHORTSTOP',
  'LEFT_FIELD',
  'CENTER_FIELD',
  'RIGHT_FIELD',
  'DESIGNATED_HITTER',
];

const isUnder14 = (ag?: string) =>
  ag === 'U8' || ag === 'U10' || ag === 'U12' || ag === 'U14';

export default function CreatePortalLead({ open, onClose, onCreated }: Props) {
  const { addToast } = useToast();

  const [who, setWho] = useState<LeadKind | null>(null); // 'PLAYER' | 'PARENT'
  const [ageGroup, setAgeGroup] = useState<AgeGroup | ''>('');
  const [pos1, setPos1] = useState<Position | ''>('');
  const [pos2, setPos2] = useState<Position | ''>('');
  const [gradYear, setGradYear] = useState('');

  const [pf, setPf] = useState(''); // player first
  const [pl, setPl] = useState(''); // player last

  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const [parF, setParF] = useState('');
  const [parL, setParL] = useState('');
  const [parEmail, setParEmail] = useState('');
  const [parPhone, setParPhone] = useState('');

  const disabledForPlayer =
    who === 'PLAYER' && isUnder14(ageGroup || undefined);

  const canSubmit = useMemo(() => {
    if (!who || !pf || !pl || !ageGroup) return false;
    if (who === 'PLAYER') {
      if (isUnder14(ageGroup)) return false;
      return !!(email || phone);
    }
    // PARENT
    return !!(parF && parL && (parEmail || parPhone));
  }, [who, pf, pl, ageGroup, email, phone, parF, parL, parEmail, parPhone]);

  const reset = () => {
    setWho(null);
    setAgeGroup('');
    setPos1('');
    setPos2('');
    setGradYear('');
    setPf('');
    setPl('');
    setEmail('');
    setPhone('');
    setParF('');
    setParL('');
    setParEmail('');
    setParPhone('');
  };

  const onSubmit = async () => {
    if (!canSubmit || !who || !ageGroup) return;

    try {
      const created = await createPortalLead({
        kind: who,
        playerFirstName: pf.trim(),
        playerLastName: pl.trim(),
        ageGroup,
        pos1: (pos1 || undefined) as Position | undefined,
        pos2: (pos2 || undefined) as Position | undefined,
        gradYear: gradYear || undefined,
        email: who === 'PLAYER' ? email?.trim() || undefined : undefined,
        phone: who === 'PLAYER' ? phone?.trim() || undefined : undefined,
        parentFirstName:
          who === 'PARENT' ? parF?.trim() || undefined : undefined,
        parentLastName:
          who === 'PARENT' ? parL?.trim() || undefined : undefined,
        parentEmail:
          who === 'PARENT' ? parEmail?.trim() || undefined : undefined,
        parentPhone:
          who === 'PARENT' ? parPhone?.trim() || undefined : undefined,
      });

      onCreated?.(created);
      addToast(
        'Thanks! We received your info. A coach will follow up.',
        'success'
      );
      reset();
      onClose();
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? 'Failed to submit.';
      addToast(`Error ${msg}`, 'error');
    }
  };

  return (
    <SideDialog
      title="Become a Bomber"
      open={open}
      onClose={() => {
        reset();
        onClose();
      }}
      widthClass="max-w-2xl"
    >
      <div className="space-y-4">
        {/* Who */}
        <div className="flex items-center gap-2">
          <Chip
            label="For me"
            active={who === 'PLAYER'}
            onClick={() => setWho('PLAYER')}
          />
          <Chip
            label="For my child"
            active={who === 'PARENT'}
            onClick={() => setWho('PARENT')}
          />
        </div>

        {/* Player fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input
            placeholder="Player first name"
            value={pf}
            onChange={(e) => setPf(e.target.value)}
          />
          <Input
            placeholder="Player last name"
            value={pl}
            onChange={(e) => setPl(e.target.value)}
          />

          {/* Age / Pos / Grad */}
          <Select
            label="Age Division"
            value={ageGroup}
            onChange={(e) => setAgeGroup(e.target.value as AgeGroup)}
            options={AGE_GROUPS}
          />
          <Select
            label="Primary Position"
            value={pos1}
            onChange={(e) => setPos1(e.target.value as Position)}
            options={POS}
            allowEmpty
          />
          <Select
            label="Secondary Position"
            value={pos2}
            onChange={(e) => setPos2(e.target.value as Position)}
            options={POS}
            allowEmpty
          />
          <Input
            placeholder="Graduation Year"
            value={gradYear}
            onChange={(e) => setGradYear(e.target.value)}
            inputMode="numeric"
          />
        </div>

        {/* Contact blocks */}
        {who === 'PLAYER' &&
          (disabledForPlayer ? (
            <Notice text="Players 14U and under must apply with a parent/guardian." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input
                placeholder="Your email (or phone)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoCapitalize="none"
                type="email"
              />
              <Input
                placeholder="Your phone (optional)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                inputMode="tel"
              />
            </div>
          ))}

        {who === 'PARENT' && (
          <>
            <div className="text-xs font-bold text-white/70">
              Parent / Guardian
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input
                placeholder="Parent first name"
                value={parF}
                onChange={(e) => setParF(e.target.value)}
              />
              <Input
                placeholder="Parent last name"
                value={parL}
                onChange={(e) => setParL(e.target.value)}
              />
              <Input
                placeholder="Parent email"
                value={parEmail}
                onChange={(e) => setParEmail(e.target.value)}
                type="email"
                autoCapitalize="none"
              />
              <Input
                placeholder="Parent phone"
                value={parPhone}
                onChange={(e) => setParPhone(e.target.value)}
                inputMode="tel"
              />
            </div>
          </>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2">
          <button
            className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20"
            onClick={() => {
              reset();
              onClose();
            }}
          >
            Cancel
          </button>
          <button
            className="px-3 py-2 rounded-lg bg-white/20 hover:bg-white/30 disabled:opacity-50"
            disabled={disabledForPlayer || !canSubmit}
            onClick={onSubmit}
          >
            Submit
          </button>
        </div>
      </div>
    </SideDialog>
  );
}

/* --- tiny UI atoms to keep this file self-contained --- */
function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        'px-3 py-1.5 rounded-full border text-xs font-bold transition',
        active
          ? 'bg-white/20 border-white/30 text-white'
          : 'bg-white/10 border-white/15 text-white/80 hover:bg-white/15',
      ].join(' ')}
    >
      {label}
    </button>
  );
}

function Input(
  props: React.InputHTMLAttributes<HTMLInputElement> & { label?: string }
) {
  // label is optional; placeholder-only like mobile
  const { className = '', ...rest } = props;
  return (
    <input
      {...rest}
      className={[
        'px-3 py-2 rounded-lg bg-white/10 border border-white/10 text-white placeholder-white/50',
        'focus:outline-none focus:ring-2 focus:ring-white/20',
        className,
      ].join(' ')}
    />
  );
}

function Select({
  label,
  value,
  onChange,
  options,
  allowEmpty,
}: {
  label: string;
  value: string | '';
  onChange: React.ChangeEventHandler<HTMLSelectElement>;
  options: readonly string[];
  allowEmpty?: boolean;
}) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 border border-white/10">
      <span className="text-xs font-medium text-white/60 flex-1">{label}</span>
      <select
        value={value}
        onChange={onChange}
        className="bg-transparent outline-none text-white"
      >
        {allowEmpty && <option value="">Select</option>}
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

function Notice({ text }: { text: string }) {
  return (
    <div
      className="flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-bold"
      style={{
        backgroundColor: 'rgba(125,220,134,0.12)',
        borderColor: 'rgba(125,220,134,0.35)',
        color: '#7DDC86',
      }}
    >
      <span>✓</span>
      <span>{text}</span>
    </div>
  );
}
