import React from 'react';
import PageContainer from 'components/PageContainer';
import { StyleSheet, View } from 'react-native';
import { ComposeWrapperView } from 'utils/nativeModules';

export const ComposePage = () => {
  return (
    <PageContainer titleDom type="leftBack" containerStyles={styles.container} scrollViewProps={{ disabled: true }}>
      {renderWrapper()}
    </PageContainer>
  );
};

const renderWrapper = () => {
  return (
    <ComposeWrapperView>
      <View style={styles.inner} />
    </ComposeWrapperView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inner: {
    height: 20,
    width: 20,
  },
});
