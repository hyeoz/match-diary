import React from 'react';
import { AppState, StyleSheet, TouchableOpacity } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { BannerAd } from 'react-native-google-mobile-ads';
import RevivalBottomTab from '../src/revival/RevivalBottomTab';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
jest.mock('../src/assets/svg', () => ({
  Calendar: () => null,
  Home: () => null,
  Location: () => null,
  More: () => null,
  Photos: () => null,
}));
jest.mock('../src/revival/ads/AdsContext', () => ({
  useAds: () => ({ ready: true }),
}));
jest.mock('../src/revival/preview', () => ({
  isPreviewBannerHidden: () => false,
}));

it('reveals loaded ads only on an accepted change to another tab', () => {
  AppState.currentState = 'active';
  const navigate = jest.fn();
  const emit = jest.fn(() => ({ defaultPrevented: false }));
  const props = {
    state: {
      index: 0,
      routes: [
        { name: 'Today', key: 'today' },
        { name: 'Calendar', key: 'calendar' },
      ],
    },
    navigation: { navigate, emit },
  } as unknown as React.ComponentProps<typeof RevivalBottomTab>;
  let tree: renderer.ReactTestRenderer;
  act(() => {
    tree = renderer.create(<RevivalBottomTab {...props} />);
  });
  const height = () =>
    StyleSheet.flatten(
      tree.root.findByProps({
        testID: 'ad-banner-container',
      }).props.style,
    ).height;
  const press = (index: number) =>
    act(() => {
      tree.root.findAllByType(TouchableOpacity)[index].props.onPress();
    });

  press(1); // Navigation without an ad cannot queue a delayed insertion.
  expect(navigate).toHaveBeenCalledWith('Calendar');
  act(() => tree.root.findByType(BannerAd).props.onAdLoaded());
  expect(height()).toBe(0);
  navigate.mockClear();
  press(0); // Repeated taps on the active tab do not insert an ad.
  expect(height()).toBe(0);
  expect(navigate).not.toHaveBeenCalled();
  emit.mockReturnValueOnce({ defaultPrevented: true });
  press(1);
  expect(height()).toBe(0);
  expect(navigate).not.toHaveBeenCalled();
  press(1);
  expect(height()).toBeUndefined();
  expect(navigate).toHaveBeenCalledTimes(1);
  act(() => tree.unmount());
});
