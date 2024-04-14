import {
  SafeAreaView,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';

import useBottomTabState from '../store/default';

function TouchableWrapper({
  children,
}: {
  children: React.JSX.Element | React.JSX.Element[];
}) {
  const { isOpen, update } = useBottomTabState();
  return (
    <TouchableWithoutFeedback
      onPress={() => isOpen && update()}
      // style={styles.wrapper}
    >
      <SafeAreaView style={styles.pageWrapper}>{children}</SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  pageWrapper: {
    flex: 1,
  },
});
export default TouchableWrapper;
