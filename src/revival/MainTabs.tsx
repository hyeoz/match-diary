import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import CalendarScreen from './screens/CalendarScreen';
import MapScreen from './screens/MapScreen';
import RecordsScreen from './screens/RecordsScreen';
import SettingsScreen from './screens/SettingsScreen';
import TodayScreen from './screens/TodayScreen';
import RevivalBottomTab from './RevivalBottomTab';
import { MainTabParamList } from './navigationTypes';
import { getPreviewScreen } from './preview';

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainTabs() {
  const preview = getPreviewScreen();
  const initialRouteName: keyof MainTabParamList =
    preview === 'calendar'
      ? 'Calendar'
      : preview === 'records'
      ? 'Records'
      : preview === 'map'
      ? 'Map'
      : preview === 'settings'
      ? 'Settings'
      : 'Today';

  return (
    <Tab.Navigator
      initialRouteName={initialRouteName}
      tabBar={props => <RevivalBottomTab {...props} />}
      screenOptions={{ headerShown: false, lazy: false }}>
      <Tab.Screen component={TodayScreen} name="Today" />
      <Tab.Screen component={CalendarScreen} name="Calendar" />
      <Tab.Screen component={RecordsScreen} name="Records" />
      <Tab.Screen component={MapScreen} name="Map" />
      <Tab.Screen component={SettingsScreen} name="Settings" />
    </Tab.Navigator>
  );
}
