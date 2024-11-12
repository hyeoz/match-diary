import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ImageOrVideo } from 'react-native-image-crop-picker';
import { useNavigation } from '@react-navigation/native';
import FastImage from 'react-native-fast-image';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import TouchableWrapper from '@components/TouchableWrapper';
import { IMAGE_HEIGHT, IMAGE_WIDTH } from '@utils/STATIC_DATA';
import { palette } from '@style/palette';
import { useTabHistory } from '@stores/default';
import Loading from '@components/Loading';

const { width } = Dimensions.get('window');

function History() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [allImages, setAllImages] = useState<ImageOrVideo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const { history } = useTabHistory();

  useEffect(() => {
    getAllItem();
  }, [history]);

  const getAllItem = async () => {
    setLoading(true);

    const _keys = (await AsyncStorage.getAllKeys()).filter(
      (key: string) => key !== 'MY_TEAM' && key !== 'NICKNAME',
    );
    // if (allImages.length === _keys.length) {
    //   setLoading(false);
    //   return;
    // }

    const images: ImageOrVideo[] = [];

    for (let i = 0; i < _keys.length; i++) {
      const res = await AsyncStorage.getItem(_keys[i]);

      if (!res) {
        setLoading(false);
        return;
      }
      images.push(JSON.parse(res).image);
    }

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
        <Text
          style={{
            textAlign: 'center',
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
          내 직관일기 모아보기
        </Text>
      </View>
      <View
        style={{
          flex: 1,
          paddingHorizontal: 8,
        }}>
        {loading ? (
          <Loading />
        ) : allImages.length ? (
          <FlatList
            data={allImages}
            renderItem={item => {
              return (
                <FastImage
                  source={{ uri: item.item.path }}
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
              style={{
                textAlign: 'center',
                color: palette.greyColor.gray8,
                fontSize: 24,
                marginTop: 32,
                ...Platform.select({
                  android: {
                    fontFamily: 'KBO Dia Gothic_bold',
                  },
                  ios: {
                    fontFamily: 'KBO-Dia-Gothic-bold',
                  },
                }),
              }}>
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
                  style={{
                    color: '#fff',
                    textAlign: 'center',
                    fontSize: 24,
                    ...Platform.select({
                      android: {
                        fontFamily: 'KBO Dia Gothic_bold',
                      },
                      ios: {
                        fontFamily: 'KBO-Dia-Gothic-bold',
                      },
                    }),
                  }}>
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
