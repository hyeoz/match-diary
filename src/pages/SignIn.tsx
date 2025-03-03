import React, { useState } from 'react';
import {
  Dimensions,
  FlatList,
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
import Clipboard from '@react-native-clipboard/clipboard';
import { getUniqueId } from 'react-native-device-info';
import Toast from 'react-native-toast-message';

import TeamListItem from '@/components/TeamListItem';
import { API } from '@/api';
import {
  getRandomNickname,
  getTeamArrayWithIcon,
  renderIconSizeWithColor,
} from '@/utils/helper';
import { EMAIL_LINK, SERVER_ERROR_MSG } from '@/utils/STATIC_DATA';
import { palette } from '@/style/palette';
import { Change } from '@/assets/svg';
import SignInGif from '@assets/logo_moving_loop_stop.gif';

const Tab = createBottomTabNavigator();
const { width } = Dimensions.get('window');

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
  const [teamId, setTeamId] = useState<number>(1);
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
      await API.post('/create-user', {
        userId: deviceId,
        teamId,
        nickname,
      });
      props.navigation.navigate('Main');
    } catch (error) {
      // 혹시모를 분기처리 필요 (이미 기기 정보가 있는 경우)
      Toast.show({
        type: 'error',
        text1: SERVER_ERROR_MSG,
      });
    }
  };

  const onClickRandomNickname = () => {
    const random = getRandomNickname();
    setNickname(random);
  };

  return (
    <View style={SignInStyle.container}>
      <View
        style={{
          flex: 1,
          justifyContent: 'space-between',
          marginTop: 80,
          paddingHorizontal: 24,
        }}>
        <View style={{ gap: 16 }}>
          <View
            style={{
              borderBottomWidth: 1,
              paddingVertical: 10,
              marginBottom: 8,
            }}>
            <Text style={FormStyle.mainText}>
              응원하는 팀과 닉네임을 입력해주세요!
            </Text>
          </View>

          <View style={{ width: '100%' }}>
            <View
              style={{
                paddingVertical: 10,
                marginBottom: 8,
                justifyContent: 'space-between',
                alignItems: 'center',
                flexDirection: 'row',
              }}>
              <Text
                style={{
                  fontWeight: '700',
                  fontSize: 18,
                  ...Platform.select({
                    android: {
                      fontFamily: 'KBO Dia Gothic_bold',
                    },
                    ios: {
                      fontFamily: 'KBO-Dia-Gothic-bold',
                    },
                  }),
                }}>
                닉네임 설정
              </Text>
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  gap: 6,
                  alignItems: 'center',
                }}
                onPress={onClickRandomNickname}>
                {renderIconSizeWithColor(
                  Change,
                  16,
                  16,
                  palette.greyColor.gray3,
                )}
                <Text
                  style={{
                    fontSize: 14,
                    color: palette.greyColor.gray3,

                    ...Platform.select({
                      android: {
                        fontFamily: 'KBO Dia Gothic_medium',
                      },
                      ios: {
                        fontFamily: 'KBO-Dia-Gothic-medium',
                      },
                    }),
                  }}>
                  랜덤 닉네임 생성하기
                </Text>
              </TouchableOpacity>
            </View>
            <TextInput
              value={nickname}
              maxLength={8}
              onChangeText={value => {
                setNickname(value);
              }}
              style={{
                width: width - 48,
                height: 40,
                backgroundColor: '#fff',
                borderRadius: 4,
                paddingHorizontal: 10,
                ...Platform.select({
                  android: {
                    fontFamily: 'KBO Dia Gothic_medium',
                  },
                  ios: {
                    fontFamily: 'KBO-Dia-Gothic-medium',
                  },
                }),
              }}
            />
          </View>

          <View style={{ width: '100%' }}>
            <View
              style={{
                paddingVertical: 10,
                marginBottom: 8,
              }}>
              <Text
                style={{
                  fontWeight: '700',
                  fontSize: 18,
                  ...Platform.select({
                    android: {
                      fontFamily: 'KBO Dia Gothic_bold',
                    },
                    ios: {
                      fontFamily: 'KBO-Dia-Gothic-bold',
                    },
                  }),
                }}>
                마이팀 설정
              </Text>
            </View>
            <FlatList
              data={getTeamArrayWithIcon(48)}
              renderItem={props => (
                <TeamListItem
                  {...props}
                  isSelected={teamId === Number(props.item.key)}
                  setSelectedTeam={setTeamId}
                  isBgWhite
                />
              )}
              numColumns={4}
              keyExtractor={item => item.key.toString()}
            />
          </View>
        </View>
      </View>

      <TouchableOpacity onPress={handleSubmit} style={SignInStyle.button}>
        <Text style={SignInStyle.buttonText}>저장하기</Text>
      </TouchableOpacity>
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
    borderRadius: 8,
    width: width - 48,
    height: 56,
    backgroundColor: palette.commonColor.green,
    display: 'flex',
    justifyContent: 'center',
    alignContent: 'center',
    marginBottom: 80,
  },
  buttonText: {
    textAlign: 'center',
    fontSize: 20,
    color: '#fff',
    ...Platform.select({
      android: {
        fontFamily: 'KBO Dia Gothic_bold',
      },
      ios: {
        fontFamily: 'KBO-Dia-Gothic-bold',
      },
    }),
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
});
