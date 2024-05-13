import React, { useEffect } from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import splash_text from '@assets/splash_text.png';
import { RootStackListType } from '@type/types';
import { palette } from '@style/palette';
import { useMyState } from '@stores/default';

function Splash({ navigation }: NativeStackScreenProps<RootStackListType>) {
  const { team } = useMyState();

  useEffect(() => {
    setTimeout(() => {
      navigation.replace('Main');
    }, 2000);
  }, []);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: palette.teamColor[team] ?? palette.teamColor.SSG, // 랜더스 컬러
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
