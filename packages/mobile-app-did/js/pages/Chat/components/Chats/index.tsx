import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  DayProps,
  GiftedChat,
  GiftedChatProps,
  IMessage,
  MessageImageProps,
  MessageProps,
  MessageTextProps,
} from 'react-native-gifted-chat';
import { AccessoryBar, BottomBarContainer } from '../InputToolbar';
import { randomId } from '@portkey-wallet/utils';
import { ActivityIndicator, FlatList, Keyboard, StyleSheet } from 'react-native';
import { useChatsDispatch, useCurrentChannelId } from '../../context/hooks';
import CustomBubble from '../CustomBubble';
import { setBottomBarStatus, setChatText, setShowSoftInputOnFocus } from '../../context/chatsContext';
import useEffectOnce from 'hooks/useEffectOnce';
import MessageText from '../Message/MessageText';
import { destroyChatInputRecorder, initChatInputRecorder } from 'pages/Chat/utils';
import MessageImage from '../Message/MessageImage';

import { useThrottleCallback } from '@portkey-wallet/hooks';

import Touchable from 'components/Touchable';
import { useChannel, useRelationId } from '@portkey-wallet/hooks/hooks-ca/im';
import GStyles from 'assets/theme/GStyles';
import { ChatMessage } from 'pages/Chat/types';
import { FontStyles } from 'assets/theme/styles';
import ChatMessageContainer from '../Message';
import { formatMessageList } from 'pages/Chat/utils/format';
import SystemTime from '../SystemTime';
import { defaultColors } from 'assets/theme';
import Svg from 'components/Svg';
import { pTd } from 'utils/unit';

const ListViewProps = {
  // windowSize: 50,
  // maxToRenderPerBatch: 5,
  // removeClippedSubviews: false,
  // legacyImplementation: true,
  initialNumToRender: 20,
  alwaysBounceVertical: false,
};
const Empty = () => null;

const ChatsUI = () => {
  const currentChannelId = useCurrentChannelId();
  const dispatch = useChatsDispatch();
  const messageContainerRef = useRef<FlatList>();

  const { list, init } = useChannel(currentChannelId || '');

  const [loading, setLoading] = useState(true);

  const formattedList = useMemo(() => formatMessageList(list), [list]);

  useEffectOnce(() => {
    initChatInputRecorder();
    const timer = setTimeout(() => {
      setLoading(false);
    }, 200);
    return () => {
      clearTimeout(timer);
      dispatch(setChatText(''));
      dispatch(setBottomBarStatus(undefined));
      dispatch(setShowSoftInputOnFocus(true));
      // dispatch(setCurrentChannelId());
      destroyChatInputRecorder();
    };
  });

  const scrollToBottom = useCallback(() => {
    if (messageContainerRef?.current?.scrollToOffset)
      messageContainerRef.current?.scrollToOffset({ offset: 0, animated: false });
  }, []);

  const onDismiss = useThrottleCallback(() => {
    Keyboard.dismiss();
    dispatch(setBottomBarStatus(undefined));
  }, [dispatch]);

  const renderMessageText: GiftedChatProps['renderMessageText'] = useCallback(
    (props: MessageTextProps<ChatMessage>) => <MessageText {...props} />,
    [],
  );

  const renderMessageImage: GiftedChatProps['renderMessageImage'] = useCallback(
    (props: MessageImageProps<ChatMessage>) => <MessageImage {...(props as MessageProps<ChatMessage>)} />,
    [],
  );

  const renderDay: GiftedChatProps['renderDay'] = useCallback(
    (props: DayProps<IMessage>) => <SystemTime {...props} />,
    [],
  );

  const renderBubble = useCallback((data: any) => {
    return <CustomBubble {...data} />;
  }, []);
  const listViewProps: GiftedChatProps['listViewProps'] = useMemo(() => {
    return {
      ...ListViewProps,
      onScrollBeginDrag: onDismiss,
    };
  }, [onDismiss]);

  const renderScrollToBottomComponent = useCallback(() => {
    return <Svg icon="chat-scroll-to-bottom" size={pTd(24)} />;
  }, []);

  const renderMessage = useCallback(
    (props: MessageProps<ChatMessage>) => {
      return <ChatMessageContainer onDismiss={onDismiss} {...props} />;
    },
    [onDismiss],
  );
  const disabledTouchable = useMemo(() => formattedList.length > 10, [formattedList.length]);

  const bottomBar = useMemo(
    () => (
      <BottomBarContainer scrollToBottom={scrollToBottom}>
        <AccessoryBar />
      </BottomBarContainer>
    ),
    [scrollToBottom],
  );

  const relationId = useRelationId();
  const user = useMemo(() => ({ _id: relationId || '' }), [relationId]);

  useEffectOnce(() => {
    init();
  });

  return (
    <>
      <Touchable disabled={disabledTouchable} activeOpacity={1} onPress={onDismiss} style={GStyles.flex1}>
        {loading ? (
          <ActivityIndicator size={'small'} color={FontStyles.font4.color} />
        ) : (
          <GiftedChat
            alignTop
            user={user}
            messageContainerRef={messageContainerRef as any}
            messageIdGenerator={randomId}
            alwaysShowSend
            scrollToBottom
            renderUsername={Empty}
            renderTime={Empty}
            isCustomViewBottom
            renderAvatar={Empty}
            showUserAvatar={false}
            messages={formattedList}
            minInputToolbarHeight={0}
            renderUsernameOnMessage={false}
            renderInputToolbar={Empty}
            renderDay={renderDay}
            renderBubble={renderBubble}
            renderMessage={renderMessage}
            listViewProps={listViewProps}
            showAvatarForEveryMessage={true}
            isKeyboardInternallyHandled={false}
            scrollToBottomComponent={renderScrollToBottomComponent}
            messagesContainerStyle={styles.messagesContainerStyle}
            renderMessageText={renderMessageText}
            renderMessageImage={renderMessageImage}
          />
        )}
      </Touchable>
      {bottomBar}
    </>
  );
};

export default function Chats() {
  return <ChatsUI />;
}
const styles = StyleSheet.create({
  messagesContainerStyle: {
    backgroundColor: defaultColors.bg1,
    flex: 1,
  },
});
