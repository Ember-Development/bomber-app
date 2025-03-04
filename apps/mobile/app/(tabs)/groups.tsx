import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import React from 'react';
import { createGroupStyles } from '@/styles/groupsStyle';
import CustomButton from '@/components/ui/atoms/Button';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { formatRelativeTime } from '@/utils/DateTimeUtil';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useRouter } from 'expo-router';

// custom hooks
import { useChats } from '@/hooks/useChats';
import { useSwipeActions } from '@/hooks/useSwipeActions';
import { GlobalColors } from '@/constants/Colors';

export default function GroupsScreen() {
  const {
    chats,
    mutedGroups,
    unreadGroups,
    isLoading,
    refresh,
    loadChats,
    setMutedGroups,
  } = useChats();
  // Theming Variables
  const styles = createGroupStyles('light');
  const iconColor = useThemeColor({}, 'icon');
  const component = useThemeColor({}, 'component');
  // Router
  const router = useRouter();

  // swipe reference
  const { swipeableRefs, renderRightActions } = useSwipeActions();

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

  const handleMute = (groupId: number) => {
    setMutedGroups((prevMutedGroups) => ({
      ...prevMutedGroups,
      [groupId]: !prevMutedGroups[groupId],
    }));

    swipeableRefs.current[groupId]?.close();
  };

  // Right Actions (on swipe)
  const actions = (groupId: number) => [
    {
      label: mutedGroups[groupId] ? 'Unmute' : 'Mute',
      color: GlobalColors.dark,
      onPress: () => handleMute(groupId),
    },
    {
      label: 'Leave',
      color: GlobalColors.red,
      onPress: handleLeaveGroup,
    },
  ];

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
            keyExtractor={(item) => `chat-${item.id ?? Math.random()}`} // if item.id is ever null/undefined app wont crash
            renderItem={({ item }) => {
              const latestMessage =
                item.messages.length > 0 ? item.messages[0] : null;
              const latestMessageText = latestMessage?.text?.trim()
                ? latestMessage.text
                : 'No messages yet.';
              const latestMessageTime = latestMessage
                ? formatRelativeTime(latestMessage.createdAt.toISOString())
                : '';
              const muted = mutedGroups[item.id];
              const unread = unreadGroups[item.id];

              return (
                <ReanimatedSwipeable
                  ref={(ref) => {
                    if (ref) swipeableRefs.current[item.id] = ref;
                  }}
                  renderRightActions={(progress) =>
                    renderRightActions(progress, item.id, actions(item.id))
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
                </ReanimatedSwipeable>
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
