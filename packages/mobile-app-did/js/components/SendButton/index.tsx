import React, { memo, useMemo } from 'react';
import Svg from 'components/Svg';
import { commonButtonStyle } from './style';
import navigationService from 'utils/navigationService';
import { TokenItemShowType } from '@portkey-wallet/types/types-ca/token';
import { IToSendHomeParamsType } from '@portkey-wallet/types/types-ca/routeParams';

import { View, TouchableOpacity, StyleProp, ViewProps } from 'react-native';
import { TextM } from 'components/CommonText';
import { useLanguage } from 'i18n/hooks';
import { pTd } from 'utils/unit';
import AssetsOverlay from 'pages/DashBoard/AssetsOverlay';
import GStyles from 'assets/theme/GStyles';

interface SendButtonType {
  themeType?: 'dashBoard' | 'innerPage';
  sentToken?: TokenItemShowType;
  wrapStyle?: StyleProp<ViewProps>;
}

const SendButton = (props: SendButtonType) => {
  const { themeType = 'dashBoard', sentToken, wrapStyle = {} } = props;

  const buttonTitleStyle = useMemo(
    () =>
      themeType === 'dashBoard'
        ? commonButtonStyle.dashBoardTitleColorStyle
        : commonButtonStyle.innerPageTitleColorStyle,
    [themeType],
  );

  const { t } = useLanguage();

  return (
    <View style={[commonButtonStyle.buttonWrap, wrapStyle]}>
      <TouchableOpacity
        style={[commonButtonStyle.iconWrapStyle, GStyles.alignCenter, wrapStyle]}
        onPress={async () => {
          if (themeType === 'innerPage')
            return navigationService.navigate('SendHome', {
              sendType: 'token',
              assetInfo: sentToken,
              toInfo: {
                name: '',
                address: '',
              },
            } as unknown as IToSendHomeParamsType);
          // if (currentTokenList.length === 1)
          // return navigationService.navigate('SendHome', { tokenItem: currentTokenList?.[0] });
          AssetsOverlay.showAssetList();
        }}>
        <Svg icon={themeType === 'dashBoard' ? 'send' : 'send1'} size={pTd(46)} />
      </TouchableOpacity>
      <TextM style={[commonButtonStyle.commonTitleStyle, buttonTitleStyle]}>{t('Send')}</TextM>
    </View>
  );
};

export default memo(SendButton);
