import React, { useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { PaperCard, Screen } from '../components';
import { bundledStadiums, findStadium } from '../scheduleCatalog';
import { useRevivalStore } from '../store';
import type { Stadium } from '../storage/types';
import { colors, font, spacing } from '../theme';

const pinPosition = (stadium: Stadium) => {
  const latitude = stadium.latitude ?? 36.3;
  const longitude = stadium.longitude ?? 127.6;
  const top = 8 + ((38 - latitude) / 3.25) * 79;
  const left = 9 + ((longitude - 126.35) / 2.95) * 78;
  return {
    top: `${Math.max(4, Math.min(88, top))}%` as `${number}%`,
    left: `${Math.max(4, Math.min(86, left))}%` as `${number}%`,
  };
};

export default function MapScreen() {
  const records = useRevivalStore(state => state.records);
  const storedStadiums = useRevivalStore(state => state.stadiums);
  const stadiums = storedStadiums.length ? storedStadiums : bundledStadiums;
  const visitsByStadium = useMemo(() => {
    const result = new Map<string, typeof records>();
    for (const record of records) {
      const stadium = findStadium(record.stadium);
      if (!stadium) continue;
      result.set(stadium.id, [...(result.get(stadium.id) ?? []), record]);
    }
    return result;
  }, [records]);
  const [selectedId, setSelectedId] = useState(
    Array.from(visitsByStadium.keys())[0] ?? stadiums[0]?.id ?? 'jamsil',
  );
  const selected = stadiums.find(item => item.id === selectedId) ?? stadiums[0];
  const visits = visitsByStadium.get(selected?.id ?? '') ?? [];
  const latest = [...visits].sort((a, b) => b.date.localeCompare(a.date))[0];

  return (
    <Screen edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>내 직관 지도 보기</Text>
        <Text style={styles.caption}>
          {visitsByStadium.size} / {stadiums.length} 구장 정복
        </Text>
        <View style={styles.map}>
          <View style={styles.landOne} />
          <View style={styles.landTwo} />
          <View style={styles.landThree} />
          {stadiums.map(stadium => {
            const visited = visitsByStadium.has(stadium.id);
            const selectedPin = selected?.id === stadium.id;
            return (
              <TouchableOpacity
                key={stadium.id}
                accessibilityLabel={`${stadium.name} ${
                  visited ? '방문함' : '미방문'
                }`}
                onPress={() => setSelectedId(stadium.id)}
                style={[styles.pinWrap, pinPosition(stadium)]}>
                <View
                  style={[
                    styles.pin,
                    visited ? styles.visitedPin : styles.unvisitedPin,
                    selectedPin && styles.selectedPin,
                  ]}
                />
                <Text style={styles.pinLabel}>{stadium.shortName}</Text>
              </TouchableOpacity>
            );
          })}
          <View style={styles.legend}>
            <View style={[styles.legendDot, styles.visitedPin]} />
            <Text style={styles.legendText}>방문</Text>
            <View style={[styles.legendDot, styles.unvisitedPin]} />
            <Text style={styles.legendText}>미방문</Text>
          </View>
        </View>

        {selected ? (
          <PaperCard taped style={styles.detail}>
            <Text style={styles.stadium}>{selected.name}</Text>
            <View style={styles.detailRow}>
              <View>
                <Text style={styles.detailLabel}>방문 횟수</Text>
                <Text style={styles.detailValue}>{visits.length}회</Text>
              </View>
              <View>
                <Text style={styles.detailLabel}>최근 방문</Text>
                <Text style={styles.detailValue}>{latest?.date ?? '-'}</Text>
              </View>
              <View>
                <Text style={styles.detailLabel}>승리</Text>
                <Text style={styles.detailValue}>
                  {visits.filter(record => record.result === 'win').length}회
                </Text>
              </View>
            </View>
            <Text style={styles.mapNotice}>
              외부 지도·위치 권한 없이 앱에 포함된 구장 좌표로 표시합니다.
            </Text>
          </PaperCard>
        ) : null}
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
  caption: {
    ...font('medium'),
    marginTop: spacing.xs,
    color: colors.greenDark,
    textAlign: 'center',
    fontSize: 11,
  },
  map: {
    position: 'relative',
    height: 410,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 18,
    backgroundColor: '#EAF4F5',
    marginTop: spacing.xl,
  },
  landOne: {
    position: 'absolute',
    top: 38,
    left: '27%',
    width: '48%',
    height: 280,
    borderRadius: 90,
    backgroundColor: '#F2EFD7',
    transform: [{ rotate: '-13deg' }],
  },
  landTwo: {
    position: 'absolute',
    top: 225,
    left: '38%',
    width: '34%',
    height: 145,
    borderRadius: 60,
    backgroundColor: '#F2EFD7',
    transform: [{ rotate: '18deg' }],
  },
  landThree: {
    position: 'absolute',
    bottom: 18,
    left: '23%',
    width: 36,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F2EFD7',
  },
  pinWrap: { position: 'absolute', alignItems: 'center' },
  pin: {
    width: 16,
    height: 16,
    borderWidth: 3,
    borderColor: colors.white,
    borderRadius: 8,
  },
  visitedPin: { backgroundColor: colors.coral },
  unvisitedPin: { backgroundColor: colors.blue, opacity: 0.55 },
  selectedPin: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderColor: colors.yellow,
    opacity: 1,
  },
  pinLabel: { ...font('bold'), marginTop: 1, color: colors.ink, fontSize: 8 },
  legend: {
    position: 'absolute',
    right: spacing.sm,
    bottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.88)',
    padding: spacing.sm,
  },
  legendDot: { width: 8, height: 8, borderRadius: 4, marginLeft: spacing.sm },
  legendText: {
    ...font('medium'),
    marginLeft: 3,
    color: colors.muted,
    fontSize: 8,
  },
  detail: { marginTop: -18, padding: spacing.xl },
  stadium: { ...font('bold'), color: colors.ink, fontSize: 20 },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xl,
  },
  detailLabel: { ...font('light'), color: colors.muted, fontSize: 11 },
  detailValue: {
    ...font('bold'),
    marginTop: spacing.xs,
    color: colors.greenDark,
    fontSize: 14,
  },
  mapNotice: {
    ...font('light'),
    marginTop: spacing.xl,
    color: colors.muted,
    fontSize: 10,
  },
});
