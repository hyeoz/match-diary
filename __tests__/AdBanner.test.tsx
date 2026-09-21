import React from 'react';
import { AppState, StyleSheet } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { BannerAd } from 'react-native-google-mobile-ads';

import AdBanner, { AdBannerHandle } from '../src/revival/ads/AdBanner';

function fixture() {
  const ref = React.createRef<AdBannerHandle>();
  let tree: renderer.ReactTestRenderer;
  act(() => {
    tree = renderer.create(<AdBanner ref={ref} />);
  });
  return {
    tree: tree!,
    show: () => act(() => ref.current!.showOnNavigation()),
    loaded: () => act(() => tree.root.findByType(BannerAd).props.onAdLoaded()),
    fail: () =>
      act(() => tree.root.findByType(BannerAd).props.onAdFailedToLoad()),
    container: () => tree.root.findByProps({ testID: 'ad-banner-container' }),
  };
}

describe('AdBanner', () => {
  beforeEach(() => {
    AppState.currentState = 'active';
  });
  afterEach(() => jest.restoreAllMocks());

  it('does not reserve bottom space before an ad is actually visible', () => {
    const tree = renderer.create(<AdBanner />);
    const container = tree.root.findByProps({ testID: 'ad-banner-container' });

    expect(StyleSheet.flatten(container.props.style)).toMatchObject({
      height: 0,
      opacity: 0,
      overflow: 'hidden',
    });
  });

  it('keeps a late-loaded banner collapsed until the next navigation', () => {
    const f = fixture();
    f.show(); // A tab change before LOADED must not queue a later reveal.
    f.loaded();
    expect(StyleSheet.flatten(f.container().props.style).height).toBe(0);
    expect(f.container().props.pointerEvents).toBe('none');
    expect(f.container().props.importantForAccessibility).toBe(
      'no-hide-descendants',
    );
    f.show();
    expect(
      StyleSheet.flatten(f.container().props.style).height,
    ).toBeUndefined();
    expect(f.container().props.pointerEvents).toBe('box-none');
    expect(f.container().props.accessibilityElementsHidden).toBe(false);
    act(() => f.tree.unmount());
  });

  it('separates a visible ad from both content and navigation', () => {
    const f = fixture();
    f.loaded();
    f.show();
    const style = StyleSheet.flatten(f.container().props.style);
    expect(style.paddingTop).toBeGreaterThanOrEqual(12);
    expect(style.paddingBottom).toBeGreaterThanOrEqual(16);
    expect(style.borderTopWidth).toBeGreaterThan(0);
    expect(style.borderBottomWidth).toBeGreaterThan(0);
    const before = f.tree.toJSON();
    f.loaded(); // Refresh notifications do not collapse/re-expand the slot.
    expect(f.tree.toJSON()).toEqual(before);
    act(() => f.tree.unmount());
  });

  it.each([false, true])(
    'removes all ad space on failure (visible=%s)',
    visible => {
      const f = fixture();
      if (visible) {
        f.loaded();
        f.show();
      }
      f.fail();
      expect(f.tree.toJSON()).toBeNull();
      f.show();
      expect(f.tree.toJSON()).toBeNull();
      act(() => f.tree.unmount());
    },
  );

  it('does not reveal in the background or show stale preloaded ads', () => {
    const f = fixture();
    const now = jest.spyOn(Date, 'now').mockReturnValue(1000);
    f.loaded();
    AppState.currentState = 'background';
    f.show();
    expect(StyleSheet.flatten(f.container().props.style).height).toBe(0);
    AppState.currentState = 'active';
    now.mockReturnValue(1000 + 55 * 60_000);
    f.show();
    expect(f.tree.toJSON()).toBeNull();
    act(() => f.tree.unmount());
  });
});
