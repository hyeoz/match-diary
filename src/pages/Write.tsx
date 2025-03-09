import React, {
  Dispatch,
  RefObject,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
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
import dayjs from 'dayjs';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ViewShot from 'react-native-view-shot';
import FastImage from 'react-native-fast-image';
import Toast from 'react-native-toast-message';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';

import TouchableWrapper from '@components/TouchableWrapper';
import { Detail } from '@components/Detail';
import UploadModal from '@components/UploadModal';
import { DATE_FORMAT, IMAGE_HEIGHT, IMAGE_WIDTH } from '@utils/STATIC_DATA';
import { useCarouselIndexState, useTabHistory } from '@/stores/default';
import { RecordType } from '@/type/record';
import { Add } from '@assets/svg';
import { palette } from '@/style/palette';
import {
  changeStadiumLongNameToNickname,
  hasAndroidPermission,
} from '@/utils/helper';
import { API } from '@/api';
import { useUserState } from '@/stores/user';
import { useStadiumsState } from '@/stores/teams';

// NOTE 메인페이지

const formattedToday = dayjs().format(DATE_FORMAT);
const { width, height } = Dimensions.get('window');

function Write() {
  const navigate = useNavigation<NativeStackNavigationProp<any>>();

  const shareImageRef = useRef<ViewShot>(null);
  const flatListRef = useRef<FlatList>(null);

  const [isVisible, setIsVisible] = useState(false);
  const [records, setRecords] = useState<RecordType[]>([]); // 같은 날 중복된 기록들 관리
  const [isEdit, setIsEdit] = useState(false);

  const { uniqueId } = useUserState();
  const { history } = useTabHistory();
  const { carouselIndexState, setCarouselIndexState } = useCarouselIndexState();

  useEffect(() => {
    getTodayRecord();
  }, []);

  console.log(records);

  const getTodayRecord = async () => {
    try {
      // 페이지 진입 시 오늘 날짜 데이터가 있는지 확인
      const res = await API.post('/user-record/date', {
        date: dayjs().format(DATE_FORMAT),
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

  const detailProps = {
    isEdit,
    setIsEdit,
    setIsVisible,
    records,
    setRecords,
  };

  return (
    <TouchableWrapper>
      {/* SECTION 메인 버튼 / 폴라로이드 */}
      {isEdit || (records.length && records[0].image) ? (
        records.length > 1 && records[0].image ? (
          <>
            <View
              style={{
                flex: 0.9,
              }}>
              {/* TODO 여러경기인 경우 캐러셀 디자인 */}
              <FlatList
                data={records}
                renderItem={({ item, index }) => (
                  <CarouselPhoto
                    records={records}
                    record={item}
                    index={index}
                    shareImageRef={shareImageRef}
                    setIsVisible={setIsVisible}
                    setIsEdit={setIsEdit}
                  />
                )}
                onScroll={onScroll}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ alignItems: 'center' }}
              />
              <View style={polaroidStyles.buttonWrapper}>
                <TouchableOpacity
                  onPress={onPressShare}
                  style={polaroidStyles.shareButton}>
                  <Text style={polaroidStyles.shareText}>{'공유하기'}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={onPressDelete}
                  style={polaroidStyles.shareButton}>
                  <Text style={polaroidStyles.shareText}>{'삭제하기'}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={onPressAddMoreMatch}
                  style={polaroidStyles.shareButton}>
                  <Text style={polaroidStyles.shareText}>
                    {'경기 추가하기'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        ) : (
          <Detail {...detailProps} />
        )
      ) : (
        <View style={styles.wrapper}>
          <TouchableOpacity
            onPress={() => setIsVisible(true)}
            style={{
              width: '65%',
              height: '45%',
            }}>
            <View style={[styles.addButton]}>
              <Add width={60} height={60} color={'#aaa'} />
              <Text style={styles.addText}>
                여기를 눌러{'\n'}직관기록을 추가해주세요!
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      )}

      {/* SECTION 업로드 모달 */}
      <UploadModal {...detailProps} isVisible={isVisible} />
    </TouchableWrapper>
  );
}

type CarouselPhotoProps = {
  records: RecordType[];
  record: RecordType;
  index: number;
  setIsVisible: Dispatch<SetStateAction<boolean>>;
  setIsEdit: Dispatch<SetStateAction<boolean>>;
  shareImageRef: RefObject<ViewShot>;
};

function CarouselPhoto({
  records,
  record,
  index,
  setIsVisible,
  setIsEdit,
  shareImageRef,
}: CarouselPhotoProps) {
  const { carouselIndexState, setCarouselIndexState } = useCarouselIndexState();
  const { stadiums } = useStadiumsState();

  console.log({ records, carouselIndexState, record });

  return (
    <ViewShot
      ref={shareImageRef}
      options={{
        fileName: `${formattedToday}_직관일기`,
        format: 'jpg',
        quality: 1,
      }}>
      <View
        style={[
          polaroidStyles.photoWrapper,
          polaroidStyles.photoWrapperShadow,
          index === 0
            ? { marginLeft: 32 }
            : index === records.length - 1
            ? { marginRight: 32 }
            : {},
        ]}>
        <TouchableOpacity
          onPress={() => {
            // NOTE 캐러셀에서 눌렀을 때 맞는 아이템 수정으로 넘어가도록
            setIsVisible(true);
            setIsEdit(true);
          }}
          style={{
            flex: 1,
            alignItems: 'center',
          }}
          disabled={index !== carouselIndexState}>
          <View
            style={{
              position: 'relative',
            }}>
            <View
              style={[
                polaroidStyles.photo,
                {
                  width: width * 0.7 - 12,
                  height: (IMAGE_HEIGHT * (width * 0.7)) / IMAGE_WIDTH - 12,
                },
              ]}
            />
            <FastImage
              source={{ uri: (record.image as string) || '' }}
              style={{
                width: width * 0.7 - 16,
                height: (IMAGE_HEIGHT * (width * 0.7)) / IMAGE_WIDTH - 16,
              }}
            />

            <Text
              style={{
                width: '105%',
                fontFamily: 'UhBee Seulvely',
                fontSize: 12,
                marginTop: 20,
              }}>
              {dayjs(
                record.date.includes('(')
                  ? record.date.split('(')[0]
                  : record.date,
              ).format('YY.MM.DD')}{' '}
              {/* TODO Write 페이지에서 myTeamMatch 정보 가져오는 방법 */}
              {/* {myTeamMatch?.home && myTeamMatch.away && (
                <>
                  {myTeamMatch?.home}
                  {' VS '}
                  {myTeamMatch?.away}
                </>
              )} */}
              {' @'}
              {changeStadiumLongNameToNickname(
                stadiums.find(sta => sta.stadium_id === record.stadium_id)
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
              numberOfLines={undefined}>
              {record.user_note}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </ViewShot>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    flex: 1,
    gap: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    backgroundColor: '#fff',
    ...Platform.select({
      android: {
        elevation: 4,
      },
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 0,
        },
        shadowOpacity: 0.2,
        shadowRadius: 16,
      },
    }),
  },
  addText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#aaa',
    // NOTE font 적용 시 post script 이름으로 적용 필요

    ...Platform.select({
      android: {
        fontFamily: 'KBO Dia Gothic_bold',
      },
      ios: {
        fontFamily: 'KBO-Dia-Gothic-bold',
      },
    }),
  },
  photoCarousel: {},
  duplicatePhoto: {
    borderWidth: 3,
    borderColor: palette.greyColor.border,
    position: 'absolute',
    width: '70%',
    height: '52%',
    top: '27%',
    left: '20%',
    backgroundColor: '#fff',
    zIndex: -1,
  },
  changePhotoButton: {
    position: 'absolute',
    top: '20%',
    right: '10%',
  },
});

const polaroidStyles = StyleSheet.create({
  photoWrapper: {
    width: width * 0.7,
    height: height * 0.47,
    padding: 8,
    backgroundColor: 'rgb(243,243,243)',
    marginRight: 16,
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
    justifyContent: 'flex-end',
    gap: 6,
    position: 'absolute',
    top: '82%',
    right: '8%',
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

export default Write;
