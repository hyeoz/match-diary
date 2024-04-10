import React from 'react';
import {View} from 'react-native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Splash from './pages/Spalsh';
import MainTab from './pages/MainTab';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const Router = () => {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerShown: false,
        // gestureEnabled: false
      }}>
      <Stack.Screen
        name="Splash"
        component={Splash}
        options={{animation: 'fade_from_bottom'}}
      />
      <Stack.Screen
        name="MainTab"
        component={MainTab}
        options={{
          animation: 'fade',
          // cardStyleInterpolator: forFade,
        }}
      />
    </Stack.Navigator>
  );
};

export default Router;
