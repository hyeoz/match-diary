import React, { useState } from 'react';
import {
  Button,
  Linking,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import FastImage from 'react-native-fast-image';

import SignInGif from '@assets/logo_moving_loop_stop.gif';
import { EMAIL_LINK } from '@/utils/STATIC_DATA';
import Clipboard from '@react-native-clipboard/clipboard';
import Toast from 'react-native-toast-message';

const Tab = createBottomTabNavigator();

export default function SignIn() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: { display: 'none' },
      }}>
      <Tab.Screen
        name="SignIn"
        component={SignInPreview}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Form"
        component={Form}
        options={{ headerShown: false }}
      />
    </Tab.Navigator>
  );
}

function SignInPreview({ ...props }) {
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
  return (
    <View style={SignInStyle.container}>
      <Text style={SignInStyle.mainText}>반가워요!</Text>
      <Text style={SignInStyle.mainText}>직관일기를 시작해볼까요?</Text>
      <FastImage
        source={SignInGif}
        style={{
          width: '65%',
          height: '40%',
        }}
        resizeMode="cover"
      />
      <TouchableOpacity
        onPress={() => props.navigation.navigate('Form')}
        style={[SignInStyle.button, SignInStyle.buttonShadow]}>
        <Text style={SignInStyle.buttonText}>시작하기</Text>
      </TouchableOpacity>
      <Text style={SignInStyle.subText}>
        기기를 변경했다면? 관리자에게 문의해주세요
      </Text>
      <TouchableOpacity onPress={onPressEmail}>
        <Text style={[SignInStyle.subText, { marginTop: 4 }]}>
          match.diary@gmail.com
        </Text>
      </TouchableOpacity>
    </View>
  );
}

function Form({ ...props }) {
  const [teamId, setTeamId] = useState(1);
  const [nickname, setNickname] = useState('');
  const handleSubmit = async () => {
    // TODO createUser 요청 보내기
    // 혹시모를 분기처리 필요 (이미 기기 정보가 있는 경우)
    // Navigate to the main screen
    props.navigation.navigate('Main');
  };

  return (
    <View style={SignInStyle.container}>
      <Text>응원하는 팀과 닉네임을 입력해주세요!</Text>
      {/* TODO 팀 아이디로 select box 만들기 */}
      <TextInput
        value={nickname}
        onChangeText={text => setNickname(text)}
        placeholder="닉네임"
      />
      <Button title="제출" onPress={handleSubmit} />
    </View>
  );
}

const SignInStyle = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D5E2AB',
  },
  button: {
    borderRadius: 28,
    width: 320,
    height: 56,
    backgroundColor: '#fff',
    display: 'flex',
    justifyContent: 'center',
    alignContent: 'center',
  },
  mainText: {
    textAlign: 'center',
    fontSize: 28,
    ...Platform.select({
      android: {
        fontFamily: 'KBO Dia Gothic_bold',
      },
      ios: {
        fontFamily: 'KBO-Dia-Gothic-bold',
      },
    }),
  },
  subText: {
    marginTop: 8,
    color: '#fff',
    textAlign: 'center',
    fontSize: 14,
    ...Platform.select({
      android: {
        fontFamily: 'KBO Dia Gothic_medium',
      },
      ios: {
        fontFamily: 'KBO-Dia-Gothic-medium',
      },
    }),
  },
  buttonText: {
    textAlign: 'center',
    fontSize: 20,
    ...Platform.select({
      android: {
        fontFamily: 'KBO Dia Gothic_bold',
      },
      ios: {
        fontFamily: 'KBO-Dia-Gothic-bold',
      },
    }),
  },
  buttonShadow: {
    ...Platform.select({
      android: {},
      ios: {
        shadowOffset: {
          width: 2,
          height: 2,
        },
        shadowColor: '#666',
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
    }),
  },
});
