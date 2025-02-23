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
import { API } from '@/api';
import { getUniqueId } from 'react-native-device-info';

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
    Linking.openURL(EMAIL_LINK).catch(error => {
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
  const [teamId, setTeamId] = useState<number | undefined>();
  const [nickname, setNickname] = useState('');
  const handleSubmit = async () => {
    const deviceId = await getUniqueId();

    if (!nickname || !teamId || !deviceId) {
      return Toast.show({
        type: 'error',
        text1: '모든 항목을 입력해주세요!',
      });
    }
    // NOTE createUser 요청 보내기
    try {
      await API.post('/user', { userId: deviceId, teamId, nickname });
      props.navigation.navigate('Main');
    } catch (error) {
      // 혹시모를 분기처리 필요 (이미 기기 정보가 있는 경우)
      Toast.show({
        type: 'error',
        text1: '오류가 발생했어요! 잠시 후 다시 시도해주세요.',
      });
    }
  };

  return (
    <View style={SignInStyle.container}>
      <Text style={FormStyle.mainText}>
        응원하는 팀과 닉네임을 입력해주세요!
      </Text>
      <View style={FormStyle.formContent}>
        {/* TODO 팀 아이디로 select box 만들기 */}
        <TeamSelector teamId={teamId} setTeamId={setTeamId} />
        {/* TODO 닉네임 입력창 */}
        <TextInput
          placeholder="닉네임"
          value={nickname}
          onChangeText={setNickname}
          style={[SignInStyle.button, SignInStyle.buttonShadow]}
        />
      </View>
      <TouchableOpacity
        onPress={handleSubmit}
        style={[SignInStyle.button, SignInStyle.buttonShadow]}>
        <Text style={SignInStyle.buttonText}>시작하기</Text>
      </TouchableOpacity>
    </View>
  );
}

function TeamSelector({
  teamId,
  setTeamId,
}: {
  teamId?: number;
  setTeamId: (id: number) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <TouchableOpacity
        onPress={() => setIsOpen(prev => !prev)}
        style={[SignInStyle.button, SignInStyle.buttonShadow]}>
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingHorizontal: 16,
          }}>
          <Text>팀 선택</Text>

          {teamId && <Text>{teamId}</Text>}
        </View>
      </TouchableOpacity>
      {isOpen && (
        <View
          style={{
            position: 'absolute',
            backgroundColor: '#fff',
            width: '100%',
            maxWidth: 320,
            zIndex: 10,
          }}>
          <Text>Team List</Text>
        </View>
      )}
    </>
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

const FormStyle = StyleSheet.create({
  mainText: {
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
  formContent: {
    height: '45%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 16,
  },
});
