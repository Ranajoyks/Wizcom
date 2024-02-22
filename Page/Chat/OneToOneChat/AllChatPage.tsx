

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
import { ChatUser } from '../../../Entity/ChatUser';
import SessionHelper from '../../../Core/SessionHelper';
import AppDBHelper from '../../../Core/AppDBHelper';
import SignalRApi from '../../../DataAccess/SignalRApi';
import { SignalRHubConnection } from '../../../DataAccess/SignalRHubConnection';
import ChatUserOptions from '../../../Redux/Reducer/NotificationOptions';
import KSUtility from '../../../Core/KSUtility';
import { MHeader } from '../../../Control/MHeader';
import MHeaderOptions from '../../../Redux/Reducer/MHeaderOptions';
import OneToOneChatOptions, { GetFilteredUserList } from '../../../Redux/Reducer/OneToOneChatOptions';
import UIHelper from '../../../Core/UIHelper';
import { ShowPageLoader } from '../../../Redux/Store';


const AllChatPage = () => {

  const dispatch = useAppDispatch()
  const filteredUserList = useAppSelector(GetFilteredUserList)
  const pageData = useAppSelector(i => i.PageOptions)

  const [isPageRefreshing, setIsPageRefreshing] = useState(false)


  var FetchMessageInterval: NodeJS.Timeout;




  useEffect(() => {
    InitilizeOnce()
    return () => {
      clearInterval(FetchMessageInterval);
    }
  }, [])



  const InitilizeOnce = async () => {
    //If no data found in local storage then page need to wait for network data
    var chatId = await SessionHelper.GetChatId()

    AppDBHelper.GetChatUsers(chatId!).then(res => {
      dispatch(OneToOneChatOptions.actions.UpdateAllUserList(res ?? []))
    })

    FetchAllUserAndUnReadMessages()

    FetchMessageInterval = setInterval(() => {
      FetchAllUserAndUnReadMessages()
    }, 1000 * 60)

  }

  const UpdateAllOnlineUser = async (allUsers: ChatUser[]) => {
    dispatch(OneToOneChatOptions.actions.UpdateAllUserList(allUsers));

  };

  const FetchAllUserAndUnReadMessages = async () => {
    var branch = await SessionHelper.GetBranch()
    var tempSenderChatId = await SessionHelper.GetChatId()
    setIsPageRefreshing(true)
    SignalRHubConnection.GetUserList().then((res) => {
      setIsPageRefreshing(false)
      UpdateAllOnlineUser(res)
    })
    SignalRApi.GetUsersWithMessage(tempSenderChatId!, branch?.lId!).then((cuResponse) => {
      if (!cuResponse.data) {
        console.error("No data inside GetUsersWithMessage ")
        return
      }

      dispatch(OneToOneChatOptions.actions.UpdateAllUserList(cuResponse.data))
      dispatch(OneToOneChatOptions.actions.LoadUserOneToOneChatList(cuResponse.data))
      AppDBHelper.SetChatUsers(cuResponse.data, tempSenderChatId!)
    })


  }


  console.log("Re render, all chat page " + filteredUserList.length + new Date())
  return (
    <React.Fragment>
      <SafeAreaView>
        <View style={{ marginTop: 10 }}>
          <FlatList
            data={filteredUserList}
            keyExtractor={e => e.lId + ''}
            refreshing={isPageRefreshing}
            onRefresh={FetchAllUserAndUnReadMessages}
            renderItem={((d) => {
              return <ChatUserScreen data={d.item} OnUserListRefresRequest={FetchAllUserAndUnReadMessages} />
            })}
            ListEmptyComponent={EmptyListMessage}

          />
        </View>
      </SafeAreaView>
    </React.Fragment>
  );
}


const ChatUserScreen = (props: { data: ChatUser, OnUserListRefresRequest: () => void }) => {
  const users = useAppSelector(i => i.OneToOneChatOptions.AllUserList)
  const user = users.find(i => i.lId == props.data.lId)!

  const navigate = useNavigation<NavigationProps>()
  var unreadMessageList = user.AllChatOneToOneList?.filter(i => !i.bStatus && i.lReceiverId != user.lId)
  var lastMessage = user.AllChatOneToOneList?.length ? user.AllChatOneToOneList[0] : undefined
  //console.log("Re render, ChatUserScreen " + new Date())
  return (

    <List.Item onPress={() => {
      navigate.navigate("OneToOneChatPage2", { SecondUser: user, OnUserListRefresRequest: props.OnUserListRefresRequest })
    }}
      style={{ marginLeft: 5, paddingTop: 0, paddingBottom: 0, }}
      title={user.userName}
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


export default AllChatPage;
