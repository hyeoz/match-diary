import {
  Alert,
  Dimensions,
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import TouchableWrapper from '../components/TouchableWrapper';
import Add from '../assets/svg/add.svg';
import { useEffect, useState } from 'react';
import { palette } from '../style/palette';

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
  const [isVisible, setIsVisible] = useState(false);
  const [image, setImage] = useState<any>(); // TODO
  const [memo, setMemo] = useState('');

  useEffect(() => {
    if (!isVisible) {
      setImage(null);
      setMemo('');
    }
  }, [isVisible]);

  return (
    <TouchableWrapper>
      <View style={styles.wrapper}>
        <TouchableOpacity
          onPress={() => setIsVisible(true)}
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

      <Modal animationType="slide" visible={isVisible}>
        <View style={modalStyles.wrapper}>
          <View style={modalStyles.header}>
            <Text
              style={{
                textAlign: 'center',
                fontWeight: '700',
                fontSize: 18,
              }}>
              업로드
            </Text>
          </View>
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
            {/* NOTE content */}
            <View style={modalStyles.contentWrapper}>
              {/* ANCHOR 이미지 */}
              {image ? (
                <View>
                  <Image source={image} />
                </View>
              ) : (
                // TODO 클릭 시 native 갤러리 호출
                <View>
                  <Text style={modalStyles.labelText}>대표 이미지</Text>
                  <View style={modalStyles.emptyImageWrapper}>
                    <Add width={32} height={32} color={'#888'} />
                  </View>
                </View>
              )}

              {/* ANCHOR 텍스트 */}
              <View>
                <Text style={modalStyles.labelText}>내용</Text>
                <TextInput
                  multiline
                  maxLength={200}
                  value={memo}
                  onChangeText={value => setMemo(value)}
                  placeholder="사진과 함께 기록할 내용을 적어주세요!"
                  style={modalStyles.input}
                />
                <Text
                  style={{
                    textAlign: 'right',
                    color: '#999',
                    marginTop: 4,
                  }}>
                  {memo.length} / 200
                </Text>
              </View>
            </View>

            {/* NOTE 버튼 */}
            <View style={modalStyles.buttonWrapper}>
              <TouchableOpacity
                onPress={() => setIsVisible(false)}
                style={[
                  modalStyles.button,
                  {
                    borderWidth: 1,
                    borderColor: '#c8c8c8',
                  },
                ]}>
                <View>
                  <Text style={modalStyles.buttonText}>Close</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {}}
                style={[
                  modalStyles.button,
                  {
                    backgroundColor: palette.commonColor.green,
                  },
                ]}>
                <View>
                  <Text
                    style={[
                      modalStyles.buttonText,
                      {
                        color: '#fff',
                      },
                    ]}>
                    Save
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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

const modalStyles = StyleSheet.create({
  header: {
    borderBottomWidth: 1,
    paddingVertical: 10,
    marginBottom: 24,
  },
  wrapper: {
    flex: 1,
    marginHorizontal: 24,
    marginTop: 80,
    marginBottom: 60,
    backgroundColor: '#fff',
  },
  contentWrapper: {
    gap: 16,
  },
  input: {
    width: width - 48,
    height: 200,
    borderWidth: 1,
    borderRadius: 4,
    borderColor: '#888',
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  emptyImageWrapper: {
    width: width - 48,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#888',
    borderStyle: 'dashed',
    borderRadius: 8,
  },
  buttonWrapper: {
    flexDirection: 'row',
    gap: 16,
    width: '100%',
  },
  button: {
    width: width / 2 - 24 - 8,
    padding: 16,
    borderRadius: 8,
  },
  labelText: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '600',
  },
  buttonText: {
    color: 'black',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default Write;
