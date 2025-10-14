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
import * as Application from 'expo-application';
import * as Updates from 'expo-updates';
import { useRouter } from 'expo-router';
import { fetchLatestVersion } from '@/api/user';

// read from the native app (no hardcoding)
const APP_VERSION = Application.nativeApplicationVersion ?? '0.0.0';

// tiny semver-ish compare: returns true if a > b
function semverGt(a: string, b: string) {
  const pa = a.split('.').map((n) => parseInt(n || '0', 10));
  const pb = b.split('.').map((n) => parseInt(n || '0', 10));
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const A = pa[i] || 0;
    const B = pb[i] || 0;
    if (A > B) return true;
    if (A < B) return false;
  }
  return false;
}

const UpdatePrompt = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasOtaReady, setHasOtaReady] = useState(false);
  const [storeUrl, setStoreUrl] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        // ===== OTA (only when OTA is enabled again later) =====
        // keep this block but it's inert while updates.enabled=false
        try {
          const res = await Updates.checkForUpdateAsync();
          if (res.isAvailable) {
            await Updates.fetchUpdateAsync();
            // do NOT reload automatically — let user choose
            setHasOtaReady(true);
          }
        } catch (e) {
          // ignore — OTA infra may be off during transfer
          console.log('OTA check failed:', e);
        }

        // ===== Store version check (public endpoint) =====
        const latest = await fetchLatestVersion(); // { version: 'x.y.z' }
        const latestVersion =
          typeof latest === 'string' ? latest : latest?.version;

        if (latestVersion && semverGt(latestVersion, APP_VERSION)) {
          setStoreUrl(
            Platform.OS === 'ios'
              ? 'https://apps.apple.com/app/id6744776521'
              : 'https://play.google.com/store/apps/details?id=com.emberdevco.bomberapp'
          );
          setIsVisible(true);
        } else if (hasOtaReady) {
          // optional: if an OTA is ready but store version isn't newer, you can still prompt
          setIsVisible(true);
        }
      } catch (err) {
        console.log('Error checking for updates:', err);
      }
    })();
  }, []);

  const handleUpdateNow = async () => {
    if (hasOtaReady) {
      // apply the OTA that we fetched earlier
      try {
        await Updates.reloadAsync();
        return;
      } catch (e) {
        console.log('OTA reload failed, falling back to store link', e);
      }
    }
    if (storeUrl) Linking.openURL(storeUrl);
    setIsVisible(false);
  };

  const handleNotNow = () => setIsVisible(false);

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
          <Text style={styles.title}>
            {hasOtaReady ? 'Update Ready' : 'New Update Available'}
          </Text>
          <Text style={styles.message}>
            {hasOtaReady
              ? 'A downloaded update is ready to apply.'
              : 'A newer version of Bomber Fastpitch is available.'}
          </Text>
          <TouchableOpacity
            style={styles.updateButton}
            onPress={handleUpdateNow}
          >
            <Text style={styles.buttonText}>
              {hasOtaReady ? 'Apply Update' : 'Update from Store'}
            </Text>
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
