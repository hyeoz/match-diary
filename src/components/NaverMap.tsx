import React, { useRef } from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import WebView from 'react-native-webview';

import { useUserState } from '@/stores/user';
import Loading from '@/components/Loading';

const NaverMap = () => {
  const webViewRef = useRef<WebView>(null);
  const { uniqueId } = useUserState();

  const handleWebViewLoad = () => {
    // 앱에서 웹으로 userId 전달
    const message = JSON.stringify({ userId: uniqueId });
    webViewRef.current?.postMessage(message);
  };

  if (!uniqueId) {
    return <Loading />;
  }

  return (
    <WebView
      style={styles.webview}
      source={{
        uri: __DEV__
          ? 'http://localhost:5173/maps'
          : 'https://hyeoz.today/maps',
      }}
      onLoadEnd={e => {
        console.log('[WebView LOG END]:', e.nativeEvent);
        handleWebViewLoad();
      }}
      ref={webViewRef}
      onMessage={event => {
        // NOTE 웹뷰에서 보내는 로깅 확인용
        console.log('[WebView LOG]:', event.nativeEvent.data);
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
