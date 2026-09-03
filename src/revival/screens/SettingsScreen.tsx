import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import dayjs from 'dayjs';

import { MenuRow, PaperCard, Screen } from '../components';
import { useAds } from '../ads/AdsContext';
import { teamById } from '../data';
import { useRevivalStore } from '../store';
import { colors, font, spacing } from '../theme';

export default function SettingsScreen() {
  const navigation = useNavigation<any>();
  const { privacyOptionsRequired, showPrivacyOptions } = useAds();
  const profile = useRevivalStore(state => state.profile);
  const records = useRevivalStore(state => state.records);
  const reminders = useRevivalStore(state => state.reminders);
  const deleteAllUserData = useRevivalStore(state => state.deleteAllUserData);
  const team = teamById(profile?.teamId ?? 1);

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

  return (
    <Screen>
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
            ● 로컬 저장 정상 · {dayjs().format('YYYY.MM.DD HH:mm')}
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
            caption="전체 기록과 사진을 한 파일로 저장"
            icon="⇩"
            label="백업 생성"
          />
          <MenuRow
            caption="백업 파일에서 기록 복원"
            icon="⇧"
            label="백업 복원"
          />
          <MenuRow icon="ⓘ" label="앱 정보" />
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
          기록과 사진은 앱 전용 저장 공간에 보관됩니다. 전체 백업·복원은
          8단계에서 활성화됩니다.
        </Text>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 110,
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
