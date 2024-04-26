import { useEffect, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  Text,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ImageOrVideo } from 'react-native-image-crop-picker';

import TouchableWrapper from '@components/TouchableWrapper';
import { IMAGE_HEIGHT, IMAGE_WIDTH } from '@utils/STATIC_DATA';

/* TODO
  - 본인이 쓴 글 무한스크롤로 보여주는 화면 구현
  - image 만 보여주기
  - 눌렀을 때 액션?
*/

const { width } = Dimensions.get('window');

function History() {
  const [allImages, setAllImages] = useState<ImageOrVideo[]>([]);

  useEffect(() => {
    getAllItem();
  }, []);

  const getAllItem = async () => {
    const _keys = await AsyncStorage.getAllKeys();

    _keys.forEach(async (key: string) => {
      const res = await AsyncStorage.getItem(key);

      if (!res) return;

      const _image = JSON.parse(res).image;

      setAllImages(prev => [...prev, _image]);
    });
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
          // justifyContent: 'center',
          paddingHorizontal: 8,
          // paddingVertical: 40,
        }}>
        <FlatList
          data={allImages}
          renderItem={item => (
            <Image
              source={{ uri: item.item.sourceURL }}
              width={(width - 16 - 8) / 3}
              height={(IMAGE_HEIGHT * ((width - 16 - 8) / 3)) / IMAGE_WIDTH}
              style={{
                margin: 2,
              }}
            />
          )}
          numColumns={3}
        />
      </ScrollView>
    </TouchableWrapper>
  );
}

export default History;
