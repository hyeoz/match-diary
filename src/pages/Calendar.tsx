import React, { useCallback, useEffect, useState } from 'react';
import {
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
import AsyncStorage from '@react-native-async-storage/async-storage';
// import { ImageOrVideo } from 'react-native-image-crop-picker';
import uuid from 'react-native-uuid';

import TouchableWrapper from '@components/TouchableWrapper';
import { Detail } from '@components/Detail';
import UploadModal from '@components/UploadModal';
import { useCarouselIndexState, useTabHistory } from '@stores/default';
import { API } from '@api/index';
import {
  DATE_FORMAT,
  DAYS_NAME_KOR,
  DAYS_NAME_KOR_SHORT,
  MONTH_LIST,
  RESET_RECORD,
} from '@utils/STATIC_DATA';
import { palette } from '@style/palette';
import { RecordType } from '@/type/default';
import { AnswerCircle, Ball, PaperClip } from '@assets/svg';
import Loading from '@/components/Loading';
import { getMatchByDate, getMatchById } from '@/api/match';
import { useUserState, useViewedMatchState } from '@/stores/user';
import { getAllUserRecords, getRecordByDate } from '@/api/record';
import { MatchDataType } from '@/type/match';
import { useTeamsState } from '@/stores/teams';

const { width } = Dimensions.get('window');

LocaleConfig.locales.kr = {
  monthNames: MONTH_LIST,
  monthNamesShort: MONTH_LIST,
  dayNames: DAYS_NAME_KOR,
  dayNamesShort: DAYS_NAME_KOR_SHORT,
  today: '오늘',
};
LocaleConfig.defaultLocale = 'kr';

const initCountData = {
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

function Calendar() {
  const [markedDates, setMarkedDates] = useState<MarkedDates>({});
  const [selectedDate, setSelectedDate] = useState(dayjs().format(DATE_FORMAT));
  const [isVisible, setIsVisible] = useState(false);
  // const [image, setImage] = useState<ImageOrVideo | null>(null);
  // const [memo, setMemo] = useState('');
  // const [selectedStadium, setSelectedStadium] = useState('');
  const [isEdit, setIsEdit] = useState(false);
  const [matches, setMatches] = useState<MatchDataType[]>([]);
  const [matchRecord, setMatchRecord] = useState(initCountData); // NOTE my team 이 없는 경우 모두 home 안에 기록됩니다
  const [loading, setLoading] = useState(false);
  const [weeksCount, setWeeksCount] = useState(0);
  const [records, setRecords] = useState<RecordType[]>([]); // 같은 날 중복된 기록들 관리

  const { history } = useTabHistory();
  const { teamId, uniqueId } = useUserState();
  const { teams } = useTeamsState();
  const { carouselIndexState } = useCarouselIndexState();
  const { viewedMatch } = useViewedMatchState();

  const year = dayjs(selectedDate).year();

  const detailProps = {
    isEdit,
    setIsEdit,
    setIsVisible,
    matches,
    records,
    setRecords,
  };

  useEffect(() => {
    if (!records.length) return;

    setRecords(
      records.sort((a, b) => {
        if (a.date === records[carouselIndexState].date) return -1;
        if (b.date === records[carouselIndexState].date) return 1;
        return (
          records.findIndex(value => value.records_id === a.records_id) -
          records.findIndex(value => value.records_id === b.records_id)
        );
      }),
    );
  }, []);

  useEffect(() => {
    getRecordsBySelectedDate();
    getMatchData();
  }, [history, teamId, selectedDate]);

  useEffect(() => {
    getAllRecords();
    handleRecordsCount();
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

  const dayComponent = useCallback(
    (
      props: DayProps & {
        date?: DateData;
      },
    ) => (
      <DayComponent
        key={props.date?.dateString}
        selectedDate={selectedDate}
        weeksCount={weeksCount}
        setWeeksCount={setWeeksCount}
        {...props}
        onPress={onDayPress}
      />
    ),
    [onDayPress, selectedDate, weeksCount],
  );

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

    allUserRecords.data.forEach(async record => {
      const matchInfo = await getMatchById(record.match_id);
      const data = matchInfo?.data as MatchDataType;

      // ANCHOR 내 팀 경기 기록
      // 홈경기
      if (teamId === data.home) {
        if (dayjs(data.date).year === dayjs().year) {
          recordsCnt.bySeason.home += 1;
        }
        if (dayjs(data.date).month === dayjs().month) {
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
        if (dayjs(data.date).year === dayjs().year) {
          recordsCnt.bySeason.away += 1;
        }
        if (dayjs(data.date).month === dayjs().month) {
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
      // 내 팀 경기가 아닌 경우 승률은 계산하지 않음
    });

    setMatchRecord(recordsCnt);
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
          renderHeader={(date: string) => {
            setWeeksCount(0);

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

      <View style={{ flex: 1, flexDirection: 'row', height: '100%' }}>
        <View style={styles.detailWrapper}>
          <PaperClip
            width={32}
            height={32}
            style={{
              position: 'absolute',
              zIndex: 9,
              top: -12,
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
              onPress={() => setIsVisible(true)}
              style={{
                padding: 16,
                marginTop: -16,
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
                        {matches[0].home} VS {matches[0].away}
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
                              teams.find(
                                team => team.team_id === matches[0].home,
                              )?.team_short_name
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
                    <FlatList data={matches} renderItem={MatchesItem} />
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
    </TouchableWrapper>
  );
}

function DayComponent({
  date,
  state,
  marking,
  onPress,
  selectedDate,
  weeksCount,
  setWeeksCount,
  ...props
}: DayProps & {
  date?: DateData;
  selectedDate: string;
  weeksCount: number;
  setWeeksCount: React.Dispatch<React.SetStateAction<number>>;
}) {
  setWeeksCount(prev => {
    if (props.accessibilityLabel?.includes('월요일')) {
      return prev + 1;
    }
    return prev;
  });

  return (
    <TouchableOpacity
      onPress={() => onPress && onPress(date)}
      style={{
        width: '100%',
        height:
          weeksCount > 5
            ? Platform.OS === 'android'
              ? 27
              : 30
            : Platform.OS === 'android'
            ? 37
            : 40,
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
      {marking?.marked && <Ball width={16} height={16} />}
    </TouchableOpacity>
  );
}

function MatchesItem({ ...props }: ListRenderItemInfo<MatchDataType>) {
  const { home, away, stadium } = props.item;

  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <View style={{ flexDirection: 'row', gap: 4 }}>
        <Text style={styles.stickyNoteText}>{away}</Text>
        <Text style={styles.stickyNoteText}>VS</Text>
        <Text style={styles.stickyNoteText}>{home}</Text>
      </View>
      <Text style={styles.stickyNoteText}>@{stadium}</Text>
    </View>
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
