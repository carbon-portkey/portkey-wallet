import { useCallback, useEffect, useMemo } from 'react';
import InternalMessage from 'messages/InternalMessage';
import InternalMessageTypes from 'messages/InternalMessageTypes';
import aes from '@portkey-wallet/utils/aes';
import { useInitIM, useJoinGroupChannel } from '@portkey-wallet/hooks/hooks-ca/im';
import { useCurrentWallet } from '@portkey-wallet/hooks/hooks-ca/wallet';
import { getWallet } from '@portkey-wallet/utils/aelf';
import { useIsChatShow } from '@portkey-wallet/hooks/hooks-ca/cms';
import im from '@portkey-wallet/im';
import { LinkPortkeyType } from 'types/im';
import { useThrottleCallback } from '@portkey-wallet/hooks';
import { parseLinkPortkeyUrl } from 'utils/imChat';
import { message } from 'antd';
import { useNavigate } from 'react-router';
import { useLoading, useWalletInfo } from 'store/Provider/hooks';

export default function useInit() {
  const isShowChat = useIsChatShow();
  const initIm = useInitIM();
  const { walletInfo } = useCurrentWallet();
  const init = useCallback(async () => {
    const getSeedResult = await InternalMessage.payload(InternalMessageTypes.GET_SEED).send();
    const pin = getSeedResult.data.privateKey;
    if (!pin) return;

    const privateKey = aes.decrypt(walletInfo.AESEncryptPrivateKey, pin);
    const account = getWallet(privateKey || '');
    if (!account || !walletInfo.caHash) return;

    try {
      await initIm(account, walletInfo.caHash);
    } catch (error) {
      console.log('im init error', error);
    }
  }, [initIm, walletInfo.AESEncryptPrivateKey, walletInfo.caHash]);

  useEffect(() => {
    isShowChat ? init() : im.destroy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isShowChat]);
}

export interface IClickUrlProps {
  fromChannelUuid?: string;
  isGroup?: boolean;
}

export const useClickUrl = ({ fromChannelUuid = '', isGroup = false }: IClickUrlProps) => {
  const isShowChat = useIsChatShow();
  const clickChatUrl = useClickChatUrl({ fromChannelUuid, isGroup });

  return useThrottleCallback((url: string) => {
    const WWW_URL_PATTERN = /^www\./i;
    if (WWW_URL_PATTERN.test(url)) url = `https://${url}`;
    const { id, type } = parseLinkPortkeyUrl(url);
    if (id && isShowChat) {
      clickChatUrl({ id, type });
    } else {
      const openWinder = window.open(url, '_blank');
      if (openWinder) {
        openWinder.opener = null;
      }
    }
  }, []);
};

export interface IClickChatUrlProps {
  id: string;
  type: LinkPortkeyType;
}

export function useClickChatUrl({ fromChannelUuid = '', isGroup = false }: IClickUrlProps) {
  const isShowChat = useIsChatShow();
  const { userId: myPortkeyId } = useWalletInfo();
  const navigate = useNavigate();
  const joinGroupChannel = useJoinGroupChannel();
  const fromType = useMemo(() => (isGroup ? 'chat-box-group' : 'chat-box'), [isGroup]);
  const { setLoading } = useLoading();

  return useCallback(
    async ({ id, type }: IClickChatUrlProps) => {
      if (!isShowChat) {
        message.error('Failed to chat');
        return;
      }
      if (type === 'addContact') {
        if (id === myPortkeyId) {
          navigate('/setting/wallet/wallet-name', { state: { from: fromType, channelUuid: fromChannelUuid } });
        } else {
          navigate('/setting/contacts/view', {
            state: { portkeyId: id, from: fromType, channelUuid: fromChannelUuid },
          });
        }
        return;
      }
      if (type === 'addGroup') {
        try {
          setLoading(true);
          await joinGroupChannel(id);
          navigate(`/chat-box-group/${id}`);
        } catch (error: any) {
          if (`${error?.code}` === '13302') {
            navigate(`/chat-box-group/${id}`);
          } else {
            message.error(`This group doesn't exist. Please check the Portkey group ID/QR code before you try again.`);
            console.log('Failed to join error', error);
          }
        } finally {
          setLoading(false);
        }
      }
    },
    [isShowChat, myPortkeyId, navigate, fromType, fromChannelUuid, setLoading, joinGroupChannel],
  );
}
