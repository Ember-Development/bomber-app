import BackgroundWrapper from '@/components/ui/organisms/backgroundWrapper';
import { createGroupStyles } from '@/styles/groupsStyle';
import { View } from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { Calendar, ICalendarEventBase } from 'react-native-big-calendar';
import { Dimensions } from 'react-native';

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

export default function EventsScreen() {
  // TODO: figure out why the calc for the height isn't quite right
  const insets = useSafeAreaInsets();
  const styles = createGroupStyles('light');
  const screenHeight = Dimensions.get('window').height;
  const headerHeight = 0;
  const calendarHeight =
    screenHeight - insets.top - insets.bottom - headerHeight;

  const events: ICalendarEventBase[] = [
    {
      title: 'Meeting',
      start: new Date(2025, 6, 18, 10, 0),
      end: new Date(2025, 6, 18, 10, 30),
    },
    {
      title: 'Coffee break',
      start: new Date(2025, 6, 18, 15, 45),
      end: new Date(2025, 6, 18, 16, 30),
    },
  ];

  const curDate = new Date();
  const curMinutes = curDate.getMinutes();
  const curHours = curDate.getHours();
  const offsetMinutes = curMinutes + 60 * curHours;

  return (
    <BackgroundWrapper>
      <SafeAreaView
        style={[styles.safeContainer, { paddingBottom: insets.bottom }]}
      >
        <View style={{ flex: 1 }}>
          <Calendar
            events={events}
            height={calendarHeight}
            scrollOffsetMinutes={offsetMinutes}
          />
        </View>
      </SafeAreaView>
    </BackgroundWrapper>
  );
}
