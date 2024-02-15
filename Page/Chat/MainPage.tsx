import React, { useEffect, useState } from 'react';
import SessionHelper from '../../Core/SessionHelper';
import { View, Text, SafeAreaView } from 'react-native';

import { styles } from '../MainStyle';
import { SignalRHubConnection } from '../../DataAccess/SignalRHubConnection';
import { MHeader } from '../../Control/MHeader';

import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { ShowPageLoader, ShowToastMessage } from '../../Redux/Store';
import AllChatPage from './OneToOneChat/AllChatPage';
import { useAppDispatch, useAppSelector } from '../../Redux/Hooks';
import ChatUserOptions from '../../Redux/Reducer/ChatUserOptions';
import SnackbarOptions from '../../Redux/Reducer/SnackbarOptions';
import Geolocation from '@react-native-community/geolocation';
import ERESApi from '../../DataAccess/ERESApi';
import SignalRApi from '../../DataAccess/SignalRApi';
import UIHelper from '../../Core/UIHelper';
import GroupPage from './GroupChat/GroupMainPage2';
import { Chat } from '../../Entity/Chat';
import { Group } from '../../Entity/Group';

import { ChatUser } from '../../Entity/ChatUser';
import AppDBHelper from '../../Core/AppDBHelper';
import { GroupChat } from '../../Entity/GroupChat';




function FeedScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Feed!</Text>
    </View>
  );
}
function NotificationsScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Notifications!</Text>
    </View>
  );
}

function GroupScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Group!</Text>
    </View>
  );
}

const MainPage = () => {
  const Tab = createMaterialTopTabNavigator();


  var chatId: string | undefined;

  const chatUserOptions = useAppSelector(i => i.ChatUserOptions)
  const dispatch = useAppDispatch()

  useEffect(() => {
    IniTilizeOnce(true);
    GetLocation();

  }, []);

  const IniTilizeOnce = async (showPageLoader: boolean) => {
    ShowPageLoader(true);
    var IsConnected = await SignalRHubConnection.IsConnected();

    if (!IsConnected) {
      ShowToastMessage(SignalRHubConnection.connectionErrorMessage);
      return;
    }

    var chatId = await SessionHelper.GetChatId()

    SignalRHubConnection.OnReceiveMessege((newMessage: Chat) => {
      console.log("MessageReceive", newMessage)
      dispatch(ChatUserOptions.actions.AddNewOneToOneChat(newMessage))
    });

    SignalRHubConnection.OnReceiveGroupMessage((newMessage: GroupChat) => {
      console.log("OnReceiveGroupMessage", newMessage)
      dispatch(ChatUserOptions.actions.AddNewGroupChat(newMessage))
    })

    console.log("chatId", chatId)
    //populating screen using localData
    var localChatUserList = await AppDBHelper.GetChatUsers(chatId!)
    var localGroupList = await AppDBHelper.GetGroups(chatId!)

    console.log("localChatUserList", localChatUserList?.length)
    console.log("localGroupList", localGroupList?.length)

    ShowPageLoader(false);

    if (localChatUserList) {
      dispatch(ChatUserOptions.actions.UpdateAllUserList(localChatUserList));
      dispatch(ChatUserOptions.actions.UpdateFilterUserList(localChatUserList));
    }

    if (localGroupList) {
      dispatch(ChatUserOptions.actions.UpdateAllGroupList(localGroupList));
      dispatch(ChatUserOptions.actions.UpdateFilterGroupList(localGroupList));
    }

  };

  const GetLocation = async () => {
    var Chatid = await SessionHelper.GetChatId();
    Geolocation.getCurrentPosition(async info => {
      var LocationData = {
        UserId: Chatid,
        Lat: info?.coords?.latitude.toString(),
        Long: info?.coords?.latitude.toString(),
      };
      // console.log('Location Data: ', LocationData);
      var LocationResponse = await SignalRApi.SetLocation(LocationData);
      console.log('LocationResponse: ', LocationResponse);
    });
  };
  const HandlehearchTextChange = (searchText: string) => {

    var allUserList = chatUserOptions.AllUserList;
    var FilterUserList = allUserList.filter(i =>
      i.userName.toLowerCase().includes(searchText.toLowerCase()),
    );
    dispatch(ChatUserOptions.actions.UpdateFilterUserList(FilterUserList));
  };


  return (
    <SafeAreaView style={styles.container}>
      <MHeader
        ShowSearchIcon
        RightSideIcon="UserProfile"
        OnSearchDataChange={HandlehearchTextChange}
        OnSeachClose={HandlehearchTextChange}
      />

      <Tab.Navigator
        initialRouteName="AllChat"
        sceneContainerStyle={{backgroundColor:'#ffffff'}}
        screenOptions={{
          tabBarStyle: { position: 'relative' },
          tabBarActiveTintColor: '#000000',
          tabBarInactiveTintColor:'#A6A6A6',
          tabBarLabelStyle: { fontSize: 13, fontFamily: 'Poppins-Regular',textTransform:'capitalize' },
          tabBarScrollEnabled: true,
        }}>
        <Tab.Screen

          name="AllChatPage"
          options={{ tabBarLabel: 'All Messages' }}
          children={() => {
            return <AllChatPage />;
          }}
        />

        <Tab.Screen
          name="Group"
          options={{ tabBarLabel: 'Group' }}
          children={() => {
            return <GroupPage OnGroupListRefresRequest={() => { }} />;
          }}
        />
        <Tab.Screen
          name="Notifications"
          component={NotificationsScreen}
          options={{ tabBarLabel: 'Notifications' }}
        />
      </Tab.Navigator>
    </SafeAreaView>
  );
};

export default MainPage;
