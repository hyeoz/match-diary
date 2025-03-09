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
import React, { useEffect, useState } from 'react';
import { PERMISSIONS, request } from 'react-native-permissions';
import FastImage from 'react-native-fast-image';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Geolocation from '@react-native-community/geolocation';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import RNFS from 'react-native-fs';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
dayjs.locale('ko');

import SelectStadiumModal from './SelectStadiumModal';
import Loading from './Loading';
import { CoordinateType, DetailPropsType } from '@/type/default';
import { RecordType, TempRecordImageType } from '@/type/record';
import {
  API_DATE_FORMAT,
  DATE_FORMAT,
  DATE_FORMAT_SLASH,
  IMAGE_HEIGHT,
  IMAGE_WIDTH,
  NO_MATCH_STADIUM_KEY,
  RESET_RECORD,
  SERVER_ERROR_MSG,
} from '@utils/STATIC_DATA';
import { getDistanceFromLatLonToKm, hasAndroidPermission } from '@utils/helper';
import { Add, Arrow } from '@assets/svg';
import { palette } from '@style/palette';
import { modalStyles } from '@/style/modal';
import { useUserState } from '@/stores/user';
import { useStadiumsState, useTeamsState } from '@/stores/teams';
import { useCarouselIndexState } from '@/stores/default';
import { getMatchByDate } from '@/api/match';
import { API } from '@/api';
import { getRecordByDate } from '@/api/record';
import { useFontStyle } from '@/style/hooks';
import { MatchDataType } from '@/type/match';

const { width } = Dimensions.get('window');

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
  const [todayStadiums, setTodayStadiums] = useState<
    { name: string; id: number }[]
  >([]);
  const [stadiumInfo, setStadiumInfo] = useState<
    { name: string; id: number; distance: number }[]
  >([]);
  const [matchInfo, setMatchInfo] = useState<{
    [key: string]: { home: number; away: number };
  }>();
  const [stadiumSelectVisible, setStadiumSelectVisible] = useState(false);
  const [latitude, setLatitude] = useState(''); // 현재 유저의 위도
  const [longitude, setLongitude] = useState(''); // 현재 유저의 경도
  const [isKeyboardShow, setIsKeyboardShow] = useState(false);
  const [loading, setLoading] = useState(true);
  const [cropperLoading, setCropperLoading] = useState(false);
  const [tempRecord, setTempRecord] = useState<RecordType>(RESET_RECORD);
  const [matches, setMatches] = useState<MatchDataType[]>([]);

  const { uniqueId } = useUserState();
  const { stadiums } = useStadiumsState();
  const { carouselIndexState } = useCarouselIndexState();
  const fontStyle = useFontStyle;

  const formattedToday = dayjs(date).format(DATE_FORMAT);
  const apiFormattedToday = dayjs(date).format(API_DATE_FORMAT);
  const year = dayjs(date).year();

  const initRecord: RecordType = {
    match_id: null,
    user_id: uniqueId,
    date: formattedToday,
    image: null,
    user_note: '',
    stadium_id: undefined,
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
      setTempRecord(records[carouselIndexState]);
    } else {
      setTempRecord(initRecord);
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

  const getImageAction = async (buttonIndex: number) => {
    if (buttonIndex === 1) {
      const result = await launchCamera({
        mediaType: 'photo',
        saveToPhotos: true,
        quality: 1,
      });
      const item = result.assets;
      if (!item || !item[0].uri || !item[0].width || !item[0].height) {
        return;
      }
      try {
        setTempRecord({
          ...tempRecord,
          image: {
            uri: item[0].uri,
            type: item[0].type,
            name: item[0].fileName || 'image.jpg', // 파일 이름을 기본 값으로 설정
          },
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
        quality: 1,
      });
      const item = result.assets;
      if (!item || !item[0].uri || !item[0].width || !item[0].height) {
        return;
      }
      const tempName = [...item[0].uri.split('/').reverse()][0];
      const destinationPath = `${RNFS.DocumentDirectoryPath}/cropped_${
        item[0].fileName ?? tempName
      }`;

      try {
        await RNFS.copyFile(item[0].uri, destinationPath);

        setTempRecord({
          ...tempRecord,
          image: {
            uri: destinationPath,
            type: item[0].type,
            name: item[0].fileName || 'image.jpg', // 파일 이름을 기본 값으로 설정
          },
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
    const {
      user_id,
      image,
      user_note,
      stadium_id,
      date: tempDate,
    } = tempRecord;
    const formData = new FormData();

    // 이미지 파일을 FormData에 추가
    formData.append('userId', user_id);
    formData.append('stadiumId', stadium_id);
    formData.append('date', tempDate);
    formData.append('userNote', user_note);
    formData.append('file', image);
    formData.append(
      'matchId',
      (tempRecord.match_id
        ? tempRecord.match_id
        : matches.find(mat => mat.stadium === stadium_id)?.id) || null,
    );

    if (!image || !user_note || !stadium_id) {
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

    // 기록 수정
    if (isEdit && tempRecord.records_id) {
      try {
        formData.append('recordsId', tempRecord.records_id);
        await API.patch('/record/update', formData);
      } catch (error) {
        Toast.show({
          type: 'error',
          text1: SERVER_ERROR_MSG,
        });
      }
    } else {
      // 기록 생성
      try {
        await API.post('/create-record', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } catch (error) {
        console.error(error);
        Toast.show({
          type: 'error',
          text1: SERVER_ERROR_MSG,
        });
      }
    }

    try {
      const res = await getRecordByDate(tempDate);
      setRecords(res.data);
    } catch (error) {
      console.error(error);
    }

    setTempRecord(RESET_RECORD);
    setIsVisible(false);
  };

  const getTodayMatch = async () => {
    const res = await getMatchByDate(formattedToday);
    setMatches(res.data);

    if (!res.data.length) {
      setTodayStadiums([{ name: '경기가 없어요!', id: NO_MATCH_STADIUM_KEY }]);
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
        setMatchInfo(prev => {
          return {
            ...prev,
            [stadiumName]: {
              home: match.home,
              away: match.away,
            },
          };
        });
        return { name: stadiumName, id: stadiumId };
      });

      setTodayStadiums(tempStadiums);
    }
  };

  // 경기장 셀렉트박스 구현
  const getAllStadiumDistance = () => {
    const start = { lat: Number(latitude), lon: Number(longitude) };
    const stadiumInfoList: { name: string; id: number; distance: number }[] =
      [];

    for (let sta of todayStadiums) {
      if (sta.id === NO_MATCH_STADIUM_KEY) {
        stadiumInfoList.push({
          name: sta.name,
          id: NO_MATCH_STADIUM_KEY,
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
    stadiumObj: { name: string; id: number },
    result: { name: string; id: number; distance: number }[],
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
        id: stadiumObj.id,
        distance: res,
      });
    } else {
      result.push({
        name: targetStadium?.stadium_name || '',
        id: stadiumObj.id,
        distance: res,
      });
    }
  };

  // 현재 유저의 위치
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
                      source={{
                        uri:
                          typeof tempRecord.image === 'string'
                            ? tempRecord.image
                            : (tempRecord.image as TempRecordImageType).uri,
                      }}
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
                    color: tempRecord.stadium_id
                      ? palette.greyColor.gray2
                      : palette.greyColor.gray8,
                  }}>
                  {' @'}
                  {tempRecord.stadium_id
                    ? tempRecord.stadium_id === NO_MATCH_STADIUM_KEY
                      ? '경기가 없어요!'
                      : stadiums.find(
                          sta => sta.stadium_id === tempRecord.stadium_id,
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
            <View style={isKeyboardShow ? styles.keyboardShowTextStyle : {}}>
              <Text style={modalStyles.labelText}>내용</Text>
              <TextInput
                multiline
                maxLength={200}
                value={tempRecord.user_note}
                onChangeText={value => {
                  if ((value.match(/\n/g) ?? '').length > 5) {
                    Alert.alert('줄바꿈은 최대 8줄만 가능해요!');
                  } else {
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
                {tempRecord.user_note.length} / 200
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
                      color: palette.greyColor.white,
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
          selectStadiumId={tempRecord.stadium_id}
          setSelectedStadiumId={value =>
            setTempRecord({ ...tempRecord, stadium_id: value })
          }
          isLoading={loading}
        />
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
});
