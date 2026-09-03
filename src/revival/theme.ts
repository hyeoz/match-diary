import { Platform, TextStyle } from 'react-native';

export const colors = {
  canvas: '#FBF7EF',
  paper: '#FFFCF7',
  paperStrong: '#FFFFFF',
  ink: '#172235',
  muted: '#77756F',
  line: '#E9E3D8',
  green: '#68B83E',
  greenDark: '#438429',
  greenSoft: '#DDECB6',
  coral: '#E83F3A',
  yellow: '#FFF4A8',
  blue: '#2C69B0',
  shadow: '#332D25',
  white: '#FFFFFF',
  danger: '#E43E37',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const radius = {
  sm: 8,
  md: 14,
  lg: 20,
  pill: 999,
};

export const font = (
  weight: 'light' | 'medium' | 'bold' = 'medium',
): TextStyle => ({
  fontFamily: Platform.select({
    android: `KBO Dia Gothic_${weight}`,
    ios: `KBO-Dia-Gothic-${weight}`,
  }),
});

export const handwriting: TextStyle = {
  fontFamily: 'UhBee Seulvely',
};

export const cardShadow = Platform.select({
  android: { elevation: 3 },
  ios: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 9,
  },
});
