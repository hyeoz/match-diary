import React, { useCallback, useEffect, useState } from 'react';
import {
  Dimensions,
  FlatList,
  ListRenderItemInfo,
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

import TouchableWrapper from '@components/TouchableWrapper';
import { Detail } from '@components/Detail';
import UploadModal from '@components/UploadModal';
import { useMyState, useTabHistory } from '@stores/default';
import { API, StrapiType } from '@api/index';
import {
  API_DATE_FORMAT,
  DATE_FORMAT,
  DAYS_NAME_KOR,
  DAYS_NAME_KOR_SHORT,
  MONTH_LIST,
  STADIUM_SHORT_NAME,
} from '@utils/STATIC_DATA';
import { palette } from '@style/palette';
import { MatchDataType } from '@/type/default';
import { AnswerCircle, Ball, PaperClip } from '@assets/svg';
import Loading from '@/components/Loading';

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
  const [image, setImage] = useState<ImageOrVideo | null>(null);
  const [memo, setMemo] = useState('');
  const [selectedStadium, setSelectedStadium] = useState('');
  const [isEdit, setIsEdit] = useState(false);
  const [matches, setMatches] = useState<MatchDataType[]>([]);
  const [matchRecord, setMatchRecord] = useState(initCountData); // NOTE my team 이 없는 경우 모두 home 안에 기록됩니다
  const [loading, setLoading] = useState(false);

  const { team } = useMyState();
  const { history } = useTabHistory();

  const detailProps = {
    image,
    setImage,
    memo,
    setMemo,
    setIsEdit,
    setIsVisible,
    selectedStadium,
    setSelectedStadium,
    matches,
  };

  useEffect(() => {
    getSelectedItem();
    getMatchData();
  }, [history, team, selectedDate]);

  useEffect(() => {
    getAllItems();
    getAllRecord();
  }, [history, team, isVisible]);

  const getSelectedItem = async () => {
    const res = await AsyncStorage.getItem(selectedDate);

    if (res) {
      const json: {
        image: ImageOrVideo;
        memo: string;
        selectedStadium: string;
      } = JSON.parse(res);
      setImage(json.image);
      setMemo(json.memo);
      setSelectedStadium(json.selectedStadium);
    } else {
      setImage(null);
      setMemo('');
      setSelectedStadium('');
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
        {...props}
        onPress={onDayPress}
      />
    ),
    [onDayPress, selectedDate],
  );

  const getMatchData = async () => {
    setLoading(true);
    const res = await API.get<StrapiType<MatchDataType>>(
      `/schedule-2024s?filters[date]=${dayjs(selectedDate).format(
        API_DATE_FORMAT,
      )}`,
    );

    if (!res.data.data.length) {
      return setMatches([]);
    }
    if (team) {
      const filteredMatch = res.data.data.filter(
        data => data.attributes.home === team || data.attributes.away === team,
      );
      setMatches([filteredMatch[0].attributes]);
    } else {
      setMatches(res.data.data.map(d => d.attributes));
    }
    setLoading(false);
  };

  // NOTE 직관 기록 계산
  const getAllRecord = async () => {
    let _count = {
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

    const keys = (await AsyncStorage.getAllKeys()).filter(
      key => key !== 'MY_TEAM' && key !== 'NICKNAME',
    );
    for (let i = 0; i < keys.length; i++) {
      const res = await API.get<StrapiType<MatchDataType>>(
        `/schedule-2024s?filters[date]=${dayjs(keys[i]).format(
          API_DATE_FORMAT,
        )}`,
      );

      const data = res.data.data.find(
        dt => dt.attributes.home === team || dt.attributes.away === team,
      );

      if (data) {
        if (!team) {
          // 이번 시즌 직관 기록
          _count.bySeason.home += 1;
          // 이번 달 직관 기록
          if (dayjs(keys[i]).month() === dayjs().month()) {
            _count.byMonth.home += 1;
          }
          return;
        } else if (team === data.attributes.home) {
          // NOTE 홈경기
          // 이번 시즌 직관 기록
          _count.bySeason.home += 1;
          // 이번 달 직관 기록
          if (dayjs(keys[i]).month() === dayjs().month()) {
            _count.byMonth.home += 1;
          }
          // 직관 승률
          if (
            (data.attributes.homeScore as number) >
            (data.attributes.awayScore as number)
          ) {
            _count.rate.win += 1;
          } else if (
            (data.attributes.homeScore as number) <
            (data.attributes.awayScore as number)
          ) {
            _count.rate.lose += 1;
          } else {
            _count.rate.draw += 1;
          }
        } else {
          // NOTE 원정경기
          // 이번 시즌 직관 기록
          _count.bySeason.away += 1;
          // 이번 달 직관 기록
          if (dayjs(keys[i]).month() === dayjs().month()) {
            _count.byMonth.away += 1;
          }
          // 직관 승률
          if (
            (data.attributes.homeScore as number) <
            (data.attributes.awayScore as number)
          ) {
            _count.rate.win += 1;
          } else if (
            (data.attributes.homeScore as number) >
            (data.attributes.awayScore as number)
          ) {
            _count.rate.lose += 1;
          } else {
            _count.rate.draw += 1;
          }
        }
      }
    }

    setMatchRecord(_count);
  };

  return (
    <TouchableWrapper bgColor={palette.commonColor.greenBg}>
      <View style={styles.calendarWrapper}>
        <RNCalendar
          style={styles.calendar}
          theme={{
            textDayHeaderFontFamily: 'KBO-Dia-Gothic-medium',
            arrowColor: palette.commonColor.green,
          }}
          markedDates={markedDates}
          firstDay={1}
          renderHeader={(date: string) => {
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
            }}
          />
          {image && memo ? (
            <Detail
              {...detailProps}
              isCalendar
              refetch={() => {
                getAllItems();
                getAllRecord();
              }}
              myTeamMatch={matches.find(match => {
                const _date = match.date.split('(')[0].replaceAll('.', '/');

                return (
                  dayjs(_date).format(DATE_FORMAT) ===
                  dayjs(selectedDate).format(DATE_FORMAT)
                );
              })}
              date={selectedDate}
            />
          ) : (
            <TouchableOpacity
              onPress={() => setIsVisible(true)}
              style={{
                padding: 16,
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
                            ({STADIUM_SHORT_NAME[matches[0].home]})
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
              {!!team
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
              {!!team
                ? `홈 ${matchRecord.bySeason.home}번 / 원정 ${matchRecord.bySeason.away}번`
                : `${matchRecord.bySeason.home}번`}
            </Text>
          </View>
          {!!team && (
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
  ...props
}: DayProps & {
  date?: DateData | undefined;
  selectedDate: string;
}) {
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
    fontFamily: 'KBO-Dia-Gothic-bold',
    fontSize: 18,
  },
  calendarText: {
    fontFamily: 'KBO-Dia-Gothic-medium',
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
