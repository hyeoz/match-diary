import { Platform, TextStyle } from 'react-native';

const useFontStyle = (
  extraStyles: TextStyle = {},
  fontFamilyType: 'bold' | 'medium' | 'light' = 'medium',
): TextStyle => {
  return {
    fontFamily: Platform.select({
      android: `KBO Dia Gothic_${fontFamilyType}`,
      ios: `KBO-Dia-Gothic-${fontFamilyType}`,
    }),
    ...extraStyles,
  };
};

export { useFontStyle };
