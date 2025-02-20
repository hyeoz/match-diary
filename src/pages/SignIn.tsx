import React, { useState } from 'react';
import { Button, Text, TextInput, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

const Tab = createBottomTabNavigator();

export default function SignIn() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="SignIn" component={SignInPreview} />
      <Tab.Screen name="Form" component={Form} />
    </Tab.Navigator>
  );
}

function SignInPreview({ ...props }) {
  return (
    <View>
      <Text>시작하기</Text>
      {/* TODO GIF */}
      <Button
        title="시작하기"
        onPress={() => props.navigation.navigate('Form')}
      />
      {/* TODO 혹시 기기를 바꾼 경우 관리자에게 문의하라는 버튼 및 모달 추가 */}
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
    <View>
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
