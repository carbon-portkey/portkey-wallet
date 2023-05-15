import { EventEmitter } from 'stream';
import { init, MyHandler } from './inpage';

class MockedWindow extends EventEmitter {
  addEventListener = (eventName, callback) => this.emit(eventName, callback);
  removeListener = (eventName, callback) => this.removeListener(eventName, callback);
  ReactNativeWebView = {
    postMessage: data => console.log(JSON.stringify(data)),
  };
}
const window = new MockedWindow();

describe(
  'inpage-provider',
  it('inject well', () => {
    return expect(() => init()).not.toThrow();
  }),
);

describe(
  'inpage-provider',
  it('can handle message', done => {
    const handler = new MyHandler();
    handler.on('message', done);
    handler.emit('message', { data: { type: 'test' } });
  }),
);
