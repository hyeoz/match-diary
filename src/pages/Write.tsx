import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import dayjs from 'dayjs';
import { ImageOrVideo } from 'react-native-image-crop-picker';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import TouchableWrapper from '@components/TouchableWrapper';
import { Detail } from '@components/Detail';
import UploadModal from '@components/UploadModal';
import { DATE_FORMAT } from '@utils/STATIC_DATA';
import { useTabHistory } from '@/stores/default';
import Add from '@assets/svg/add.svg';

const formattedToday = dayjs().format(DATE_FORMAT);

/* DONE
  - 이미지는 한 장만 업로드 가능
  - 텍스트는 최대 200자
  - 업로드한 컨텐츠는 스토리지 관리
    - 이미지는 어떻게 관리하는지?
    -> crop 후 path 를 return 해주는데, 이 path 를 이용하여 이미지를 보여줌
    - 원본이미지 path 를 사용하는 방식으로 먼저 구현
  - 해당 날짜에 이미 업로드한 경우 업로드버튼 대신 공유용 이미지(폴라로이드) 띄우기
  - 업로드 모달에서 생성이 아닌 수정인 경우 공유하기 버튼 생성 (이미지 파일로 내보낼 수 있도록)
  - 마이페이지에서 마이팀 설정 시 승/패 정보도
  - 당일 날짜로 경기 정보 불러오기
*/

function Write() {
  const navigate = useNavigation<NativeStackNavigationProp<any>>();
  const [isVisible, setIsVisible] = useState(false);
  const [image, setImage] = useState<ImageOrVideo | null>(null);
  const [memo, setMemo] = useState('');
  const [selectedStadium, setSelectedStadium] = useState('');
  const [isEdit, setIsEdit] = useState(false);

  const { history } = useTabHistory();

  useEffect(() => {
    if (!isVisible) {
      setImage(null);
      setMemo('');
    }
    checkItem();
  }, [isVisible]);

  useEffect(() => {
    checkItem();
  }, [history]);

  useEffect(() => {
    getMyTeam();
  }, []);

  const getMyTeam = async () => {
    const res = await AsyncStorage.getItem('MY_TEAM');
    if (!res) {
      Alert.alert(
        '아직 마이팀 설정을 하지 않았어요!',
        '지금 설정 페이지로 이동할까요?',
        [
          {
            text: '취소',
            onPress: () => {},
            style: 'cancel',
          },
          {
            text: '이동하기',
            onPress: () => {
              navigate.navigate('MoreTab');
            },
          },
        ],
      );
    }
  };

  const checkItem = async () => {
    const res = await AsyncStorage.getItem(formattedToday);

    if (res) {
      const json = JSON.parse(res);
      setImage(json.image);
      setMemo(json.memo);
      setSelectedStadium(json.selectedStadium);
      setIsEdit(true);
    } else {
      setImage(null);
      setMemo('');
      setSelectedStadium('');
      setIsEdit(false);
    }
  };

  const detailProps = {
    image,
    setImage,
    memo,
    setMemo,
    setIsEdit,
    setIsVisible,
    selectedStadium,
    setSelectedStadium,
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
        <Detail {...detailProps} />
      )}

      {/* SECTION 업로드 모달 */}
      <UploadModal {...detailProps} isVisible={isVisible} />
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

export default Write;
