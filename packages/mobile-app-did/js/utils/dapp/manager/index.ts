import { useCurrentChainList } from '@portkey-wallet/hooks/hooks-ca/chainList';
import { ResponseCode, RequestResponse, WalletPermissions, Web3OperationAdapter } from '../behaviour';
import WebsiteAuthentication from '../behaviour/auth';
import DappOperator from '../operator';
import { DappAuthManager } from './auth';
import { getWallet, getWalletAddress, getWalletInfo } from 'utils/redux';
import aes from '@portkey-wallet/utils/aes';
import { Alert } from 'react-native';

const unauthenticatedResponse: RequestResponse = {
  code: ResponseCode.UNAUTHENTICATED,
  msg: 'unauthenticated, please connect to wallet first',
};

export default class DappOperationManager implements Web3OperationAdapter {
  private static ins: DappOperationManager = new DappOperationManager();

  public static getIns(): DappOperationManager {
    return DappOperationManager.ins;
  }

  // only used for test
  public static handleGreetings = async (): Promise<RequestResponse> => {
    return {
      code: 0,
      data: 'greetings from portkey',
    };
  };

  public authenticationCall = async (eventId: string, auth: WebsiteAuthentication, callback: () => void) =>
    auth?.hostName?.length > 0 && (await DappAuthManager.getIns().checkPermission(auth))
      ? callback()
      : DappOperator.getIns().publishEventCallback(eventId, unauthenticatedResponse);

  public getChainId = async (): Promise<{ chainId: string }> => {
    return { chainId: '0x99' };
  };

  private getAelfChainIdFromWallet = (): string => {
    const wallet = getWallet();
    return wallet?.walletInfo?.caInfo?.[wallet?.currentNetwork]?.originChainId ?? 'unknown';
  };

  public getAccountAddress = async (): Promise<{ address: string }> => {
    return { address: getWalletAddress() ?? '' };
  };

  public decryptMessage = async ({
    message,
    account,
  }: {
    message: string;
    account: string;
  }): Promise<{ decryptedMessage: string }> => {
    const msg = aes.decrypt(message, account);
    return msg ? { decryptedMessage: msg } : { decryptedMessage: '' };
  };

  public requestPermissions = (permissions: Array<WalletPermissions>, websiteInfo: WebsiteAuthentication) => {
    const { hostName } = websiteInfo;
    return new Promise<{ grantedPermissions: Array<WalletPermissions> }>((resolve, reject) => {
      Alert.alert(
        `Permission Request`,
        `This website (${hostName}) is requesting the following permissions:\n${this.handlePermissionsDiscription(
          permissions,
        )}`,
        [
          {
            text: 'Reject',
            onPress: () => {
              reject('permission denied');
            },
            style: 'cancel',
          },
          {
            text: 'Accept',
            onPress: () => {
              DappAuthManager.getIns().onHostPermitted(websiteInfo);
              resolve({ grantedPermissions: permissions });
            },
            style: 'cancel',
          },
        ],
      );
    });
  };

  private handlePermissionsDiscription = (permissions: Array<WalletPermissions>): string => {
    return permissions
      .map(permission => {
        switch (permission) {
          case WalletPermissions.ACCOUNTS:
            return `get your current wallet address`;
        }
      })
      .join(';');
  };
}
