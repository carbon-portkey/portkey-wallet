import { NativeModules, requireNativeComponent } from 'react-native';
import { CommonComposeQrCodeViewProps } from './composable/hooks';

export interface PortkeyAppNativeModules {
  AppLifeCycleModule: AppLifeCycleModule;
}

export interface AppLifeCycleModule {
  /**
   * Calling this method will restart the app perfectly, only available on Android.
   */
  restartApp: () => void;

  /**
   * Report the page life cycle to native, this will prevent Jetpack Compose from being disposed accidentally.
   */
  reportPageLifeCycle: (pageIdentifier: string, lifeCycle: AppLifeCycle) => void;
}

export enum AppLifeCycle {
  ACTIVE = 'active',
  DISPOSE = 'dispose',
}

const PortkeyAppNativeModules = NativeModules as PortkeyAppNativeModules;

export const AppLifeCycleModule = PortkeyAppNativeModules.AppLifeCycleModule;

const requireComposableNativeComponent = <T>(componentName: string) => {
  return requireNativeComponent<T & CommonComposeQrCodeViewProps>(componentName);
};

// used to improve performance
export const ComposeQrCodeView = requireComposableNativeComponent<ComposeQrCodeViewProps>('ComposeQrCodeView');

export interface ComposeQrCodeViewProps {
  content: string;
  size: number;
}
