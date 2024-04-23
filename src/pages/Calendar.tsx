import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Calendar as RNCalendar, LocaleConfig } from 'react-native-calendars';
import { MarkedDates } from 'react-native-calendars/src/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import dayjs from 'dayjs';

import TouchableWrapper from '../components/TouchableWrapper';
import { DATE_FORMAT } from '../utils/STATIC_DATA';
import Ball from '../assets/svg/ball.svg';
import CalendarHeader from 'react-native-calendars/src/calendar/header';
import { palette } from '../style/palette';

/* DONE
  - 데이터 있는 경우 marking

*/

/* TODO
  - 데이터 있는 경우 클릭 시 모달 열어서 데이터 보여주기 / 수정
  - 데이터 없는 경우 생성 모달 열기
  - 캘린더 스타일링, config, 날짜 넘기는 액션 구현
*/

LocaleConfig.locales['kr'] = {
  monthNames: [
    '1월',
    '2월',
    '3월',
    '4월',
    '5월',
    '6월',
    '7월',
    '8월',
    '9월',
    '10월',
    '11월',
    '12월',
  ],
  monthNamesShort: [
    '1월',
    '2월',
    '3월',
    '4월',
    '5월',
    '6월',
    '7월',
    '8월',
    '9월',
    '10월',
    '11월',
    '12월',
  ],
  dayNames: [
    '일요일',
    '월요일',
    '화요일',
    '수요일',
    '목요일',
    '금요일',
    '토요일',
  ],
  dayNamesShort: ['일', '월', '화', '수', '목', '금', '토'],
  today: '오늘',
};
LocaleConfig.defaultLocale = 'kr';

function Calendar() {
  const [markedDates, setMarkedDates] = useState<MarkedDates>({});
  const [selectedDate, setSelectedDate] = useState(dayjs().format(DATE_FORMAT));

  useEffect(() => {
    getAllItems();
  });

  const getSelectedItem = async () => {
    const res = await AsyncStorage.getItem(selectedDate);

    if (res) {
      const json = JSON.parse(res);
    }
  };

  const getAllItems = async () => {
    const keys = await AsyncStorage.getAllKeys();

    const _marked: MarkedDates = {};

    // NOTE storage 에 데이터가 있는 경우 dot
    keys.forEach(key => {
      _marked[key] = { marked: true };
    });
    setMarkedDates(_marked);
    // keys.length && setDatesHasItems(keys)
  };

  return (
    <TouchableWrapper>
      <View style={styles.calendarWrapper}>
        <RNCalendar
          onDayPress={day => {
            console.log('PRESS DAY', day);
          }}
          theme={{
            textDayHeaderFontFamily: 'KBO-Dia-Gothic-medium',
            arrowColor: palette.commonColor.green,
          }}
          markedDates={markedDates}
          firstDay={1}
          renderHeader={date => {
            return (
              <View
                style={{
                  flexDirection: 'row',
                  gap: 8,
                }}>
                <Text style={styles.headerText}>
                  {dayjs(date).format('YYYY')}년
                </Text>
                <Text style={styles.headerText}>
                  {dayjs(date).format('M')}월
                </Text>
              </View>
            );
          }}
          dayComponent={({ date, state, marking }) => {
            return (
              <View
                style={{
                  height: 48,
                  gap: 6,
                }}>
                <Text
                  style={[
                    {
                      color:
                        state === 'disabled'
                          ? '#888'
                          : dayjs(date?.dateString).day() === 6
                          ? '#0392cf'
                          : dayjs(date?.dateString).day() === 0
                          ? '#ee4035'
                          : '#000',
                      textAlign: 'center',
                    },
                    styles.calendarText,
                  ]}>
                  {date?.day}
                </Text>
                {marking?.marked && <Ball width={24} height={24} />}
              </View>
            );
          }}
        />
      </View>
    </TouchableWrapper>
  );
}

const styles = StyleSheet.create({
  calendarWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  headerText: {
    fontFamily: 'KBO-Dia-Gothic-bold',
    fontSize: 20,
  },
  calendarText: {
    fontFamily: 'KBO-Dia-Gothic-medium',
  },
});

export default Calendar;
