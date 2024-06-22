import React from 'react';
import { FlatList, ListRenderItem, Text, View } from 'react-native';

import TouchableWrapper from '@components/TouchableWrapper';

const dummy = [
  {
    nickname: '혜오즈',
    content: 'fkfkffkfkfkkfkf',
    date: '2024.06.22 18:55',
  },
];

function Contact() {
  return (
    <TouchableWrapper>
      <View>
        <FlatList
          data={dummy}
          renderItem={item => <ContactItems {...item} />}
        />
      </View>
    </TouchableWrapper>
  );
}

const ContactItems = ({
  nickname,
}: ListRenderItem<{ nickname: string; content: string; date: string }>) => {
  return (
    <View>
      <Text>{nickname}</Text>
    </View>
  );
};

export default Contact;
