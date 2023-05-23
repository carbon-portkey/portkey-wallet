export enum CentralEthereumEvents {
  CONNECTED = 'connected',
  MESSAGE = 'message',
  DISCONNECTED = 'disconnected',
  ACCOUNT_CHANGED = 'accountChanged',
  CHAIN_CHANGED = 'chainChanged',
  ERROR = 'error',
}

export interface EventMessage {
  event: CentralEthereumEvents;
  params: any;
}

export type DappEvents = CentralEthereumEvents;

export type EventId = string;

export type EventResponse = any;
