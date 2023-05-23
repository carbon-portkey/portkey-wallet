import { PageMetaData } from 'dapp/types';

export interface DappState {
  connectedHosts: Array<PageMetaData>;
}

export const dappInitialState: DappState = {
  connectedHosts: [],
};
