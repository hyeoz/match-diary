import React, { useEffect } from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import splash from '../assets/splash.png';
import splash_text from '../assets/splash_text.png';
import { RootStackListType } from '../types/types';

// TODO types
function Splash({ navigation }: NativeStackScreenProps<RootStackListType>) {
  useEffect(() => {
    setTimeout(() => {
      navigation.replace('Main');
    }, 2000);
  }, []);

  return (
    <View style={styles.container}>
      <Image source={splash_text} style={styles.logo} alt="SPLASH" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#BF282C', // 랜더스 컬러
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
