export interface IDappRequestWrapper {
  eventId: string;
  params: IDappRequestArguments;
}

export interface IDappRequestArguments {
  method: RPCMethods;
  metaData?: PageMetaData;
  payload?: any;
}

export interface PageMetaData {
  hostname: string;
  avatar?: string;
}

export interface IDappResoponseWrapper {
  eventId: string;
  params: IDappRequestResponse;
}

export interface IDappRequestResponse {
  code: ResponseCode;
  data?: any;
  msg?: string;
}

export enum ResponseCode {
  ERROR_IN_PARAMS = -1,
  UNKNOWN_METHOD = -2,
  UNIMPLEMENTED = -3,
  UNAUTHENTICATED = -4,
  SUCCESS = 0,
  INTERNAL_ERROR = 1,
  TIMEOUT = 2,
  USER_DENIED = 3,
}
export type ResponseCodeType = keyof typeof ResponseCode;
export const ResponseMessagePreset: { [key in ResponseCodeType]: string } = {
  SUCCESS: 'success',
  ERROR_IN_PARAMS: 'please check your params.',
  UNKNOWN_METHOD: 'you are using an unknown method name, please check again.',
  UNIMPLEMENTED: 'this method is not implemented yet.',
  UNAUTHENTICATED: `you are not authenticated, use request({method:'accounts'}) first.`,
  INTERNAL_ERROR: 'server internal error.',
  TIMEOUT: 'request timeout.',
  USER_DENIED: 'user denied.',
};

export enum RPCMethodsBase {
  ACCOUNTS = 'accounts',
  REQUEST_ACCOUNTS = 'requestAccounts',
  DECRYPT = 'decrypt',
  CHAIN_ID = 'chainId',
  GET_PUBLIC_KEY = 'getEncryptionPublicKey',
  SEND_TRANSACTION = 'sendTransaction',
}

export enum RPCMethodsUnimplemented {
  ADD_CHAIN = 'wallet_addEthereumChain',
  SWITCH_CHAIN = 'wallet_switchEthereumChain',
  REQUEST_PERMISSIONS = 'wallet_requestPermissions',
  GET_PERMISSIONS = 'wallet_getPermissions',
  NET_VERSION = 'net_version',
}

export type RPCMethods = RPCMethodsBase | RPCMethodsUnimplemented;
