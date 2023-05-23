import { DappInteractionStream } from 'dapp/types';
import MobileAdapter from './MobileAdapter';

export default class AdapterFactory {
  getOrCreateAdapter(stream?: DappInteractionStream): MobileAdapter {
    return stream ? new MobileAdapter(stream) : MobileAdapter._ins;
  }
}
