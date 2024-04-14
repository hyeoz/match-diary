import { useState } from 'react';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import useBottomTabState from '../store/default';

/* reference: https://dribbble.com/shots/6117913-Tab-Bar-Interaction-XVIII?utm_source=Clipboard_Shot&utm_campaign=Volorf&utm_content=Tab+Bar+Interaction+XVIII&utm_medium=Social_Share&utm_source=Pinterest_Shot&utm_campaign=Volorf&utm_content=Tab+Bar+Interaction+XVIII&utm_medium=Social_Share */

const { width, height } = Dimensions.get('window');

function BottomTab({ ...props }: BottomTabBarProps) {
  const { state, navigation } = props;

  //   const [isOpen, setIsOpen] = useState(false);
  const { isOpen, update } = useBottomTabState();

  console.log(props, 'PROPS');

  return (
    <View style={styles.container}>
      <View style={styles.tabWrapper}>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => navigation.navigate('CalendarTab')}>
          <Text style={[styles.bottomText]}>Calendar</Text>
        </TouchableOpacity>
        {isOpen ? (
          <View style={styles.floatTabWrapper}>
            <TouchableOpacity
              onPress={() => navigation.navigate('DiscoverTab')}>
              <Text style={styles.floatText}>Discover</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Main')}>
              <Text style={styles.floatText}>Write</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('HistoryTab')}>
              <Text style={styles.floatText}>History</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.tabItem} onPress={() => update()}>
            <Text style={[styles.bottomText]}>Home</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => navigation.navigate('MoreTab')}>
          <Text style={[styles.bottomText]}>More</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'flex-end',
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
    padding: 40,
    borderRadius: 24,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    // backgroundColor: 'red',
    width: width / 3,
  },

  floatTabWrapper: {
    position: 'absolute',
    left: '50%',
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
