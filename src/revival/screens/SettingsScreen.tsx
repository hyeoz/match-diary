import React, { useState } from 'react';
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import dayjs from 'dayjs';

import { backupErrorMessage } from '../backupErrors';
import {
  APP_VERSION,
  LEGACY_RECOVERY_EMAIL_URL,
  PRIVACY_POLICY_URL,
  SUPPORT_EMAIL,
  SUPPORT_URL,
} from '../appInfo';
import { MenuRow, PaperCard, Screen } from '../components';
import { useAds } from '../ads/AdsContext';
import { teamById } from '../data';
import { useRevivalStore } from '../store';
import { colors, font, spacing } from '../theme';

const formatBytes = (bytes: number): string => {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
};

export default function SettingsScreen() {
  const navigation = useNavigation<any>();
  const [backupBusy, setBackupBusy] = useState<'create' | 'restore' | null>(
    null,
  );
  const { privacyOptionsRequired, showPrivacyOptions } = useAds();
  const profile = useRevivalStore(state => state.profile);
  const records = useRevivalStore(state => state.records);
  const reminders = useRevivalStore(state => state.reminders);
  const latestBackup = useRevivalStore(state => state.latestBackup);
  const createBackup = useRevivalStore(state => state.createBackup);
  const restoreBackup = useRevivalStore(state => state.restoreBackup);
  const deleteAllUserData = useRevivalStore(state => state.deleteAllUserData);
  const team = teamById(profile?.teamId ?? 1);

  const openExternalUrl = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert(
        '페이지를 열지 못했어요',
        '네트워크 연결을 확인하고 다시 시도해주세요.',
      );
    }
  };

  const openLegacyRecoveryRequest = async () => {
    try {
      await Linking.openURL(LEGACY_RECOVERY_EMAIL_URL);
    } catch {
      Alert.alert(
        '메일 앱을 열지 못했어요',
        `${SUPPORT_EMAIL}으로 기존 기록 복구를 문의해주세요.`,
      );
    }
  };

  const confirmDelete = () => {
    Alert.alert(
      '모든 데이터 삭제',
      '프로필·직관 기록·사진·예약 알림을 이 기기에서 모두 삭제할까요?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAllUserData();
              navigation.getParent()?.reset({
                index: 0,
                routes: [{ name: 'SignIn' }],
              });
            } catch {
              Alert.alert(
                '데이터를 삭제하지 못했어요',
                '기존 기록과 사진은 그대로 보존했습니다.',
              );
            }
          },
        },
      ],
    );
  };

  const handleCreateBackup = async () => {
    if (backupBusy) return;
    setBackupBusy('create');
    try {
      const result = await createBackup();
      if (!result) return;
      Alert.alert(
        '전체 백업을 저장했어요',
        `${result.recordCount}개 기록과 ${
          result.mediaCount
        }개 사진·티켓을 ${formatBytes(
          result.byteSize,
        )} 파일로 저장했습니다.\n\n파일명: ${result.fileName}`,
      );
    } catch (error) {
      Alert.alert('백업을 만들지 못했어요', backupErrorMessage(error));
    } finally {
      setBackupBusy(null);
    }
  };

  const runRestore = async () => {
    if (backupBusy) return;
    setBackupBusy('restore');
    try {
      const result = await restoreBackup();
      if (!result) return;
      const reminderNotice = result.notificationFailureCount
        ? `\n알림 ${result.notificationFailureCount}개는 기기 권한 때문에 다시 예약하지 못했습니다.`
        : '';
      const duplicateNotice = result.skippedRecordCount
        ? `\n중복 기록 ${result.skippedRecordCount}개는 건너뛰었습니다.`
        : '';
      Alert.alert(
        '백업 복원을 완료했어요',
        `${result.recordCount}개 기록과 ${result.mediaCount}개 사진·티켓을 복원했습니다.${duplicateNotice}${reminderNotice}`,
      );
    } catch (error) {
      Alert.alert('백업을 복원하지 못했어요', backupErrorMessage(error));
    } finally {
      setBackupBusy(null);
    }
  };

  const confirmRestore = () => {
    if (backupBusy) return;
    Alert.alert(
      '백업에서 복원',
      '백업 파일을 먼저 검증한 뒤 현재 데이터와 합칩니다. 같은 기록은 중복 생성하지 않으며, 검증에 실패하면 현재 데이터는 변경되지 않습니다.',
      [
        { text: '취소', style: 'cancel' },
        { text: '파일 선택', onPress: runRestore },
      ],
    );
  };

  return (
    <Screen edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.hero, { backgroundColor: team.color }]}>
          <View style={styles.ballLine} />
          <Text style={styles.heroTitle}>설정</Text>
          <Text style={styles.heroCaption}>
            {profile?.nickname || '야구팬'} · {team.name}
          </Text>
        </View>

        <View style={styles.backupStatus}>
          <Text style={styles.backupText}>
            {latestBackup
              ? `● 최근 백업 · ${dayjs(latestBackup.createdAt).format(
                  'YYYY.MM.DD HH:mm',
                )}`
              : `● 로컬 저장 정상 · ${dayjs().format('YYYY.MM.DD HH:mm')}`}
          </Text>
        </View>

        <PaperCard style={styles.menu}>
          <MenuRow
            caption="닉네임과 응원 팀 변경"
            icon="♙"
            label="내 정보 수정"
            onPress={() => navigation.getParent()?.navigate('SignIn')}
          />
          <MenuRow
            caption={`예약된 알림 ${reminders.length}개`}
            icon="♧"
            label="알림 설정"
            onPress={() =>
              navigation.getParent()?.navigate('NotificationSettings')
            }
          />
          {privacyOptionsRequired ? (
            <MenuRow
              caption="Google 광고 동의 설정 변경"
              icon="◎"
              label="광고 개인정보 옵션"
              onPress={() => {
                showPrivacyOptions().catch(() => {
                  Alert.alert(
                    '광고 설정을 열지 못했어요',
                    '네트워크 연결을 확인하고 다시 시도해주세요.',
                  );
                });
              }}
            />
          ) : null}
          <MenuRow
            caption={
              backupBusy === 'create'
                ? '파일을 만들고 검증하는 중…'
                : '전체 기록과 사진을 .matchdiary 파일로 저장'
            }
            icon="⇩"
            label={backupBusy === 'create' ? '백업 생성 중' : '백업 생성'}
            onPress={handleCreateBackup}
          />
          <MenuRow
            caption={
              backupBusy === 'restore'
                ? '파일을 검증하고 안전하게 합치는 중…'
                : '검증된 백업을 현재 데이터와 안전하게 합치기'
            }
            icon="⇧"
            label={backupBusy === 'restore' ? '백업 복원 중' : '백업 복원'}
            onPress={confirmRestore}
          />
          <MenuRow
            caption="예전 버전의 데이터가 필요하면 개별 복구 요청"
            icon="✉"
            label="기존 기록 복구 요청"
            onPress={openLegacyRecoveryRequest}
          />
          <MenuRow
            caption="수집·이용·보관 및 삭제 안내"
            icon="▤"
            label="개인정보처리방침"
            onPress={() => openExternalUrl(PRIVACY_POLICY_URL)}
          />
          <MenuRow
            caption="사용 안내와 이메일 문의"
            icon="?"
            label="지원 및 문의"
            onPress={() => openExternalUrl(SUPPORT_URL)}
          />
          <MenuRow caption={`버전 ${APP_VERSION}`} icon="ⓘ" label="앱 정보" />
        </PaperCard>

        <PaperCard style={styles.deleteCard}>
          <MenuRow
            caption={`프로필과 현재 ${records.length}개의 기록`}
            destructive
            icon="♲"
            label="모든 데이터 삭제"
            onPress={confirmDelete}
          />
        </PaperCard>

        <Text style={styles.note}>
          기록과 사진은 앱 전용 저장 공간에 보관됩니다. 백업 파일에는 개인
          기록과 사진이 포함되므로 안전한 위치에 보관해주세요. 앱 밖에 저장한
          백업 파일은 앱 데이터 삭제 시 함께 지워지지 않습니다.
        </Text>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing.lg,
  },
  hero: {
    position: 'relative',
    minHeight: 184,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  ballLine: {
    position: 'absolute',
    right: -44,
    top: 40,
    width: 150,
    height: 150,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.22)',
    borderRadius: 75,
  },
  heroTitle: {
    ...font('bold'),
    color: colors.white,
    fontSize: 34,
  },
  heroCaption: {
    ...font('light'),
    marginTop: spacing.sm,
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
  },
  backupStatus: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  backupText: {
    ...font('medium'),
    color: colors.greenDark,
    fontSize: 11,
  },
  menu: {
    overflow: 'hidden',
    marginHorizontal: spacing.lg,
  },
  deleteCard: {
    overflow: 'hidden',
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    borderColor: colors.danger,
  },
  note: {
    ...font('light'),
    marginHorizontal: spacing.xl,
    marginTop: spacing.lg,
    color: colors.muted,
    textAlign: 'center',
    fontSize: 10,
    lineHeight: 15,
  },
});
