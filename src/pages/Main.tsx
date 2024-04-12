import React from 'react';
import {SafeAreaView, Text} from 'react-native';
import {
  BottomTabBarProps,
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';
import BottomTab from '../components/BottomTab';
import {
  NativeStackScreenProps,
  createNativeStackNavigator,
} from '@react-navigation/native-stack';
import {RootStackListType, TabListType} from '../types/types';
import Calendar from './Calendar';
import More from './More';
import Discover from './Discover';
import Write from './Write';
import History from './History';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function CalendarStackNavigator() {
  return (
    <Stack.Navigator initialRouteName="Calendar">
      <Stack.Screen name="Calendar" component={Calendar} />
    </Stack.Navigator>
  );
}

function MainDiscoverStackNavigator() {
  return (
    <Stack.Navigator initialRouteName="Discover">
      <Stack.Screen name="Discover" component={Discover} />
    </Stack.Navigator>
  );
}
function MainWriteStackNavigator() {
  return (
    <Stack.Navigator initialRouteName="Write">
      <Stack.Screen name="Write" component={Write} />
    </Stack.Navigator>
  );
}
function MainHistoryStackNavigator() {
  return (
    <Stack.Navigator initialRouteName="History">
      <Stack.Screen name="History" component={History} />
    </Stack.Navigator>
  );
}

function MoreStackNavigator() {
  return (
    <Stack.Navigator initialRouteName="More">
      <Stack.Screen name="More" component={More} />
    </Stack.Navigator>
  );
}

const renderTabBar = (props: BottomTabBarProps) => <BottomTab {...props} />;

function Main() {
  return (
    <Tab.Navigator
      initialRouteName="Main"
      tabBar={renderTabBar}
      backBehavior="history">
      <Tab.Screen name="Calendar" component={CalendarStackNavigator} />

      {/* TODO 중앙의 홈탭 클릭 시 depth 1개 더 생김 */}
      <Tab.Screen name="Main" component={MainWriteStackNavigator} />
      <Tab.Screen name="Discover" component={MainDiscoverStackNavigator} />
      <Tab.Screen name="History" component={MainHistoryStackNavigator} />

      <Tab.Screen name="More" component={MoreStackNavigator} />
    </Tab.Navigator>
  );
}

export default Main;
