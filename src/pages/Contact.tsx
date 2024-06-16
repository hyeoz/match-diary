import Clipboard from '@react-native-clipboard/clipboard';
import {
  Animated,
  Dimensions,
  Image,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useEffect, useRef } from 'react';
import Toast from 'react-native-toast-message';

import TouchableWrapper from '@components/TouchableWrapper';
import { palette } from '@/style/palette';
import { useMyState } from '@/stores/default';
import {
  EMAIL_LINK,
  INSTAGRAM_LINK,
  INSTAGRAM_WEB_LINK,
} from '@/utils/STATIC_DATA';
import contact_cat from '@assets/contact_cat_img.webp';
import FastImage from 'react-native-fast-image';

const { width } = Dimensions.get('window');

function Contact() {
  const { team } = useMyState();
  const tooltipY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    tooltipAnimated().start();

    return () => {
      tooltipY.setValue(0);
    };
  }, []);
  const onPressInstagram = async () => {
    Linking.openURL(INSTAGRAM_LINK).catch(() => {
      Linking.openURL(INSTAGRAM_WEB_LINK);
    });
  };
  const onPressEmail = async () => {
    // NOTE 시뮬레이터에서는 메일이 열리지 않을 수 있음
    Linking.openURL(EMAIL_LINK).catch(error => {
      // 열리지 않았을 시 클립보드에 복사 후 토스트 메세지
      Clipboard.setString(EMAIL_LINK.split(':')[1]);
      Toast.show({
        type: 'success',
        text1: '메일 주소가 클립보드에 복사 되었어요.',
        text2: '저희에게 문의 메일을 보내주세요!',
      });
    });
  };

  const tooltipAnimated = () => {
    return Animated.loop(
      Animated.sequence([
        Animated.timing(tooltipY, {
          toValue: -3,
          useNativeDriver: true,
          duration: 600,
        }),
        Animated.timing(tooltipY, {
          toValue: 0,
          useNativeDriver: true,
          duration: 600,
        }),
      ]),
    );
  };
  return (
    <TouchableWrapper>
      <View style={styles.wrapper}>
        <FastImage
          source={contact_cat}
          style={{
            position: 'absolute',
            width: width * 1.2,
            height: width * 1.2,
            top: -width * 0.2,
            left: -width * 0.1,
          }}
        />
      </View>

      <View
        style={{
          borderRadius: 999,
          backgroundColor: palette.teamColor[team],
          width: '150%',
          height: '75%',
          position: 'absolute',
          top: '50%',
          left: '-25%',
        }}
      />
      <View
        style={{
          borderRadius: 0,
          alignItems: 'center',
          marginTop: -32,
          backgroundColor: palette.teamColor[team],
        }}>
        <Animated.View
          style={[
            {
              width: '50%',
            },
            {
              transform: [{ translateY: tooltipY }],
            },
          ]}>
          <View
            style={{
              position: 'absolute',
              top: '80%',
              left: '50%',
              backgroundColor: '#fff',
              width: Math.sqrt(193),
              height: Math.sqrt(193),
              transform: [
                { rotate: '45deg' },
                { translateY: 0 },
                { translateX: -4 },
              ],
            }}
          />
          <View
            style={{
              backgroundColor: '#fff',
              padding: 12,
              borderRadius: 8,
            }}>
            <Text style={styles.tooltipText}>더 많은 소식이 궁금하다면?</Text>
          </View>
        </Animated.View>
        <View></View>
        <TouchableOpacity
          style={[
            styles.buttonBg,
            {
              marginTop: 12,
              marginBottom: 16,
            },
          ]}
          onPress={onPressInstagram}>
          <View style={[styles.buttonWrapper]}>
            <Text
              style={[
                styles.defaultText,
                {
                  color: '#d62976',
                  textAlign: 'center',
                },
              ]}>
              INSTAGRAM
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.buttonBg, { marginBottom: 12 }]}
          onPress={onPressEmail}>
          <View style={[styles.buttonWrapper]}>
            <Text
              style={[
                styles.defaultText,
                {
                  color: 'rgb(71, 149, 225)',
                  textAlign: 'center',
                },
              ]}>
              MAIL
            </Text>
          </View>
        </TouchableOpacity>
        <Animated.View
          style={[
            {
              width: '55%',
            },
            {
              transform: [{ translateY: tooltipY }],
            },
          ]}>
          <View
            style={{
              position: 'absolute',
              top: '0%',
              left: '50%',
              backgroundColor: '#fff',
              width: Math.sqrt(193),
              height: Math.sqrt(193),
              transform: [
                { rotate: '45deg' },
                { translateY: 0 },
                { translateX: -4 },
              ],
            }}
          />
          <View
            style={{
              backgroundColor: '#fff',
              padding: 12,
              borderRadius: 8,
            }}>
            <Text style={styles.tooltipText}>이용에 관한 문의사항은 여기!</Text>
          </View>
        </Animated.View>
      </View>
    </TouchableWrapper>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    height: '55%',
    justifyContent: 'center',
    padding: 16,
    position: 'relative',
  },
  headerText: {
    fontSize: 64,
    fontFamily: 'KBO-Dia-Gothic-bold',
    color: '#fff',
  },
  defaultText: {
    fontSize: 20,
    fontFamily: 'KBO-Dia-Gothic-bold',
    color: '#fff',
  },
  buttonBg: {
    width: '50%',
    padding: 8,
    backgroundColor: 'rgba(195,195,195,0.5)',
    borderRadius: 40,
    shadowColor: '#222',
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
  },
  buttonWrapper: {
    borderRadius: 32,
    width: '100%',
    height: 52,
    padding: 16,
    backgroundColor: '#fff',
    opacity: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.2,
    shadowRadius: 16,
  },
  tooltipText: {
    // fontFamily: 'UhBee Seulvely',
    fontFamily: 'KBO-Dia-Gothic-bold',
    textAlign: 'center',
  },
});

export default Contact;
