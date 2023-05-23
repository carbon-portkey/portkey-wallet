import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { dappInitialState } from './state';
import { PageMetaData } from 'dapp/types';

const dappSlice = createSlice({
  name: 'dapp',
  initialState: dappInitialState,
  reducers: {
    resetDappState: () => dappInitialState,
    addConnectedHost: (state, action: PayloadAction<PageMetaData>) => {
      const { hostname } = action.payload as PageMetaData;
      if (!state.connectedHosts.find(host => host.hostname === hostname)) {
        state.connectedHosts.push(action.payload);
      }
    },
    removeConnectedHost: (state, action: PayloadAction<Array<string>>) => {
      state.connectedHosts = state.connectedHosts.filter(host => !action.payload.includes(host.hostname));
    },
  },
});
export default dappSlice;
