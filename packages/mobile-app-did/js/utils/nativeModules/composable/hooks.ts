import { useEffectOnce } from '@portkey-wallet/hooks';
import { DeviceEventEmitter, NativeModules, Platform } from 'react-native';
import { useCallback, useRef, useState } from 'react';

const dealWithDisposal = (pageIdentifier: string) => {
  if (Platform.OS !== 'android') return;
  NativeModules.AppLifeCycleModule.reportPageLifeCycle(pageIdentifier, 'dispose');
};

export const useComposableLifetime = (identifier?: string) => {
  const [pageIdentifier] = useState<string>(generateUniqueLifetimeIdentifier(identifier));

  useEffectOnce(() => {
    return () => {
      dealWithDisposal(pageIdentifier);
    };
  });
  return { pageIdentifier };
};

export const useComposableForceUpdate = () => {
  const { forceUpdate, fakeState } = useForceUpdate();
  useEffectOnce(() => {
    const listener = DeviceEventEmitter.addListener('composableForceUpdate', forceUpdate);
    return () => {
      listener.remove();
    };
  });
  return { fakeState };
};

export const useForceUpdate = () => {
  const [fakeState, setFakeState] = useState(0);
  const updateHandler = useRef<any | null>(null);
  const forceUpdate = useCallback(() => {
    console.log('forceUpdate');
    updateHandler?.current && clearInterval(updateHandler.current);
    updateHandler.current = setInterval(() => {
      console.log('update called');
      setFakeState(state => state + 1);
    }, 500);
  }, []);
  useEffectOnce(() => {
    return () => {
      clearInterval(updateHandler.current);
    };
  });
  return { forceUpdate, fakeState };
};

export const generateUniqueLifetimeIdentifier = (seed?: string) => {
  return `${seed || 'compose'}_${Date.now()}${Math.random()}`.replace('.', '');
};

export interface CommonComposeQrCodeViewProps {
  pageIdentifier: string;
  fakeState: any;
}
