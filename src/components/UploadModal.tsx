import {
  ActionSheetIOS,
  Alert,
  Dimensions,
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
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { PERMISSIONS, request } from 'react-native-permissions';
import FastImage from 'react-native-fast-image';
import Toast from 'react-native-toast-message';
import Geolocation from '@react-native-community/geolocation';
import { launchImageLibrary } from 'react-native-image-picker';
import ImageResizer from 'react-native-image-resizer';
import RNFS from 'react-native-fs';
import ViewShot, { captureRef } from 'react-native-view-shot';
import { Camera } from 'react-native-vision-camera';
import { AdEventType, InterstitialAd } from 'react-native-google-mobile-ads';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
dayjs.locale('ko');

import { API } from '@/api';
import SelectStadiumModal from './SelectStadiumModal';
import Loading from './Loading';
import RenderCamera from './RenderCamera';
import CameraOverlay from './CameraOverlay';
import {
  DATE_FORMAT,
  DATE_FORMAT_SLASH,
  IMAGE_HEIGHT,
  IMAGE_WIDTH,
  INIT_RECORD,
  MINIMUM_HEIGHT,
  NO_MATCH_STADIUM_KEY,
  RESET_RECORD,
  SERVER_ERROR_MSG,
} from '@utils/STATIC_DATA';
import { getDistanceFromLatLonToKm, hasAndroidPermission } from '@utils/helper';
import { useUserState } from '@/stores/user';
import { useStadiumsState, useTeamsState } from '@/stores/teams';
import { useCarouselIndexState } from '@/stores/default';
import { getMatchByDate } from '@/api/match';
import { getRecordByDate } from '@/api/record';
import { getWeatherIcon } from '@/api/weather';
import { CoordinateType, DetailPropsType } from '@/type/default';
import { RecordType, TempRecordImageType } from '@/type/record';
import { MatchDataType } from '@/type/match';
import { StadiumInfoType } from '@/type/team';
import { palette } from '@style/palette';
import { modalStyles } from '@/style/modal';
import { useFontStyle } from '@/style/hooks';
import { Add, Arrow } from '@assets/svg';
import { interstitialAd } from '@components/ads/InterstitialAds';

const { width, height } = Dimensions.get('window');

// FIXME crop 기능 제외

export default function UploadModal({
  isEdit,
  isVisible,
  setIsVisible,
  records,
  setRecords,
  date,
}: DetailPropsType & {
  isVisible: boolean;
  date?: string;
}) {
  const viewShotRef = useRef(null);
  const cameraRef = useRef<Camera>(null);

  const [todayStadiums, setTodayStadiums] = useState<
    { name: string; stadium_id: number; match_id: number }[]
  >([]);
  const [stadiumInfo, setStadiumInfo] = useState<StadiumInfoType[]>([]);
  const [matchInfo, setMatchInfo] = useState<{
    home: string;
    away: string;
  }>();
  const [stadiumSelectVisible, setStadiumSelectVisible] = useState(false);
  const [latitude, setLatitude] = useState(''); // 현재 유저의 위도
  const [longitude, setLongitude] = useState(''); // 현재 유저의 경도
  const [isKeyboardShow, setIsKeyboardShow] = useState(false);
  const [loading, setLoading] = useState(true);
  const [cropperLoading, setCropperLoading] = useState(false);
  const [tempRecord, setTempRecord] = useState<RecordType | null>(RESET_RECORD);
  const [matches, setMatches] = useState<MatchDataType[]>([]);
  const [visibleFakeCamera, setVisibleFakeCamera] = useState(false);
  const [currentWeather, setCurrentWeather] = useState('');
  const [cameraUri, setCameraUri] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [adLoaded, setAdLoaded] = useState(false);

  const { uniqueId } = useUserState();
  const { stadiums } = useStadiumsState();
  const { teams } = useTeamsState();
  const { carouselIndexState } = useCarouselIndexState();

  const fontStyle = useFontStyle;

  const formattedToday = dayjs(date).format(DATE_FORMAT);

  // 저장 요청을 위한 참조 변수
  const [savedData, setSavedData] = useState<{
    formData: FormData | null;
    isEdit: boolean;
    tempDate: string;
  } | null>(null);

  useEffect(() => {
    const unsubscribeLoaded = interstitialAd.addAdEventListener(
      AdEventType.LOADED,
      () => {
        console.log('광고 로드 완료');
        setAdLoaded(true);
      },
    );

    // 광고가 닫힐 때 저장 요청 처리
    const unsubscribeClosed = interstitialAd.addAdEventListener(
      AdEventType.CLOSED,
      async () => {
        console.log('광고 닫힘, 저장 요청 처리');
        setAdLoaded(false);

        // 저장할 데이터가 있는 경우에만 저장 요청 처리
        if (savedData && savedData.formData) {
          try {
            // 기록 수정 또는 생성 API 호출
            if (savedData.isEdit) {
              await API.patch('/record/update', savedData.formData, {
                headers: {
                  'Content-Type': 'multipart/form-data',
                },
              });
            } else {
              await API.post('/create-record', savedData.formData, {
                headers: {
                  'Content-Type': 'multipart/form-data',
                },
              });
            }

            // 성공적으로 저장된 경우
            const res = await getRecordByDate(savedData.tempDate);
            setRecords(res.data);
            setTempRecord(RESET_RECORD);
            setIsVisible(false);

            Toast.show({
              type: 'success',
              text1: '저장되었습니다!',
            });
          } catch (error) {
            console.error(error);
            Toast.show({
              type: 'error',
              text1: SERVER_ERROR_MSG,
            });
          } finally {
            setIsSaving(false);
            setSavedData(null); // 저장 데이터 초기화
          }
        } else {
          setIsSaving(false);
        }

        // 다음 사용을 위해 다시 광고 로드
        interstitialAd.load();
      },
    );

    // 초기 광고 로드
    interstitialAd.load();

    return () => {
      unsubscribeLoaded();
      unsubscribeClosed();
    };
  }, [savedData]);

  useEffect(() => {
    Keyboard.addListener('keyboardWillShow', () => setIsKeyboardShow(true));
    Keyboard.addListener('keyboardWillHide', () => setIsKeyboardShow(false));
    !tempRecord &&
      setTempRecord({
        ...INIT_RECORD,
        user_id: uniqueId,
        date: formattedToday,
      });

    return () => {
      Keyboard.removeAllListeners('keyboardWillShow');
      Keyboard.removeAllListeners('keyboardWillHide');
    };
  }, []);

  useEffect(() => {
    // NOTE 캐러셀에서 수정으로 넘어가기
    if (isEdit) {
      setTempRecord(records[carouselIndexState]);
    } else {
      setTempRecord({
        ...INIT_RECORD,
        user_id: uniqueId,
        date: formattedToday,
      });
    }
  }, [isEdit, isVisible]);

  useEffect(() => {
    setLoading(true);
    if (Platform.OS === 'ios') {
      getLocation();
    }
    getTodayMatch();
    getAllStadiumDistance();
  }, [latitude, longitude, isVisible, stadiumSelectVisible]);

  // 카메라 촬영 버튼
  const getPicture = async () => {
    if (cameraRef.current) {
      try {
        const data = await cameraRef.current.takePhoto();
        // 안드로이드에서 file:// 스키마 추가
        const imagePath =
          Platform.OS === 'android' ? `file://${data.path}` : data.path;
        setCameraUri(imagePath);
        setVisibleFakeCamera(false);
      } catch (error) {
        console.error(error);
      }
    }
  };

  // TODO ViewShot을 이용해 화면 캡처
  const captureFilteredImage = async () => {
    try {
      const uri = await captureRef(viewShotRef, {
        format: 'jpg',
        quality: 1,
      });
      // 저장할 경로 설정 (iOS와 Android 경로 다름)
      const fileName = `오늘의_직관일기_${new Date()
        .toISOString()
        .replace(/:/g, '-')}.jpg`;
      const savePath =
        Platform.OS === 'android'
          ? `${RNFS.PicturesDirectoryPath}/${fileName}`
          : `${RNFS.DocumentDirectoryPath}/${fileName}`;

      // 캡처된 이미지 파일을 저장
      await RNFS.copyFile(uri, savePath);

      if (tempRecord) {
        setTempRecord({
          ...tempRecord,
          image: {
            uri: uri,
            type: 'image/jpeg',
            name: fileName, // 파일 이름을 기본 값으로 설정
          },
        });
      }
      setCameraUri('');
    } catch (error) {
      console.error(error);
      Toast.show({
        type: 'error',
        text1: '이미지를 불러오는 데 문제가 생겼어요. 다시 시도해주세요!',
      });
    }
  };

  // 기본 이미지 선택 액션
  const getImageAction = async (buttonIndex: number) => {
    // 카메라 선택
    if (buttonIndex === 1) {
      if (
        Platform.OS === 'android' &&
        !(await hasAndroidPermission('CAMERA'))
      ) {
        Alert.alert('카메라 사용 권한을 먼저 설정해주세요!');
        return;
      }
      // NOTE 가상카메라로 대체
      setVisibleFakeCamera(true);
    } else if (buttonIndex === 2) {
      try {
        // 앨범 선택
        const result = await launchImageLibrary({
          mediaType: 'photo',
          quality: 1,
          includeExtra: true,
        });

        const item = result.assets;
        if (!item || !item[0].uri) {
          return;
        }

        // 이미지 리사이즈 및 회전 처리
        const resizedImage = await ImageResizer.createResizedImage(
          item[0].uri,
          item[0].width || 1024,
          item[0].height || 1024,
          'JPEG',
          100,
          0,
          undefined,
          false,
          { mode: 'contain', onlyScaleDown: true },
        );

        if (tempRecord) {
          setTempRecord({
            ...tempRecord,
            image: {
              uri: resizedImage.uri,
              type: 'image/jpeg',
              name: resizedImage.name || 'image.jpg',
            },
          });
        }
      } catch (error) {
        console.error(error);
        Toast.show({
          type: 'error',
          text1: '이미지를 저장하는 데 문제가 생겼어요. 다시 시도해주세요!',
        });
      }
    }
  };

  // 티켓 이미지 선택 액션
  const getTicketImageAction = async () => {
    try {
      // 앨범 선택
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 1,
        includeExtra: true,
      });

      const item = result.assets;
      if (!item || !item[0].uri) {
        return;
      }
      // 이미지 리사이즈 및 회전 처리
      const resizedImage = await ImageResizer.createResizedImage(
        item[0].uri,
        item[0].width || 1024,
        item[0].height || 1024,
        'JPEG',
        100,
        0,
        undefined,
        false,
        { mode: 'contain', onlyScaleDown: true },
      );

      if (tempRecord) {
        setTempRecord({
          ...tempRecord,
          ticket_image: {
            uri: resizedImage.uri,
            type: 'image/jpeg',
            name: resizedImage.name || 'image.jpg',
          },
        });
      }
    } catch (error) {
      console.error(error);
      Toast.show({
        type: 'error',
        text1: '이미지를 저장하는 데 문제가 생겼어요. 다시 시도해주세요!',
      });
    }
  };
  console.log(isSaving);
  // 저장 버튼
  const onSave = async () => {
    if (!tempRecord || isSaving) return;

    try {
      setIsSaving(true);
      const {
        user_id,
        image,
        user_note,
        stadium_id,
        date: tempDate,
      } = tempRecord;

      if (!image || !user_note || !stadium_id) {
        Toast.show({
          type: 'error',
          text1: '아직 입력하지 않은 항목이 있어요!',
          topOffset: 64,
        });
        setIsSaving(false);
        return;
      }

      if (
        Platform.OS === 'android' &&
        !(await hasAndroidPermission('MANAGE_EXTERNAL_STORAGE'))
      ) {
        Alert.alert('저장소 접근 권한을 먼저 설정해주세요!');
        setIsSaving(false);
        return;
      }

      // FormData 준비
      const formData = new FormData();
      formData.append('userId', user_id);
      formData.append('stadiumId', stadium_id);
      formData.append('date', tempDate);
      formData.append('userNote', user_note);
      formData.append(
        'matchId',
        (tempRecord?.match_id
          ? tempRecord?.match_id
          : matches.find(mat => mat.stadium === stadium_id)?.id) || null,
      );

      // 기록 수정 여부에 따라 FormData 구성
      if (isEdit && tempRecord?.records_id) {
        formData.append('recordsId', tempRecord?.records_id);
        if (typeof tempRecord?.image === 'string') {
          formData.append('imageUrl', tempRecord?.image);
        } else {
          formData.append('file', tempRecord?.image);
        }

        if (tempRecord?.ticket_image) {
          if (typeof tempRecord?.ticket_image === 'string') {
            formData.append('ticketUrl', tempRecord?.ticket_image);
          } else {
            formData.append('ticketFile', tempRecord?.ticket_image);
          }
        }
      } else {
        // 기록 생성
        formData.append('file', image);
        if (tempRecord?.ticket_image) {
          formData.append('ticketFile', tempRecord?.ticket_image);
        }
      }

      // 저장할 데이터 설정 (광고 닫힌 후 처리를 위해)
      setSavedData({
        formData,
        isEdit: !!(isEdit && tempRecord?.records_id),
        tempDate,
      });

      console.log('광고 표시 시도');
      try {
        // 광고가 로드되지 않은 경우 로드 시도
        if (!interstitialAd.loaded) {
          console.log('광고 로드 시도');
          await new Promise<void>((resolve, reject) => {
            // 타임아웃 처리 (5초)
            const timeout = setTimeout(() => {
              console.log('광고 로드 타임아웃');
              reject(new Error('광고 로드 타임아웃'));
            }, 5000);

            const unsubscribe = interstitialAd.addAdEventListener(
              AdEventType.LOADED,
              () => {
                console.log('광고 로드 성공');
                clearTimeout(timeout);
                unsubscribe();
                resolve();
              },
            );

            const errorUnsubscribe = interstitialAd.addAdEventListener(
              AdEventType.ERROR,
              error => {
                console.log('광고 로드 오류:', error);
                clearTimeout(timeout);
                errorUnsubscribe();
                reject(error);
              },
            );

            interstitialAd.load();
          }).catch(error => {
            console.log('광고 로드 실패:', error);
            // 광고 로드 실패 시 저장 진행
            processAdClosed();
          });
        }

        // 광고가 로드되면 표시
        if (interstitialAd.loaded) {
          console.log('광고 표시 시작');
          await interstitialAd.show();
        } else {
          console.log('광고가 로드되지 않아 바로 저장 진행');
          // 광고가 로드되지 않은 경우 바로 저장 진행
          processAdClosed();
        }
      } catch (error) {
        console.log('광고 표시 오류:', error);
        // 오류 발생 시 바로 저장 진행
        processAdClosed();
      }
    } catch (error) {
      console.error(error);
      Toast.show({
        type: 'error',
        text1: SERVER_ERROR_MSG,
      });
      setIsSaving(false);
    }
  };

  // 광고 닫힌 이벤트 처리를 위한 함수 (광고 로드 실패 시에도 호출)
  const processAdClosed = async () => {
    if (!savedData || !savedData.formData) {
      setIsSaving(false);
      return;
    }

    try {
      // 기록 수정 또는 생성 API 호출
      if (savedData.isEdit) {
        await API.patch('/record/update', savedData.formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        await API.post('/create-record', savedData.formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }

      // 성공적으로 저장된 경우
      const res = await getRecordByDate(savedData.tempDate);
      setRecords(res.data);
      setTempRecord(RESET_RECORD);
      setIsVisible(false);

      Toast.show({
        type: 'success',
        text1: '저장되었습니다!',
      });
    } catch (error) {
      console.error(error);
      Toast.show({
        type: 'error',
        text1: SERVER_ERROR_MSG,
      });
    } finally {
      setIsSaving(false);
      setSavedData(null); // 저장 데이터 초기화
    }
  };

  // 오늘자 경기 조회
  const getTodayMatch = async () => {
    const res = await getMatchByDate(formattedToday);
    setMatches(res.data);

    if (!res.data.length) {
      setTodayStadiums([
        {
          name: '경기가 없어요!',
          stadium_id: NO_MATCH_STADIUM_KEY,
          match_id: 0,
        },
      ]);
    } else {
      const tempStadiums = res.data.map(match => {
        const stadiumId = match.stadium;
        let stadiumName =
          stadiums.find(sta => sta.stadium_id === stadiumId)?.stadium_name ??
          '';

        if (match.memo?.includes('더블헤더')) {
          stadiumName += `-${
            res.data
              .filter(data => data.stadium === match.stadium)
              .findIndex(value => value.time === match.time) + 1
          }`;
        }
        setMatchInfo({
          home:
            teams.find(team => team.team_id === match.home)?.team_name ?? '',
          away:
            teams.find(team => team.team_id === match.away)?.team_name ?? '',
        });
        return { name: stadiumName, stadium_id: stadiumId, match_id: match.id };
      });

      setTodayStadiums(tempStadiums);
    }
  };

  // 경기장 셀렉트박스 구현
  const getAllStadiumDistance = () => {
    const start = { lat: Number(latitude), lon: Number(longitude) };
    const stadiumInfoList: StadiumInfoType[] = [];

    for (let sta of todayStadiums) {
      if (sta.stadium_id === NO_MATCH_STADIUM_KEY) {
        stadiumInfoList.push({
          name: sta.name,
          stadium_id: NO_MATCH_STADIUM_KEY,
          match_id: 0,
          distance: 0,
        });
      } else {
        getStadiumDistance(sta, stadiumInfoList, start);
      }
    }
    setStadiumInfo(stadiumInfoList);
    setLoading(false);
  };

  // 경기장 거리 계산
  const getStadiumDistance = (
    stadiumObj: Omit<StadiumInfoType, 'distance'>,
    result: StadiumInfoType[],
    start: CoordinateType,
  ) => {
    let editedName = '';
    let isDh = false;
    let dhInfo = '';

    // 더블헤더
    if (stadiumObj.name.includes('-')) {
      editedName = stadiumObj.name.split('-')[0];
      dhInfo = stadiumObj.name.split('-')[1];
      isDh = true;
    } else {
      editedName = stadiumObj.name;
    }

    const targetStadium = stadiums.find(sta => sta.stadium_name === editedName);

    const goal = {
      lat: targetStadium?.latitude || 0,
      lon: targetStadium?.longitude || 0,
    };

    const res = getDistanceFromLatLonToKm(start, goal);

    if (isDh) {
      result.push({
        name: `${targetStadium?.stadium_name} - DH ${dhInfo}`,
        stadium_id: stadiumObj.stadium_id,
        match_id: stadiumObj?.match_id || 0,
        distance: res,
      });
    } else {
      result.push({
        name: targetStadium?.stadium_name || '',
        stadium_id: stadiumObj.stadium_id,
        match_id: stadiumObj?.match_id || 0,
        distance: res,
      });
    }
  };

  // 현재 유저의 위치
  const getLocation = async () => {
    try {
      // 안드로이드 권한 체크 및 요청
      if (Platform.OS === 'android') {
        const result = await hasAndroidPermission('ACCESS_FINE_LOCATION');
        if (!result) {
          console.error('Location permission denied');
          return;
        }
      } else {
        // iOS 권한 체크 및 요청
        const result = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
        if (result !== 'granted') {
          console.error('Location permission denied');
          return;
        }
      }

      Geolocation.getCurrentPosition(
        position => {
          const _latitude = JSON.stringify(position.coords.latitude);
          const _longitude = JSON.stringify(position.coords.longitude);
          setLatitude(_latitude);
          setLongitude(_longitude);
        },
        error => {
          console.error('Location error:', error.code, error.message);
        },
        {
          enableHighAccuracy: true, // 정확도를 높이기 위해 true로 변경
          timeout: 30000,
          maximumAge: 10000,
        },
      );

      const weather = await getWeatherIcon(
        Number(latitude),
        Number(longitude),
        formattedToday,
      );
      setCurrentWeather(weather);
    } catch (error) {
      console.error('Error getting location or weather:', error);
    }
  };

  // 사진 선택 버튼 클릭
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
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}>
                <Text style={modalStyles.labelText}>이미지</Text>
                <TouchableOpacity onPress={getTicketImageAction}>
                  <Text
                    style={fontStyle(
                      {
                        color: palette.commonColor.greenBg,
                      },
                      'bold',
                    )}>
                    + 티켓 이미지 추가
                  </Text>
                </TouchableOpacity>
              </View>
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
              ) : tempRecord?.image ? (
                <TouchableOpacity onPress={onPressOpenGallery}>
                  <View>
                    <FastImage
                      source={{
                        uri:
                          typeof tempRecord?.image === 'string'
                            ? tempRecord?.image
                            : (tempRecord?.image as TempRecordImageType).uri,
                      }}
                      style={{
                        width: width - (height < MINIMUM_HEIGHT ? 80 : 48),
                        height:
                          (IMAGE_HEIGHT *
                            (width - (height < MINIMUM_HEIGHT ? 80 : 48))) /
                          IMAGE_WIDTH,
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
                    color: tempRecord?.stadium_id
                      ? palette.greyColor.gray2
                      : palette.greyColor.gray8,
                  }}>
                  {' @'}
                  {tempRecord?.stadium_id
                    ? tempRecord?.stadium_id === NO_MATCH_STADIUM_KEY
                      ? '경기가 없어요!'
                      : stadiums.find(
                          sta => sta.stadium_id === tempRecord?.stadium_id,
                        )?.stadium_name
                    : '경기장을 선택해주세요'}
                </Text>
                <Arrow width={16} height={16} color={palette.greyColor.gray6} />
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
                  ? styles.keyboardShowTextStyle
                  : {
                      marginTop: height < MINIMUM_HEIGHT ? -16 : 0,
                    }
              }>
              <Text style={modalStyles.labelText}>내용</Text>
              <TextInput
                multiline
                maxLength={200}
                value={tempRecord?.user_note}
                onChangeText={value => {
                  if ((value.match(/\n/g) ?? '').length > 5) {
                    Alert.alert('줄바꿈은 최대 8줄만 가능해요!');
                  } else if (tempRecord) {
                    setTempRecord({
                      ...tempRecord,
                      user_note: value,
                    });
                  }
                }}
                placeholder={
                  '사진과 함께 기록할 내용을 적어주세요!\n두 줄에서 세 줄이 가장 적당해요 ;)'
                }
                style={modalStyles.input}
                numberOfLines={8}
              />
              <Text
                style={fontStyle({
                  textAlign: 'right',
                  color: palette.greyColor.gray9,
                  marginTop: 4,
                  fontSize: 12,
                })}>
                {tempRecord?.user_note.length} / 200
              </Text>
              {isKeyboardShow && (
                <TouchableOpacity
                  onPress={() => Keyboard.dismiss()}
                  style={{
                    width: '100%',
                    alignItems: 'center',
                  }}>
                  <Arrow
                    width={24}
                    height={24}
                    color={palette.greyColor.gray6}
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
              disabled={isSaving}
              style={[
                modalStyles.button,
                {
                  backgroundColor: isSaving
                    ? palette.greyColor.gray6
                    : palette.commonColor.green,
                },
              ]}>
              <View>
                <Text
                  style={[
                    modalStyles.buttonText,
                    {
                      color: palette.greyColor.white,
                    },
                  ]}>
                  {isSaving ? '저장 중...' : '저장하기'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* SECTION 경기장 선택 모달 */}
      {stadiumSelectVisible && (
        <SelectStadiumModal
          stadiumInfo={stadiumInfo}
          setIsVisible={value => setStadiumSelectVisible(value)}
          tempRecord={tempRecord}
          setTempRecord={setTempRecord}
          isLoading={loading}
          selectedDate={date}
        />
      )}

      {/* SECTION 가상카메라 */}
      {visibleFakeCamera && (
        <View
          style={{
            position: 'absolute',
            width: '100%',
            height,
            backgroundColor: 'black',
          }}>
          <View
            style={{
              flex: 1,
              justifyContent: 'flex-start',
              alignItems: 'center',
              backgroundColor: 'black',
            }}>
            {/* 카메라 뷰 */}
            <RenderCamera ref={cameraRef} />
            {/* 화면 위 텍스트 오버레이 */}
            <CameraOverlay
              date={date}
              tempRecord={tempRecord}
              matches={matches}
              currentWeather={currentWeather}
            />
            {/* 촬영 버튼 */}
            <View
              style={{
                position: 'absolute',
                bottom: 150,
                width,
                flexDirection: 'row',
                paddingHorizontal: 24,
                alignItems: 'center',
              }}>
              <TouchableOpacity
                style={{
                  position: 'absolute',
                  left: 10,
                }}
                onPress={() => setVisibleFakeCamera(false)}>
                <Text
                  style={{
                    color: 'white',
                    fontSize: 20,
                  }}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={async () => {
                  await getPicture();
                }}
                style={{
                  position: 'absolute',
                  left: '50%',
                }}>
                <Text
                  style={{
                    fontSize: 32,
                  }}>
                  📸
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* SECTION 촬영 후 확인 화면 / 캡쳐될 화면 */}
      {cameraUri && (
        <View style={styles.confirmImageWrapper}>
          <Text
            style={[
              fontStyle({
                position: 'absolute',
                width: '100%',
                textAlign: 'center',
                top: '18%',
                fontSize: 24,
              }),
            ]}>
            이미지 미리보기
          </Text>
          <ViewShot style={styles.captureWrapper} ref={viewShotRef}>
            <CameraOverlay
              date={date}
              tempRecord={tempRecord}
              matches={matches}
              currentWeather={currentWeather}
              additionalStyle={{
                width: '100%',
                zIndex: 11,
                top: '5%',
              }}
            />
            <View
              style={{
                width: '100%',
                aspectRatio: 1,
                overflow: 'hidden',
              }}>
              <FastImage
                source={{
                  uri: cameraUri,
                }}
                style={{
                  width: '100%',
                  height: '100%',
                  position: 'absolute',
                  zIndex: 10,
                }}
              />
            </View>
          </ViewShot>
          <View style={styles.captureImageWrapper}>
            <TouchableOpacity
              onPress={() => {
                setCameraUri('');
              }}
              style={[
                modalStyles.button,
                {
                  borderWidth: 1,
                  borderColor: palette.greyColor.border,
                },
              ]}>
              <View>
                <Text style={modalStyles.buttonText}>다시 찍기</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={async () => {
                await captureFilteredImage();
              }}
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
                      color: palette.greyColor.white,
                    },
                  ]}>
                  사진 사용하기
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* NOTE root 위치에 존재하지만, 모달보다 위에 토스트를 띄우기 위해 한 번 더 호출 */}
      <Toast />
    </Modal>
  );
}

const styles = StyleSheet.create({
  keyboardShowTextStyle: {
    bottom: 0,
    position: 'absolute',
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  confirmImageWrapper: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    bottom: 0,
    zIndex: 9,
    backgroundColor: 'white',
    flex: 1,
    justifyContent: 'center',
  },
  captureWrapper: {
    position: 'absolute',
    width: '100%',
    aspectRatio: 1,
    top: '25%',
  },
  captureImageWrapper: {
    position: 'absolute',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    width: '100%',
    bottom: '10%',
  },
});
