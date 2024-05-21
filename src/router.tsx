import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Splash from './pages/Splash';
import Main from './pages/Main';
import BackgroundGeolocation from 'react-native-background-geolocation';
import { STADIUM_GEO } from './utils/STATIC_DATA';

const Stack = createNativeStackNavigator();

const Router = () => {
  useEffect(() => {
    // initGeofence();
    BackgroundGeolocation.addGeofences(
      Object.entries(STADIUM_GEO).map(item => ({
        identifier: item[0],
        longitude: item[1].lon,
        latitude: item[1].lat,
        radius: 350,
        notifyOnEntry: true,
      })),
    )
      .then(success => console.log({ success }))
      .catch(error => console.log({ error }));

    BackgroundGeolocation.start();

    return () => {
      BackgroundGeolocation.stop();
    };
  }, []);

  const initGeofence = async () => {
    // const res = await BackgroundGeolocation.addGeofences(
  };

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
