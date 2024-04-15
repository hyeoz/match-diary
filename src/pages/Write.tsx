import { Alert, Text, TouchableOpacity } from 'react-native';

import TouchableWrapper from '../components/TouchableWrapper';

function Write() {
  // TODO 화면 터치 감지를 통해 바텀탭 플로팅을 숨기기 위해 SafeAreaView 를 TouchableWithoutFeedback 으로 감싸도 되는지?
  return (
    <TouchableWrapper>
      <Text>Write</Text>
      <TouchableOpacity
        onPress={() => {
          Alert.alert('BUTTON WORKS?');
        }}>
        <Text>BUTTON</Text>
      </TouchableOpacity>
    </TouchableWrapper>
  );
}

// export default withTouchable(<Write />);
export default Write;
