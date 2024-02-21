import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useAppDispatch } from 'store/hooks';
import { setCredentials } from 'store/user/actions';
import { useUser } from 'hooks/store';
import PageContainer from 'components/PageContainer';
import { DigitInputInterface } from 'components/DigitInput';
import { PIN_SIZE } from '@portkey-wallet/constants/misc';
import { checkPin } from 'utils/redux';
import { useNavigation } from '@react-navigation/native';
import navigationService from 'utils/navigationService';
import { useCurrentWalletInfo, useOriginChainId } from '@portkey-wallet/hooks/hooks-ca/wallet';
import Loading from 'components/Loading';
import useBiometricsReady from 'hooks/useBiometrics';
import { usePreventHardwareBack } from '@portkey-wallet/hooks/mobile';
import { TimerResult } from 'utils/wallet';
import { setCAInfo } from '@portkey-wallet/store/store-ca/wallet/actions';
import { CAInfo } from '@portkey-wallet/types/types-ca/wallet';
import { VerificationType } from '@portkey-wallet/types/verifier';
import useEffectOnce from 'hooks/useEffectOnce';
import PinContainer from 'components/PinContainer';
import { useIntervalGetResult, useOnResultFail } from 'hooks/login';
import { getSecureStoreItem } from '@portkey-wallet/utils/mobile/biometric';
import { useThrottleCallback } from '@portkey-wallet/hooks';
import ActionSheet from 'components/ActionSheet';
import { isUserBiometricsError } from 'utils/biometrics';
import GStyles from 'assets/theme/GStyles';
import useLatestIsFocusedRef from 'hooks/useLatestIsFocusedRef';
import { VERIFY_INVALID_TIME } from '@portkey-wallet/constants/constants-ca/wallet';
import { useErrorMessage } from '@portkey-wallet/hooks/hooks-ca/misc';
export default function SecurityLock() {
  const { biometrics } = useUser();
  const biometricsReady = useBiometricsReady();
  const [caInfo, setStateCAInfo] = useState<CAInfo>();
  const appStateRef = useRef<AppStateStatus>();
  const isFocusedRef = useLatestIsFocusedRef();
  usePreventHardwareBack();
  const timer = useRef<TimerResult>();
  const onResultFail = useOnResultFail();
  const digitInput = useRef<DigitInputInterface>();
  const { managerInfo, address, caHash } = useCurrentWalletInfo();
  const dispatch = useAppDispatch();
  const isSyncCAInfo = useMemo(() => address && managerInfo && !caHash, [address, caHash, managerInfo]);
  const navigation = useNavigation();
  const onIntervalGetResult = useIntervalGetResult();
  const originChainId = useOriginChainId();
  const locked = useRef<boolean>(false);
  useEffect(() => {
    if (isSyncCAInfo) {
      setTimeout(() => {
        if (managerInfo) {
          timer.current?.remove();
          timer.current = onIntervalGetResult({
            managerInfo: managerInfo,
            onPass: setStateCAInfo,
            onFail: message =>
              onResultFail(message, managerInfo?.verificationType === VerificationType.communityRecovery, true),
          });
        }
      }, 100);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSyncCAInfo]);
  const handleRouter = useThrottleCallback(
    (pinInput: string) => {
      Loading.hide();
      if (!isFocusedRef.current) return;
      locked.current = true;
      if (!managerInfo) return navigationService.reset('LoginPortkey');
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        if (biometrics === undefined && biometricsReady) {
          navigationService.reset('SetBiometrics', { pin: pinInput });
        } else {
          navigationService.reset('Tab');
        }
      }
    },
    [biometrics, biometricsReady, isFocusedRef, managerInfo, navigation],
    2000,
  );
  const handlePassword = useCallback(
    (pwd: string) => {
      dispatch(setCredentials({ pin: pwd }));
      if (!managerInfo) {
        if (address) handleRouter(pwd);
        return;
      }
      if (isSyncCAInfo && !caInfo) {
        timer.current?.remove();
        Loading.show();
        timer.current = onIntervalGetResult({
          managerInfo: managerInfo,
          onPass: (info: CAInfo) => {
            dispatch(
              setCAInfo({
                caInfo: info,
                pin: pwd,
                chainId: originChainId,
              }),
            );
            Loading.hide();
            handleRouter(pwd);
          },
          onFail: message =>
            onResultFail(message, managerInfo?.verificationType === VerificationType.communityRecovery, true),
        });
        return;
      } else if (caInfo) {
        dispatch(
          setCAInfo({
            caInfo,
            pin: pwd,
            chainId: originChainId,
          }),
        );
      }
      handleRouter(pwd);
    },
    [
      address,
      caInfo,
      dispatch,
      handleRouter,
      isSyncCAInfo,
      managerInfo,
      onIntervalGetResult,
      onResultFail,
      originChainId,
    ],
  );
  const verifyBiometrics = useThrottleCallback(
    async () => {
      if (!biometrics) return;
      try {
        const securePassword = await getSecureStoreItem('Pin');
        if (!securePassword) throw new Error('No password');
        handlePassword(securePassword);
      } catch (error: any) {
        if (!isUserBiometricsError(error)) {
          ActionSheet.alert({
            message: `Biometric authentication expired.Please re-enable it.`,
            message2: 'After you are logged in, you can set it up in My - Account Setting - Biometric Authentication.',
            buttons: [{ title: 'I Know', type: 'primary' }],
          });
        }
      }
    },
    [biometrics, handlePassword],
    2000,
  );
  const handleAppStateChange = useCallback(
    (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active' && appStateRef.current !== 'active') {
        verifyBiometrics();
        appStateRef.current = nextAppState;
      }
    },
    [verifyBiometrics],
  );
  useEffectOnce(() => {
    if (!navigation.canGoBack()) verifyBiometrics();
  });
  useEffect(() => {
    const listener = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      timer.current?.remove();
      listener.remove();
    };
  }, [handleAppStateChange]);

  const { error: textError, setError: setTextError } = useErrorMessage();
  const onChangeText = useCallback(
    (enterPin: string) => {
      if (enterPin.length === PIN_SIZE) {
        if (!checkPin(enterPin)) {
          digitInput.current?.reset();
          setTextError('Incorrect Pin', VERIFY_INVALID_TIME);
          return;
        }
        handlePassword(enterPin);
      } else if (textError.isError) {
        setTextError();
      }
    },
    [textError.isError, handlePassword, setTextError],
  );
  return (
    <PageContainer hideHeader containerStyles={GStyles.flex1} scrollViewProps={{ disabled: true }}>
      <PinContainer
        ref={digitInput}
        title="Enter Pin"
        onChangeText={onChangeText}
        errorMessage={textError.errorMsg}
        isBiometrics={biometrics && biometricsReady}
        onBiometricsPress={verifyBiometrics}
      />
    </PageContainer>
  );
}
