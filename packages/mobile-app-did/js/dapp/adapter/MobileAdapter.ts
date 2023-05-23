import {
  IDappRequestWrapper,
  IDappRequestResponse,
  RPCMethodsBase,
  DappInteractionStream,
  ResponseCode,
} from 'dapp/types';
import Operator from 'dapp/types/operator';
import { ResponseGenerator } from 'dapp/utils/Response';
import AuthManager from 'dapp/utils/auth';
import { WebViewMessageEvent } from 'react-native-webview';

export default class MobileAdapter extends Operator {
  public static _ins: MobileAdapter;
  constructor(stream: DappInteractionStream) {
    super(stream);
    MobileAdapter._ins = this;
  }
  protected handleRequest = async (request: IDappRequestWrapper): Promise<IDappRequestResponse> => {
    const {
      params: { method, metaData },
    } = request;
    switch (method) {
      case RPCMethodsBase.ACCOUNTS: {
        if (!metaData) return ResponseGenerator.generateErrorResponse(ResponseCode.INTERNAL_ERROR);
        const isAuth = AuthManager.checkAuth(metaData);
        if (isAuth) {
        }
      }
    }
    return ResponseGenerator.generateErrorResponse(ResponseCode.UNIMPLEMENTED);
  };
  public handleReactNativeRequest = (event: WebViewMessageEvent) => {
    this.handleRequestMessage(event.nativeEvent.data);
  };
}
