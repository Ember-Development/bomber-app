import { BackHandler } from 'react-native';

if (__DEV__) {
  const originalRemoveEventListener = BackHandler.removeEventListener;

  (BackHandler as any).removeEventListener = (
    eventName: 'hardwareBackPress',
    handler: () => boolean | null | undefined
  ) => {
    console.warn('Legacy BackHandler.removeEventListener called with:', [
      eventName,
      handler,
    ]);
    // Call the original method to properly remove the event listener
    return originalRemoveEventListener.call(BackHandler, eventName, handler);
  };
}
