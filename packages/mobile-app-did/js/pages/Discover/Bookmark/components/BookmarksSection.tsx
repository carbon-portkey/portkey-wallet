import React, { useMemo, useState } from 'react';
import DraggableFlatList from 'react-native-draggable-flatlist';
import GStyles from 'assets/theme/GStyles';
import { StyleSheet, View } from 'react-native';
import { BookmarkProvider, setEdit, useBookmark } from '../context/bookmarksContext';
import CommonButton from 'components/CommonButton';
import BookmarkItem from './BookmarkItem';
import { FontStyles } from 'assets/theme/styles';
import { defaultColors } from 'assets/theme';
import { pTd } from 'utils/unit';
import NoDiscoverData from 'pages/Discover/components/NoDiscoverData';

const mockData = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

function BookmarksSection() {
  const [list, setList] = useState(mockData);
  const [{ isEdit }, dispatch] = useBookmark();

  const BottomBox = useMemo(
    () => (
      <View style={styles.buttonGroupWrap}>
        {isEdit ? (
          <>
            <CommonButton onPress={() => dispatch(setEdit(false))} title="Done" type="primary" />
            <CommonButton
              containerStyle={styles.deleteAll}
              titleStyle={FontStyles.font12}
              type="outline"
              title="Delete All"
            />
          </>
        ) : (
          <CommonButton onPress={() => dispatch(setEdit(true))} title="Edit" type="primary" />
        )}
      </View>
    ),
    [dispatch, isEdit],
  );

  if (list.length === 0) return <NoDiscoverData location="top" size="large" backgroundColor={defaultColors.bg4} />;

  return (
    <View style={styles.containerStyles}>
      <View style={[GStyles.flex1, styles.listWrap]}>
        <DraggableFlatList
          scrollEnabled
          data={list}
          ListEmptyComponent={<NoDiscoverData location="top" size="large" backgroundColor={defaultColors.bg4} />}
          ListHeaderComponent={<View style={styles.headerBlank} />}
          ListFooterComponent={<View style={styles.footerBlank} />}
          keyExtractor={_item => _item}
          renderItem={props => <BookmarkItem {...props} />}
          onDragEnd={({ data }) => setList(data)}
        />
      </View>
      {BottomBox}
    </View>
  );
}

export default function Container() {
  return (
    <BookmarkProvider>
      <BookmarksSection />
    </BookmarkProvider>
  );
}

const styles = StyleSheet.create({
  // remove padding to scale item
  containerStyles: {
    flex: 1,
    justifyContent: 'space-between',
    borderRadius: pTd(6),
  },
  listWrap: {
    paddingHorizontal: pTd(20),
  },
  buttonGroupWrap: {
    paddingHorizontal: pTd(20),
  },
  deleteAll: {
    marginTop: pTd(10),
  },
  headerBlank: {
    borderTopLeftRadius: pTd(6),
    borderTopRightRadius: pTd(6),
    height: pTd(8),
    backgroundColor: defaultColors.bg1,
  },
  footerBlank: {
    borderBottomLeftRadius: pTd(6),
    borderBottomRightRadius: pTd(6),
    height: pTd(8),
    backgroundColor: defaultColors.bg1,
  },
});
