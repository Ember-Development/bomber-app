import BackgroundWrapper from '@/components/ui/organisms/backgroundWrapper';
import dayjs from 'dayjs';
import { createGroupStyles } from '@/styles/groupsStyle';
import {
  RecursiveArray,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import {
  Calendar,
  EventRenderer,
  ICalendarEventBase,
  Mode,
} from 'react-native-big-calendar';
import { Dimensions } from 'react-native';
import { Text } from '@react-navigation/elements';
import { Colors, EventColors } from '@/constants/Colors';
import { EventType } from '@bomber-app/database';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useState } from 'react';
import { Event } from '@react-native-community/datetimepicker';
import FullScreenModal from '@/components/ui/organisms/FullSheetModal';
import ViewEvent from '../events/modals/ViewEvent';
import CustomButton from '@/components/ui/atoms/Button';

// TODO: something more elegant would be nice i.e. enum but this is fine
type Modes = Exclude<Mode, 'custom'>;
const MODE_OPTIONS: Modes[] = ['day', '3days', 'week', 'month', 'schedule'];
const initMode: Modes = '3days';
const initModeIndex = MODE_OPTIONS.indexOf(initMode);

export interface MyCustomEventType extends ICalendarEventBase {
  id: string;
  color: string;
  fill: boolean;
}

const events: Array<MyCustomEventType> = [
  {
    id: '0',
    title: 'Watch Boxing',
    start: dayjs().set('hour', 0).set('minute', 0).set('second', 0).toDate(),
    end: dayjs().set('hour', 1).set('minute', 30).toDate(),
    color: EventColors[EventType.GLOBAL],
    fill: true,
  },
  {
    id: '1',
    title: 'Meeting',
    start: dayjs().set('hour', 10).set('minute', 0).toDate(),
    end: dayjs().set('hour', 10).set('minute', 30).toDate(),
    color: EventColors[EventType.TOURNAMENT],
    fill: true,
  },
  {
    id: '2',
    title: 'Coffee break',
    start: dayjs().set('hour', 14).set('minute', 30).toDate(),
    end: dayjs().set('hour', 15).set('minute', 30).toDate(),
    color: EventColors[EventType.PRACTICE],
    fill: false,
  },
  {
    id: '3',
    title: 'with color prop',
    start: dayjs().set('hour', 16).set('minute', 0).toDate(),
    end: dayjs().set('hour', 18).set('minute', 30).toDate(),
    color: EventColors[EventType.TOURNAMENT],
    fill: false,
  },
  {
    id: '4',
    title: 'Repair my car',
    start: dayjs().add(1, 'day').set('hour', 7).set('minute', 45).toDate(),
    end: dayjs().add(1, 'day').set('hour', 13).set('minute', 30).toDate(),
    color: EventColors[EventType.PRACTICE],
    fill: true,
  },
  {
    id: '5',
    title: 'Meet Realtor',
    start: dayjs().add(1, 'day').set('hour', 8).set('minute', 25).toDate(),
    end: dayjs().add(1, 'day').set('hour', 9).set('minute', 55).toDate(),
    color: EventColors[EventType.PRACTICE],
    fill: true,
  },
  {
    id: '6',
    title: 'Laundry',
    start: dayjs().add(1, 'day').set('hour', 8).set('minute', 25).toDate(),
    end: dayjs().add(1, 'day').set('hour', 11).set('minute', 0).toDate(),
    color: EventColors[EventType.TOURNAMENT],
    fill: true,
  },
  {
    id: '7',
    title: "Doctor's appointment",
    start: dayjs().set('hour', 13).set('minute', 0).toDate(),
    end: dayjs().set('hour', 14).set('minute', 15).toDate(),
    color: EventColors[EventType.GLOBAL],
    children: (
      <View style={{ marginTop: 3 }}>
        <Text style={{ fontSize: 10, color: 'white' }}>
          Phone number: 555-123-4567
        </Text>
        <Text style={{ fontSize: 10, color: 'white' }}>
          Arrive 15 minutes early
        </Text>
      </View>
    ),
    fill: false,
  },
  {
    id: '8',
    title: 'Plan a holiday',
    start: dayjs().set('hour', 13).set('minute', 0).add(1, 'month').toDate(),
    end: dayjs().set('hour', 14).set('minute', 15).add(1, 'month').toDate(),
    color: EventColors[EventType.TOURNAMENT],
    fill: true,
  },

  {
    id: '9',
    title: 'Go on holiday',
    start: dayjs().set('hour', 13).set('minute', 0).add(3, 'month').toDate(),
    end: dayjs().set('hour', 14).set('minute', 15).add(3, 'month').toDate(),
    color: EventColors[EventType.TOURNAMENT],
    fill: false,
  },
];

const MAX_READABLE_EVENT_MINUTES = 32;

export default function EventsScreen() {
  const [curEventView, setCurEventView] = useState<MyCustomEventType | Event>();
  const [curModeIndex, setCurModeIndex] = useState(initModeIndex);
  const colorScheme = useColorScheme();

  // TODO: figure out why the calc for the height isn't quite right
  const insets = useSafeAreaInsets();
  const styles = createGroupStyles('light');
  const screenHeight = Dimensions.get('window').height;
  const headerHeight = 0;
  const calendarHeight =
    screenHeight - insets.top - insets.bottom - headerHeight;

  const curDate = new Date();
  const curMinutes = curDate.getMinutes();
  const curHours = curDate.getHours();
  const offsetMinutes = curMinutes + 60 * curHours;

  const darkTheme = {
    palette: {
      primary: {
        main: '#6185d0',
        contrastText: '#000',
      },
      gray: {
        '100': '#333',
        '200': '#666',
        '300': '#888',
        '500': '#aaa',
        '800': '#ccc',
      },
    },
  };

  // needs to be inside the component since it uses hooks to define the colors
  const useCustomEventRenderer: EventRenderer<MyCustomEventType> | Event = (
    event,
    touchableOpacityProps
  ) => {
    return (
      <TouchableOpacity
        {...touchableOpacityProps}
        disabled={false}
        key={touchableOpacityProps.key}
        style={[
          ...(touchableOpacityProps.style as RecursiveArray<ViewStyle>),
          {
            borderWidth: 1,
            borderColor: event.color,
            backgroundColor: event.fill ? event.color : `${event.color}20`,
            borderStyle: 'solid',
            borderRadius: 6,
            alignItems: 'center',
            justifyContent: 'center',
          },
        ]}
      >
        {/* Render a shortened version of contents if a small event, otherwise give it all to me baby  */}
        {dayjs(event.end).diff(event.start, 'minute') <
        MAX_READABLE_EVENT_MINUTES ? (
          <Text style={[{ color: Colors[colorScheme.theme].text }]}>
            {event.title},
            <Text style={[{ color: Colors[colorScheme.theme].text }]}>
              {dayjs(event.start).format('HH:mm A')}
            </Text>
          </Text>
        ) : (
          <>
            <Text style={[{ color: Colors[colorScheme.theme].text }]}>
              {event.title}
            </Text>
            <Text style={[{ color: Colors[colorScheme.theme].text }]}>
              {/* TODO: there's a tricky little feature here which is when we cross Noon or Midnight we would probably prefer to show AMPM on both but I'm fine with this for now */}
              {`${dayjs(event.start).format('HH:mm')} - ${dayjs(event.end).format('HH:mm A')}`}
            </Text>
            {event.children && event.children}
          </>
        )}
        <FullScreenModal
          isVisible={Boolean(curEventView)}
          onClose={() => setCurEventView(undefined)}
          title="Edit Profile"
        >
          <ViewEvent />
        </FullScreenModal>
      </TouchableOpacity>
    );
  };

  return (
    <BackgroundWrapper>
      <SafeAreaView
        style={[styles.safeContainer, { paddingBottom: insets.bottom }]}
      >
        {/* Header   */}
        <View style={{ flexDirection: 'row' }}>
          <CustomButton
            title={MODE_OPTIONS[curModeIndex]}
            onPress={() => {
              setCurModeIndex((curModeIndex + 1) % MODE_OPTIONS.length);
            }}
          />
          <View />
        </View>

        {/* Body / Calendar */}
        <View style={{ flex: 1 }}>
          <Calendar
            theme={darkTheme}
            events={events}
            height={calendarHeight}
            scrollOffsetMinutes={offsetMinutes}
            ampm={true}
            mode={MODE_OPTIONS[curModeIndex]}
            renderEvent={useCustomEventRenderer}
            onPressEvent={(event: MyCustomEventType) => {
              setCurEventView(event);
              return;
            }}
          />
        </View>
      </SafeAreaView>
    </BackgroundWrapper>
  );
}
