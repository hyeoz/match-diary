import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { API } from '@/api';
import { useStadiumsState } from '@/stores/teams';

export const useMigrateLocalToServer = () => {
  const { stadiums } = useStadiumsState();

  const migrateData = async () => {
    try {
      // 1. 모든 날짜 키 가져오기
      const keys = await AsyncStorage.getAllKeys();
      if (!keys || keys.length === 0) return false;

      const datesToMigrate = keys.filter((key: string) => /^\d{4}-\d{2}-\d{2}(\s*\(\d+\))?$/.test(key)); // YYYY-MM-DD 또는 YYYY-MM-DD (1) 형식의 키만 필터링
      if (datesToMigrate.length === 0) return false;

      // 2. 각 날짜별 데이터 마이그레이션
      for (const date of datesToMigrate) {
        const recordData = await AsyncStorage.getItem(date);
        if (!recordData) continue;

        const { image, memo, selectedStadium, home, away } = JSON.parse(recordData);
        if (!image) continue; // 이미지가 없으면 스킵

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
        const stadium = stadiums.find(s => s.stadium_short_name === selectedStadium);
        formData.append('stadium', stadium?.stadium_id?.toString() || '');
        formData.append('date', date);
        

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
      throw error;
    }
  };

  return { migrateData };
};
