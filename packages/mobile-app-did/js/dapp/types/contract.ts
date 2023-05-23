import { ChainId, ChainType, IChainProvider } from './chain';
import { IProvider } from './provider';

export type SendOptions = {
  from?: string;
  gasPrice?: string;
  gas?: number;
  value?: number | string;
  nonce?: number;
  onMethod: 'transactionHash' | 'receipt' | 'confirmation';
};

export type CallOptions = {
  defaultBlock: number | string;
  options?: any;
  callback?: any;
};

export interface ViewResult<T = any> {
  data?: T;
}

export interface SendResult<T = any> extends ViewResult<T> {
  transactionId?: string;
}

export interface IContract {
  callViewMethod<T = any>(functionName: string, paramsOption?: any, callOptions?: CallOptions): Promise<ViewResult<T>>;
  callSendMethod<T = any>(
    functionName: string,
    account: string,
    paramsOption?: any,
    sendOptions?: SendOptions,
  ): Promise<SendResult<T>>;
}

export interface BaseContractOptions {
  chainId: ChainId;
  chainProvider: IChainProvider;
  // contractABI?: AbiItem[];
  contractAddress: string;
  type: ChainType;
  request: IProvider['request'];
}
