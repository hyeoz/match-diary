import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { backupErrorMessage } from '../backupErrors';
import { PrimaryButton, Screen, SecondaryButton } from '../components';
import { getRandomNickname, teams } from '../data';
import { RootStackParamList } from '../navigationTypes';
import { getPreviewScreen } from '../preview';
import { useRevivalStore } from '../store';
import { cardShadow, colors, font, radius, spacing } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'SignIn'>;
const { width } = Dimensions.get('window');
const itemWidth = (width - spacing.xl * 2 - spacing.sm * 3) / 4;

export default function OnboardingScreen({ navigation }: Props) {
  const [step, setStep] = useState<'intro' | 'form'>(() =>
    getPreviewScreen() === 'form' ? 'form' : 'intro',
  );
  const [nickname, setNickname] = useState('');
  const [teamId, setTeamId] = useState(1);
  const [saving, setSaving] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const saveProfile = useRevivalStore(state => state.saveProfile);
  const restoreBackup = useRevivalStore(state => state.restoreBackup);
  const legacyRecoveryStatus = useRevivalStore(
    state => state.legacyRecoveryStatus,
  );
  const legacyRecoveryResult = useRevivalStore(
    state => state.legacyRecoveryResult,
  );
  const selectedTeam = useMemo(
    () => teams.find(team => team.id === teamId) ?? teams[0],
    [teamId],
  );

  useEffect(() => {
    if (
      legacyRecoveryStatus !== 'completed' ||
      !legacyRecoveryResult ||
      !useRevivalStore.getState().profile
    ) {
      return;
    }
    Alert.alert(
      '기존 기록을 자동 복구했어요',
      `${legacyRecoveryResult.recordCount}개 기록과 ${legacyRecoveryResult.mediaCount}개 사진·티켓을 가져왔습니다.`,
      [{ text: '직관일기 열기', onPress: () => navigation.replace('Main') }],
    );
  }, [legacyRecoveryResult, legacyRecoveryStatus, navigation]);

  const submit = async () => {
    if (!nickname.trim() || saving) return;
    setSaving(true);
    await saveProfile({ nickname: nickname.trim(), teamId });
    navigation.replace('Main');
  };

  const runRestore = async () => {
    if (restoring) return;
    setRestoring(true);
    try {
      const result = await restoreBackup();
      if (!result) return;
      const profile = useRevivalStore.getState().profile;
      if (!profile) {
        Alert.alert(
          '프로필을 찾지 못했어요',
          '기록은 복원했지만 프로필 정보가 없어 먼저 닉네임과 응원 팀을 설정해주세요.',
          [{ text: '확인', onPress: () => setStep('form') }],
        );
        return;
      }
      Alert.alert(
        '백업 복원을 완료했어요',
        `${result.recordCount}개 기록과 ${result.mediaCount}개 사진·티켓을 복원했습니다.`,
        [{ text: '직관일기 열기', onPress: () => navigation.replace('Main') }],
      );
    } catch (error) {
      Alert.alert('백업을 복원하지 못했어요', backupErrorMessage(error));
    } finally {
      setRestoring(false);
    }
  };

  const confirmRestore = () => {
    if (restoring) return;
    Alert.alert(
      '백업에서 복원',
      '백업 파일을 먼저 검증한 뒤 현재 데이터와 합칩니다. 검증에 실패하면 현재 데이터는 변경되지 않습니다.',
      [
        { text: '취소', style: 'cancel' },
        { text: '파일 선택', onPress: runRestore },
      ],
    );
  };

  if (step === 'intro') {
    return (
      <Screen style={styles.intro}>
        <View style={styles.introCopy}>
          <Text style={styles.introTitle}>
            반가워요!{'\n'}직관일기를 시작해볼까요?
          </Text>
        </View>
        <Image
          accessibilityLabel="연필과 야구공이 하트를 이루는 직관일기 로고"
          source={require('@/assets/revival_app_icon.png')}
          style={styles.introLogo}
        />
        <View style={styles.introActions}>
          <PrimaryButton
            label="시작하기"
            onPress={() => setStep('form')}
            style={styles.introButton}
          />
          <SecondaryButton
            label={restoring ? '복원 중...' : '백업에서 복원'}
            onPress={confirmRestore}
            style={styles.restoreButton}
          />
        </View>
        <Text style={styles.help}>
          기기를 변경했거나 앱을 다시 설치했다면{'\n'}저장해둔 .matchdiary
          파일로 복원할 수 있어요
        </Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}>
        <ScrollView
          contentContainerStyle={styles.formContent}
          keyboardShouldPersistTaps="handled">
          <Text style={styles.formTitle}>
            응원하는 팀과{'\n'}닉네임을 입력해주세요!
          </Text>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>닉네임 설정</Text>
            <TouchableOpacity onPress={() => setNickname(getRandomNickname())}>
              <Text style={styles.random}>↝ 랜덤 닉네임 생성하기</Text>
            </TouchableOpacity>
          </View>
          <TextInput
            accessibilityLabel="닉네임"
            maxLength={12}
            onChangeText={setNickname}
            placeholder="닉네임을 입력해주세요"
            placeholderTextColor="#AAA69D"
            style={styles.input}
            value={nickname}
          />

          <Text style={[styles.sectionTitle, styles.teamTitle]}>
            마이팀 설정
          </Text>
          <FlatList
            columnWrapperStyle={styles.teamRow}
            data={teams}
            keyExtractor={item => String(item.id)}
            numColumns={4}
            renderItem={({ item }) => {
              const selected = item.id === teamId;
              return (
                <TouchableOpacity
                  accessibilityLabel={`${item.name} 선택`}
                  accessibilityRole="button"
                  onPress={() => setTeamId(item.id)}
                  style={[
                    styles.teamCard,
                    selected && {
                      borderColor: selectedTeam.color,
                      borderWidth: 2,
                    },
                  ]}>
                  <Image source={item.mascot} style={styles.mascot} />
                  {selected ? (
                    <View
                      style={[
                        styles.check,
                        { backgroundColor: selectedTeam.color },
                      ]}>
                      <Text style={styles.checkText}>✓</Text>
                    </View>
                  ) : null}
                </TouchableOpacity>
              );
            }}
            scrollEnabled={false}
          />
        </ScrollView>
        <View style={styles.submitArea}>
          <PrimaryButton
            disabled={!nickname.trim() || saving}
            label={saving ? '저장 중...' : '저장하기'}
            onPress={submit}
          />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  intro: {
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.greenSoft,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  introCopy: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  introTitle: {
    ...font('bold'),
    color: colors.ink,
    textAlign: 'center',
    fontSize: 28,
    lineHeight: 38,
  },
  introLogo: {
    width: 220,
    height: 220,
    borderRadius: 48,
    marginVertical: spacing.xl,
  },
  introButton: {
    width: '100%',
  },
  introActions: {
    width: '100%',
  },
  restoreButton: {
    width: '100%',
    marginTop: spacing.sm,
  },
  help: {
    ...font('light'),
    marginTop: spacing.lg,
    color: colors.greenDark,
    textAlign: 'center',
    fontSize: 12,
  },
  formContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxl,
  },
  formTitle: {
    ...font('bold'),
    color: colors.ink,
    fontSize: 25,
    lineHeight: 34,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xxl,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...font('bold'),
    color: colors.ink,
    fontSize: 16,
  },
  random: {
    ...font('medium'),
    color: colors.greenDark,
    fontSize: 12,
  },
  input: {
    ...font('medium'),
    minHeight: 50,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.sm,
    backgroundColor: colors.paperStrong,
    color: colors.ink,
    fontSize: 15,
    paddingHorizontal: spacing.lg,
  },
  teamTitle: {
    marginTop: spacing.xxl,
    marginBottom: spacing.md,
  },
  teamRow: {
    gap: spacing.sm,
  },
  teamCard: {
    width: itemWidth,
    height: itemWidth,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.sm,
    backgroundColor: colors.paperStrong,
    marginBottom: spacing.sm,
    ...cardShadow,
  },
  mascot: {
    width: itemWidth - 12,
    height: itemWidth - 12,
  },
  check: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 11,
  },
  checkText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '800',
  },
  submitArea: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
    backgroundColor: colors.canvas,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
});
