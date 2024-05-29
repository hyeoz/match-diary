import {
  Alert,
  Dimensions,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import ImageCropPicker, { ImageOrVideo } from 'react-native-image-crop-picker';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Geolocation from '@react-native-community/geolocation';
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
import { palette } from '@style/palette';
import Add from '@assets/svg/add.svg';
import Arrow from '@assets/svg/arrow.svg';

const { width } = Dimensions.get('window');
const { height } = Dimensions.get('screen');
const formattedToday = dayjs().format(DATE_FORMAT);
const apiFormattedToday = dayjs().format(API_DATE_FORMAT);

export default function UploadModal({
  image,
  setImage,
  memo,
  setMemo,
  selectedStadium,
  setSelectedStadium,
  isVisible,
  setIsVisible,
}: DetailPropsType & { isVisible: boolean }) {
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

  useEffect(() => {
    Keyboard.addListener('keyboardWillShow', () => setIsKeyboardShow(true));
    Keyboard.addListener('keyboardWillHide', () => setIsKeyboardShow(false));

    return () => {
      Keyboard.removeAllListeners('keyboardWillShow');
      Keyboard.removeAllListeners('keyboardWillHide');
    };
  }, []);

  useEffect(() => {
    getLocation();
  }, [isVisible]);

  useEffect(() => {
    getTodayMatch();
    getStadiumDistance();
  }, [latitude, longitude, isVisible]);

  const onPressOpenGallery = () => {
    ImageCropPicker?.openPicker({
      width: IMAGE_WIDTH,
      height: IMAGE_HEIGHT,
      cropping: true,
    })
      .then((value: ImageOrVideo) => {
        setImage(value);
      })
      .catch(res => {
        console.error(res);
      });
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
    ); // 두산 vs LG 의 경기인 경우 잠실이 두 번 나타날 수 있음
    setStadium(filteredStadium);
  };

  // 경기장 셀렉트박스 구현
  const getStadiumDistance = async () => {
    // NOTE 위도 - 경도 순서가 아니라 경도 - 위도 순서임
    // const start = `${latitude},${longitude}`;
    const start = `${longitude},${latitude}`;

    const _stadiumInfo: { name: string; distance: number }[] = [];
    stadium.forEach(async s => {
      const geo = `${STADIUM_GEO[s].lon},${STADIUM_GEO[s].lat}`;
      const res = await NAVER_API.get<NaverDirectionsResponseType>(
        `/map-direction/v1/driving?start=${start}&goal=${geo}`,
      );
      _stadiumInfo.push({
        name: STADIUM_SHORT_TO_LONG[s],
        distance: res.data.route?.traoptimal[0].summary.distance ?? 0,
      });
    });

    setStadiumInfo(_stadiumInfo);
  };

  const getLocation = async () => {
    Geolocation.getCurrentPosition(
      position => {
        const _latitude = JSON.stringify(position.coords.latitude);
        const _longitude = JSON.stringify(position.coords.longitude);

        setLatitude(_latitude);
        setLongitude(_longitude);
      },
      error => {
        console.log(error.code, error.message);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
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
                    <Image
                      source={{ uri: image.path }} // TODO 현재 불러온 이미지 path 기준으로 보여줌 -> 원본이미지 삭제 시 뜨지않음
                      width={width - 48}
                      height={(IMAGE_HEIGHT * (width - 48)) / IMAGE_WIDTH}
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
                {dayjs().format(DATE_FORMAT_SLASH)}
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
      {/* </TouchableWithoutFeedback> */}
      {stadiumSelectVisible && (
        <SelectStadiumModal
          stadiumInfo={stadiumInfo}
          setIsVisible={value => setStadiumSelectVisible(value)}
          selectStadium={selectedStadium}
          setSelectedStadium={value => setSelectedStadium(value)}
        />
      )}

      {/* NOTE root 위치에 존재하지만, 모달보다 위에 토스트를 띄우기 위해 한 번 더 호출 */}
      <Toast />
    </Modal>
  );
}

const modalStyles = StyleSheet.create({
  header: {
    borderBottomWidth: 1,
    paddingBottom: 10,
    top: 0,
    left: 0,
    position: 'absolute',
    width: width - 48,
  },
  wrapper: {
    flex: 1,
    marginHorizontal: 24,
    marginTop: 80,
    marginBottom: 60,
    backgroundColor: '#fff',
  },
  contentWrapper: {
    top: 48,
    // height: height - 190,
  },
  input: {
    width: width - 48,
    height: 120,
    borderWidth: 1,
    borderRadius: 4,
    borderColor: '#888',
    paddingHorizontal: 10,
    // paddingTop: 10,
    fontFamily: 'KBO-Dia-Gothic-mediumd',
  },
  emptyImageWrapper: {
    width: width - 48,
    height: (IMAGE_HEIGHT * (width - 48)) / IMAGE_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#888',
    borderStyle: 'dashed',
    borderRadius: 8,
  },
  buttonWrapper: {
    flexDirection: 'row',
    gap: 16,
    width: '100%',
    paddingTop: 48,
  },
  button: {
    width: width / 2 - 24 - 8,
    padding: 16,
    borderRadius: 8,
  },
  labelText: {
    fontSize: 18,
    marginBottom: 8,
    fontWeight: '600',
    fontFamily: 'KBO-Dia-Gothic-bold',
  },
  buttonText: {
    color: 'black',
    fontSize: 16,
    textAlign: 'center',
    fontFamily: 'KBO-Dia-Gothic-bold',
  },
});
