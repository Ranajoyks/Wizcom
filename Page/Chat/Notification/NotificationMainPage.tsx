

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
import ChatUserOptions, { GetFilteredNotificationList } from '../../../Redux/Reducer/NotificationOptions';
import { NotificationUser } from '../../../Entity/NotificationUser';
import KSUtility from '../../../Core/KSUtility';
import NotificationOptions from '../../../Redux/Reducer/NotificationOptions';





const NotificationMainPage = () => {

  const dispatch = useAppDispatch()
  const allUserNotificationListData = useAppSelector(i => i.NotificationOptions.AllUserNotificationList)
  const filtereUserNotificationListData = useAppSelector(GetFilteredNotificationList)
  // console.log("filtereUserNotificationListData: ",filtereUserNotificationListData);
  

  const [isPageRefreshing, setIsPageRefreshing] = useState(false)


  var FetchMessageInterval: NodeJS.Timeout;
  useEffect(() => {
    InitilizeOnce()
    return () => {
      clearInterval(FetchMessageInterval);
    }
  }, [])


  const InitilizeOnce = async () => {
    var chatId = await SessionHelper.GetChatId()
    if (!chatId) {
      console.error("Chatid is empty here")
      return
    }

    var res = await AppDBHelper.GetNotificationUsers(chatId)

    if (res?.length) {
      dispatch(NotificationOptions.actions.UpdateAllUserNotificationListAndMessage(res))
    }

    FetchAllUserNotificationMessages(KSUtility.IsEmpty(res))

    FetchMessageInterval = setInterval(() => {
      FetchAllUserNotificationMessages(false)
      // SignalRHubConnection.GetUserList().then(res => { UpdateAllOnlineUser(res) })
    }, 1000 * 1)

  }

  // const UpdateAllOnlineUser = async (allUsers: NotificationUser[]) => {
  //   dispatch(NotificationOptions.actions.UpdateAllNotificationUserList(allUsers));
  // };

  const FetchAllUserNotificationMessages = async (showLoader: boolean) => {
    var branch = await SessionHelper.GetBranch()
    var tempSenderChatId = await SessionHelper.GetChatId()

    var cuResponse = await SignalRApi.GetAllUserNotification(tempSenderChatId!, branch?.lId!)
    // console.log("NotificatinDetails: ", cuResponse.data);
    if (cuResponse.data) {
      dispatch(NotificationOptions.actions.UpdateAllUserNotificationListAndMessage(cuResponse.data))
      AppDBHelper.SetNotificationUsers(cuResponse.data, tempSenderChatId!)

    }
  }


  return (
    <React.Fragment>
      <SafeAreaView>
        <View style={{ marginTop: 10 }}>
          <FlatList
            data={filtereUserNotificationListData}
            keyExtractor={e => e.lId + ''}
            refreshing={isPageRefreshing}

            onRefresh={() => { FetchAllUserNotificationMessages(true) }}
            renderItem={((d) => {
              return <ChatUserScreen data={d.item} />
            })}
            ListEmptyComponent={EmptyListMessage}

          />
        </View>
      </SafeAreaView>
    </React.Fragment>
  );
}


const ChatUserScreen = (props: { data: NotificationUser }) => {    
  const users = useAppSelector(i => i.NotificationOptions.AllUserNotificationList)
  const user = users.find(i => i.lId == props.data.lId)!

  const navigate = useNavigation<NavigationProps>()
  var unreadMessageList = user.AllNotificatonOneToOneList?.filter(i => !i.bStatus && i.lReceiverId != user.lId)
  var lastMessage = user.AllNotificatonOneToOneList?.length ? user.AllNotificatonOneToOneList[0] : undefined
  

  return (

    <List.Item onPress={() => {
      navigate.navigate("NotificationPage", { SecondUser: user })
    }}
      style={{ marginLeft: 5, paddingTop: 0, paddingBottom: 0, }}
      title={user.userFullName}
      titleStyle={{ fontFamily: 'OpenSans-SemiBold', fontSize: 15, marginTop: 0 }}
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
              <MDivider></MDivider>
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
              bottom: 20,
              right: 0,
            }}></Badge>
        </View>
      )}
    />
  );
}


export default NotificationMainPage;
