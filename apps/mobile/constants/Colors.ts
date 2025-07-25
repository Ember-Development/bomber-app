/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { EventType } from '@bomber-app/database';

const tintColorLight = '#000000';
const tintColorDark = '#fff';

export const GlobalColors = {
  white: '#ffffff',
  black: '#000000',
  purple: '#202988',
  blue: '#5AA5FF',
  red: '#FF0505',
  dark: '#282A29',
  gray: '#a1a1a1',
  bomber: '#57a4ff',
  gold: '#ffb257', // it's a bit orangey but this is complement of bomber blue!
};

export const EventColors = {
  // ive never seen [] used in this way but it's used here to turn the enum into a parseable string! weird!
  [EventType.PRACTICE]: GlobalColors.purple,
  [EventType.GLOBAL]: GlobalColors.gold,
  [EventType.TOURNAMENT]: GlobalColors.bomber,
};

export const Colors = {
  light: {
    text: '#f6f6f6',
    button: '#282A29',
    buttonText: '#f6f6f6',
    border: '#282A29',
    secondaryText: '#a1a1a1',
    background: '#282A29',
    tint: tintColorLight,
    icon: '#222222',
    component: '#ffffff',
    tabIconDefault: '#222222',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#f6f6f6',
    button: '#434644',
    buttonText: '#f6f6f6',
    border: '#ffffff',
    secondaryText: '#666666',
    background: '#282A29',
    tint: tintColorDark,
    icon: '#f6f6f6',
    component: '#434644',
    tabIconDefault: '#f6f6f6',
    tabIconSelected: tintColorDark,
  },
} as const;
