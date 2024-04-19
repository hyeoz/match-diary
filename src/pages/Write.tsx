import {
  Alert,
  Dimensions,
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useEffect, useState } from 'react';
import ImageCropPicker, { ImageOrVideo } from 'react-native-image-crop-picker';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import dayjs from 'dayjs';

import TouchableWrapper from '../components/TouchableWrapper';
import { palette } from '../style/palette';
import Add from '../assets/svg/add.svg';
import Stamp from '../assets/svg/stamp.svg';

const { width, height } = Dimensions.get('window');
const formattedToday = dayjs().format('YYYY-MM-DD');

const IMAGE_WIDTH = 1440;
const IMAGE_HEIGHT = 1080;

/* DONE
  - 이미지는 한 장만 업로드 가능
  - 텍스트는 최대 200자
  - 업로드한 컨텐츠는 스토리지 관리
    - 이미지는 어떻게 관리하는지?
    -> crop 후 path 를 return 해주는데, 이 path 를 이용하여 이미지를 보여줌
    - 원본이미지 path 를 사용하는 방식으로 먼저 구현
*/

/* TODO
  - 해당 날짜에 이미 업로드한 경우 업로드버튼 대신 공유용 이미지(폴라로이드) 띄우기
  - 위치정보 불러오기 (푸쉬메세지)
  - 마이페이지에서 마이팀 설정 시 승/패 정보도
  - 당일 날짜로 경기 정보 불러오기
    - 경기정보 들어갈 위치 대략 잡기
  - 업로드 모달에서 생성이 아닌 수정인 경우 공유하기 버튼 생성 (이미지 파일로 내보낼 수 있도록)
*/

function Write() {
  const [isVisible, setIsVisible] = useState(false);
  const [image, setImage] = useState<ImageOrVideo | null>(null);
  const [memo, setMemo] = useState('');
  const [isEdit, setIsEdit] = useState(false);
  const [result, setResult] = useState<'W' | 'D' | 'L' | null>(null);

  useEffect(() => {
    if (!isVisible) {
      setImage(null);
      setMemo('');
    } else {
    }
    checkItem();
  }, [isVisible]);

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

  const checkItem = async () => {
    const res = await AsyncStorage.getItem(formattedToday);

    if (res) {
      console.log(res, 'MEMO??');

      const json = JSON.parse(res);
      setImage(json.image);
      setMemo(json.memo);
      setIsEdit(true);
    }
  };

  const onPressDelete = async () => {
    await AsyncStorage.removeItem('image');
    await AsyncStorage.removeItem('memo');
  };

  return (
    <TouchableWrapper>
      {/* SECTION 메인 버튼 / 폴라로이드 */}
      {!isEdit ? (
        <View style={styles.wrapper}>
          <TouchableOpacity
            onPress={() => setIsVisible(true)}
            style={{
              width: '65%',
              height: '45%',
            }}>
            <View style={styles.addButton}>
              <Add width={60} height={60} color={'#aaa'} />
              <Text style={styles.addText}>
                여기를 눌러{'\n'}직관기록을 추가해주세요!
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={polaroidStyles.wrapper}>
          <View style={polaroidStyles.photoWrapper}>
            <TouchableOpacity
              onPress={() => setIsVisible(true)}
              style={{
                flex: 1,
                // justifyContent: 'space-between',
                alignItems: 'center',
              }}>
              <View
                style={{
                  position: 'relative',
                }}>
                <Image
                  source={{ uri: image?.sourceURL }}
                  width={width * 0.7 - 16}
                  height={(IMAGE_HEIGHT * (width * 0.7)) / IMAGE_WIDTH - 16}
                />
                {!!result && (
                  <View
                    style={{
                      position: 'absolute',
                      bottom: 30,
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
                    fontSize: 12,
                    marginTop: 20,
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
                    fontFamily: 'KBO-Dia-Gothic-light',
                    marginTop: 6,
                  }}>
                  {memo}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
          <View style={polaroidStyles.buttonWrapper}>
            <Text style={polaroidStyles.shareText}>공유하기</Text>
            <TouchableOpacity onPress={onPressDelete}>
              <Text style={polaroidStyles.shareText}>삭제하기</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* SECTION 업로드 모달 */}
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
                        source={{ uri: image.path }} // TODO 현재 불러온 이미지 path 기준으로 보여줌
                        width={width - 48}
                        height={(IMAGE_HEIGHT * (width - 48)) / IMAGE_WIDTH}
                      />
                    </View>
                  </TouchableOpacity>
                ) : (
                  // TODO 클릭 시 native 갤러리 호출
                  <TouchableOpacity onPress={onPressOpenGallery}>
                    <View>
                      <View style={modalStyles.emptyImageWrapper}>
                        <Add width={32} height={32} color={'#888'} />
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
                    if ((value.match(/\n/g) ?? '').length > 7) {
                      Alert.alert('줄바꿈은 최대 8줄만 가능해요!');
                    } else {
                      setMemo(value);
                    }
                  }}
                  placeholder="사진과 함께 기록할 내용을 적어주세요!"
                  style={modalStyles.input}
                  numberOfLines={8}
                />
                <Text
                  style={{
                    textAlign: 'right',
                    color: '#999',
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
                    borderColor: '#c8c8c8',
                  },
                ]}>
                <View>
                  <Text style={modalStyles.buttonText}>Close</Text>
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
                    Save
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* SECTION root 위치에 존재하지만, 모달보다 위에 토스트를 띄우기 위해 한 번 더 호출 */}
        <Toast />
      </Modal>
    </TouchableWrapper>
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
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.2,
    shadowRadius: 16,
  },
  addText: {
    textAlign: 'center',
    fontSize: 14,
    fontFamily: 'KBO-Dia-Gothic-bold', // NOTE font 적용 시 post script 이름으로 적용 필요
    color: '#aaa',
  },
});

const polaroidStyles = StyleSheet.create({
  wrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoWrapper: {
    width: '70%',
    height: '45%',
    padding: 8,
    backgroundColor: '#fff',
    // borderWidth: 1,
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 16,
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
    gap: 16,
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

export default Write;
