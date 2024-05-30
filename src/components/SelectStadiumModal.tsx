import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  FlatList,
  ListRenderItemInfo,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { palette } from '@/style/palette';
import Loading from './Loading';

const { width, height } = Dimensions.get('window');

export default function SelectStadiumModal({
  stadiumInfo,
  setIsVisible,
  selectStadium,
  setSelectedStadium,
  isLoading,
}: {
  stadiumInfo: { name: string; distance: number }[];
  setIsVisible: (value: boolean) => void;
  selectStadium?: string;
  setSelectedStadium: (value: string) => void;
  isLoading: boolean;
}) {
  const [select, setSelect] = useState('');
  const sortedInfo = stadiumInfo.sort((a, b) => a.distance - b.distance);

  useEffect(() => {
    if (selectStadium) {
      setSelect(selectStadium);
    } else if (sortedInfo[0]) {
      setSelect(sortedInfo[0].name);
    }
  }, [sortedInfo]);

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
        <Text
          style={{
            fontFamily: 'KBO-Dia-Gothic-bold',
            fontSize: 16,
            marginBottom: 16,
          }}>
          경기장 선택
        </Text>
        {isLoading ? (
          <Loading />
        ) : (
          <>
            <FlatList
              data={sortedInfo.map(info => ({
                ...info,
                isSelected: info.name === select,
              }))}
              renderItem={item => (
                <StadiumItem setSelect={value => setSelect(value)} {...item} />
              )}
            />

            <TouchableOpacity
              onPress={() => {
                setSelectedStadium(select);
                setIsVisible(false);
              }}
              style={{
                width: '100%',
                borderWidth: 2,
                padding: 8,
                marginTop: 16,
                borderRadius: 99,
                borderColor: palette.commonColor.green,
              }}>
              <Text
                style={{
                  textAlign: 'center',
                  fontFamily: 'KBO-Dia-Gothic-bold',
                  color: palette.commonColor.green,
                }}>
                선택하기
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
}

function StadiumItem({
  setSelect,
  ...props
}: ListRenderItemInfo<{
  name: string;
  distance: number;
  isSelected: boolean;
}> & { setSelect: (value: string) => void }) {
  const { name, distance, isSelected } = props.item;

  return (
    <TouchableOpacity
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
      }}
      onPress={() => setSelect(name)}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
        }}>
        {!isSelected ? (
          <View
            style={{
              width: 16,
              height: 16,
              borderWidth: 1,
              borderRadius: 99,
              marginRight: 8,
              borderColor: '#666',
            }}
          />
        ) : (
          <View
            style={{
              width: 16,
              height: 16,
              borderRadius: 99,
              marginRight: 8,
              backgroundColor: palette.commonColor.green,
            }}
          />
        )}
        <Text
          style={{
            fontSize: 16,
            fontFamily: 'KBO-Dia-Gothic-medium',
          }}>
          {name}
        </Text>
      </View>
      <Text
        style={{
          color: '#bbb',
          fontFamily: 'KBO-Dia-Gothic-medium',
        }}>
        {(distance / 1000).toFixed(1)}km
      </Text>
    </TouchableOpacity>
  );
}
