import React from 'react';
import {
  Dimensions,
  ListRenderItemInfo,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import { palette } from '@/style/palette';
import { getTeamArrayWithIcon } from '@/utils/helper';
import { TeamListItemType } from '@/type/default';

const { width } = Dimensions.get('window');

// 팀 선택 모달 아이템
export default function TeamListItem({
  isSelected,
  setSelectedTeam,
  isBgWhite = false,
  ...props
}: ListRenderItemInfo<TeamListItemType> & {
  isSelected: boolean;
  setSelectedTeam: React.Dispatch<React.SetStateAction<number | undefined>>;
  isBgWhite?: boolean;
}) {
  const { item } = props;

  return (
    <TouchableOpacity
      style={[
        styles.teamItem,
        isBgWhite ? { backgroundColor: '#fff' } : {},
        isSelected ? { backgroundColor: palette.commonColor.greenBg } : {},
      ]}
      onPress={() => setSelectedTeam(item.key)}>
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        {getTeamArrayWithIcon().find(team => team.key === item.key)?.icon}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  teamItem: {
    width: (width - 60 - 24) / 4,
    aspectRatio: 1 / 1,
    borderWidth: 1,
    borderColor: palette.greyColor.border,
    borderRadius: 6,
    marginBottom: 12,
    marginRight: 12,
    padding: 8,
  },
});
