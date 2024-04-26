import {
  SafeAreaView,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';

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
    <TouchableWithoutFeedback
      onPress={() => isOpen && update()}
      // style={styles.wrapper}
    >
      <SafeAreaView
        style={[
          styles.pageWrapper,
          {
            backgroundColor: bgColor,
          },
        ]}>
        {children}
      </SafeAreaView>
    </TouchableWithoutFeedback>
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
