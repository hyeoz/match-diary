import {BottomTabBarProps} from '@react-navigation/bottom-tabs';
import {useState} from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import useBottomTabState from '../store/default';

/* reference: https://dribbble.com/shots/6117913-Tab-Bar-Interaction-XVIII?utm_source=Clipboard_Shot&utm_campaign=Volorf&utm_content=Tab+Bar+Interaction+XVIII&utm_medium=Social_Share&utm_source=Pinterest_Shot&utm_campaign=Volorf&utm_content=Tab+Bar+Interaction+XVIII&utm_medium=Social_Share */

const {width, height} = Dimensions.get('window');

function BottomTab({...props}: BottomTabBarProps) {
  const {state, navigation} = props;

  //   const [isOpen, setIsOpen] = useState(false);
  const {isOpen, update} = useBottomTabState();

  console.log(props, 'PROPS');

  return (
    <View style={styles.container}>
      <View style={styles.tabWrapper}>
        <TouchableOpacity>
          <Text>Calendar</Text>
        </TouchableOpacity>
        {isOpen ? (
          <View style={styles.floatTabWrapper}>
            <TouchableOpacity>
              <Text>Discover</Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Text>Write</Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Text>History</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity onPress={() => update()}>
            <Text>Home</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity>
          <Text>More</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    justifyContent: 'flex-end',
  },
  tabWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'absolute',
    bottom: 0,
    backgroundColor: '#FFF',
    width,
    zIndex: 8,
    borderStyle: 'solid',
    padding: 20,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: 'red',
  },

  floatTabWrapper: {
    position: 'absolute',
    // bottom: 70,
    left: '50%',
  },
});

export default BottomTab;
