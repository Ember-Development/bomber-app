import React, { useRef, useState } from 'react';
import {
  Animated,
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useCurrentUser } from '@/hooks/user/useCurrentUser';
import ProfileTabs from '../profile/profile-tab';
import FullScreenModal from '@/components/ui/organisms/FullSheetModal';
import EditProfileContent from '../profile/edit-profile';
import { useQueryClient } from '@tanstack/react-query';

const HEADER_MAX_HEIGHT = 250;
const HEADER_MIN_HEIGHT = 110;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;
const AVATAR_MAX = 67;
const AVATAR_MIN = 36;

const SCREEN_WIDTH = Dimensions.get('window').width;
const avatarCenteredX = (SCREEN_WIDTH - AVATAR_MAX) / 2;

export default function ProfileScreen() {
  const { data: user, isLoading } = useCurrentUser();
  const scrollY = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);
  const [scrollEnabled, setScrollEnabled] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const queryClient = useQueryClient();

  if (isLoading || !user) {
    return (
      <SafeAreaView
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
      >
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 12 }}>Loading Profile...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" />
      <AnimatedHeader
        user={user}
        scrollY={scrollY}
        onEditPress={() => setEditVisible(true)}
      />
      <Animated.ScrollView
        ref={scrollViewRef}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        scrollEnabled={scrollEnabled}
        contentContainerStyle={{ paddingTop: 220 }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        onContentSizeChange={(w, h) => {
          const screenHeight = Dimensions.get('window').height;
          setScrollEnabled(h + HEADER_MAX_HEIGHT > screenHeight);
        }}
        onMomentumScrollEnd={(e) => {
          const offsetY = e.nativeEvent.contentOffset.y;
          const threshold = HEADER_SCROLL_DISTANCE / 2;

          if (offsetY < threshold) {
            scrollViewRef.current?.scrollTo({ y: 0, animated: true });
          } else if (offsetY < HEADER_SCROLL_DISTANCE) {
            scrollViewRef.current?.scrollTo({
              y: HEADER_MAX_HEIGHT,
              animated: true,
            });
          }
        }}
      >
        <ProfileTabs user={user} />
        <View style={{ height: 40 }} />
      </Animated.ScrollView>

      <FullScreenModal
        isVisible={editVisible}
        onClose={() => setEditVisible(false)}
        title="Edit Profile"
      >
        <EditProfileContent
          user={user}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['current-user'] });
            setEditVisible(false);
          }}
        />
      </FullScreenModal>
    </SafeAreaView>
  );
}

function AnimatedHeader({
  user,
  scrollY,
  onEditPress,
}: {
  user: any;
  scrollY: Animated.Value;
  onEditPress: () => void;
}) {
  const headerHeight = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
    extrapolate: 'clamp',
  });

  const avatarSize = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [AVATAR_MAX, AVATAR_MIN],
    extrapolate: 'clamp',
  });

  const avatarTop = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [80, 10],
    extrapolate: 'clamp',
  });

  const avatarLeft = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [avatarCenteredX, 16],
    extrapolate: 'clamp',
  });

  const nameOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE - 10],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const mainAvatarOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE - 10],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const compactOpacity = scrollY.interpolate({
    inputRange: [HEADER_SCROLL_DISTANCE, HEADER_SCROLL_DISTANCE],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const compactTranslateY = scrollY.interpolate({
    inputRange: [HEADER_SCROLL_DISTANCE - 40, HEADER_SCROLL_DISTANCE],
    outputRange: [20, 0],
    extrapolate: 'clamp',
  });

  const fullEditOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE * 0.5],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View style={[styles.header, { height: headerHeight }]}>
      <LinearGradient
        colors={['#000000', '#1a1a1a']}
        style={StyleSheet.absoluteFill}
      />

      <Animated.View
        style={[
          styles.avatarWrapper,
          {
            top: avatarTop,
            left: avatarLeft,
            opacity: mainAvatarOpacity,
            zIndex: 1,
          },
        ]}
      >
        <Animated.Image
          source={{
            uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Baseball_icon.svg/1024px-Baseball_icon.svg.png',
          }}
          style={[styles.avatar, { width: avatarSize, height: avatarSize }]}
        />
      </Animated.View>

      <Animated.View style={[styles.nameRow, { opacity: nameOpacity }]}>
        <Text style={styles.name}>
          {user.fname} {user.lname}
        </Text>
        <View style={styles.rolePill}>
          <Text style={styles.roleText}>{user.primaryRole}</Text>
        </View>
      </Animated.View>

      <Animated.View
        style={[styles.editButtonCenter, { opacity: fullEditOpacity }]}
      >
        <TouchableOpacity style={styles.editButton} onPress={onEditPress}>
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      </Animated.View>

      <Animated.View
        style={[
          styles.compactRowContainer,
          {
            opacity: compactOpacity,
            transform: [{ translateY: compactTranslateY }],
          },
        ]}
      >
        <View style={styles.compactRow}>
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Image
              source={{
                uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Baseball_icon.svg/1024px-Baseball_icon.svg.png',
              }}
              style={styles.compactAvatar}
            />
            <Text style={styles.compactRowName}>
              {user.fname} {user.lname}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.compactEditButton}
            onPress={onEditPress}
          >
            <Text style={styles.editButtonTextSmall}>Edit</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  header: {
    position: 'absolute',
    top: 0,
    width: '100%',
    zIndex: 10,
    paddingHorizontal: 16,
    justifyContent: 'flex-end',
    paddingBottom: 16,
    overflow: 'hidden',
  },
  avatarWrapper: {
    position: 'absolute',
    backgroundColor: '#fff',
    borderRadius: 999,
    overflow: 'hidden',
  },
  avatar: {
    borderRadius: 999,
    backgroundColor: '#fff',
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  name: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  editButtonCenter: {
    marginTop: 12,
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  editButtonText: {
    color: '#000',
    fontWeight: '600',
    fontSize: 12,
  },
  compactRowContainer: {
    position: 'absolute',
    bottom: 14,
    left: 0,
    width: '100%',
    paddingHorizontal: 14,
  },
  compactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    gap: 2,
  },
  compactAvatar: {
    width: AVATAR_MIN,
    height: AVATAR_MIN,
    borderRadius: AVATAR_MIN / 2,
    backgroundColor: '#fff',
  },
  compactEditButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  editButtonTextSmall: {
    color: '#000',
    fontWeight: '600',
    fontSize: 12,
  },
  compactRowName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  rolePill: {
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    color: '#000',
    fontWeight: '600',
    fontSize: 12,
    textTransform: 'capitalize',
  },
});
