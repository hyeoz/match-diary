import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  FlatList,
  ListRenderItemInfo,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { palette } from '@/style/palette';
import Loading from './Loading';
import { useFontStyle } from '@/style/hooks';
import { NO_MATCH_STADIUM_KEY } from '@/utils/STATIC_DATA';

const { width, height } = Dimensions.get('window');

export default function SelectStadiumModal({
  stadiumInfo,
  setIsVisible,
  selectStadiumId,
  setSelectedStadiumId,
  isLoading,
  isCommunity = false,
}: {
  stadiumInfo: { name: string; id: number; distance: number }[];
  setIsVisible: (value: boolean) => void;
  selectStadiumId?: number;
  setSelectedStadiumId: (value: number) => void;
  isLoading: boolean;
  isCommunity?: boolean;
}) {
  const [currentStadiumId, setCurrentStadiumId] = useState<number>();
  const sortedInfo = stadiumInfo.sort((a, b) => a.distance - b.distance);
  const fontStyle = useFontStyle;

  console.log(sortedInfo);

  useEffect(() => {
    if (selectStadiumId) {
      setCurrentStadiumId(selectStadiumId);
    } else if (sortedInfo[0]) {
      setCurrentStadiumId(sortedInfo[0].id);
    }
  }, [sortedInfo]);

  return (
    <TouchableOpacity
      onPress={() => {
        setIsVisible(false);
      }}
      style={styles.modalWrapper}>
      <View style={styles.modalView}>
        <Text
          style={fontStyle({
            fontSize: 16,
            marginBottom: 16,
          })}>
          경기장 선택
        </Text>
        {isLoading ? (
          <Loading />
        ) : (
          <>
            <FlatList
              data={sortedInfo.map(info => ({
                ...info,
                isSelected: info.id === selectStadiumId,
                isCommunity,
              }))}
              renderItem={item => (
                <StadiumItem
                  setSelect={value => setSelectedStadiumId(value)}
                  {...item}
                />
              )}
            />

            <TouchableOpacity
              onPress={() => {
                if (currentStadiumId) {
                  setSelectedStadiumId(currentStadiumId);
                } else {
                  setSelectedStadiumId(NO_MATCH_STADIUM_KEY);
                }
                setIsVisible(false);
              }}
              style={styles.modalSelectButton}>
              <Text
                style={fontStyle({
                  textAlign: 'center',
                  color: palette.commonColor.green,
                })}>
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
  id: number;
  distance: number;
  isSelected: boolean;
  isCommunity: boolean;
}> & { setSelect: (value: number) => void }) {
  const { name, id, distance, isSelected, isCommunity } = props.item;
  const fontStyle = useFontStyle;

  return (
    <TouchableOpacity
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
      }}
      onPress={() => {
        if (id) {
          setSelect(id);
        }
      }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
        }}>
        {!isSelected ? (
          <View
            style={[
              styles.itemTextWrapper,
              {
                borderWidth: 1,
              },
            ]}
          />
        ) : (
          <View style={styles.itemTextWrapper} />
        )}
        <Text style={fontStyle({ fontSize: 16 })}>{name}</Text>
      </View>
      {!isCommunity && (
        <Text style={fontStyle({ color: '#bbb' })}>
          {distance.toFixed(1)}km
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  modalWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: width,
    height: height,
    backgroundColor: '#00000077',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3,
  },
  modalView: {
    backgroundColor: '#fff',
    width: width - 48,
    minHeight: 100,
    display: true ? 'flex' : 'none',
    borderWidth: 1,
    borderRadius: 24,
    padding: 16,
    justifyContent: 'space-between',
  },
  modalSelectButton: {
    width: '100%',
    borderWidth: 2,
    padding: 8,
    marginTop: 16,
    borderRadius: 99,
    borderColor: palette.commonColor.green,
  },
  itemTextWrapper: {
    width: 16,
    height: 16,
    borderRadius: 99,
    marginRight: 8,
    backgroundColor: palette.commonColor.green,
  },
});
