import { STADIUM_SHORT_TO_LONG } from '@/utils/STATIC_DATA';
import {
  Dimensions,
  FlatList,
  ListRenderItemInfo,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width, height } = Dimensions.get('window');

export default function SelectStadiumModal({
  stadiums,
  setIsVisible,
  setSelectedStadium,
}: {
  stadiums: string[];
  setIsVisible: (value: boolean) => void;
  setSelectedStadium: (value: string) => void;
}) {
  const stadiumFullNames = stadiums.map(s => ({
    value: STADIUM_SHORT_TO_LONG[s],
    key: s,
  }));

  return (
    <TouchableOpacity
      onPress={() => {
        setIsVisible(false);
      }}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: width,
        height: height,
        backgroundColor: '#00000077',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 3,
      }}>
      <View
        style={{
          backgroundColor: '#fff',
          width: width - 48,

          minHeight: 100,
          display: true ? 'flex' : 'none',
          borderWidth: 1,
          borderRadius: 24,
          padding: 16,
          justifyContent: 'space-between',
        }}>
        <Text>경기장 선택</Text>

        <FlatList
          data={stadiumFullNames}
          renderItem={item => <StadiumItem {...item} />}
        />

        <TouchableOpacity
          onPress={() => setIsVisible(false)}
          style={{
            width: '100%',
            borderWidth: 1,
            padding: 8,
          }}>
          <Text
            style={{
              textAlign: 'center',
            }}>
            선택하기
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

function StadiumItem({
  ...props
}: ListRenderItemInfo<{ value: string; key: string }>) {
  return (
    <TouchableOpacity
      style={{
        flexDirection: 'row',
      }}>
      <Text>{props.item.value}</Text>
    </TouchableOpacity>
  );
}
