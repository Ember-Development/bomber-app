import React from 'react';
import { View, StyleSheet, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { usePush } from '@/features/notifications/usePush';
import { useUserContext } from '@/context/useUserContext';

export default function NotificationSettings() {
  const { user } = useUserContext();
  const { reRegisterDevice } = usePush({ userId: user?.id });

  const textColor = useThemeColor({}, 'text');
  const iconColor = useThemeColor({}, 'component');

  const handleReRegister = async () => {
    try {
      await reRegisterDevice();
      Alert.alert(
        'Success',
        'Device re-registered for push notifications! You should now receive notifications.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to re-register device. Please check your notification permissions in Settings.',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <View style={styles.container}>
      <ThemedText type="subtitle" style={[styles.title, { color: textColor }]}>
        Push Notifications
      </ThemedText>

      <Pressable
        onPress={handleReRegister}
        style={({ pressed }) => [
          styles.button,
          {
            backgroundColor: pressed ? 'rgba(255,255,255,0.1)' : 'transparent',
          },
        ]}
      >
        <View style={styles.buttonContent}>
          <Ionicons name="notifications-outline" size={24} color={iconColor} />
          <View style={styles.buttonText}>
            <ThemedText style={{ color: textColor, fontWeight: '600' }}>
              Re-register Device
            </ThemedText>
            <ThemedText
              style={{ color: textColor, opacity: 0.7, fontSize: 12 }}
            >
              Fix push notifications if they're not working
            </ThemedText>
          </View>
          <Ionicons name="chevron-forward" size={20} color={iconColor} />
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    marginBottom: 12,
    fontWeight: '600',
  },
  button: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  buttonText: {
    flex: 1,
    gap: 2,
  },
});
