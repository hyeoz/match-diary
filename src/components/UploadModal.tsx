import {
  ActionSheetIOS,
  Alert,
  Dimensions,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import ImageCropPicker, { ImageOrVideo } from 'react-native-image-crop-picker';
import { PERMISSIONS, request } from 'react-native-permissions';
import FastImage from 'react-native-fast-image';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Geolocation from '@react-native-community/geolocation';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
dayjs.locale('ko');

import SelectStadiumModal from './SelectStadiumModal';
import { API, NAVER_API, StrapiType } from '@/api';
import { DetailPropsType, MatchDataType } from '@/type/default';
import { NaverDirectionsResponseType } from '@/type/naver';
import {
  API_DATE_FORMAT,
  DATE_FORMAT,
  DATE_FORMAT_SLASH,
  IMAGE_HEIGHT,
  IMAGE_WIDTH,
  STADIUM_GEO,
  STADIUM_SHORT_TO_LONG,
} from '@utils/STATIC_DATA';
import { hasAndroidPermission } from '@utils/helper';
import { Add, Arrow } from '@assets/svg';
import { palette } from '@style/palette';
import { modalStyles } from '@style/common';

const { width } = Dimensions.get('window');

export default function UploadModal({
  image,
  setImage,
  memo,
  setMemo,
  selectedStadium,
  setSelectedStadium,
  isVisible,
  setIsVisible,
  date,
}: DetailPropsType & { isVisible: boolean; date?: string }) {
  const [stadium, setStadium] = useState<string[]>([]);
  const [stadiumInfo, setStadiumInfo] = useState<
    { name: string; distance: number }[]
  >([]);
  const [matchInfo, setMatchInfo] = useState<{
    [key: string]: { home: string; away: string };
  }>();
  // const [selectedStadium, setSelectedStadium] = useState<string>('');
  const [stadiumSelectVisible, setStadiumSelectVisible] = useState(false);
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [isKeyboardShow, setIsKeyboardShow] = useState(false);
  const [loading, setLoading] = useState(true);

  const formattedToday = dayjs(date).format(DATE_FORMAT);
  const apiFormattedToday = dayjs(date).format(API_DATE_FORMAT);

  useEffect(() => {
    Keyboard.addListener('keyboardWillShow', () => setIsKeyboardShow(true));
    Keyboard.addListener('keyboardWillHide', () => setIsKeyboardShow(false));

    return () => {
      Keyboard.removeAllListeners('keyboardWillShow');
      Keyboard.removeAllListeners('keyboardWillHide');
    };
  }, []);

  useEffect(() => {
    setLoading(true);
    getLocation();
    getTodayMatch();
    getAllStadiumDistance();
  }, [latitude, longitude, isVisible, stadiumSelectVisible]);

  const onPressOpenGallery = async () => {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: ['취소', '카메라', '앨범'],
        cancelButtonIndex: 0,
      },
      buttonIndex => getImageAction(buttonIndex),
    );
  };

  const getImageAction = async (buttonIndex: number) => {
    if (buttonIndex === 1) {
      const result = await launchCamera({
        mediaType: 'photo',
        maxWidth: IMAGE_WIDTH,
        maxHeight: IMAGE_HEIGHT,
        quality: 1,
        saveToPhotos: true,
      });

      if (!result.assets || !result.assets[0].uri) {
        return;
      }
      await openPicker(result.assets[0].uri);
    } else if (buttonIndex === 2) {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 1,
      });

      if (!result.assets || !result.assets[0].uri) {
        return;
      }
      await openPicker(result.assets[0].uri);
    }
  };

  const openPicker = async (uri: string) => {
    try {
      const res = await ImageCropPicker.openCropper({
        path: uri,
        width: IMAGE_WIDTH,
        height: IMAGE_HEIGHT,
        cropping: true,
        mediaType: 'photo',
      });
      console.log(res);
      setImage(res);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: '이미지를 불러오는 데 실패했어요. 다시 시도해주세요!',
      });
    }
  };

  const onSave = async () => {
    if (!image || !memo || !selectedStadium) {
      Toast.show({
        type: 'error',
        text1: '아직 입력하지 않은 항목이 있어요!',
        topOffset: 64,
      });
    } else if (Platform.OS === 'android' && !(await hasAndroidPermission())) {
      Alert.alert('저장소 접근 권한을 먼저 설정해주세요!');
      return;
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
      setIsVisible(false);
    }
  };

  const getTodayMatch = async () => {
    const res = await API.get<StrapiType<MatchDataType>>(
      `/schedule-2024s?filters[date]=${apiFormattedToday}`,
    );
    if (!res.data.data.length) {
      setStadium(['경기가 없어요!']);
    } else {
      const _stadium = res.data.data.map(att => {
        setMatchInfo(prev => {
          return {
            ...prev,
            [att.attributes.stadium]: {
              home: att.attributes.home,
              away: att.attributes.away,
            },
          };
        });
        return att.attributes.stadium;
      });

      const filteredStadium = _stadium.filter(
        (sta, index) => _stadium.lastIndexOf(sta) === index,
      ); // NOTE 두산 vs LG 의 경기인 경우 잠실이 두 번 나타날 수 있음
      setStadium(filteredStadium);
    }
  };

  // 경기장 셀렉트박스 구현
  const getAllStadiumDistance = async () => {
    // NOTE 위도 - 경도 순서가 아니라 경도 - 위도 순서임
    const start = `${longitude},${latitude}`;
    const _stadiumInfo: { name: string; distance: number }[] = [];

    for (let sta of stadium) {
      if (sta === '경기가 없어요!') {
        _stadiumInfo.push({ name: sta, distance: 0 });
      } else {
        await getStadiumDistance(sta, _stadiumInfo, start);
      }
    }
    setStadiumInfo(_stadiumInfo);
    setLoading(false);
  };

  const getStadiumDistance = async (
    stadium: string,
    result: { name: string; distance: number }[],
    start: string,
  ) => {
    const geo = `${STADIUM_GEO[stadium].lon},${STADIUM_GEO[stadium].lat}`;
    const res = await NAVER_API.get<NaverDirectionsResponseType>(
      `/map-direction/v1/driving?start=${start}&goal=${geo}`,
    );

    result.push({
      name: STADIUM_SHORT_TO_LONG[stadium],
      distance: res.data.route?.traoptimal[0].summary.distance ?? 0,
    });
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
          <Text
            style={{
              textAlign: 'center',
              fontWeight: '700',
              fontSize: 18,
              fontFamily: 'KBO-Dia-Gothic-bold',
              color: '#000',
            }}>
            업로드
          </Text>
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
              {image ? (
                <TouchableOpacity onPress={onPressOpenGallery}>
                  <View>
                    <FastImage
                      source={{ uri: image.path }}
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
                    color: selectedStadium.length ? '#222' : '#888',
                  }}>
                  {' @'}
                  {selectedStadium.length
                    ? selectedStadium
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
                value={memo}
                onChangeText={value => {
                  if ((value.match(/\n/g) ?? '').length > 5) {
                    Alert.alert('줄바꿈은 최대 8줄만 가능해요!');
                  } else {
                    setMemo(value);
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
                {memo.length} / 200
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
              onPress={() => setIsVisible(false)}
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
          selectStadium={selectedStadium}
          setSelectedStadium={value => setSelectedStadium(value)}
          isLoading={loading}
        />
      )}

      {/* NOTE root 위치에 존재하지만, 모달보다 위에 토스트를 띄우기 위해 한 번 더 호출 */}
      <Toast />
    </Modal>
  );
}
