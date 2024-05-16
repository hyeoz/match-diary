import React, { useEffect, useState } from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import splash_text from '@assets/splash_text.png';
import { RootStackListType } from '@type/types';
import { palette } from '@style/palette';
import { useMyState } from '@stores/default';
import AsyncStorage from '@react-native-async-storage/async-storage';

function Splash({ navigation }: NativeStackScreenProps<RootStackListType>) {
  const { team } = useMyState();
  const [defaultTeam, setDefaultTeam] = useState(team);

  useEffect(() => {
    getMyTeam();
    setTimeout(() => {
      navigation.replace('Main');
    }, 5000);
  }, []);

  const getMyTeam = async () => {
    const res = await AsyncStorage.getItem('MY_TEAM');
    if (!res) return;
    setDefaultTeam(res);
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: palette.teamColor[defaultTeam], // 랜더스 컬러
        },
      ]}>
      <Image source={splash_text} style={styles.logo} alt="SPLASH" />
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
