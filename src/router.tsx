import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Splash from './pages/Splash';
import Main from './pages/Main';

const Stack = createNativeStackNavigator();

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
        component={Splash}
        options={{ animation: 'fade_from_bottom' }}
      />
      <Stack.Screen
        name="Main"
        component={Main}
        // options={{
        //   animation: 'fade',
        // }}
      />
    </Stack.Navigator>
  );
};

export default Router;
