import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import PageContainer from 'components/PageContainer';
import { defaultColors } from 'assets/theme';
import GStyles from 'assets/theme/GStyles';
import CommonInput from 'components/CommonInput';
import useDebounce from 'hooks/useDebounce';
import GroupInfoMemberItem, { GroupInfoMemberItemType } from '../components/GroupInfoMemberItem';
import { pTd } from 'utils/unit';
import NoData from 'components/NoData';
import { useGroupChannelInfo, useRelationId } from '@portkey-wallet/hooks/hooks-ca/im';
import { useCurrentChannelId } from '../context/hooks';
import { BGStyles } from 'assets/theme/styles';
import navigationService from 'utils/navigationService';
import { useEffectOnce } from '@portkey-wallet/hooks';
import useLockCallback from '@portkey-wallet/hooks/useLockCallback';
import im from '@portkey-wallet/im';

const GroupMembersPage = () => {
  const { relationId: myRelationId } = useRelationId();
  const currentChannelId = useCurrentChannelId();
  const { groupInfo, refreshChannelMembersInfo } = useGroupChannelInfo(currentChannelId || '', false);
  const { memberInfos } = groupInfo || {};
  const { members = [], totalCount } = memberInfos || {};

  const [keyword, setKeyword] = useState('');
  const debounceKeyword = useDebounce(keyword, 200);
  const [filterMembers, setFilterMembers] = useState(members);

  const onPressItem = useCallback(
    (item: GroupInfoMemberItemType) => {
      if (myRelationId === item.relationId) {
        navigationService.navigate('WalletName');
      } else {
        navigationService.navigate('ChatContactProfile', {
          relationId: item.relationId,
          contact: {
            name: item?.title,
          },
        });
      }
    },
    [myRelationId],
  );

  const searchMemberList = useLockCallback(async () => {
    if (!keyword.trim()) return;

    try {
      const result = await im.service.searchChannelMembers({
        channelUuid: currentChannelId,
        keyword,
      });
      setFilterMembers(result?.data.members || []);
    } catch (error) {
      // TODO: change
      console.log('error', error);
    }
  }, [currentChannelId, keyword]);

  const fetchMemberList = useLockCallback(
    async (isInit?: false) => {
      if (!keyword.trim() && !isInit) return;
      if (totalCount && filterMembers?.length >= totalCount) return;

      try {
        await refreshChannelMembersInfo(filterMembers?.length || 0);
      } catch (error) {
        console.log('fetchMoreData', error);
      }
    },
    [filterMembers?.length, keyword, refreshChannelMembersInfo, totalCount],
  );

  // keyword search
  useEffect(() => {
    searchMemberList();
  }, [debounceKeyword, keyword, members, searchMemberList]);

  useEffectOnce(() => {
    fetchMemberList(true);
  });

  return (
    <PageContainer
      titleDom="Members"
      safeAreaColor={['blue', 'white']}
      scrollViewProps={{ disabled: true }}
      containerStyles={styles.container}>
      <View style={styles.inputWrap}>
        <CommonInput
          allowClear
          value={keyword}
          placeholder={'Search members'}
          onChangeText={v => {
            setKeyword(v.trim());
          }}
        />
      </View>

      <FlatList
        data={filterMembers}
        ListEmptyComponent={<NoData noPic message="No search result" style={BGStyles.bg1} />}
        keyExtractor={item => item.relationId}
        renderItem={({ item }) => (
          <GroupInfoMemberItem
            item={{
              relationId: item.relationId,
              title: item.name,
              avatar: item.avatar,
            }}
            isOwner={item.isAdmin}
            onPress={onPressItem}
            style={styles.itemStyle}
          />
        )}
        onEndReached={fetchMemberList}
      />
    </PageContainer>
  );
};

export default GroupMembersPage;

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    backgroundColor: defaultColors.bg1,
    flex: 1,
    ...GStyles.paddingArg(0),
  },
  inputWrap: {
    backgroundColor: defaultColors.bg5,
    ...GStyles.paddingArg(8, 20, 8),
  },
  itemStyle: {
    paddingHorizontal: pTd(20),
  },
  buttonWrap: {
    ...GStyles.marginArg(10, 20, 16),
  },
});
