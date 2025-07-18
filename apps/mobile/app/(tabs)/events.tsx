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
  formatStartEnd,
  HourRenderer,
  ICalendarEventBase,
} from 'react-native-big-calendar';
import { Dimensions } from 'react-native';
import { Text } from '@react-navigation/elements';

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

export interface MyCustomEventType extends ICalendarEventBase {
  color?: string;
}
const events: Array<MyCustomEventType> = [
  {
    title: 'Watch Boxing',
    start: dayjs().set('hour', 0).set('minute', 0).set('second', 0).toDate(),
    end: dayjs().set('hour', 1).set('minute', 30).toDate(),
    color: '#ffffff',
  },
  {
    title: 'Meeting',
    start: dayjs().set('hour', 10).set('minute', 0).toDate(),
    end: dayjs().set('hour', 10).set('minute', 30).toDate(),
  },
  {
    title: 'Coffee break',
    start: dayjs().set('hour', 14).set('minute', 30).toDate(),
    end: dayjs().set('hour', 15).set('minute', 30).toDate(),
  },
  {
    title: 'with color prop',
    start: dayjs().set('hour', 16).set('minute', 0).toDate(),
    end: dayjs().set('hour', 18).set('minute', 30).toDate(),
    color: 'purple',
  },
  {
    title: 'Repair my car',
    start: dayjs().add(1, 'day').set('hour', 7).set('minute', 45).toDate(),
    end: dayjs().add(1, 'day').set('hour', 13).set('minute', 30).toDate(),
  },
  {
    title: 'Meet Realtor',
    start: dayjs().add(1, 'day').set('hour', 8).set('minute', 25).toDate(),
    end: dayjs().add(1, 'day').set('hour', 9).set('minute', 55).toDate(),
  },
  {
    title: 'Laundry',
    start: dayjs().add(1, 'day').set('hour', 8).set('minute', 25).toDate(),
    end: dayjs().add(1, 'day').set('hour', 11).set('minute', 0).toDate(),
  },
  {
    title: "Doctor's appointment",
    start: dayjs().set('hour', 13).set('minute', 0).toDate(),
    end: dayjs().set('hour', 14).set('minute', 15).toDate(),
    children: eventNotes,
  },
  {
    title: 'Plan a holiday',
    start: dayjs().set('hour', 13).set('minute', 0).add(1, 'month').toDate(),
    end: dayjs().set('hour', 14).set('minute', 15).add(1, 'month').toDate(),
  },

  {
    title: 'Go on holiday',
    start: dayjs().set('hour', 13).set('minute', 0).add(3, 'month').toDate(),
    end: dayjs().set('hour', 14).set('minute', 15).add(3, 'month').toDate(),
  },
];
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

export const customEventRenderer: EventRenderer<MyCustomEventType> = (
  event,
  touchableOpacityProps
) => {
  return (
    <TouchableOpacity
      {...touchableOpacityProps}
      style={[
        ...(touchableOpacityProps.style as RecursiveArray<ViewStyle>),
        {
          borderWidth: 1,
          borderColor: 'lightgrey',
          backgroundColor: event.color ? event.color : '#02edda',
          borderStyle: 'solid',
          borderRadius: 6,
          alignItems: 'center',
          justifyContent: 'center',
        },
      ]}
    >
      {dayjs(event.end).diff(event.start, 'minute') < 32 ? (
        <Text style={[{ color: 'black' }]}>
          {event.title},
          <Text style={[{ color: 'black' }]}>
            {dayjs(event.start).format('HH:mm')}
          </Text>
        </Text>
      ) : (
        <>
          <Text style={[{ color: 'black' }]}>{event.title}</Text>
          <Text style={[{ color: 'black' }]}>
            {formatStartEnd(event.start, event.end, 'HH:mm')}
          </Text>
          {event.children && event.children}
        </>
      )}
    </TouchableOpacity>
  );
};

export default function EventsScreen() {
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
            renderEvent={customEventRenderer}
          />
        </View>
      </SafeAreaView>
    </BackgroundWrapper>
  );
}
