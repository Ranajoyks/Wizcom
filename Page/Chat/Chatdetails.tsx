import React, {Component} from 'react';
<script src="https://cdnjs.cloudflare.com/ajax/libs/microsoft-signalr/5.0.13/signalr.min.js"></script>;

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  SafeAreaView,
  ScrollView,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome'; // Replace with your icon library
import AppIconImage from '../../assets/AppIconImage';
import DropDownPicker from 'react-native-dropdown-picker';
import {Badge, Button} from 'native-base';
import BaseComponent from '../../Core/BaseComponent';
import BaseState from '../../Core/BaseState';
import * as signalR from '@microsoft/signalr';
import SessionHelper from '../../Core/SessionHelper';
import axios from 'axios';
import {Chat} from '../../Entity/Chat';
import EntityHelperService from '../Service/EntityHelperService';
import messaging from '@react-native-firebase/messaging';
import DeviceInfo from 'react-native-device-info';
export class ChatdetailsViewModel {
  Message: string = '';
  senderId: string = '';
  receiverId: string = '';
  companyId: number = 18;
  itype: number = 0;
  msgflag: string = 'U';
  Connection: any;
  Chats: Chat[] = [];
  User: any;
  NewChat: AllChats[] = [];
  IsShow: boolean = false;
  sender: string = '';
  IsOpen: boolean = false;
  AppVersion: string = '1.0.0';
}
export class AllChats {
  date: any = new Date();
  Chat: Chatss[] = [];
  istoday: boolean = false;
}
export class Chatss {
  bEmlStatus: number = 0;
  bStatus: boolean = false;
  cMsgFlg: string = '';
  dtMsg: string = '';
  lAttchId: number = 0;
  lCompId: number = 0;
  lFromStatusId: number = 0;
  lId: number = 0;
  lRecCompId: number = 0;
  lReceiverId: number = 0;
  lSenderId: string = '';
  lSrId: number = 0;
  lToStatusId: number = 0;
  lTypId: number = 0;
  sConnId: string = '';
  sMsg: string = '';
}
export default class Chatdetails extends BaseComponent<
  any,
  ChatdetailsViewModel
> {
  constructor(props: any) {
    super(props);
    this.state = new BaseState(new ChatdetailsViewModel());
    this.state.Model.User = props.route.params.User;
    // this.state.Model.senderId = props.route.params.SenderID;
  }
  async componentDidMount(): Promise<void> {
    var Model = this.state.Model;
    Model.receiverId = `u_${Model.User.lId.toString()}`;
    this.MakeConnection();
    this.ReceiveMsg();
    var User = await SessionHelper.GetUserDetailsSession();
    console.log('user: ', User);
    Model.sender = User.userName;
    this.UpdateViewModel();

    // this.requestUserPermission();
    // this.getDeviceToken();

    var UserDetails = await SessionHelper.GetUserDetailsSession();
    Model.senderId = `u_${UserDetails.lId.toString()}`;
    console.log('UserDetails.lId', UserDetails);
    console.log('UserDetails.lId', Model.senderId);

    this.UpdateViewModel();
    this.GetAllMsg();
  }
  // requestUserPermission = async () => {
  //   const authStatus = await messaging().requestPermission();
  //   const enabled =
  //     authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
  //     authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  //   if (enabled) {
  //     console.log('Authorization status:', authStatus);
  //   }
  // };
  // getDeviceToken = async () => {
  //   try {
  //     const token = await messaging().getToken();
  //     console.log('Device Token:', token);
  //   } catch (error) {
  //     console.error('Error getting device token:', error);
  //   }
  // };
  MakeConnection = async () => {
    var Model = this.state.Model;
    var BranchID = await SessionHelper.GetBranchIdSession();
    Model.companyId = BranchID;
    this.UpdateViewModel();
    Model.Connection = new signalR.HubConnectionBuilder()
      .withUrl('https://wemessanger.azurewebsites.net/chatHub')
      .build();
    Model.Connection.start()
      .then(() => {
        console.log('SignalR connected');
        Model.Connection.invoke('JoinChat', Model.senderId);
      })
      .catch((err: any) => {
        Model.Connection.start();
        console.error('SignalR connection error:', err);
      });
    await Model.Connection.on(
      'ReceiveMessage',
      async (sender: any, receiver: any, message: any) => {
        const encodedUser = sender;
        const encodedReUser = receiver;
        const encodedMsg = message;
        var ReceiveMSg = new Chatss();

        if (message) {
          var date = new Date();
          ReceiveMSg.sMsg = message;
          ReceiveMSg.lReceiverId = receiver;
          ReceiveMSg.lSenderId = sender;
          var newDate = new Date(
            date.getTime() - date.getTimezoneOffset() * 60 * 1000,
          );
          var offset = date.getTimezoneOffset() / 60;
          var hours = date.getHours();
          newDate.setHours(hours + offset);
          ReceiveMSg.dtMsg = new Date(newDate).toString();
          var XyzIndex = Model.NewChat.findIndex((i: AllChats) => {
            // Create new Date objects with only the year, month, and day
            const itemDate = new Date();
            const iDate = new Date(i.date);

            // Compare only the date part
            return (
              itemDate.getFullYear() === iDate.getFullYear() &&
              itemDate.getMonth() === iDate.getMonth() &&
              itemDate.getDate() === iDate.getDate()
            );
          });
          // ReceiveMSg.dtMsg = new Date().toString()
          if (XyzIndex) {
            // await Model.Chats.push(ReceiveMSg);
            await Model.NewChat[XyzIndex].Chat.push(ReceiveMSg);
          } else {
            var NewChatArray = new AllChats();
            var date = new Date();
            if (
              date.getFullYear() === new Date(ReceiveMSg.dtMsg).getFullYear() &&
              date.getMonth() === new Date(ReceiveMSg.dtMsg).getMonth() &&
              date.getDate() === new Date(ReceiveMSg.dtMsg).getDate()
            ) {
              NewChatArray.istoday = true;
            } else {
              NewChatArray.istoday = false;
            }
            console.log('sendMsg date', ReceiveMSg.dtMsg);
            NewChatArray.date = ReceiveMSg.dtMsg.toString();
            NewChatArray.Chat.push(ReceiveMSg);
            Model.NewChat.push(NewChatArray);
          }
          console.log('REceiveMSG: ', ReceiveMSg.sMsg);
          this.UpdateViewModel();
        }
      },
    );
  };
  GetAllMsg = async () => {
    var Model = this.state.Model;
    console.log(Model.companyId);
    console.log(Model.senderId);
    console.log(Model.receiverId);
    axios
      .get(
        `https://wemessanger.azurewebsites.net/api/User/readmessage?companyId=${Model.companyId}&senderId=${Model.senderId}&receiverId=${Model.receiverId}`,
      )
      .then(res => {
        console.log('ResData: ', res.data);

        res.data.forEach((item: Chat) => {
          var Xyz = Model.NewChat.find((i: AllChats) => {
            // Create new Date objects with only the year, month, and day
            const itemDate = new Date(item.dtMsg);
            const iDate = new Date(i.date);

            // Compare only the date part
            return (
              itemDate.getFullYear() === iDate.getFullYear() &&
              itemDate.getMonth() === iDate.getMonth() &&
              itemDate.getDate() === iDate.getDate()
            );
          });

          var XyzIndex = Model.NewChat.findIndex((i: AllChats) => {
            // Create new Date objects with only the year, month, and day
            const itemDate = new Date(item.dtMsg);
            const iDate = new Date(i.date);
            // Compare only the date part
            return (
              itemDate.getFullYear() === iDate.getFullYear() &&
              itemDate.getMonth() === iDate.getMonth() &&
              itemDate.getDate() === iDate.getDate()
            );
          });

          const itemDate = new Date(item.dtMsg);
          if (Xyz) {
            Model.NewChat[XyzIndex].Chat.push(item);
            //    this.UpdateViewModel();
            // var NewChatArray = new Chatss()
            // NewChatArray.
          } else {
            var NewChatArray = new AllChats();
            var date = new Date();
            if (
              date.getFullYear() === new Date(item.dtMsg).getFullYear() &&
              date.getMonth() === new Date(item.dtMsg).getMonth() &&
              date.getDate() === new Date(item.dtMsg).getDate()
            ) {
              NewChatArray.istoday = true;
            } else {
              NewChatArray.istoday = false;
            }
            console.log('new date', item.dtMsg);
            NewChatArray.date = item.dtMsg.toString();
            NewChatArray.Chat.push(item);
            Model.NewChat.push(NewChatArray);
          }
          this.UpdateViewModel();
        });
        // Model.Chats = res.data;
        // this.UpdateViewModel();
        // console.log('MOdelNewChat: ', JSON.stringify(Model.NewChat));
      })
      .catch((err: any) => {
        console.log(err);
      });
  };
  ReceiveMsg = async () => {
    var model = this.state.Model;
    var ReceiveMSg = new Chatss();

    await model.Connection.on(
      'ReceiveMessage',
      async (sender: any, receiver: any, message: any) => {
        const encodedUser = sender;
        const encodedReUser = receiver;
        const encodedMsg = message;

        console.log('rrrr: ', encodedUser);
        console.log(encodedReUser);
        console.log(encodedMsg);
        // console.log('message: ', sender, receiver, message);

        // if (message) {
        //   ReceiveMSg.sMsg = message;
        //   ReceiveMSg.lReceiverId = receiver;
        //   ReceiveMSg.lSenderId = sender;
        //   await model.Chats.push(ReceiveMSg);
        //   console.log('REceiveMSG: ', ReceiveMSg.sMsg);

        //   this.UpdateViewModel();
        // }
      },
    ).catch((error: any) => {
      console.error('Error subscribing to ReceiveMessage:', error);
    });
  };
  ButtonClick = async () => {
    var model = this.state.Model;
    console.log(
      'Modelvalue:',
      model.companyId,
      model.senderId,
      model.receiverId,
      model.Message,
      model.msgflag,
      model.itype,
    );
    if (model.Message.trim() === '') {
      return;
    } else {
      // model.Chats.push(sendMsg);

      await model.Connection.invoke(
        'SendMessage',
        model.companyId,
        model.senderId,
        model.receiverId,
        model.Message,
        model.msgflag,
        model.itype,
      )
        .then(() => {
          var date = new Date();
          // const modifiedDate = new Date(date.getTime() - 19800000);
          console.log('Msg sent:', model.Message);
          var XyzIndex = model.NewChat.findIndex((i: AllChats) => {
            // Create new Date objects with only the year, month, and day
            const itemDate = new Date();
            const iDate = new Date(i.date);

            // Compare only the date part
            return (
              itemDate.getFullYear() === iDate.getFullYear() &&
              itemDate.getMonth() === iDate.getMonth() &&
              itemDate.getDate() === iDate.getDate()
            );
          });
          var Xyz = model.NewChat.find((i: AllChats) => {
            // Create new Date objects with only the year, month, and day
            const itemDate = new Date();
            const iDate = new Date(i.date);

            // Compare only the date part
            return (
              itemDate.getFullYear() === iDate.getFullYear() &&
              itemDate.getMonth() === iDate.getMonth() &&
              itemDate.getDate() === iDate.getDate()
            );
          });
          console.log('index', XyzIndex);
          var sendMsg = new Chatss();
          sendMsg.sMsg = model.Message;
          sendMsg.lSenderId = model.senderId;
          var newDate = new Date(
            date.getTime() - date.getTimezoneOffset() * 60 * 1000,
          );
          var offset = date.getTimezoneOffset() / 60;
          var hours = date.getHours();
          newDate.setHours(hours + offset);
          sendMsg.dtMsg = new Date(newDate).toString();
          console.log('SendDate', sendMsg.dtMsg);
          console.log('Send MSg: ', sendMsg);
          if (model.Message.trim() === '') {
            return;
          } else {
            if (Xyz) {
              console.log('indexavailable', model.NewChat[XyzIndex]);
              model.NewChat[XyzIndex].Chat.push(sendMsg);
            } else {
              var NewChatArray = new AllChats();
              var date = new Date();
              if (
                date.getFullYear() === new Date(sendMsg.dtMsg).getFullYear() &&
                date.getMonth() === new Date(sendMsg.dtMsg).getMonth() &&
                date.getDate() === new Date(sendMsg.dtMsg).getDate()
              ) {
                NewChatArray.istoday = true;
              } else {
                NewChatArray.istoday = false;
              }
              console.log('sendMsg date', sendMsg.dtMsg);
              NewChatArray.date = sendMsg.dtMsg.toString();
              NewChatArray.Chat.push(sendMsg);
              console.log('indexnotavailable', NewChatArray);
              model.NewChat.push(NewChatArray);
            }
            // model.Chats.push(sendMsg);
          }
          model.Message = '';
          this.UpdateViewModel();
          // this.GetAllMsg()
        })
        .catch((error: any) => {
          console.error('Error invoking SendMessage:', error);
        });
    }
  };
  Search = async () => {
    var Model = this.state.Model;
    Model.IsShow = !Model.IsShow;
    this.UpdateViewModel();
  };
  Cancle = async () => {
    var Model = this.state.Model;
    Model.IsShow = !Model.IsShow;
    this.UpdateViewModel();
  };
  DropDowmOpen = async () => {
    var Model = this.state.Model;
    Model.IsOpen = !Model.IsOpen;
    this.UpdateViewModel();
  };
  Logout=()=>{
    SessionHelper.SetBranchIdSession(null)
    SessionHelper.SetDeviceIdSession(null)
    SessionHelper.SetSenderIdSession(null)
    SessionHelper.SetURLSession(null)
    SessionHelper.SetUserDetailsSession(null)
    SessionHelper.SetUserNameSession(null)
    this.props.navigation.reset({
      index: 0,
      routes: [{ name: 'Loginpage' }],
    });
  }
  render() {
    // const { url } = this.state;
    const prefix = 'https://';
    var Model = this.state.Model;
    // console.log('Chats:', JSON.stringify(Model.NewChat) );

    return (
      <View style={styles.container}>
        {/* {Model.IsShow == false && ( */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => {
              this.props.navigation.navigate('Singlechatpage');
            }}>
            <Image
              source={require('../../assets/backimg.png')}
              style={{height: 30, width: 30, marginLeft: 10}}
            />
          </TouchableOpacity>
          <View style={{flex: 1}}>
            <Text style={styles.title}>{Model.User.userFullName}</Text>
            {/* <Text style={(styles.subtitle, styles.online)}>Online</Text> */}

            {/* <Text style={(styles.subtitle, styles.offline)}>Offline</Text> */}
          </View>
          {/* <TouchableOpacity
              onPress={() => {
                this.Search();
              }}>
              <Image
                source={require('../../assets/search.png')}
                style={{height: 30, width: 30, marginRight: 10, marginTop: 5}}
              />
            </TouchableOpacity> */}
          <TouchableOpacity
            onPress={() => {
              this.DropDowmOpen();
            }}>
            <Badge
              style={{
                backgroundColor: '#E9E9E9',
                width: 35,
                height: 35,
                borderRadius: 50,
                // justifyContent: 'center',
                alignItems: 'center',
                display: 'flex',
                // paddingTop: -10,
              }}>
              <Text
                style={{
                  color: 'black',
                  fontSize: 22,
                  fontWeight: '400',
                }}>
                {Model.sender.toLocaleUpperCase().charAt(0)}
              </Text>
            </Badge>
          </TouchableOpacity>
        </View>
        {/* )} */}
        {/* {Model.IsShow == true && (
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
                value={Model.Message}
                onChangeText={text => {
                  Model.Message = text;
                  this.UpdateViewModel();
                }}
                style={
                  (styles.input, {width: Dimensions.get('window').width - 70})
                }
                placeholder="Search....."></TextInput>
              <TouchableOpacity
                onPress={this.Cancle}
                style={{flexShrink: 1, width: 25, justifyContent: 'center'}}>
                <Image
                  source={require('../../assets/cancel.png')}
                  style={{height: 25, width: 25}}
                />
              </TouchableOpacity>
            </View>
          </View>
        )} */}
        <SafeAreaView style={styles.body}>
          {Model.IsOpen == true && (
            <View style={styles.dropdownContainer}>
              <View style={styles.dropdown}>
                <View>
                  <View>
                  <Text
                    style={{
                      padding: 20,
                      paddingBottom:1,
                      paddingTop:10,
                      color: '#0383FA',
                      // margin: 10,
                      alignSelf: 'left',
                      fontSize:12
                    }}>
                    User:
                  </Text>
                  <Text
                    style={{
                      padding: 20,
                      paddingBottom:10,
                      paddingTop:0,
                      color: 'black',
                      // margin: 10,
                      alignSelf: 'left',
                      fontSize:16
                    }}>
                    {Model.sender}
                  </Text>
                  </View>
                  <View>
                  <Text
                     style={{
                      padding: 20,
                      paddingBottom:1,
                      paddingTop:10,
                      color: '#0383FA',
                      // margin: 10,
                      alignSelf: 'left',
                      fontSize:12
                    }}>
                    Designation:
                  </Text>
                  </View>
                  <View style={{}}>
                  <Text
                    style={{
                      padding: 20,
                      paddingBottom:1,
                      paddingTop:10,
                      color: '#0383FA',
                      // margin: 10,
                      alignSelf: 'left',
                      fontSize:12
                    }}>
                    Connection Code:
                  </Text>
                  </View>
                  <View style={{}}>
                  <Text
                    style={{
                      padding: 20,
                      paddingBottom:1,
                      paddingTop:10,
                      color: '#0383FA',
                      // margin: 10,
                      alignSelf: 'left',
                      fontSize:12
                    }}>
                    Version:
                  </Text>
                  <Text
                    style={{
                      padding: 20,
                      paddingBottom:10,
                      paddingTop:0,
                      color: 'black',
                      // margin: 10,
                      alignSelf: 'left',
                      fontSize:16
                    }}>
                    {Model.AppVersion}
                  </Text>
                  </View>
                  {/* {model.OnlineText == 'Users Online' ? (
                    <TouchableOpacity onPress={() => this.UserOnline()}>
                      <Text
                        style={{
                          padding: 10,
                          color: 'black',
                          // margin: 10,
                          alignSelf: 'center',
                        }}>
                        {model.OnlineText}
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity onPress={() => this.AllUserss()}>
                      <Text
                        style={{
                          padding: 10,
                          color: 'black',
                          // margin: 10,
                          alignSelf: 'center',
                        }}>
                        {model.OnlineText}
                      </Text>
                    </TouchableOpacity>
                  )} */}
                  <TouchableOpacity onPress={() => this.Logout()}>
                    <Text
                      style={{
                        padding: 20,
                        paddingBottom:1,
                        paddingTop:10,
                        color: '#0383FA',
                        // margin: 10,
                        alignSelf: 'left',
                      }}>
                      Logout
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={{
              // flexGrow: 1,
              justifyContent: 'flex-end',
              flexDirection: 'column',
            }}
            ref="scrollView"
            onContentSizeChange={(width, height) =>
              this.refs.scrollView.scrollTo({y: height})
            }>
            {Model.NewChat.map((item: AllChats) => (
              <View style={{zIndex: 1}}>
                {item.istoday ? (
                  <Text style={styles.today}>Today</Text>
                ) : (
                  <Text style={styles.today}>
                    {EntityHelperService.ToDdMmmYyyy(item?.date)}
                  </Text>
                )}

                {item.Chat.map((i: Chat) =>
                  'u_' + i.lSenderId == Model.senderId ||
                  i.lSenderId == Model.senderId ? (
                    <>
                      <View style={styles.messageto}>
                        <View style={styles.messagetomessage}>
                          <View style={styles.messagetotext}>
                            <Text style={styles.messagetotextcontent}>
                              {i?.sMsg}
                            </Text>
                          </View>
                        </View>
                        <View style={styles.messagetotime}>
                          <Text style={styles.messagefromtimetext}>
                            {EntityHelperService.convertUTCDateToLocalDate(
                              new Date(i?.dtMsg),
                            )}
                          </Text>
                        </View>
                      </View>
                    </>
                  ) : (
                    <>
                      <View style={styles.messagefrom}>
                        <View style={styles.messagefrommessage}>
                          <View style={styles.messagefromicon}>
                            <Text
                              style={{
                                color: '#000',
                                flex: 1,
                                fontSize: 15,
                                textAlign: 'center',
                              }}>
                              {Model.User.userFullName
                                .toLocaleUpperCase()
                                .charAt(0)}
                            </Text>
                          </View>
                          <View style={styles.messagefromtext}>
                            <Text style={styles.messagefromtextcontent}>
                              {i?.sMsg}
                            </Text>
                          </View>
                        </View>
                        <View style={styles.messagefromtime}>
                          <Text style={styles.messagefromtimetext}>
                            {EntityHelperService.convertUTCDateToLocalDate(
                              new Date(i?.dtMsg),
                            )}
                          </Text>
                        </View>
                      </View>
                      <View>
                        {/* <Text style={styles.today}> {EntityHelperService.convertLocalDate(
                        new Date(i?.dtMsg)
                      )}</Text> */}
                      </View>
                    </>
                  ),
                )}
              </View>
            ))}
          </ScrollView>
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
                value={Model.Message}
                onChangeText={text => {
                  Model.Message = text;
                  this.UpdateViewModel();
                }}
                style={
                  (styles.input, {width: Dimensions.get('window').width - 70})
                }
                placeholder="Write your message here"></TextInput>
              <TouchableOpacity
                onPress={this.ButtonClick}
                style={{flexShrink: 1, width: 25, justifyContent: 'center'}}>
                <Image
                  source={require('../../assets/send.png')}
                  style={{height: 25, width: 25}}
                />
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Soft blue background
  },
  header: {
    backgroundColor: '#FFFFFF', // Lighter blue header
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // borderBottomWidth: 1,
    // borderColor: '#d9eeff', // Lighter blue accent
  },
  icon: {
    color: '#fff', // White icons
  },
  dropdownContainer: {
    position: 'absolute',
    top: 20,
    right: 10,
    // Set a height for the container
    height: 'auto',
    width: 200,
    zIndex: 100,
  },
  dropdown: {
    backgroundColor: '#f1f1f1',
    color: 'black',
    borderRadius: 10,
    textAlign: 'center',
    display: 'flex',
    justifyContent: 'center',
    zIndex: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Poppins-bold',
    // color: '#2196f3', // Darker blue title
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'Poppins-bold',
    // color: '#2196f3', // Darker blue title
  },
  online: {color: '#0383FA'},
  offline: {color: '#E4B27E'},
  today: {color: '#A6A6A6', textAlign: 'center', fontSize: 16, padding: 20},
  unread: {color: '#0383FA', textAlign: 'center', fontSize: 16, padding: 20},
  body: {
    flex: 1,
    flexDirection: 'column',
  },
  text: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    alignSelf: 'center',
  },
  scrollView: {zIndex: 1},
  text2: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    alignSelf: 'center',
    marginTop: 30,
    marginBottom: 30,
    letterSpacing: 1.2,
  },
  messagefrom: {
    flexDirection: 'column',
    paddingHorizontal: 15,
    paddingVertical: 10,
    flexWrap: 'wrap',
  },
  messagefrommessage: {flexDirection: 'row'},
  messagefromicon: {
    backgroundColor: '#E9E9E9',
    width: 40,
    height: 40,
    borderRadius: 20,
    padding: 5,
    alignItems: 'center',
    flexDirection: 'row',
  },
  messagefromtext: {paddingLeft: 10, paddingRight: 30, zIndex: 1},
  messagefromtextcontent: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: '#E9E9E9',
    borderRadius: 5,
    fontSize: 15,
    color: '#000',
    lineHeight: 25,
    fontFamily: 'OpenSans-VariableFont_wdth,wght',
  },
  messagefromtime: {
    flexDirections: 'row-reverse',
    paddingRight: 30,
    paddingVertical: 5,
  },
  messagefromtimetext: {flexShrink: 1, textAlign: 'right', fontSize: 12},
  messageto: {
    flexDirection: 'column',
    paddingHorizontal: 15,
    paddingVertical: 10,
    zIndex: 1,
  },
  messagetomessage: {flexDirection: 'row-reverse', zIndex: 1},
  messagetotext: {paddingLeft: 10, paddingRight: 0, zIndex: 1},
  messagetotextcontent: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: '#fef0e1',
    borderRadius: 5,
    fontSize: 15,
    color: '#C66E12',
    lineHeight: 25,
    fontFamily: 'OpenSans-VariableFont_wdth,wght',
    zIndex: 1,
  },
  messagetotime: {
    flexDirections: 'row-reverse',
    paddingRight: 0,
    paddingVertical: 5,
  },
  messagetotimetext: {flexShrink: 1, textAlign: 'right'},
  input: {
    alignSelf: 'center',
    backgroundColor: '#F1F1F1',
    borderColor: '#F1F1F1',
    paddingHorizontal: 5,
  },
  buttontest: {
    alignSelf: 'center',
    marginTop: '90%',
    height: 50,
    textAlign: 'center',
    justifyContent: 'center',
    backgroundColor: '#0383FA',
    color: 'white',
    borderRadius: 7,

    // padding: 10,
    width: '95%',
  },
});
