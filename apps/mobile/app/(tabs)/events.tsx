import BackgroundWrapper from '@/components/ui/organisms/backgroundWrapper';
import { createGroupStyles } from '@/styles/groupsStyle';
import { Text } from '@react-navigation/elements';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar } from 'react-native-big-calendar';

const events = [
  {
    title: 'Meeting',
    start: new Date(2025, 7, 17, 10, 0),
    end: new Date(2025, 1, 17, 10, 30),
  },
  {
    title: 'Coffee break',
    start: new Date(2025, 7, 17, 15, 45),
    end: new Date(2025, 7, 17, 16, 30),
  },
];

export default function EventsScreen() {
  const styles = createGroupStyles('light');

  return (
    <BackgroundWrapper>
      <SafeAreaView style={styles.safeContainer}>
        <View>
          <Text>Hello Whirl</Text>
          <Calendar events={events} height={600} />
        </View>
      </SafeAreaView>
    </BackgroundWrapper>
  );
}
