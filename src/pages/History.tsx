import { ScrollView, Text } from 'react-native';

import TouchableWrapper from '@components/TouchableWrapper';
import Photos from '@assets/svg/photos.svg';

/* TODO
  - 본인이 쓴 글 무한스크롤로 보여주는 화면 구현

*/

function History() {
  return (
    <TouchableWrapper>
      <ScrollView></ScrollView>
    </TouchableWrapper>
  );
}

export default History;
