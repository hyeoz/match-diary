import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import FastImage from 'react-native-fast-image';
import { getUniqueId } from 'react-native-device-info';

import { API } from '@/api';
import { RootStackListType } from '@/type/default';
import { useUserState } from '@/stores/user';
import { palette } from '@style/palette';
import { useStadiumsState, useTeamsState } from '@/stores/teams';
import { migrateLocalToServer } from '@/hooks/migrationHook';

import splash_text from '@assets/splash_text.png';
import ad_designer from '@assets/ad_designer.png';

function Splash({ navigation }: NativeStackScreenProps<RootStackListType>) {
  const { setTeamId, setUserName, setUniqueId, uniqueId } = useUserState();
  const { setTeams } = useTeamsState();
  const { setStadiums } = useStadiumsState();
  const [defaultTeam, setDefaultTeam] = useState(1);

  useEffect(() => {
    getAllData();
    migrateLocalData(); // TODO 추후 마이그레이션을 위한 코드
  }, []);

  const { stadiums } = useStadiumsState();

  const migrateLocalData = async () => {
    try {
      await migrateLocalToServer(stadiums);
    } catch (error) {
      console.error('Local data migration failed:', error);
    }
  };

  const getAllData = async () => {
    try {
      const deviceId = await getUniqueId();
      setUniqueId(deviceId);

      // 병렬로 데이터 요청하여 속도 개선
      await Promise.all([
        getTeamsData(),
        getStadiumsData(),
        getUserData(deviceId),
      ]);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  // 스플래시 화면 종료 후 이동
  const setReplace = (hasAccount: boolean = false) =>
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
      console.error('Failed to fetch user data:', error);
      // 유저 정보 호출 에러의 경우에도 sign in 으로 넘기기
      await setReplace(false);
    }
  };

  const getTeamsData = async () => {
    try {
      const res = await API.get('/teams');
      if (res.data) {
        setTeams(res.data);
      }
    } catch (error) {
      console.error('Failed to fetch teams data:', error);
    }
  };
  const getStadiumsData = async () => {
    try {
      const res = await API.get('/stadiums');
      if (res.data) {
        setStadiums(res.data);
      }
    } catch (error) {
      console.error('Failed to fetch stadiums data:', error);
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
