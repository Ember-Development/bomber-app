import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { createGroupStyles } from '@/styles/groupsStyle';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import CustomButton from '@/components/ui/atoms/Button';
import NameModal from '@/app/groups/modals/NameModal';
import CreateGroupModal from '@/app/groups/modals/AddGroupModal';
import { formatRelativeTime } from '@/utils/DateTimeUtil';
import { useThemeColor } from '@/hooks/useThemeColor';
import { usePaginatedChats } from '@/hooks/groups/useChats';
import { useCreateGroup } from '@/hooks/groups/useCreateGroup';

export default function GroupsScreen() {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    usePaginatedChats();
  const chats = useMemo(() => {
    return (data?.pages.flat() ?? []).sort(
      (a: { lastMessageAt: Date }, b: { lastMessageAt: Date }) =>
        new Date(b.lastMessageAt).getTime() -
        new Date(a.lastMessageAt).getTime()
    );
  }, [data]);
  const [modalStep, setModalStep] = useState<'name' | 'group' | null>(null);
  const [groupName, setGroupName] = useState('');
  const router = useRouter();

  const styles = createGroupStyles('light');
  const iconColor = useThemeColor({}, 'icon');
  // const component = useThemeColor({}, 'component');

  const { mutate: createGroup } = useCreateGroup();

  const handleNext = (name: string) => {
    setGroupName(name);
    setModalStep('group');
  };

  const handleCreateGroup = (selectedUsers: string[]) => {
    createGroup(
      { title: groupName, userIds: selectedUsers },
      {
        onSuccess: (newGroup) => {
          setModalStep(null);
          router.push(`/groups/${newGroup.id}`);
        },
        onError: (err) => console.error('Create group error', err),
      }
    );
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <ThemedView style={styles.container}>
        <View style={styles.headerContainer}>
          <ThemedText style={styles.headerText}>Groups</ThemedText>
          <View style={styles.iconContainer}>
            <CustomButton
              variant="icon"
              iconName="add"
              onPress={() => setModalStep('name')}
            />
            {/* IMPLEMENT LATER */}
            {/* <CustomButton
              variant="icon"
              iconName="search"
              onPress={() => alert('Searching!')}
            /> */}
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

        {/* Group List */}
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
            keyExtractor={(item) => `chat-${item.id ?? Math.random()}`}
            refreshing={isLoading}
            contentContainerStyle={{ paddingBottom: 50 }}
            onEndReached={() => hasNextPage && fetchNextPage()}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              hasNextPage && isFetchingNextPage ? (
                <ActivityIndicator style={{ marginVertical: 16 }} />
              ) : null
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() =>
                  router.push({
                    pathname: '/groups/[id]',
                    params: { id: item.id },
                  })
                }
              >
                <View style={styles.groupItem}>
                  <View style={styles.textContainer}>
                    <ThemedText style={styles.groupText}>
                      {item.title}
                    </ThemedText>
                    <ThemedText style={styles.messageText} numberOfLines={1}>
                      {item.messages?.[0]?.text?.trim() || 'No messages yet.'}
                    </ThemedText>
                  </View>
                  <View style={styles.timeContainer}>
                    <Text style={styles.timeText}>
                      {formatRelativeTime(
                        new Date(item.lastMessageAt).toISOString()
                      )}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </ThemedView>
    </SafeAreaView>
  );
}
