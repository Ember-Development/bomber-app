import { useLocalSearchParams } from 'expo-router';
import { View, Text, SafeAreaView, TouchableOpacity } from 'react-native';

export default function GroupChatScreen() {
  const { id } = useLocalSearchParams();

  return (
    <SafeAreaView>
      <View>
        <Text>Group Chat - ID: {id}</Text>
        {/* Add your chat UI here */}
      </View>
    </SafeAreaView>
  );
}
