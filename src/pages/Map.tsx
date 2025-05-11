import TouchableWrapper from '@/components/TouchableWrapper';
import React from 'react';
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import { useFontStyle } from '@/style/hooks';
import BannerAds from '@/components/ads/BannerAds';
import NaverMap from '@/components/NaverMap';
import { palette } from '@/style/palette';

export default function Map() {
  const fontStyle = useFontStyle;

  return (
    <TouchableWrapper>
      <View style={styles.titleContainer}>
        <BannerAds adsType="map" />
        <Text
          style={[
            fontStyle(
              {
                textAlign: 'center',
                fontSize: 18,
              },
              'bold',
            ),
            { marginTop: 16 },
          ]}>
          내 직관 지도 보기
        </Text>
        <Text
          style={[
            fontStyle(
              {
                textAlign: 'center',
                fontSize: 14,
                color: palette.greyColor.gray8,
              },
              'light',
            ),
            { marginTop: 8 },
          ]}>
          내 직관 지도를 확인할 수 있어요! 지도를 움직여보세요.
        </Text>
      </View>
      <View style={styles.mapContainer}>
        <NaverMap />
      </View>
    </TouchableWrapper>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    marginTop: 20,
    paddingVertical: 10,
    marginBottom: 24,
  },
  mapContainer: {
    flex: 1,
    width: '100%',
  },
  map: {
    width: '100%',
    height: Dimensions.get('window').height - 200,
  },
});
