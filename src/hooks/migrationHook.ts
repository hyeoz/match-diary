import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { getUniqueId } from 'react-native-device-info';
import RNFS from 'react-native-fs';

import { API } from '@/api';
import { getMatchByDate } from '@/api/match';
import { MatchDataType } from '@/type/match';
import { StadiumType } from '@/type/team';

const EMPTY_IMAGE_BASE64 =
  'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'; // 1x1 투명 GIF

export const migrateLocalToServer = async (stadiums: StadiumType[]) => {
  try {
    const uniqueId = await getUniqueId();

    if (!uniqueId) {
      throw new Error('User ID is not available');
    }

    try {
      // 1. 모든 날짜 키 가져오기
      const keys = await AsyncStorage.getAllKeys();

      if (!keys || keys.length === 0) return false;

      const datesToMigrate = keys.filter((key: string) =>
        /^\d{4}-\d{2}-\d{2}(\s*\(\d+\))?$/.test(key),
      ); // YYYY-MM-DD 또는 YYYY-MM-DD (1) 형식의 키만 필터링
      if (datesToMigrate.length === 0) return false;

      // 2. 각 날짜별 데이터 마이그레이션
      for (let i = 0; i < datesToMigrate.length; i++) {
        const date = datesToMigrate[i];
        const recordData = await AsyncStorage.getItem(date);

        if (!recordData) continue;
        // 서버에서 데이터 확인
        const { data: records } = await API.post('/user-record/date', {
          date,
          userId: uniqueId,
        });

        if (records.length > 0) {
          await AsyncStorage.removeItem(date);
          continue;
        }

        const { image, memo, selectedStadium } = JSON.parse(recordData);

        if (!image || !image.path) continue; // 이미지나 경로가 없으면 스킵
        const fileExists = await RNFS.exists(image.path);

        // 해당 날짜의 경기 데이터 조회
        const matchResponse = await getMatchByDate(date);
        const matches = matchResponse.data;
        // Find stadium by full name first, then try short name
        const foundStadium = stadiums.find(
          s =>
            s.stadium_name === selectedStadium ||
            (selectedStadium === '문학' && s.stadium_short_name === '인천') ||
            s.stadium_short_name === selectedStadium,
        );
        const stadiumId = foundStadium?.stadium_id;

        // 해당 stadium_id를 가진 경기 찾기
        const matchId = matches.filter(
          (match: MatchDataType) => match.stadium === stadiumId,
        )?.[i]?.id;

        // FormData 생성
        const formData = new FormData();

        if (!fileExists) {
          // 임시 빈 파일 생성
          const tempFilePath = `${RNFS.TemporaryDirectoryPath}/empty.jpg`;
          await RNFS.writeFile(tempFilePath, EMPTY_IMAGE_BASE64, 'base64');

          formData.append('file', {
            uri: `file://${tempFilePath}`,
            type: 'image/jpeg',
            name: 'empty.jpg',
          } as any);
        } else {
          // 이미지 경로를 파일로 변환
          const filename =
            image.filename || image.path.split('/').pop() || 'image.jpg';
          const type = image.mime || 'image/jpeg';

          formData.append('file', {
            uri:
              Platform.OS === 'android'
                ? image.path
                : image.path.replace('file://', ''),
            type,
            name: filename,
          } as any);
        }

        formData.append('userId', uniqueId);
        formData.append('userNote', memo);
        // 이미 찾은 stadium 사용
        formData.append(
          'stadiumId',
          foundStadium?.stadium_id?.toString() || '1',
        );
        formData.append('date', date);
        if (matchId) {
          formData.append('matchId', matchId.toString());
        }

        // 서버에 업로드
        await API.post('/create-record', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        // 동일한 날짜와 경기장의 데이터가 있는지 확인
        const recordExists = records.some(
          (record: any) =>
            record.date === date &&
            record.stadium_id === foundStadium?.stadium_id,
        );

        // 데이터가 있으면 로컬 데이터 삭제
        if (recordExists) {
          await AsyncStorage.removeItem(date);
        }
      }

      return datesToMigrate.length > 0;
    } catch (error) {
      console.error('Migration failed:', error);
      Toast.show({
        type: 'error',
        text1:
          '데이터를 마이그레이션 하는 데 실패했어요. 잠시 후 다시 시도해주세요.',
      });
      throw error;
    }
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
};

export const uploadStorageToServer = async (data: {
  key: string;
  value: string;
}) => {
  const uniqueId = await getUniqueId();

  if (!uniqueId) {
    throw new Error('User ID is not available');
  }

  try {
    // 서버에서 전체 데이터 가져오기
    const { data: allStorageData } = await API.get('/local-storage');

    // 날짜 형식의 키값인지 확인 (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data.key)) {
      // 날짜 형식이 아닌 데이터는 키값과 밸류값이 모두 같은지 확인
      const duplicateData = allStorageData.find(
        (item: any) =>
          item.userId === uniqueId &&
          item.storageKey === data.key &&
          item.storageValue === data.value,
      );

      if (duplicateData) {
        // 동일한 데이터가 있으면 업로드 건너뛰기
        return;
      }

      // 중복 데이터가 없는 경우 업로드
      const body = {
        userId: uniqueId,
        storageKey: data.key,
        storageValue: data.value,
      };
      await API.post('/create-local-storage', body);
      return;
    }

    // 날짜 형식의 데이터인 경우 내용 비교
    const localData = JSON.parse(data.value);

    // 동일한 유저의 동일한 날짜와 경기장 데이터 확인
    const duplicateData = allStorageData.find(
      (item: any) =>
        item.userId === uniqueId &&
        item.storageKey === data.key &&
        (() => {
          try {
            const serverData = JSON.parse(item.storageValue);
            return (
              serverData.selectedStadium === localData.selectedStadium &&
              serverData.date === localData.date
            );
          } catch {
            return false;
          }
        })(),
    );

    if (duplicateData) {
      // 동일한 데이터가 있으면 업로드 건너뛰기
      return;
    }

    // 중복 데이터가 없는 경우 업로드
    const body = {
      userId: uniqueId,
      storageKey: data.key,
      storageValue: data.value,
    };
    await API.post('create-local-storage', body);
  } catch (error) {
    console.error('Failed to check or upload storage:', error);
    throw error;
  }
};
