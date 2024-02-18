import { useNavigation } from '@react-navigation/native';
import {
  Appbar,
  AppbarHeaderProps,
  Menu,
  Searchbar,
  Text,
} from 'react-native-paper';

import AppIconImage from '../assets/AppIconImage';
import {
  Alert,
  GestureResponderEvent,
  StatusBar,
  StatusBarProps,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import React, { useEffect, useState } from 'react';
import { ColorCode } from '../Page/MainStyle';
import { NavigationProps } from '../Core/BaseProps';
import SessionHelper from '../Core/SessionHelper';
import User from '../Entity/User';
import { useAppDispatch, useAppSelector } from '../Redux/Hooks';
import IonIcon from 'react-native-vector-icons/Ionicons';
import ChatAvatar from '../Page/Chat/ChatAvatar';
import AuthenticationHelper from '../Core/AuthenticationHelper';
import MHeaderOptions, { UserShowMode } from '../Redux/Reducer/MHeaderOptions';




export interface MHeaderProps {
  Title?: string;
  AppBarProps?: AppbarHeaderProps;
  ShowSearchIcon?: boolean;
  //OnSearchDataChange?: (value: string) => void;
  //OnSeachClose?: (value: string) => void;
  RightSideIcon?: 'Setting' | 'UserProfile' | 'None';
}
export const MHeader = (props: MHeaderProps) => {
  const [ShowSearch, setShowSearch] = React.useState(false);

  const [userName, setUserName] = React.useState('');
  const navigation = useNavigation<NavigationProps>();

  const dispatch = useAppDispatch()

  useEffect(() => {
    (async function () {
      var user = await SessionHelper.GetUserDetails();
      setUserName(user?.userName ?? '');
    })();
  }, [userName]);

  return (
    <>
      <MStatusBar />
      {!ShowSearch && (
        <View
          style={{
            backgroundColor: ColorCode.White,
            height: 40,
            marginTop: 10,

            marginLeft: 20,
            marginRight: 20,
            zIndex: 1000,
            flexDirection: 'row',
          }}>
          <View style={{ width: '30%' }}>
            <AppIconImage style={{ width: 35, height: 35 }}></AppIconImage>
          </View>

          <Text
            style={{
              fontSize: 30,
              fontFamily: 'Poppins-Regular',
              textAlign: 'center',
              alignContent: 'center',
              color: '#545454',
              width: '40%',
            }}>
            {props.Title}
          </Text>
          {props.ShowSearchIcon && (
            <View style={{ width: '15%', alignSelf: 'center' }}>
              <TouchableOpacity onPress={() => setShowSearch(!ShowSearch)}>
                <Appbar.Action
                  icon="magnify"
                  size={30}
                  onPress={() => {
                    setShowSearch(!ShowSearch);
                  }}
                />
              </TouchableOpacity>
            </View>
          )}
          <View
            style={{
              width: props.ShowSearchIcon ? '15%' : '30%',
              flexDirection: 'row-reverse',
            }}>
            {(!props.RightSideIcon || props.RightSideIcon == 'Setting') && (
              <IonIcon
                onPress={() => {
                  navigation.navigate('SettingsPage');
                }}
                size={35}
                name="settings-outline"
              />
            )}
            {props?.RightSideIcon == 'UserProfile' && (
              <UserProfileScreen userName={userName} />
            )}
          </View>
        </View>
      )}
      {props.ShowSearchIcon && ShowSearch && (
        <>
          <MSerachBar
            onIconPress={() => {
              dispatch(MHeaderOptions.actions.UpdateSearchText(""));
              setShowSearch(!ShowSearch);
            }}
            OnSearchDataChange={(e) => { dispatch(MHeaderOptions.actions.UpdateSearchText(e)) }}
          />
        </>
      )}
    </>
  );
};

interface MSearchBarProps {
  OnSearchDataChange?: (value: string) => void;
  onIconPress?: () => void;
}

const MSerachBar = (props: MSearchBarProps) => {
  const [searchQuery, setSearchQuery] = React.useState('');

  const onChangeSearch = (query: React.SetStateAction<string>) => {
    setSearchQuery(query);

    props?.OnSearchDataChange && props.OnSearchDataChange(query + '');
  };

  return (
    <View
      style={{
        paddingLeft: 10,
        paddingRight: 10,
        paddingTop: 10,
        paddingBottom: 5,
      }}>
      <Searchbar
        clearButtonMode="always"
        collapsable
        elevation={5}
        mode="bar"
        textContentType="jobTitle"
        placeholder="Search"
        onChangeText={onChangeSearch}
        value={searchQuery}
        showDivider
        onIconPress={() => {
          setSearchQuery('');
          props.onIconPress && props.onIconPress();
        }}
        inputStyle={{ paddingLeft: 2, paddingRight: 2 }}
      />
    </View>
  );
};

export const MStatusBar = (props: StatusBarProps) => {
  return (
    <>
      <StatusBar backgroundColor="blue" />
    </>
  );
};

// interface UserDetailsScreenProps {
//     AllUser?: ChatUser[],
//     OnUserLableChange?: (Users: ChatUser[]) => void
// }

export const UserProfileScreen = (props: { userName: string }) => {
  const [visible, setVisible] = React.useState(false);
  const chatUserOptions = useAppSelector(i => i.OneToOneChatOptions);
  const [info, setInfo] = useState<{
    userName?: string;
    companyId?: string;
    user?: User;
    FCMToken?: string;
    ConnectionId?: string;
  }>({});
  const navigation = useNavigation<NavigationProps>();
  const AllUserList = chatUserOptions.AllUserList;
  const onlineUsers = AllUserList?.filter(i => i.isUserLive);
  const offlineUsers = AllUserList.filter(i => !i.isUserLive);
  const [showMode, setshowMode] = useState<UserShowMode>('Online User');
  const dispatch = useAppDispatch();
  useEffect(() => {
    (async function () {
      var chatId = await SessionHelper.GetChatId();
      const user = await SessionHelper.GetUserDetails();
      var companyID = await SessionHelper.GetCompanyID();
      var UserDetails = await SessionHelper.GetUserDetails();
      var FCMToken = await SessionHelper.GetFCMToken();

      await setInfo({
        companyId: companyID,
        ConnectionId: chatId,
        FCMToken: FCMToken,
        user: user,
        userName: UserDetails?.userName,
      });
    })();
  }, [info?.userName]);

  const Logout = async () => {
    Alert.alert(
      'Exit!!',
      'Do you want to logout?',
      [
        { text: 'No' },
        { text: 'Yes', onPress: () => AuthenticationHelper.OnLogOut(navigation) },
      ],
      { cancelable: false },
    );
  };
  const CreateGroup = async () => {
    setVisible(false)
    navigation.navigate('CreateGroup', {
      GroupID: '',
    });
  };

  const HandleUserlabelClicked = (event: GestureResponderEvent) => {
    var isOnLineUser = showMode == 'Online User';
    var newMode: UserShowMode = isOnLineUser ? 'All User' : 'Online User'
    setshowMode(newMode);


    dispatch(MHeaderOptions.actions.UpdateUserShowMode(newMode));
  };
  return (
    <View>
      <Menu
        visible={visible}
        elevation={5}
        contentStyle={{ backgroundColor: ColorCode.White, marginTop: 50 }}
        onDismiss={() => setVisible(false)}
        anchor={
          <ChatAvatar
            size={35}
            label={props.userName}
            onPress={() => setVisible(true)}
          />
        }>
        <View style={{ ...localStyles.dropdownContainer }}>
          <MenuItem2 HearderText="User:" ItemText={info?.userName} />
          <View style={localStyles.divider}></View>
          <MenuItem2 HearderText="Designation:" ItemText={''} />
          <View style={localStyles.divider}></View>
          <MenuItem2
            HearderText="Connection Code:"
            ItemText={info?.companyId}
          />
          <View style={localStyles.divider}></View>
          <MenuItem2 HearderText="Version:" ItemText={'1.0.0'} />
          <View style={localStyles.divider}></View>
          {AllUserList && (
            <>
              <View style={localStyles.dividerView}>
                <TouchableOpacity onPress={HandleUserlabelClicked}>
                  <Text style={localStyles.InfoItemHeader}>{showMode}</Text>
                </TouchableOpacity>
                <Text style={localStyles.InfoItemData}>
                  {'' + onlineUsers?.length + '/' + offlineUsers?.length}
                </Text>
              </View>
              <View style={localStyles.divider}></View>
            </>
          )}
          <TouchableOpacity onPress={CreateGroup}>
            <MenuItem2 HearderText="New Group" />
          </TouchableOpacity>
          <View style={localStyles.divider}></View>
          <View style={localStyles.dividerView}>
            <TouchableOpacity onPress={Logout}>
              <Text style={{ ...localStyles.InfoItemHeader }}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Menu>
    </View>
  );
};

const localStyles = StyleSheet.create({
  dividerView: {
    marginBottom: 5,
    marginTop: 5,
  },
  divider: {
    height: 1,
    backgroundColor: 'gray',
    opacity: 0.5,
  },
  dropdownContainer: {
    backgroundColor: ColorCode.White,
    paddingTop: 0,
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 0,
  },
  InfoItemHeader: {
    fontFamily: 'OpenSans-SemiBold',
    color: '#0383FA',
    fontSize: 12,
  },
  InfoItemData: {
    color: 'black',
    fontSize: 12,
    fontFamily: 'OpenSans-SemiBold',
  },
});

const MenuItem2 = (props: { HearderText?: string; ItemText?: string }) => {
  return (
    <View style={localStyles.dividerView}>
      <Text style={localStyles.InfoItemHeader}>{props.HearderText}</Text>
      <Text style={localStyles.InfoItemData}>{props.ItemText}</Text>
    </View>
  );
};
