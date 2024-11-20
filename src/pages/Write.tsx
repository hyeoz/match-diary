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
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import TouchableWrapper from '@components/TouchableWrapper';
import { Detail } from '@components/Detail';
import UploadModal from '@components/UploadModal';
import { DATE_FORMAT, RESET_RECORD } from '@utils/STATIC_DATA';
import {
  useDuplicatedRecordState,
  useSelectedRecordState,
  useTabHistory,
} from '@/stores/default';
import { RecordType } from '@/type/default';
import { Add } from '@assets/svg';

const formattedToday = dayjs().format(DATE_FORMAT);

function Write() {
  const navigate = useNavigation<NativeStackNavigationProp<any>>();

  const [isVisible, setIsVisible] = useState(false);
  // const [image, setImage] = useState<ImageOrVideo | null>(null);
  // const [memo, setMemo] = useState('');
  // const [selectedStadium, setSelectedStadium] = useState('');
  const [records, setRecords] = useState<RecordType[]>([]); // 같은 날 중복된 기록들 관리
  const [isEdit, setIsEdit] = useState(false);

  const { history } = useTabHistory();
  const { setRecordState } = useSelectedRecordState();
  const { recordsState, setRecordsState } = useDuplicatedRecordState();

  // useEffect(() => {
  //   if (!isVisible) {
  //     setImage(null);
  //     setMemo('');
  //   }
  //   checkItem();
  // }, [isVisible]);

  useEffect(() => {
    checkItem();
  }, [history, isVisible]);

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
    const keys = await AsyncStorage.getAllKeys(); // 모든 키값 찾기
    const filteredKeys = keys.filter(key => key.includes(formattedToday)); // 키에 오늘 날짜가 포함되어있으면 (오늘 날짜의 기록이 있으면)
    if (filteredKeys.length) {
      // 오늘자 기록들 반복
      filteredKeys.forEach(async (key, index) => {
        const res = await AsyncStorage.getItem(key);
        if (!res) {
          return;
        } else {
          const json = JSON.parse(res);
          setRecordState({
            ...json,
            id: new Date(formattedToday).getDate() + index,
          });
          setRecords(prev => [
            ...prev,
            {
              ...json,
              id: new Date(formattedToday).getDate() + index,
            },
          ]);
          setIsEdit(true);
        }
      });
      setRecordsState(records);
    } else {
      setRecordState(RESET_RECORD);
      setIsEdit(false);
    }
  };

  const detailProps = {
    setIsEdit,
    setIsVisible,
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
