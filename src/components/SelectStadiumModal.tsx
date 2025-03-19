import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  FlatList,
  ListRenderItemInfo,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import dayjs from 'dayjs';

import { palette } from '@/style/palette';
import { useFontStyle } from '@/style/hooks';
import { DATE_FORMAT, NO_MATCH_STADIUM_KEY } from '@/utils/STATIC_DATA';
import { getMatchByDate } from '@/api/match';
import { StadiumInfoType } from '@/type/team';
import { RecordType } from '@/type/record';
import Loading from './Loading';

const { width, height } = Dimensions.get('window');

export default function SelectStadiumModal({
  stadiumInfo,
  setIsVisible,
  tempRecord,
  setTempRecord,
  isLoading,
  selectedDate,
  isCommunity = false,
}: {
  stadiumInfo: StadiumInfoType[];
  setIsVisible: (value: boolean) => void;
  tempRecord: RecordType | null;
  setTempRecord: (value: RecordType) => void;
  isLoading: boolean;
  selectedDate?: string;
  isCommunity?: boolean;
}) {
  const [todayStadiums, setTodayStadiums] = useState<number[]>([]);
  const [currentRecord, setCurrentRecord] = useState<RecordType>();
  const [sortedInfo, setSortedInfo] = useState<StadiumInfoType[]>([]);

  const fontStyle = useFontStyle;

  useEffect(() => {
    getTodayStadiums();
  }, []);

  useEffect(() => {
    if (!tempRecord) return;

    if (tempRecord.stadium_id) {
      setCurrentRecord(tempRecord);
    } else if (sortedInfo[0]) {
      setCurrentRecord({
        ...tempRecord,
        stadium_id: sortedInfo[0].stadium_id,
      });
    }
  }, [sortedInfo]);

  useEffect(() => {
    setSortedInfo(
      stadiumInfo
        .filter(sta => todayStadiums.includes(sta.stadium_id))
        .sort((a, b) => a.distance - b.distance),
    );
  }, [todayStadiums]);

  useEffect(() => {
    if (!tempRecord) return;
    setCurrentRecord(tempRecord);
  }, [tempRecord]);

  const getTodayStadiums = async () => {
    const res = await getMatchByDate(dayjs(selectedDate).format(DATE_FORMAT));
    if (res.data.length) {
      setTodayStadiums(res.data.map(dt => dt.stadium));
    } else {
      setTodayStadiums([NO_MATCH_STADIUM_KEY]);
    }
  };

  const onSaveStadium = () => {
    if (!tempRecord) {
      return;
    }
    if (currentRecord) {
      setTempRecord({
        ...tempRecord,
        ...currentRecord,
      });
    } else {
      setTempRecord({
        ...tempRecord,
        stadium_id: NO_MATCH_STADIUM_KEY,
      });
    }
    setIsVisible(false);
  };

  return (
    <TouchableOpacity
      onPress={() => setIsVisible(false)}
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
                isSelected:
                  info.stadium_id === currentRecord?.stadium_id &&
                  info.match_id === currentRecord?.match_id,
                isCommunity,
              }))}
              renderItem={item => (
                <StadiumItem
                  setSelect={value => {
                    if (!currentRecord) return;
                    setCurrentRecord({
                      ...currentRecord,
                      match_id: value.match_id,
                      stadium_id: value.stadium_id,
                    });
                  }}
                  sortedInfo={sortedInfo}
                  {...item}
                />
              )}
            />

            <TouchableOpacity
              onPress={onSaveStadium}
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
  sortedInfo,
  ...props
}: ListRenderItemInfo<
  StadiumInfoType & {
    isSelected: boolean;
    isCommunity: boolean;
  }
> & {
  setSelect: (value: Pick<StadiumInfoType, 'match_id' | 'stadium_id'>) => void;
  sortedInfo: StadiumInfoType[];
}) {
  const { name, stadium_id, distance, isSelected, isCommunity } = props.item;
  const fontStyle = useFontStyle;
  return (
    <TouchableOpacity
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
      }}
      onPress={() =>
        setSelect({
          match_id: props.item.match_id,
          stadium_id: props.item.stadium_id,
        })
      }>
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
          <View
            style={[
              styles.itemTextWrapper,
              {
                backgroundColor: palette.commonColor.green,
              },
            ]}
          />
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
  },
});
