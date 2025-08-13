// components/BecomeBomberModal.tsx
import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import Modal from 'react-native-modal';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GlobalColors } from '@/constants/Colors';
import { useCreateLead } from '@/hooks/portal/useCreateLeads';

type Props = { visible: boolean; onClose: () => void; onComplete?: () => void };

const AGE_GROUPS = ['U8', 'U10', 'U12', 'U14', 'U16', 'U18'] as const;
const POS = [
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
] as const;

const isUnder14 = (ag?: string) =>
  ag === 'U8' || ag === 'U10' || ag === 'U12' || ag === 'U14';

function SelectRow({
  label,
  value,
  onPress,
}: {
  label: string;
  value?: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value ?? 'Select'}</Text>
      <Ionicons name="chevron-forward" size={16} color="#B8B8C3" />
    </TouchableOpacity>
  );
}

function ChoiceChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active?: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.chip, active && styles.chipActive]}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const ActionSheet = {
  pick: (
    title: string,
    items: readonly string[],
    onPick: (v: string) => void
  ) => {
    Alert.alert(
      title,
      '',
      items.map((v) => ({ text: v, onPress: () => onPick(v) }))
    );
  },
};

export default function BecomeBomberModal({
  visible,
  onClose,
  onComplete,
}: Props) {
  const insets = useSafeAreaInsets();

  const [who, setWho] = useState<'PLAYER' | 'PARENT' | null>(null);
  const [ageGroup, setAgeGroup] = useState<string>();
  const [pos1, setPos1] = useState<string>();
  const [pos2, setPos2] = useState<string>();
  const [gradYear, setGradYear] = useState<string>();
  const [pf, setPf] = useState('');
  const [pl, setPl] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [parF, setParF] = useState('');
  const [parL, setParL] = useState('');
  const [parEmail, setParEmail] = useState('');
  const [parPhone, setParPhone] = useState('');

  const { mutate: submitLead, isPending } = useCreateLead({
    onSuccess: () => {
      Alert.alert('Thanks!', 'We received your info. A coach will follow up.');
      onClose();
      onComplete?.();
      setWho(null);
      setAgeGroup(undefined);
      setPos1(undefined);
      setPos2(undefined);
      setPf('');
      setPl('');
      setEmail('');
      setPhone('');
      setGradYear('');
      setParF('');
      setParL('');
      setParEmail('');
      setParPhone('');
    },
    onError: (e: any) =>
      Alert.alert('Error', e?.response?.data?.message ?? 'Failed to submit.'),
  });

  const disabledForPlayer = who === 'PLAYER' && isUnder14(ageGroup);
  const canSubmit = useMemo(() => {
    if (!who || !pf || !pl || !ageGroup) return false;
    if (who === 'PLAYER') {
      if (isUnder14(ageGroup)) return false;
      return !!(email || phone);
    }
    // PARENT
    return !!(parF && parL && (parEmail || parPhone));
  }, [who, pf, pl, ageGroup, email, phone, parF, parL, parEmail, parPhone]);

  const onSubmit = () => {
    if (!canSubmit) return;
    submitLead({
      kind: who!,
      playerFirstName: pf.trim(),
      playerLastName: pl.trim(),
      ageGroup: ageGroup as any,
      pos1,
      pos2,
      gradYear,
      email: who === 'PLAYER' ? email.trim() : undefined,
      phone: who === 'PLAYER' ? phone.trim() : undefined,
      parentFirstName: who === 'PARENT' ? parF.trim() : undefined,
      parentLastName: who === 'PARENT' ? parL.trim() : undefined,
      parentEmail: who === 'PARENT' ? parEmail.trim() : undefined,
      parentPhone: who === 'PARENT' ? parPhone.trim() : undefined,
    });
  };

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      onSwipeComplete={onClose}
      swipeDirection="down"
      avoidKeyboard
      useNativeDriver
      propagateSwipe
      style={styles.modal}
    >
      <View style={[styles.sheet, { paddingBottom: insets.bottom + 8 }]}>
        <View style={styles.handle} />

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Become a Bomber</Text>
          <TouchableOpacity onPress={onClose} hitSlop={8}>
            <Ionicons name="close" size={20} color="#B8B8C3" />
          </TouchableOpacity>
        </View>

        <ScrollView
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ gap: 10, paddingBottom: 12 }}
        >
          {/* Who */}
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <ChoiceChip
              label="For me"
              active={who === 'PLAYER'}
              onPress={() => setWho('PLAYER')}
            />
            <ChoiceChip
              label="For my child"
              active={who === 'PARENT'}
              onPress={() => setWho('PARENT')}
            />
          </View>

          {/* Player fields */}
          <TextInput
            placeholder="Player first name"
            placeholderTextColor="#8E8E99"
            style={styles.input}
            value={pf}
            onChangeText={setPf}
          />
          <TextInput
            placeholder="Player last name"
            placeholderTextColor="#8E8E99"
            style={styles.input}
            value={pl}
            onChangeText={setPl}
          />

          {/* Age / Pos / Grad */}
          <SelectRow
            label="Age Division"
            value={ageGroup}
            onPress={() =>
              ActionSheet.pick('Age Division', AGE_GROUPS, setAgeGroup)
            }
          />
          <SelectRow
            label="Primary Position"
            value={pos1}
            onPress={() => ActionSheet.pick('Primary Position', POS, setPos1)}
          />
          <SelectRow
            label="Secondary Position"
            value={pos2}
            onPress={() => ActionSheet.pick('Secondary Position', POS, setPos2)}
          />
          <TextInput
            placeholder="Graduation Year "
            placeholderTextColor="#8E8E99"
            style={styles.input}
            value={gradYear}
            onChangeText={setGradYear}
            keyboardType="number-pad"
          />

          {/* Contact blocks */}
          {who === 'PLAYER' ? (
            isUnder14(ageGroup) ? (
              <View style={styles.notice}>
                <Ionicons name="shield-checkmark" size={16} color="#7DDC86" />
                <Text style={styles.noticeText}>
                  Players 14U and under must apply with a parent/guardian.
                </Text>
              </View>
            ) : (
              <>
                <TextInput
                  placeholder="Your email (or phone)"
                  placeholderTextColor="#8E8E99"
                  style={styles.input}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                />
                <TextInput
                  placeholder="Your phone (optional)"
                  placeholderTextColor="#8E8E99"
                  style={styles.input}
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                />
              </>
            )
          ) : null}

          {who === 'PARENT' ? (
            <>
              <Text style={styles.sectionLabel}>Parent / Guardian</Text>
              <TextInput
                placeholder="Parent first name"
                placeholderTextColor="#8E8E99"
                style={styles.input}
                value={parF}
                onChangeText={setParF}
              />
              <TextInput
                placeholder="Parent last name"
                placeholderTextColor="#8E8E99"
                style={styles.input}
                value={parL}
                onChangeText={setParL}
              />
              <TextInput
                placeholder="Parent email"
                placeholderTextColor="#8E8E99"
                style={styles.input}
                autoCapitalize="none"
                keyboardType="email-address"
                value={parEmail}
                onChangeText={setParEmail}
              />
              <TextInput
                placeholder="Parent phone"
                placeholderTextColor="#8E8E99"
                style={styles.input}
                keyboardType="phone-pad"
                value={parPhone}
                onChangeText={setParPhone}
              />
            </>
          ) : null}
        </ScrollView>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.btn, styles.btnGhost]}
            onPress={onClose}
            disabled={isPending}
          >
            <Text style={styles.btnGhostText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.btn,
              styles.btnPrimary,
              (disabledForPlayer || !canSubmit) && { opacity: 0.5 },
            ]}
            onPress={onSubmit}
            disabled={isPending || disabledForPlayer || !canSubmit}
          >
            <Text style={styles.btnPrimaryText}>
              {isPending ? 'Submitting…' : 'Submit'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: { justifyContent: 'flex-end', margin: 0 },
  sheet: {
    padding: 16,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    backgroundColor: '#111214',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    gap: 10,
    maxHeight: '85%', // <- keep the sheet from jumping too high
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.25)',
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: { color: '#fff', fontWeight: '700', fontSize: 18 },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  label: { color: '#B8B8C3', fontSize: 12, flex: 1 },
  value: { color: '#fff', fontWeight: '700' },

  input: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.1)',
    color: '#fff',
  },
  sectionLabel: {
    color: '#B8B8C3',
    marginTop: 6,
    marginBottom: -2,
    fontSize: 12,
    fontWeight: '700',
  },

  chip: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  chipActive: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderColor: 'rgba(255,255,255,0.2)',
  },
  chipText: { color: '#C8C8D2', fontSize: 12, fontWeight: '700' },
  chipTextActive: { color: '#fff' },

  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(125,220,134,0.12)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(125,220,134,0.35)',
  },
  noticeText: {
    color: '#7DDC86',
    fontSize: 12,
    fontWeight: '700',
    flexShrink: 1,
  },

  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 4,
    marginBottom: 8,
  },
  btn: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10 },
  btnGhost: { backgroundColor: 'transparent' },
  btnGhostText: { color: '#B8B8C3', fontWeight: '700' },
  btnPrimary: { backgroundColor: GlobalColors?.bomber ?? '#3B82F6' },
  btnPrimaryText: { color: '#fff', fontWeight: '700' },
});
