import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import FastImage from 'react-native-fast-image';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import TouchableWrapper from '@components/TouchableWrapper';
import { IMAGE_HEIGHT, IMAGE_WIDTH } from '@utils/STATIC_DATA';
import { palette } from '@style/palette';
import { useTabHistory } from '@stores/default';
import Loading from '@components/Loading';
import { getAllUserRecords } from '@/api/record';
import { useFontStyle } from '@/style/hooks';
import dayjs from 'dayjs';
import BannerAds from '@/components/ads/BannerAds';

const { width } = Dimensions.get('window');

function History() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  const [allImages, setAllImages] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const { history } = useTabHistory();
  const fontStyle = useFontStyle;

  useEffect(() => {
    getAllItem();
  }, [history]);

  const getAllItem = async () => {
    setLoading(true);
    const res = await getAllUserRecords();

    const images = res.data
      .sort((a, b) => dayjs(b.date).diff(dayjs(a.date)))
      .map(dt => {
        // 티켓 이미지가 있는 경우 티켓 이미지 메인으로
        if (dt.ticket_image) {
          return dt.ticket_image;
        }
        return dt.image;
      })
      .filter(data => data !== null) as string[];

    setLoading(false);
    setAllImages(images);
  };

  return (
    <TouchableWrapper>
      <View
        style={{
          marginTop: 20,
          paddingVertical: 10,
          marginBottom: 24,
        }}>
        <BannerAds adsType="history" />
        <Text
          style={[
            fontStyle(
              {
                textAlign: 'center',
                fontWeight: '700',
                fontSize: 18,
              },
              'bold',
            ),
            {
              marginTop: 16,
            },
          ]}>
          내 직관일기 모아보기
        </Text>
      </View>
      <View
        style={{
          flex: 1,
          paddingHorizontal: 8,
          paddingBottom: 64,
        }}>
        {loading ? (
          <Loading />
        ) : allImages.length ? (
          <FlatList
            data={allImages}
            renderItem={({ item }) => {
              return (
                <FastImage
                  source={{ uri: item }}
                  style={{
                    margin: 2,
                    width: (width - 16 - 8) / 3,
                    height:
                      (IMAGE_HEIGHT * ((width - 16 - 8) / 3)) / IMAGE_WIDTH,
                  }}
                />
              );
            }}
            nestedScrollEnabled={true}
            numColumns={3}
          />
        ) : (
          <View>
            <Text
              style={fontStyle(
                {
                  textAlign: 'center',
                  color: palette.greyColor.gray8,
                  fontSize: 24,
                  marginTop: 32,
                },
                'bold',
              )}>
              저장된 직관 일기가 없어요.
            </Text>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
              }}>
              <TouchableOpacity
                style={{
                  backgroundColor: palette.commonColor.greenBg,
                  alignSelf: 'flex-start',
                  padding: 16,
                  borderRadius: 12,
                  marginTop: 24,
                }}
                onPress={() => navigation.navigate('Main')}>
                <Text
                  style={fontStyle(
                    {
                      color: palette.greyColor.white,
                      textAlign: 'center',
                      fontSize: 24,
                    },
                    'bold',
                  )}>
                  지금 기록하러 가기!
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </TouchableWrapper>
  );
}

export default History;
