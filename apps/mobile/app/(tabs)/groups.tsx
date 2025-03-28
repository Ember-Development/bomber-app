import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import React, { useRef, useState } from 'react';
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
import NameModal from '@/components/groups/NameModal';
import CreateGroupModal from '@/components/groups/AddGroupModal';
import { useCreateGroup } from '@/api/groups/groups';

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
  const [isSwiping, setIsSwiping] = useState(false);
  const [modalStep, setModalStep] = useState<'name' | 'group' | null>(null);
  const [groupName, setGroupName] = useState('');
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

  const handleMute = (groupId: string) => {
    setMutedGroups((prevMutedGroups) => ({
      ...prevMutedGroups,
      [groupId]: !prevMutedGroups[groupId],
    }));

    swipeableRefs.current[groupId]?.close();
  };

  // Right Actions (on swipe)
  const actions = (groupId: string) => [
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

  const handleNext = (name: string) => {
    setGroupName(name);
    setModalStep('group'); // Move to next modal step
  };

  const { mutate: createGroup } = useCreateGroup();

  const handleCreateGroup = (selectedUsers: string[]) => {
    createGroup(
      {
        title: groupName,
        userIds: selectedUsers,
      },
      {
        onSuccess: () => {
          setModalStep(null);
          loadChats();
        },
        onError: (err) => {
          console.error('Error creating group: ', err);
        },
      }
    );
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <ThemedView style={styles.container}>
        <View style={styles.headerContainer}>
          <View style={styles.iconContainer}>
            <ThemedText style={styles.headerText}>Groups</ThemedText>
          </View>
          <View style={styles.iconContainer}>
            <View
              style={[styles.buttonContainer, { backgroundColor: component }]}
            >
              <CustomButton
                variant="icon"
                iconName="add"
                onPress={() => setModalStep('name')}
              />
            </View>
            <View
              style={[styles.buttonContainer, { backgroundColor: component }]}
            >
              <CustomButton
                variant="icon"
                iconName="search"
                onPress={() => alert('Searching!')}
              />
            </View>
          </View>
        </View>

        {/* Modals */}
        {modalStep === 'name' && (
          <NameModal
            isVisible
            onClose={() => setModalStep(null)}
            onNext={handleNext}
          />
        )}

        {modalStep === 'group' && (
          <CreateGroupModal
            visible
            groupName={groupName}
            onClose={() => setModalStep(null)}
            onCreate={handleCreateGroup}
          />
        )}

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
                  onSwipeableOpen={() => setIsSwiping(true)}
                  onSwipeableWillClose={() => setIsSwiping(false)}
                  renderRightActions={(progress) =>
                    renderRightActions(progress, item.id, actions(item.id))
                  }
                >
                  <TouchableOpacity
                    onPress={() => {
                      if (!isSwiping) {
                        router.push({
                          pathname: '/groups/[id]',
                          params: { id: item.id.toString() },
                        });
                      }
                    }}
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
                          {latestMessageText ?? ''}
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
