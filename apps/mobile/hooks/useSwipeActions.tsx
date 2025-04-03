import { useRef } from 'react';
import Animated, {
  SharedValue,
  useAnimatedStyle,
  interpolate,
} from 'react-native-reanimated';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';

interface SwipeAction {
  label: string;
  color?: string;
  onPress: () => void;
}

export function useSwipeActions() {
  const swipeableRefs = useRef<Record<string, any | null>>({});

  const renderRightActions = (
    progress: SharedValue<number>,
    itemId: string,
    actions: SwipeAction[]
  ) => {
    const animatedStyle = useAnimatedStyle(() => {
      return {
        opacity: interpolate(progress.value, [0, 0.1, 1], [0, 0, 1], {
          extrapolateRight: 'clamp',
        }),
        transform: [
          {
            translateX: interpolate(progress.value, [0, 1], [50, 0], {
              extrapolateRight: 'clamp',
            }),
          },
          {
            scale: interpolate(progress.value, [0, 1], [0.9, 1], {
              extrapolateRight: 'clamp',
            }),
          },
        ],
      };
    });

    return (
      <Animated.View style={[styles.actionContainer, animatedStyle]}>
        {actions.map((action, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => {
              action.onPress();
              swipeableRefs.current[itemId]?.close();
            }}
            style={[
              styles.actionButton,
              { backgroundColor: action.color || 'gray' },
            ]}
          >
            <ThemedText style={styles.actionText}>{action.label}</ThemedText>
          </TouchableOpacity>
        ))}
      </Animated.View>
    );
  };

  return { swipeableRefs, renderRightActions };
}

const styles = StyleSheet.create({
  actionContainer: {
    flexDirection: 'row',
    display: 'flex',
    height: '100%',
  },
  actionButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 100,
    height: '100%',
  },
  actionText: {
    color: 'white',
    fontWeight: 'semibold',
  },
});
