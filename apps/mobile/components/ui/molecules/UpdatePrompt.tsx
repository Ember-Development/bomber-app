import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Platform,
  Linking,
} from 'react-native';
import * as Updates from 'expo-updates';
import { useRouter } from 'expo-router';
import { fetchLatestVersion } from '@/api/user';

// Use the version from app.config.js
const APP_VERSION = '1.0.4'; // Match this with your app.config.js version

const UpdatePrompt = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkForUpdates();
  }, []);

  const checkForUpdates = async () => {
    try {
      // Check for Expo OTA updates
      const update = await Updates.checkForUpdateAsync();
      if (update.isAvailable) {
        await Updates.fetchUpdateAsync();
        await Updates.reloadAsync(); // Apply OTA update
        return; // Exit if OTA update applied
      }

      // Check store version via backend API
      const currentVersion = APP_VERSION; // Use app.config.js version
      const latestVersion = await fetchLatestVersion();
      if (latestVersion > currentVersion) {
        setIsUpdateAvailable(true);
        setIsVisible(true);
      }
    } catch (error) {
      console.log('Error checking for updates:', error);
    }
  };

  const handleUpdateNow = async () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('https://apps.apple.com/app/id6744776521'); // Verify this ID
    } else if (Platform.OS === 'android') {
      Linking.openURL(
        'https://play.google.com/store/apps/details?id=com.emberdevco.bomberapp'
      );
    }
    setIsVisible(false);
  };

  const handleNotNow = () => {
    setIsVisible(false);
  };

  return (
    <Modal
      transparent
      visible={isVisible}
      animationType="fade"
      onRequestClose={handleNotNow}
    >
      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>
          <View style={styles.circle} />
          <Text style={styles.title}>New Update Available</Text>
          <Text style={styles.message}>
            A newer version of Bomber Fastpitch is available. Please navigate to
            the store to install it.
          </Text>
          <TouchableOpacity
            style={styles.updateButton}
            onPress={handleUpdateNow}
          >
            <Text style={styles.buttonText}>Update Now</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.notNowButton} onPress={handleNotNow}>
            <Text style={styles.buttonText}>Not Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#6B46C1',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    width: '80%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  circle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  message: {
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  updateButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginBottom: 10,
    width: '100%',
    alignItems: 'center',
  },
  notNowButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    color: '#6B46C1',
    fontWeight: 'bold',
  },
});

export default UpdatePrompt;
