import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { createGroupStyles } from '@/styles/groupsStyle';
import mockData from '@/mock-data/mockData.json';
import CustomButton from '@/components/ui/atoms/Button';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { formatRelativeTime } from '@/utils/DateTimeUtil';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import type { SwipeableMethods } from 'react-native-gesture-handler';
import Animated, {
  interpolate,
  SharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useRouter } from 'expo-router';

// types
// import { ChatFE } from '../../../../packages/utils/src/'
// temporary for ui building
interface ChatFE {
  id: number;
  title: string;
  users: { id: number; fname: string; lname: string }[];
  messages: { id: number; text: string; createdAt: string }[];
}

export default function GroupsScreen() {
  const styles = createGroupStyles('light');
  const iconColor = useThemeColor({}, 'icon');
  const component = useThemeColor({}, 'component');
  const [chats, setChats] = useState<ChatFE[]>([]);
  const [mutedGroups, setMutedGroups] = useState<{ [key: number]: boolean }>(
    {}
  );
  const [unreadGroups, setUnreadGroups] = useState<{ [key: number]: boolean }>(
    {}
  );
  const [refresh, setRefresh] = useState(false);
  const [isLoading, setIsloading] = useState(true);
  const router = useRouter();

  // swipe reference
  const swipeableRefs = useRef<{ [key: number]: SwipeableMethods | null }>({});

  useEffect(() => {
    loadChats();
  }, []);

  // TESTING USE ONLY
  const loadChats = () => {
    setIsloading(true);
    setRefresh(true);
    setTimeout(() => {
      // Transform mock data to match ChatFE
      const transformedChats = mockData.chats.map((chat) => ({
        ...chat,
        users: chat.users.map((user) => ({
          id: user.id,
          fname: user.fname,
          lname: user.lname,
        })),
        messages: chat.messages.length > 0 ? chat.messages : [], // Ensure messages exist
      }));

      setChats(transformedChats);
      setIsloading(false);
      setRefresh(false);

      // mock a unread message
      const newUnreadGroups = transformedChats.reduce(
        (acc, chat) => {
          acc[chat.id] = chat.messages.length > 0;
          return acc;
        },
        {} as { [key: number]: boolean }
      );
      setUnreadGroups(newUnreadGroups);
    }, 2000);
  };

  // long press to leave group
  const handleLeaveGroup = () => {
    Alert.alert(
      `Leave Group`,
      'Are you sure you want to leave this group?',
      [
        { text: 'Cancel', style: 'destructive' },
        { text: 'Leave Group', onPress: () => handleLeft() },
      ],
      { cancelable: true }
    );
  };

  const handleLeft = () => {
    console.log('LEFT GROUP');
  };

  // mute a group
  const handleMute = (groupId: number) => {
    setMutedGroups((prevMutedGroups) => ({
      ...prevMutedGroups,
      [groupId]: !prevMutedGroups[groupId],
    }));

    // close on click
    swipeableRefs.current[groupId]?.close();
  };

  // Right Actions (on swipe)
  const renderRightActions = (
    progress: SharedValue<number>,
    groupId: number
  ) => {
    const animatedStyle = useAnimatedStyle(() => ({
      opacity: interpolate(progress.value, [0, 1], [0, 1]),
      transform: [{ scale: interpolate(progress.value, [0, 1], [0.8, 1]) }],
    }));

    return (
      <Animated.View style={[styles.actionContainer, animatedStyle]}>
        <TouchableOpacity
          onPress={() => handleMute(groupId)}
          style={styles.muteButton}
        >
          <ThemedText style={styles.muteText}>
            {mutedGroups[groupId] ? 'Unmute' : 'Mute'}
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleLeaveGroup} style={styles.leaveButton}>
          <ThemedText style={styles.leaveText}>Leave</ThemedText>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <ThemedView style={styles.container}>
        <View style={styles.headerContainer}>
          <View style={styles.iconContainer}>
            <CustomButton
              variant="icon"
              iconName="arrow-back"
              onPress={() => alert('Searching!')}
            />
            <ThemedText style={styles.headerText}>Groups</ThemedText>
          </View>
          <View
            style={[styles.buttonContainer, { backgroundColor: component }]}
          >
            {' '}
            <CustomButton
              variant="icon"
              iconName="search"
              onPress={() => alert('Searching!')}
            />
          </View>
        </View>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={iconColor} />
            <ThemedText style={styles.loadingText}>Loading Groups</ThemedText>
          </View>
        ) : chats.length === 0 ? (
          <View style={styles.noGroupsContainer}>
            <ThemedText style={styles.noGroupsText}>
              No Groups Found.
            </ThemedText>
          </View>
        ) : (
          <FlatList
            data={chats}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => {
              const latestMessage =
                item.messages.length > 0 ? item.messages[0] : null;
              const latestMessageText = latestMessage
                ? latestMessage.text
                : 'No messages yet';
              const latestMessageTime = latestMessage
                ? formatRelativeTime(latestMessage.createdAt)
                : '';
              const muted = mutedGroups[item.id];
              const unread = unreadGroups[item.id];

              return (
                <Swipeable
                  ref={(ref) => {
                    if (ref) swipeableRefs.current[item.id] = ref;
                  }}
                  renderRightActions={(progress) =>
                    renderRightActions(progress, item.id)
                  }
                >
                  <TouchableOpacity
                    onPress={() =>
                      router.push({
                        pathname: '/groups/[id]',
                        params: { id: item.id.toString() },
                      })
                    }
                  >
                    <View style={styles.groupItem}>
                      {/* Left Column: Group Name & Last Message */}
                      <View style={styles.textContainer}>
                        <View style={styles.groupTitleContainer}>
                          {unread && <View style={styles.unreadIndicator} />}

                          <ThemedText
                            style={[
                              styles.groupText,
                              muted && styles.mutedText,
                            ]}
                          >
                            {item.title}
                          </ThemedText>
                        </View>
                        <ThemedText style={styles.messageText}>
                          {latestMessageText}
                        </ThemedText>
                      </View>

                      {/* Right: Timestamp */}
                      <View style={styles.timeContainer}>
                        {latestMessage && (
                          <Text style={styles.timeText}>
                            {latestMessageTime}
                          </Text>
                        )}
                        {muted && (
                          <Ionicons
                            name="volume-mute"
                            size={16}
                            style={[styles.muteIcon, { color: iconColor }]}
                          />
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                </Swipeable>
              );
            }}
            refreshing={refresh}
            onRefresh={loadChats}
          />
        )}
      </ThemedView>
    </SafeAreaView>
  );
}
