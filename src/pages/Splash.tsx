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

import splash_text from '@assets/splash_text.png';

function Splash({ navigation }: NativeStackScreenProps<RootStackListType>) {
  const { setTeamId, setUserName, setUniqueId } = useUserState();
  const { setTeams } = useTeamsState();
  const { setStadiums } = useStadiumsState();
  const [defaultTeam, setDefaultTeam] = useState(1);

  useEffect(() => {
    getAllData();
  }, []);

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
