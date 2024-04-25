import { useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
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

import Stamp from '../assets/svg/stamp.svg';
import { DATE_FORMAT, IMAGE_HEIGHT, IMAGE_WIDTH } from '../utils/STATIC_DATA';
import { hasAndroidPermission } from '../utils/helper';
import { DetailPropsType } from '../types/types';

const { width, height } = Dimensions.get('window');
const formattedToday = dayjs().format(DATE_FORMAT);

export function Detail({
  image,
  setImage,
  memo,
  setMemo,
  setIsEdit,
  setIsVisible,
  isCalendar = false,
}: DetailPropsType & { isCalendar?: boolean }) {
  const shareImageRef = useRef<ViewShot>(null);
  // TODO 마이팀 정보 있을 때 승패
  const [result, setResult] = useState<'W' | 'D' | 'L' | null>(null);

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
              await AsyncStorage.removeItem(formattedToday);
              setImage(null);
              setMemo('');
              setIsEdit(false);
            } catch (e) {
              console.error(e);
            }
          },
        },
      ],
    );
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

    const res = await CameraRoll.saveToCameraRoll(uri);

    Toast.show({
      type: 'success',
      text1: '오늘의 직관일기가 앨범에 저장되었어요. 공유해보세요!',
      topOffset: 60,
    });
  };

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
      <ViewShot
        ref={shareImageRef}
        options={{
          fileName: `${formattedToday}_직관일기`,
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
                  },
                ]
              : [polaroidStyles.photoWrapper, polaroidStyles.photoWrapperShadow]
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
                style={{
                  width: isCalendar ? width * 0.6 - 12 : width * 0.7 - 12,
                  height: isCalendar
                    ? (IMAGE_HEIGHT * (width * 0.6)) / IMAGE_WIDTH - 12
                    : (IMAGE_HEIGHT * (width * 0.7)) / IMAGE_WIDTH - 12,
                  shadowOffset: {
                    width: 2,
                    height: 2,
                  },
                  borderWidth: 2,
                  borderColor: 'transparent',
                  // borderColor: '#000',
                  borderBottomWidth: 0,
                  borderRightWidth: 0,
                  shadowColor: '#000',
                  shadowOpacity: 1,
                  overflow: 'hidden',
                  backgroundColor: 'transparent',
                  position: 'absolute',
                  zIndex: 9,
                  left: -2,
                  top: -2,
                }}
              />
              <Image
                source={{ uri: image?.sourceURL }}
                width={isCalendar ? width * 0.6 - 32 : width * 0.7 - 16}
                height={
                  isCalendar
                    ? (IMAGE_HEIGHT * (width * 0.6)) / IMAGE_WIDTH - 16
                    : (IMAGE_HEIGHT * (width * 0.7)) / IMAGE_WIDTH - 16
                }
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
                      result === 'W' ? 'red' : result === 'L' ? 'blue' : 'gray'
                    }
                    style={{
                      position: 'absolute',
                    }}
                  />
                  <Text
                    style={{
                      textAlign: 'center',
                      fontFamily: 'UhBee Seulvely',
                      color:
                        result === 'W'
                          ? 'red'
                          : result === 'L'
                          ? 'blue'
                          : 'gray',
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
                    }}>
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
                  width: '100%',
                  fontFamily: 'UhBee Seulvely',
                  fontSize: isCalendar ? 10 : 12,
                  marginTop: isCalendar ? 10 : 20,
                }}>
                {'24.04.18 '}
                {'SSG'}
                {' vs '}
                {'KIA'}
                {' @'}
                {'인천SS랜더스필드'}
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
                  marginTop: 6,
                }}
                numberOfLines={isCalendar ? 2 : undefined}>
                {memo}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
        {isCalendar && <View style={[polaroidStyles.shadow]}></View>}
        {isCalendar && <View style={polaroidStyles.effect}></View>}
      </ViewShot>
      <View
        style={
          isCalendar
            ? [
                polaroidStyles.buttonWrapper,
                { marginTop: 8, justifyContent: 'flex-start', width: '90%' },
              ]
            : polaroidStyles.buttonWrapper
        }>
        <TouchableOpacity onPress={onPressShare}>
          <Text style={polaroidStyles.shareText}>공유하기</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onPressDelete}>
          <Text style={polaroidStyles.shareText}>삭제하기</Text>
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
  },
  photoWrapper: {
    width: width * 0.7,
    height: height * 0.47,
    padding: 8,
    backgroundColor: 'rgb(243,243,243)',
  },
  photoWrapperShadow: {
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 16,
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
    width: '90%',
    height: '90%',
    top: 16,
    backgroundColor: '#fff',
    shadowColor: '#777',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 1,
    transform: [{ rotate: '3deg' }],
  },

  buttonWrapper: {
    width: '70%',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  shareText: {
    fontFamily: 'KBO-Dia-Gothic-medium',
  },
});
