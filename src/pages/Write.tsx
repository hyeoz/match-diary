import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
} from 'react-native';
import useBottomTabState from '../store/default';

function Write() {
  const {isOpen, update} = useBottomTabState();
  // TODO 화면 터치 감지를 통해 바텀탭 플로팅을 숨기기 위해 SafeAreaView 를 TouchableWithoutFeedback 으로 감싸도 되는지?
  return (
    <TouchableWithoutFeedback onPress={() => isOpen && update()}>
      <SafeAreaView style={styles.pageWrapper}>
        <Text>Write</Text>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  pageWrapper: {
    flex: 1,
  },
});

export default Write;
