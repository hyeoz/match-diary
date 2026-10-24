import React, { useRef, useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import dayjs from 'dayjs';
import Share from 'react-native-share';
import ViewShot from 'react-native-view-shot';

import { AppHeader, PaperCard, Screen, SecondaryButton } from '../components';
import { RootStackParamList } from '../navigationTypes';
import { localDataService } from '../storage/service';
import { useRevivalStore } from '../store';
import { colors, font, handwriting, radius, spacing } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'RecordDetail'>;

const resultLabel = {
  win: '승리',
  lose: '패배',
  draw: '무승부',
  unknown: '결과 미정',
};

export default function RecordDetailScreen({ navigation, route }: Props) {
  const shotRef = useRef<ViewShot>(null);
  const [sharing, setSharing] = useState(false);
  const record = useRevivalStore(state =>
    state.records.find(item => item.id === route.params.recordId),
  );
  const deleteRecord = useRevivalStore(state => state.deleteRecord);

  if (!record) {
    return (
      <Screen>
        <AppHeader title="직관 기록" onBack={() => navigation.goBack()} />
        <View style={styles.missing}>
          <Text style={styles.missingText}>
            삭제되었거나 찾을 수 없는 기록이에요.
          </Text>
        </View>
      </Screen>
    );
  }

  const photoUri = record.photo
    ? localDataService.resolveMediaUri(record.photo.relativePath)
    : null;
  const ticketUri = record.ticket
    ? localDataService.resolveMediaUri(record.ticket.relativePath)
    : null;

  const share = async () => {
    if (!shotRef.current?.capture || sharing) return;
    setSharing(true);
    try {
      const captured = await shotRef.current.capture();
      const url = captured.startsWith('file://')
        ? captured
        : `file://${captured}`;
      await Share.open({
        url,
        type: 'image/jpeg',
        title: '직관일기 공유',
        failOnCancel: false,
      });
    } catch {
      Alert.alert('공유 카드를 만들지 못했어요', '잠시 후 다시 시도해주세요.');
    } finally {
      setSharing(false);
    }
  };

  const confirmDelete = () => {
    Alert.alert('기록 삭제', '이 기록과 앱에 보관된 사진을 삭제할까요?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteRecord(record.id);
            navigation.popToTop();
          } catch {
            Alert.alert(
              '기록을 삭제하지 못했어요',
              '기존 데이터는 보존했습니다.',
            );
          }
        },
      },
    ]);
  };

  return (
    <Screen>
      <AppHeader
        title="직관 기록"
        onBack={() => navigation.goBack()}
        action={
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('RecordEditor', { recordId: record.id })
            }>
            <Text style={styles.edit}>수정</Text>
          </TouchableOpacity>
        }
      />
      <ScrollView contentContainerStyle={styles.content}>
        <ViewShot
          ref={shotRef}
          options={{ format: 'jpg', quality: 0.95, result: 'tmpfile' }}
          style={styles.shareCanvas}>
          <View style={styles.brandRow}>
            <Text style={styles.brand}>직관일기</Text>
            <Text style={styles.brandBall}>⚾</Text>
          </View>
          <PaperCard taped style={styles.polaroid}>
            <View style={styles.photo}>
              {photoUri ? (
                <Image source={{ uri: photoUri }} style={styles.photoImage} />
              ) : (
                <Text style={styles.photoBall}>⚾</Text>
              )}
            </View>
            <Text style={styles.date}>
              {dayjs(record.date).format('YY.MM.DD')} · {record.stadium}
            </Text>
            <Text style={styles.match}>
              vs {record.opponent} · {resultLabel[record.result]}
            </Text>
            <Text style={styles.memo}>{record.memo || '그날의 직관 기록'}</Text>
          </PaperCard>
        </ViewShot>

        <PaperCard style={styles.infoCard}>
          <Info label="경기 일시" value={`${record.date} ${record.time}`} />
          <Info label="경기장" value={record.stadium} />
          <Info label="좌석" value={record.seat || '입력하지 않음'} />
          {ticketUri ? (
            <View style={styles.ticketRow}>
              <Image source={{ uri: ticketUri }} style={styles.ticketImage} />
              <Text style={styles.ticketText}>보관 중인 티켓 이미지</Text>
            </View>
          ) : null}
        </PaperCard>

        <View style={styles.actions}>
          <SecondaryButton
            label={sharing ? '카드 만드는 중...' : '공유하기'}
            onPress={share}
            style={styles.action}
          />
          <SecondaryButton
            destructive
            label="삭제하기"
            onPress={confirmDelete}
            style={styles.action}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.xl, paddingBottom: 48 },
  shareCanvas: { backgroundColor: colors.canvas, padding: spacing.lg },
  brandRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  brand: { ...font('bold'), color: colors.greenDark, fontSize: 15 },
  brandBall: { fontSize: 16 },
  polaroid: { padding: spacing.md, backgroundColor: colors.white },
  photo: {
    aspectRatio: 1.16,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: '#EFECE4',
  },
  photoImage: { width: '100%', height: '100%' },
  photoBall: { fontSize: 54 },
  date: {
    ...handwriting,
    marginTop: spacing.lg,
    color: colors.ink,
    fontSize: 14,
  },
  match: {
    ...font('bold'),
    marginTop: spacing.xs,
    color: colors.greenDark,
    fontSize: 12,
  },
  memo: {
    ...handwriting,
    minHeight: 54,
    marginTop: spacing.md,
    color: colors.ink,
    fontSize: 17,
    lineHeight: 24,
  },
  infoCard: { gap: spacing.md, marginTop: spacing.xl, padding: spacing.lg },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start' },
  infoLabel: {
    ...font('medium'),
    width: 76,
    color: colors.muted,
    fontSize: 12,
  },
  infoValue: { ...font('bold'), flex: 1, color: colors.ink, fontSize: 13 },
  ticketRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
    paddingTop: spacing.md,
  },
  ticketImage: { width: 64, height: 64, borderRadius: radius.sm },
  ticketText: { ...font('medium'), color: colors.muted, fontSize: 12 },
  actions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.xl },
  action: { flex: 1 },
  edit: { ...font('bold'), color: colors.greenDark, fontSize: 14 },
  missing: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  missingText: { ...font('medium'), color: colors.muted, fontSize: 14 },
});
