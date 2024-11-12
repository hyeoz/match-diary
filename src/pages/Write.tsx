import React, { useEffect, useState } from 'react';
import {
  Alert,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
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
import { Add } from '@assets/svg';

const formattedToday = dayjs().format(DATE_FORMAT);

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
            <View style={[styles.addButton]}>
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
});

export default Write;
