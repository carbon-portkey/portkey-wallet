import React from 'react';
import { TextM } from 'components/CommonText';
import GStyles from 'assets/theme/GStyles';
import { pTd } from 'utils/unit';
import { FontStyles } from 'assets/theme/styles';
import { defaultColors } from 'assets/theme';
import { Image, StyleSheet, View } from 'react-native';
import Touchable from 'components/Touchable';
import Svg from 'components/Svg';
import { showPinnedListOverlay } from '../PinnedListOverlay';

export default function HeaderPinSection() {
  return (
    <Touchable style={[GStyles.flexRow, GStyles.itemCenter, styles.wrap]} onPress={() => showPinnedListOverlay({})}>
      <View style={styles.leftBlue} />
      {/* TODO */}
      <Image style={styles.img} resizeMode="cover" source={{ uri: '' }} />
      <View style={GStyles.flex1}>
        <TextM numberOfLines={1} style={[FontStyles.font5, GStyles.flex1]}>
          {`Pin Message 1`}
        </TextM>
        <TextM numberOfLines={1} style={[FontStyles.font3, GStyles.flex1]}>
          Pin Message Pin Message Pin Message Pin Message Pin Message Pin Message Pin Message Pin Message
        </TextM>
      </View>
      <Svg icon="add-contact" size={pTd(20)} />
    </Touchable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingLeft: pTd(12),
    paddingRight: pTd(16),
    paddingVertical: pTd(8),
    backgroundColor: defaultColors.bg1,
    borderBottomColor: defaultColors.border6,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  leftBlue: {
    width: pTd(3),
    height: pTd(40),
    backgroundColor: defaultColors.primaryColor,
    marginRight: pTd(8),
  },
  img: {
    width: pTd(40),
    height: pTd(40),
    borderRadius: pTd(4),
    marginRight: pTd(8),
  },
});
