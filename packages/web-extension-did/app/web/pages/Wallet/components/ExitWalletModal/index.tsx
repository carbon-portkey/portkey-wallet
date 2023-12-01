import { Button, message } from 'antd';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import CommonModal from 'components/CommonModal';
import './index.less';
import { useCurrentWallet, useCurrentWalletInfo, useOriginChainId } from '@portkey-wallet/hooks/hooks-ca/wallet';
import { useLoading, useUserInfo } from 'store/Provider/hooks';
import { useCurrentChain } from '@portkey-wallet/hooks/hooks-ca/chainList';
import { removeManager } from 'utils/sandboxUtil/removeManager';
import { useCurrentNetworkInfo } from '@portkey-wallet/hooks/hooks-ca/network';
import { handleErrorMessage } from '@portkey-wallet/utils';
import useLogOut from 'hooks/useLogout';
import { DEVICE_TYPE } from 'constants/index';
import aes from '@portkey-wallet/utils/aes';

interface ExitWalletModalProps {
  open: boolean;
  onCancel: () => void;
}

export default function ExitWalletModal({ open, onCancel }: ExitWalletModalProps) {
  const { t } = useTranslation();
  const { walletInfo } = useCurrentWallet();
  const wallet = useCurrentWalletInfo();
  const { passwordSeed } = useUserInfo();
  const originChainId = useOriginChainId();

  const currentChain = useCurrentChain(originChainId);
  const { setLoading } = useLoading();
  const currentNetwork = useCurrentNetworkInfo();
  const logout = useLogOut();

  const onConfirm = useCallback(async () => {
    try {
      if (!passwordSeed) throw 'Missing pin';
      const privateKey = aes.decrypt(walletInfo.AESEncryptPrivateKey, passwordSeed);
      if (!currentChain?.endPoint || !privateKey) return message.error('error');
      setLoading(true, 'Signing out of Portkey...');
      const result = await removeManager({
        rpcUrl: currentChain.endPoint,
        chainType: currentNetwork.walletType,
        address: currentChain.caContractAddress,
        privateKey,
        paramsOption: {
          caHash: wallet?.caHash as string,
          managerInfo: {
            address: wallet.address,
            extraData: `${DEVICE_TYPE},${Date.now()}`,
          },
        },
      });
      console.log('removeManager', 'removeManager==result', result);
      logout();
      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      const _error = handleErrorMessage(error, 'Something error');
      message.error(_error);
    }
  }, [
    currentChain,
    currentNetwork.walletType,
    logout,
    passwordSeed,
    setLoading,
    wallet.address,
    wallet?.caHash,
    walletInfo.AESEncryptPrivateKey,
  ]);

  return (
    <CommonModal
      className="exist-wallet"
      closable={false}
      width={320}
      open={open}
      title={t('Are you sure you want to exit your account?')}
      footer={
        <div className="">
          <Button type="primary" onClick={onConfirm}>
            {t('Exit Anyway')}
          </Button>
          <Button type="default" className="exist-wallet-btn-cancel" onClick={onCancel}>
            {t('Cancel')}
          </Button>
        </div>
      }>
      <div className="text-center modal-content">
        {/* <div className="tip-title">{t('Are you sure you want to exit your account?')}</div> */}
        <div>
          {t('After you exit, your assets remain in your account and you can access them through social recovery.')}
        </div>
      </div>
    </CommonModal>
  );
}
