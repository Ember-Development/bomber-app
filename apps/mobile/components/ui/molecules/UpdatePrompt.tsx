// components/ui/molecules/UpdatePrompt.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Platform,
  Linking,
  Dimensions,
  StatusBar,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Application from 'expo-application';
import * as Updates from 'expo-updates';
import { fetchLatestVersion } from '@/api/user';

const { width, height } = Dimensions.get('window');
const APP_VERSION = Application.nativeApplicationVersion ?? '0.0.0';

// flip to true only after you re-enable expo-updates later
const OTA_ENABLED = false;

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
  const [features, setFeatures] = useState<string[]>([]);
  const [latestVersion, setLatestVersion] = useState<string>('');
  const insets = useSafeAreaInsets();

  useEffect(() => {
    (async () => {
      // OTA — inert while OTA_ENABLED=false
      if (OTA_ENABLED) {
        try {
          const res = await Updates.checkForUpdateAsync();
          if (res.isAvailable) {
            await Updates.fetchUpdateAsync();
            setHasOtaReady(true);
          }
        } catch (e) {
          console.log('OTA check failed:', e);
        }
      }

      // Store version check (expects { version: 'x.y.z' })
      try {
        console.log('[UpdatePrompt] Checking for updates...');
        console.log('[UpdatePrompt] Current app version:', APP_VERSION);

        const result = await fetchLatestVersion();
        const version = result?.version;
        const versionFeatures = result?.features || [];

        console.log('[UpdatePrompt] Latest version from API:', version);
        console.log('[UpdatePrompt] Features from API:', versionFeatures);
        console.log(
          '[UpdatePrompt] Version comparison result:',
          semverGt(version, APP_VERSION)
        );

        if (version && semverGt(version, APP_VERSION)) {
          console.log('[UpdatePrompt] Update available! Showing prompt...');
          setLatestVersion(version);
          setFeatures(versionFeatures);
          setStoreUrl(
            Platform.OS === 'ios'
              ? 'https://apps.apple.com/app/id6744776521'
              : 'https://play.google.com/store/apps/details?id=com.emberdevco.bomberapp'
          );
          setIsVisible(true);
        } else if (hasOtaReady) {
          console.log('[UpdatePrompt] OTA update ready! Showing prompt...');
          setIsVisible(true);
        } else {
          console.log('[UpdatePrompt] No update needed');
        }
      } catch (err) {
        console.log('[UpdatePrompt] Error checking store version:', err);
      }
    })();
  }, [hasOtaReady]);

  const handleUpdateNow = async () => {
    if (hasOtaReady && OTA_ENABLED) {
      try {
        await Updates.reloadAsync();
        return;
      } catch (e) {
        console.log('OTA reload failed, falling back to store link', e);
      }
    }
    if (storeUrl) {
      const can = await Linking.canOpenURL(storeUrl);
      if (can) await Linking.openURL(storeUrl);
    }
  };

  if (!isVisible) return null;

  // Background gradient matching BackgroundWrapper
  const gradientProps =
    Platform.OS === 'android'
      ? {
          colors: ['#0A3C6E', '#083154', '#041E3A'] as const,
          locations: [0, 0.55, 1] as const,
          start: { x: 0.25, y: 0 },
          end: { x: 0.85, y: 1 },
        }
      : {
          colors: ['#004987', '#000000'] as const,
          start: { x: 0.5, y: 0 },
          end: { x: 0.5, y: 1 },
        };

  return (
    <Modal
      transparent={false}
      visible={isVisible}
      animationType="fade"
      statusBarTranslucent
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      <View style={styles.container}>
        {/* Background matching BackgroundWrapper */}
        <View style={styles.background}>
          <LinearGradient {...gradientProps} style={StyleSheet.absoluteFill} />
          {Platform.OS === 'ios' && (
            <BlurView intensity={50} style={StyleSheet.absoluteFill} />
          )}
        </View>

        {/* Content */}
        <View
          style={[
            styles.content,
            { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons name="arrow-up-circle" size={50} color="#57a4ff" />
            </View>
            <Text style={styles.title}>
              {hasOtaReady ? 'Update Ready' : 'New Update Available'}
            </Text>
            <Text style={styles.subtitle}>
              {hasOtaReady
                ? 'A downloaded update is ready to apply.'
                : 'A newer version of Bomber Fastpitch is available.'}
            </Text>
          </View>

          {/* Version Info */}
          <View style={styles.versionInfo}>
            <View style={styles.versionCard}>
              <Text style={styles.versionLabel}>Current Version</Text>
              <Text style={styles.versionValue}>{APP_VERSION}</Text>
            </View>
            <Ionicons
              name="arrow-forward"
              size={24}
              color="rgba(255,255,255,0.6)"
            />
            <View style={styles.versionCard}>
              <Text style={styles.versionLabel}>Latest Version</Text>
              <Text style={styles.versionValue}>{latestVersion}</Text>
            </View>
          </View>

          {/* Features List */}
          <View style={styles.featuresContainer}>
            <Text style={styles.featuresTitle}>What's New:</Text>
            <ScrollView
              style={styles.featuresList}
              showsVerticalScrollIndicator={false}
            >
              {features.length > 0 ? (
                features.map((feature, index) => (
                  <View key={index} style={styles.featureItem}>
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color="#57a4ff"
                    />
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))
              ) : (
                <View style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={20} color="#57a4ff" />
                  <Text style={styles.featureText}>
                    Bug fixes and improvements
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.updateButton}
              onPress={handleUpdateNow}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#57a4ff', '#4a8bff'] as const}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.updateButtonGradient}
              >
                <Ionicons name="download" size={24} color="#fff" />
                <Text style={styles.updateButtonText}>
                  {hasOtaReady ? 'Apply Update' : 'Update from Store'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* <TouchableOpacity
              style={styles.notNowButton}
              onPress={() => setIsVisible(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.notNowText}>Not Now</Text>
            </TouchableOpacity> */}
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Keep your app updated for the best experience
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#041E3A', // Fallback color matching BackgroundWrapper
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  content: {
    flex: 1,
    zIndex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: 10,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(87, 164, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(87, 164, 255, 0.3)',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  versionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
    gap: 16,
  },
  versionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    alignItems: 'center',
    minWidth: 120,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  versionLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 4,
    fontWeight: '500',
  },
  versionValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  featuresContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    marginBottom: 24,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    maxHeight: height * 0.4,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  featuresList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    flex: 1,
  },
  actionsContainer: {
    gap: 16,
  },
  updateButton: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#57a4ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  updateButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
    gap: 12,
  },
  updateButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  notNowButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  notNowText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default UpdatePrompt;
