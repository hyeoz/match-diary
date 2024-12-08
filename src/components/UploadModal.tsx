import {
  ActionSheetIOS,
  Alert,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { SetStateAction, useEffect, useState } from 'react';
import { ImageOrVideo } from 'react-native-image-crop-picker';
import { PERMISSIONS, request } from 'react-native-permissions';
import FastImage from 'react-native-fast-image';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Geolocation from '@react-native-community/geolocation';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import RNFS from 'react-native-fs';
import dayjs from 'dayjs';
import uuid from 'react-native-uuid';
import 'dayjs/locale/ko';
dayjs.locale('ko');

import SelectStadiumModal from './SelectStadiumModal';
import Loading from './Loading';
import { API, StrapiType } from '@/api';
import {
  CoordinateType,
  DetailPropsType,
  MatchDataType,
  RecordType,
} from '@/type/default';
import {
  API_DATE_FORMAT,
  DATE_FORMAT,
  DATE_FORMAT_SLASH,
  IMAGE_HEIGHT,
  IMAGE_WIDTH,
  RESET_RECORD,
  STADIUM_GEO,
  STADIUM_SHORT_TO_LONG,
} from '@utils/STATIC_DATA';
import {
  filterDuplicatedArray,
  getDistanceFromLatLonToKm,
  hasAndroidPermission,
} from '@utils/helper';
import { Add, Arrow } from '@assets/svg';
import { palette } from '@style/palette';
import { modalStyles } from '@style/common';
import {
  useDuplicatedRecordState,
  useSelectedRecordState,
} from '@/stores/default';

const { width } = Dimensions.get('window');

export default function UploadModal({
  isEdit,
  isVisible,
  setIsVisible,
  date,
}: DetailPropsType & {
  isVisible: boolean;
  date?: string;
}) {
  const [stadium, setStadium] = useState<string[]>([]);
  const [stadiumInfo, setStadiumInfo] = useState<
    { name: string; distance: number }[]
  >([]);
  const [matchInfo, setMatchInfo] = useState<{
    [key: string]: { home: string; away: string };
  }>();
  const [stadiumSelectVisible, setStadiumSelectVisible] = useState(false);
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [isKeyboardShow, setIsKeyboardShow] = useState(false);
  const [loading, setLoading] = useState(true);
  const [cropperLoading, setCropperLoading] = useState(false);
  const [tempRecord, setTempRecord] = useState<RecordType>(RESET_RECORD);

  const { recordState, setRecordState } = useSelectedRecordState();
  const { recordsState, setRecordsState } = useDuplicatedRecordState();

  const formattedToday = dayjs(date).format(DATE_FORMAT);
  const apiFormattedToday = dayjs(date).format(API_DATE_FORMAT);

  const initRecord: RecordType = {
    id: uuid.v4(),
    date: formattedToday,
    image: null,
    memo: '',
    selectedStadium: '',
  };

  useEffect(() => {
    Keyboard.addListener('keyboardWillShow', () => setIsKeyboardShow(true));
    Keyboard.addListener('keyboardWillHide', () => setIsKeyboardShow(false));
    !tempRecord && setTempRecord(initRecord);

    return () => {
      Keyboard.removeAllListeners('keyboardWillShow');
      Keyboard.removeAllListeners('keyboardWillHide');
    };
  }, []);

  useEffect(() => {
    // NOTE 캐러셀에서 수정으로 넘어가기
    if (isEdit) {
      recordState.image && setTempRecord(recordState);
    } else {
      setTempRecord(RESET_RECORD);
    }
  }, [isEdit, isVisible, recordState]);

  useEffect(() => {
    setLoading(true);
    if (Platform.OS === 'ios') {
      getLocation();
    }
    getTodayMatch();
    getAllStadiumDistance();
  }, [latitude, longitude, isVisible, stadiumSelectVisible]);

  /* ANCHOR DEPRECATED */
  // const checkIOSPermissions = async (type: 'CAMERA' | 'GALLARY') => {
  //   if (Platform.OS === 'ios') {
  //     const cameraStatus = await check(PERMISSIONS.IOS.CAMERA);
  //     const photoLibraryStatus = await check(PERMISSIONS.IOS.PHOTO_LIBRARY);

  //     if (type === 'GALLARY') {
  //       if (photoLibraryStatus === RESULTS.GRANTED) {
  //         return true;
  //       } else {
  //         return false;
  //       }
  //     } else {
  //       if (cameraStatus === RESULTS.GRANTED) {
  //         return true;
  //       } else {
  //         return false;
  //       }
  //     }
  //   }
  //   return true; // iOS가 아닌 경우 true 반환
  // };

  // const openPicker = async (
  //   fileName: string,
  //   uri: string,
  //   type: 'CAMERA' | 'GALLARY',
  // ) => {
  //   const hasPermission = await checkIOSPermissions(type);
  //   if (!hasPermission) {
  //     Toast.show({
  //       type: 'error',
  //       text1: '권한 설정이 필요해요!',
  //     });
  //     return request(PERMISSIONS.IOS.CAMERA);
  //   }
  //   if (!uri) {
  //     Toast.show({
  //       type: 'error',
  //       text1: '이미지를 불러오는 데 실패했어요. 다시 시도해주세요!',
  //     });
  //     return;
  //   }
  //   try {
  //     setCropperLoading(true);
  //     await ImageCropPicker.clean();

  //     const res = await ImageCropPicker.openCropper({
  //       path: uri,
  //       width: IMAGE_WIDTH,
  //       height: IMAGE_HEIGHT,
  //       cropping: true,
  //       mediaType: 'photo',
  //     });
  //     // NOTE 이미지 저장 후 경로 저장하기
  //     const destinationPath = `${RNFS.DocumentDirectoryPath}/cropped_${fileName}`;

  //     try {
  //       await RNFS.copyFile(res.path, destinationPath);
  //       setImage({ ...res, path: destinationPath });
  //     } catch (error) {
  //       console.error(error);
  //       Toast.show({
  //         type: 'error',
  //         text1: '이미지를 저장하는 데 문제가 생겼어요. 다시 시도해주세요!',
  //       });
  //     }
  //   } catch (error) {
  //     console.error(error);
  //     Toast.show({
  //       type: 'error',
  //       text1: '이미지를 불러오는 데 실패했어요. 다시 시도해주세요!',
  //     });
  //   } finally {
  //     setCropperLoading(false);
  //   }
  // };
  /* */

  const getImageAction = async (buttonIndex: number) => {
    if (buttonIndex === 1) {
      const result = await launchCamera({
        mediaType: 'photo',
        maxWidth: IMAGE_WIDTH,
        maxHeight: IMAGE_HEIGHT,
        quality: 0.8,
        saveToPhotos: true,
      });
      const item = result.assets;
      if (!item || !item[0].uri || !item[0].width || !item[0].height) {
        return;
      }
      // const tempName = [...item[0].uri.split('/').reverse()][0];
      // FIXME crop 기능 제외
      // await openPicker(item[0].fileName ?? tempName, item[0].uri, 'CAMERA');
      try {
        const uploadedImage: ImageOrVideo = {
          path: item[0].uri,
          size: item[0].fileSize ?? 0,
          width: item[0].width ?? IMAGE_WIDTH,
          height: item[0].height ?? IMAGE_HEIGHT,
          mime: item[0].type ?? 'image/jpeg',
        };

        setTempRecord({
          ...tempRecord,
          image: uploadedImage,
        });
      } catch (error) {
        console.error(error);
        Toast.show({
          type: 'error',
          text1: '이미지를 불러오는 데 문제가 생겼어요. 다시 시도해주세요!',
        });
      }
    } else if (buttonIndex === 2) {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: IMAGE_WIDTH,
        maxHeight: IMAGE_HEIGHT,
      });
      const item = result.assets;
      if (!item || !item[0].uri || !item[0].width || !item[0].height) {
        return;
      }
      const tempName = [...item[0].uri.split('/').reverse()][0];
      // FIXME crop 기능 제외
      // await openPicker(item[0].fileName ?? tempName, item[0].uri, 'GALLARY');
      const destinationPath = `${RNFS.DocumentDirectoryPath}/cropped_${
        item[0].fileName ?? tempName
      }`;

      try {
        await RNFS.copyFile(item[0].uri, destinationPath);
        const uploadedImage: ImageOrVideo = {
          path: destinationPath,
          size: item[0].fileSize ?? 0,
          width: item[0].width ?? IMAGE_WIDTH,
          height: item[0].height ?? IMAGE_HEIGHT,
          mime: item[0].type ?? 'image/jpeg',
        };
        setTempRecord({
          ...tempRecord,
          image: uploadedImage,
        });
      } catch (error) {
        console.error(error);
        Toast.show({
          type: 'error',
          text1: '이미지를 저장하는 데 문제가 생겼어요. 다시 시도해주세요!',
        });
      }
    }
  };

  const onPressOpenGallery = async () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['취소', '카메라', '앨범'],
          cancelButtonIndex: 0,
        },
        buttonIndex => getImageAction(buttonIndex),
      );
    } else if (Platform.OS === 'android') {
      Alert.alert(
        '이미지 선택',
        '이미지를 추가할 방식을 선택해주세요!',
        [
          {
            text: '취소',
            onPress: () => getImageAction(0),
            style: 'cancel',
          },
          {
            text: '카메라',
            onPress: () => getImageAction(1),
          },
          {
            text: '앨범',
            onPress: () => getImageAction(2),
          },
        ],
        { cancelable: true, onDismiss: () => getImageAction(0) },
      );
    }
  };

  const onSave = async () => {
    const { image, memo, selectedStadium } = tempRecord;
    if (!image || !memo || !selectedStadium) {
      Toast.show({
        type: 'error',
        text1: '아직 입력하지 않은 항목이 있어요!',
        topOffset: 64,
      });
      return;
    }

    if (Platform.OS === 'android' && !(await hasAndroidPermission())) {
      Alert.alert('저장소 접근 권한을 먼저 설정해주세요!');
      return;
    }

    if (isEdit) {
      await AsyncStorage.removeItem(tempRecord.date);
      await AsyncStorage.setItem(
        tempRecord.date,
        JSON.stringify({
          image,
          memo,
          selectedStadium,
          date: tempRecord.date,
          home: matchInfo?.[selectedStadium]?.home,
          away: matchInfo?.[selectedStadium]?.away,
        }),
      );

      setRecordsState(
        recordsState.map(record =>
          record.date === tempRecord.date ? tempRecord : record,
        ),
      );
      setRecordState(tempRecord);
    } else {
      const keys = await AsyncStorage.getAllKeys();
      // NOTE 하루에 여러개의 기록 저장하는 경우
      if (keys.includes(formattedToday)) {
        const duplDate = `${formattedToday}(${
          keys.filter(key => key === formattedToday).length
        })`;
        await AsyncStorage.setItem(
          duplDate,
          JSON.stringify({
            image,
            memo,
            selectedStadium,
            date: duplDate,
            home: matchInfo?.[selectedStadium]?.home,
            away: matchInfo?.[selectedStadium]?.away,
          }),
        );
        setRecordsState(
          filterDuplicatedArray([
            ...recordsState,
            {
              id: uuid.v4(),
              date: duplDate,
              image,
              memo,
              selectedStadium,
            },
          ]),
        );
        setRecordState({
          id: uuid.v4(),
          date: duplDate,
          image,
          memo,
          selectedStadium,
        });
      } else {
        await AsyncStorage.setItem(
          formattedToday,
          JSON.stringify({
            image,
            memo,
            selectedStadium,
            date: formattedToday,
            home: matchInfo?.[selectedStadium]?.home,
            away: matchInfo?.[selectedStadium]?.away,
          }),
        );
        setRecordsState([
          {
            id: uuid.v4(),
            date: formattedToday,
            image,
            memo,
            selectedStadium,
          },
        ]);
        setRecordState({
          id: uuid.v4(),
          date: formattedToday,
          image,
          memo,
          selectedStadium,
        });
      }
    }

    setTempRecord(RESET_RECORD);
    setIsVisible(false);
  };

  const getTodayMatch = async () => {
    const res = await API.get<StrapiType<MatchDataType>>(
      `/schedule-2024s?filters[date]=${apiFormattedToday}`,
    );
    if (!res.data.data.length) {
      setStadium(['경기가 없어요!']);
    } else {
      const _stadium = res.data.data.map(att => {
        let stadiumName = att.attributes.stadium;

        if (att.attributes.memo.includes('더블헤더')) {
          stadiumName += `-${
            res.data.data
              .filter(
                data => data.attributes.stadium === att.attributes.stadium,
              )
              .findIndex(
                value => value.attributes.time === att.attributes.time,
              ) + 1
          }`;
        }
        setMatchInfo(prev => {
          return {
            ...prev,
            [stadiumName]: {
              home: att.attributes.home,
              away: att.attributes.away,
            },
          };
        });
        return stadiumName;
      });

      setStadium(_stadium);
    }
  };

  // 경기장 셀렉트박스 구현
  const getAllStadiumDistance = () => {
    // NOTE 위도 - 경도 순서가 아니라 경도 - 위도 순서임
    const start = { lat: Number(latitude), lon: Number(longitude) };
    const _stadiumInfo: { name: string; distance: number }[] = [];

    for (let sta of stadium) {
      if (sta === '경기가 없어요!') {
        _stadiumInfo.push({ name: sta, distance: 0 });
      } else {
        getStadiumDistance(sta, _stadiumInfo, start);
      }
    }
    setStadiumInfo(_stadiumInfo);
    setLoading(false);
  };

  const getStadiumDistance = (
    stadiumShortName: string,
    result: { name: string; distance: number }[],
    start: CoordinateType,
  ) => {
    let editedName = '';
    let isDh = false;
    let dhInfo = '';

    // 더블헤더
    if (stadiumShortName.includes('-')) {
      editedName = stadiumShortName.split('-')[0];
      dhInfo = stadiumShortName.split('-')[1];
      isDh = true;
    } else {
      editedName = stadiumShortName;
    }

    const goal = {
      lat: STADIUM_GEO[editedName].lat,
      lon: STADIUM_GEO[editedName].lon,
    };
    const res = getDistanceFromLatLonToKm(start, goal);
    if (isDh) {
      result.push({
        name: `${STADIUM_SHORT_TO_LONG[editedName]} - DH ${dhInfo}`,
        distance: res,
      });
    } else {
      result.push({
        name: STADIUM_SHORT_TO_LONG[editedName],
        distance: res,
      });
    }
  };

  const getLocation = async () => {
    Geolocation.getCurrentPosition(
      position => {
        const _latitude = JSON.stringify(position.coords.latitude);
        const _longitude = JSON.stringify(position.coords.longitude);

        setLatitude(_latitude);
        setLongitude(_longitude);
      },
      async error => {
        console.log(error.code, error.message);
        return await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
      },
      { enableHighAccuracy: false, timeout: 30000, maximumAge: 10000 },
    );
  };

  return (
    <Modal animationType="slide" visible={isVisible}>
      <View style={modalStyles.wrapper}>
        <View style={modalStyles.header}>
          <Text style={modalStyles.uploadText}>업로드</Text>
        </View>

        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          {/* SECTION CONTENTS */}
          <View style={modalStyles.contentWrapper}>
            <View style={{ position: 'relative' }}>
              <Text style={modalStyles.labelText}>대표 이미지</Text>
              {/* 이미지 */}
              {cropperLoading ? (
                <View
                  style={{
                    width: width - 48,
                    height: width - 48,
                    justifyContent: 'center',
                  }}>
                  <Loading />
                </View>
              ) : tempRecord.image ? (
                <TouchableOpacity onPress={onPressOpenGallery}>
                  <View>
                    <FastImage
                      source={{ uri: tempRecord.image.path }}
                      style={{
                        width: width - 48,
                        height: (IMAGE_HEIGHT * (width - 48)) / IMAGE_WIDTH,
                      }}
                    />
                  </View>
                </TouchableOpacity>
              ) : (
                // 갤러리 호출
                <TouchableOpacity onPress={onPressOpenGallery}>
                  <View>
                    <View style={modalStyles.emptyImageWrapper}>
                      <Add
                        width={32}
                        height={32}
                        color={palette.greyColor.gray8}
                      />
                    </View>
                  </View>
                </TouchableOpacity>
              )}
            </View>

            {/* 경기정보 영역 */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-end',
              }}>
              <Text
                style={{
                  fontFamily: 'UhBee Seulvely',
                  marginTop: 8,
                }}>
                {dayjs(date).format(DATE_FORMAT_SLASH)}
              </Text>
              <TouchableOpacity
                style={{
                  marginLeft: 4,
                  marginTop: 4,
                  marginBottom: 32,
                  padding: 4,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
                onPress={() => setStadiumSelectVisible(true)}>
                <Text
                  style={{
                    fontFamily: 'UhBee Seulvely',
                    color: tempRecord.selectedStadium.length ? '#222' : '#888',
                  }}>
                  {' @'}
                  {tempRecord.selectedStadium.length
                    ? tempRecord.selectedStadium
                    : '경기장을 선택해주세요'}
                </Text>
                <Arrow width={16} height={16} color={'#666'} />
              </TouchableOpacity>
            </View>
          </View>

          <KeyboardAvoidingView
            contentContainerStyle={[
              { height: 'auto' },
              isKeyboardShow
                ? {
                    width: width,
                    backgroundColor: 'rgba(0,0,0,0.4)',
                  }
                : {},
            ]}
            keyboardVerticalOffset={80}
            behavior="position">
            {/* 텍스트 */}
            <View
              style={
                isKeyboardShow
                  ? {
                      bottom: 0,
                      position: 'absolute',
                      paddingHorizontal: 24,
                      paddingVertical: 12,
                      backgroundColor: '#fff',
                    }
                  : {}
              }>
              <Text style={modalStyles.labelText}>내용</Text>
              <TextInput
                multiline
                maxLength={200}
                value={tempRecord.memo}
                onChangeText={value => {
                  if ((value.match(/\n/g) ?? '').length > 5) {
                    Alert.alert('줄바꿈은 최대 8줄만 가능해요!');
                  } else {
                    setTempRecord({
                      ...tempRecord,
                      memo: value,
                    });
                  }
                }}
                placeholder={`사진과 함께 기록할 내용을 적어주세요!\n두 줄에서 세 줄이 가장 적당해요 ;)`}
                style={modalStyles.input}
                numberOfLines={8}
              />
              <Text
                style={{
                  textAlign: 'right',
                  color: palette.greyColor.gray9,
                  marginTop: 4,
                  fontSize: 12,
                  fontFamily: 'KBO-Dia-Gothic-medium',
                }}>
                {tempRecord.memo.length} / 200
              </Text>
              {isKeyboardShow && (
                <TouchableOpacity
                  onPress={() => {
                    Keyboard.dismiss();
                  }}
                  style={{
                    width: '100%',
                    alignItems: 'center',
                  }}>
                  <Arrow
                    width={24}
                    height={24}
                    color={'#666'}
                    style={{
                      transform: [
                        {
                          rotate: '90deg',
                        },
                      ],
                    }}
                  />
                </TouchableOpacity>
              )}
            </View>
          </KeyboardAvoidingView>

          {/* SECTION BUTTONS */}
          <View style={modalStyles.buttonWrapper}>
            <TouchableOpacity
              onPress={() => {
                setIsVisible(false);
                setCropperLoading(false);
              }}
              style={[
                modalStyles.button,
                {
                  borderWidth: 1,
                  borderColor: palette.greyColor.border,
                },
              ]}>
              <View>
                <Text style={modalStyles.buttonText}>취소하기</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onSave}
              style={[
                modalStyles.button,
                {
                  backgroundColor: palette.commonColor.green,
                },
              ]}>
              <View>
                <Text
                  style={[
                    modalStyles.buttonText,
                    {
                      color: '#fff',
                    },
                  ]}>
                  저장하기
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {stadiumSelectVisible && (
        <SelectStadiumModal
          stadiumInfo={stadiumInfo}
          setIsVisible={value => setStadiumSelectVisible(value)}
          selectStadium={tempRecord.selectedStadium}
          setSelectedStadium={value =>
            setTempRecord({ ...tempRecord, selectedStadium: value })
          }
          isLoading={loading}
        />
      )}

      {/* NOTE root 위치에 존재하지만, 모달보다 위에 토스트를 띄우기 위해 한 번 더 호출 */}
      <Toast />
    </Modal>
  );
}
