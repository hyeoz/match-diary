import {BottomTabBarProps} from '@react-navigation/bottom-tabs';
import {useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';

function BottomTab({...props}: BottomTabBarProps) {
  const {state, navigation} = props;

  const [isOpen, setIsOpen] = useState(false);

  console.log(props, 'PROPS');

  return (
    <View style={styles.container}>
      <TouchableOpacity>
        <Text>Calendar</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setIsOpen(!isOpen)}>
        <Text>Home</Text>
      </TouchableOpacity>
      {isOpen && (
        <>
          <TouchableOpacity>
            <Text>Discover</Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Text>Write</Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Text>History</Text>
          </TouchableOpacity>
        </>
      )}
      <TouchableOpacity>
        <Text>More</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  tabWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#eee',
    paddingVertical: 10,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: 'red',
  },
});

export default BottomTab;
