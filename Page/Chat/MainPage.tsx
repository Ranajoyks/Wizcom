import React, { useEffect } from 'react';
import SessionHelper from '../../Core/SessionHelper';
import { SafeAreaView } from 'react-native';

import { styles } from '../MainStyle';
import { SignalRHubConnection } from '../../DataAccess/SignalRHubConnection';
import { MHeader } from '../../Control/MHeader';

import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { ShowToastMessage } from '../../Redux/Store';
import AllChatPage from './OneToOneChat/AllChatPage';
import { useAppDispatch } from '../../Redux/Hooks';
import Geolocation from '@react-native-community/geolocation';
import SignalRApi from '../../DataAccess/SignalRApi';
import { Chat } from '../../Entity/Chat';

import { GroupChat } from '../../Entity/GroupChat';
import OneToOneChatOptions from '../../Redux/Reducer/OneToOneChatOptions';
import GroupChatOptions from '../../Redux/Reducer/GroupChatOptions';
import NotificationMainPage from './Notification/NotificationMainPage';
import GroupMainPage2 from './GroupChat/GroupMainPage2';

const MainPage = () => {
  const Tab = createMaterialTopTabNavigator()

  const dispatch = useAppDispatch()


  useEffect(() => {
    IniTilizeOnce(true);
    GetLocation();

  }, []);

  const IniTilizeOnce = async (showPageLoader: boolean) => {

    var IsConnected = await SignalRHubConnection.IsConnected();

    if (!IsConnected) {
      ShowToastMessage(SignalRHubConnection.connectionErrorMessage);
      return;
    }



    SignalRHubConnection.OnReceiveMessege((newMessage: Chat) => {
      console.log("MessageReceive", newMessage)
      dispatch(OneToOneChatOptions.actions.AddNewOneToOneChat(newMessage))
    });

    SignalRHubConnection.OnReceiveGroupMessage((newMessage: GroupChat) => {
      console.log("OnReceiveGroupMessage", newMessage)
      dispatch(GroupChatOptions.actions.AddNewGroupChat(newMessage))
    })
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
      SignalRApi.SetLocation(LocationData).then(locRes => console.log('LocationResponse: ', locRes));

    });
  };

  console.log("re render Mainpage", new Date())

  return (
    <SafeAreaView style={styles.container}>
      <MHeader
        ShowSearchIcon
        RightSideIcon="UserProfile"
      />

      <Tab.Navigator
        initialRouteName="AllChat"
        sceneContainerStyle={{ backgroundColor: '#ffffff' }}
        screenOptions={{
          tabBarStyle: { position: 'relative' },
          tabBarActiveTintColor: '#000000',
          tabBarInactiveTintColor: '#A6A6A6',
          tabBarLabelStyle: { fontSize: 13, fontFamily: 'Poppins-Regular', textTransform: 'capitalize' },
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
            return <GroupMainPage2   />;
          }}
        />
         {/*<Tab.Screen
          name="Notifications"
          options={{ tabBarLabel: 'Notifications' }}
          children={() => {
            return <NotificationMainPage />;
          }}
        /> */}
      </Tab.Navigator>
    </SafeAreaView>
  );
};

export default MainPage;
