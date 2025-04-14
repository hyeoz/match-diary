import AsyncStorage from '@react-native-async-storage/async-storage';

export const saveMatchData = async () => {
  const storage_key = '2024-07-19';
  const storage_value = {
    image: {
      exif: null,
      filename: 'IMG_6915.PNG',
      path: '/private/var/mobile/Containers/Data/Application/C5CE6061-C49F-483F-94EE-7115141A2CC0/tmp/react-native-image-crop-picker/CEAA9141-4FAA-43BD-BDC5-7427F8764540.jpg',
      height: 1080,
      width: 1080,
      data: null,
      modificationDate: null,
      localIdentifier: '4350C9F3-4AD0-4B8D-8570-9F3993CD7C60/L0/001',
      size: 99637,
      sourceURL:
        'file:///var/mobile/Media/PhotoData/Mutations/DCIM/116APPLE/IMG_6915/Adjustments/FullSizeRender.jpg',
      mime: 'image/jpeg',
      cropRect: {
        width: 1170,
        height: 1170,
        x: 0,
        y: 291,
      },
      duration: null,
      creationDate: '1728916855',
    },
    memo: '클래식시리즈는 절거워\n',
    selectedStadium: '대구삼성라이온즈파크',
    date: '2024-07-19',
  };

  try {
    await AsyncStorage.setItem(storage_key, JSON.stringify(storage_value));
    console.log('데이터가 성공적으로 저장되었습니다.');
  } catch (error) {
    console.error('데이터 저장 중 오류가 발생했습니다:', error);
  }
};
