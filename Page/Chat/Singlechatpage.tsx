import React, {Component} from 'react';

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
import SessionHelper from '../../Core/SessionHelper';
import DeviceInfo from 'react-native-device-info';
import * as signalR from '@microsoft/signalr';
import {TouchableOpacity} from 'react-native-gesture-handler';
import axios from 'axios';
import Geolocation from '@react-native-community/geolocation';
import BackgroundTimer from 'react-native-background-timer';
import User from '../../Entity/User';
import {Groups} from '../../Entity/Group';
export class SinglechatpageViewModel {
  BranchName: string = '';
  UserName: string = '';
  IsShow: boolean = false;
  Message: string = '';
  IsOpen: boolean = false;
  DeviceId: string = '';
  AppVersion: string = '1.0.0';
  OnlineText: string = 'Online User';
  alluser: User[] = [];
  index: number = 0;
  FilterUser: User[] = [];
  FCMToken: string = '';
  SenderID: string = '';
  BranchID: number = 1;
  ConnectionCode: any;
  AllNotification: User[] = [];
  FilterAllNotification: User[] = [];
  OnlineUserLength: number = 0;
  AppStatus: any = AppState.currentState;
  currentLocation: any;
  ReceiverID: string = '';
  SingleRConnection: any;
  Url: string = 'wemessanger.azurewebsites.net';
  GroupList: Groups[] = [];
  FilterGroupList: Groups[] = [];
}
export default class Singlechatpage extends BaseComponent<
  any,
  SinglechatpageViewModel
> {
  constructor(props: any) {
    super(props);
    this.state = new BaseState(new SinglechatpageViewModel());
    // this.state.Model.BranchName = props.route.params.BranchName;
    // this.state.Model.UserName = props.route.params.UserName;
    // this.state.Model.BranchID = props.route.params.BranchID;
    // console.log('Branch', this.state.Model.BranchName);
    // console.log('BranchID', this.state.Model.BranchID);
  }
  async componentDidMount() {
    var Model = this.state.Model;
    var User = await SessionHelper.GetUserDetailsSession();
    var FCMToken = await SessionHelper.GetFCMTokenSession();
    var ConnectionCode = await SessionHelper.GetCompanyIDSession();
    var BranchName = await SessionHelper.GetBranchNameSession();
    var UserName = await SessionHelper.GetUserNameSession();
    var BranchID = await SessionHelper.GetBranchIdSession();
    var ReceicerId = await SessionHelper.GetReceiverIDSession();
    if (ReceicerId) {
      Model.ReceiverID = ReceicerId;
    }
    Model.BranchID = BranchID;
    Model.UserName = UserName;
    Model.BranchName = BranchName;
    Model.ConnectionCode = ConnectionCode;
    Model.FCMToken = FCMToken;
    this.GetLocation();
    BackgroundTimer.setInterval(() => {
      this.GetLocation();
    }, 6000);
    this.UpdateViewModel();
    this.FetchAllUser();
    this.GetAllNotification();
    this.CheckAppStatus();
    this.IsTalking();
    this.GetAllGroup();
    setInterval(this.UserList, 2000);
    setInterval(this.GetAllGroup, 2000);
  }
  IsTalking = async () => {
    var Model = this.state.Model;
    var UserDetails = await SessionHelper.GetUserDetailsSession();
    const headers = {
      'Content-Type': 'application/json',
    };
    var TalkingData = JSON.stringify({
      FromUserId: `${Model.ConnectionCode}_${UserDetails.lId}`,
      ToUserId: '0',
      IsTaking: true,
    });
    console.log('TalkingData: ', TalkingData);

    axios
      .post(
        `https://wemessanger.azurewebsites.net/api/user/taking`,
        TalkingData,
        {headers: headers},
      )
      .then(res => {
        console.log('TalkingRes: ', res.data);
      })
      .catch(err => {
        console.log('TalkingError: ', err);
      });
  };
  GetLocation = () => {
    var Model = this.state.Model;
    // console.log('senderId: ', Model.SenderID);

    Geolocation.getCurrentPosition(info => {
      Model.currentLocation = info;
      // console.log(
      //   'locationlatitude',
      //   Model.currentLocation?.coords?.latitude.toString(),
      // );
      // console.log(
      //   'locationLong',
      //   Model.currentLocation?.coords?.longitude.toString(),
      // );
      this.UpdateViewModel();
    });
    const headers = {
      'Content-Type': 'application/json',
    };
    var Data = JSON.stringify({
      UserId: Model.SenderID,
      Lat: Model.currentLocation?.coords?.latitude.toString(),
      Long: Model.currentLocation?.coords?.longitude.toString(),
    });
    // console.log('LocationData: ', Data);

    axios.post(
      `https://wemessanger.azurewebsites.net/api/user/location`,
      Data,
      {
        headers,
      },
    );
    // .then((res: any) => {
    //   console.log('Location: ', res.data);
    // })
    // .catch((err: any) => {
    //   console.log('LocationERror: ', err);
    // });
  };
  CheckAppStatus = async () => {
    var Model = this.state.Model;
    const appStateListener = AppState.addEventListener(
      'change',
      nextAppState => {
        console.log('Next AppState is: ', nextAppState);
        Model.AppStatus = nextAppState;
        this.UpdateViewModel();
        if (nextAppState == 'active') {
          this.FetchAllUser();
        }
        if (nextAppState == 'background') {
          this.IsTalking();
          var Connection = new signalR.HubConnectionBuilder()
            .withUrl(
              `https://wemessanger.azurewebsites.net/chatHub?UserId=${Model.SenderID}`,
            )
            .build();
          Connection.start().then(() => {
            console.log('SignalR connected');
            Connection.invoke('DisconnectUser', Model.SenderID)
              .then((res: any) => {
                console.log('resDisconnect: ', res);
              })
              .catch((err: any) => {
                console.log('ErrorDisconnect: ', err);
              });
          });
        }
      },
    );
  };
  Search = async () => {
    var Model = this.state.Model;
    Model.IsShow = !Model.IsShow;
    this.UpdateViewModel();
  };
  Cancle = async () => {
    var Model = this.state.Model;
    Model.IsShow = !Model.IsShow;
    Model.Message = '';
    Model.FilterUser = Model.alluser;
    Model.FilterGroupList = Model.GroupList;
    this.UpdateViewModel();
  };
  DropDowmOpen = async () => {
    var Model = this.state.Model;
    Model.IsOpen = !Model.IsOpen;
    this.UpdateViewModel();
  };
  handleSelection = async (option: any) => {
    console.log(option);
  };
  FetchAllUser = async () => {
    var model = this.state.Model;
    var UserName = await SessionHelper.GetUserNameSession();
    var UserDetails = await SessionHelper.GetUserDetailsSession();
    var myId = `${model.ConnectionCode}_${UserDetails.lId}`;
    model.SenderID = myId;
    this.UpdateViewModel();
    // console.log('MYID: ', model.SenderID);
    const deviceId = DeviceInfo.getDeviceId();

    model.SingleRConnection = new signalR.HubConnectionBuilder()
      .withUrl(
        `https://wemessanger.azurewebsites.net/chatHub?UserId=${
          model.ConnectionCode
        }_${UserDetails.lId.toString()}`,
      )
      .build();
    this.UpdateViewModel();
    model.SingleRConnection.start().then(() => {
      console.log('SignalR connected');
    });
    this.UserList();
    this.IsTalking();
  };
  UserList = async () => {
    var model = this.state.Model;
    var UserDetails = await SessionHelper.GetUserDetailsSession();
    var myId = `${model.ConnectionCode}_${UserDetails.lId}`;
    var UserList = model.SingleRConnection.invoke('GetAllUser', myId, 0)
      .then((user: any) => {
        // console.log('GetallUser: ', user);
        model.alluser = user;
        var UserOnline = user.filter((i: User) => i.isUserLive == true);
        model.FilterUser = model.alluser;
        model.OnlineUserLength = UserOnline.length;
        this.UpdateViewModel();
        // console.log('UserOnline', UserOnline.length);

        model.SingleRConnection.invoke(
          'IsUserConnected',
          `${model.ConnectionCode}_${UserDetails.lId.toString()}`,
        );
        // .then((isConnected:any) => {
        //   console.log('Connection', isConnected);

        //   if (isConnected) {
        //     console.log(
        //       `User - ${
        //         model.ConnectionCode
        //       }_${UserDetails.lId.toString()} is live`,
        //     );
        //   } else {
        //     console.log(
        //       `User - ${
        //         model.ConnectionCode
        //       }_${UserDetails.lId.toString()} is not live`,
        //     );
        //   }
        // })
        // .catch((error:any) => {
        //   console.log(error);
        // });
      })
      .catch((err: any) => {
        model.SingleRConnection.start();
        console.log('Error to Get User List: ', err);
      });
  };
  NextPage = (user: User) => {
    var Model = this.state.Model;
    console.log('Branch: ', Model.BranchID);
    console.log('SenderID', Model.SenderID);
    console.log('ReceiverId', `${Model.ConnectionCode}_${user.lId}`);
    const headers = {
      'Content-Type': 'application/json',
    };
    var Data = JSON.stringify({
      companyid: Model.BranchID,
      senderId: Model.SenderID,
      receiverId: `${Model.ConnectionCode}_${user.lId}`,
    });
    axios
      .put(`https://wemessanger.azurewebsites.net/api/user`, Data, {headers})
      .then((res: any) => {
        console.log('ReadMSg: ', res.data);
      })
      .catch((err: any) => {
        console.log('ReadMSgERror: ', err);
      });
    console.log('Hi');

    var Model = this.state.Model;
    this.props.navigation.navigate('Chatdetails', {
      User: user,
      // SenderID: Model.SenderId,
    });
    // console.log("ModelSenderID: ",Model.SenderId,);
  };
  NotificationDetalis = (user: User) => {
    var Model = this.state.Model;
    console.log('Branch: ', Model.BranchID);
    console.log('SenderID', Model.SenderID);
    console.log('ReceiverId', `${Model.ConnectionCode}_${user.lId}`);
    const headers = {
      'Content-Type': 'application/json',
    };
    var Data = JSON.stringify({
      companyid: Model.BranchID,
      senderId: Model.SenderID,
      receiverId: `${Model.ConnectionCode}_${user.lId}`,
    });
    axios
      .put(`https://wemessanger.azurewebsites.net/api/user`, Data, {headers})
      .then((res: any) => {
        console.log('ReadMSg: ', res.data);
      })
      .catch((err: any) => {
        console.log('ReadMSgERror: ', err);
      });
    console.log('Hi');

    var Model = this.state.Model;
    this.props.navigation.navigate('NoficationDetails', {
      User: user,
      // SenderID: Model.SenderId,
    });
    // console.log("ModelSenderID: ",Model.SenderId,);
  };
  UserOnline = () => {
    var Model = this.state.Model;
    console.log(Model.alluser);
    if ((Model.OnlineText = 'Online User')) {
      var UserOnline = Model.alluser.filter((i: User) => i.isUserLive === true);
      console.log('Hi');
      console.log('UserOnline', UserOnline);
      if (UserOnline) {
        Model.FilterUser = UserOnline;
        Model.OnlineText = 'All User';
        this.UpdateViewModel();
      }
    }
  };
  AllUserss = () => {
    var Model = this.state.Model;
    Model.OnlineText = 'Online User';
    console.log('Model.user', Model.alluser);
    Model.FilterUser = Model.alluser;
    this.UpdateViewModel();
  };
  SearchText = (text: string) => {
    var Model = this.state.Model;
    Model.Message = text;
    var NewArrayGRoup = Model.GroupList.filter((i: Groups) => {
      const itemData = `${i.groupName.toLowerCase()}`;
      const textData = text.toLowerCase();
      if (textData.toLowerCase()) {
        return itemData.indexOf(textData) > -1;
      }
    });
    var NewArray = Model.alluser.filter((i: User) => {
      const itemData = `${i.userName.toLowerCase()}`;
      const textData = text.toLowerCase();
      if (textData.toLowerCase()) {
        return itemData.indexOf(textData) > -1;
      }
    });

    console.log('NewArray', NewArray);
    console.log('NewArrayGRoup', NewArrayGRoup);
    if (NewArray || NewArrayGRoup) {
      Model.FilterUser = NewArray;
      Model.FilterGroupList = NewArrayGRoup;
      this.UpdateViewModel();
    }
    if (text == '') {
      console.log('Hii');
      Model.FilterUser = Model.alluser;
      Model.FilterGroupList = Model.GroupList;
      this.UpdateViewModel();
    }
    console.log('NewArrayGRoup', Model.FilterGroupList);
  };
  Logout = () => {
    var Model = this.state.Model;
    SessionHelper.SetSession(null);
    SessionHelper.SetBranchIdSession(null);
    SessionHelper.SetDeviceIdSession(null);
    SessionHelper.SetSenderIdSession(null);
    SessionHelper.SetURLSession(null);
    SessionHelper.SetUserDetailsSession(null);
    SessionHelper.SetUserNameSession(null);
    this.props.navigation.reset({
      index: 0,
      routes: [{name: 'Selectcompanypage'}],
    });
    var Connection = new signalR.HubConnectionBuilder()
      .withUrl(
        `https://wemessanger.azurewebsites.net/chatHub?UserId=${Model.SenderID}`,
      )
      .build();
    Connection.start().then(() => {
      console.log('SignalR connected');
      Connection.invoke('DisconnectUser', Model.SenderID)
        .then((res: any) => {
          console.log('resDisconnect: ', res);
        })
        .catch((err: any) => {
          console.log('ErrorDisconnect: ', err);
        });
    });
  };
  GetAllNotification = async () => {
    // console.log('GetNotification');
    var Model = this.state.Model;
    var UserDetails = await SessionHelper.GetUserDetailsSession();
    var myId = `${Model.ConnectionCode}_${UserDetails.lId}`;
    var Model = this.state.Model;
    // console.log('MYID: ', Model.SenderID);
    // console.log('CompanyID: ', Model.BranchID);

    const headers = {
      'Content-Type': 'application/json',
    };
    await axios
      .get(
        `https://wemessanger.azurewebsites.net/api/user/getnotification?companyId=${Model.BranchID}&userId=${myId}`,
      )
      .then((res: any) => {
        // console.log('Notification: ', res.data);
        Model.AllNotification = res.data;
      })
      .catch((err: any) => {
        console.log('NotificationERror: ', err);
      });
  };
  GroupChatPage = async (GroupName: string, GroupID: string) => {
    // this.props.navigation.reset({
    //   index:0,
    //   routes: [
    //     {
    //       name: 'Groupchatdetails',
    //       params: {
    //         GroupID: GroupID,
    //         GroupName: GroupName,
    //       },
    //     },
    //   ],
    // });
    this.props.navigation.navigate('Groupchatdetails', {
      GroupID: GroupID,
      GroupName: GroupName,
    });
  };
  GetAllGroup = async () => {
    var Model = this.state.Model;
    var UserDetails = await SessionHelper.GetUserDetailsSession();
    var myId = `${Model.ConnectionCode}_${UserDetails.lId}`;
    axios
      .get(`http://${Model.Url}/api/user/getgroup?userId=${myId}`)
      .then(res => {
        // console.log('GroupRes: ', res.data);
        Model.GroupList = res.data;
        // this.UpdateViewModel()
        Model.FilterGroupList = res.data;
        this.UpdateViewModel();
      })
      .catch((err: any) => {
        console.log('GroupErr: ', err);
      });
  };

  initialLayout = {width: Dimensions.get('window').width};
  render() {
    var model = this.state.Model;
    // console.log('FilterUser: ', model.FilterUser);
    // console.log('Appstatus: ', model.AppStatus);

    return (
      <Container>
        <View style={styles.container}>
          {model.IsShow == false && (
            <View style={styles.header}>
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
                    {model.BranchName}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={{width: 25, paddingRight: 40, marginTop: -5}}
                onPress={() => {
                  this.Search();
                }}>
                <Image
                  source={require('../../assets/search.png')}
                  style={{height: 25, width: 25}}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={{marginTop: -5}}
                onPress={() => {
                  this.DropDowmOpen();
                }}>
                <Badge
                  style={{
                    backgroundColor: '#404040',
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
                      color: 'white',
                      fontSize: 22,
                      fontFamily: 'OpenSans_Condensed-Bold',
                    }}>
                    {model.UserName.toLocaleUpperCase().charAt(0)}
                  </Text>
                </Badge>
                {/* <Icon name="bell" size={24} style={styles.icon} /> */}
              </TouchableOpacity>
            </View>
          )}
          {model.IsShow == true && (
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
                  value={model.Message}
                  onChangeText={text => this.SearchText(text)}
                  style={
                    (styles.input,
                    {
                      width: Dimensions.get('window').width - 70,
                      fontFamily: 'OpenSans-Regular',
                    })
                  }
                  placeholder="Search....."></TextInput>
                <TouchableOpacity
                  onPress={this.Cancle}
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
          {model.IsOpen == true && (
            <View style={styles.dropdownContainer}>
              <View style={styles.dropdown}>
                <View>
                  <View style={{}}>
                    <Text
                      style={{
                        fontFamily: 'OpenSans-SemiBold',
                        marginTop: 15,
                        paddingLeft: 20,
                        color: '#0383FA',

                        fontSize: 12,
                      }}>
                      User:
                    </Text>
                    <Text
                      style={{
                        paddingLeft: 20,
                        color: 'black',

                        fontSize: 12,
                        fontFamily: 'OpenSans-SemiBold',
                      }}>
                      {model.UserName}
                    </Text>
                  </View>
                  <View style={styles.divider}></View>
                  <View style={{}}>
                    <Text
                      style={{
                        fontFamily: 'OpenSans-SemiBold',
                        marginTop: 15,
                        paddingLeft: 20,
                        color: '#0383FA',

                        fontSize: 12,
                      }}>
                      Designation:
                    </Text>
                  </View>
                  <View style={styles.divider}></View>
                  <View style={{}}>
                    <Text
                      style={{
                        fontFamily: 'OpenSans-SemiBold',
                        marginTop: 15,
                        paddingLeft: 20,
                        color: '#0383FA',

                        fontSize: 12,
                      }}>
                      Connection Code:
                    </Text>
                    <Text
                      style={{
                        paddingLeft: 20,
                        color: 'black',

                        fontSize: 12,
                        fontFamily: 'OpenSans-SemiBold',
                      }}>
                      {model.ConnectionCode}
                    </Text>
                  </View>
                  <View style={styles.divider}></View>

                  <View style={{}}>
                    <Text
                      style={{
                        fontFamily: 'OpenSans-SemiBold',
                        marginTop: 15,
                        paddingLeft: 20,
                        color: '#0383FA',

                        fontSize: 12,
                      }}>
                      Version:
                    </Text>
                    <Text
                      style={{
                        paddingLeft: 20,
                        color: 'black',

                        fontSize: 12,
                        fontFamily: 'OpenSans-SemiBold',
                      }}>
                      {model.AppVersion}
                    </Text>
                  </View>
                  <View style={styles.divider}></View>

                  {model.OnlineText == 'Online User' ? (
                    <View>
                      <TouchableOpacity onPress={() => this.UserOnline()}>
                        <Text
                          style={{
                            fontFamily: 'OpenSans-SemiBold',
                            marginTop: 15,
                            paddingLeft: 20,
                            color: '#0383FA',

                            fontSize: 12,
                          }}>
                          {model.OnlineText}
                        </Text>
                      </TouchableOpacity>
                      <Text
                        style={{
                          paddingLeft: 20,
                          color: 'black',

                          fontSize: 12,
                          fontFamily: 'OpenSans-SemiBold',
                        }}>
                        {model.OnlineUserLength}/{model.alluser.length}
                      </Text>
                    </View>
                  ) : (
                    <View>
                      <TouchableOpacity onPress={() => this.AllUserss()}>
                        <Text
                          style={{
                            fontFamily: 'OpenSans-SemiBold',
                            marginTop: 15,
                            paddingLeft: 20,
                            color: '#0383FA',

                            fontSize: 12,
                          }}>
                          {model.OnlineText}
                        </Text>
                      </TouchableOpacity>
                      {/* <Text
                      style={{
                        paddingLeft:20,
                        color: 'black',
                        
                        fontSize: 12,
                        fontFamily: 'OpenSans-SemiBold',
                      }}>
                      {model.alluser.length}/{model.alluser.length}
                    </Text> */}
                    </View>
                  )}
                  <View style={styles.divider}></View>

                  <TouchableOpacity
                    onPress={() =>
                      this.props.navigation.navigate('CreateGroup')
                    }>
                    <Text
                      style={{
                        fontFamily: 'OpenSans-SemiBold',
                        marginTop: 15,
                        paddingLeft: 20,
                        color: '#0383FA',

                        fontSize: 12,
                        marginBottom: 15,
                      }}>
                      New Group
                    </Text>
                  </TouchableOpacity>
                  <View style={styles.divider}></View>

                  <TouchableOpacity onPress={() => this.Logout()}>
                    <Text
                      style={{
                        fontFamily: 'OpenSans-SemiBold',
                        marginTop: 15,
                        paddingLeft: 20,
                        color: '#0383FA',

                        fontSize: 12,
                        marginBottom: 20,
                      }}>
                      Logout
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
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
                  {model.FilterUser.length <= 0 && (
                    <ActivityIndicator size="large" color="#0000ff" />
                  )}

                  {model.FilterUser.length > 0 &&
                    model.FilterUser.map((i: User, index) => (
                      <TouchableOpacity onPress={() => this.NextPage(i)}>
                        <ListItem avatar key={index}>
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
                                <View style={styles.circle}></View>
                              ) : (
                                <View style={styles.circle2}></View>
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
                                <View style={styles.circle3}>
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
                  {model.AllNotification.map((i: User) => (
                    <TouchableOpacity
                      onPress={() => this.NotificationDetalis(i)}>
                      <ListItem avatar key={i?.lId}>
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
                              <View style={styles.circle}></View>
                            ) : (
                              <View style={styles.circle2}></View>
                            )}
                          </View>
                        </Left>
                        <Body>
                          <View style={{flexDirection: 'row'}}>
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
            {/* group */}
            <Tab
              heading="Group"
              color="black"
              textStyle={{color: '#a6a6a6', fontFamily: 'Poppins-SemiBold'}}
              activeTextStyle={{color: 'black', fontFamily: 'Poppins-SemiBold'}}
              tabContainerStyle={{backgroundColor: 'white'}}
              tabStyle={{backgroundColor: 'white'}}
              activeTabStyle={{backgroundColor: 'white'}}>
              <Content>
                <List>
                  {model.FilterGroupList.length <= 0 && (
                    <ActivityIndicator size="large" color="#0000ff" />
                  )}

                  {model.FilterGroupList.length > 0 &&
                    model.FilterGroupList.map((i: Groups, index) => (
                      <TouchableOpacity
                        onPress={() =>
                          this.GroupChatPage(i.groupName, i?.groupId.toString())
                        }>
                        <ListItem avatar key={index}>
                          <Left>
                            <View>
                              <Badge
                                style={{
                                  backgroundColor: '#E9E9E9',
                                  width: 45,
                                  height: 45,
                                  borderRadius: 25,
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                  marginTop: -5,
                                }}>
                                <Text
                                  style={{
                                    color: 'black',
                                    fontSize: 22,
                                    fontWeight: '400',
                                    fontFamily: 'OpenSans-Regular',
                                  }}>
                                  {i.groupName.toLocaleUpperCase().charAt(0)}
                                </Text>
                              </Badge>
                            </View>
                          </Left>
                          <Body>
                            <View
                              style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                              }}>
                              {i?.groupName.length <= 15 ? (
                                <Text
                                  style={{
                                    color: 'black',
                                    fontWeight: '600',
                                    fontFamily: 'OpenSans-SemiBold',
                                    marginBottom: 5,
                                    fontSize: 14.5,
                                    // letterSpacing:0.5
                                  }}>
                                  {i.groupName}
                                </Text>
                              ) : (
                                <Text
                                  style={{
                                    color: 'black',
                                    fontWeight: '600',
                                    fontFamily: 'OpenSans-SemiBold',
                                    marginBottom: 5,
                                    fontSize: 14.5,
                                    // letterSpacing:0.5
                                  }}>
                                  {i.groupName.slice(0,15)}...
                                </Text>
                              )}
                            </View>
                            <Text
                              style={{
                                color: i.lastMessage ? '#a6a6a6' : '#0383FA',
                                fontWeight: '200',
                                fontFamily: 'OpenSans-SemiBold',
                                letterSpacing: 0.2,
                                fontSize: 12,
                              }}>
                              {i.lastMessage ? i.lastMessage : 'No message'}
                            </Text>
                          </Body>
                        </ListItem>
                      </TouchableOpacity>
                    ))}
                </List>
              </Content>
            </Tab>
          </Tabs>
        </View>
      </Container>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF', // Replace with desired background color
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    fontFamily: 'Poppins-Regular',
    color: 'black', // Darker blue title
  },
  divider: {
    height: 1,
    backgroundColor: 'gray',
    marginHorizontal: 20,
    marginTop: 12,
    opacity: 0.5,
  },
  dropdownContainer: {
    position: 'absolute',
    top: 60,
    right: 20,
    // Set a height for the container
    height: 'auto',
    width: 200,
    zIndex: 1,
  },
  dropdown: {
    backgroundColor: '#f1f1f1',
    color: 'black',
    borderRadius: 10,
    textAlign: 'center',
    display: 'flex',
    justifyContent: 'center',
  },
  header: {
    backgroundColor: '#FFFFFF', // Lighter blue header
    paddingTop: 10,
    paddingHorizontal: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // marginTop:10
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  searchBar: {
    color: '#fff', // Replace with desired text color
    fontSize: 16, // Adjust font size as needed
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    // marginTop: 10,
  },
  tabButton: {
    padding: 10,
    backgroundColor: '#ddd', // Replace with desired tab background color
  },
  messageItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderColor: '#eee', // Adjust border color as needed
  },
  messageName: {
    fontSize: 18, // Adjust font size as needed
  },
  input: {
    alignSelf: 'center',
    backgroundColor: '#F1F1F1',
    borderColor: '#F1F1F1',
    paddingHorizontal: 5,
  },
  circle: {
    width: 10,
    height: 10,
    borderRadius: 30,
    marginTop: 6,
    marginLeft: 4,
    backgroundColor: 'green',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 5,
    right: 1,
  },
  circle2: {
    width: 10,
    height: 10,
    borderRadius: 30,
    marginTop: 6,
    marginLeft: 4,
    backgroundColor: 'orange',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 5,
    right: 1,
  },
  circle3: {
    width: 20,
    height: 20,
    borderRadius: 30,
    justifyContent: 'center',
    // marginTop: 6,
    backgroundColor: '#0383FA',
    // position: 'absolute',
    // bottom: 5,
    // right: 1,
    color: 'white',
    // paddingRight: 1,
  },
});
