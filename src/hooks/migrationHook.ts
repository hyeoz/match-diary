import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

import { API } from '@/api';
import { useStadiumsState } from '@/stores/teams';
import { getMatchByDate } from '@/api/match';
import { MatchDataType } from '@/type/match';
import { useUserState } from '@/stores/user';

export const useMigrateLocalToServer = () => {
  const { stadiums } = useStadiumsState();

  const migrateData = async () => {
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

        const { image, memo, selectedStadium } = JSON.parse(recordData);
        if (!image) continue; // 이미지가 없으면 스킵
        // 해당 날짜의 경기 데이터 조회
        const matchResponse = await getMatchByDate(date);
        const matches = matchResponse.data;
        const newSelectedStadium =
          selectedStadium === '문학' ? '인천' : selectedStadium;
        // stadium 객체에서 stadium_id 찾기
        const foundStadium = stadiums.find(
          s => s.stadium_short_name === newSelectedStadium,
        );
        const stadiumId = foundStadium?.stadium_id;

        // 해당 stadium_id를 가진 경기 찾기
        const matchId = matches.filter(
          (match: MatchDataType) => match.stadium === stadiumId,
        )?.[i]?.id;

        // FormData 생성
        const formData = new FormData();

        // 이미지 경로를 파일로 변환
        const filename = image.split('/').pop() || 'image.jpg';
        const match = /\.([a-zA-Z0-9]+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';

        formData.append('file', {
          uri: Platform.OS === 'ios' ? image.replace('file://', '') : image,
          type,
          name: filename,
        } as any);

        formData.append('userNote', memo);
        // stadium_short_name으로 stadium_id 찾기
        const stadium = stadiums.find(
          s => s.stadium_short_name === newSelectedStadium,
        );
        formData.append('stadiumId', stadium?.stadium_id?.toString() || '');
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
        // 성공적으로 업로드된 데이터는 로컬에서 삭제
        await AsyncStorage.removeItem(date);
      }

      return datesToMigrate.length > 0;
    } catch (error) {
      console.error('Migration failed:', error);
      Toast.show({
        type: 'error',
        text1: '데이터를 마이그레이션 하는 데 실패했어요. 다시 시도해주세요.',
      });
      throw error;
    }
  };

  return { migrateData };
};

export const uploadStorageToServer = async (data: {
  key: string;
  value: string;
}) => {
  const { uniqueId } = useUserState.getState();

  if (!uniqueId) {
    throw new Error('User ID is not available');
  }

  const body = {
    userId: uniqueId,
    storageKey: data.key,
    storageValue: data.value,
  };

  await API.post('create-local-storage', body);
};
