import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import dayjs from 'dayjs';

import { useTeamsState } from '@/stores/teams';
import { RecordType } from '@/type/record';
import { MatchDataType } from '@/type/match';

import bubble from '@/assets/bubble.png';

const { width } = Dimensions.get('window');

export default function CameraOverlay({
  tempRecord,
  matches,
  date,
  currentWeather,
}: {
  currentWeather: string;
  matches: MatchDataType[];
  date?: string;
  tempRecord: RecordType | null;
}) {
  const { teams } = useTeamsState();

  const getTeamName = (type: 'home' | 'away') => {
    return teams.find(
      team =>
        team.team_id ===
        matches.find(match => match.stadium === tempRecord?.stadium_id)?.[type],
    )?.team_short_name;
  };

  return (
    <View style={styles.wrapper}>
      <FastImage source={bubble} style={styles.bubbleImage} />
      <View
        style={{
          padding: 8,
        }}>
        <Text style={styles.text}>
          {dayjs(date).format('YYYY년 MM월 DD일')}
        </Text>
        {tempRecord?.stadium_id && (
          <Text style={styles.text}>
            {getTeamName('home')}
            {' VS '}
            {getTeamName('away')}
          </Text>
        )}
        <Text style={styles.text}>오늘의 날씨: {currentWeather}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width,
    position: 'absolute',
    zIndex: 3,
    top: '25%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  bubbleImage: {
    width: 140,
    aspectRatio: 230 / 204,
  },
  text: {
    color: 'white',
    fontFamily: 'NanumMiNiSonGeurSsi',
    textAlign: 'right',
    fontSize: 28,
  },
});
