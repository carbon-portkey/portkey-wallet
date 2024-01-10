import { request } from '@portkey-wallet/api/api-did';
import {
  GetTransferLimitResult,
  useCheckTransferLimit,
  useGetTransferLimit,
} from '@portkey-wallet/hooks/hooks-ca/security';
import { useCurrentWallet, useCurrentWalletInfo, useOriginChainId } from '@portkey-wallet/hooks/hooks-ca/wallet';
import { handleErrorMessage } from '@portkey-wallet/utils';
import { Image, message } from 'antd';
import {
  SecurityVulnerabilityTip,
  SecurityVulnerabilityTitle,
  SecurityAccelerateTitle,
  SecurityAccelerateContent,
  SecurityAccelerateErrorTip,
} from 'constants/security';
import {
  useDailyTransferLimitModal,
  useSingleTransferLimitModal,
} from 'pages/WalletSecurity/PaymentSecurity/hooks/useLimitModal';
import CustomModal from 'pages/components/CustomModal';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { ExtensionContractBasic } from 'utils/sandboxUtil/ExtensionContractBasic';
import { useCurrentChain } from '@portkey-wallet/hooks/hooks-ca/chainList';
import { useLoading } from 'store/Provider/hooks';
import { ChainId } from '@portkey/provider-types';
import { ICheckLimitBusiness, ITransferLimitRouteState } from '@portkey-wallet/types/types-ca/paymentSecurity';
import { handleGuardian } from 'utils/sandboxUtil/handleGuardian';
import { getAelfTxResult } from '@portkey-wallet/utils/aelf';
import { CheckSecurityResult, getAccelerateGuardianTxId } from '@portkey-wallet/utils/securityTest';
import { useCurrentNetworkInfo } from '@portkey-wallet/hooks/hooks-ca/network';
import { getCurrentChainInfo } from 'utils/lib/SWGetReduxStore';
import CustomSvg from 'components/CustomSvg';
import getSeed from 'utils/getSeed';

export const useCheckSecurity = () => {
  const wallet = useCurrentWalletInfo();
  const { setLoading } = useLoading();
  const addGuardiansModal = useAddGuardiansModal();
  const synchronizingModal = useSynchronizingModal();

  return useCallback(
    async (targetChainId: ChainId, onCancel?: () => void): Promise<boolean> => {
      try {
        setLoading(true);
        const res: CheckSecurityResult = await request.security.balanceCheck({
          params: { caHash: wallet?.caHash || '', checkTransferSafeChainId: targetChainId },
        });
        setLoading(false);

        if (res.isTransferSafe) return true;

        if (wallet.originChainId === targetChainId) {
          if (res.isOriginChainSafe) return true;
          addGuardiansModal(targetChainId, onCancel);
          return false;
        } else {
          if (res.isSynchronizing && res.isOriginChainSafe) {
            let _txId;
            if (Array.isArray(res.accelerateGuardians)) {
              const _accelerateGuardian = res.accelerateGuardians.find(
                (item) => item.transactionId && item.chainId === wallet.originChainId,
              );
              _txId = _accelerateGuardian?.transactionId;
            }
            synchronizingModal({
              accelerateChainId: targetChainId,
              accelerateGuardiansTxId: _txId,
            });
            return false;
          }
          addGuardiansModal(targetChainId, onCancel);
          return false;
        }
      } catch (error) {
        setLoading(false);
        const msg = handleErrorMessage(error, 'Balance Check Error');
        throw message.error(msg);
      }
    },
    [addGuardiansModal, setLoading, synchronizingModal, wallet?.caHash, wallet.originChainId],
  );
};

export function useSynchronizingModal() {
  const { t } = useTranslation();
  const { walletInfo } = useCurrentWallet();
  const originChainId = useOriginChainId();
  const originChainInfo = useCurrentChain(originChainId);
  const currentNetwork = useCurrentNetworkInfo();
  const { setLoading } = useLoading();

  const handleSyncGuardian = useCallback(
    async ({
      accelerateGuardiansTxId,
      accelerateChainId,
    }: {
      accelerateGuardiansTxId: string;
      accelerateChainId: ChainId;
    }) => {
      try {
        const { privateKey } = await getSeed();
        const accelerateChainInfo = await getCurrentChainInfo(accelerateChainId);
        if (!accelerateChainInfo?.endPoint || !originChainInfo?.endPoint || !privateKey)
          return message.error(SecurityAccelerateErrorTip);
        const result = await getAelfTxResult(originChainInfo?.endPoint, accelerateGuardiansTxId);
        if (result.Status !== 'MINED') return message.error(SecurityAccelerateErrorTip);
        const params = JSON.parse(result.Transaction.Params);
        const res = await handleGuardian({
          rpcUrl: accelerateChainInfo?.endPoint as string,
          chainType: currentNetwork.walletType,
          address: accelerateChainInfo?.caContractAddress as string,
          privateKey,
          paramsOption: {
            method: 'AddGuardian',
            params: {
              caHash: walletInfo?.caHash,
              guardianToAdd: params.guardianToAdd,
              guardiansApproved: params.guardiansApproved,
            },
          },
        });
        message.success('Guardian added');
        console.log('===handleGuardian accelerate res', res);
      } catch (error: any) {
        console.log('===handleGuardian accelerate error', error);
        message.error(SecurityAccelerateErrorTip);
      }
    },
    [currentNetwork.walletType, originChainInfo?.endPoint, walletInfo?.caHash],
  );

  const checkAccelerateIsReady = useCallback(
    async ({
      accelerateGuardiansTxId,
      accelerateChainId,
    }: {
      accelerateGuardiansTxId?: string;
      accelerateChainId: ChainId;
    }) => {
      try {
        setLoading(true);
        if (accelerateGuardiansTxId) {
          await handleSyncGuardian({ accelerateChainId, accelerateGuardiansTxId });
        } else {
          if (!walletInfo?.caHash) return message.error(SecurityAccelerateErrorTip);
          const res = await getAccelerateGuardianTxId(walletInfo?.caHash, accelerateChainId, originChainId);
          if (res.isSafe) {
            message.success('Guardian added');
          } else if (res.accelerateGuardian?.transactionId) {
            await handleSyncGuardian({
              accelerateChainId,
              accelerateGuardiansTxId: res.accelerateGuardian.transactionId,
            });
          } else {
            message.error(SecurityAccelerateErrorTip);
          }
        }
      } catch (error: any) {
        message.error(SecurityAccelerateErrorTip);
        console.log('===checkAccelerateIsReady error', error);
      } finally {
        setLoading(false);
      }
    },
    [handleSyncGuardian, originChainId, setLoading, walletInfo?.caHash],
  );

  return useCallback(
    ({
      accelerateChainId,
      accelerateGuardiansTxId,
    }: {
      accelerateChainId: ChainId;
      accelerateGuardiansTxId?: string;
    }) => {
      const modal = CustomModal({
        type: 'info',
        content: (
          <div className="security-modal">
            <CustomSvg type="Close2" onClick={() => modal.destroy()} />
            <Image
              width={180}
              height={108}
              src="assets/images/securityTip.png"
              className="modal-logo"
              preview={false}
            />
            <div className="modal-title">{SecurityAccelerateTitle}</div>
            <div>{SecurityAccelerateContent}</div>
          </div>
        ),
        okText: t('OK'),
        onOk: () => {
          modal.destroy();
          checkAccelerateIsReady({ accelerateChainId, accelerateGuardiansTxId });
        },
      });
    },
    [checkAccelerateIsReady, t],
  );
}

export function useAddGuardiansModal() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return useCallback(
    (accelerateChainId: ChainId, onCancel?: () => void) => {
      const modal = CustomModal({
        type: 'confirm',
        content: (
          <div className="security-modal">
            <Image
              width={180}
              height={108}
              src="assets/images/securityTip.png"
              className="modal-logo"
              preview={false}
            />
            <div className="modal-title">{SecurityVulnerabilityTitle}</div>
            <div>{SecurityVulnerabilityTip}</div>
          </div>
        ),
        cancelText: t('Not Now'),
        okText: t('Add Guardians'),
        onCancel: () => {
          onCancel?.();
          modal.destroy();
        },
        onOk: () => navigate('/setting/guardians', { state: { accelerateChainId } }),
      });
    },
    [navigate, t],
  );
}

export interface ICheckLimitParams {
  chainId: ChainId;
  symbol: string;
  decimals: number | string;
  amount: string;
  from: ICheckLimitBusiness;
}

export const useCheckLimit = (targetChainId: ChainId) => {
  const currentChain = useCurrentChain(targetChainId);
  const checkTransferLimit = useCheckTransferLimit();
  const dailyTransferLimitModal = useDailyTransferLimitModal();
  const singleTransferLimitModal = useSingleTransferLimitModal();

  return useCallback(
    async ({ chainId, symbol, decimals, amount, from }: ICheckLimitParams): Promise<boolean | object> => {
      const { privateKey } = await getSeed();
      if (!currentChain?.endPoint || !privateKey) return message.error('Invalid user information, please check');

      const caContract = new ExtensionContractBasic({
        rpcUrl: currentChain?.endPoint,
        contractAddress: currentChain?.caContractAddress,
        privateKey: privateKey,
      });

      const limitRes = await checkTransferLimit({
        caContract,
        symbol,
        decimals,
        amount,
      });

      const settingParams: ITransferLimitRouteState = {
        chainId: chainId,
        symbol,
        singleLimit: limitRes?.singleBalance.toFixed() || '',
        dailyLimit: limitRes?.dailyLimit.toFixed() || '',
        restricted: !limitRes?.dailyLimit.eq(-1),
        decimals,
        from,
      };
      if (limitRes?.isSingleLimited) {
        return singleTransferLimitModal(settingParams);
      }
      if (limitRes?.isDailyLimited) {
        return dailyTransferLimitModal(settingParams);
      }
      return true;
    },
    [
      checkTransferLimit,
      currentChain?.caContractAddress,
      currentChain?.endPoint,
      dailyTransferLimitModal,
      singleTransferLimitModal,
    ],
  );
};

export const useGetTransferLimitWithContract = (targetChainId: ChainId) => {
  const currentChain = useCurrentChain(targetChainId);
  const getTransferLimit = useGetTransferLimit();

  return useCallback(
    async ({ symbol }: { symbol: string }): Promise<GetTransferLimitResult | undefined> => {
      const { privateKey } = await getSeed();
      if (!currentChain?.endPoint || !privateKey) return;

      const caContract = new ExtensionContractBasic({
        rpcUrl: currentChain?.endPoint,
        contractAddress: currentChain?.caContractAddress,
        privateKey: privateKey,
      });

      return await getTransferLimit({ caContract, symbol });
    },
    [currentChain?.caContractAddress, currentChain?.endPoint, getTransferLimit],
  );
};
