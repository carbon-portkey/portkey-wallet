import { PageMetaData } from 'dapp/types';
import { addConnectedHost, removeConnectedHost } from 'store/dapp/action';
import { getDappState, getDispatch } from 'utils/redux';

export default class AuthManager {
  public static checkAuth(metaData: PageMetaData): boolean {
    return getDappState().connectedHosts.some(host => host.hostname === metaData.hostname);
  }
  public static addAuth(metaData: PageMetaData) {
    getDispatch()(addConnectedHost(metaData));
  }

  public static removeAuth(...list: Array<string | PageMetaData>) {
    const isMetaData = (item: string | PageMetaData): item is PageMetaData => {
      return (item as string)?.length === undefined;
    };
    getDispatch()(removeConnectedHost(list.map(item => (isMetaData(item) ? item.hostname : item))));
  }
}
