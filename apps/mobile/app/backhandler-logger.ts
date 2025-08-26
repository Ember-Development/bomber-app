import { BackHandler } from 'react-native';

if (__DEV__) {
  (BackHandler as any).removeEventListener = (...args: any[]) => {
    console.warn(
      'Legacy BackHandler.removeEventListener called with:',
      args,
      '\n',
      new Error().stack
    );
  };
}
