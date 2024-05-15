import { Text } from 'react-native';

import TouchableWrapper from '@components/TouchableWrapper';
import NaverMapView from 'react-native-nmap';

function Contact() {
  return (
    <TouchableWrapper>
      <NaverMapView style={{ width: '100%', height: '100%' }} />
      <Text>Contact</Text>
    </TouchableWrapper>
  );
}

export default Contact;
