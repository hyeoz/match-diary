import { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, { useSharedValue, withSpring } from 'react-native-reanimated';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';

import useBottomTabState from '../store/default';
import Home from '../assets/svg/home.svg';
import Calendar from '../assets/svg/calendar.svg';
import More from '../assets/svg/more.svg';
import { palette } from '../style/palette';

/* reference: https://dribbble.com/shots/6117913-Tab-Bar-Interaction-XVIII?utm_source=Clipboard_Shot&utm_campaign=Volorf&utm_content=Tab+Bar+Interaction+XVIII&utm_medium=Social_Share&utm_source=Pinterest_Shot&utm_campaign=Volorf&utm_content=Tab+Bar+Interaction+XVIII&utm_medium=Social_Share */

const { width, height } = Dimensions.get('window');

function BottomTab({ ...props }: BottomTabBarProps) {
  const { state, navigation } = props;
  const { isOpen, update } = useBottomTabState();
  const homeHeight = useSharedValue(64);

  const handleHeightScaleUp = () => {
    homeHeight.value = withSpring(homeHeight.value * 3);
  };

  console.log(homeHeight, 'PROPS');

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
          {/* <Text style={[styles.bottomText]}>Calendar</Text> */}
          <Calendar width={32} height={32} color={palette.teamColor.ssg} />
        </TouchableOpacity>
        <View style={[styles.tabItem, styles.centerWrapper]}>
          <Animated.View
            style={[
              styles.homeWrapper,
              {
                height: homeHeight.value,
              },
            ]}>
            {isOpen ? (
              <View>
                <TouchableOpacity
                  onPress={() => navigation.navigate('DiscoverTab')}>
                  <Text style={styles.floatText}>Discover</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('Main')}>
                  <Text style={styles.floatText}>Write</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => navigation.navigate('HistoryTab')}>
                  <Text style={styles.floatText}>History</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => {
                  update();
                  handleHeightScaleUp();
                }}>
                {/* <Text style={[styles.bottomText]}>Home</Text> */}
                {/* <View style={styles.homeWrapper}> */}
                <Home
                  width={32}
                  height={32}
                  color={'white'}
                  style={styles.homeIcon}
                />
                {/* </View> */}
              </TouchableOpacity>
            )}
          </Animated.View>
        </View>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => navigation.navigate('MoreTab')}>
          {/* <Text style={[styles.bottomText]}>More</Text> */}
          <More width={40} height={40} color={palette.teamColor.ssg} />
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
  },
  homeIcon: {
    position: 'relative',
    left: '50%',
    top: '50%',
    transform: [
      {
        translateX: -16,
      },
      {
        translateY: -14,
      },
    ],
  },
  floatTabWrapper: {
    position: 'absolute',
    top: '50%',
  },
  floatText: {
    textAlign: 'center',
  },

  bottomText: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default BottomTab;
