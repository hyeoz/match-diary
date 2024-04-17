import {
  Alert,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import TouchableWrapper from '../components/TouchableWrapper';
import Add from '../assets/svg/add.svg';

const { width, height } = Dimensions.get('window');

/* TODO
  - 이미지는 한 장만 업로드 가능
  - 텍스트는 최대 200자
  - 업로드한 컨텐츠는 스토리지 관리
    - 이미지는 어떻게 관리하는지?
  - 위치정보로 경기정보 불러오기
    - 마이페이지에서 마이팀 설정 시 승/패 정보도
    - 경기정보 들어갈 위치 대략 잡기
*/

function Write() {
  return (
    <TouchableWrapper>
      <View style={styles.wrapper}>
        <TouchableOpacity
          onPress={() => {
            Alert.alert('BUTTON WORKS?');
          }}
          style={{
            width: '65%',
            height: '45%',
          }}>
          <View style={styles.addButton}>
            <Add width={60} height={60} color={'#aaa'} />
            <Text style={styles.addText}>
              여기를 눌러{'\n'}직관기록을 추가해주세요!
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </TouchableWrapper>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    flex: 1,
    gap: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.2,
    shadowRadius: 16,
  },
  addText: {
    textAlign: 'center',
    fontSize: 14,
  },
});

export default Write;
