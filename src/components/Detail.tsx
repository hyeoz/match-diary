import React, { useCallback, useEffect, useRef, useState } from 'react';
import ViewShot from 'react-native-view-shot';
import {
  ActionSheetIOS,
  Alert,
  Dimensions,
  FlatList,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
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
  // 공유 미리보기 모달 상태 및 인덱스
  const [isSharePreviewVisible, setIsSharePreviewVisible] = useState(false);
  const [sharePreviewRecordIndex, setSharePreviewRecordIndex] =
    useState<number>(0);
  const sharePreviewRef = useRef<ViewShot>(null);
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

  // 날짜가 변경되면 경기 정보를 다시 가져오기
  useEffect(() => {
    if (date) {
      getTodayMatch();
      getBookings();
    }
  }, [date]);

  const updateResult = useCallback(async () => {
    // 마이팀 없는 경우
    if (!teamId || !records.length || !matches.length) {
      return setResult(null);
    }

    const tempRecord = records[carouselIndexState];

    if (!tempRecord) {
      return setResult(null);
    }

    // 경기 ID가 없는 경우 처리
    if (!tempRecord.match_id) {
      return setResult(null);
    }

    const tempMatch = matches.find(mat => mat.id === tempRecord.match_id);

    if (!tempMatch) {
      // 경기 정보를 찾지 못한 경우, 경기 정보를 다시 가져와서 처리
      if (date && tempRecord.match_id) {
        try {
          const matchRes = await getMatchByDate(date);
          if (matchRes.data && matchRes.data.length > 0) {
            setMatches(matchRes.data); // 경기 데이터 업데이트
            // 업데이트된 경기 데이터에서 다시 찾기
            const updatedMatch = matchRes.data.find(
              m => m.id === tempRecord.match_id,
            );
            if (!updatedMatch) {
              return setResult(null);
            }

            // 마이팀과 기록한 팀의 경기가 다른 경우
            if (teamId !== updatedMatch.home && teamId !== updatedMatch.away) {
              return setResult(null);
            }

            const { home_score, away_score, home, away } = updatedMatch;

            // 아직 열리지 않은 경기
            if (home_score === -1 || away_score === -1) {
              return setResult(null);
            }

            if (home === teamId) {
              return setResult(
                home_score > away_score
                  ? 'W'
                  : home_score < away_score
                  ? 'L'
                  : 'D',
              );
            } else {
              return setResult(
                home_score > away_score
                  ? 'L'
                  : home_score < away_score
                  ? 'W'
                  : 'D',
              );
            }
          }
        } catch (error) {
          console.error('경기 데이터 재조회 실패:', error);
          return setResult(null);
        }
      }
      return setResult(null);
    }

    // 마이팀과 기록한 팀의 경기가 다른 경우
    if (teamId !== tempMatch.home && teamId !== tempMatch.away) {
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
  }, [matches, records, carouselIndexState, teamId, date]);

  useEffect(() => {
    // 레코드, 캐러셀 인덱스, 팀 ID, matches가 변경될 때 결과 계산
    updateResult();
  }, [teamId, records, carouselIndexState, matches, updateResult]);

  const getTodayMatch = async () => {
    try {
      const res = await getMatchByDate(date || '');

      if (res.data) {
        setMatches(res.data);
      }
    } catch (error) {
      console.error('경기 데이터 로딩 실패:', error);
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

              // refetch 함수가 있으면 호출하여 Calendar의 getAllRecords 트리거
              if (refetch) {
                refetch();
              }
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

  // 공유 미리보기 이미지 저장
  const saveSharePreviewImage = async () => {
    try {
      if (
        Platform.OS === 'android' &&
        !(await hasAndroidPermission('MANAGE_EXTERNAL_STORAGE'))
      ) {
        Alert.alert('갤러리 접근 권한을 먼저 설정해주세요!');
        return;
      }
      if (!sharePreviewRef.current) {
        console.log('미리보기 이미지 컴포넌트를 찾을 수 없습니다.');
        return;
      }

      const uri = await sharePreviewRef.current.capture?.();

      if (!uri) {
        console.log('이미지 URL을 가져올 수 없습니다.');
        return;
      }
      await CameraRoll.save(uri, { type: 'photo', album: '직관일기' });
      Toast.show({
        type: 'success',
        text1: '오늘의 직관일기가 앨범에 저장되었어요. 공유해보세요!',
        topOffset: 60,
      });
      setIsSharePreviewVisible(false);
    } catch (error) {
      console.error('이미지 저장 중 오류:', error);
      Toast.show({
        type: 'error',
        text1: '이미지 저장에 실패했습니다.',
        topOffset: 60,
      });
    }
  };

  const getImageUrl = async () => {
    if (!shareImageRef.current?.capture) {
      return;
    }
    const uri = await shareImageRef.current.capture();
    return uri;
  };

  const onPressShare = async (index?: number) => {
    if (isCalendar) {
      // calendar 모드에서는 미리보기 모달 오픈
      setSharePreviewRecordIndex(index ?? carouselIndexState);
      setIsSharePreviewVisible(true);
      return;
    }
    // 일반 모드: 기존 로직
    try {
      if (
        Platform.OS === 'android' &&
        !(await hasAndroidPermission('MANAGE_EXTERNAL_STORAGE'))
      ) {
        Alert.alert('갤러리 접근 권한을 먼저 설정해주세요!');
        return;
      }

      if (!shareImageRef.current) {
        console.log('이미지 컴포넌트를 찾을 수 없습니다.');
        return;
      }

      const uri = await shareImageRef.current.capture?.();

      if (!uri) {
        console.log('이미지 URL을 가져올 수 없습니다.');
        return;
      }

      await CameraRoll.save(uri, { type: 'photo', album: '직관일기' });

      Toast.show({
        type: 'success',
        text1: '오늘의 직관일기가 앨범에 저장되었어요. 공유해보세요!',
        topOffset: 60,
      });
    } catch (error) {
      console.error('이미지 저장 중 오류:', error);
      Toast.show({
        type: 'error',
        text1: '이미지 저장에 실패했습니다.',
        topOffset: 60,
      });
    }
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

  // 디버깅 코드 제거

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
        style={
          !isCalendar && records.length === 1
            ? {
                width: '90%',
                paddingLeft: '10%',
              }
            : {}
        }
        renderItem={({ item, index }) => (
          <>
            <ViewShot
              ref={shareImageRef}
              options={{
                fileName: `${item.date}_직관일기`,
                format: 'jpg',
                quality: 1,
              }}
              key={item.records_id}
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
                  if (isCalendar) {
                    if (
                      new Date(date + 'T00:00:00.000Z') <=
                      new Date(dayjs().format('YYYY-MM-DD') + 'T00:00:00.000Z')
                    ) {
                      setIsVisible(true);
                    } else {
                      selectAddRecordMode();
                    }
                  } else {
                    setIsVisible(true);
                    records.length && setIsEdit(true);
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
            </ViewShot>
            {isCalendar && <View style={[polaroidStyles.shadow]} />}
            {isCalendar && <View style={polaroidStyles.effect} />}
          </>
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

      {/* 공유 미리보기 모달 (calendar 모드에서만) */}
      {isCalendar && (
        <Modal
          visible={isSharePreviewVisible}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setIsSharePreviewVisible(false)}>
          <View style={polaroidStyles.modalOverlay}>
            <View style={polaroidStyles.modalContent}>
              <ViewShot
                ref={sharePreviewRef}
                options={{
                  fileName: `${records[sharePreviewRecordIndex]?.date}_직관일기`,
                  format: 'jpg',
                  quality: 1,
                }}
                style={[
                  polaroidStyles.photoWrapper,
                  {
                    width: width * 0.7,
                    height: height * 0.47,
                    marginBottom: 16,
                  },
                ]}>
                <View
                  style={{
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                  }}>
                  <View style={{ position: 'relative' }}>
                    <View
                      style={[
                        polaroidStyles.photo,
                        {
                          width: width * 0.7 - 12,
                          height:
                            (IMAGE_HEIGHT * (width * 0.7)) / IMAGE_WIDTH - 12,
                        },
                      ]}
                    />
                    <FastImage
                      source={{
                        uri:
                          (records[sharePreviewRecordIndex]?.image as string) ||
                          '',
                      }}
                      style={{
                        width: width * 0.7 - 16,
                        height:
                          (IMAGE_HEIGHT * (width * 0.7)) / IMAGE_WIDTH - 16,
                      }}
                    />
                    {!!result && (
                      <View
                        style={{
                          position: 'absolute',
                          bottom: 45,
                          left: width * 0.7 - 16 - 60,
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
                          style={{ position: 'absolute' }}
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
                        fontSize: 12,
                        marginTop: 8,
                      }}>
                      {dayjs(
                        records[sharePreviewRecordIndex]?.date?.includes('(')
                          ? records[sharePreviewRecordIndex]?.date.split('(')[0]
                          : records[sharePreviewRecordIndex]?.date,
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
                        stadiums.find(
                          sta =>
                            sta.stadium_id ===
                            records[sharePreviewRecordIndex]?.stadium_id,
                        )?.stadium_name,
                      )}
                    </Text>
                  </View>
                  <View style={{ width: '100%' }}>
                    <Text
                      style={{
                        width: '100%',
                        fontSize: 12,
                        fontFamily: 'UhBee Seulvely',
                        lineHeight: 14,
                        marginTop: 8,
                      }}
                      // numberOfLines 없이 전체 표시
                    >
                      {records[sharePreviewRecordIndex]?.user_note}
                    </Text>
                  </View>
                </View>
              </ViewShot>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  gap: 12,
                }}>
                <TouchableOpacity
                  onPress={saveSharePreviewImage}
                  style={polaroidStyles.shareButton}>
                  <Text style={polaroidStyles.shareText}>저장</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setIsSharePreviewVisible(false)}
                  style={polaroidStyles.shareButton}>
                  <Text style={polaroidStyles.shareText}>닫기</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

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
          onPress={() => onPressShare(carouselIndexState)}
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    width: width * 0.8,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 24,
    elevation: 8,
  },
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
    left: 10,
    width: '87%',
    height: '70%',
    top: -50,
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
