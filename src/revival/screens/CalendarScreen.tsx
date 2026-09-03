import React, { useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import dayjs, { Dayjs } from 'dayjs';

import { PaperCard, Screen } from '../components';
import { useRevivalStore } from '../store';
import { gameIncludesTeam, matchupForGame } from '../schedule';
import { colors, font, handwriting, spacing } from '../theme';

const weekdays = ['일', '월', '화', '수', '목', '금', '토'];

type CalendarCell = {
  date: Dayjs;
  inMonth: boolean;
};

const buildCells = (month: Dayjs): CalendarCell[] => {
  const first = month.startOf('month');
  const start = first.subtract(first.day(), 'day');
  return Array.from({ length: 42 }, (_, index) => {
    const date = start.add(index, 'day');
    return { date, inMonth: date.month() === month.month() };
  });
};

export default function CalendarScreen() {
  const navigation = useNavigation<any>();
  const records = useRevivalStore(state => state.records);
  const games = useRevivalStore(state => state.games);
  const profile = useRevivalStore(state => state.profile);
  const reminders = useRevivalStore(state => state.reminders);
  const scheduleReminder = useRevivalStore(state => state.scheduleReminder);
  const [month, setMonth] = useState(dayjs().startOf('month'));
  const [selected, setSelected] = useState(dayjs().format('YYYY-MM-DD'));
  const cells = useMemo(() => buildCells(month), [month]);
  const selectedRecords = records.filter(record => record.date === selected);
  const selectedGames = games.filter(
    game =>
      game.date === selected &&
      gameIncludesTeam(game, profile?.teamId ?? game.homeTeamId),
  );
  const selectedReminder = reminders.find(
    reminder => dayjs(reminder.scheduledAt).format('YYYY-MM-DD') === selected,
  );
  const thisMonthRecords = records.filter(record =>
    dayjs(record.date).isSame(month, 'month'),
  );
  const wins = thisMonthRecords.filter(
    record => record.result === 'win',
  ).length;

  return (
    <Screen style={styles.screen}>
      <View style={styles.content}>
        <PaperCard style={styles.calendarCard}>
          <View style={styles.monthHeader}>
            <TouchableOpacity
              accessibilityLabel="이전 달"
              onPress={() => setMonth(value => value.subtract(1, 'month'))}
              style={styles.arrowButton}>
              <Text style={styles.arrow}>‹</Text>
            </TouchableOpacity>
            <Text style={styles.monthTitle}>{month.format('YYYY년 M월')}</Text>
            <TouchableOpacity
              accessibilityLabel="다음 달"
              onPress={() => setMonth(value => value.add(1, 'month'))}
              style={styles.arrowButton}>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.weekRow}>
            {weekdays.map((day, index) => (
              <Text
                key={day}
                style={[
                  styles.weekday,
                  index === 0 && styles.sunday,
                  index === 6 && styles.saturday,
                ]}>
                {day}
              </Text>
            ))}
          </View>

          <View style={styles.grid}>
            {cells.map(({ date, inMonth }) => {
              const key = date.format('YYYY-MM-DD');
              const isSelected = selected === key;
              const hasRecord = records.some(record => record.date === key);
              const hasGame = games.some(
                game =>
                  game.date === key &&
                  gameIncludesTeam(game, profile?.teamId ?? game.homeTeamId),
              );
              const weekday = date.day();
              return (
                <TouchableOpacity
                  key={key}
                  onPress={() => setSelected(key)}
                  style={[styles.day, isSelected && styles.selectedDay]}>
                  <Text
                    style={[
                      styles.dayText,
                      !inMonth && styles.outsideText,
                      weekday === 0 && styles.sunday,
                      weekday === 6 && styles.saturday,
                      isSelected && styles.selectedDayText,
                    ]}>
                    {date.date()}
                  </Text>
                  <View style={styles.dots}>
                    {hasGame ? <View style={styles.gameDot} /> : null}
                    {hasRecord ? (
                      <View
                        style={[styles.dot, isSelected && styles.selectedDot]}
                      />
                    ) : null}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </PaperCard>

        <View style={styles.notes}>
          <PaperCard taped style={styles.bigNote}>
            <Text style={styles.noteLabel}>
              {dayjs(selected).format('M월 D일')}
            </Text>
            <Text style={styles.noteTitle}>
              {selectedGames.length
                ? matchupForGame(selectedGames[0])
                : selectedRecords.length
                ? `직관 기록 ${selectedRecords.length}개`
                : '오늘의 경기 없음 ㅠㅠ'}
            </Text>
            <Text style={styles.noteMemo}>
              {selectedGames.length
                ? `${selectedGames[0].time} · ${selectedGames[0].stadium.name}`
                : selectedRecords[0]?.memo || '야구장 가고싶다...'}
            </Text>
            {selectedRecords[0] ? (
              <TouchableOpacity
                onPress={() =>
                  navigation.getParent()?.navigate('RecordDetail', {
                    recordId: selectedRecords[0].id,
                  })
                }>
                <Text style={styles.addLink}>저장된 기록 보기</Text>
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity
              onPress={() =>
                navigation.getParent()?.navigate('RecordEditor', {
                  date: selected,
                  gameId: selectedGames[0]?.id,
                })
              }>
              <Text style={styles.addLink}>+ 이 날짜에 기록하기</Text>
            </TouchableOpacity>
            {dayjs(selected).isAfter(dayjs(), 'day') ? (
              <TouchableOpacity
                disabled={Boolean(selectedReminder)}
                onPress={async () => {
                  try {
                    await scheduleReminder(selected, selectedGames[0]?.id);
                    Alert.alert(
                      '알림을 예약했어요',
                      `${dayjs(selected).format(
                        'M월 D일',
                      )} 오전 10시에 알려드릴게요.`,
                    );
                  } catch (error) {
                    const denied =
                      error instanceof Error &&
                      error.message === 'NOTIFICATION_PERMISSION_DENIED';
                    Alert.alert(
                      '알림을 예약하지 못했어요',
                      denied
                        ? '기기 설정에서 직관일기 알림을 허용해주세요.'
                        : '잠시 후 다시 시도해주세요.',
                    );
                  }
                }}>
                <Text
                  style={[
                    styles.reminderLink,
                    selectedReminder && styles.reminderDone,
                  ]}>
                  {selectedReminder ? '✓ 알림 예약됨' : '♧ 이 날짜 알림 받기'}
                </Text>
              </TouchableOpacity>
            ) : null}
          </PaperCard>
          <View style={styles.smallNotes}>
            <View style={[styles.sticky, styles.yellow]}>
              <Text style={styles.stickyLabel}>이번 달 직관 기록</Text>
              <Text style={styles.stickyValue}>
                총 {thisMonthRecords.length}번
              </Text>
            </View>
            <View style={[styles.sticky, styles.green]}>
              <Text style={styles.stickyLabel}>이번 달 승률</Text>
              <Text style={styles.stickyValue}>
                {thisMonthRecords.length
                  ? Math.round((wins / thisMonthRecords.length) * 100)
                  : 0}
                %
              </Text>
            </View>
          </View>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: '#DDEEBF',
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: 96,
  },
  calendarCard: {
    padding: spacing.md,
  },
  monthHeader: {
    height: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  arrowButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrow: {
    color: colors.greenDark,
    fontSize: 34,
    lineHeight: 36,
  },
  monthTitle: {
    ...font('bold'),
    color: colors.ink,
    fontSize: 20,
  },
  weekRow: {
    flexDirection: 'row',
  },
  weekday: {
    ...font('medium'),
    width: `${100 / 7}%`,
    color: colors.muted,
    textAlign: 'center',
    fontSize: 11,
    paddingVertical: spacing.sm,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  day: {
    width: `${100 / 7}%`,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedDay: {
    borderRadius: 21,
    backgroundColor: colors.greenSoft,
  },
  dayText: {
    ...font('medium'),
    color: colors.ink,
    fontSize: 13,
  },
  outsideText: {
    opacity: 0.34,
  },
  sunday: {
    color: colors.coral,
  },
  saturday: {
    color: colors.blue,
  },
  selectedDayText: {
    color: colors.greenDark,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.coral,
  },
  dots: {
    height: 5,
    flexDirection: 'row',
    gap: 2,
    marginTop: 2,
  },
  gameDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.blue,
  },
  selectedDot: {
    backgroundColor: colors.greenDark,
  },
  notes: {
    flex: 1,
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  bigNote: {
    flex: 1.45,
    justifyContent: 'space-between',
    padding: spacing.lg,
  },
  noteLabel: {
    ...handwriting,
    color: colors.ink,
    fontSize: 16,
  },
  noteTitle: {
    ...handwriting,
    color: colors.ink,
    fontSize: 20,
    lineHeight: 28,
  },
  noteMemo: {
    ...handwriting,
    color: colors.ink,
    fontSize: 15,
  },
  addLink: {
    ...font('bold'),
    color: colors.greenDark,
    fontSize: 11,
  },
  reminderLink: {
    ...font('bold'),
    color: colors.blue,
    fontSize: 10,
  },
  reminderDone: {
    color: colors.muted,
  },
  smallNotes: {
    flex: 1,
    gap: spacing.md,
  },
  sticky: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.md,
    transform: [{ rotate: '2deg' }],
  },
  yellow: {
    backgroundColor: colors.yellow,
  },
  green: {
    backgroundColor: '#D9EFA9',
    transform: [{ rotate: '-2deg' }],
  },
  stickyLabel: {
    ...handwriting,
    color: colors.ink,
    textAlign: 'center',
    fontSize: 12,
  },
  stickyValue: {
    ...handwriting,
    marginTop: spacing.sm,
    color: colors.ink,
    textAlign: 'center',
    fontSize: 18,
  },
});
