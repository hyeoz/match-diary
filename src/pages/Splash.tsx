import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import FastImage from 'react-native-fast-image';
import { getUniqueId } from 'react-native-device-info';

import { API } from '@/api';
import { RootStackListType } from '@/type/default';
import { useUserState } from '@/stores/user';
import { palette } from '@style/palette';
import splash_text from '@assets/splash_text.png';

function Splash({ navigation }: NativeStackScreenProps<RootStackListType>) {
  const { teamId } = useUserState();
  const [defaultTeam, setDefaultTeam] = useState(teamId);

  useEffect(() => {
    // TODO 스플래시 화면 / 유저 정보 확인 순서 정리하기
    getAll();
  });

  const getAll = async () => {
    const deviceId = await getUniqueId();
    await getUserData(deviceId);
  };

  // 스플래시 화면 종료 후 이동
  const setReplace = async (hasAccount: boolean = false) =>
    new Promise(() =>
      setTimeout(() => {
        hasAccount ? navigation.replace('Main') : navigation.replace('SignIn');
      }, 3000),
    );

  // 기기정보로 서버에서 유저 데이터 불러오기
  const getUserData = async (deviceId: string) => {
    const res = await API.post('/user', { userId: deviceId });
    if (!res.data) {
      // 유저 정보가 없는 경우 가입 화면으로 넘기기
      await setReplace(false);
    } else {
      setDefaultTeam(res.data.teamId);
      await setReplace();
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
