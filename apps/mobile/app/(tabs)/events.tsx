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
} from 'react-native-big-calendar';
import { Dimensions } from 'react-native';
import { Text } from '@react-navigation/elements';
import { Colors, EventColors } from '@/constants/Colors';
import { EventType } from '@bomber-app/database';
import { useColorScheme } from '@/hooks/useColorScheme';
import { lighten, toHex } from 'color2k';

// TODO: temp event and reference type in the code for now
const eventNotes = (
  <View style={{ marginTop: 3 }}>
    <Text style={{ fontSize: 10, color: 'white' }}>
      Phone number: 555-123-4567
    </Text>
    <Text style={{ fontSize: 10, color: 'white' }}>
      Arrive 15 minutes early
    </Text>
  </View>
);

// export interface ICalendarEventBase {
//     start: Date;
//     end: Date;
//     title: string;
//     children?: ReactElement | null;
//     hideHours?: boolean;
//     disabled?: boolean;
//     /**
//      * overlapping position of event starting from 0 (optional)
//      */
//     overlapPosition?: number;
//     /**
//      * number of events overlapping with this event (optional)
//      */
//     overlapCount?: number;
// }

export interface MyCustomEventType extends ICalendarEventBase {
  color: string;
  fill: boolean;
}

const events: Array<MyCustomEventType> = [
  {
    title: 'Watch Boxing',
    start: dayjs().set('hour', 0).set('minute', 0).set('second', 0).toDate(),
    end: dayjs().set('hour', 1).set('minute', 30).toDate(),
    color: EventColors[EventType.GLOBAL],
    fill: true,
  },
  {
    title: 'Meeting',
    start: dayjs().set('hour', 10).set('minute', 0).toDate(),
    end: dayjs().set('hour', 10).set('minute', 30).toDate(),
    color: EventColors[EventType.TOURNAMENT],
    fill: true,
  },
  {
    title: 'Coffee break',
    start: dayjs().set('hour', 14).set('minute', 30).toDate(),
    end: dayjs().set('hour', 15).set('minute', 30).toDate(),
    color: EventColors[EventType.PRACTICE],
    fill: false,
  },
  {
    title: 'with color prop',
    start: dayjs().set('hour', 16).set('minute', 0).toDate(),
    end: dayjs().set('hour', 18).set('minute', 30).toDate(),
    color: EventColors[EventType.TOURNAMENT],
    fill: false,
  },
  {
    title: 'Repair my car',
    start: dayjs().add(1, 'day').set('hour', 7).set('minute', 45).toDate(),
    end: dayjs().add(1, 'day').set('hour', 13).set('minute', 30).toDate(),
    color: EventColors[EventType.PRACTICE],
    fill: true,
  },
  {
    title: 'Meet Realtor',
    start: dayjs().add(1, 'day').set('hour', 8).set('minute', 25).toDate(),
    end: dayjs().add(1, 'day').set('hour', 9).set('minute', 55).toDate(),
    color: EventColors[EventType.PRACTICE],
    fill: true,
  },
  {
    title: 'Laundry',
    start: dayjs().add(1, 'day').set('hour', 8).set('minute', 25).toDate(),
    end: dayjs().add(1, 'day').set('hour', 11).set('minute', 0).toDate(),
    color: EventColors[EventType.TOURNAMENT],
    fill: true,
  },
  {
    title: "Doctor's appointment",
    start: dayjs().set('hour', 13).set('minute', 0).toDate(),
    end: dayjs().set('hour', 14).set('minute', 15).toDate(),
    color: EventColors[EventType.GLOBAL],
    children: eventNotes,
    fill: false,
  },
  {
    title: 'Plan a holiday',
    start: dayjs().set('hour', 13).set('minute', 0).add(1, 'month').toDate(),
    end: dayjs().set('hour', 14).set('minute', 15).add(1, 'month').toDate(),
    color: EventColors[EventType.TOURNAMENT],
    fill: true,
  },

  {
    title: 'Go on holiday',
    start: dayjs().set('hour', 13).set('minute', 0).add(3, 'month').toDate(),
    end: dayjs().set('hour', 14).set('minute', 15).add(3, 'month').toDate(),
    color: EventColors[EventType.TOURNAMENT],
    fill: false,
  },
];

const MAX_READABLE_EVENT_MINUTES = 32;

export default function EventsScreen() {
  const colorScheme = useColorScheme();
  // needs to be inside the component since it uses hooks to define the colors
  const useCustomEventRenderer: EventRenderer<MyCustomEventType> = (
    event,
    touchableOpacityProps
  ) => {
    return (
      <TouchableOpacity
        {...touchableOpacityProps}
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
      </TouchableOpacity>
    );
  };
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

  return (
    <BackgroundWrapper>
      <SafeAreaView
        style={[styles.safeContainer, { paddingBottom: insets.bottom }]}
      >
        <View style={{ flex: 1 }}>
          {/* TODO: ask Gunnar what he thinks a good default is: 3days, week, or day */}
          <Calendar
            theme={darkTheme}
            events={events}
            height={calendarHeight}
            scrollOffsetMinutes={offsetMinutes}
            ampm={true}
            mode={'3days'}
            renderEvent={useCustomEventRenderer}
          />
        </View>
      </SafeAreaView>
    </BackgroundWrapper>
  );
}
