import { useGetS3ImageUrl } from '@portkey-wallet/hooks/hooks-ca/cms';
import { useDiscoverData } from '@portkey-wallet/hooks/hooks-ca/cms/discover';
import { TBaseCardItemType } from '@portkey-wallet/types/types-ca/cms';
import { defaultColors } from 'assets/theme';
import fonts from 'assets/theme/fonts';
import CommonButton from 'components/CommonButton';
import { TextL, TextS } from 'components/CommonText';
import NoData from 'components/NoData';
import { useDiscoverJumpWithNetWork } from 'hooks/discover';
import React, { useCallback } from 'react';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { pTd } from 'utils/unit';

export const EarnPage = () => {
  const { earnList = [] } = useDiscoverData();
  return (
    <View style={styles.container}>
      {earnList.length > 0 ? earnList.map((item, index) => <EarnItem key={index} {...item} />) : <NoData />}
    </View>
  );
};

const EarnItem = (item: TBaseCardItemType) => {
  const discoverJump = useDiscoverJumpWithNetWork();
  const getS3ImgUrl = useGetS3ImageUrl();
  // const imageUrl = getS3ImgUrl(item.imgUrl.filename_disk);
  const imageUrl = 'https://cdn.britannica.com/22/187222-050-07B17FB6/apples-on-a-tree-branch.jpg';
  const { title = '', description, url, buttonTitle } = item;
  const onPress = useCallback(() => {
    discoverJump({
      item: {
        name: title,
        url: url,
      },
    });
  }, [discoverJump, title, url]);
  return (
    <View style={styles.item}>
      <TouchableOpacity onPress={onPress}>
        <Image style={styles.bigImage} source={{ uri: imageUrl }} />
      </TouchableOpacity>
      <View style={styles.infoWrap}>
        <View style={styles.infoLine}>
          <View style={styles.textLines}>
            <TextL style={[styles.title, fonts.mediumFont]}>{title}</TextL>
            <TextS style={styles.description}>{description}</TextS>
          </View>
          <CommonButton
            type="primary"
            buttonStyle={styles.btn}
            titleStyle={styles.btnTitle}
            title={buttonTitle || 'Earn Now'}
            onPress={onPress}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: pTd(16),
    backgroundColor: defaultColors.white,
  },
  item: {
    flexWrap: 'wrap',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: pTd(12),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: defaultColors.bg32,
    marginTop: pTd(16),
  },
  bigImage: {
    width: '100%',
    height: pTd(128),
  },
  infoWrap: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: pTd(12),
    paddingVertical: pTd(16),
  },
  infoLine: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  textLines: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  title: {
    color: defaultColors.font5,
    lineHeight: pTd(24),
    textAlign: 'left',
  },
  description: {
    color: defaultColors.font11,
    lineHeight: pTd(16),
    textAlign: 'left',
  },
  btn: {
    paddingHorizontal: pTd(16),
    height: pTd(32),
    borderRadius: pTd(4),
  },
  btnTitle: {
    fontSize: pTd(12),
    lineHeight: pTd(16),
  },
});
