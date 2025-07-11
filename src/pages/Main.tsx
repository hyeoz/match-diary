import React from 'react';
import {
  BottomTabBarProps,
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import BottomTab from '@components/BottomTab';
import Calendar from './Calendar';
import More from './More';
import Community from './Community';
import Write from './Write';
import History from './History';
import Map from './Map';

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

function MainCommunityStackNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Community"
      screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Community" component={Community} />
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
function MainMapStackNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Map"
      screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Map" component={Map} />
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
      screenOptions={{ headerShown: false, lazy: true }}>
      <Tab.Screen name="CalendarTab" component={CalendarStackNavigator} />

      {/* NOTE 중앙의 홈탭 클릭 시 expand */}
      <Tab.Screen name="Main" component={MainWriteStackNavigator} />
      <Tab.Screen name="ContactTab" component={MainCommunityStackNavigator} />
      <Tab.Screen name="HistoryTab" component={MainHistoryStackNavigator} />
      <Tab.Screen name="MapTab" component={MainMapStackNavigator} />

      <Tab.Screen name="MoreTab" component={MoreStackNavigator} />
    </Tab.Navigator>
  );
}

export default Main;
