import { verification } from 'utils/api';
import { OperationTypeEnum, VerifierItem } from '@portkey-wallet/types/verifier';
import { setCurrentGuardianAction } from '@portkey-wallet/store/store-ca/guardians/actions';
import { handleError, verifyErrorHandler } from '@portkey/did-ui-react';
import { useVerifyToken } from 'hooks/authentication';
import InternalMessage from 'messages/InternalMessage';
import { PortkeyMessageTypes } from 'messages/InternalMessageTypes';
import { useCurrentWalletInfo, useOriginChainId } from '@portkey-wallet/hooks/hooks-ca/wallet';
import { useOnManagerAddressAndQueryResult } from 'hooks/useOnManagerAddressAndQueryResult';
import { useAppDispatch, useLoading, useLoginInfo } from 'store/Provider/hooks';
import { useCallback } from 'react';
import { LoginType } from '@portkey-wallet/types/types-ca/wallet';
import { message } from 'antd';
import { useNavigate } from 'react-router';
import { DefaultChainId } from '@portkey-wallet/constants/constants-ca/network';
import { setRegisterVerifierAction } from 'store/reducers/loginCache/actions';

/**
 * Provides two verification processes
 * @returns [checkAuth, sendVerifyCodeHandler]
 * @desc checkAuth: for social login
 * @desc sendVerifyCodeHandler: for Ordinary email address and mobile phone number
 */
const useCheckVerifier = () => {
  const { setLoading } = useLoading();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loginAccount } = useLoginInfo();
  const originChainId = useOriginChainId();
  const { address: managerAddress } = useCurrentWalletInfo();
  const onManagerAddressAndQueryResult = useOnManagerAddressAndQueryResult('register');
  // Send verifier verification code
  const sendVerifyCodeHandler = useCallback(
    async (verifierItem: VerifierItem) => {
      try {
        if (!loginAccount || !LoginType[loginAccount.loginType] || !loginAccount.guardianAccount)
          return message.error(
            'User registration information is invalid, please fill in the registration method again',
          );
        if (!verifierItem.id || !verifierItem.name) return message.error('Can not get verification');

        setLoading(true);

        const result = await verification.sendVerificationCode({
          params: {
            guardianIdentifier: loginAccount.guardianAccount.replaceAll(' ', ''),
            type: LoginType[loginAccount.loginType],
            verifierId: verifierItem.id,
            chainId: DefaultChainId,
            operationType: OperationTypeEnum.register,
          },
        });
        setLoading(false);
        if (result.verifierSessionId) {
          const _key = `${loginAccount.guardianAccount}&${verifierItem.name}`;
          dispatch(
            setCurrentGuardianAction({
              isLoginAccount: true,
              verifier: verifierItem,
              guardianAccount: loginAccount.guardianAccount,
              guardianType: loginAccount.loginType,
              verifierInfo: {
                sessionId: result.verifierSessionId,
                endPoint: result.endPoint,
              },
              key: _key,
              identifierHash: '',
              salt: '',
            }),
          );
          navigate('/register/verifier-account', { state: 'register' });
        }
      } catch (error: any) {
        setLoading(false);
        console.log(error, 'verifyHandler');
        const _error = verifyErrorHandler(error);
        message.error(_error);
      }
    },
    [dispatch, loginAccount, navigate, setLoading],
  );

  const verifyToken = useVerifyToken();

  const checkAuth = useCallback(
    async (verifierItem: VerifierItem) => {
      try {
        setLoading(true);
        if (!loginAccount?.loginType) throw 'loginType is invalid';
        const rst = await verifyToken(loginAccount.loginType, {
          accessToken: loginAccount.authenticationInfo?.[loginAccount.guardianAccount || ''],
          id: loginAccount.guardianAccount,
          verifierId: verifierItem?.id,
          chainId: originChainId,
          operationType: OperationTypeEnum.register,
        });
        dispatch(
          setRegisterVerifierAction({
            verifierId: verifierItem?.id as string,
            verificationDoc: rst.verificationDoc,
            signature: rst.signature,
          }),
        );
        const res = await InternalMessage.payload(PortkeyMessageTypes.CHECK_WALLET_STATUS).send();
        setLoading(false);
        if (managerAddress && res.data.privateKey) {
          onManagerAddressAndQueryResult(res.data.privateKey, {
            verifierId: verifierItem?.id as string,
            verificationDoc: rst.verificationDoc,
            signature: rst.signature,
          });
        } else {
          navigate('/login/set-pin/register');
        }
      } catch (error) {
        const msg = handleError(error);
        message.error(msg);
        setLoading(false);
      }
    },
    [
      dispatch,
      loginAccount,
      managerAddress,
      navigate,
      onManagerAddressAndQueryResult,
      originChainId,
      setLoading,
      verifyToken,
    ],
  );

  return [checkAuth, sendVerifyCodeHandler];
};

export default useCheckVerifier;
