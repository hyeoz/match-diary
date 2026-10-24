import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import MainTabs from './revival/MainTabs';
import { RootStackParamList } from './revival/navigationTypes';
import OnboardingScreen from './revival/screens/OnboardingScreen';
import NotificationSettingsScreen from './revival/screens/NotificationSettingsScreen';
import RecordDetailScreen from './revival/screens/RecordDetailScreen';
import RecordEditorScreen from './revival/screens/RecordEditorScreen';
import SplashScreen from './revival/screens/SplashScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const Router = () => {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        animation: 'slide_from_right',
      }}>
      <Stack.Screen
        name="Splash"
        component={SplashScreen}
        options={{ animation: 'fade_from_bottom' }}
      />
      <Stack.Screen
        name="SignIn"
        component={OnboardingScreen}
        options={{ animation: 'fade_from_bottom' }}
      />
      <Stack.Screen name="Main" component={MainTabs} />
      <Stack.Screen
        name="RecordEditor"
        component={RecordEditorScreen}
        options={{ animation: 'slide_from_bottom' }}
      />
      <Stack.Screen name="RecordDetail" component={RecordDetailScreen} />
      <Stack.Screen
        name="NotificationSettings"
        component={NotificationSettingsScreen}
      />
    </Stack.Navigator>
  );
};

export default Router;
