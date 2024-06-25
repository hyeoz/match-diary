import React, { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  ListRenderItemInfo,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import dayjs from 'dayjs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

import TouchableWrapper from '@components/TouchableWrapper';
import SelectStadiumModal from '@/components/SelectStadiumModal';
import Loading from '@/components/Loading';
import { Arrow } from '@assets/svg';
import { DATE_FORMAT, STADIUM_SHORT_TO_LONG } from '@/utils/STATIC_DATA';
import { palette } from '@/style/palette';
import { CommunityItemType } from '@/type/default';
import { API, StrapiDataType, StrapiType } from '@/api';
import { getTeamArrayWithIcon } from '@/utils/helper';
import { modalStyles } from '@/style/common';
import { useMyState } from '@/stores/default';

function Community() {
  const [stadiumSelectVisible, setStadiumSelectVisible] = useState(false);
  const [selectedStadium, setSelectedStadium] = useState('');
  const [allItems, setAllItems] = useState<StrapiDataType<CommunityItemType>[]>(
    [],
  );
  const [page, setPage] = useState(1);
  const [isReached, setIsReached] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);
  const [memo, setMemo] = useState('');
  const [loading, setLoading] = useState(true);

  const { team } = useMyState();

  useEffect(() => {
    setAllItems([]);
    setPage(1);
    setIsReached(false);
    getCommunityAllItems(1);
  }, [selectedStadium]);

  const getCommunityAllItems = useCallback(
    async (pageToLoad = page) => {
      setLoading(true);

      if (isReached) {
        setLoading(false);
        return;
      }

      const _stadium = Object.keys(STADIUM_SHORT_TO_LONG).find(
        sta => STADIUM_SHORT_TO_LONG[sta] === selectedStadium,
      );

      try {
        const res = await API.get<StrapiType<CommunityItemType>>(
          `/communities?filters[stadium]=${_stadium}&pagination[page]=${pageToLoad}&pagination[pageSize]=10&sort[createdAt]=desc`,
        );

        if (!res.data.data.length) {
          setIsReached(true);
        } else {
          setAllItems([...allItems, ...res.data.data]);
          setPage(prev => prev + 1);
        }
      } catch (error) {
        Toast.show({
          text1: '잠시 후다시 시도해주세요.',
          type: 'error',
        });
      } finally {
        setLoading(false);
      }
    },
    [selectedStadium, isReached, allItems, page],
  );

  const onSave = async () => {
    if (!memo.length) {
      Toast.show({
        text1: '게시할 내용을 먼저 작성해주세요!',
        type: 'error',
      });
      return;
    }

    const _nick = await AsyncStorage.getItem('NICKNAME');

    try {
      await API.post(
        '/communities',
        JSON.stringify({
          data: {
            nickname: _nick,
            team,
            content: memo,
            stadium: Object.keys(STADIUM_SHORT_TO_LONG).find(
              sta => STADIUM_SHORT_TO_LONG[sta] === selectedStadium,
            ),
          },
        }),
      );

      setMemo('');
      setContentVisible(false);
      setPage(1);
      setIsReached(false);
      setAllItems([]);
      getCommunityAllItems(1);
    } catch (error) {
      Toast.show({
        text1:
          (error as string) ??
          '업로드 과정에서 문제가 발생했어요! 다시 시도해주세요.',
        type: 'error',
      });
    }
  };

  return (
    <TouchableWrapper>
      <View
        style={{
          padding: 24,
        }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
          <Text
            style={{
              fontWeight: '700',
              fontSize: 18,
              fontFamily: 'KBO-Dia-Gothic-bold',
            }}>
            커뮤니티
          </Text>

          {selectedStadium.length ? (
            <TouchableOpacity
              style={{
                backgroundColor: palette.commonColor.greenBg,
                padding: 8,
                borderRadius: 8,
              }}
              onPress={() => {
                if (!selectedStadium.length) {
                  return;
                }
                setContentVisible(true);
              }}>
              <Text
                style={{
                  fontWeight: '600',
                  fontSize: 16,
                  fontFamily: 'KBO-Dia-Gothic-medium',
                  color: 'white',
                }}>
                글 올리기
              </Text>
            </TouchableOpacity>
          ) : (
            <></>
          )}
        </View>

        <TouchableOpacity
          style={{
            marginLeft: 4,
            marginTop: 16,
            marginBottom: 16,
            padding: 4,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'flex-end',
          }}
          onPress={() => setStadiumSelectVisible(true)}>
          <Text
            style={{
              fontFamily: 'UhBee Seulvely',
              color: selectedStadium.length ? '#222' : '#888',
            }}>
            {' @'}
            {selectedStadium.length ? selectedStadium : '경기장을 선택해주세요'}
          </Text>
          <Arrow width={16} height={16} color={'#666'} />
        </TouchableOpacity>

        {loading && allItems.length === 0 ? (
          <Loading />
        ) : selectedStadium.length ? (
          allItems.length ? (
            <FlatList
              showsVerticalScrollIndicator={false}
              data={allItems}
              renderItem={item => <CommunityItems {...item} />}
              keyExtractor={item => item.id.toString()}
              onEndReached={() => {
                if (isReached) return;
                getCommunityAllItems();
              }}
              onEndReachedThreshold={0.5}
              style={{
                marginBottom: 120,
              }}
            />
          ) : (
            <Text
              style={{
                fontFamily: 'KBO-Dia-Gothic-bold',
                textAlign: 'center',
                color: palette.greyColor.gray8,
                fontSize: 18,
                marginTop: 32,
              }}>
              {`아직 글이 없어요TT\n지금 글을 남겨보세요!`}
            </Text>
          )
        ) : (
          <Text
            style={{
              fontFamily: 'KBO-Dia-Gothic-bold',
              textAlign: 'center',
              color: palette.greyColor.gray8,
              fontSize: 18,
              marginTop: 32,
            }}>
            경기장을 먼저 선택해주세요!
          </Text>
        )}
      </View>

      {stadiumSelectVisible ? (
        <SelectStadiumModal
          stadiumInfo={Object.values(STADIUM_SHORT_TO_LONG).map(stadium => ({
            name: stadium,
            distance: 0,
          }))}
          setIsVisible={value => setStadiumSelectVisible(value)}
          selectStadium={selectedStadium}
          setSelectedStadium={value => setSelectedStadium(value)}
          isLoading={false}
          isCommunity={true}
        />
      ) : (
        <></>
      )}

      <Modal visible={contentVisible} animationType="slide">
        <View style={modalStyles.wrapper}>
          <View
            style={{
              borderBottomWidth: 1,
              paddingBottom: 10,
            }}>
            <Text
              style={{
                textAlign: 'center',
                fontWeight: '700',
                fontSize: 18,
                fontFamily: 'KBO-Dia-Gothic-bold',
                color: '#000',
              }}>
              업로드
            </Text>
          </View>

          <View
            style={{
              marginTop: 32,
            }}>
            <TextInput
              multiline
              value={memo}
              onChangeText={value => {
                setMemo(value);
              }}
              placeholder={`공유하고 싶은 내용을 작성해주세요!\n수정 및 삭제가 불가하니, 신중히 작성해주세요 ;)`}
              style={modalStyles.input}
            />
          </View>
          <View style={modalStyles.buttonWrapper}>
            <TouchableOpacity
              onPress={() => setContentVisible(false)}
              style={[
                modalStyles.button,
                {
                  borderWidth: 1,
                  borderColor: palette.greyColor.border,
                },
              ]}>
              <View>
                <Text style={modalStyles.buttonText}>취소하기</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onSave}
              style={[
                modalStyles.button,
                {
                  backgroundColor: palette.commonColor.green,
                },
              ]}>
              <View>
                <Text
                  style={[
                    modalStyles.buttonText,
                    {
                      color: '#fff',
                    },
                  ]}>
                  게시하기
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <Toast />
      </Modal>
    </TouchableWrapper>
  );
}

const CommunityItems = ({
  item,
}: ListRenderItemInfo<StrapiDataType<CommunityItemType>>) => {
  return (
    <View
      style={{
        gap: 8,
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        marginBottom: 12,
        paddingHorizontal: 12,
        paddingVertical: 20,
      }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
        }}>
        <View
          style={{
            borderRadius: 99,
            borderColor: palette.greyColor.gray9,
            borderWidth: 1,
            width: 40,
            aspectRatio: 1 / 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          {item.attributes.team ? (
            getTeamArrayWithIcon(24).find(
              team => team.key === item.attributes.team,
            )?.icon
          ) : (
            <Text
              style={{
                fontSize: 20,
              }}>
              ?
            </Text>
          )}
        </View>
        <View>
          <Text
            style={{
              fontFamily: 'KBO-Dia-Gothic-medium',
            }}>
            {item.attributes.nickname}
          </Text>
          <Text
            style={{
              fontFamily: 'KBO-Dia-Gothic-medium',
            }}>
            {dayjs(item.attributes.createdAt).format(DATE_FORMAT)}
          </Text>
        </View>
      </View>
      <Text
        style={{
          fontFamily: 'KBO-Dia-Gothic-light',
        }}>
        {item.attributes.content}
        {/* {item.id} */}
      </Text>
    </View>
  );
};

export default Community;
