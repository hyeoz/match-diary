import React from 'react';
import { StyleSheet } from 'react-native';
import renderer from 'react-test-renderer';

import AdBanner from '../src/revival/ads/AdBanner';

describe('AdBanner', () => {
  it('does not reserve bottom space before an ad is actually visible', () => {
    const tree = renderer.create(<AdBanner />);
    const container = tree.root.findByProps({ testID: 'ad-banner-container' });

    expect(StyleSheet.flatten(container.props.style)).toMatchObject({
      height: 0,
      opacity: 0,
      overflow: 'hidden',
    });
  });
});
