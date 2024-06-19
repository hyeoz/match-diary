import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ImageOrVideo } from 'react-native-image-crop-picker';

import TouchableWrapper from '@components/TouchableWrapper';
import { IMAGE_HEIGHT, IMAGE_WIDTH } from '@utils/STATIC_DATA';
import { palette } from '@style/palette';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTabHistory } from '@/stores/default';
import FastImage from 'react-native-fast-image';
import Loading from '@/components/Loading';

/* DONE
  - 본인이 쓴 글 무한스크롤로 보여주는 화면 구현
  - image 만 보여주기
  - 눌렀을 때 액션?
*/

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
      key => key !== 'MY_TEAM',
    );

    if (allImages.length === _keys.length) {
      setLoading(false);
      return;
    }
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
            fontFamily: 'KBO-Dia-Gothic-bold',
          }}>
          내 직관일기 모아보기
        </Text>
      </View>
      <ScrollView
        style={{
          flex: 1,
          paddingHorizontal: 8,
        }}>
        {loading ? (
          <Loading />
        ) : allImages.length ? (
          <FlatList
            data={allImages}
            renderItem={item => (
              <FastImage
                source={{ uri: item.item.sourceURL }}
                style={{
                  margin: 2,
                  width: (width - 16 - 8) / 3,
                  height: (IMAGE_HEIGHT * ((width - 16 - 8) / 3)) / IMAGE_WIDTH,
                }}
              />
            )}
            numColumns={3}
          />
        ) : (
          <View>
            <Text
              style={{
                fontFamily: 'KBO-Dia-Gothic-bold',
                textAlign: 'center',
                color: palette.greyColor.gray8,
                fontSize: 24,
                marginTop: 32,
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
                onPress={() => {
                  navigation.navigate('Main');
                }}>
                <Text
                  style={{
                    fontFamily: 'KBO-Dia-Gothic-bold',
                    color: '#fff',
                    textAlign: 'center',
                    fontSize: 24,
                  }}>
                  지금 기록하러 가기!
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </TouchableWrapper>
  );
}

export default History;
