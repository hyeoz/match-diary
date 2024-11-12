import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Linking,
  ListRenderItemInfo,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import Carousel from 'react-native-reanimated-carousel';
import FastImage from 'react-native-fast-image';
import Clipboard from '@react-native-clipboard/clipboard';
import 'react-native-gesture-handler';

import TouchableWrapper from '@components/TouchableWrapper';
import {
  EMAIL_LINK,
  INSTAGRAM_LINK,
  INSTAGRAM_WEB_LINK,
  MY_TEAM_KEY,
} from '@utils/STATIC_DATA';
import { useMyState } from '@/stores/default';
import { palette } from '@style/palette';
import { MoreListItemType, TeamListItemType } from '@/type/default';
import { Arrow, Plus } from '@assets/svg';
import help1_animated from '@assets/help1_animated.gif';
import help2_animated from '@assets/help2_animated.gif';
import help3_animated from '@assets/help3_animated.gif';
import contact_cat from '@assets/contact_cat_img.webp';
import { getTeamArrayWithIcon } from '@/utils/helper';

const { width, height } = Dimensions.get('window');
const images = [help1_animated, help2_animated, help3_animated];

function More() {
  const { team, setTeam, setNickname } = useMyState();
  const [teamModalVisible, setTeamModalVisible] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [currentNickname, setCurrentNickname] = useState('');
  const [helpModalVisible, setHelpModalVisible] = useState(false);
  const [helpSnapIndex, setHelpSnapIndex] = useState(0);
  const [contactVisible, setContactVisible] = useState(false);

  const tooltipY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    getMyInfo();
  }, []);

  useEffect(() => {
    if (!teamModalVisible) {
      setSelectedTeam('');
    } else {
      getMyInfo();
    }
  }, [teamModalVisible]);

  useEffect(() => {
    setHelpSnapIndex(0);
  }, [helpModalVisible]);

  const moreItems: MoreListItemType[] = [
    {
      key: 'MyTeam',
      label: '내 정보 수정',
      onPressAction: () => setTeamModalVisible(!teamModalVisible),
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
                  const _team = await AsyncStorage.getItem(MY_TEAM_KEY);
                  await AsyncStorage.clear();
                  if (_team) {
                    await AsyncStorage.setItem(MY_TEAM_KEY, _team);
                  }
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
      key: 'Setting',
      label: '앱 설정',
      onPressAction: () => Linking.openSettings(),
    },
    {
      key: 'Help',
      label: '도움말',
      onPressAction: () => setHelpModalVisible(true),
    },
    {
      key: 'Contact',
      label: 'Contact',
      onPressAction: () => setContactVisible(true),
    },
  ];

  const getMyInfo = async () => {
    // NOTE 닉네임 불러오기
    const _nickname = await AsyncStorage.getItem('NICKNAME');

    if (_nickname) {
      setNickname(_nickname);
      setCurrentNickname(_nickname);
    }

    // NOTE 마이팀 불러오기
    const _team = await AsyncStorage.getItem(MY_TEAM_KEY);

    if (_team) {
      setSelectedTeam(_team);
      setTeam(_team);
    }
  };

  const onPressSave = async () => {
    if (!selectedTeam || !currentNickname) {
      Toast.show({
        type: 'error',
        text1: '아직 입력하지 않은 항목이 있어요!',
        topOffset: 64,
      });
    } else {
      await Promise.all([
        AsyncStorage.setItem(MY_TEAM_KEY, selectedTeam),
        AsyncStorage.setItem('NICKNAME', currentNickname),
      ]);
      setTeam(selectedTeam);
      setNickname(currentNickname);
      Toast.show({
        text1: '내 정보 수정이 완료되었어요!',
        topOffset: 80,
      });
      setTeamModalVisible(false);
    }
  };

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
      <View
        style={{
          height: '45%',
          backgroundColor: palette.teamColor[team],
          justifyContent: 'center',
          padding: 32,
        }}>
        <Text
          style={{
            fontFamily: 'KBO-Dia-Gothic-bold',
            fontSize: 32,
            color: '#fff',
          }}>
          SETTING
        </Text>
      </View>
      <View
        style={{
          marginTop: -32,
          justifyContent: 'center',
          flexDirection: 'row',
        }}>
        <View
          style={{
            backgroundColor: '#fff',
            width: '90%',
            ...Platform.select({
              android: {
                elevation: 3,
              },
              ios: {
                shadowColor: '#000',
                shadowOffset: {
                  width: 0,
                  height: 0,
                },
                shadowOpacity: 0.2,
                shadowRadius: 16,
              },
            }),
          }}>
          <FlatList
            renderItem={props => <ListItem {...props} />}
            data={moreItems}
            keyExtractor={item => item.key}
          />
        </View>
      </View>

      {/* SECTION 내 정보 모달 */}
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
                marginBottom: 8,
              }}>
              <Text
                style={{
                  textAlign: 'center',
                  fontWeight: '700',
                  fontSize: 18,
                  fontFamily: 'KBO-Dia-Gothic-bold',
                }}>
                내 정보 수정
              </Text>
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
                    fontFamily: 'KBO-Dia-Gothic-bold',
                  }}>
                  닉네임 설정
                </Text>
              </View>
              <TextInput
                value={currentNickname}
                maxLength={8}
                onChangeText={value => {
                  setCurrentNickname(value);
                }}
                style={{
                  width: width - 48,
                  height: 40,
                  borderWidth: 1,
                  borderRadius: 4,
                  borderColor: '#888',
                  paddingHorizontal: 10,
                  fontFamily: 'KBO-Dia-Gothic-mediumd',
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
                    fontFamily: 'KBO-Dia-Gothic-bold',
                  }}>
                  마이팀 설정
                </Text>
              </View>
              <FlatList
                data={getTeamArrayWithIcon(48)}
                renderItem={props => (
                  <TeamListItem
                    {...props}
                    isSelected={selectedTeam === props.item.key}
                    setSelectedTeam={setSelectedTeam}
                  />
                )}
                numColumns={4}
                keyExtractor={item => item.key}
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

        {/* NOTE root 위치에 존재하지만, 모달보다 위에 토스트를 띄우기 위해 한 번 더 호출 */}
        <Toast />
      </Modal>

      {/* SECTION 도움말 모달 */}
      <Modal visible={helpModalVisible} animationType="slide">
        <View
          style={{
            width,
            height,
            position: 'absolute',
            backgroundColor: '#C9D8B3',
            paddingTop: 40,
          }}>
          <TouchableOpacity onPress={() => setHelpModalVisible(false)}>
            <Plus
              width={24}
              height={24}
              style={{
                marginHorizontal: 24,
                marginTop: 24,
                marginBottom: -12,
                transform: [
                  {
                    rotate: '45deg',
                  },
                ],
              }}
              color={palette.greyColor.gray6}
            />
          </TouchableOpacity>
          <Carousel
            width={width}
            data={images}
            onSnapToItem={index => setHelpSnapIndex(index)}
            renderItem={({ item }) => {
              return (
                <View
                  style={{
                    flex: 1,
                  }}
                  key={item}>
                  <FastImage
                    source={item}
                    style={{
                      width: '100%',
                      height: '100%',
                    }}
                    resizeMode="contain"
                  />
                </View>
              );
            }}
          />
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              gap: 6,
            }}>
            {images.map((_, index) => (
              <View
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 99,
                  backgroundColor: helpSnapIndex === index ? '#222' : '#ddd',
                }}
                key={index}
              />
            ))}
          </View>
          <View
            style={{
              flex: 1,
              margin: 24,
            }}>
            {/* 설명 영역 */}
            <View
              style={{
                borderRadius: 24,
                width: '100%',
                height: '70%',
                backgroundColor: '#fff',
              }}>
              <HelpContentItem index={helpSnapIndex} />
            </View>
          </View>
        </View>
      </Modal>

      {/* SECTION Contact 모달 */}
      <Modal visible={contactVisible} animationType="slide">
        <TouchableOpacity
          onPress={() => setContactVisible(false)}
          style={{
            position: 'absolute',
            zIndex: 9,
            top: 32,
          }}>
          <Plus
            width={24}
            height={24}
            style={{
              marginHorizontal: 24,
              marginTop: 24,
              marginBottom: -12,
              transform: [
                {
                  rotate: '45deg',
                },
              ],
            }}
            color={palette.greyColor.gray6}
          />
        </TouchableOpacity>
        <View style={styles.wrapper}>
          <FastImage
            source={contact_cat}
            style={{
              position: 'absolute',
              width: width * 1.2,
              height: width * 1.2,
              top: -width * 0.1,
              left: -width * 0.1,
            }}
          />
        </View>
        {/* SECTION CONTACT 모달 */}
        <View
          style={{
            borderRadius: 0,
            alignItems: 'center',
            marginTop: -36,
            backgroundColor: palette.commonColor.greenBg,
            height: '100%',
            paddingTop: '20%',
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
            <View style={styles.contactChevron} />
            <View
              style={{
                backgroundColor: '#fff',
                padding: 12,
                borderRadius: 8,
              }}>
              <Text style={styles.tooltipText}>더 많은 소식이 궁금하다면?</Text>
            </View>
          </Animated.View>
          <View />
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
              <Text style={styles.tooltipText}>
                이용에 관한 문의사항은 여기!
              </Text>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </TouchableWrapper>
  );
}

function ListItem({ item, index }: ListRenderItemInfo<MoreListItemType>) {
  return (
    <View
      style={{
        borderBottomWidth: index === 4 ? 0 : 1,
        borderColor: '#ddd',
        margin: 16,
        marginTop: 24,
        marginBottom: 0,
      }}>
      <TouchableOpacity
        onPress={item.onPressAction}
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
        }}>
        <Text
          style={{
            opacity: 1,
            fontFamily: 'KBO-Dia-Gothic-bold',
            fontSize: 16,
          }}>
          {item.label}
        </Text>
        <Arrow color={'#222'} />
      </TouchableOpacity>
    </View>
  );
}
// 팀 선택 모달 아이템
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
        styles.teamItem,
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
// 도움말 리스트 아이템
function HelpContentItem({ index }: { index: number }) {
  switch (index) {
    case 0:
      return (
        <View style={styles.contentWrapper}>
          <Text style={styles.contentMainText}>
            오늘의 직관 기록을 쉽게 기록해요!
          </Text>
          <View style={styles.contentRow}>
            <Text>{'\u2022'}</Text>
            <Text style={styles.contentText}>
              경기장을 선택하고, 사진과 간단한 메모를 추가할 수 있어요.
            </Text>
          </View>
          <View style={styles.contentRow}>
            <Text>{'\u2022'}</Text>
            <Text style={styles.contentText}>
              혹시 경기장 근처에 계시다면, 푸쉬 알림을 보내드릴게요!
            </Text>
          </View>
          <View style={styles.contentRow}>
            <Text>{'\u2022'}</Text>
            <Text style={styles.contentText}>
              (백그라운드 위치 정보 사용 동의가 필요합니다.)
            </Text>
          </View>
        </View>
      );
    case 1:
      return (
        <View style={styles.contentWrapper}>
          <Text style={styles.contentMainText}>
            내 직관 일기를 확인, 공유할 수 있어요
          </Text>
          <View style={styles.contentRow}>
            <Text>{'\u2022'}</Text>
            <Text style={styles.contentText}>
              캘린더 화면에서 내가 작성한 직관일기는 물론, 직관 기록을 확인할 수
              있어요.
            </Text>
          </View>
          <View style={styles.contentRow}>
            <Text>{'\u2022'}</Text>
            <Text style={styles.contentText}>
              기록이 없는 날은 그 날의 경기 일정도 확인 가능해요!
            </Text>
          </View>
          <View style={styles.contentRow}>
            <Text>{'\u2022'}</Text>
            <Text style={styles.contentText}>
              지금까지의 모든 직관일기를 한 눈에 볼 수 있어요.
            </Text>
          </View>
        </View>
      );
    default:
      return (
        <View style={styles.contentWrapper}>
          <Text style={styles.contentMainText}>
            내가 응원하는 팀을 설정해요.
          </Text>
          <View style={styles.contentRow}>
            <Text>{'\u2022'}</Text>
            <Text style={styles.contentText}>
              응원 팀의 색으로 테마 컬러를 바꿀 수 있어요!
            </Text>
          </View>
          <View style={styles.contentRow}>
            <Text>{'\u2022'}</Text>
            <Text style={styles.contentText}>
              저장된 응원 팀 기준으로 직관 기록을 계산하고, 일정을 보여드릴게요.
            </Text>
          </View>
        </View>
      );
  }
}

const styles = StyleSheet.create({
  contentWrapper: {
    padding: 24,
    gap: 8,
    justifyContent: 'center',
  },
  contentRow: { flexDirection: 'row', gap: 6 },
  contentText: {
    fontFamily: 'KBO-Dia-Gothic-light',
    fontSize: 16,
    lineHeight: 21,
  },
  contentMainText: {
    fontFamily: 'KBO-Dia-Gothic-medium',
    fontSize: 18,
    marginBottom: 16,
  },

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

  teamItem: {
    width: (width - 60 - 24) / 4,
    aspectRatio: 1 / 1,
    borderWidth: 1,
    borderColor: palette.greyColor.border,
    borderRadius: 6,
    marginBottom: 12,
    marginRight: 12,
    padding: 8,
  },

  contactChevron: {
    position: 'absolute',
    top: '80%',
    left: '50%',
    backgroundColor: '#fff',
    width: Math.sqrt(193),
    height: Math.sqrt(193),
    transform: [{ rotate: '45deg' }, { translateY: 0 }, { translateX: -4 }],
  },
});

export default More;
