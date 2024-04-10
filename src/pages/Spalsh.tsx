import React, {useEffect} from 'react';
import {View, Image, Text, StyleSheet} from 'react-native';
import splash from '../assets/splash.png';
import {NativeStackScreenProps} from '@react-navigation/native-stack';

// TODO types
const Splash = ({navigation}: NativeStackScreenProps<any>) => {
  useEffect(() => {
    setTimeout(() => {
      navigation.replace('MainTab');
    }, 2000);
  }, []);

  return (
    <View style={styles.container}>
      <Image source={splash} style={styles.logo} />
      <Text style={styles.text}>SPLASH</Text>
    </View>
  );
};

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
