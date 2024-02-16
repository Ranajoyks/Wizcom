import 'react-native-gesture-handler';
import React from 'react';

import { NavigationContainer } from '@react-navigation/native';
import { StackNavigationProp, createStackNavigator } from '@react-navigation/stack';


import SplashPage from '../Page/Splash/SplashPage';
import LoginPage from '../Page/Login/LoginPage';
import CompanySelectionPage from '../Page/Company/CompanySelectionPage';


import Branchpage from '../Page/Branch/BranchPage';


import MapPage from '../Page/Map/MapPage';
import MainPage from '../Page/Chat/MainPage';

import SettingsPage from '../Page/Settings/SettingsPage';
import { Branch } from '../Entity/Branch';
import NotificationDetailsPage from '../Page/Chat/Notification/NotificationDetailsPage';
import { navigationRef } from '../App';
import OneToOneChatPage2 from '../Page/Chat/OneToOneChat/OneToOneChatPage2';
import { ChatUser } from '../Entity/ChatUser';
import { Group } from '../Entity/Group';
import CreateGroup from '../Page/Chat/GroupChat/CreateGroupPage';
import DeleteGroupMember from '../Page/Chat/GroupChat/DeleteGroupMember';
import AllGroupMember from '../Page/Chat/OneToOneChat/AllGroupMember';
import GroupChatDetailsPage2 from '../Page/Chat/GroupChat/GroupChatDetailsPage2';
import NotificationPage from '../Page/Chat/Notification/NotificationDetailsPage';
import { NotificationUser } from '../Entity/NotificationUser';



export type PageNames = StackNavigationProp<RootStackParamList>;


export type RootStackParamList = {
  SplashPage: undefined;
  LoginPage: undefined,

  CompanySelectionPage: undefined,
  SettingsPage: undefined,
  BranchPage: { BranchList: Branch[] },
  NotificationDetailsPage: { User: [] },
  MainPage: undefined,
  MapPage: undefined,

  OneToOneChatPage2: { SecondUser: ChatUser, OnUserListRefresRequest?: () => void }
  AllChatPage: undefined,

  GroupMainPage: undefined,
  GroupChatDetailsPage2: { Group: Group, OnBackRefresRequest?: () => void },
  CreateGroup: { GroupID: string }
  DeleteGroupMember: { GroupID: string }
  AllGroupMember: { GroupID: string }
  NotificationPage: { SecondUser: NotificationUser, OnUserListRefresRequest?: () => void }
  // OneToOneChatDetailsPage: { OnReturn: (isSuccess: boolean) => void };
  // AnalysisPage: { licenseNo: string },

}

const Stack = createStackNavigator<RootStackParamList>();

function AppStack() {
  return (
    <NavigationContainer ref={navigationRef} >
      <Stack.Navigator initialRouteName="SplashPage"  >
        <Stack.Screen
          name="SplashPage"
          component={SplashPage}
          options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen
          name="LoginPage"
          component={LoginPage}
          options={{ headerShown: false, gestureEnabled: false }}
        />

        <Stack.Screen
          name="GroupChatDetailsPage2"
          component={GroupChatDetailsPage2}
          options={{ headerShown: false, gestureEnabled: false }}
        />
        <Stack.Screen
          name="CompanySelectionPage"
          component={CompanySelectionPage}
          options={{ headerShown: false, gestureEnabled: false }}
        />
        <Stack.Screen
          name="SettingsPage"
          component={SettingsPage}
          options={{ headerShown: false, gestureEnabled: false }}
        />

        <Stack.Screen
          name="BranchPage"
          component={Branchpage}
          options={{ headerShown: false, gestureEnabled: false }}
        />
        <Stack.Screen
          name="MainPage"
          component={MainPage}
          options={{ headerShown: false, gestureEnabled: false }}
        />



        <Stack.Screen
          name="NotificationPage"
          component={NotificationPage}
          options={{ headerShown: false, gestureEnabled: false }}
        />
        <Stack.Screen
          name="MapPage"
          component={MapPage}
          options={{ headerShown: false, gestureEnabled: false }}
        />
        <Stack.Screen
          name="OneToOneChatPage2"
          component={OneToOneChatPage2}
          options={{ headerShown: false, gestureEnabled: false }}
        />

        <Stack.Screen
          name="CreateGroup"
          component={CreateGroup}
          options={{ headerShown: false, gestureEnabled: false }}
        />
        <Stack.Screen
          name="DeleteGroupMember"
          component={DeleteGroupMember}
          options={{ headerShown: false, gestureEnabled: false }}
        />
        <Stack.Screen
          name="AllGroupMember"
          component={AllGroupMember}
          options={{ headerShown: false, gestureEnabled: false }}
        />

      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default AppStack;
