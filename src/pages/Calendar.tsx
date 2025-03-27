import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActionSheetIOS,
  Alert,
  Dimensions,
  FlatList,
  ListRenderItemInfo,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import dayjs from 'dayjs';
import { Calendar as RNCalendar, LocaleConfig } from 'react-native-calendars';
import { DateData, MarkedDates } from 'react-native-calendars/src/types';
import { DayProps } from 'react-native-calendars/src/calendar/day';
import Toast from 'react-native-toast-message';

import TouchableWrapper from '@components/TouchableWrapper';
import { Detail } from '@components/Detail';
import UploadModal from '@components/UploadModal';
import { useCarouselIndexState, useTabHistory } from '@stores/default';
import { API } from '@api/index';
import {
  DATE_FORMAT,
  DAYS_NAME_KOR,
  DAYS_NAME_KOR_SHORT,
  INIT_COUNT_DATA,
  MINIMUM_HEIGHT,
  MONTH_LIST,
} from '@utils/STATIC_DATA';
import { palette } from '@style/palette';
import { RecordType } from '@/type/record';
import { AnswerCircle, Ball, PaperClip } from '@assets/svg';
import Loading from '@/components/Loading';
import { getMatchByDate, getMatchById } from '@/api/match';
import { useUserState } from '@/stores/user';
import { getAllUserRecords, getRecordByDate } from '@/api/record';
import { MatchBookingType, MatchDataType } from '@/type/match';
import { useStadiumsState, useTeamsState } from '@/stores/teams';
import { StadiumType, TeamType } from '@/type/team';
import { onCreateTriggerNotification } from '@/hooks/schedulingHook';

const { width, height } = Dimensions.get('window');

LocaleConfig.locales.kr = {
  monthNames: MONTH_LIST,
  monthNamesShort: MONTH_LIST,
  dayNames: DAYS_NAME_KOR,
  dayNamesShort: DAYS_NAME_KOR_SHORT,
  today: '오늘',
};
LocaleConfig.defaultLocale = 'kr';

function Calendar() {
  const [markedDates, setMarkedDates] = useState<MarkedDates>({});
  const [selectedDate, setSelectedDate] = useState(dayjs().format(DATE_FORMAT));
  const [isVisible, setIsVisible] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [matches, setMatches] = useState<MatchDataType[]>([]);
  const [matchRecord, setMatchRecord] = useState(INIT_COUNT_DATA); // NOTE my team 이 없는 경우 모두 home 안에 기록됩니다
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState<RecordType[]>([]); // 같은 날 중복된 기록들 관리
  const [weeksInMonth, setWeeksInMonth] = useState(0);
  const [bookings, setBookings] = useState<MatchBookingType[]>([]);

  const { history } = useTabHistory();
  const { teamId, uniqueId } = useUserState();
  const { teams } = useTeamsState();
  const { stadiums } = useStadiumsState();
  const { carouselIndexState } = useCarouselIndexState();

  const detailProps = {
    isEdit,
    setIsEdit,
    setIsVisible,
    matches,
    records,
    setRecords,
  };

  useEffect(() => {
    getRecordsBySelectedDate();
    getMatchData();
    handleRecordsCount();
    getBookings();
  }, [history, teamId, selectedDate]);

  useEffect(() => {
    getAllRecords();
  }, [history, teamId, isVisible]);

  const getRecordsBySelectedDate = async () => {
    const res = await getRecordByDate(selectedDate);

    if (res.data.length) {
      setRecords(res.data);
      setIsEdit(true);
    } else {
      setRecords([]);
      setIsEdit(false);
    }
  };

  const getAllRecords = async () => {
    const allRecords = await getAllUserRecords();

    const _marked: MarkedDates = {};

    // NOTE storage 에 데이터가 있는 경우 dot
    allRecords.data.forEach(key => {
      const newDate = dayjs(key.date).format(DATE_FORMAT);
      _marked[newDate] = { marked: true };

      if (newDate === selectedDate) {
        _marked[newDate] = {
          ..._marked[newDate],
          selected: true,
          selectedColor: palette.commonColor.green,
        };
      }
    });

    setMarkedDates(_marked);
  };

  const onDayPress = useCallback((day?: DateData) => {
    setSelectedDate(dayjs(day?.dateString).format(DATE_FORMAT));
  }, []);

  const currentCellHeight = useMemo(() => {
    if (Platform.OS === 'ios') {
      if (weeksInMonth === 4) {
        return 37;
      } else if (weeksInMonth === 5) {
        return 35;
      } else if (weeksInMonth === 6) {
        return 28;
      }
    }
    if (Platform.OS === 'android') {
      if (weeksInMonth === 4) {
        return 35;
      } else if (weeksInMonth === 5) {
        return 30;
      } else if (weeksInMonth === 6) {
        return 28;
      }
    }
    return 28;
  }, [weeksInMonth]);

  const dayComponent = useCallback(
    (
      props: DayProps & {
        date?: DateData;
      },
    ) => {
      return (
        <DayComponent
          key={props.date?.dateString}
          selectedDate={selectedDate}
          {...props}
          onPress={onDayPress}
          cellHeight={currentCellHeight}
          bookingDates={bookings.map(({ date }) =>
            dayjs(date).format(DATE_FORMAT),
          )}
        />
      );
    },
    [onDayPress, selectedDate, weeksInMonth, currentCellHeight, bookings],
  );

  const headerComponent = (date: string) => {
    return (
      <View
        style={{
          flexDirection: 'row',
          gap: 8,
        }}>
        <Text style={styles.headerText}>{dayjs(date).format('YYYY')}년</Text>
        <Text style={styles.headerText}>{dayjs(date).format('M')}월</Text>
      </View>
    );
  };

  const getMatchData = async () => {
    setLoading(true);

    const res = await getMatchByDate(selectedDate);

    if (!res.data.length) {
      setMatches([]);
      return;
    }
    setMatches(res.data);
    setLoading(false);
  };

  // NOTE 직관 승패 기록 계산
  const handleRecordsCount = async () => {
    let recordsCnt = {
      byMonth: {
        home: 0,
        away: 0,
      },
      bySeason: {
        home: 0,
        away: 0,
      },
      rate: {
        win: 0,
        lose: 0,
        draw: 0,
      },
    };

    const allUserRecords = await API.post<RecordType[]>('/user-records', {
      userId: uniqueId,
    });

    // NOTE 한 시즌 기준 승률 계산
    const thisYearRecords = allUserRecords.data
      .filter(record => dayjs(record.date).year() === dayjs().year())
      .filter(record => record.match_id);

    // 모든 경기 정보를 동시에 가져오기
    const matchPromises = thisYearRecords.map(record =>
      getMatchById(record.match_id!),
    );

    const matchResults = await Promise.all(matchPromises);
    const allMatches = [];
    for (const result of matchResults) {
      const data = result?.data as MatchDataType;

      if (data) {
        allMatches.push(data);
      }
    }
    // 결과 처리
    allMatches.forEach(data => {
      if (!data) return;

      // ANCHOR 내 팀 경기 기록
      // 홈경기
      if (teamId === data.home) {
        if (dayjs(data.date).year() === dayjs().year()) {
          recordsCnt.bySeason.home += 1;
        }
        if (dayjs(data.date).month() === dayjs().month()) {
          recordsCnt.byMonth.home += 1;
        }
        if (data.home_score > data.away_score) {
          recordsCnt.rate.win += 1;
        } else if (data.home_score < data.away_score) {
          recordsCnt.rate.lose += 1;
        } else {
          recordsCnt.rate.draw += 1;
        }
      } else if (teamId === data.away) {
        // 원정경기
        if (dayjs(data.date).year() === dayjs().year()) {
          recordsCnt.bySeason.away += 1;
        }
        if (dayjs(data.date).month() === dayjs().month()) {
          recordsCnt.byMonth.away += 1;
        }
        if (data.home_score > data.away_score) {
          recordsCnt.rate.lose += 1;
        } else if (data.home_score < data.away_score) {
          recordsCnt.rate.win += 1;
        } else {
          recordsCnt.rate.draw += 1;
        }
      }
      // 내 팀 경기 아닌 경우 승률은 계산하지 않음
    });
    setMatchRecord(recordsCnt);
  };

  const onPressScheduling = async () => {
    Alert.alert(
      '선택한 날짜에 직관 알림을 예약할까요?',
      '해당 날짜에 알림을 보내드릴게요!',
      [
        { text: '취소', onPress: () => {} }, // TODO
        {
          text: '예약하기',
          onPress: async () => {
            if (!selectedDate) {
              Toast.show({
                type: 'info',
                text1: '날짜를 먼저 선택해주세요!',
              });
              return;
            }
            await onCreateTriggerNotification(selectedDate);
            await getBookings();
            Toast.show({
              type: 'success',
              text1: '직관 알림 예약이 완료되었어요!',
              text2: '선택한 날짜에 알려드릴게요!',
            });
          },
        },
      ],
    );
  };

  const onDeleteBooking = async () => {
    const id = bookings.find(
      book => dayjs(book.date).format(DATE_FORMAT) === selectedDate,
    )?.booking_id;

    try {
      await API.delete(`/bookings/${id}`);
      Toast.show({
        type: 'success',
        text1: '직관 예약이 성공적으로 삭제되었어요.',
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: '삭제를 실패했어요! 다시 시도해주세요.',
      });
    }

    await getBookings();
  };

  const getBookings = async () => {
    try {
      const res = await API.post<MatchBookingType[]>('/bookings', {
        userId: uniqueId,
      });
      setBookings(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const selectAddRecordMode = async () => {
    const bookingDates = bookings.map(({ date }) =>
      dayjs(date).format(DATE_FORMAT),
    );
    const isBooked = bookingDates.includes(selectedDate);

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: isBooked
            ? ['취소', '직관 기록하기', '직관 예약 취소']
            : ['취소', '직관 기록하기', '직관 예약하기'],
          cancelButtonIndex: 0,
        },
        buttonIndex => {
          if (buttonIndex === 1) {
            setIsVisible(true);
          } else if (buttonIndex === 2) {
            isBooked ? onDeleteBooking() : onPressScheduling();
          }
        },
      );
    } else if (Platform.OS === 'android') {
      Alert.alert(
        '선택하기',
        '해당 날짜에 추가할 액션을 선택해주세요!',
        [
          {
            text: '취소',
            onPress: () => {}, // TODO
            style: 'cancel',
          },
          {
            text: '직관 기록',
            onPress: () => setIsVisible(true),
          },
          {
            text: isBooked ? '직관 예약 삭제' : '직관 예약',
            onPress: () => (isBooked ? onDeleteBooking() : onPressScheduling()),
          },
        ],
        { cancelable: true, onDismiss: () => {} },
      );
    }
  };

  return (
    <TouchableWrapper bgColor={palette.commonColor.greenBg}>
      <View style={styles.calendarWrapper}>
        <RNCalendar
          style={styles.calendar}
          theme={{
            textDayHeaderFontFamily: 'KBO Dia Gothic_medium',
            arrowColor: palette.commonColor.green,
          }}
          markedDates={markedDates}
          firstDay={1}
          renderHeader={headerComponent}
          dayComponent={dayComponent}
          onMonthChange={(data: DateData) => {
            const weeks = getWeeksInMonth(data.dateString);
            setWeeksInMonth(weeks);
          }}
        />
      </View>

      <View style={{ flex: 1, flexDirection: 'row', height: '100%' }}>
        <View style={styles.detailWrapper}>
          <PaperClip
            width={32}
            height={32}
            style={{
              position: 'absolute',
              zIndex: 9,
              top: height < MINIMUM_HEIGHT ? 2 : -12,
            }}
          />
          {records[carouselIndexState]?.image &&
          records[carouselIndexState]?.user_note ? (
            <Detail
              {...detailProps}
              isCalendar
              refetch={() => {
                getAllRecords();
                handleRecordsCount();
              }}
              date={selectedDate}
            />
          ) : (
            <TouchableOpacity
              onPress={() => {
                if (
                  new Date(selectedDate + 'T00:00:00.000Z') <=
                  new Date(dayjs().format('YYYY-MM-DD') + 'T00:00:00.000Z')
                ) {
                  setIsVisible(true);
                } else {
                  selectAddRecordMode();
                }
              }}
              style={{
                padding: height < MINIMUM_HEIGHT ? 0 : 16,
                marginTop: height < MINIMUM_HEIGHT ? 16 : -16,
              }}>
              <View
                style={{
                  zIndex: 1,
                  backgroundColor: '#fef9f4',
                  width: '100%',
                  height: 200,
                  padding: 16,
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}>
                {matches.length === 1 ? (
                  loading ? (
                    <Loading />
                  ) : (
                    <View>
                      <Text style={[styles.stickyNoteText, { fontSize: 18 }]}>
                        오늘의 경기
                      </Text>
                      <Text
                        style={[
                          styles.stickyNoteText,
                          {
                            textAlign: 'center',
                            fontSize: 20,
                          },
                        ]}>
                        {
                          teams.find(team => team.team_id === matches[0].home)
                            ?.team_short_name
                        }{' '}
                        VS{' '}
                        {
                          teams.find(team => team.team_id === matches[0].away)
                            ?.team_short_name
                        }
                      </Text>
                      {!!matches[0].home && (
                        <View>
                          <AnswerCircle
                            width={88}
                            height={88}
                            style={{
                              position: 'absolute',
                              top: -30,
                              left: '50%',
                              transform: [
                                {
                                  translateX: -44,
                                },
                              ],
                            }}
                          />
                          <Text
                            style={[
                              styles.stickyNoteText,
                              { fontSize: 18, textAlign: 'center' },
                            ]}>
                            (
                            {
                              stadiums.find(
                                stadium =>
                                  stadium.stadium_id === matches[0].stadium,
                              )?.stadium_short_name
                            }
                            )
                          </Text>
                        </View>
                      )}
                    </View>
                  )
                ) : matches.length ? (
                  <View>
                    <Text style={[styles.stickyNoteText, { fontSize: 18 }]}>
                      오늘의 경기
                    </Text>
                    <FlatList
                      data={matches}
                      renderItem={props =>
                        MatchesItem({ teams, stadiums, ...props })
                      }
                    />
                  </View>
                ) : (
                  <View>
                    <Text style={[styles.stickyNoteText, { fontSize: 18 }]}>
                      오늘의 경기
                    </Text>
                    <Text
                      style={[
                        styles.stickyNoteText,
                        {
                          textAlign: 'center',
                          fontSize: 20,
                        },
                      ]}>
                      없음TT
                    </Text>
                  </View>
                )}
                <Text
                  style={[
                    styles.stickyNoteText,
                    {
                      fontSize: 20,
                      textAlign: 'right',
                    },
                  ]}>
                  야구장 가고싶다...
                </Text>
              </View>
              <View style={[styles.shadow]} />
              <View style={styles.effect} />
            </TouchableOpacity>
          )}
        </View>
        {/* SECTION 총 직관기록 / 승패 / 승률 */}
        <View
          style={{
            flex: 1,
            marginRight: 16,
            gap: 16,
            paddingTop: 16,
          }}>
          <View style={styles.stickyNoteWrapper}>
            <Text style={[styles.stickyNoteText]}>이번 달 직관 기록</Text>
            <Text
              style={[
                styles.stickyNoteText,
                {
                  textAlign: 'right',
                },
              ]}>
              {teamId
                ? `홈 ${matchRecord.byMonth.home}번 / 원정 ${matchRecord.byMonth.away}번`
                : `${matchRecord.byMonth.home}번`}
            </Text>
            <Text style={[styles.stickyNoteText]}>이번 시즌 직관 기록</Text>
            <Text
              style={[
                styles.stickyNoteText,
                {
                  textAlign: 'right',
                },
              ]}>
              {teamId
                ? `홈 ${matchRecord.bySeason.home}번 / 원정 ${matchRecord.bySeason.away}번`
                : `${matchRecord.bySeason.home}번`}
            </Text>
          </View>
          {teamId && (
            <View
              style={[
                styles.stickyNoteWrapper,
                {
                  transform: [
                    {
                      rotate: '-5deg',
                    },
                  ],
                },
              ]}>
              <Text style={[styles.stickyNoteText]}>내 직관 승률</Text>
              <Text
                style={[
                  styles.stickyNoteText,
                  {
                    textAlign: 'right',
                  },
                ]}>
                {`${matchRecord.rate.win}승 ${matchRecord.rate.lose}패`}
              </Text>
            </View>
          )}
        </View>
      </View>

      <UploadModal {...detailProps} isVisible={isVisible} date={selectedDate} />
      <Toast />
    </TouchableWrapper>
  );
}

function DayComponent({
  date,
  state,
  marking,
  onPress,
  selectedDate,
  cellHeight,
  bookingDates,
  ...props
}: DayProps & {
  date?: DateData;
  selectedDate: string;
  cellHeight: number;
  bookingDates: string[];
}) {
  return (
    <TouchableOpacity
      onPress={() => onPress && onPress(date)}
      style={{
        width: '100%',
        height: cellHeight,
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
        {/* 선택된 날짜 */}
        <View
          style={{
            backgroundColor:
              dayjs(date?.dateString).format(DATE_FORMAT) === selectedDate
                ? 'rgba(	123,	193,	88, 0.3)'
                : 'transparent',
            width: '50%',
            height: 12,
            position: 'absolute',
            top: 4,
            left: '25%',
          }}
        />
        {/* 직관 예약된 날짜 */}
        {date &&
          bookingDates.includes(dayjs(date.dateString).format(DATE_FORMAT)) &&
          !marking?.marked && (
            <AnswerCircle
              style={{
                position: 'absolute',
                top: -16,
                left: '50%',
                transform: [{ translateX: -22 }],
              }}
              width={48}
              height={48}
            />
          )}
        <Text
          style={[
            {
              color:
                state === 'disabled'
                  ? palette.greyColor.gray8
                  : dayjs(date?.dateString).day() === 6
                  ? palette.commonColor.saturday
                  : dayjs(date?.dateString).day() === 0
                  ? palette.commonColor.sunday
                  : palette.greyColor.black,
              textAlign: 'center',
              position: 'relative',
            },
            styles.calendarText,
          ]}>
          {date?.day}
        </Text>
      </View>
      {/* 기록 있는 경우 */}
      {marking?.marked && <Ball width={16} height={16} />}
    </TouchableOpacity>
  );
}

function MatchesItem({
  teams,
  stadiums,
  ...props
}: ListRenderItemInfo<MatchDataType> & {
  teams: TeamType[];
  stadiums: StadiumType[];
}) {
  const { home, away, stadium } = props.item;

  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <View style={{ flexDirection: 'row', gap: 4 }}>
        <Text style={styles.stickyNoteText}>
          {teams.find(team => team.team_id === away)?.team_short_name}
        </Text>
        <Text style={styles.stickyNoteText}>VS</Text>
        <Text style={styles.stickyNoteText}>
          {teams.find(team => team.team_id === home)?.team_short_name}
        </Text>
      </View>
      <Text style={styles.stickyNoteText}>
        @{stadiums.find(s => s.stadium_id === stadium)?.stadium_short_name}
      </Text>
    </View>
  );
}

const getWeeksInMonth = (date: string) => {
  const firstDayOfMonth = dayjs(date).startOf('month');
  const totalDays = firstDayOfMonth.daysInMonth();
  const startDayOfWeek =
    firstDayOfMonth.day() === 0 ? 6 : firstDayOfMonth.day() - 1;

  return Math.ceil((startDayOfWeek + totalDays) / 7);
};

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
    zIndex: 99,
  },
  headerText: {
    fontSize: 18,
    ...Platform.select({
      android: {
        fontFamily: 'KBO Dia Gothic_bold',
      },
      ios: {
        fontFamily: 'KBO-Dia-Gothic-bold',
      },
    }),
  },
  calendarText: {
    ...Platform.select({
      android: {
        fontFamily: 'KBO Dia Gothic_medium',
      },
      ios: {
        fontFamily: 'KBO-Dia-Gothic-medium',
      },
    }),
  },
  detailWrapper: {
    width: width * 0.6,
    marginLeft: 16,
  },
  stickyNoteWrapper: {
    aspectRatio: 1 / 1,
    backgroundColor: palette.commonColor.yellow,
    padding: 8,
    gap: 6,
    transform: [
      {
        rotate: '5deg',
      },
    ],
  },
  stickyNoteText: {
    fontFamily: 'UhBee Seulvely',
    fontSize: 12,
  },

  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  effect: {
    position: 'absolute',
    height: 200,
  },
  shadow: {
    zIndex: -1,
    position: 'absolute',
    bottom: 15,
    left: 32,
    width: '90%',
    height: 180,
    top: 22,
    backgroundColor: '#777',
    shadowColor: '#777',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 1,
    transform: [{ rotate: '3deg' }],
  },
});

export default Calendar;
