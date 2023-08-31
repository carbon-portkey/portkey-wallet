import React, { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import PageContainer from 'components/PageContainer';
import { defaultColors } from 'assets/theme';
import GStyles from 'assets/theme/GStyles';
import CommonButton from 'components/CommonButton';
import { FontStyles } from 'assets/theme/styles';
import Loading from 'components/Loading';
import CommonToast from 'components/CommonToast';
import FormItem from 'components/FormItem';
import CommonInput from 'components/CommonInput';
import { pTd } from 'utils/unit';

const EditGroupPage = () => {
  const [groupName, setGroupName] = useState('');

  const onDisband = useCallback(() => {
    try {
      Loading.show();
      // TODO: api
    } catch (error) {
      // TODO: fail toast
      CommonToast.failError(error);
    } finally {
      Loading.hide();
    }
  }, []);

  return (
    <PageContainer
      titleDom="Edit Group"
      hideTouchable
      safeAreaColor={['blue', 'gray']}
      scrollViewProps={{ disabled: true }}
      containerStyles={styles.container}>
      <FormItem title={'Group Name'} style={styles.groupNameWrap}>
        <CommonInput
          type="general"
          theme="white-bg"
          placeholder="Enter Name"
          maxLength={40}
          value={groupName}
          onChangeText={setGroupName}
        />
      </FormItem>

      <View>
        <CommonButton title="Save" />
        <CommonButton
          title={'Disband'}
          style={styles.deleteBtnStyle}
          onPress={onDisband}
          titleStyle={FontStyles.font12}
          type="clear"
        />
      </View>
    </PageContainer>
  );
};

export default EditGroupPage;

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    backgroundColor: defaultColors.bg4,
    flex: 1,
    ...GStyles.paddingArg(0),
  },
  groupNameWrap: {
    marginTop: pTd(24),
    paddingHorizontal: pTd(20),
  },
  deleteBtnStyle: {
    marginTop: pTd(8),
  },
});
