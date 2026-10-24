import React, { useMemo, useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import dayjs from 'dayjs';
import { useNavigation } from '@react-navigation/native';

import { PaperCard, Screen } from '../components';
import { useRevivalStore } from '../store';
import { localDataService } from '../storage/service';
import { getSeasonStats, getSeasonYears } from '../stats';
import { colors, font, handwriting, spacing } from '../theme';

export default function RecordsScreen() {
  const navigation = useNavigation<any>();
  const records = useRevivalStore(state => state.records);
  const deleteRecord = useRevivalStore(state => state.deleteRecord);
  const years = useMemo(() => getSeasonYears(records), [records]);
  const [year, setYear] = useState(years[0]);
  const summary = useMemo(() => getSeasonStats(records, year), [records, year]);
  const seasonRecords = useMemo(
    () => records.filter(record => dayjs(record.date).year() === year),
    [records, year],
  );

  const confirmDelete = (recordId: string) => {
    Alert.alert('기록 삭제', '이 기록과 앱에 보관된 사진을 삭제할까요?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteRecord(recordId);
          } catch {
            Alert.alert(
              '기록을 삭제하지 못했어요',
              '기존 데이터는 그대로 보존했습니다.',
            );
          }
        },
      },
    ]);
  };

  return (
    <Screen edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>내 직관일기 모아보기</Text>
        <ScrollView
          horizontal
          contentContainerStyle={styles.yearRow}
          showsHorizontalScrollIndicator={false}>
          {years.map(item => (
            <TouchableOpacity
              key={item}
              onPress={() => setYear(item)}
              style={[styles.yearChip, item === year && styles.yearChipActive]}>
              <Text
                style={[
                  styles.yearText,
                  item === year && styles.yearTextActive,
                ]}>
                {item} 시즌
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <PaperCard taped style={styles.summary}>
          <View style={styles.stat}>
            <Text style={styles.statIcon}>🎟</Text>
            <Text style={styles.statLabel}>직관</Text>
            <Text style={styles.statValue}>{summary.total}회</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.stat}>
            <Text style={styles.statIcon}>🏆</Text>
            <Text style={styles.statLabel}>승률</Text>
            <Text style={styles.statValue}>{summary.winRate}%</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.stat}>
            <Text style={styles.statIcon}>🏟</Text>
            <Text style={styles.statLabel}>방문</Text>
            <Text style={styles.statValue}>{summary.stadiums}곳</Text>
          </View>
        </PaperCard>

        <View style={styles.resultSummary}>
          <Text style={styles.resultText}>{summary.wins}승</Text>
          <Text style={styles.resultDot}>·</Text>
          <Text style={styles.resultText}>{summary.losses}패</Text>
          <Text style={styles.resultDot}>·</Text>
          <Text style={styles.resultText}>{summary.draws}무</Text>
          {summary.undecided ? (
            <Text style={styles.pending}> · 미정 {summary.undecided}</Text>
          ) : null}
        </View>

        {seasonRecords.length ? (
          <View style={styles.grid}>
            {[...seasonRecords].reverse().map((record, index) => (
              <TouchableOpacity
                key={record.id}
                accessibilityLabel={`${record.date} 기록 상세 보기`}
                onPress={() =>
                  navigation.getParent()?.navigate('RecordDetail', {
                    recordId: record.id,
                  })
                }
                style={[
                  styles.recordCard,
                  index % 2 ? styles.tiltRight : styles.tiltLeft,
                ]}>
                <PaperCard taped style={styles.cardInner}>
                  <View style={styles.photo}>
                    {record.photo || record.ticket ? (
                      <Image
                        source={{
                          uri: localDataService.resolveMediaUri(
                            (record.photo ?? record.ticket)!.relativePath,
                          ),
                        }}
                        style={styles.photoImage}
                      />
                    ) : (
                      <>
                        <Text style={styles.photoIcon}>⚾</Text>
                        <Text style={styles.photoCaption}>사진 없는 기록</Text>
                      </>
                    )}
                  </View>
                  <Text style={styles.stadium}>{record.stadium}</Text>
                  <Text style={styles.date}>
                    {dayjs(record.date).format('YYYY.MM.DD')} ·{' '}
                    {record.result === 'win'
                      ? '승'
                      : record.result === 'lose'
                      ? '패'
                      : record.result === 'draw'
                      ? '무'
                      : '미정'}
                  </Text>
                  <Text numberOfLines={2} style={styles.memo}>
                    {record.memo || '그날의 직관 기록'}
                  </Text>
                  <TouchableOpacity
                    accessibilityLabel={`${record.date} 기록 삭제`}
                    onPress={() => confirmDelete(record.id)}>
                    <Text style={styles.deleteText}>기록 삭제</Text>
                  </TouchableOpacity>
                </PaperCard>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.empty}>
            <Text style={styles.emptyBall}>⚾</Text>
            <Text style={styles.emptyTitle}>아직 저장된 직관일기가 없어요</Text>
            <Text style={styles.emptyCaption}>
              오늘 또는 캘린더에서 첫 기록을 남겨보세요.
            </Text>
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  title: {
    ...font('bold'),
    color: colors.ink,
    textAlign: 'center',
    fontSize: 21,
  },
  yearRow: {
    gap: spacing.sm,
    paddingVertical: spacing.lg,
  },
  yearChip: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 18,
    backgroundColor: colors.paper,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  yearChipActive: {
    borderColor: colors.green,
    backgroundColor: colors.green,
  },
  yearText: {
    ...font('bold'),
    color: colors.muted,
    fontSize: 11,
  },
  yearTextActive: {
    color: colors.white,
  },
  summary: {
    flexDirection: 'row',
    marginTop: 0,
    paddingVertical: spacing.lg,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 20,
  },
  statLabel: {
    ...font('medium'),
    marginTop: spacing.xs,
    color: colors.muted,
    fontSize: 11,
  },
  statValue: {
    ...font('bold'),
    marginTop: spacing.xs,
    color: colors.ink,
    fontSize: 21,
  },
  divider: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: colors.line,
  },
  resultSummary: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  resultText: {
    ...font('bold'),
    color: colors.ink,
    fontSize: 12,
  },
  resultDot: {
    marginHorizontal: spacing.sm,
    color: colors.muted,
  },
  pending: {
    ...font('medium'),
    color: colors.muted,
    fontSize: 11,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: spacing.xxl,
  },
  recordCard: {
    width: '47%',
    marginBottom: spacing.xl,
  },
  cardInner: {
    padding: spacing.sm,
  },
  tiltLeft: {
    transform: [{ rotate: '-1deg' }],
  },
  tiltRight: {
    transform: [{ rotate: '1deg' }],
  },
  photo: {
    aspectRatio: 1.2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFECE4',
  },
  photoIcon: {
    fontSize: 32,
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  photoCaption: {
    ...font('light'),
    marginTop: spacing.xs,
    color: colors.muted,
    fontSize: 8,
  },
  stadium: {
    ...font('bold'),
    marginTop: spacing.sm,
    color: colors.ink,
    fontSize: 12,
  },
  date: {
    ...font('light'),
    marginTop: spacing.xs,
    color: colors.muted,
    fontSize: 10,
  },
  memo: {
    ...handwriting,
    marginTop: spacing.sm,
    minHeight: 32,
    color: colors.ink,
    fontSize: 12,
    lineHeight: 16,
  },
  deleteText: {
    ...font('medium'),
    marginTop: spacing.sm,
    color: colors.danger,
    textAlign: 'right',
    fontSize: 9,
  },
  empty: {
    alignItems: 'center',
    marginTop: 96,
  },
  emptyBall: {
    fontSize: 46,
  },
  emptyTitle: {
    ...font('bold'),
    marginTop: spacing.lg,
    color: colors.ink,
    fontSize: 17,
  },
  emptyCaption: {
    ...font('light'),
    marginTop: spacing.sm,
    color: colors.muted,
    textAlign: 'center',
    fontSize: 12,
  },
});
