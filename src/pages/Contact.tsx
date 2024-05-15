import {
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import TouchableWrapper from '@components/TouchableWrapper';
import { palette } from '@/style/palette';
import { useMyState } from '@/stores/default';
import { INSTAGRAM_LINK, INSTAGRAM_WEB_LINK } from '@/utils/STATIC_DATA';

function Contact() {
  const { team } = useMyState();

  const onPressInstagram = async () => {
    const supported = await Linking.canOpenURL(INSTAGRAM_LINK);

    if (supported) {
      Linking.openURL(INSTAGRAM_LINK);
    } else {
      Linking.openURL(INSTAGRAM_WEB_LINK);
    }
  };

  return (
    <TouchableWrapper bgColor={palette.teamColor[team]}>
      <View style={styles.wrapper}>
        <Text style={styles.headerText}>Contact</Text>
        <Text style={styles.headerText}>Us!</Text>
        <Text style={styles.defaultText}>연락주세용ㅇ;ㅣ~~~</Text>
      </View>
      <View
        style={{
          justifyContent: 'center',
          flexDirection: 'row',
        }}>
        <TouchableOpacity
          style={styles.buttonWrapper}
          onPress={onPressInstagram}>
          <View>
            <Text>BUTTON</Text>
          </View>
        </TouchableOpacity>
      </View>
    </TouchableWrapper>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    height: '50%',
    justifyContent: 'center',
    padding: 16,
  },
  headerText: {
    fontSize: 64,
    fontFamily: 'KBO-Dia-Gothic-bold',
    color: '#fff',
  },
  defaultText: {
    fontSize: 20,
    fontFamily: 'KBO-Dia-Gothic-bold',
    color: '#fff',
  },
  buttonWrapper: {
    borderRadius: 6,
    borderWidth: 1,
    width: '50%',
    padding: 16,
    backgroundColor: '#fff',
  },
});

export default Contact;
