import React from 'react';
import { SafeAreaView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { useBottomTabState } from '@stores/default';

function TouchableWrapper({
  children,
  bgColor = '#fff',
}: {
  children: React.JSX.Element | React.JSX.Element[];
  bgColor?: string;
}) {
  const { isOpen, update } = useBottomTabState();
  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView
        style={[
          styles.pageWrapper,
          {
            backgroundColor: bgColor,
          },
        ]}>
        {children}
        {isOpen && (
          <TouchableOpacity
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              top: 0,
              left: 0,
            }}
            onPress={() => {
              isOpen && update();
            }}
          />
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  pageWrapper: {
    flex: 1,
    // backgroundColor: palette.commonColor.greenBg,
    // backgroundColor: '#fff',
  },
});
export default TouchableWrapper;
