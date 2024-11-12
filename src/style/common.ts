import { IMAGE_HEIGHT, IMAGE_WIDTH } from '@/utils/STATIC_DATA';
import { Dimensions, Platform, StyleSheet } from 'react-native';

const { width } = Dimensions.get('screen');

export const modalStyles = StyleSheet.create({
  header: {
    borderBottomWidth: 1,
    paddingBottom: 10,
    top: 0,
    left: 0,
    position: 'absolute',
    width: width - 48,
  },
  wrapper: {
    flex: 1,
    marginHorizontal: 24,
    marginBottom: 60,
    backgroundColor: '#fff',
    ...Platform.select({
      android: {
        marginTop: 40,
      },
      ios: {
        marginTop: 80,
      },
    }),
  },
  contentWrapper: {
    top: 48,
    // height: height - 190,
  },
  input: {
    width: width - 48,
    height: 120,
    borderWidth: 1,
    borderRadius: 4,
    borderColor: '#888',
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    // paddingTop: 10,
    fontFamily: 'KBO-Dia-Gothic-mediumd',
  },
  emptyImageWrapper: {
    width: width - 48,
    height: (IMAGE_HEIGHT * (width - 48)) / IMAGE_WIDTH,
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
    paddingTop: 48,
  },
  button: {
    width: width / 2 - 24 - 8,
    padding: 16,
    borderRadius: 8,
  },
  labelText: {
    fontSize: 18,
    marginBottom: 8,
    fontWeight: '600',
    fontFamily: 'KBO-Dia-Gothic-bold',
  },
  buttonText: {
    color: 'black',
    fontSize: 16,
    textAlign: 'center',
    fontFamily: 'KBO-Dia-Gothic-bold',
  },
});
