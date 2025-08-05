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
import CustomButton from '@/components/ui/atoms/Button';
import NameModal from '@/app/groups/modals/NameModal';
import CreateGroupModal from '@/app/groups/modals/AddGroupModal';
import { formatRelativeTime } from '@/utils/DateTimeUtil';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useUserChats } from '@/hooks/useUser';
import { useCreateGroup } from '@/hooks/groups/useCreateGroup';
import BackgroundWrapper from '@/components/ui/organisms/backgroundWrapper';
import { useUserPermissions } from '@/hooks/useUserPermission';
import { useNormalizedUser } from '@/utils/user';

export default function GroupsScreen() {
  const { user } = useNormalizedUser();
  const { can } = useUserPermissions();
  const canCreateGroup = can('create-team-group');

  const { data: chats = [], isLoading, isError } = useUserChats(user?.id);

  const [modalStep, setModalStep] = useState<'name' | 'group' | null>(null);
  const [groupName, setGroupName] = useState('');
  const router = useRouter();

  const styles = createGroupStyles('light');
  const iconColor = useThemeColor({}, 'component');

  const { mutate: createGroup } = useCreateGroup();

  const handleNext = (name: string) => {
    setGroupName(name);
    setModalStep('group');
  };

  const handleCreateGroup = (selectedUsers: string[]) => {
    if (!user?.id) return;
    const allUsers = Array.from(new Set([...selectedUsers, user.id])).filter(
      Boolean
    );

    createGroup(
      { title: groupName, userIds: allUsers, creatorId: user.id },
      {
        onSuccess: (newGroup) => {
          setModalStep(null);
          router.push(`/groups/${newGroup.id}`);
        },
      }
    );
  };

  return (
    <BackgroundWrapper>
      <SafeAreaView style={styles.safeContainer}>
        <View style={styles.container}>
          <View style={styles.headerContainer}>
            <ThemedText style={styles.headerText}>Groups</ThemedText>
            <View style={styles.iconContainer}>
              {canCreateGroup && (
                <CustomButton
                  variant="icon"
                  iconName="add"
                  onPress={() => setModalStep('name')}
                />
              )}
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
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() =>
                    router.push({
                      pathname: '/groups/[id]',
                      params: { id: item.id },
                    })
                  }
                  style={styles.glassCard}
                >
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
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      </SafeAreaView>
    </BackgroundWrapper>
  );
}
