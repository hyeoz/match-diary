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

import useBottomTabState from '../store/default';
import Home from '../assets/svg/home.svg';
import Calendar from '../assets/svg/calendar.svg';
import More from '../assets/svg/more.svg';
import Explore from '../assets/svg/explore.svg';
import List from '../assets/svg/list.svg';
import Write from '../assets/svg/write.svg';
import { palette } from '../style/palette';

/* reference: https://dribbble.com/shots/6117913-Tab-Bar-Interaction-XVIII?utm_source=Clipboard_Shot&utm_campaign=Volorf&utm_content=Tab+Bar+Interaction+XVIII&utm_medium=Social_Share&utm_source=Pinterest_Shot&utm_campaign=Volorf&utm_content=Tab+Bar+Interaction+XVIII&utm_medium=Social_Share */

const { width } = Dimensions.get('window');

function BottomTab({ ...props }: BottomTabBarProps) {
  const { state, navigation } = props;
  const { isOpen, update } = useBottomTabState();
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

  const isRouteMatchStyle = (
    routeName: string,
    matchColor?: string,
    defaultColor?: string,
  ) => {
    if (currentTab.name === routeName) {
      return matchColor ?? palette.teamColor.ssg;
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
          onPress={() => navigation.navigate('CalendarTab')}>
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
                  onPress={() => navigation.navigate('DiscoverTab')}>
                  <View style={styles.floatIconWrapper}>
                    <View style={styles.floatIconBg} />
                    <Explore
                      width={24}
                      height={24}
                      color={isRouteMatchStyle('DiscoverTab', '#fff')}
                    />
                  </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('Main')}>
                  <View style={styles.floatIconWrapper}>
                    <View style={styles.floatIconBg} />
                    <Write
                      width={24}
                      height={24}
                      color={isRouteMatchStyle('Main', '#fff')}
                    />
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => navigation.navigate('HistoryTab')}>
                  <View style={styles.floatIconWrapper}>
                    <View style={styles.floatIconBg} />
                    <List
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
          onPress={() => navigation.navigate('MoreTab')}>
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
    // justifyContent: 'space-around',
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
