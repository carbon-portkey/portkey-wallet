import { EventMessage } from './event';
import { IDappRequestResponse, IDappRequestWrapper, IDappResoponseWrapper } from './request';
import { DappInteractionStream } from './stream';

export default abstract class Operator {
  /**
   * we use _stream to communicate with the dapp
   * Operator does not need to know how to communicate with the dapp
   */
  private _stream: DappInteractionStream;

  constructor(stream: DappInteractionStream) {
    this._stream = stream;
  }

  /**
   * use this method to handle the message from the dapp
   * @param message the message from the dapp
   */
  protected handleRequestMessage = async (message: string) => {
    if (!(message?.length > 0)) {
      this._stream.createMessageEvent('invalid message');
      return;
    }
    try {
      const request = JSON.parse(message) as IDappRequestWrapper;
      const { eventId } = request || {};
      const result = await this.handleRequest(request);
      this._stream.push({ eventId, params: result } as IDappResoponseWrapper);
    } catch (e) {
      console.error('error when parsing message:' + message, 'error:', e);
      this._stream.createMessageEvent('operation failed:' + e?.message);
    }
  };

  /**
   * implement this method to handle the request from the dapp
   * @param request the request from the dapp
   */
  protected abstract handleRequest(request: IDappRequestWrapper): Promise<IDappRequestResponse>;

  /**
   * expose it to your server code, it creates an event to the dapp
   * @param event the event data you want to publish to the dapp
   */
  public publishEvent = (event: EventMessage): void => {
    this._stream.push(JSON.stringify(event));
  };
}
