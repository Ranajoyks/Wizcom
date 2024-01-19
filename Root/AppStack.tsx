import 'react-native-gesture-handler';
import React, {Component} from 'react';
import {View, StyleSheet, Text} from 'react-native';
// import {
//   Text,
//   Icon,
// } from 'native-base';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
// import { createDrawerNavigator } from '@react-navigation/drawer';
// import LoginPage from '../Login/LoginPage';
// import DashboardPage from '../Dashboard/DashboardPage';
// import DrawerContent from '../Drawer/DrawerContent';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import BaseColor from '../Core/BaseTheme';
import AppIconImage from '../assets/AppIconImage';
import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5';

import Splash from '../Page/Splash Screen/Splash';
import Icon from 'react-native-vector-icons/EvilIcons';
import Loginpage from '../Page/Login/Loginpage';
import Selectcompanypage from '../Page/Company/Selectcompanypage';
import settingspage from '../Page/Settings/Settingspage';

import Singlechatpage from '../Page/Chat/Singlechatpage';
import Allmessage from '../Page/Chat/Allmessage';
import Chatdetails from '../Page/Chat/Chatdetails';
import Branchpage from '../Page/Branch/Branchpage';
import Groupchat from '../Page/Chat/Groupchat';
import Groupchatdetails from '../Page/Chat/Groupchatdetails';
import NoficationDetails from '../Page/Chat/NoficationDetails';
import MapPage from '../Page/Map/MapPage';

const Stack = createStackNavigator();

function AppStack() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash">
        <Stack.Screen
          name="Splash"
          component={Splash}
          options={{headerShown: false, gestureEnabled: false}}
        />
        <Stack.Screen
          name="Loginpage"
          component={Loginpage}
          options={{headerShown: false, gestureEnabled: false}}
        />
        <Stack.Screen
          name="Chatdetails"
          component={Chatdetails}
          options={{headerShown: false, gestureEnabled: false}}
        />
        <Stack.Screen
          name="Groupchatdetails"
          component={Groupchatdetails}
          options={{headerShown: false, gestureEnabled: false}}
        />
        <Stack.Screen
          name="Selectcompanypage"
          component={Selectcompanypage}
          options={{headerShown: false, gestureEnabled: false}}
        />
        <Stack.Screen
          name="settingspage"
          component={settingspage}
          options={{headerShown: false, gestureEnabled: false}}
        />

        <Stack.Screen
          name="Branchpage"
          component={Branchpage}
          options={{headerShown: false, gestureEnabled: false}}
        />
        <Stack.Screen
          name="Singlechatpage"
          component={Singlechatpage}
          options={{headerShown: false, gestureEnabled: false}}
        />
        <Stack.Screen
          name="Allmessage"
          component={Allmessage}
          options={{headerShown: false, gestureEnabled: false}}
        />
        <Stack.Screen
          name="Groupchat"
          component={Groupchat}
          options={{headerShown: false, gestureEnabled: false}}
        />
        <Stack.Screen
          name="NoficationDetails"
          component={NoficationDetails}
          options={{headerShown: false, gestureEnabled: false}}
        />
        <Stack.Screen
          name="MapPage"
          component={MapPage}
          options={{headerShown: false, gestureEnabled: false}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export const HeaderTittle = (props: any) => {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignContent: 'center',
        // alignSelf: 'center',
        marginLeft: '17%',
      }}>
      <Text
        style={{
          color: BaseColor.HeaderColor,
          fontWeight: 'bold',
          alignSelf: 'center',
          fontSize: 20,
        }}>
        {props.Title}
      </Text>
      {props.TitleIconRight !== null && (
        <FontAwesome5Icon
          style={{marginLeft: 10, alignSelf: 'center'}}
          size={20}
          color={BaseColor.ColorWhite}
          name={props.TitleIconRight}></FontAwesome5Icon>
      )}
    </View>
  );
};

const DrawerIcon = (props: any) => {
  return (
    <EvilIcons
      name="navicon"
      size={40}
      style={{marginStart: 10}}
      color={BaseColor.HeaderColor}
      onPress={() => {
        props.navigation.openDrawer();
      }}
    />
  );
};
const SearchIcon = (props: any) => {
  return (
    <Icon
      name="search"
      style={{color: BaseColor.ColorWhite}}
      onPress={() => {
        props.navigation.navigate('ShowcaseSearchPage');
      }}
    />
  );
};

const HearderOptions = (props: any) => {
  var {navigation, Title, ShowLeft, ShowRight, ShowSearch, TitleOnly} = props;

  if (ShowRight === undefined) {
    ShowRight = true;
  }

  if (ShowLeft === undefined) {
    ShowLeft = true;
  }
  if (TitleOnly) {
    ShowLeft = false;
    ShowRight = false;
  }
  if (ShowSearch === undefined) {
    ShowSearch = true;
  }
  return {
    headerTransparent: true,
    headerLeft: () =>
      ShowLeft ? <DrawerIcon navigation={navigation} /> : <></>,
    headerRight: () =>
      ShowRight ? (
        <View style={styles.iconContainer}>
          {ShowSearch && (
            <View style={{marginRight: 30, alignSelf: 'center'}}>
              <SearchIcon navigation={navigation} />
            </View>
          )}
          <View style={{alignSelf: 'center', justifyContent: 'center'}}></View>
        </View>
      ) : (
        <></>
      ),
    headerTitle: () => <HeaderTittle {...props} />,
    headerStyle: {
      backgroundColor: BaseColor.HeaderColor,
    },
  };
};
const styles = StyleSheet.create({
  iconContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default AppStack;
