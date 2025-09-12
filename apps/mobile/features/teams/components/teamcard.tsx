import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { TeamFE } from '@bomber-app/database';
import { formatAgeGroup } from '@/utils/enumOptions';

interface TeamCardProps {
  team: TeamFE;
  onPress?: () => void;
}

export default function TeamCard({ team, onPress }: TeamCardProps) {
  const coachName = team.headCoach?.user
    ? `${team.headCoach.user.fname} ${team.headCoach.user.lname}`
    : 'Coach Unknown';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Image
        source={require('@/assets/images/bomberback.jpg')}
        style={styles.logo}
      />
      <View style={styles.textContainer}>
        <Text style={styles.name}>{team.name}</Text>
        <Text style={styles.detail}>{coachName}</Text>
        <Text style={styles.meta}>
          {formatAgeGroup(team.ageGroup)} • {team.region} • {team.state}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    padding: 12,
    marginTop: 10,
    marginBottom: 10,
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.2)',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
  },
  logo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    backgroundColor: '#000',
  },
  textContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
    color: 'white',
  },
  detail: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 1,
  },
  meta: {
    fontSize: 13,
    color: '#aaa',
  },
});
