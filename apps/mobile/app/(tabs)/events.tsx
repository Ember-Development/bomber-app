import BackgroundWrapper from '@/components/ui/organisms/backgroundWrapper';
import { createGroupStyles } from '@/styles/groupsStyle';
import { Text } from '@react-navigation/elements';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function EventsScreen() {
  const styles = createGroupStyles('light');

  return (
    <BackgroundWrapper>
      <SafeAreaView style={styles.safeContainer}>
        <View>
          <Text>Hello Whirl</Text>
        </View>
      </SafeAreaView>
    </BackgroundWrapper>
  );
}
