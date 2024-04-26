import { Dimensions, FlatList, Image, ScrollView, Text } from 'react-native';

import TouchableWrapper from '@components/TouchableWrapper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { ImageOrVideo } from 'react-native-image-crop-picker';

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

  console.log(allImages, 'ALL IMAGES');

  return (
    <TouchableWrapper>
      <FlatList
        data={allImages}
        renderItem={item => (
          <Image
            source={{ uri: item.item.sourceURL }}
            width={(width - 24 - 24) / 4}
            height={(width - 24 - 24) / 4}
          />
        )}
      />
    </TouchableWrapper>
  );
}

export default History;
