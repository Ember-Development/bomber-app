import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import React, { useState } from 'react';
import { createGroupStyles } from '@/styles/groupsStyle';
import CustomButton from '@/components/ui/atoms/Button';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { formatRelativeTime } from '@/utils/DateTimeUtil';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useRouter } from 'expo-router';

// custom hooks
import { usePaginatedChats } from '@/hooks/useChats';
import NameModal from '@/components/groups/NameModal';
import CreateGroupModal from '@/components/groups/AddGroupModal';
import { useCreateGroup } from '@/api/groups/groups';

export default function GroupsScreen() {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    usePaginatedChats();
  const chats = data?.pages.flat() ?? [];
  const [modalStep, setModalStep] = useState<'name' | 'group' | null>(null);
  const [groupName, setGroupName] = useState('');
  // Theming Variables
  const styles = createGroupStyles('light');
  const iconColor = useThemeColor({}, 'icon');
  const component = useThemeColor({}, 'component');
  // Router
  const router = useRouter();

  const sortedChats = [...chats].sort((a, b) => {
    const aMessages = a.messages ?? []; // <-- fallback to []
    const bMessages = b.messages ?? [];

    const aTime = aMessages[0]?.createdAt
      ? new Date(aMessages[0].createdAt).getTime()
      : 0;
    const bTime = bMessages[0]?.createdAt
      ? new Date(bMessages[0].createdAt).getTime()
      : 0;

    return bTime - aTime;
  });

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

  // Create New Group Flow
  const handleNext = (name: string) => {
    setGroupName(name);
    setModalStep('group');
  };

  const { mutate: createGroup } = useCreateGroup();

  const handleCreateGroup = (selectedUsers: string[]) => {
    createGroup(
      {
        title: groupName,
        userIds: selectedUsers,
      },
      {
        onSuccess: (newGroup: { id: any }) => {
          setModalStep(null);
          router.push(`/groups/${newGroup.id}`);
        },
        onError: (err: any) => {
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
            existingGroupUserIds={[]}
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
            data={sortedChats}
            keyExtractor={(item) => `chat-${item.id ?? Math.random()}`} // if item.id is ever null/undefined app wont crash
            refreshing={isLoading}
            contentContainerStyle={{ paddingBottom: 50 }}
            onEndReached={() => {
              if (hasNextPage) fetchNextPage();
            }}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              hasNextPage && isFetchingNextPage ? (
                <ActivityIndicator style={{ marginVertical: 16 }} />
              ) : null
            }
            renderItem={({ item }) => {
              const latestMessage =
                item.messages?.length > 0 ? item.messages[0] : null;
              const latestMessageText = latestMessage?.text?.trim()
                ? latestMessage.text
                : 'No messages yet.';
              const latestMessageTime = latestMessage?.createdAt
                ? formatRelativeTime(
                    new Date(latestMessage.createdAt).toISOString()
                  )
                : '';

              return (
                <TouchableOpacity
                  onPress={() => {
                    router.push({
                      pathname: '/groups/[id]',
                      params: { id: item.id.toString() },
                    });
                  }}
                >
                  <View style={styles.groupItem}>
                    <View style={styles.textContainer}>
                      <View style={styles.groupTitleContainer}>
                        <ThemedText style={[styles.groupText]}>
                          {item.title}
                        </ThemedText>
                      </View>
                      <ThemedText style={styles.messageText} numberOfLines={1}>
                        {latestMessageText ?? ''}
                      </ThemedText>
                    </View>

                    <View style={styles.timeContainer}>
                      {latestMessage &&
                        typeof latestMessageTime === 'string' && (
                          <Text style={styles.timeText}>
                            {latestMessageTime}
                          </Text>
                        )}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        )}
      </ThemedView>
    </SafeAreaView>
  );
}
