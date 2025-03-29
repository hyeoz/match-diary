import React, { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  ListRenderItemInfo,
  Modal,
  RefreshControl,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import dayjs from 'dayjs';
import Toast from 'react-native-toast-message';

import { API } from '@/api';
import TouchableWrapper from '@components/TouchableWrapper';
import SelectStadiumModal from '@/components/SelectStadiumModal';
import Loading from '@/components/Loading';
import { getTeamArrayWithIcon } from '@/utils/helper';
import { DATE_FORMAT, INIT_RECORD } from '@/utils/STATIC_DATA';
import { useUserState } from '@/stores/user';
import { useStadiumsState } from '@/stores/teams';
import { CommunityLogType } from '@/type/community';
import { UserType } from '@/type/user';
import { modalStyles } from '@/style/modal';
import { palette } from '@/style/palette';
import { useFontStyle } from '@/style/hooks';
import { Arrow } from '@assets/svg';
import { RecordType } from '@/type/record';

function Community() {
  const [stadiumSelectVisible, setStadiumSelectVisible] = useState(false);
  const [allItems, setAllItems] = useState<CommunityLogType[]>([]);
  const [page, setPage] = useState(1);
  const [isReached, setIsReached] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);
  const [memo, setMemo] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tempRecord, setTempRecord] = useState<RecordType | null>(INIT_RECORD); // NOTE selected stadium modal 사용 시 데이터 형식을 맞추기위해

  const { uniqueId } = useUserState();
  const { stadiums } = useStadiumsState();
  const fontStyle = useFontStyle;

  useEffect(() => {
    setPage(1);
    setIsReached(false);
    setAllItems([]);
    getCommunityAllItems(1, tempRecord?.stadium_id, false);
  }, [tempRecord]);

  const getCommunityAllItems = useCallback(
    async (
      pageToLoad = page,
      stadium = tempRecord?.stadium_id,
      reached = isReached,
    ) => {
      setLoading(true);

      if (reached || !stadium) {
        setLoading(false);
        return;
      }

      try {
        const res = await API.get(`/community-log?stadiumId=${stadium}`);

        if (!res.data) {
          setIsReached(true);
        } else if (pageToLoad === 1) {
          setAllItems(res.data);
          setPage(prev => prev + 1);
        } else {
          const tempData = [...allItems, ...res.data];
          setAllItems(
            tempData.filter(
              (item, index) =>
                tempData.map(value => value.id).lastIndexOf(item.id) === index,
            ),
          );
          setPage(prev => prev + 1);
        }
      } catch (error) {
        Toast.show({
          text1: '잠시 후 다시 시도해주세요.',
          type: 'error',
        });
      } finally {
        setLoading(false);
      }
    },
    [tempRecord, isReached, allItems, page],
  );

  const onSave = async () => {
    if (!memo.length) {
      Toast.show({
        text1: '게시할 내용을 먼저 작성해주세요!',
        type: 'error',
      });
      return;
    }

    try {
      await API.post('/community-log', {
        userId: uniqueId,
        stadiumId: tempRecord?.stadium_id,
        date: dayjs().format(DATE_FORMAT),
        userPost: memo,
      });

      setMemo('');
      setContentVisible(false);
      await onRefresh();
    } catch (error) {
      Toast.show({
        text1:
          (error as string) ??
          '업로드 과정에서 문제가 발생했어요! 다시 시도해주세요.',
        type: 'error',
      });
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setPage(1);
    setIsReached(false);
    await getCommunityAllItems(1, tempRecord?.stadium_id, false);
    setRefreshing(false);
  }, [getCommunityAllItems, tempRecord]);

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
            style={fontStyle(
              {
                fontWeight: '700',
                fontSize: 18,
              },
              'bold',
            )}>
            커뮤니티
          </Text>

          {tempRecord?.stadium_id ? (
            <TouchableOpacity
              style={{
                backgroundColor: palette.commonColor.greenBg,
                padding: 8,
                borderRadius: 8,
              }}
              onPress={() => {
                setContentVisible(true);
              }}>
              <Text
                style={fontStyle({
                  fontWeight: '600',
                  fontSize: 16,
                  color: 'white',
                })}>
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
              color: tempRecord?.stadium_id
                ? palette.greyColor.gray2
                : palette.greyColor.gray8,
            }}>
            {' @'}
            {tempRecord?.stadium_id
              ? stadiums.find(sta => sta.stadium_id === tempRecord?.stadium_id)
                  ?.stadium_name
              : '경기장을 선택해주세요'}
          </Text>
          <Arrow width={16} height={16} color={palette.greyColor.gray6} />
        </TouchableOpacity>

        {loading && allItems.length === 0 ? (
          <Loading />
        ) : tempRecord?.stadium_id ? (
          allItems.length ? (
            <FlatList
              showsVerticalScrollIndicator={false}
              data={allItems}
              renderItem={item => <CommunityItems {...item} />}
              keyExtractor={item => item.log_id.toString()}
              onEndReached={() => {
                if (isReached) return;
                getCommunityAllItems();
              }}
              onEndReachedThreshold={0.5}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
              style={{
                marginBottom: 120,
              }}
            />
          ) : (
            <Text
              style={fontStyle(
                {
                  textAlign: 'center',
                  color: palette.greyColor.gray8,
                  fontSize: 18,
                  marginTop: 32,
                },
                'bold',
              )}>
              {'아직 글이 없어요TT\n지금 글을 남겨보세요!'}
            </Text>
          )
        ) : (
          <Text
            style={fontStyle(
              {
                textAlign: 'center',
                color: palette.greyColor.gray8,
                fontSize: 18,
                marginTop: 32,
              },
              'bold',
            )}>
            경기장을 먼저 선택해주세요!
          </Text>
        )}
      </View>

      {stadiumSelectVisible ? (
        <SelectStadiumModal
          stadiumInfo={stadiums.map(sta => ({
            name: sta.stadium_name,
            stadium_id: sta.stadium_id,
            distance: 0,
            match_id: 0,
          }))}
          setIsVisible={value => setStadiumSelectVisible(value)}
          tempRecord={tempRecord}
          setTempRecord={setTempRecord}
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
              style={fontStyle(
                {
                  textAlign: 'center',
                  fontWeight: '700',
                  fontSize: 18,
                  color: '#000',
                },
                'bold',
              )}>
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
              placeholder={
                '공유하고 싶은 내용을 작성해주세요!\n수정 및 삭제가 불가하니, 신중히 작성해주세요 ;)'
              }
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
                      color: palette.greyColor.white,
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

const CommunityItems = ({ item }: ListRenderItemInfo<CommunityLogType>) => {
  const fontStyle = useFontStyle;
  const [writer, setWriter] = useState<UserType>();

  useEffect(() => {
    getUserInfo(item.user_id);
  }, [item]);

  const getUserInfo = async (id: string) => {
    const res = await API.post('/user', { userId: id });
    setWriter(res.data[0]);
  };

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
          {item.stadium_id ? (
            getTeamArrayWithIcon(24).find(team => team.key === writer?.team_id)
              ?.icon
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
          <Text style={fontStyle()}>{writer?.nickname}</Text>
          <Text style={fontStyle()}>
            {dayjs(item.date).format(DATE_FORMAT)}
          </Text>
        </View>
      </View>
      <Text style={fontStyle({}, 'light')}>{item.user_post}</Text>
    </View>
  );
};

export default Community;
