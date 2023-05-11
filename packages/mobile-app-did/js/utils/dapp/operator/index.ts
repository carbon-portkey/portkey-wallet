import WebView, { WebViewMessageEvent } from 'react-native-webview';
import {
  CentralEthereumEvents,
  EthereumEventsDeprecated,
  ResponseCode,
  RequestMessage,
  RequestResponse,
  RPCMethods,
  RPCMethodsBase,
  RPCMethodsDemo,
  RPCMethodsUnimplemented,
  WalletPermissions,
} from '../behaviour';
import handlerJSDowngrade from '../webpageHandler';
import DappOperationManager from '../manager';
import { DappAuthManager } from '../manager/auth';
import inpage from '../../../../../../packages/dapp-provider/src/inpage_provider';
export default class DappOperator {
  public url?: string;
  private static ins: DappOperator = new DappOperator();
  private webviewRef?: WebView;

  public static getIns(): DappOperator {
    return DappOperator.ins;
  }

  public init(webviewRef: WebView): void {
    this.webviewRef = webviewRef;
    this.injectHandlerToWebview();
  }

  private constructor(webviewRef?: WebView) {
    this.webviewRef = webviewRef;
  }

  private injectHandlerToWebview = (): void => {
    let generatedJS = '';
    try {
      generatedJS = inpage;
    } catch (e) {}
    this.executeJS(generatedJS?.length > 0 ? generatedJS : handlerJSDowngrade);
  };

  public handleDappMessage = async ({ nativeEvent }: WebViewMessageEvent) => {
    const { data } = nativeEvent;
    console.log(decodeURIComponent(data), 'handleDappMessage');
    try {
      const {
        payload: { method, data: requestData },
        eventId,
      } = (JSON.parse(decodeURIComponent(data)) as RequestMessage) || {};
      console.log(`method: ${method}, data: ${requestData}`);
      await this.handleRequest(method, requestData, eventId);
    } catch (e) {
      console.error('error when try to parse object:', data);
    }
  };

  public publishPresetEvent = (event: CentralEthereumEvents, data: RequestResponse): void => {
    this.eventSideEffect(event, data);
    this.emitEventToWebview(event, data);
  };

  public publishEventCallback = (eventId: string, data: RequestResponse): void => {
    this.executeJS(`window.ethereum?.emit('${eventId}', ${data ? JSON.stringify(data) : '{}'})`);
  };

  // for user that uses deprecated event name
  public eventSideEffect = (event: CentralEthereumEvents, data: RequestResponse): void => {
    switch (event) {
      case CentralEthereumEvents.CONNECTED:
        this.emitEventToWebview(EthereumEventsDeprecated.NETWORK_CHANGED, data);
        break;
      case CentralEthereumEvents.CHAIN_CHANGED:
        this.emitEventToWebview(EthereumEventsDeprecated.CHAIN_ID_CHANGED, data);
        this.emitEventToWebview(EthereumEventsDeprecated.NETWORK_CHANGED, data);
        break;
      case CentralEthereumEvents.DISCONNECTED:
        this.emitEventToWebview(EthereumEventsDeprecated.CLOSE, data);
        break;
      default:
        break;
    }
  };

  public emitEventToWebview = (
    event: CentralEthereumEvents | EthereumEventsDeprecated,
    data: RequestResponse,
  ): void => {
    this.executeJS(`window.ethereum?.emit('${event}', ${data ? JSON.stringify(data) : '{}'})`);
  };

  protected handleRequest = async (method: RPCMethods, data: any, eventId: string) => {
    const hostName = getHostName(this.url ?? '');
    const manager: DappOperationManager = DappOperationManager.getIns();
    try {
      switch (method) {
        case RPCMethodsDemo.HELLO_PORTKEY: {
          this.publishEventCallback(eventId, await DappOperationManager.handleGreetings());
          break;
        }
        case RPCMethodsBase.CHAIN_ID: {
          const { chainId } = await DappOperationManager.getIns().getChainId();
          this.publishEventCallback(
            eventId,
            !(chainId.length > 0)
              ? {
                  code: ResponseCode.INTERNAL_ERROR,
                  msg: 'operation failed',
                }
              : {
                  code: ResponseCode.SUCCESS,
                  data: chainId,
                },
          );
          break;
        }

        case RPCMethodsBase.ACCOUNTS:
        case RPCMethodsBase.REQUEST_ACCOUNTS: {
          const authSuccess = async () => {
            const { address } = await DappOperationManager.getIns().getAccountAddress();
            this.publishEventCallback(eventId, {
              code: ResponseCode.SUCCESS,
              data: [address],
            });
          };
          try {
            const authResult = await DappAuthManager.getIns().checkPermission({ hostName });
            if (authResult) {
              authSuccess();
              return;
            }
            const permissionResult = await manager.requestPermissions([WalletPermissions.ACCOUNTS], { hostName });
            if (permissionResult.grantedPermissions.includes(WalletPermissions.ACCOUNTS)) {
              authSuccess();
              return;
            }
          } catch (e) {}
          this.publishEventCallback(eventId, {
            code: ResponseCode.USER_DENIED,
            msg: 'user rejected the request',
          });
          break;
        }
        case RPCMethodsBase.GET_PUBLIC_KEY:
        case RPCMethodsBase.DECRYPT: {
          manager.authenticationCall(eventId, { hostName }, async () => this.handleAuthRequest(eventId, method));
          break;
        }
        case RPCMethodsUnimplemented.ADD_CHAIN:
        case RPCMethodsUnimplemented.SWITCH_CHAIN:
        case RPCMethodsUnimplemented.REQUEST_PERMISSIONS:
        case RPCMethodsUnimplemented.GET_PERMISSIONS:
        case RPCMethodsUnimplemented.NET_VERSION: {
          this.publishEventCallback(eventId, {
            code: ResponseCode.UNIMPLEMENTED,
            msg: 'this method is not implemented',
          });
          break;
        }
        default: {
          this.publishEventCallback(eventId, {
            code: ResponseCode.UNKNOWN_METHOD,
            msg: 'unknown method',
          });
        }
      }
    } catch (e) {
      console.error(`error when handleRequest, method:${method}, data:${data}, eventId:${eventId}, error:${e}`);
      this.publishEventCallback(eventId, {
        code: ResponseCode.INTERNAL_ERROR,
        msg: 'internal error',
      });
    }
  };

  // not fully implemented
  private handleAuthRequest = async (eventId: string, method: RPCMethodsBase) => {
    this.publishEventCallback(eventId, {
      code: ResponseCode.UNIMPLEMENTED,
      msg: 'this method is not implemented',
    });
  };

  private executeJS = (js: string): void => {
    this.webviewRef?.injectJavaScript(js);
  };
}

const getHostName = (url: string) => {
  if (!url) return '';
  const reg = /^http(s)?:\/\/(.*?)\//;
  return reg.exec(url)?.[2] ?? '';
};
