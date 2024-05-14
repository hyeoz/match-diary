import {
  Alert,
  Dimensions,
  Image,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import ImageCropPicker, { ImageOrVideo } from 'react-native-image-crop-picker';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import dayjs from 'dayjs';

import Add from '@assets/svg/add.svg';
import { DATE_FORMAT, IMAGE_HEIGHT, IMAGE_WIDTH } from '@utils/STATIC_DATA';
import { palette } from '@style/palette';
import { hasAndroidPermission } from '@utils/helper';
import { DetailPropsType } from '@type/types';

const { width } = Dimensions.get('window');
const formattedToday = dayjs().format(DATE_FORMAT);

export default function UploadModal({
  image,
  setImage,
  memo,
  setMemo,
  isVisible,
  setIsVisible,
}: DetailPropsType & { isVisible: boolean }) {
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
    if (!image || !memo) {
      Toast.show({
        type: 'error',
        text1: '아직 작성하지 않은 항목이 있어요!',
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
        }),
      );
      setIsVisible(false);
    }
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
            <View>
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

            {/* TODO 경기정보 영역 */}
            <View>
              <Text
                style={{
                  textAlign: 'right',
                  fontFamily: 'UhBee Seulvely',
                  marginTop: 6,
                }}>
                {'2024/04/18'}
                {' @'}
                {'인천SS랜더스필드'}
              </Text>
            </View>

            {/* 텍스트 */}
            <View>
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
            </View>
          </View>

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

      {/* NOTE root 위치에 존재하지만, 모달보다 위에 토스트를 띄우기 위해 한 번 더 호출 */}
      <Toast />
    </Modal>
  );
}

const modalStyles = StyleSheet.create({
  header: {
    borderBottomWidth: 1,
    paddingVertical: 10,
    marginBottom: 24,
  },
  wrapper: {
    flex: 1,
    marginHorizontal: 24,
    marginTop: 80,
    marginBottom: 60,
    backgroundColor: '#fff',
  },
  contentWrapper: {
    // gap: 8,
  },
  input: {
    width: width - 48,
    height: 150,
    borderWidth: 1,
    borderRadius: 4,
    borderColor: '#888',
    paddingHorizontal: 10,
    paddingTop: 10,
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
