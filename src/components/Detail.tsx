import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActionSheetIOS,
  Alert,
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import ViewShot from 'react-native-view-shot';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import Toast from 'react-native-toast-message';
import dayjs from 'dayjs';
import FastImage from 'react-native-fast-image';
import { onCreateTriggerNotification } from '@/hooks/schedulingHook';

import { DetailPropsType } from '@/type/default';
import { useCarouselIndexState } from '@stores/default';
import {
  changeStadiumLongNameToNickname,
  hasAndroidPermission,
} from '@utils/helper';
import { DATE_FORMAT, IMAGE_HEIGHT, IMAGE_WIDTH } from '@utils/STATIC_DATA';
import { Stamp } from '@assets/svg';
import { palette } from '@/style/palette';
import { useUserState } from '@/stores/user';
import { MatchBookingType, MatchDataType } from '@/type/match';
import { API } from '@/api';
import { useStadiumsState, useTeamsState } from '@/stores/teams';
import { getMatchByDate } from '@/api/match';

const { width, height } = Dimensions.get('window');

export function Detail({
  setIsEdit,
  setIsVisible,
  records,
  setRecords,
  isCalendar = false,
  refetch,
  date,
}: DetailPropsType & {
  date?: string;
  isCalendar?: boolean;
  refetch?: () => void;
}) {
  const shareImageRef = useRef<ViewShot>(null);
  const [result, setResult] = useState<'W' | 'D' | 'L' | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<
    MatchDataType | undefined
  >();
  const [matches, setMatches] = useState<MatchDataType[]>([]);
  const [bookings, setBookings] = useState<MatchBookingType[]>([]);

  const { teamId, uniqueId } = useUserState();
  const { teams } = useTeamsState();
  const { stadiums } = useStadiumsState();
  const { carouselIndexState, setCarouselIndexState } = useCarouselIndexState();

  useEffect(() => {
    getTodayMatch();
    getBookings();
  }, []);

  useEffect(() => {
    // 마이팀 없는 경우
    if (!teamId) {
      return setResult(null);
    }

    const tempRecord = records[carouselIndexState];
    const tempMatch = matches.find(mat => mat.id === tempRecord.match_id);

    // 마이팀과 기록한 팀의 경기가 다른 경우
    if (teamId !== tempMatch?.home && teamId !== tempMatch?.away) {
      return setResult(null);
    }

    const { home_score, away_score, home, away } = tempMatch;

    // 아직 열리지 않은 경기
    if (home_score === -1 || away_score === -1) {
      return setResult(null);
    }

    if (home === teamId) {
      setResult(
        home_score > away_score ? 'W' : home_score < away_score ? 'L' : 'D',
      );
    } else {
      setResult(
        home_score > away_score ? 'L' : home_score < away_score ? 'W' : 'D',
      );
    }
  }, [teamId, records, matches, carouselIndexState]);

  const getTodayMatch = async () => {
    const res = await getMatchByDate(date || '');

    if (res.data) {
      setMatches(res.data);
    }
  };

  const getTodayRecord = async () => {
    try {
      // 페이지 진입 시 오늘 날짜 데이터가 있는지 확인
      const res = await API.post('/user-record/date', {
        date: dayjs(date).format(DATE_FORMAT),
        userId: uniqueId,
      });

      if (res.data) {
        setRecords(res.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const onPressDelete = async () => {
    Alert.alert(
      '삭제하기',
      '오늘의 직관 기록이 사라져요. 계속 진행하시겠어요?',
      [
        {
          text: '돌아가기',
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: '삭제하기',
          onPress: async () => {
            try {
              const deleteRecord = records[carouselIndexState];
              await API.delete(`/user-records/${deleteRecord.records_id}`);
              await getTodayRecord(); // 삭제 후 새 데이터 가져오기
              setIsEdit(false);
            } catch (e) {
              console.error(e);
            }
          },
        },
      ],
    );
  };

  const onPressAddMoreMatch = () => {
    setIsVisible(true);
    setIsEdit(false);
  };

  const getImageUrl = async () => {
    if (!shareImageRef.current?.capture) {
      return;
    }
    const uri = await shareImageRef.current.capture();
    return uri;
  };

  const onPressShare = async () => {
    if (Platform.OS === 'android' && !(await hasAndroidPermission())) {
      Alert.alert('갤러리 접근 권한을 먼저 설정해주세요!');
      return;
    }

    const uri = await getImageUrl();

    if (!uri) {
      return;
    }

    await CameraRoll.save(uri, { type: 'photo', album: '직관일기' });

    Toast.show({
      type: 'success',
      text1: '오늘의 직관일기가 앨범에 저장되었어요. 공유해보세요!',
      topOffset: 60,
    });
  };

  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const slideSize = event.nativeEvent.layoutMeasurement.width;
      const index = event.nativeEvent.contentOffset.x / slideSize;
      const roundIndex = Math.round(index);
      setCarouselIndexState(roundIndex);
    },
    [],
  );

  const onPressScheduling = async () => {
    Alert.alert(
      '선택한 날짜에 직관 알림을 예약할까요?',
      '해당 날짜에 알림을 보내드릴게요!',
      [
        { text: '취소', onPress: () => {} }, // TODO
        {
          text: '예약하기',
          onPress: async () => {
            if (!date) {
              Toast.show({
                type: 'info',
                text1: '날짜를 먼저 선택해주세요!',
              });
              return;
            }
            await onCreateTriggerNotification(date);
            await getBookings();
          },
        },
      ],
    );
  };

  const onDeleteBooking = async () => {
    const id = bookings.find(
      book => dayjs(book.date).format(DATE_FORMAT) === date,
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
    const isBooked = date && bookingDates.includes(date);

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
    <View
      style={
        isCalendar
          ? [
              polaroidStyles.wrapper,
              {
                width: width * 0.6,
                justifyContent: 'flex-start',
                transform: [
                  {
                    rotate: '2deg',
                  },
                ],
              },
            ]
          : polaroidStyles.wrapper
      }>
      <FlatList
        data={records}
        renderItem={({ item, index }) => (
          <ViewShot
            ref={shareImageRef}
            options={{
              fileName: `${item.date}_직관일기`,
              format: 'jpg',
              quality: 1,
            }}
            key={item.records_id}>
            <View
              style={
                isCalendar
                  ? [
                      polaroidStyles.photoWrapper,
                      {
                        width: width * 0.6 - 12,
                        height: 300,
                        marginRight: 16,
                        marginTop: -56,
                      },
                    ]
                  : [
                      polaroidStyles.photoWrapper,
                      polaroidStyles.photoWrapperShadow,
                    ]
              }>
              <TouchableOpacity
                onPress={() => {
                  if (
                    new Date(date + 'T00:00:00.000Z') <=
                    new Date(dayjs().format('YYYY-MM-DD') + 'T00:00:00.000Z')
                  ) {
                    setIsVisible(true);
                  } else {
                    selectAddRecordMode();
                  }
                }}
                style={{
                  flex: 1,
                  alignItems: 'center',
                }}>
                <View
                  style={{
                    position: 'relative',
                  }}>
                  <View
                    style={[
                      polaroidStyles.photo,
                      {
                        width: isCalendar ? width * 0.6 - 12 : width * 0.7 - 12,
                        height: isCalendar
                          ? (IMAGE_HEIGHT * (width * 0.6)) / IMAGE_WIDTH - 12
                          : (IMAGE_HEIGHT * (width * 0.7)) / IMAGE_WIDTH - 12,
                      },
                    ]}
                  />
                  <FastImage
                    source={{ uri: (item.image as string) || '' }}
                    style={{
                      width: isCalendar ? width * 0.6 - 28 : width * 0.7 - 16,
                      height: isCalendar
                        ? (IMAGE_HEIGHT * (width * 0.6)) / IMAGE_WIDTH - 16
                        : (IMAGE_HEIGHT * (width * 0.7)) / IMAGE_WIDTH - 16,
                    }}
                  />
                  {!!result && (
                    <View
                      style={{
                        position: 'absolute',
                        bottom: isCalendar ? 60 : 30,
                        left: isCalendar
                          ? width * 0.6 - 16 - 60
                          : width * 0.7 - 16 - 60,
                      }}>
                      <Stamp
                        width={60}
                        height={60}
                        color={
                          result === 'W'
                            ? 'red'
                            : result === 'L'
                            ? 'blue'
                            : 'gray'
                        }
                        style={{
                          position: 'absolute',
                        }}
                      />
                      <Text
                        style={[
                          polaroidStyles.resultText,
                          {
                            color:
                              result === 'W'
                                ? 'red'
                                : result === 'L'
                                ? 'blue'
                                : 'gray',
                          },
                        ]}>
                        {result === 'W'
                          ? '승리!'
                          : result === 'L'
                          ? '패배'
                          : '무승부'}
                      </Text>
                    </View>
                  )}
                  <Text
                    style={{
                      width: '105%',
                      fontFamily: 'UhBee Seulvely',
                      fontSize: isCalendar ? 10 : 12,
                      marginTop: isCalendar ? 10 : 20,
                    }}>
                    {dayjs(
                      records[carouselIndexState].date.includes('(')
                        ? records[carouselIndexState].date.split('(')[0]
                        : records[carouselIndexState].date,
                    ).format('YY.MM.DD')}{' '}
                    {selectedMatch?.home && selectedMatch.away && (
                      <Text>
                        {
                          teams.find(
                            team => team.team_id === selectedMatch?.home,
                          )?.team_short_name
                        }
                        {' VS '}
                        {
                          teams.find(
                            team => team.team_id === selectedMatch?.away,
                          )?.team_short_name
                        }
                      </Text>
                    )}
                    {' @'}
                    {changeStadiumLongNameToNickname(
                      stadiums.find(sta => sta.stadium_id === item.stadium_id)
                        ?.stadium_name,
                    )}
                  </Text>
                </View>
                <View
                  style={{
                    width: '100%',
                  }}>
                  <Text
                    style={{
                      width: '100%',
                      fontSize: 12,
                      fontFamily: 'UhBee Seulvely',
                      lineHeight: 14,
                    }}
                    numberOfLines={isCalendar ? 2 : undefined}>
                    {item.user_note}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
            {isCalendar && <View style={[polaroidStyles.shadow]} />}
            {isCalendar && <View style={polaroidStyles.effect} />}
          </ViewShot>
        )}
        onScroll={onScroll}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          alignItems: 'center',
          justifyContent: 'center',
        }}
      />
      <View
        style={{
          flexDirection: 'row',
          gap: 4,
          position: 'absolute',
          bottom: 96,
        }}>
        {records.map(record => {
          return (
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 100,
                backgroundColor:
                  record.records_id === records[carouselIndexState].records_id
                    ? palette.teamColor[teamId]
                    : palette.greyColor.gray9,
              }}
            />
          );
        })}
      </View>
      <View
        style={
          isCalendar
            ? [
                polaroidStyles.buttonWrapper,
                {
                  gap: 6,
                  justifyContent: 'flex-start',
                  width: '90%',
                  position: 'absolute',
                  bottom: 54,
                },
              ]
            : polaroidStyles.buttonWrapper
        }>
        <TouchableOpacity
          onPress={onPressShare}
          style={polaroidStyles.shareButton}>
          <Text style={polaroidStyles.shareText}>
            {isCalendar ? '공유' : '공유하기'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onPressDelete}
          style={polaroidStyles.shareButton}>
          <Text style={polaroidStyles.shareText}>
            {isCalendar ? '삭제' : '삭제하기'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onPressAddMoreMatch}
          style={polaroidStyles.shareButton}>
          <Text style={polaroidStyles.shareText}>
            {isCalendar ? '추가' : '경기 추가하기'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const polaroidStyles = StyleSheet.create({
  wrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -32,
  },
  photoWrapper: {
    width: width * 0.7,
    height: height * 0.47,
    padding: 8,
    backgroundColor: 'rgb(243,243,243)',
  },
  photoWrapperShadow: {
    ...Platform.select({
      android: {},
      ios: {
        shadowOffset: {
          width: 2,
          height: 2,
        },
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
    }),
  },
  photo: {
    borderWidth: 2,
    borderColor: 'transparent',
    borderBottomWidth: 0,
    borderRightWidth: 0,
    overflow: 'hidden',
    backgroundColor: 'transparent',
    position: 'absolute',
    zIndex: 9,
    left: -2,
    top: -2,
    ...Platform.select({
      android: {},
      ios: {
        shadowColor: '#000',
        shadowOpacity: 1,
        shadowOffset: {
          width: 2,
          height: 2,
        },
      },
    }),
  },
  effect: {
    position: 'absolute',
    height: 200,
  },
  shadow: {
    zIndex: -1,
    position: 'absolute',
    bottom: 15,
    left: 10,
    width: '87%',
    height: '90%',
    top: 16,
    backgroundColor: '#fff',
    transform: [{ rotate: '3deg' }],
    ...Platform.select({
      android: {},
      ios: {
        shadowColor: '#777',
        shadowOffset: { width: 0, height: 15 },
        shadowOpacity: 1,
      },
    }),
  },

  buttonWrapper: {
    width: '70%',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'flex-end',
    position: 'absolute',
    top: '80%',
  },
  shareButton: {
    borderWidth: 1,
    borderColor: palette.greyColor.gray9,
    borderRadius: 20,
    padding: 6,
  },
  shareText: {
    ...Platform.select({
      android: {
        fontFamily: 'KBO Dia Gothic_medium',
      },
      ios: {
        fontFamily: 'KBO-Dia-Gothic-medium',
      },
    }),
  },
  resultText: {
    textAlign: 'center',
    fontFamily: 'UhBee Seulvely',
    fontSize: 14,
    position: 'absolute',
    top: 32,
    left: 12,
    transform: [
      {
        translateY: -10,
      },
      {
        rotate: '-15deg',
      },
    ],
  },
});
