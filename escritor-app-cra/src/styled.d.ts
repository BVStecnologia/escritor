import 'styled-components';

// Definição do tema usado no EditorPage
interface ColorPalette {
  background: {
    main: string;
    paper: string;
    sidebar: string;
    header: string;
    light: string;
    dark: string;
    gradient: string;
  };
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  secondaryLight: string;
  secondaryDark: string;
  accent: string;
  accentLight: string;
  accentDark: string;
  warning: string;
  danger: string;
  error: string;
  success: string;
  dark: string;
  light: string;
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    light: string;
  };
  gray: {
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };
  white: string;
  black: string;
}

interface ShadowSystem {
  sm: string;
  md: string;
  lg: string;
  xl: string;
  inner: string;
}

interface GradientSystem {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  highlight: string;
  subtle: string;
}

interface FontSystem {
  body: string;
  heading: string;
  mono: string;
}

interface FontSizeSystem {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  '4xl': string;
  '5xl': string;
  '6xl': string;
}

interface FontWeightSystem {
  light: number;
  normal: number;
  medium: number;
  semibold: number;
  bold: number;
  extrabold: number;
}

interface LineHeightSystem {
  none: number;
  tight: number;
  snug: number;
  normal: number;
  relaxed: number;
  loose: number;
}

interface SpaceSystem {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  '4xl': string;
}

interface RadiiSystem {
  none: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  full: string;
}

interface BreakpointSystem {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
}

interface TransitionSystem {
  fast: string;
  normal: string;
  slow: string;
}

interface ZIndexSystem {
  hide: number;
  auto: string;
  base: number;
  docked: number;
  dropdown: number;
  sticky: number;
  banner: number;
  overlay: number;
  modal: number;
  popover: number;
  toast: number;
  tooltip: number;
}

export interface CustomTheme {
  colors: ColorPalette;
  shadows: ShadowSystem;
  gradients: GradientSystem;
  fonts: FontSystem;
  fontSizes: FontSizeSystem;
  fontWeights: FontWeightSystem;
  lineHeights: LineHeightSystem;
  space: SpaceSystem;
  radii: RadiiSystem;
  breakpoints: BreakpointSystem;
  transitions: TransitionSystem;
  zIndices: ZIndexSystem;
}

declare module 'styled-components' {
  export interface DefaultTheme extends CustomTheme {}
}