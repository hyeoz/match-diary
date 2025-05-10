import TouchableWrapper from '@/components/TouchableWrapper';
import React from 'react';
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import { useFontStyle } from '@/style/hooks';
import BannerAds from '@/components/ads/BannerAds';
import NaverMap from '@/components/NaverMap';

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
                fontWeight: '700',
                fontSize: 18,
              },
              'bold',
            ),
            { marginTop: 16 },
          ]}>
          내 직관 지도 보기
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
