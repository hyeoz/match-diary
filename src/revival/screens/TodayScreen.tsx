import React from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import dayjs from 'dayjs';

import { PaperCard, Screen } from '../components';
import { teamById } from '../data';
import {
  gameIncludesTeam,
  gameStatusCaption,
  matchupForGame,
} from '../schedule';
import { useRevivalStore } from '../store';
import { localDataService } from '../storage/service';
import { colors, font, handwriting, radius, spacing } from '../theme';

export default function TodayScreen() {
  const navigation = useNavigation<any>();
  const profile = useRevivalStore(state => state.profile);
  const records = useRevivalStore(state => state.records);
  const games = useRevivalStore(state => state.games);
  const team = teamById(profile?.teamId ?? 1);
  const today = dayjs().format('YYYY-MM-DD');
  const weekday = ['일', '월', '화', '수', '목', '금', '토'][dayjs().day()];
  const todayRecords = records.filter(record => record.date === today);
  const latestTodayRecord = todayRecords[todayRecords.length - 1];
  const todayGame = games.find(
    game => game.date === today && gameIncludesTeam(game, team.id),
  );

  return (
    <Screen edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.greetingRow}>
          <View>
            <Text style={styles.eyebrow}>
              {dayjs().format('M월 D일')} {weekday}요일
            </Text>
            <Text style={styles.title}>
              {profile?.nickname || '야구팬'}님의 오늘
            </Text>
          </View>
          <View style={[styles.teamDot, { backgroundColor: team.color }]} />
        </View>

        <PaperCard taped style={styles.matchCard}>
          <Text style={styles.cardLabel}>오늘의 경기</Text>
          <Text style={styles.matchTitle}>
            {todayGame ? matchupForGame(todayGame) : '오늘 등록된 경기 없음'}
          </Text>
          <Text style={styles.matchCaption}>
            {todayGame
              ? gameStatusCaption(todayGame)
              : '일정 캐시에 경기가 추가되면 상대 팀·시간·경기장을 자동으로 보여드려요.'}
          </Text>
        </PaperCard>

        <TouchableOpacity
          accessibilityRole="button"
          onPress={() =>
            latestTodayRecord
              ? navigation.navigate('RecordDetail', {
                  recordId: latestTodayRecord.id,
                })
              : navigation.navigate('RecordEditor', {
                  date: today,
                  gameId: todayGame?.id,
                })
          }
          style={styles.polaroid}>
          <View style={styles.photoPlaceholder}>
            {latestTodayRecord?.photo ? (
              <Image
                source={{
                  uri: localDataService.resolveMediaUri(
                    latestTodayRecord.photo.relativePath,
                  ),
                }}
                style={styles.todayPhoto}
              />
            ) : (
              <>
                <Text style={styles.plus}>＋</Text>
                <Text style={styles.photoHint}>
                  여기를 눌러{'\n'}직관기록을 추가해주세요!
                </Text>
              </>
            )}
          </View>
          <Text style={styles.polaroidDate}>{dayjs().format('YY.MM.DD')}</Text>
          <Text style={styles.polaroidMemo}>
            {todayRecords.length
              ? `오늘 ${todayRecords.length}개의 기록이 있어요.`
              : '오늘 야구장의 기억을 남겨보세요.'}
          </Text>
        </TouchableOpacity>

        <View style={styles.quickRow}>
          <PaperCard style={styles.quickCard}>
            <Text style={styles.quickLabel}>이번 시즌 직관</Text>
            <Text style={styles.quickValue}>{records.length}회</Text>
          </PaperCard>
          <PaperCard style={[styles.quickCard, styles.yellowCard]}>
            <Text style={styles.quickLabel}>방문 경기장</Text>
            <Text style={styles.quickValue}>
              {new Set(records.map(record => record.stadium)).size}곳
            </Text>
          </PaperCard>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  eyebrow: {
    ...font('medium'),
    color: colors.greenDark,
    fontSize: 13,
  },
  title: {
    ...font('bold'),
    marginTop: spacing.xs,
    color: colors.ink,
    fontSize: 24,
  },
  teamDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  matchCard: {
    padding: spacing.lg,
    minHeight: 114,
    justifyContent: 'center',
  },
  cardLabel: {
    ...font('bold'),
    color: colors.ink,
    fontSize: 14,
  },
  matchTitle: {
    ...font('bold'),
    marginTop: spacing.sm,
    color: colors.ink,
    fontSize: 19,
  },
  matchCaption: {
    ...font('light'),
    marginTop: spacing.sm,
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18,
  },
  polaroid: {
    alignSelf: 'center',
    width: '84%',
    minHeight: 390,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.sm,
    backgroundColor: colors.white,
    marginTop: spacing.xxl,
    padding: spacing.lg,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 5,
  },
  photoPlaceholder: {
    height: 270,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: '#FAF8F2',
    overflow: 'hidden',
  },
  todayPhoto: {
    width: '100%',
    height: '100%',
  },
  plus: {
    color: '#9B9993',
    fontSize: 58,
    fontWeight: '200',
  },
  photoHint: {
    ...font('medium'),
    color: '#9B9993',
    textAlign: 'center',
    fontSize: 12,
    lineHeight: 17,
  },
  polaroidDate: {
    ...handwriting,
    marginTop: spacing.md,
    color: colors.ink,
    fontSize: 13,
  },
  polaroidMemo: {
    ...handwriting,
    marginTop: spacing.sm,
    color: colors.ink,
    fontSize: 15,
  },
  quickRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xxl,
  },
  quickCard: {
    flex: 1,
    padding: spacing.lg,
    backgroundColor: colors.paper,
  },
  yellowCard: {
    backgroundColor: colors.yellow,
  },
  quickLabel: {
    ...font('medium'),
    color: colors.muted,
    fontSize: 12,
  },
  quickValue: {
    ...font('bold'),
    marginTop: spacing.sm,
    color: colors.ink,
    fontSize: 22,
  },
});
