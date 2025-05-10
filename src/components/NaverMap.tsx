import React, { useRef } from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import WebView from 'react-native-webview';

import { useUserState } from '@/stores/user';

const NaverMap = () => {
  const webViewRef = useRef<WebView>(null);
  const { uniqueId } = useUserState();

  const handleWebViewLoad = () => {
    // 앱에서 웹으로 userId 전달
    const message = JSON.stringify({ userId: uniqueId });
    webViewRef.current?.postMessage(message);
  };

  return (
    <WebView
      style={styles.webview}
      source={{ uri: 'https://hyeoz.today/maps' }}
      onLoadEnd={handleWebViewLoad}
      ref={webViewRef}
      onMessage={event => {
        // NOTE 웹뷰에서 보내는 로깅 확인용
        // console.log('[WebView LOG]:', event.nativeEvent.data);
      }}
      originWhitelist={['*']}
      mixedContentMode="compatibility"
      javaScriptEnabled={true}
      allowsInlineMediaPlayback={true}
      domStorageEnabled={true}
    />
  );
};

const styles = StyleSheet.create({
  webview: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
});

export default NaverMap;
