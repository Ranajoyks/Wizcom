import {useEffect, useState} from 'react';
import SessionHelper from '../../Core/SessionHelper';
import User from '../../Entity/User';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  Image,
  TextInput,
  AppState,
  ActivityIndicator,
} from 'react-native';
import {
  Badge,
  Body,
  Content,
  Left,
  List,
  ListItem,
  Right,
  Root,
  Container,
  Header,
  Tab,
  Tabs,
  TabHeading,
} from 'native-base';
// import { TabHeading} from 'native-base';
import BaseComponent from '../../Core/BaseComponent';
import BaseState from '../../Core/BaseState';
import DeviceInfo from 'react-native-device-info';
import * as signalR from '@microsoft/signalr';
import {TouchableOpacity} from 'react-native-gesture-handler';
import axios from 'axios';
import Geolocation from '@react-native-community/geolocation';
import BackgroundTimer from 'react-native-background-timer';
import MainStyle from '../MainStyle';
import CustomPageLoader from '../../Control/CustomPageLoader';
import {useNavigation} from '@react-navigation/native';
import {now} from 'moment';
import UIHelper from '../../Core/UIHelper';

const MainPage = () => {
  const [userInfo, setUserInfo] = useState({
    UserName: '',
    BranchName: '',
    BranchID: '',
    FCMToken: '',
    ConnectionCode: '',
    SenderID: '',
  });
  const [appVersion, setAppVersion] = useState('1.0.0');
  const [OnlineText, setOnlineText] = useState('Online User');
  const [AllUser, setAllUser] = useState<User[]>([]);
  const [FilterUser, setFilterUser] = useState<User[]>([]);
  const [AllNotification, setAllNotification] = useState<User[]>([]);
  const [currentLocation, setcurrentLocation] = useState<any>();
  const [IsShow, setIsShow] = useState(true);
  const [IsOpen, setIsOpen] = useState(false);
  const [AppStatus, setAppStatus] = useState(AppState.currentState);
  const [Url, setUrl] = useState('wemessanger.azurewebsites.net');
  const [Message, setMessage] = useState('');
  const [ShowPageLoader, setShowPageLoader] = useState(false);

  const navigation = useNavigation<any>();

  useEffect(() => {
    //SessionHelper.SetSenderIdSession('65').then(() => {
    IniTilizeOnce();
    //});
  }, [AllUser.length]);

  const IniTilizeOnce = async () => {
    var FCMToken = await SessionHelper.GetFCMTokenSession();
    var ConnectionCode = await SessionHelper.GetCompanyIDSession();
    var BranchName = await SessionHelper.GetBranchNameSession();
    var UserName = await SessionHelper.GetUserNameSession();
    var BranchID = await SessionHelper.GetBranchIdSession();
    var SenderID = await SessionHelper.GetSenderIdSession();
    var tempuserInfo = {
      UserName: UserName,
      BranchName: BranchName,
      BranchID: BranchID,
      FCMToken: FCMToken,
      ConnectionCode: ConnectionCode,
      SenderID: SenderID,
    };
    await setUserInfo(tempuserInfo);
    var myId = `${tempuserInfo.ConnectionCode}_65`;
    console.log('senderId: ', myId);

    await FetchAllUser(myId);
  };
  const FetchAllUser = async (myId: string) => {
    setShowPageLoader(true);
    var finalUrl = `https://${Url}/chatHub?UserId=${myId}`;
    UIHelper.LogTime('GetUser', 'Start', finalUrl);
    var Connection = new signalR.HubConnectionBuilder()
      .withUrl(finalUrl)
      .build();
    Connection.start().then(() => {
      console.log('SignalR connected');
      Connection.invoke('GetAllUser', myId, 0)
        .then(user => {
          UIHelper.LogTime('GetUser', 'End', finalUrl);
          console.log('GetallUser: ', user);
          setAllUser(user);
          setFilterUser(user);
          setShowPageLoader(false);
          Connection.invoke('IsUserConnected', `${myId}`);
        })
        .catch((err: any) => {
          setShowPageLoader(false);
          Connection.start();
          console.log('Error to invoke: ', err);
        });
    });
  };
  const DropDownOpen = async () => {
    setIsOpen(!IsOpen);
  };
  const Search = async () => {
    setIsShow(!IsShow);
  };
  const Cancle = async () => {
    setIsShow(!IsShow);
    setMessage('');
    setFilterUser(AllUser);
  };
  const UserOnline = () => {
    // if ((OnlineText = 'Online User')) {
    //   var UserOnline = Model.alluser.filter(
    //     (i: alluser) => i.isUserLive === true,
    //   );
    //   console.log('Hi');
    //   console.log('UserOnline', UserOnline);
    //   if (UserOnline) {
    //     Model.FilterUser = UserOnline;
    //     Model.OnlineText = 'All User';
    //     this.UpdateViewModel();
    //   }
    // }
  };
  const AllUserss = () => {
    setOnlineText('Online User');
    setFilterUser(AllUser);
  };
  const SearchText = (text: string) => {
    setMessage(text);
    var FilteredUser = AllUser.filter((i: User) => {
      const itemData = `${i.userName.toLowerCase()}`;
      const textData = text.toLowerCase();
      if (textData.toLowerCase()) {
        return itemData.indexOf(textData) > -1;
      }
    });
    console.log('FilteredUser', FilteredUser);
    if (FilteredUser) {
      setFilterUser(FilteredUser);
    }
    if (text == '') {
      console.log('Hii');
      setFilterUser(AllUser);
    }
  };
  const NextPage = (user: User) => {
    navigation.navigate('Chatdetails', {
      User: user,
    });
  };
  const NotificationDetalis = (user: User) => {
    // this.props.navigation.navigate('NoficationDetails', {
    //   User: user,
  };
  return (
    <Container>
      <View style={MainStyle.container}>
        {IsShow && (
          <View style={MainStyle.header}>
            <View style={{flex: 1}}>
              <Text
                style={{
                  fontSize: 18,
                  // fontWeight: 'bold',
                  fontFamily: 'Poppins-SemiBold',
                  color: 'black',
                }}>
                EResource Messenger
              </Text>
              <View style={{flexDirection: 'row', marginTop: 5}}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: '100',
                    fontFamily: 'OpenSans-Regular',
                    color: '#0383FA',
                    marginRight: 8,
                  }}>
                  {userInfo.BranchName}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={{width: 25, paddingRight: 40, marginTop: -5}}
              onPress={Search}>
              <Image
                source={require('../../assets/search.png')}
                style={{height: 25, width: 25}}
              />
            </TouchableOpacity>
            <TouchableOpacity style={{marginTop: -5}} onPress={DropDownOpen}>
              <Badge
                style={{
                  backgroundColor: '#E9E9E9',
                  width: 35,
                  height: 35,
                  borderRadius: 50,
                  // justifyContent: 'center',
                  alignItems: 'center',
                  display: 'flex',
                  marginTop: -5,
                }}>
                <Text
                  style={{
                    color: 'black',
                    fontSize: 22,
                    fontWeight: '400',
                    fontFamily: 'OpenSans-Regular',
                  }}>
                  {userInfo.UserName.toLocaleUpperCase().charAt(0)}
                </Text>
              </Badge>
              {/* <Icon name="bell" size={24} style={MainStyle.icon} /> */}
            </TouchableOpacity>
          </View>
        )}
        {!IsShow && (
          <View style={{padding: 10}}>
            <View
              style={{
                backgroundColor: '#F1F1F1',
                paddingHorizontal: 10,
                paddingVertical: 5,
                borderRadius: 6,
                flexDirection: 'row',
              }}>
              <TextInput
                value={Message}
                onChangeText={text => SearchText(text)}
                style={
                  (MainStyle.input,
                  {
                    width: Dimensions.get('window').width - 70,
                    fontFamily: 'OpenSans-Regular',
                  })
                }
                placeholder="Search....."></TextInput>
              <TouchableOpacity
                onPress={Cancle}
                style={{
                  flexShrink: 1,
                  width: 25,
                  justifyContent: 'center',
                  marginTop: 11,
                }}>
                <Image
                  source={require('../../assets/cancel.png')}
                  style={{height: 25, width: 25}}
                />
              </TouchableOpacity>
            </View>
          </View>
        )}
        {IsOpen && (
          <View style={MainStyle.dropdownContainer}>
            <View style={MainStyle.dropdown}>
              <View>
                <View style={{}}>
                  <Text style={MainStyle.UseLabel}>User:</Text>
                  <Text style={MainStyle.UserInfo}>{userInfo.UserName}</Text>
                </View>
                <View style={MainStyle.divider}></View>
                <View style={{}}>
                  <Text style={MainStyle.UseLabel}>Designation:</Text>
                </View>
                <View style={MainStyle.divider}></View>
                <View style={{}}>
                  <Text style={MainStyle.UseLabel}>Connection Code:</Text>
                  <Text style={MainStyle.UserInfo}>
                    {userInfo.ConnectionCode}
                  </Text>
                </View>
                <View style={MainStyle.divider}></View>

                <View style={{}}>
                  <Text style={MainStyle.UseLabel}>Version:</Text>
                  <Text style={MainStyle.UserInfo}>{appVersion}</Text>
                </View>
                <View style={MainStyle.divider}></View>

                {OnlineText == 'Online User' ? (
                  <View>
                    <TouchableOpacity onPress={() => UserOnline()}>
                      <Text style={MainStyle.UseLabel}>{OnlineText}</Text>
                    </TouchableOpacity>
                    <Text
                      style={{
                        paddingLeft: 20,
                        color: 'black',
                        alignSelf: 'flex-start',
                        fontSize: 12,
                        fontFamily: 'OpenSans-SemiBold',
                      }}>
                      {/* {onlineUserList.length + '/' + AllUser.length} */}
                    </Text>
                  </View>
                ) : (
                  <View>
                    <TouchableOpacity onPress={() => AllUserss()}>
                      <Text style={MainStyle.UseLabel}>{OnlineText}</Text>
                    </TouchableOpacity>
                  </View>
                )}
                <View style={MainStyle.divider}></View>

                <TouchableOpacity onPress={() => this.Logout()}>
                  <Text style={MainStyle.UseLabel}>Logout</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
        {ShowPageLoader && <CustomPageLoader></CustomPageLoader>}
        {!ShowPageLoader && (
          <Tabs
            tabBarUnderlineStyle={{
              borderColor: 'white',
              backgroundColor: 'black',
              borderWidth: 0.5,
              height: 0,
            }}
            tabContainerStyle={{
              borderColor: 'white',
              shadowColor: 'white',
            }}>
            <Tab
              heading="All Messages"
              color="black"
              textStyle={{color: '#a6a6a6', fontFamily: 'Poppins-SemiBold'}}
              activeTextStyle={{color: 'black', fontFamily: 'Poppins-SemiBold'}}
              tabContainerStyle={{backgroundColor: 'white'}}
              tabStyle={{backgroundColor: 'white'}}
              activeTabStyle={{backgroundColor: 'white', borderColor: 'white'}}>
              <Content>
                <List>
                  {FilterUser.map((i: User, index) => (
                    <TouchableOpacity key={i.lId} onPress={() => NextPage(i)}>
                      <ListItem avatar>
                        <Left>
                          <View>
                            <Badge
                              style={{
                                backgroundColor: '#E9E9E9',
                                width: 50,
                                height: 50,
                                borderRadius: 25,
                                justifyContent: 'center',
                                alignItems: 'center',
                              }}>
                              <Text
                                style={{
                                  color: 'black',
                                  fontSize: 22,
                                  fontWeight: '400',
                                  fontFamily: 'OpenSans-Regular',
                                }}>
                                {i.userFullName.toLocaleUpperCase().charAt(0)}
                              </Text>
                            </Badge>
                            {i?.isUserLive ? (
                              <View style={MainStyle.circle}></View>
                            ) : (
                              <View style={MainStyle.circle2}></View>
                            )}
                          </View>
                        </Left>
                        <Body>
                          <View
                            style={{
                              flexDirection: 'row',
                              justifyContent: 'space-between',
                            }}>
                            <Text
                              style={{
                                color: 'black',
                                fontWeight: '600',
                                fontFamily: 'OpenSans-SemiBold',
                                marginBottom: 5,
                                fontSize: 14.5,
                                // letterSpacing:0.5
                              }}>
                              {i.userFullName}
                            </Text>
                            {i?.mCount > 0 && (
                              <View style={MainStyle.circle3}>
                                <Text
                                  style={{
                                    textAlign: 'center',
                                    color: 'white',
                                  }}>
                                  {i?.mCount}
                                </Text>
                              </View>
                            )}
                          </View>
                          <Text
                            style={{
                              color: i.status ? '#a6a6a6' : '#0383FA',
                              fontWeight: '200',
                              fontFamily: 'OpenSans-SemiBold',
                              letterSpacing: 0.2,
                              fontSize: 12,
                            }}>
                            {i.message ? i.message : 'No message'}
                          </Text>
                        </Body>
                        <Right></Right>
                      </ListItem>
                    </TouchableOpacity>
                  ))}
                </List>
              </Content>
            </Tab>
            <Tab
              heading="Notification"
              color="black"
              textStyle={{color: '#a6a6a6', fontFamily: 'Poppins-SemiBold'}}
              activeTextStyle={{color: 'black', fontFamily: 'Poppins-SemiBold'}}
              tabContainerStyle={{backgroundColor: 'white'}}
              tabStyle={{backgroundColor: 'white'}}
              activeTabStyle={{backgroundColor: 'white'}}>
              <Content>
                <List>
                  {AllNotification.map((i: User) => (
                    <TouchableOpacity onPress={() => NotificationDetalis(i)}>
                      <ListItem avatar>
                        <Left>
                          <View>
                            <Badge
                              style={{
                                backgroundColor: '#E9E9E9',
                                width: 50,
                                height: 50,
                                borderRadius: 25,
                                justifyContent: 'center',
                                alignItems: 'center',
                              }}>
                              <Text
                                style={{
                                  color: 'black',
                                  fontSize: 22,
                                  fontWeight: '400',
                                  fontFamily: 'OpenSans-Regular',
                                }}>
                                {i.userFullName.toLocaleUpperCase().charAt(0)}
                              </Text>
                            </Badge>
                            {i?.isUserLive ? (
                              <View style={MainStyle.circle}></View>
                            ) : (
                              <View style={MainStyle.circle2}></View>
                            )}
                          </View>
                        </Left>
                        <Body>
                          <View style={{flexDirection: 'row'}}>
                            <Text style={MainStyle.UserName}>
                              {i.userFullName}
                            </Text>
                          </View>
                          {i.message ? (
                            <Text style={MainStyle.MsgStyle}>{i.message}</Text>
                          ) : (
                            <Text style={MainStyle.NoMsgStyle}>No message</Text>
                          )}
                        </Body>
                        <Right></Right>
                      </ListItem>
                    </TouchableOpacity>
                  ))}
                </List>
              </Content>
            </Tab>
          </Tabs>
        )}
      </View>
    </Container>
  );
};

export default MainPage;
