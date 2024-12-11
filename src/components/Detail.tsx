import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import Toast from 'react-native-toast-message';
import dayjs from 'dayjs';
import FastImage from 'react-native-fast-image';

import { DetailPropsType, MatchDataType, RecordType } from '@/type/default';
import {
  useCarouselIndexState,
  useDuplicatedRecordState,
  useMatchesState,
  useMyState,
  useSelectedRecordState,
} from '@stores/default';
import { getStadiumName, hasAndroidPermission } from '@utils/helper';
import {
  IMAGE_HEIGHT,
  IMAGE_WIDTH,
  RESET_RECORD,
  STADIUM_LONG_TO_SHORT,
} from '@utils/STATIC_DATA';
import { Stamp } from '@assets/svg';
import { palette } from '@/style/palette';

const { width, height } = Dimensions.get('window');

export function Detail({
  setIsEdit,
  setIsVisible,
  myTeamMatch,
  isCalendar = false,
  refetch,
  date,
}: DetailPropsType & {
  date?: string;
  myTeamMatch?: MatchDataType;
  isCalendar?: boolean;
  refetch?: () => void;
}) {
  const shareImageRef = useRef<ViewShot>(null);
  const [result, setResult] = useState<'W' | 'D' | 'L' | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<
    MatchDataType | undefined
  >();

  const { team } = useMyState();
  const { recordState, setRecordState } = useSelectedRecordState();
  const { recordsState, setRecordsState } = useDuplicatedRecordState();
  const { carouselIndexState } = useCarouselIndexState();
  const { matchesState, setMatchesState } = useMatchesState();

  useEffect(() => {
    // 마이팀 없는 경우
    if (!myTeamMatch) {
      return;
    }

    // 마이팀과 기록한 팀의 경기가 다른 경우
    const tempStadium =
      STADIUM_LONG_TO_SHORT[recordState.selectedStadium.split(' - ')[0]];
    if (myTeamMatch.stadium !== tempStadium) {
      return;
    }

    const { homeScore, awayScore, home, away } = myTeamMatch;

    if (homeScore === -1 || awayScore === -1) {
      return;
    }

    if (homeScore !== undefined && awayScore !== undefined) {
      if (home === team) {
        setResult(
          homeScore > awayScore ? 'W' : homeScore < awayScore ? 'L' : 'D',
        );
      } else {
        setResult(
          homeScore > awayScore ? 'L' : homeScore < awayScore ? 'W' : 'D',
        );
      }
    }
  }, [myTeamMatch]);

  useEffect(() => {
    const tempStadium =
      STADIUM_LONG_TO_SHORT[recordState.selectedStadium.split(' - ')[0]];
    const matches = matchesState.filter(match => match.stadium === tempStadium);
    // 더블헤더 분기처리
    if (matches.length > 1) {
      let tempMatch: MatchDataType;
      if (recordState.selectedStadium.includes('1')) {
        // 1경기
        matches.forEach(match => {
          tempMatch =
            new Date(tempMatch?.time) > new Date(match.time)
              ? tempMatch
              : match;
        });
      } else {
        // 2경기
        matches.forEach(match => {
          tempMatch =
            new Date(tempMatch?.time) < new Date(match.time)
              ? tempMatch
              : match;
        });
      }
      setSelectedMatch(tempMatch!);
    } else {
      setSelectedMatch(
        matchesState.find(match => match.stadium === tempStadium),
      );
    }
  }, [matchesState, recordState.selectedStadium]);

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
              const deleteRecord = recordsState[carouselIndexState];
              // 삭제 기능 (storage 삭제, recordState, recordsState 올바르게 세팅)
              await AsyncStorage.removeItem(deleteRecord.date);
              setRecordsState(
                recordsState.filter(
                  record => record.date !== deleteRecord.date,
                ),
              );
              // NOTE recordState 를 삭제하고 같은 날 다른 경기가 있으면 변경, 없으면 빈 채로 두기
              if (
                recordsState.filter(record => record.date !== deleteRecord.date)
                  .length
              ) {
                const duplRecords = recordsState.filter(
                  record => record.date !== deleteRecord.date,
                );
                setRecordState(duplRecords[0]);
              } else {
                setRecordState(RESET_RECORD);
              }
              setIsEdit(false);
              refetch && refetch();
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
      setRecordState(recordsState[roundIndex]);
    },
    [],
  );

  return (
    <View
      style={
        isCalendar
          ? [
              polaroidStyles.wrapper,
              {
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
        data={recordsState}
        renderItem={({ item, index }) => (
          <ViewShot
            ref={shareImageRef}
            options={{
              fileName: `${item.date}_직관일기`,
              format: 'jpg',
              quality: 1,
            }}>
            <View
              style={
                isCalendar
                  ? [
                      polaroidStyles.photoWrapper,
                      {
                        width: width * 0.6 - 12,
                        height: height * 0.35,
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
                onPress={() => setIsVisible(true)}
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
                    source={{ uri: item.image?.path }}
                    style={{
                      width: isCalendar ? width * 0.6 - 28 : width * 0.7 - 16,
                      height: isCalendar
                        ? (IMAGE_HEIGHT * (width * 0.6)) / IMAGE_WIDTH - 16
                        : (IMAGE_HEIGHT * (width * 0.7)) / IMAGE_WIDTH - 16,
                    }}
                  />
                  {!!result && myTeamMatch && (
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
                      recordState.date.includes('(')
                        ? recordState.date.split('(')[0]
                        : recordState.date,
                    ).format('YY.MM.DD')}{' '}
                    {selectedMatch?.home && selectedMatch.away && (
                      <>
                        {selectedMatch?.home}
                        {' VS '}
                        {selectedMatch?.away}
                      </>
                    )}
                    {' @'}
                    {getStadiumName(item.selectedStadium)}
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
                    {item.memo}
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
        contentContainerStyle={{ alignItems: 'center' }}
      />
      <View
        style={{
          flexDirection: 'row',
          gap: 4,
          position: 'absolute',
          bottom: 96,
        }}>
        {recordsState.map(record => {
          return (
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 100,
                backgroundColor:
                  record.date === recordState.date
                    ? palette.teamColor[team]
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
                  bottom: 48,
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
