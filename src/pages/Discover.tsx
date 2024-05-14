import { Text } from 'react-native';

import TouchableWrapper from '@components/TouchableWrapper';
import NaverMapView from 'react-native-nmap';

function Discover() {
  return (
    <TouchableWrapper>
      <NaverMapView style={{ width: '100%', height: '100%' }} />
      <Text>Discover</Text>
    </TouchableWrapper>
  );
}

export default Discover;
