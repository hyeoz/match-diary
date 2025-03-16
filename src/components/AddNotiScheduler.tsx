import { View, Text, TouchableOpacity, Modal } from 'react-native';
import React, { useState } from 'react';

// TODO 노티 예약 추가 컴포넌트
export default function AddNotiScheduler() {
  const [visibleModal, setVisibleModal] = useState(false);
  return (
    <>
      <TouchableOpacity
        onPress={() => {
          setVisibleModal(true);
        }}>
        <Text>+ 직관 알림 예약하기</Text>
      </TouchableOpacity>
      <Modal animationType="slide" visible={visibleModal}>
        <View>
          <Text></Text>
        </View>
      </Modal>
    </>
  );
}
