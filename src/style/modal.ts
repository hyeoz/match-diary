import { Dimensions, Platform, StyleSheet } from 'react-native';

import { IMAGE_HEIGHT, IMAGE_WIDTH, MINIMUM_HEIGHT } from '@/utils/STATIC_DATA';
import { palette } from './palette';

const { width, height } = Dimensions.get('screen');

export const modalStyles = StyleSheet.create({
  header: {
    borderBottomWidth: 1,
    paddingBottom: 10,
    top: height < MINIMUM_HEIGHT ? -32 : 0,
    left: 0,
    position: 'absolute',
    width: width - 48,
  },
  uploadText: {
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 18,
    color: '#000',
    ...Platform.select({
      android: {
        fontFamily: 'KBO Dia Gothic_bold',
      },
      ios: {
        fontFamily: 'KBO-Dia-Gothic-bold',
      },
    }),
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
    top: height < MINIMUM_HEIGHT ? 16 : 48,
  },
  input: {
    width: width - (height < MINIMUM_HEIGHT ? 80 : 48),
    height: height < MINIMUM_HEIGHT ? 100 : 120,
    borderWidth: 1,
    borderRadius: 4,
    borderColor: palette.greyColor.gray8,
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    ...Platform.select({
      android: {
        fontFamily: 'KBO Dia Gothic_medium',
      },
      ios: {
        fontFamily: 'KBO-Dia-Gothic-medium',
      },
    }),
  },
  emptyImageWrapper: {
    width: width - (height < MINIMUM_HEIGHT ? 80 : 48),
    height:
      (IMAGE_HEIGHT * (width - (height < MINIMUM_HEIGHT ? 80 : 48))) /
      IMAGE_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: palette.greyColor.gray8,
    borderStyle: 'dashed',
    borderRadius: 8,
  },
  buttonWrapper: {
    flexDirection: 'row',
    gap: 16,
    width: '100%',
    paddingTop: height < MINIMUM_HEIGHT ? 8 : 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    width: width / 2 - (height < MINIMUM_HEIGHT ? 40 : 24) - 8,
    padding: 16,
    borderRadius: 8,
  },
  labelText: {
    fontSize: 18,
    marginBottom: 8,
    fontWeight: '600',
    ...Platform.select({
      android: {
        fontFamily: 'KBO Dia Gothic_bold',
      },
      ios: {
        fontFamily: 'KBO-Dia-Gothic-bold',
      },
    }),
  },
  buttonText: {
    color: 'black',
    fontSize: 16,
    textAlign: 'center',
    ...Platform.select({
      android: {
        fontFamily: 'KBO Dia Gothic_bold',
      },
      ios: {
        fontFamily: 'KBO-Dia-Gothic-bold',
      },
    }),
  },
});
