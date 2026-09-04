import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SvgProps } from 'react-native-svg';

import { Calendar, Home, Location, More, Photos } from '@/assets/svg';
import AdBanner from './ads/AdBanner';
import { useAds } from './ads/AdsContext';
import { isPreviewBannerHidden } from './preview';
import { colors, font } from './theme';

const tabConfig: Record<
  string,
  { label: string; icon: React.FC<SvgProps>; emphasized?: boolean }
> = {
  Today: { label: '오늘', icon: Home },
  Calendar: { label: '캘린더', icon: Calendar },
  Records: { label: '기록', icon: Photos, emphasized: true },
  Map: { label: '지도', icon: Location },
  Settings: { label: '설정', icon: More },
};

export default function RevivalBottomTab({
  state,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { ready: adsReady } = useAds();
  const hidePreviewBanner = isPreviewBannerHidden();

  return (
    <View style={styles.shell}>
      {adsReady && !hidePreviewBanner ? <AdBanner /> : null}
      <View
        style={[styles.outer, { paddingBottom: Math.max(insets.bottom, 8) }]}>
        {state.routes.map((route, index) => {
          const active = state.index === index;
          const config = tabConfig[route.name];
          const Icon = config.icon;

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={active ? { selected: true } : {}}
              onPress={() => navigation.navigate(route.name)}
              style={styles.tab}>
              <View
                style={[
                  styles.iconWrap,
                  config.emphasized && styles.emphasized,
                  config.emphasized && active && styles.emphasizedActive,
                ]}>
                <Icon
                  color={
                    config.emphasized
                      ? colors.white
                      : active
                      ? colors.greenDark
                      : '#4E514D'
                  }
                  height={config.emphasized ? 25 : 23}
                  width={config.emphasized ? 25 : 23}
                />
              </View>
              <Text style={[styles.label, active && styles.activeLabel]}>
                {config.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    backgroundColor: colors.canvas,
  },
  outer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    overflow: 'hidden',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#DDD8CE',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: '#FFFEFA',
    paddingTop: 5,
    shadowColor: '#2C261F',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 10,
  },
  tab: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  iconWrap: {
    width: 38,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emphasized: {
    width: 38,
    height: 32,
    borderRadius: 12,
    backgroundColor: colors.green,
  },
  emphasizedActive: {
    backgroundColor: colors.greenDark,
  },
  label: {
    ...font('medium'),
    color: '#4E514D',
    fontSize: 10,
  },
  activeLabel: {
    ...font('bold'),
    color: colors.greenDark,
  },
});
