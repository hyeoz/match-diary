import React from 'react';
import {
  BottomTabBarProps,
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import BottomTab from '../components/BottomTab';
import Calendar from './Calendar';
import More from './More';
import Discover from './Discover';
import Write from './Write';
import History from './History';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function CalendarStackNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Calendar"
      screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Calendar" component={Calendar} />
    </Stack.Navigator>
  );
}

function MainDiscoverStackNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Discover"
      screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Discover" component={Discover} />
    </Stack.Navigator>
  );
}
function MainWriteStackNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Write"
      screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Write" component={Write} />
    </Stack.Navigator>
  );
}
function MainHistoryStackNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="History"
      screenOptions={{ headerShown: false }}>
      <Stack.Screen name="History" component={History} />
    </Stack.Navigator>
  );
}

function MoreStackNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="More"
      screenOptions={{ headerShown: false }}>
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
      backBehavior="history"
      screenOptions={{ headerShown: false }}>
      <Tab.Screen name="CalendarTab" component={CalendarStackNavigator} />

      {/* NOTE 중앙의 홈탭 클릭 시 expand */}
      <Tab.Screen name="Main" component={MainWriteStackNavigator} />
      <Tab.Screen name="DiscoverTab" component={MainDiscoverStackNavigator} />
      <Tab.Screen name="HistoryTab" component={MainHistoryStackNavigator} />

      <Tab.Screen name="MoreTab" component={MoreStackNavigator} />
    </Tab.Navigator>
  );
}

export default Main;
