import React from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import dayjs from 'dayjs';

import { AppHeader, PaperCard, Screen } from '../components';
import { RootStackParamList } from '../navigationTypes';
import { useRevivalStore } from '../store';
import { colors, font, spacing } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'NotificationSettings'>;

export default function NotificationSettingsScreen({ navigation }: Props) {
  const reminders = useRevivalStore(state => state.reminders);
  const deleteReminder = useRevivalStore(state => state.deleteReminder);

  const remove = (id: string) => {
    Alert.alert('알림 취소', '예약한 직관 알림을 취소할까요?', [
      { text: '돌아가기', style: 'cancel' },
      {
        text: '알림 취소',
        style: 'destructive',
        onPress: () => {
          deleteReminder(id).catch(() =>
            Alert.alert(
              '알림을 취소하지 못했어요',
              '잠시 후 다시 시도해주세요.',
            ),
          );
        },
      },
    ]);
  };

  return (
    <Screen>
      <AppHeader title="알림 설정" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        <PaperCard taped style={styles.guide}>
          <Text style={styles.guideTitle}>
            직관 당일 오전 10시에 알려드려요
          </Text>
          <Text style={styles.guideText}>
            캘린더에서 미래 날짜를 고른 뒤 ‘이 날짜 알림 받기’를 누르면 서버
            없이 이 기기에 예약됩니다.
          </Text>
        </PaperCard>
        <Text style={styles.section}>예약된 알림 {reminders.length}개</Text>
        {reminders.length ? (
          reminders.map(reminder => (
            <PaperCard key={reminder.id} style={styles.reminder}>
              <View style={styles.reminderCopy}>
                <Text style={styles.reminderDate}>
                  {dayjs(reminder.scheduledAt).format(
                    'YYYY년 M월 D일 (ddd) HH:mm',
                  )}
                </Text>
                <Text style={styles.reminderCaption}>
                  이 기기에 저장된 로컬 알림
                </Text>
              </View>
              <TouchableOpacity onPress={() => remove(reminder.id)}>
                <Text style={styles.cancel}>취소</Text>
              </TouchableOpacity>
            </PaperCard>
          ))
        ) : (
          <View style={styles.empty}>
            <Text style={styles.emptyBall}>⚾</Text>
            <Text style={styles.emptyText}>예약된 직관 알림이 없어요.</Text>
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.xl, paddingBottom: 48 },
  guide: { padding: spacing.xl, backgroundColor: colors.yellow },
  guideTitle: { ...font('bold'), color: colors.ink, fontSize: 16 },
  guideText: {
    ...font('light'),
    marginTop: spacing.sm,
    color: colors.ink,
    fontSize: 12,
    lineHeight: 18,
  },
  section: {
    ...font('bold'),
    marginTop: spacing.xxl,
    marginBottom: spacing.md,
    color: colors.ink,
    fontSize: 15,
  },
  reminder: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    padding: spacing.lg,
  },
  reminderCopy: { flex: 1 },
  reminderDate: { ...font('bold'), color: colors.ink, fontSize: 13 },
  reminderCaption: {
    ...font('light'),
    marginTop: spacing.xs,
    color: colors.muted,
    fontSize: 10,
  },
  cancel: { ...font('bold'), color: colors.danger, fontSize: 12 },
  empty: { alignItems: 'center', paddingTop: 72 },
  emptyBall: { fontSize: 40 },
  emptyText: {
    ...font('medium'),
    marginTop: spacing.md,
    color: colors.muted,
    fontSize: 13,
  },
});
