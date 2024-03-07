import { NativeModules, requireNativeComponent } from 'react-native';

export interface PortkeyAppNativeModules {
  AppLifeCycleModule: AppLifeCycleModule;
}

export interface AppLifeCycleModule {
  /**
   * Calling this method will restart the app perfectly, only available on Android.
   */
  restartApp: () => void;
}

const PortkeyAppNativeModules = NativeModules as PortkeyAppNativeModules;

export const AppLifeCycleModule = PortkeyAppNativeModules.AppLifeCycleModule;

// used to improve performance
export const ComposeQrCodeView = requireNativeComponent<ComposeQrCodeViewProps>('ComposeQrCodeView');

export interface ComposeQrCodeViewProps {
  content: string;
  size: number;
}
