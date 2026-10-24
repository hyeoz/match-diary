import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import dayjs from 'dayjs';

import { RootStackParamList } from '../navigationTypes';
import { getPreviewScreen, previewGames, previewRecords } from '../preview';
import { bundledStadiums } from '../scheduleCatalog';
import { useRevivalStore } from '../store';
import { colors, font } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

export default function SplashScreen({ navigation }: Props) {
  const hydrate = useRevivalStore(state => state.hydrate);
  const hydrationError = useRevivalStore(state => state.hydrationError);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;

    hydrate()
      .then(() => {
        if (!active) return;
        if (useRevivalStore.getState().hydrationError) return;
        const preview = getPreviewScreen();
        if (preview) {
          if (preview === 'intro' || preview === 'form') {
            navigation.replace('SignIn');
            return;
          }
          useRevivalStore.setState({
            profile: { nickname: '야구덕후', teamId: 1 },
            records: previewRecords(),
            games: previewGames(),
            stadiums: bundledStadiums,
          });
          if (preview === 'editor') {
            navigation.replace('RecordEditor', {
              date: dayjs().format('YYYY-MM-DD'),
              gameId: 'preview-game-today',
            });
          } else if (preview === 'detail') {
            navigation.replace('RecordDetail', { recordId: 'preview-1' });
          } else if (preview === 'notifications') {
            navigation.replace('NotificationSettings');
          } else {
            navigation.replace('Main');
          }
          return;
        }
        const hasProfile = Boolean(useRevivalStore.getState().profile);
        navigation.replace(hasProfile ? 'Main' : 'SignIn');
      })
      .catch(() => {
        if (active) navigation.replace('SignIn');
      });

    return () => {
      active = false;
    };
  }, [attempt, hydrate, navigation]);

  const retry = () => {
    useRevivalStore.setState({ hydrated: false, hydrationError: null });
    setAttempt(value => value + 1);
  };

  return (
    <View style={styles.container}>
      <Image
        accessibilityLabel="직관일기 로고"
        source={require('@/assets/revival_app_icon.png')}
        style={styles.logo}
      />
      <Text style={styles.title}>직관일기</Text>
      <Text style={styles.caption}>나의 야구장 기억을 차곡차곡</Text>
      {hydrationError ? (
        <View style={styles.errorPanel}>
          <Text style={styles.errorText}>
            로컬 저장소를 열지 못했어요.{'\n'}기존 데이터는 삭제하지 않았습니다.
          </Text>
          <TouchableOpacity
            accessibilityRole="button"
            onPress={retry}
            style={styles.retryButton}>
            <Text style={styles.retryText}>다시 시도</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.greenSoft,
  },
  logo: {
    width: 190,
    height: 190,
    borderRadius: 42,
  },
  title: {
    ...font('bold'),
    marginTop: 24,
    color: colors.ink,
    fontSize: 30,
  },
  caption: {
    ...font('light'),
    marginTop: 8,
    color: colors.greenDark,
    fontSize: 14,
  },
  errorPanel: {
    alignItems: 'center',
    marginTop: 28,
  },
  errorText: {
    ...font('light'),
    color: colors.muted,
    textAlign: 'center',
    fontSize: 12,
    lineHeight: 18,
  },
  retryButton: {
    marginTop: 14,
    borderRadius: 18,
    backgroundColor: colors.greenDark,
    paddingHorizontal: 20,
    paddingVertical: 9,
  },
  retryText: {
    ...font('bold'),
    color: colors.white,
    fontSize: 12,
  },
});
