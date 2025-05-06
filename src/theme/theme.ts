/**
 * App Theme Configuration
 */

export const colors = {
  primary: {
    main: '#9B5DE5',
    light: '#b387ec',
    dark: '#7e48b7',
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: '#F15BB5',
    light: '#f47dc8',
    dark: '#c44991',
    contrastText: '#FFFFFF',
  },
  accent: {
    blue: '#00BBF9',
    green: '#00F5D4',
  },
  background: {
    default: '#FFFDE7',
    paper: '#FFFFFF',
    dark: '#F5F5F5',
  },
  text: {
    primary: '#333333',
    secondary: '#555555',
    disabled: '#7f8c8d',
    hint: '#999999',
  },
  success: {
    main: '#2ecc71',
    light: '#7ED6A9',
    dark: '#25a25a',
  },
  error: {
    main: '#e74c3c',
    light: '#EF8B80',
    dark: '#c0392b',
  },
  warning: {
    main: '#f39c12',
    light: '#F7BA5E',
    dark: '#d35400',
  },
  info: {
    main: '#3498db',
    light: '#75B9E6',
    dark: '#2980b9',
  },
  grey: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#eeeeee',
    300: '#e0e0e0',
    400: '#bdbdbd',
    500: '#9e9e9e',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },
  divider: 'rgba(0, 0, 0, 0.12)',
};

export const typography = {
  fontFamily: {
    regular: 'System',
    medium: 'System-Medium',
    bold: 'System-Bold',
    semibold: 'System-Semibold',
  },
  fontSize: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    '2xl': 20,
    '3xl': 24,
    '4xl': 30,
    '5xl': 36,
    '6xl': 48,
  },
  lineHeight: {
    xs: 14,
    sm: 16,
    md: 20,
    lg: 24,
    xl: 28,
    '2xl': 32,
    '3xl': 36,
    '4xl': 40,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 40,
  '3xl': 48,
  '4xl': 56,
  '5xl': 64,
  '6xl': 72,
};

export const borderRadius = {
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  '3xl': 24,
  full: 9999,
};

export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
};

export const zIndex = {
  modal: 1000,
  overlay: 900,
  drawer: 800,
  appBar: 700,
  fab: 600,
  speedDial: 500,
  mobileStepper: 400,
  tooltip: 1500,
};

const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  zIndex,
};

export default theme; 