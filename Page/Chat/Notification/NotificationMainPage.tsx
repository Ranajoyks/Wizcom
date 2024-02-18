

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  FlatList,
} from 'react-native';



import { } from '@react-navigation/native';

import { ColorCode } from '../../MainStyle';
import { useNavigation } from '@react-navigation/native';
import { NavigationProps } from '../../../Core/BaseProps';
import { Avatar, Badge, List } from 'react-native-paper';
import { useAppDispatch, useAppSelector } from '../../../Redux/Hooks';

import { EmptyListMessage } from '../../../Control/EmptyListMessage';
import { MDivider } from '../../../Control/MDivider';
import SessionHelper from '../../../Core/SessionHelper';
import AppDBHelper from '../../../Core/AppDBHelper';
import SignalRApi from '../../../DataAccess/SignalRApi';
import ChatUserOptions from '../../../Redux/Reducer/NotificationOptions';
import { NotificationUser } from '../../../Entity/NotificationUser';
import KSUtility from '../../../Core/KSUtility';





const NotificationMainPage = () => {

  const dispatch = useAppDispatch()
  const chatUserOptions = useAppSelector(i => i.ChatUserOptions)
  var FetchMessageInterval: NodeJS.Timeout;
  const [filterIsCalled, setFilterIsCalled] = useState(false);
  useEffect(() => {
    InitilizeOnce()
    return () => {
      clearInterval(FetchMessageInterval);
    }
  }, [])


  const InitilizeOnce = async () => {

    setFilterIsCalled(false)

    //If no data found in local storage then page need to wait for network data

    console.log("GetUserList", "start");
    // SignalRHubConnection.GetUserList().then((res) => {
    //   UpdateAllOnlineUser(res)
    // })

    FetchAllUserNotificationMessages()

    FetchMessageInterval = setInterval(() => {
      FetchAllUserNotificationMessages()
      // SignalRHubConnection.GetUserList().then(res => { UpdateAllOnlineUser(res) })
    }, 1000 * 60)

  }

  const UpdateAllOnlineUser = async (allUsers: NotificationUser[]) => {
    dispatch(ChatUserOptions.actions.UpdateAllNotificationUserList(allUsers));
    console.log("filterIsCalled", filterIsCalled)
    //Filter data will call only once

    dispatch(ChatUserOptions.actions.UpdateFilterNotificationUserList(allUsers));
    setFilterIsCalled(true)

  };

  const FetchAllUserNotificationMessages = async () => {
    var branch = await SessionHelper.GetBranch()
    var tempSenderChatId = await SessionHelper.GetChatId()

    var cuResponse = await SignalRApi.GetAllUserNotification(tempSenderChatId!, branch?.lId!)
    console.log("NotificatinDetails: ", cuResponse.data);


    if (cuResponse.data) {
      UpdateAllOnlineUser(cuResponse.data)
      dispatch(ChatUserOptions.actions.UpdateAllNotificationUserList(cuResponse.data))
      cuResponse.data.forEach(user => {
        dispatch(ChatUserOptions.actions.LoadUserOneToOneNotificationChatList({
          messageList: user.sMessgeList || [],
          SecondUserId: user.lId
        }))
      })
      SessionHelper.GetChatId().then((CurrentUserChatId: string | undefined) => {
        AppDBHelper.SetNotificationUsers(chatUserOptions.AllUserNotificationList, CurrentUserChatId!)
      })
    }
  }


  return (
    <React.Fragment>
      <SafeAreaView>
        <View style={{ marginTop: 10 }}>
          <FlatList
            data={chatUserOptions.FilterUserNotificationList}
            keyExtractor={e => e.lId + ''}
            refreshing={chatUserOptions.IsPageLoading}

            onRefresh={FetchAllUserNotificationMessages}
            renderItem={((d) => {
              return <ChatUserScreen data={d.item} OnUserListRefresRequest={FetchAllUserNotificationMessages} />
            })}
            ListEmptyComponent={EmptyListMessage(chatUserOptions.FilterUserNotificationList.length == 0)}

          />
        </View>
      </SafeAreaView>
    </React.Fragment>
  );
}


const ChatUserScreen = (props: { data: NotificationUser, OnUserListRefresRequest: () => void }) => {
  const users = useAppSelector(i => i.ChatUserOptions.AllUserNotificationList)
  const user = users.find(i => i.lId == props.data.lId)!

  const navigate = useNavigation<NavigationProps>()
  var unreadMessageList = user.AllNotificatonOneToOneList?.filter(i => !i.bStatus && i.lReceiverId != user.lId)
  var lastMessage = user.AllNotificatonOneToOneList?.length ? user.AllNotificatonOneToOneList[0] : undefined

  return (

    <List.Item onPress={() => {
      navigate.navigate("NotificationPage", { SecondUser: user, OnUserListRefresRequest: props.OnUserListRefresRequest })
    }}
      style={{ marginLeft: 5, paddingTop: 0, paddingBottom: 0, }}
      title={user.userName}
      titleStyle={{ fontFamily: 'OpenSans-Regular', fontSize: 15, marginTop: 0 }}
      description={() => {
        return (
          <View>
            {unreadMessageList?.length != null &&
              <Badge
                size={25}
                visible={unreadMessageList?.length > 0}
                style={
                  {
                    backgroundColor: "red",
                    position: 'absolute',
                    bottom: 30,
                    right: 0,
                  }
                }
              >{unreadMessageList.length}
              </Badge>}

            <Text style={{
              color: !KSUtility.IsEmpty(unreadMessageList) ? '#0383FA' : '#A6A6A6',
              fontFamily: 'OpenSans-Regular',
              letterSpacing: 0.2,
              fontSize: 12,
              marginTop: 5,
              marginBottom: 9,
            }} numberOfLines={1}>{lastMessage?.sMsg || user.message || "No message"}
            </Text>
            <View>
              <MDivider marginPadingTopButom={10}></MDivider>
            </View>
          </View>
        );
      }}
      left={props => (
        <View>
          <Avatar.Text
            style={{ backgroundColor: ColorCode.DimGray, width: 45, height: 45 }}
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
}


export default NotificationMainPage;
