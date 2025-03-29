import AsyncStorage from '@react-native-async-storage/async-storage';

export const generateTestData = async () => {
  // 테스트 데이터 예시
  const testData = [
    {
      date: '2024-09-14',
      data: {
        image:
          'file:///Users/hyewonlee/Library/Developer/CoreSimulator/Devices/8C5DF8AE-613C-4F86-A1AA-C1263A05344A/data/Containers/Data/Application/1E76847E-473F-43F2-8C00-C6C396F03103/tmp/480E047C-8B5A-4DD7-BB9D-35A65540305A.jpg',
        memo: '테스트 메모 1',
        selectedStadium: '문학',
      },
    },
    {
      date: '2024-08-21',
      data: {
        image:
          'file:///Users/hyewonlee/Library/Developer/CoreSimulator/Devices/8C5DF8AE-613C-4F86-A1AA-C1263A05344A/data/Containers/Data/Application/1E76847E-473F-43F2-8C00-C6C396F03103/tmp/480E047C-8B5A-4DD7-BB9D-35A65540305A.jpg',
        memo: '테스트 메모 2',
        selectedStadium: '잠실',
      },
    },
    {
      date: '2024-06-22',
      data: {
        image:
          'file:///Users/hyewonlee/Library/Developer/CoreSimulator/Devices/8C5DF8AE-613C-4F86-A1AA-C1263A05344A/data/Containers/Data/Application/1E76847E-473F-43F2-8C00-C6C396F03103/tmp/480E047C-8B5A-4DD7-BB9D-35A65540305A.jpg',
        memo: '테스트 메모 3',
        selectedStadium: '문학',
      },
    },
    {
      date: '2024-06-14',
      data: {
        image:
          'file:///Users/hyewonlee/Library/Developer/CoreSimulator/Devices/8C5DF8AE-613C-4F86-A1AA-C1263A05344A/data/Containers/Data/Application/1E76847E-473F-43F2-8C00-C6C396F03103/tmp/480E047C-8B5A-4DD7-BB9D-35A65540305A.jpg',
        memo: '테스트 메모 3',
        selectedStadium: '대전',
      },
    },
  ];

  try {
    // 기존 데이터 모두 삭제
    const keys = await AsyncStorage.getAllKeys();
    const dateKeys = keys.filter((key: string) =>
      /^\d{4}-\d{2}-\d{2}(\s*\(\d+\))?$/.test(key),
    );
    if (dateKeys.length > 0) {
      await AsyncStorage.multiRemove(dateKeys);
    }

    // 테스트 데이터 저장
    for (const item of testData) {
      await AsyncStorage.setItem(item.date, JSON.stringify(item.data));
    }

    console.log('Test data generated successfully');
    return true;
  } catch (error) {
    console.error('Failed to generate test data:', error);
    return false;
  }
};

// 현재 저장된 모든 데이터 확인
export const checkCurrentData = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const dateKeys = keys.filter((key: string) =>
      /^\d{4}-\d{2}-\d{2}(\s*\(\d+\))?$/.test(key),
    );

    const data = await Promise.all(
      dateKeys.map(async (key: string) => {
        const value = await AsyncStorage.getItem(key);
        return { [key]: value ? JSON.parse(value) : null };
      }),
    );

    console.log('Current local storage data:', data);
    return data;
  } catch (error) {
    console.error('Failed to check current data:', error);
    return null;
  }
};
