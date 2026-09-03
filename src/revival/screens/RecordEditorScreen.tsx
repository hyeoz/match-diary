import React, { useMemo, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import dayjs from 'dayjs';
import { launchImageLibrary } from 'react-native-image-picker';
import type { Asset } from 'react-native-image-picker';

import {
  AppHeader,
  Field,
  PrimaryButton,
  Screen,
  SecondaryButton,
} from '../components';
import { gameIncludesTeam, matchupForGame, opponentForGame } from '../schedule';
import { RootStackParamList } from '../navigationTypes';
import { useAds } from '../ads/AdsContext';
import { useInterstitial } from '../ads/useInterstitial';
import { useRevivalStore } from '../store';
import { localDataService } from '../storage/service';
import type {
  MediaSource,
  RecordAttachments,
  RecordResult,
} from '../storage/types';
import { colors, font, radius, spacing } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'RecordEditor'>;

const results: { value: RecordResult; label: string }[] = [
  { value: 'win', label: '승' },
  { value: 'lose', label: '패' },
  { value: 'draw', label: '무' },
  { value: 'unknown', label: '미정' },
];

const sourceFromAsset = (asset: Asset): MediaSource | null =>
  asset.uri
    ? {
        uri: asset.uri,
        fileName: asset.fileName,
        mimeType: asset.type,
        fileSize: asset.fileSize,
        width: asset.width,
        height: asset.height,
      }
    : null;

export default function RecordEditorScreen({ navigation, route }: Props) {
  const { ready: adsReady } = useAds();
  const { show: showSavedRecordAd } = useInterstitial(adsReady);
  const records = useRevivalStore(state => state.records);
  const games = useRevivalStore(state => state.games);
  const profile = useRevivalStore(state => state.profile);
  const saveRecord = useRevivalStore(state => state.saveRecord);
  const updateRecord = useRevivalStore(state => state.updateRecord);
  const editing = records.find(item => item.id === route.params?.recordId);
  const date =
    editing?.date ?? route.params?.date ?? dayjs().format('YYYY-MM-DD');
  const availableGames = useMemo(
    () =>
      games.filter(
        game =>
          game.date === date &&
          gameIncludesTeam(game, profile?.teamId ?? game.homeTeamId),
      ),
    [date, games, profile?.teamId],
  );
  const [selectedGameId, setSelectedGameId] = useState(
    editing?.gameId ?? route.params?.gameId ?? availableGames[0]?.id ?? null,
  );
  const [seat, setSeat] = useState(editing?.seat ?? '');
  const [memo, setMemo] = useState(editing?.memo ?? '');
  const [result, setResult] = useState<RecordResult>(
    editing?.result ?? 'unknown',
  );
  const [photo, setPhoto] = useState<Asset | null>(null);
  const [ticket, setTicket] = useState<Asset | null>(null);
  const [removePhoto, setRemovePhoto] = useState(false);
  const [removeTicket, setRemoveTicket] = useState(false);
  const [saving, setSaving] = useState(false);
  const selectedGame = availableGames.find(game => game.id === selectedGameId);
  const formattedDate = useMemo(() => {
    const value = dayjs(date);
    const weekday = ['일', '월', '화', '수', '목', '금', '토'][value.day()];
    return `${value.format('YYYY/MM/DD')} (${weekday})`;
  }, [date]);

  const pickImage = async (kind: 'photo' | 'ticket') => {
    const response = await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: 1,
      quality: 0.9,
      maxWidth: 2400,
      maxHeight: 2400,
      includeExtra: false,
    });
    if (response.didCancel) return;
    if (response.errorCode) {
      Alert.alert(
        '사진을 불러오지 못했어요',
        response.errorCode === 'permission'
          ? '사진 선택 권한을 확인해주세요.'
          : '잠시 후 다시 시도해주세요.',
      );
      return;
    }
    const asset = response.assets?.[0];
    if (!asset?.uri) {
      Alert.alert('사진을 불러오지 못했어요', '선택한 파일을 확인해주세요.');
      return;
    }
    if (kind === 'photo') {
      setPhoto(asset);
      setRemovePhoto(false);
    } else {
      setTicket(asset);
      setRemoveTicket(false);
    }
  };

  const save = async () => {
    if (saving) return;
    setSaving(true);
    try {
      const opponent = selectedGame
        ? opponentForGame(
            selectedGame,
            profile?.teamId ?? selectedGame.homeTeamId,
          ).name
        : editing?.opponent ?? '일정 미연결';
      const draft = {
        gameId: selectedGame?.id ?? editing?.gameId ?? null,
        date,
        opponent,
        time: selectedGame?.time ?? editing?.time ?? '-',
        stadium:
          selectedGame?.stadium.name ?? editing?.stadium ?? '경기장 미정',
        seat: seat.trim(),
        memo: memo.trim(),
        result,
      };
      if (editing) {
        const attachments: RecordAttachments = {};
        if (photo) attachments.photo = sourceFromAsset(photo);
        else if (removePhoto) attachments.photo = null;
        if (ticket) attachments.ticket = sourceFromAsset(ticket);
        else if (removeTicket) attachments.ticket = null;
        await updateRecord({ ...editing, ...draft }, attachments);
      } else {
        await saveRecord(draft, {
          photo: photo ? sourceFromAsset(photo) : null,
          ticket: ticket ? sourceFromAsset(ticket) : null,
        });
      }
      navigation.goBack();
      showSavedRecordAd();
    } catch (error) {
      const storageFull =
        error instanceof Error &&
        error.message === 'STORAGE_SPACE_INSUFFICIENT';
      Alert.alert(
        '기록을 저장하지 못했어요',
        storageFull
          ? '기기 저장 공간이 부족해요. 공간을 확보한 뒤 다시 시도해주세요.'
          : '기존 데이터는 그대로 보존했습니다. 잠시 후 다시 시도해주세요.',
      );
    } finally {
      setSaving(false);
    }
  };

  const photoUri = photo?.uri
    ? photo.uri
    : editing?.photo && !removePhoto
    ? localDataService.resolveMediaUri(editing.photo.relativePath)
    : null;
  const ticketUri = ticket?.uri
    ? ticket.uri
    : editing?.ticket && !removeTicket
    ? localDataService.resolveMediaUri(editing.ticket.relativePath)
    : null;

  return (
    <Screen>
      <AppHeader
        title={editing ? '기록 수정하기' : '기록 남기기'}
        onBack={() => navigation.goBack()}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.imageHeader}>
            <Text style={styles.sectionLabel}>이미지</Text>
            <TouchableOpacity onPress={() => pickImage('ticket')}>
              <Text style={styles.ticketAction}>
                {ticketUri ? '티켓 이미지 교체' : '+ 티켓 이미지 추가'}
              </Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            accessibilityLabel={photoUri ? '기록 사진 교체' : '기록 사진 추가'}
            onPress={() => pickImage('photo')}
            style={styles.photoField}>
            {photoUri ? (
              <>
                <Image source={{ uri: photoUri }} style={styles.photoPreview} />
                <View style={styles.replaceBadge}>
                  <Text style={styles.replaceText}>사진 교체</Text>
                </View>
              </>
            ) : (
              <>
                <View style={styles.cameraCircle}>
                  <Text style={styles.camera}>▣</Text>
                </View>
                <Text style={styles.photoCopy}>
                  사진을 선택하면 앱 전용 공간에 안전하게 보관해요
                </Text>
              </>
            )}
          </TouchableOpacity>
          {photoUri ? (
            <TouchableOpacity
              onPress={() => {
                setPhoto(null);
                setRemovePhoto(true);
              }}>
              <Text style={styles.removeText}>기록 사진 삭제</Text>
            </TouchableOpacity>
          ) : null}

          {ticketUri ? (
            <View style={styles.ticketPreviewRow}>
              <Image source={{ uri: ticketUri }} style={styles.ticketPreview} />
              <View style={styles.ticketPreviewCopy}>
                <Text style={styles.ticketPreviewTitle}>
                  티켓 이미지 선택됨
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setTicket(null);
                    setRemoveTicket(true);
                  }}>
                  <Text style={styles.removeText}>티켓 이미지 삭제</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : null}

          <View style={styles.ticketBox}>
            <View style={styles.ticketRow}>
              <Text style={styles.ticketIcon}>▦</Text>
              <Text style={styles.ticketValue}>{formattedDate}</Text>
            </View>
            {availableGames.length ? (
              availableGames.map(game => (
                <TouchableOpacity
                  key={game.id}
                  onPress={() => setSelectedGameId(game.id)}
                  style={[
                    styles.gameOption,
                    selectedGameId === game.id && styles.selectedGame,
                  ]}>
                  <Text style={styles.gameOptionTitle}>
                    {matchupForGame(game)}
                  </Text>
                  <Text style={styles.gameOptionCaption}>
                    {game.time} · {game.stadium.name}
                  </Text>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.scheduleEmpty}>
                아직 이 날짜의 일정 캐시가 없어요. 일정 자동화가 연결되면 상대
                팀·시간·경기장이 자동으로 채워집니다.
              </Text>
            )}
          </View>

          <View>
            <Text style={styles.sectionLabel}>경기 결과</Text>
            <View style={styles.resultRow}>
              {results.map(item => (
                <TouchableOpacity
                  key={item.value}
                  onPress={() => setResult(item.value)}
                  style={[
                    styles.resultButton,
                    result === item.value && styles.resultButtonActive,
                  ]}>
                  <Text
                    style={[
                      styles.resultText,
                      result === item.value && styles.resultTextActive,
                    ]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <Field
            label="좌석"
            onChangeText={setSeat}
            placeholder="좌석을 입력해주세요 (예: 1루 123블록 7열 12번)"
            value={seat}
          />
          <Field
            label="내용"
            maxLength={200}
            multiline
            onChangeText={setMemo}
            placeholder={'사진과 함께 기록할 내용을 적어주세요!'}
            value={memo}
          />
          <Text style={styles.counter}>{memo.length} / 200</Text>
        </ScrollView>
        <View style={styles.footer}>
          <SecondaryButton
            label="취소하기"
            onPress={() => navigation.goBack()}
            style={styles.footerButton}
          />
          <PrimaryButton
            disabled={saving}
            label={saving ? '저장 중...' : editing ? '수정하기' : '저장하기'}
            onPress={save}
            style={styles.footerButton}
          />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: {
    gap: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  imageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionLabel: { ...font('bold'), color: colors.ink, fontSize: 14 },
  ticketAction: { ...font('bold'), color: colors.greenDark, fontSize: 12 },
  photoField: {
    position: 'relative',
    height: 190,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#B7B4AE',
    borderStyle: 'dashed',
    borderRadius: radius.sm,
    backgroundColor: colors.paper,
    overflow: 'hidden',
  },
  photoPreview: { width: '100%', height: '100%' },
  replaceBadge: {
    position: 'absolute',
    right: spacing.sm,
    bottom: spacing.sm,
    borderRadius: 14,
    backgroundColor: 'rgba(35,31,55,0.78)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  replaceText: { ...font('bold'), color: colors.white, fontSize: 10 },
  cameraCircle: {
    width: 54,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 27,
    backgroundColor: '#EEECE7',
  },
  camera: { color: colors.muted, fontSize: 25 },
  photoCopy: {
    ...font('light'),
    marginTop: spacing.sm,
    color: colors.muted,
    fontSize: 11,
  },
  ticketPreviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.sm,
    backgroundColor: colors.paper,
    padding: spacing.sm,
  },
  ticketPreview: { width: 64, height: 64, borderRadius: radius.sm },
  ticketPreviewCopy: { flex: 1, gap: spacing.sm },
  ticketPreviewTitle: { ...font('medium'), color: colors.ink, fontSize: 12 },
  removeText: {
    ...font('bold'),
    color: colors.danger,
    textAlign: 'right',
    fontSize: 11,
  },
  ticketBox: {
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.sm,
    backgroundColor: '#FFFDF7',
    padding: spacing.lg,
  },
  ticketRow: { flexDirection: 'row', alignItems: 'center' },
  ticketIcon: { width: 34, color: colors.muted, fontSize: 17 },
  ticketValue: { ...font('medium'), flex: 1, color: colors.ink, fontSize: 14 },
  gameOption: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.sm,
    padding: spacing.md,
  },
  selectedGame: {
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
  },
  gameOptionTitle: { ...font('bold'), color: colors.ink, fontSize: 14 },
  gameOptionCaption: {
    ...font('light'),
    marginTop: spacing.xs,
    color: colors.muted,
    fontSize: 11,
  },
  scheduleEmpty: {
    ...font('light'),
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18,
  },
  resultRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  resultButton: {
    flex: 1,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.sm,
    backgroundColor: colors.paper,
    paddingVertical: spacing.md,
  },
  resultButtonActive: {
    borderColor: colors.green,
    backgroundColor: colors.green,
  },
  resultText: { ...font('bold'), color: colors.muted, fontSize: 13 },
  resultTextActive: { color: colors.white },
  counter: {
    ...font('light'),
    marginTop: -spacing.sm,
    color: colors.muted,
    textAlign: 'right',
    fontSize: 11,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
    backgroundColor: colors.canvas,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  footerButton: { flex: 1 },
});
