import { useCallback, useEffect, useState } from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import dayjs from 'dayjs';
import { Calendar as RNCalendar, LocaleConfig } from 'react-native-calendars';
import { DateData, MarkedDates } from 'react-native-calendars/src/types';
import { DayProps } from 'react-native-calendars/src/calendar/day';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ImageOrVideo } from 'react-native-image-crop-picker';

import TouchableWrapper from '../components/TouchableWrapper';
import { Detail } from '../components/Detail';
import { DATE_FORMAT } from '../utils/STATIC_DATA';
import { palette } from '../style/palette';
import Ball from '../assets/svg/ball.svg';
import Pin from '../assets/svg/paperclip.svg';
import UploadModal from '../components/UploadModal';

/* DONE
  - 데이터 있는 경우 marking

*/

/* TODO
  - 데이터 있는 경우 클릭 시 모달 열어서 데이터 보여주기 / 수정
  - 데이터 없는 경우 생성 모달 열기
  - 캘린더 스타일링, config, 날짜 넘기는 액션 구현
*/

const { width } = Dimensions.get('window');

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
  const [isVisible, setIsVisible] = useState(false);
  const [image, setImage] = useState<ImageOrVideo | null>(null);
  const [memo, setMemo] = useState('');
  const [isEdit, setIsEdit] = useState(false);

  const detailProps = {
    image: image,
    setImage: setImage,
    memo: memo,
    setMemo: setMemo,
    setIsEdit: setIsEdit,
    setIsVisible: setIsVisible,
  };

  useEffect(() => {
    getAllItems();
  }, []);

  useEffect(() => {
    getSelectedItem();
  }, [selectedDate]);

  const getSelectedItem = async () => {
    const res = await AsyncStorage.getItem(selectedDate);

    if (res) {
      const json: { image: ImageOrVideo; memo: string } = JSON.parse(res);
      setImage(json.image);
      setMemo(json.memo);
    }
  };

  const getAllItems = async () => {
    const keys = await AsyncStorage.getAllKeys();

    const _marked: MarkedDates = {};

    // NOTE storage 에 데이터가 있는 경우 dot
    keys.forEach(key => {
      _marked[key] = { marked: true };

      if (key === selectedDate) {
        _marked[key] = {
          ..._marked[key],
          selected: true,
          selectedColor: palette.commonColor.green,
        };
      }
    });
    setMarkedDates(_marked);
    // keys.length && setDatesHasItems(keys)
  };

  const onDayPress = useCallback((day?: DateData) => {
    console.log('PRESS DAY', day);
    setSelectedDate(dayjs(day?.dateString).format(DATE_FORMAT));
  }, []);

  const dayComponent = useCallback(
    (
      props: DayProps & {
        date?: DateData;
      },
    ) => (
      <DayComponent
        key={props.date?.dateString}
        selectedDate={selectedDate}
        {...props}
        onPress={onDayPress}
      />
    ),
    [onDayPress, selectedDate],
  );

  return (
    <TouchableWrapper>
      <View style={styles.calendarWrapper}>
        <RNCalendar
          style={styles.calendar}
          // onDayPress={onDayPress}
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
          dayComponent={dayComponent}
        />
      </View>

      {/* TODO 데이터 있는 경우 보여주기 */}
      {/* TODO 데이터 없는 경우 직관기록이 없어요 */}
      <View style={{ flex: 1, flexDirection: 'row', height: '100%' }}>
        {image && memo ? (
          <View
            style={{
              width: width * 0.6,
              marginHorizontal: 16,
            }}>
            <Pin
              width={32}
              height={32}
              style={{
                position: 'absolute',
                zIndex: 9,
              }}
            />
            <Detail {...detailProps} isCalendar />
          </View>
        ) : (
          <View style={{ borderWidth: 1, width: '60%', marginHorizontal: 16 }}>
            <Text>222</Text>
          </View>
        )}
        {/* TODO 총 직관기록 / 승패 / 승률 */}
        <View
          style={{
            flex: 1,
            borderWidth: 1,
            borderColor: 'red',
            marginRight: 16,
          }}>
          <Text>Right</Text>
        </View>
      </View>

      <UploadModal {...detailProps} isVisible={isVisible} />
    </TouchableWrapper>
  );
}

function DayComponent({
  date,
  state,
  marking,
  onPress,
  selectedDate,
  ...props
}: DayProps & {
  date?: DateData | undefined;
  selectedDate: string;
}) {
  // console.log('DAY');
  return (
    <TouchableOpacity
      onPress={() => onPress && onPress(date)}
      style={{
        width: '100%',
        height: 40,
        gap: 6,
        margin: 0,
        alignItems: 'center',
        justifyContent: 'flex-start',
      }}>
      <View
        style={{
          position: 'relative',
          width: '100%',
        }}>
        <View
          style={{
            width: '50%',
            height: 12,
            // backgroundColor: 'rgba(	123,	193,	88, 0.3)',
            backgroundColor:
              dayjs(date?.dateString).format(DATE_FORMAT) === selectedDate
                ? 'rgba(	123,	193,	88, 0.3)'
                : 'transparent',
            position: 'absolute',
            top: 4,
            left: '25%',
          }}
        />
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
              position: 'relative',
            },
            styles.calendarText,
          ]}>
          {date?.day}
        </Text>
      </View>
      {marking?.marked && <Ball width={16} height={16} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  calendarWrapper: {
    alignItems: 'center',
    flex: 1,
  },
  calendar: {
    width: width - 32,
    height: 342,
    marginTop: 20,
    borderRadius: 16,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 24,
    zIndex: 99,
  },
  headerText: {
    fontFamily: 'KBO-Dia-Gothic-bold',
    fontSize: 18,
  },
  calendarText: {
    fontFamily: 'KBO-Dia-Gothic-medium',
  },
});

export default Calendar;
