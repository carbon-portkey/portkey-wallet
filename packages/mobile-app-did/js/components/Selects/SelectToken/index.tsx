import React, { useCallback, useEffect, useMemo } from 'react';
import { useState } from 'react';
import { View, Text, TouchableOpacity, Image, FlatList, StyleSheet, ViewStyle } from 'react-native';
import { IPaySelectTokenProps, IReceiveSelectTokenProps, OnSelectFinishCallback } from '../Entry';
import { TNetworkItem, TTokenItem } from '@portkey-wallet/types/types-ca/deposit';
import { pTd } from 'utils/unit';
import { defaultColors } from 'assets/theme';
import CommonAvatar from 'components/CommonAvatar';
import GStyles from 'assets/theme/GStyles';
import { TextM } from 'components/CommonText';
import { ModalBody } from 'components/ModalBody';
import { useGStyles } from 'assets/theme/useGStyles';
import { NetworkAndTokenShowType, sortTokens, useMemoNetworkAndTokenData } from '../Entry/model';
import { MAIN_CHAIN_ID } from '@portkey-wallet/constants/constants-ca/activity';
import { RichText } from 'components/RichText';
import Svg from 'components/Svg';

enum Layers {
  LAYER1,
  LAYER2,
}

enum FocusedOnType {
  TopTwo,
  All,
  More,
}

type OnSelectNetworkCallback = (network: TNetworkItem) => void;

export const SelectNetworkModal = (props: IReceiveSelectTokenProps | IPaySelectTokenProps) => {
  const { networkList, networkDataList, currentToken, currentNetwork, onResolve, onReject } =
    props as IReceiveSelectTokenProps & IPaySelectTokenProps;
  const [layer, setLayer] = useState(Layers.LAYER1);
  const { symbol } = currentToken;
  const [currentChoosingNetwork, setCurrentChoosingNetwork] = useState(currentNetwork);
  const gStyle = useGStyles();
  const [focusedOn, setFocusedOn] = useState(FocusedOnType.TopTwo);
  const networkOverflowNum = useMemo(() => {
    if (networkDataList) {
      return -1;
    } else {
      return networkList.length - 2;
    }
  }, [networkDataList, networkList]);
  const topTwoNetworks = useMemo(() => {
    if (networkDataList) return networkDataList.map(it => it.network);
    const arr: TNetworkItem[] = [];
    if (currentChoosingNetwork !== currentNetwork) {
      arr.push(currentChoosingNetwork);
      arr.push(currentNetwork);
    } else {
      arr.push(currentNetwork);
      const nextOne = networkList.find(it => it !== currentNetwork);
      nextOne && arr.push(nextOne);
    }
  }, [currentChoosingNetwork, currentNetwork, networkDataList, networkList]);
  const onNetworkBtnClick = useCallback((type: FocusedOnType, networkItem?: TNetworkItem) => {
    setFocusedOn(type);
    if (type === FocusedOnType.TopTwo) {
      networkItem && setCurrentChoosingNetwork(networkItem);
    }
  }, []);
  const { networkAndTokenData, updateNetworkAndTokenData } = useMemoNetworkAndTokenData();
  const preparedNetworkAndTokenData = useMemo(() => {
    if (networkDataList) {
      const res: NetworkAndTokenShowType = [];
      if (focusedOn === FocusedOnType.All) {
        networkDataList.forEach(it => {
          sortTokens(it.tokenList).forEach(token => {
            res.push({ network: it.network, token });
          });
        });
      } else {
        const target = networkDataList.find(it => it.network.network === currentChoosingNetwork.network);
        if (target) {
          sortTokens(target.tokenList).forEach(token => {
            res.push({ network: target.network, token });
          });
        }
      }
      return res;
    } else {
      return networkAndTokenData;
    }
  }, [currentChoosingNetwork.network, focusedOn, networkAndTokenData, networkDataList]);

  useEffect(() => {
    if (!networkList) return;
    const type = networkList ? 'from' : 'to';
    if (focusedOn === FocusedOnType.All) {
      updateNetworkAndTokenData({ type, chainId: MAIN_CHAIN_ID }, networkList);
    } else {
      updateNetworkAndTokenData({ type, chainId: MAIN_CHAIN_ID, network: currentChoosingNetwork.network }, networkList);
    }
  }, [currentChoosingNetwork.network, currentNetwork, focusedOn, networkList, updateNetworkAndTokenData]);

  const networkBtns = useMemo<Array<JSX.Element>>(() => {
    const array: Array<JSX.Element> = [];
    array.push(
      <NetworkTopBtn
        reportPress={onNetworkBtnClick}
        type={FocusedOnType.All}
        focused={focusedOn === FocusedOnType.All}
        networkOverflowNum={networkOverflowNum}
      />,
    );
    if (networkDataList) {
      networkDataList.forEach(networkItem => {
        array.push(
          <NetworkTopBtn
            reportPress={onNetworkBtnClick}
            type={FocusedOnType.TopTwo}
            focused={focusedOn === FocusedOnType.TopTwo && currentChoosingNetwork === networkItem.network}
            networkItem={currentNetwork}
            containerStyle={{ marginLeft: pTd(8) }}
            networkOverflowNum={networkOverflowNum}
          />,
        );
      });
    } else if (topTwoNetworks) {
      topTwoNetworks.forEach(networkItem => {
        array.push(
          <NetworkTopBtn
            reportPress={onNetworkBtnClick}
            type={FocusedOnType.TopTwo}
            focused={focusedOn === FocusedOnType.TopTwo && currentChoosingNetwork === networkItem}
            networkItem={currentNetwork}
            containerStyle={{ marginLeft: pTd(8) }}
            networkOverflowNum={networkOverflowNum}
          />,
        );
      });
    }
    if (networkOverflowNum > 0) {
      array.push(
        <NetworkTopBtn
          reportPress={onNetworkBtnClick}
          type={FocusedOnType.More}
          focused={focusedOn === FocusedOnType.More}
          networkOverflowNum={networkOverflowNum}
        />,
      );
    }
    return array;
  }, [
    currentChoosingNetwork,
    currentNetwork,
    focusedOn,
    networkDataList,
    networkOverflowNum,
    onNetworkBtnClick,
    topTwoNetworks,
  ]);
  return (
    <ModalBody
      isShowLeftBackIcon={layer === Layers.LAYER2}
      isShowRightCloseIcon={layer === Layers.LAYER1}
      onBack={() => setLayer(Layers.LAYER1)}
      onClose={() => {
        onReject?.('user canceled');
      }}
      style={gStyle.overlayStyle}
      title={layer === Layers.LAYER1 ? (networkDataList ? 'Receive' : 'Pay') : 'Select Network'}
      modalBodyType="bottom">
      {layer === Layers.LAYER1 && (
        <View style={styles.container}>
          <View style={styles.layerBlock}>
            <Text style={styles.layerBlockTitle}>{'Select a network'}</Text>
            <View style={styles.networkBtnLine}>{networkBtns}</View>
          </View>
          <View style={styles.layerBlock}>
            <Text style={styles.layerBlockTitle}>{'Select a token'}</Text>
            <FlatList
              data={preparedNetworkAndTokenData}
              keyExtractor={(item, index) => `${item.network.network}-${index}`}
              renderItem={({ item }) => (
                <TokenListItem
                  item={item.token}
                  onSelect={onResolve}
                  underNetwork={item.network}
                  isReceive={!!networkDataList}
                  isShowAll={focusedOn === FocusedOnType.All}
                />
              )}
            />
          </View>
        </View>
      )}
      {layer === Layers.LAYER2 && (
        <View style={styles.container}>
          <View style={[styles.wrap, styles.flex]}>
            <Svg icon="more-info" size={pTd(16)} iconStyle={styles.icon} color={defaultColors.bg30} />
            <RichText
              text={`Note: Please select from the supported networks listed below. Sending ${symbol} from other networks may result in the loss of your assets.`}
              commonTextStyle={styles.commonText}
            />
          </View>
          <FlatList
            data={networkList}
            keyExtractor={(item, index) => `${item.network}-${index}`}
            renderItem={({ item }) => (
              <NetworkListItem item={item} onSelect={network => setCurrentChoosingNetwork(network)} />
            )}
          />
        </View>
      )}
    </ModalBody>
  );
};

const NetworkListItem = (props: { item: TNetworkItem; onSelect: OnSelectNetworkCallback }) => {
  const { item, onSelect } = props;
  const { network, multiConfirm, multiConfirmTime } = item;

  return (
    <TouchableOpacity
      style={styles.networkItem}
      onPress={() => {
        onSelect(item);
      }}>
      <Image style={styles.networkIcon} source={getNetworkImagePath(network)} resizeMode={'contain'} />
      <View style={styles.networkTextLines}>
        <Text style={styles.networkTextMain}>{network}</Text>
        <Text style={styles.networkTextSub}>{`Arrival Time ≈ ${multiConfirmTime}`}</Text>
        <Text style={styles.networkTextSub}>{multiConfirm}</Text>
      </View>
    </TouchableOpacity>
  );
};

const NetworkTopBtn = (props: {
  reportPress: (type: FocusedOnType, networkItem?: TNetworkItem) => void;
  type: FocusedOnType;
  focused: boolean;
  networkItem?: TNetworkItem;
  networkOverflowNum: number;
  containerStyle?: ViewStyle;
}) => {
  const { reportPress, type, focused, networkItem, networkOverflowNum, containerStyle } = props;
  const isTopTwo = type === FocusedOnType.TopTwo;
  const isAll = type === FocusedOnType.All;

  const text = useMemo(() => {
    if (isAll) return 'ALL';
    if (isTopTwo) return networkItem?.network;
    return `${networkOverflowNum}+`;
  }, [isAll, isTopTwo, networkItem, networkOverflowNum]);

  return (
    <TouchableOpacity
      style={[styles.networkBtn, focused ? styles.networkBtnFocused : styles.networkBtnNotFocused, containerStyle]}
      onPress={() => {
        reportPress(type, networkItem);
      }}>
      <TextM>{text}</TextM>
    </TouchableOpacity>
  );
};

const getNetworkImagePath = (network: string) => {
  switch (network) {
    case 'ETH':
      return require('../../../assets/image/pngs/third-party-ethereum.png');
    case 'BSC':
      return require('../../../assets/image/pngs/third-party-bnb.png');
    case 'TRX':
      return require('../../../assets/image/pngs/third-party-tron.png');
    case 'ARBITRUM':
      return require('../../../assets/image/pngs/third-party-arb.png');
    case 'Solana':
      return require('../../../assets/image/pngs/third-party-solana.png');
    case 'MATIC':
      return require('../../../assets/image/pngs/third-party-polygon.png');
    case 'OPTIMISM':
      return require('../../../assets/image/pngs/third-party-op.png');
    case 'AVAXC':
      return require('../../../assets/image/pngs/third-party-avax.png');
    default: {
      return require('../../../assets/image/pngs/third-party-solana.png');
    }
  }
};

const TokenListItem = (props: {
  item: TTokenItem;
  onSelect: OnSelectFinishCallback;
  underNetwork: TNetworkItem;
  isReceive: boolean;
  isShowAll: boolean;
}) => {
  const { item, onSelect, underNetwork, isReceive, isShowAll } = props;
  const { symbol, name, icon, contractAddress } = item;
  const { name: networkName } = underNetwork;

  return (
    <TouchableOpacity
      style={styles.tokenItem}
      onPress={() => {
        onSelect({
          token: item,
          network: underNetwork,
        });
      }}>
      <View style={styles.tokenIconBox}>
        <CommonAvatar
          hasBorder
          style={styles.tokenIconMain}
          avatarSize={pTd(36)}
          imageUrl={icon}
          borderStyle={GStyles.hairlineBorder}
        />
        <View style={styles.subIcon}>
          <Image style={styles.subIcon} source={getNetworkImagePath(underNetwork.network)} resizeMode={'contain'} />
        </View>
      </View>
      <View style={styles.tokenTextLines}>
        <View style={styles.tokenTextMain}>
          <Text style={styles.tokenSymbol}>{symbol}</Text>
          <Text style={styles.tokenDetail}>{name}</Text>
        </View>
        {isShowAll && <Text style={styles.tokenTextSub}>{isReceive ? networkName : contractAddress}</Text>}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingHorizontal: pTd(16),
    paddingVertical: pTd(8),
  },
  layerBlock: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginBottom: pTd(24),
  },
  layerBlockTitle: {
    lineHeight: pTd(22),
    color: defaultColors.font11,
    marginBottom: pTd(8),
  },
  tokenItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: pTd(16),
  },
  networkItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    padding: pTd(16),
  },
  tokenIconBox: {
    height: pTd(36),
    width: pTd(36),
    display: 'flex',
    flexDirection: 'row',
  },
  tokenIconMain: {
    height: pTd(36),
    width: pTd(36),
    zIndex: 1,
  },
  subIcon: {
    zIndex: 2,
    position: 'absolute',
    right: 0,
    bottom: 0,
    height: pTd(16),
    width: pTd(16),
    borderRadius: pTd(8),
    borderStyle: 'solid',
    borderWidth: pTd(1),
    borderColor: '#fff',
  },
  tokenTextLines: {
    flexDirection: 'column',
    marginLeft: pTd(10),
  },
  tokenTextMain: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  tokenSymbol: {
    color: defaultColors.font5,
    lineHeight: pTd(24),
  },
  tokenDetail: {
    color: defaultColors.font11,
    lineHeight: pTd(16),
    marginLeft: pTd(8),
  },
  tokenTextSub: {
    color: defaultColors.font11,
    lineHeight: pTd(16),
  },
  networkIcon: {
    height: pTd(20),
    width: pTd(20),
    zIndex: 1,
  },
  networkTextLines: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  networkTextMain: {
    lineHeight: pTd(22),
    color: defaultColors.font20,
  },
  networkTextSub: {
    lineHeight: pTd(16),
    color: defaultColors.font19,
  },
  networkBtnLine: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  networkBtn: {
    paddingHorizontal: pTd(8),
    paddingVertical: pTd(5),
    borderWidth: StyleSheet.hairlineWidth,
  },
  networkBtnNotFocused: {
    borderColor: defaultColors.bg30,
  },
  networkBtnFocused: {
    borderColor: defaultColors.primaryColor,
  },
  wrap: {
    backgroundColor: defaultColors.bg39,
    padding: pTd(12),
  },
  flex: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  wrapperText: {
    flex: 22,
    paddingLeft: pTd(6),
  },
  commonText: {
    fontSize: pTd(12),
    lineHeight: pTd(16),
    color: defaultColors.font11,
  },
  icon: {
    marginTop: pTd(2),
  },
});
