import {
  Alert,
  FlatList,
  Linking,
  ListRenderItemInfo,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import TouchableWrapper from '../components/TouchableWrapper';
import { palette } from '../style/palette';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';

type MoreListItemType = {
  key: string;
  label: string;
  onPressAction?: () => void;
};

function More() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  const moreItems = [
    {
      key: 'MyTeam',
      label: '마이팀 설정하기',
    },
    {
      key: 'DeleteData',
      label: '데이터 모두 삭제',
      onPressAction: () => {
        Alert.alert(
          '데이터 모두 삭제하기',
          '모든 직관 기록이 사라져요. 계속 진행하시겠어요?',
          [
            {
              text: '돌아가기',
              onPress: () => {},
              style: 'cancel',
            },
            {
              text: '삭제하기',
              onPress: async () => {
                try {
                  await AsyncStorage.clear();
                  Toast.show({
                    type: 'success',
                    text1: '모든 데이터가 정상적으로 삭제되었어요!',
                  });
                } catch (e) {
                  console.error(e);
                }
              },
            },
          ],
        );
      },
    },
    {
      key: 'AlertSetting',
      label: '알림설정',
      onPressAction: () => {
        Linking.openSettings();
      },
    },
  ];

  return (
    <TouchableWrapper>
      <FlatList
        renderItem={props => <ListItem {...props} navigation={navigation} />}
        data={moreItems}
        style={{
          marginTop: 32,
          borderTopWidth: 1,
        }}
        keyExtractor={item => item.key}
      />
    </TouchableWrapper>
  );
}

function ListItem({
  item,
  navigation,
}: ListRenderItemInfo<MoreListItemType> & {
  navigation: NativeStackNavigationProp<any>;
}) {
  return (
    <View
      style={{
        borderBottomWidth: 1,
      }}>
      <TouchableOpacity
        style={{
          paddingHorizontal: 16,
          paddingVertical: 24,
        }}
        onPress={
          item.onPressAction
            ? item.onPressAction
            : () => navigation.navigate(item.key) // TODO stack navigation 확인 필요
        }>
        <Text
          style={{
            opacity: 1,
            fontFamily: 'KBO-Dia-Gothic-bold',
            fontSize: 16,
          }}>
          {item.label}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

export default More;
