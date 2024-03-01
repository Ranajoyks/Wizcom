

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
import KSUtility from '../../../Core/KSUtility';
import OneToOneChatOptions, { GetFilteredUserList } from '../../../Redux/Reducer/OneToOneChatOptions';
import ReduxDataHelper from '../../../Redux/ReduxDataHelper';


const AllChatPage = () => {

  const dispatch = useAppDispatch()
  const filteredOneToOneUserListData = useAppSelector(GetFilteredUserList)
  const [isPageRefreshing, setIsPageRefreshing] = useState(false)


  useEffect(() => {
    InitilizeOnce()
  }, [])



  const InitilizeOnce = async () => {
    //If no data found in local storage then page need to wait for network data
    var chatId = await SessionHelper.GetChatId()
    if (!chatId) {
      console.error("Chatid is empty here")
      return
    }

    var res = await AppDBHelper.GetChatUsers(chatId)

    if (res?.length) {
      dispatch(OneToOneChatOptions.actions.UpdateAllUserListAndMessage(res))
    }
    ReduxDataHelper.UpdateOneToOneUserStatus(dispatch)
    ReduxDataHelper.UpdateOneToOneChatMessages(dispatch)
  }

  const HandleScreenRefreshRequest = async (showLoader: boolean) => {
    setIsPageRefreshing(showLoader && true)
    ReduxDataHelper.UpdateOneToOneUserStatus(dispatch)
    await ReduxDataHelper.UpdateOneToOneChatMessages(dispatch)
    setIsPageRefreshing(false)
  }


  console.log("Re render, all chat page " + filteredOneToOneUserListData.length + new Date())

  return (
    <React.Fragment>
      <SafeAreaView>
        <View style={{ marginTop: 10 }}>
          <FlatList
            data={filteredOneToOneUserListData}
            initialNumToRender={15}
            keyExtractor={e => e.lId + ''}
            refreshing={isPageRefreshing}
            onRefresh={() => { HandleScreenRefreshRequest(true) }}
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


const ChatUserScreen = (props: { data: ChatUser }) => {
  const users = useAppSelector(i => i.OneToOneChatOptions.AllUserList)
  const user = users.find(i => i.lId == props.data.lId)!

  const navigate = useNavigation<NavigationProps>()
  var unreadMessageList = user.AllChatOneToOneList?.filter(i => !i.bStatus && i.lReceiverId != user.lId)
  var lastMessage = user.AllChatOneToOneList?.length ? user.AllChatOneToOneList[0] : undefined
  //console.log("Re render, ChatUserScreen for user " + user.userFullName + "-->" + new Date())
  return (

    <List.Item onPress={() => {
      navigate.navigate("OneToOneChatPage2", { SecondUser: user.lId })
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
      left={() => (
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
