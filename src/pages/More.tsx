import { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  Linking,
  ListRenderItemInfo,
  Modal,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';

import TouchableWrapper from '@components/TouchableWrapper';
import { MY_TEAM_KEY, TEAM_ICON_ARRAY } from '@utils/STATIC_DATA';
import { palette } from '@style/palette';
import { useMyState } from '@/stores/default';
import { MoreListItemType, TeamListItemType } from '@/type/types';

const { width, height } = Dimensions.get('window');

function More() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { setTeam } = useMyState();
  const [teamModalVisible, setTeamModalVisible] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState('');

  useEffect(() => {}, []);

  useEffect(() => {
    if (!teamModalVisible) {
      setSelectedTeam('');
    } else {
      getMyTeam();
    }
  }, [teamModalVisible]);

  const moreItems: MoreListItemType[] = [
    {
      key: 'MyTeam',
      label: '마이팀 설정하기',
      onPressAction: () => {
        setTeamModalVisible(!teamModalVisible);
      },
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

  const getMyTeam = async () => {
    const team = await AsyncStorage.getItem(MY_TEAM_KEY);

    team && setSelectedTeam(team);
  };

  const onPressSave = async () => {
    if (!selectedTeam) return;

    const res = await AsyncStorage.setItem(MY_TEAM_KEY, selectedTeam);
    setTeam(selectedTeam);
    Toast.show({
      text1: '마이팀 설정이 완료되었어요!',
      topOffset: 80,
    });
    setTeamModalVisible(false);
  };

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

      <Modal visible={teamModalVisible} animationType="slide">
        <View
          style={{
            flex: 1,
            justifyContent: 'space-between',
            marginTop: 80,
            marginBottom: 60,
            paddingHorizontal: 24,
          }}>
          <View style={{ gap: 16 }}>
            <View
              style={{
                borderBottomWidth: 1,
                paddingVertical: 10,
                marginBottom: 24,
              }}>
              <Text
                style={{
                  textAlign: 'center',
                  fontWeight: '700',
                  fontSize: 18,
                  fontFamily: 'KBO-Dia-Gothic-bold',
                }}>
                마이팀 선택하기
              </Text>
            </View>

            <View style={{ width: '100%' }}>
              <FlatList
                data={TEAM_ICON_ARRAY}
                renderItem={props => (
                  <TeamListItem
                    {...props}
                    isSelected={selectedTeam === props.item.key}
                    setSelectedTeam={setSelectedTeam}
                  />
                )}
                numColumns={3}
              />
            </View>
          </View>

          <View
            style={{
              flexDirection: 'row',
              gap: 16,
              justifyContent: 'space-between',
            }}>
            <TouchableOpacity
              onPress={() => setTeamModalVisible(false)}
              style={{
                flex: 1,
                borderWidth: 1,
                borderColor: palette.greyColor.border,
                borderRadius: 8,
                padding: 16,
              }}>
              <Text
                style={{
                  textAlign: 'center',
                  fontFamily: 'KBO-Dia-Gothic-bold',
                }}>
                취소하기
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onPressSave}
              style={{
                flex: 1,
                backgroundColor: palette.commonColor.green,
                borderRadius: 8,
                padding: 16,
              }}>
              <Text
                style={{
                  textAlign: 'center',
                  fontFamily: 'KBO-Dia-Gothic-bold',
                  color: '#fff',
                }}>
                저장하기
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
        onPress={item.onPressAction}>
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

function TeamListItem({
  isSelected,
  setSelectedTeam,
  ...props
}: ListRenderItemInfo<TeamListItemType> & {
  isSelected: boolean;
  setSelectedTeam: React.Dispatch<React.SetStateAction<string>>;
}) {
  const { item } = props;

  return (
    <TouchableOpacity
      style={[
        {
          width: (width - 48 - 24) / 3,
          aspectRatio: 1 / 1,
          borderWidth: 1,
          borderColor: palette.greyColor.border,
          borderRadius: 6,
          marginBottom: 12,
          marginRight: 12,
          padding: 8,
        },
        isSelected ? { backgroundColor: palette.commonColor.greenBg } : {},
      ]}
      onPress={() => setSelectedTeam(item.key)}>
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        {item.icon}
      </View>
    </TouchableOpacity>
  );
}

export default More;
