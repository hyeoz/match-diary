import { useEffect } from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';

import { useBottomTabState, useMyState } from '@stores/default';
import { palette } from '@style/palette.ts';
import Home from '@assets/svg/home.svg';
import Calendar from '@assets/svg/calendar.svg';
import More from '@assets/svg/more.svg';
import Explore from '@assets/svg/explore.svg';
import Photos from '@assets/svg/photos.svg';
import Write from '@assets/svg/write.svg';

const { width } = Dimensions.get('window');

function BottomTab({ ...props }: BottomTabBarProps) {
  const { state, navigation } = props;
  const { isOpen, update } = useBottomTabState();
  const { team } = useMyState();
  const homeHeight = useSharedValue(64);
  const homeDeg = useSharedValue(0);

  const currentTab = state.routes[state.index];

  useEffect(() => {
    if (!isOpen) {
      handleHeightScaleDown();
      handleHomeRotateOrigin();
    } else {
      handleHeightScaleUp();
      handleHomeRotate();
    }
  }, [isOpen]);

  const handleHeightScaleUp = () => {
    homeHeight.value = withSpring(192);
  };
  const handleHomeRotate = () => {
    homeDeg.value = withTiming(180, { duration: 300 });
  };
  const handleHeightScaleDown = () => {
    homeHeight.value = withSpring(64);
  };
  const handleHomeRotateOrigin = () => {
    homeDeg.value = withTiming(0, { duration: 300 });
  };

  const onPressNavigate = (destination: string) => {
    isOpen && update();
    navigation.navigate(destination);
  };

  const isRouteMatchStyle = (
    routeName: string,
    matchColor?: string,
    defaultColor?: string,
  ) => {
    if (currentTab.name === routeName) {
      return palette.teamColor[team] ?? matchColor;
    } else {
      return defaultColor ?? '#333';
    }
  };

  const animatedHeightStyle = useAnimatedStyle(() => ({
    height: homeHeight.value,
  }));
  const animatedRotateStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${homeDeg.value}deg` }],
  }));

  return (
    <View style={styles.container}>
      <View style={styles.tabWrapper}>
        <TouchableOpacity
          style={[
            styles.tabItem,
            {
              marginRight: 32,
            },
          ]}
          onPress={() => onPressNavigate('CalendarTab')}>
          <Calendar
            width={32}
            height={32}
            color={isRouteMatchStyle('CalendarTab')}
          />
        </TouchableOpacity>
        <View style={[styles.tabItem, styles.centerWrapper]}>
          <Animated.View style={[styles.homeWrapper, animatedHeightStyle]}>
            {isOpen ? (
              <View
                style={{
                  width: 64,
                  height: 192,
                  justifyContent: 'space-evenly',
                }}>
                <TouchableOpacity
                  onPress={() => onPressNavigate('DiscoverTab')}>
                  <View style={styles.floatIconWrapper}>
                    <View style={styles.floatIconBg} />
                    <Explore
                      width={24}
                      height={24}
                      color={isRouteMatchStyle('DiscoverTab', '#fff')}
                    />
                  </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => onPressNavigate('Main')}>
                  <View style={styles.floatIconWrapper}>
                    <View style={styles.floatIconBg} />
                    <Write
                      width={24}
                      height={24}
                      color={isRouteMatchStyle('Main', '#fff')}
                    />
                  </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => onPressNavigate('HistoryTab')}>
                  <View style={styles.floatIconWrapper}>
                    <View style={styles.floatIconBg} />
                    <Photos
                      width={28}
                      height={28}
                      color={isRouteMatchStyle('HistoryTab', '#fff')}
                    />
                  </View>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => {
                  update();
                  handleHeightScaleUp();
                }}
                style={{
                  width: 64,
                  height: 64,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Animated.View style={[animatedRotateStyle]}>
                  <Home
                    width={28}
                    height={28}
                    color={
                      ['Main', 'DiscoverTab', 'HistoryTab'].includes(
                        currentTab.name,
                      )
                        ? '#fff'
                        : '#333'
                    }
                  />
                </Animated.View>
              </TouchableOpacity>
            )}
          </Animated.View>
        </View>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => onPressNavigate('MoreTab')}>
          <More width={40} height={40} color={isRouteMatchStyle('MoreTab')} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'flex-end',
    shadowColor: '#171717',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    position: 'relative',
  },
  tabWrapper: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 0,
    backgroundColor: '#FFF',
    width,
    zIndex: 8,
    borderStyle: 'solid',
    paddingHorizontal: 40,
    paddingVertical: 8,
    borderRadius: 24,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    width: width / 3,
  },
  centerWrapper: {
    position: 'absolute',
    left: '50%',
    bottom: '50%',
    transform: [{ translateX: -24 }],
  },
  homeWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: palette.commonColor.green,
    shadowColor: '#171717',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 7,
    bottom: 0,
    overflow: 'hidden',
  },
  floatTabWrapper: {
    position: 'absolute',
    top: '50%',
  },
  floatIconWrapper: {
    width: 48,
    height: 48,
    marginHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  floatIconBg: {
    width: 48,
    height: 48,
    backgroundColor: '#fff',
    opacity: 0.3,
    borderRadius: 32,
    position: 'absolute',
  },
});

export default BottomTab;
