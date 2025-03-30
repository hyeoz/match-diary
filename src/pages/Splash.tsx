import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import FastImage from 'react-native-fast-image';
import { getUniqueId } from 'react-native-device-info';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { API } from '@/api';
import { RootStackListType } from '@/type/default';
import { useUserState } from '@/stores/user';
import { palette } from '@style/palette';
import { useStadiumsState, useTeamsState } from '@/stores/teams';
import {
  useMigrateLocalToServer,
  uploadStorageToServer,
} from '@/hooks/migrationHook';

import splash_text from '@assets/splash_text.png';
import ad_designer from '@assets/ad_designer.png';

function Splash({ navigation }: NativeStackScreenProps<RootStackListType>) {
  const { setTeamId, setUserName, setUniqueId, uniqueId } = useUserState();
  const { setTeams } = useTeamsState();
  const { setStadiums } = useStadiumsState();
  const [defaultTeam, setDefaultTeam] = useState(1);

  const { migrateData } = useMigrateLocalToServer();

  useEffect(() => {
    getAllData();
    uploadTempData();
    migrateLocalData(); // TODO 추후 마이그레이션을 위한 코드
  }, []);

  const uploadTempData = async () => {
    const keys = await AsyncStorage.getAllKeys();

    for (const key of keys) {
      try {
        const value = await AsyncStorage.getItem(key);
        if (!value) continue;
        await uploadStorageToServer({
          key,
          value,
        });
      } catch (error) {
        console.error('Failed to upload storage to server:', error);
      }
    }
  };

  // TODO
  const migrateLocalData = async () => {
    try {
      await migrateData();
    } catch (error) {
      console.error('Local data migration failed:', error);
    }
  };

  const getAllData = async () => {
    const deviceId = await getUniqueId();
    setUniqueId(deviceId);
    await getTeamsData();
    await getStadiumsData();
    await getUserData(deviceId);
  };

  // 스플래시 화면 종료 후 이동
  const setReplace = async (hasAccount: boolean = false) =>
    new Promise(() =>
      setTimeout(() => {
        hasAccount ? navigation.replace('Write') : navigation.replace('SignIn');
      }, 3000),
    );

  // 기기정보로 서버에서 유저 데이터 불러오기
  const getUserData = async (deviceId: string) => {
    try {
      const res = await API.post('/user', { userId: deviceId });

      if (!res.data.length) {
        // 유저 정보가 없는 경우 가입 화면으로 넘기기
        await setReplace(false);
        return;
      }

      setDefaultTeam(res.data[0].team_id);
      setTeamId(res.data[0].team_id);
      setUserName(res.data[0].nickname);

      await setReplace(true);
    } catch (error) {
      console.error(error);
    }
  };

  const getTeamsData = async () => {
    const res = await API.get('/teams');
    if (res.data) {
      setTeams(res.data);
    }
  };
  const getStadiumsData = async () => {
    const res = await API.get('/stadiums');
    if (res.data) {
      setStadiums(res.data);
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: palette.teamColor[defaultTeam], // 랜더스 컬러
        },
      ]}>
      <FastImage source={splash_text} style={styles.logo} />
      <FastImage
        source={ad_designer}
        style={{
          width: '60%',
          height: 100,
          borderRadius: 20,
          marginTop: 16,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 200,
    height: 200,
  },
  text: {
    fontSize: 30,
  },
});

export default Splash;
