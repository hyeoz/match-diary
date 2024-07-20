import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FastImage from 'react-native-fast-image';

import { RootStackListType } from '@/type/default';
import { palette } from '@style/palette';
import { useMyState } from '@stores/default';
import splash_text from '@assets/splash_text.png';
import { getRandomElement } from '@/utils/helper';
import {
  NICKNAME_ADJECTIVE,
  NICKNAME_NOUN,
} from '@/utils/NICKNAME_STATIC_DATA';

function Splash({ navigation }: NativeStackScreenProps<RootStackListType>) {
  const { team } = useMyState();
  const [defaultTeam, setDefaultTeam] = useState(team);

  useEffect(() => {
    const setReplace = async () =>
      new Promise(() =>
        setTimeout(() => {
          navigation.replace('Main');
        }, 3000),
      );
    const getAll = async () => {
      await getMyTeam();
      await getMyNickname();
      await setReplace();
    };
    getAll();
  });

  const getMyTeam = async () => {
    const res = await AsyncStorage.getItem('MY_TEAM');
    if (!res) {
      return;
    }
    setDefaultTeam(res);
  };

  const getMyNickname = async () => {
    const res = await AsyncStorage.getItem('NICKNAME');

    if (!res) {
      const randomAdj = getRandomElement(NICKNAME_ADJECTIVE);
      const randomNoun = getRandomElement(NICKNAME_NOUN);
      await AsyncStorage.setItem('NICKNAME', `${randomAdj} ${randomNoun}`);
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
