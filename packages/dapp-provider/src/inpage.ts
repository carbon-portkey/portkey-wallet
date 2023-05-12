import DappOperationHandler, { EthereumEvents } from '../../mobile-app-did/js/utils/dapp/behaviour';

declare const window: {
  ethereum?: DappOperationHandler;
  addEventListener: (event: string, listener: (...args: any[]) => void, options?: { once?: boolean }) => void;
  removeEventListener: (event: string, listener: (...args: any[]) => void) => void;
  ReactNativeWebView: {
    postMessage: (msg?: string) => void;
  };
};

class MyHandler implements DappOperationHandler {
  isPortkey = true;
  isConnected = () => true;
  on = (event: EthereumEvents, listener: (...args: any[]) => void, once = false) => {
    window.addEventListener(event, listener, once ? { once: true } : undefined);
    return this;
  };
  once = (event: EthereumEvents, listener: (...args: any[]) => void) => this.on(event, listener, true);
  addListener = (event: EthereumEvents, listener: (...args: any[]) => void) => this.on(event, listener);
  removeListener = (event: EthereumEvents, listener: (...args: any[]) => void) => {
    window.removeEventListener(event, listener);
    return this;
  };
  request = (payload: { method: string; data?: any }) => {
    const eventId = this.randomId();
    window.ReactNativeWebView.postMessage(JSON.stringify({ payload, eventId }));
    return new Promise((resolve, reject) => {
      // setTimeout(()=>{reject({code:2,msg:'timeout'})},maxWaitTime);
      window.addEventListener(
        eventId,
        e => {
          const { code, data } = e.detail || {};
          if (code === 0) {
            console.log('request() resolved, data: ', data);
            resolve(data);
            return;
          }
          reject(e?.detail ?? {});
        },
        { once: true },
      );
    });
  };
  randomId = (max = 999999) => new Date().getTime() + '_' + Math.floor(Math.random() * max);
  log = (msg: string, data?: any) => {
    this.request({ method: 'log', data: { msg, data } });
  };
}

const init = () => {
  if (window) {
    const handler = new MyHandler();
    window.ethereum = handler;
  }
};

try {
  init();
} catch (e) {
  console.error('error when init dapp-provider: ', e);
}
