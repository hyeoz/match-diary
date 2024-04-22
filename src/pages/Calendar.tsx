import { Text } from 'react-native';
import { Calendar as RNCalendar } from 'react-native-calendars';

import TouchableWrapper from '../components/TouchableWrapper';

function Calendar() {
  return (
    <TouchableWrapper>
      <Text>Calender</Text>
      <RNCalendar />
    </TouchableWrapper>
  );
}

export default Calendar;
