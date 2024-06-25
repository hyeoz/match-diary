import React, { useCallback, useEffect, useState } from 'react';
import {
  Dimensions,
  FlatList,
  ListRenderItemInfo,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import dayjs from 'dayjs';

import TouchableWrapper from '@components/TouchableWrapper';
import SelectStadiumModal from '@/components/SelectStadiumModal';
import { Arrow } from '@assets/svg';
import { DATE_FORMAT, STADIUM_SHORT_TO_LONG } from '@/utils/STATIC_DATA';
import { palette } from '@/style/palette';
import { CommunityItemType } from '@/type/default';
import { API, StrapiDataType, StrapiType } from '@/api';
import { getTeamArrayWithIcon } from '@/utils/helper';

const { height } = Dimensions.get('window');

function Community() {
  const [stadiumSelectVisible, setStadiumSelectVisible] = useState(false);
  const [selectedStadium, setSelectedStadium] = useState('');
  const [loading, setLoading] = useState(false);
  const [stadiumInfo, setStadiumInfo] = useState<
    { name: string; distance: number }[]
  >(
    Object.values(STADIUM_SHORT_TO_LONG).map(stadium => ({
      name: stadium,
      distance: 0,
    })),
  );
  const [allItems, setAllItems] = useState<StrapiDataType<CommunityItemType>[]>(
    [],
  );
  const [page, setPage] = useState(1);
  const [isReached, setIsReached] = useState(false);

  useEffect(() => {
    setPage(1);
    setIsReached(false);
  }, [selectedStadium]);

  const getCommunityAllItems = useCallback(async () => {
    setLoading(true);
    const _stadium = Object.keys(STADIUM_SHORT_TO_LONG).find(
      sta => STADIUM_SHORT_TO_LONG[sta] === selectedStadium,
    );
    const res = await API.get<StrapiType<CommunityItemType>>(
      `/communities?filters[stadium]=${_stadium}&pagination[page]=${page}&pagination[pageSize]=10`,
    );

    if (!res.data.data.length) {
      setIsReached(true);
      setPage(page - 1);
      setLoading(false);
      return;
    }
    setAllItems(prev => {
      const _data = [...prev, ...res.data.data];
      return _data.filter(
        (data, index) => _data.map(d => d.id).lastIndexOf(data.id) === index,
      );
    });
    setLoading(false);
  }, [selectedStadium, page]);

  useEffect(() => {
    if (isReached) {
      return;
    }
    getCommunityAllItems();
  }, [getCommunityAllItems, isReached, selectedStadium]);

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

        {selectedStadium.length ? (
          allItems.length ? (
            <FlatList
              showsVerticalScrollIndicator={false}
              data={allItems}
              renderItem={item => <CommunityItems {...item} />}
              keyExtractor={item => item.id.toString()}
              onEndReached={() => {
                if (isReached) return;
                setPage(page + 1);
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
          stadiumInfo={stadiumInfo}
          setIsVisible={value => setStadiumSelectVisible(value)}
          selectStadium={selectedStadium}
          setSelectedStadium={value => setSelectedStadium(value)}
          isLoading={false}
          isCommunity={true}
        />
      ) : (
        <></>
      )}
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
        {/* {item.attributes.content} */}
        {item.id}
      </Text>
    </View>
  );
};

export default Community;
