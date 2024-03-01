import React, {useEffect, useState} from 'react';
import {View, Text, SafeAreaView, FlatList} from 'react-native';

import {} from '@react-navigation/native';

import {ColorCode, styles} from '../../MainStyle';
import {useNavigation} from '@react-navigation/native';
import {NavigationProps} from '../../../Core/BaseProps';
import {Avatar, Badge, List} from 'react-native-paper';
import {useAppDispatch, useAppSelector} from '../../../Redux/Hooks';

import {EmptyListMessage} from '../../../Control/EmptyListMessage';
import {MDivider} from '../../../Control/MDivider';
import {StackScreenProps} from '@react-navigation/stack';
import {RootStackParamList} from '../../../Root/AppStack';
import {ChatUser} from '../../../Entity/ChatUser';
import {ShowPageLoader} from '../../../Redux/Store';
import SessionHelper from '../../../Core/SessionHelper';
import AppDBHelper from '../../../Core/AppDBHelper';
import SignalRApi from '../../../DataAccess/SignalRApi';
import {SignalRHubConnection} from '../../../DataAccess/SignalRHubConnection';
import {Chat} from '../../../Entity/Chat';
import ChatUserOptions from '../../../Redux/Reducer/ChatUserOptions';

const AllChatPage = () => {
  const dispatch = useAppDispatch();
  const chatUserOptions = useAppSelector(i => i.ChatUserOptions);
  var FetchMessageInterval: NodeJS.Timeout;
  const [filterIsCalled, setFilterIsCalled] = useState(false);
  useEffect(() => {
    InitilizeOnce();
    return () => {
      clearInterval(FetchMessageInterval);
    };
  }, []);

  const InitilizeOnce = async () => {
    setFilterIsCalled(false);

    //If no data found in local storage then page need to wait for network data

    console.log('GetUserList', 'start');
    SignalRHubConnection.GetUserList().then(res => {
      UpdateAllOnlineUser(res);
    });

    FetchAllUserAndUnReadMessages();

    FetchMessageInterval = setInterval(() => {
      FetchAllUserAndUnReadMessages(),
        SignalRHubConnection.GetUserList().then(res => {
          UpdateAllOnlineUser(res);
        });
    }, 1000 * 60);
  };

  const UpdateAllOnlineUser = async (allUsers: ChatUser[]) => {
    dispatch(ChatUserOptions.actions.UpdateAllUserList(allUsers));
    console.log('filterIsCalled', filterIsCalled);
    //Filter data will call only once

    dispatch(ChatUserOptions.actions.UpdateFilterUserList(allUsers));
    setFilterIsCalled(true);
  };

  const FetchAllUserAndUnReadMessages = async () => {
    var branch = await SessionHelper.GetBranch();
    var tempSenderChatId = await SessionHelper.GetChatId();
    SignalRApi.GetUsersWithMessage(tempSenderChatId!, branch?.lId!).then(
      cuResponse => {
        console.log('cuResponse: ', cuResponse);
        if (cuResponse.data) {
          dispatch(ChatUserOptions.actions.UpdateAllUserList(cuResponse.data));
          cuResponse.data.forEach(user => {
            dispatch(
              ChatUserOptions.actions.LoadUserOneToOneChatList({
                messageList: user.sMessgeList || [],
                SecondUserId: user.lId,
              }),
            );
          });
          SessionHelper.GetChatId().then(
            (CurrentUserChatId: string | undefined) => {
              AppDBHelper.SetChatUsers(
                chatUserOptions.AllUserList,
                CurrentUserChatId!,
              );
            },
          );
        }
      },
    );

    // var cuResponse = await SignalRApi.GetUsersWithMessage(tempSenderChatId!, branch?.lId!)

    // if (cuResponse.data) {
    //   dispatch(ChatUserOptions.actions.UpdateAllUserList(cuResponse.data))
    //   cuResponse.data.forEach(user => {
    //     dispatch(ChatUserOptions.actions.LoadUserOneToOneChatList({
    //       messageList: user.sMessgeList || [],
    //       SecondUserId: user.lId
    //     }))
    //   })
    //   SessionHelper.GetChatId().then((CurrentUserChatId: string | undefined) => {
    //     AppDBHelper.SetChatUsers(chatUserOptions.AllUserList, CurrentUserChatId!)
    //   })
    // }
  };

  return (
    <React.Fragment>
      <SafeAreaView>
        <View style={{marginTop: 10}}>
          <FlatList
            data={chatUserOptions.FilterUserList}
            keyExtractor={e => e.lId + ''}
            refreshing={chatUserOptions.IsPageLoading}
            onRefresh={FetchAllUserAndUnReadMessages}
            renderItem={d => {
              return (
                <ChatUserScreen
                  data={d.item}
                  OnUserListRefresRequest={FetchAllUserAndUnReadMessages}
                />
              );
            }}
            ListEmptyComponent={EmptyListMessage(
              chatUserOptions.FilterUserList.length == 0,
            )}
          />
        </View>
      </SafeAreaView>
    </React.Fragment>
  );
};

const ChatUserScreen = (props: {
  data: ChatUser;
  OnUserListRefresRequest: () => void;
}) => {
  const users = useAppSelector(i => i.ChatUserOptions.AllUserList);
  const user = users.find(i => i.lId == props.data.lId)!;

  const navigate = useNavigation<NavigationProps>();
  var unreadMessageList = user.AllChatOneToOneList?.filter(
    i => !i.bStatus && i.lReceiverId != user.lId,
  );
  var lastMessage = user.AllChatOneToOneList?.length
    ? user.AllChatOneToOneList[0]
    : undefined;

  return (
    <List.Item
      onPress={() => {
        navigate.navigate('OneToOneChatPage2', {
          SecondUser: user,
          OnUserListRefresRequest: props.OnUserListRefresRequest,
        });
      }}
      style={{marginLeft: 5, paddingTop: 0, paddingBottom: 0}}
      title={user.userName}
      titleStyle={{fontFamily: 'OpenSans-Regular', fontSize: 15, marginTop: 0}}
      description={() => {
        return (
          <View>
            {unreadMessageList?.length != null && (
              <Badge
                size={25}
                visible={unreadMessageList?.length > 0}
                style={{
                  backgroundColor: 'red',
                  position: 'absolute',
                  bottom: 30,
                  right: 0,
                }}>
                {unreadMessageList.length}
              </Badge>
            )}

            <Text
              style={{
                color: unreadMessageList?.length > 0 ? '#0383FA' : '#A6A6A6',
                fontFamily: 'OpenSans-Regular',
                letterSpacing: 0.2,
                fontSize: 12,
                marginTop: 5,
                marginBottom: 9,
              }}
              numberOfLines={1}>
              {lastMessage?.sMsg || user.message || 'No message'}
            </Text>
            <View>
              <MDivider style={{marginTop: 10}}></MDivider>
            </View>
          </View>
        );
      }}
      left={props => (
        <View>
          <Avatar.Text
            style={{backgroundColor: ColorCode.DimGray, width: 45, height: 45}}
            labelStyle={{
              color: ColorCode.Black,
              fontSize: 22,
              fontFamily: 'OpenSans-Regular',
              marginTop: -8,
            }}
            label={user.userName.charAt(0).toUpperCase()}
          />
          <Badge
            size={10}
            style={{
              backgroundColor: user?.isUserLive ? 'green' : 'orange',
              position: 'absolute',
              bottom: 15,
              right: 5,
            }}></Badge>
        </View>
      )}
    />
  );
};

export default AllChatPage;
