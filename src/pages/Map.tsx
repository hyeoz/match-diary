import TouchableWrapper from '@/components/TouchableWrapper';
import React, { useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { useFontStyle } from '@/style/hooks';
import BannerAds from '@/components/ads/BannerAds';
import NaverMap, { NaverMapRef } from '@/components/NaverMap';
import { palette } from '@/style/palette';
import { Refresh } from '@/assets/svg';

export default function Map() {
  const fontStyle = useFontStyle;
  const mapRef = useRef<NaverMapRef>(null);

  return (
    <TouchableWrapper>
      <View style={styles.titleContainer}>
        <BannerAds adsType="map" />
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 8,
          }}>
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
          {/* <TouchableOpacity
            style={styles.refreshButton}
            onPress={() => {
              if (mapRef.current?.reload) {
                mapRef.current.reload();
              }
            }}>
            <Refresh width={16} height={16} color={palette.commonColor.green} />
          </TouchableOpacity> */}
        </View>

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
          지도를 움직여 내 직관 지도를 확인해요! 모든 구장 정복까지 🔥
        </Text>
      </View>
      <View style={styles.mapContainer}>
        <NaverMap ref={mapRef} />
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
  refreshButton: {
    marginTop: 16,
  },
  mapContainer: {
    flex: 1,
    width: '100%',
  },
  map: {
    width: '100%',
    height: Dimensions.get('window').height - 200,
    borderWidth: 1,
    borderColor: palette.greyColor.gray2,
  },
});
