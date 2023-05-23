import { Duplex } from 'stream';
import { IDappRequestWrapper } from './request';
import { CentralEthereumEvents } from './event';

export abstract class DappInteractionStream extends Duplex {
  constructor() {
    super();
  }

  /**
   * this method is not implemented yet.
   */
  // createSubStream = (_name: String) => {};

  /**
   *
   * @param message the message content you want to send to the dapp
   */
  createMessageEvent = (message: string) => {
    this.push({ event: CentralEthereumEvents.MESSAGE, msg: message });
  };

  /**
   * this method is abstract, so it must be implemented by the subclass.
   * @example in React Native Webview, you can override this method like this(for provider):
   * ```
   * _write=(chunk,encoding,callback)=>{
   *  window.ReactNativeWebView.postMessage(chunk);
   * callback();
   * }
   * ```
   * @example and in React Native, you may override this method like this:
   * ```
   * _write=(chunk, encoding, callback)=>{
   * const {eventId, params} = chunk;
   * webViewRef.injectJavaScript(`window.portkey.emit(${eventId},JSON.stringify(params))`);
   * callback();
   * }
   * ```
   */
  abstract _write(
    chunk: IDappRequestWrapper,
    encoding: BufferEncoding,
    callback: (error?: Error | null | undefined) => void,
  ): void;
}
