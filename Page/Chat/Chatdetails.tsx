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
  Alert,
  AppState,
  ActivityIndicator,
  BackHandler,
  Platform,
} from 'react-native';
import {Badge, Button} from 'native-base';
import BaseComponent from '../../Core/BaseComponent';
import BaseState from '../../Core/BaseState';
import * as signalR from '@microsoft/signalr';
import SessionHelper from '../../Core/SessionHelper';
import axios from 'axios';
import {Chat} from '../../Entity/Chat';
import EntityHelperService from '../Service/EntityHelperService';
import NetInfo from '@react-native-community/netinfo';
import RenderHtml from 'react-native-render-html';
export class ChatdetailsViewModel {
  Message: string = '';
  InvokeMessage: string = '';
  senderId: any;
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
  FCMToken: string = '';
  InterNetConnection: any;
  SignalRConnected: boolean = false;
  intervalId: any;
  ConnectionCode: any;
  AppStatus: any = AppState.currentState;
  PageNumber: number = 0;
  isLoading: boolean = false;
  AllChats: any[] = [];
  prevScrollY: number = 0;
  NoMoreData: boolean = false;
  Scroll: boolean = true;
  DataLength: number = 0;
  BranchID: number = 1;
  URL: string = 'eiplutm.eresourceerp.com/AzaaleaR';
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
var intervalId: any = true;
var MsgCounter = 0;
var CurDate;
var PntDate = '';
var TodayDate = '';
var prdt = false;
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

  async componentDidMount() {
    var Model = this.state.Model;
    var ConnectionCode = await SessionHelper.GetCompanyIDSession();
    Model.receiverId = `${ConnectionCode}_${Model.User.lId.toString()}`;
    var URL = await SessionHelper.GetURLSession();
    if (URL) {
      Model.URL = URL;
      this.UpdateViewModel();
    }
    this.MakeConnection();

    // this.ReceiveMsg();
    var User = await SessionHelper.GetUserDetailsSession();
    var FCMToken = await SessionHelper.GetFCMTokenSession();
    var ConnectionCode = await SessionHelper.GetCompanyIDSession();
    var BranchID = await SessionHelper.GetBranchIdSession();
    var UserDetails = await SessionHelper.GetUserDetailsSession();
    console.log('user: ', User);
    Model.BranchID = BranchID;
    Model.ConnectionCode = ConnectionCode;
    Model.FCMToken = FCMToken;
    Model.sender = User.userName;
    this.UpdateViewModel();
    console.log('@Receiver', this.props.route.params.User);
    Model.senderId = `${ConnectionCode}_${UserDetails.lId.toString()}`;
    console.log('UserDetails.lId', UserDetails);
    console.log('UserDetails.lId', Model.senderId);
    this.UpdateViewModel();
    this.GetAllMsg();
    // this.CheckAppStatus();
    SessionHelper.SetReceiverIDSession(Model.receiverId);
    // setInterval(this.CheckAppStatus, 2000);
    // setTimeout(() => {this.CheckAppStatus},2000)

    // this.CheckInternetConnetion();
    // if(Model.SignalRConnected === false){
    //   intervalId = setInterval(this.CheckInternetConnetion, 7000);
    // // this.UpdateViewModel()
    // }
    if (Platform.OS == 'android') {
      BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
    }
    this.MarkRead();
  }
  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackButton);
  }
  handleBackButton = () => {
    this.props.navigation.reset({
      index: 0,
      routes: [{name: 'Singlechatpage'}],
    });
    return true;
  };
  MarkRead = () => {
    var Model = this.state.Model;
    console.log('Branch: ', Model.BranchID);
    console.log('SenderID', Model.senderId);
    console.log('ReceiverId', Model.receiverId);
    const headers = {
      'Content-Type': 'application/json',
    };
    var Data = JSON.stringify({
      companyid: Model.BranchID,
      senderId: Model.senderId,
      receiverId: Model.receiverId,
    });
    axios
      .put(`https://wemessanger.azurewebsites.net/api/user`, Data, {headers})
      .then((res: any) => {
        console.log('ReadMSg: ', res.data);
      })
      .catch((err: any) => {
        console.log('ReadMSgERror: ', err);
      });
  };
  // componentWillUnmount() {
  //   var Model = this.state.Model

  //   // if(Model.SignalRConnected === false){
  //   //   intervalId = setInterval(this.CheckInternetConnetion, 3000);
  //   // // this.UpdateViewModel()
  //   // }

  // }
  // async componentWillUnmount() {
  //   var model = this.state.Model
  //   console.log('gdfgfgf')
  //   if (model.InterNetConnection == true) {
  //     console.log("ModelConnecrtion: ", model.Connection);
  //     console.log("ModelInternetConnecrtion: ", model.InterNetConnection);

  //     // if(model.Connection==null){
  //    await this.MakeConnection();
  //      await model.Connection.start()
  //     .then(() => {
  //       console.log('SignalR connected');
  //       model.Connection.invoke('JoinChat', model.senderId);
  //     })
  //     // }

  //   }
  //   this.UpdateViewModel()

  // }
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
    console.log('hello');
    var Model = this.state.Model;
    var BranchID = await SessionHelper.GetBranchIdSession();
    Model.companyId = BranchID;
    this.UpdateViewModel();
    Model.Connection = new signalR.HubConnectionBuilder()
      .withUrl(
        `https://wemessanger.azurewebsites.net/chatHub?UserId=${Model.senderId}`,
      )
      .build();
    Model.Connection.start()
      .then(() => {
        console.log('SignalR connected');
        Model.SignalRConnected = true;
        this.UpdateViewModel();
        //   clearInterval(intervalId);
        Model.Connection.invoke('JoinChat', Model.senderId);
      })
      .catch((err: any) => {
        Model.Connection.start();
        Model.SignalRConnected = false;
        this.UpdateViewModel();
        // intervalId = setInterval(this.CheckInternetConnetion, 3000);
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
          Model.Scroll = true;
          MsgCounter = MsgCounter + 1;
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
          var dt = new Date(newDate);

          ReceiveMSg.dtMsg =
            dt.getFullYear().toString() +
            '-' +
            ('0' + (dt.getMonth() + 1)).slice(-2).toString() +
            '-' +
            ('0' + dt.getDate()).slice(-2).toString() +
            'T' +
            ('0' + dt.getHours()).slice(-2).toString() +
            ':' +
            ('0' + dt.getMinutes()).slice(-2).toString() +
            ':' +
            ('0' + dt.getSeconds()).slice(-2).toString() +
            '.000';
          console.log(' ReceiveMSg.dtMsg: ', ReceiveMSg.dtMsg);
          var NewChatArray = new AllChats();
          console.log('ArrayPush:___ ');
          NewChatArray.Chat.push(ReceiveMSg);
          Model.NewChat.push(NewChatArray);
          TodayDate =
            new Date().getFullYear() +
            '-' +
            ('0' + (dt.getMonth() + 1)).slice(-2) +
            '-' +
            new Date().getDate();
          console.log('Today Date: ', TodayDate);

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
          console.log('newChatreceive: ', JSON.stringify(Model.NewChat));
          console.log('REceiveMSG: ', ReceiveMSg.sMsg);
          MsgCounter = 0;
          this.UpdateViewModel();
          this.MarkRead();
          return;
        }
      },
    );
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
          this.MakeConnection();
        }
        if (nextAppState == 'background') {
          var Connection = new signalR.HubConnectionBuilder()
            .withUrl(
              `https://wemessanger.azurewebsites.net/chatHub?UserId=${Model.senderId}`,
            )
            .build();
          Connection.start().then(() => {
            console.log('SignalR connected');
            Connection.invoke('DisconnectUser', Model.senderId)
              .then((res: any) => {
                console.log('resDisconnect: ', res);

                console.log('SignalRConnected: ', Model.SignalRConnected);
              })
              .catch((err: any) => {
                console.log('ErrorDisconnect: ', err);
              });
          });
        }
      },
    );
  };
  // CheckInternetConnetion = () => {
  //   var model = this.state.Model;
  //   NetInfo.addEventListener(state => {
  //     // model.InterNetConnection = state.isConnected;
  //     this.handleConnectivityChange(state.isConnected);
  //     this.UpdateViewModel();
  //   });
  //   // if (model.InterNetConnection == true) {
  //   //   this.MakeConnection()
  //   // }
  //   // console.log('InternetConnetion: ', model.InterNetConnection);
  // };
  // handleConnectivityChange = (isConnected: any) => {
  //   var Model = this.state.Model;
  //   if (isConnected) {
  //     console.log('ConnectedState:', isConnected);
  //     Model.SignalRConnected = true;
  //     this.MakeConnection();
  //     this.UpdateViewModel();
  //   } else {
  //     // If offline, disconnect from SignalR
  //     // this.disconnectSignalR();
  //   }
  // };
  GetAllMsg = async () => {
    var Model = this.state.Model;
    PntDate = '';
    TodayDate =
      new Date().getFullYear() +
      '-' +
      ('0' + (new Date().getMonth() + 1)).slice(-2) +
      '-' +
      new Date().getDate();
    console.log('Today Date: ', TodayDate);
    console.log(Model.companyId);
    console.log(Model.senderId);
    console.log(Model.receiverId);
    axios
      .get(
        `https://wemessanger.azurewebsites.net/api/User/readmessage?companyId=${Model.companyId}&senderId=${Model.senderId}&receiverId=${Model.receiverId}&pageNo=${Model.PageNumber}`,
      )
      .then(res => {
        console.log('AllChat: ', res.data);
        Model.AllChats = res.data;
        this.UpdateViewModel();

        Model.AllChats.forEach((item: Chat) => {
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
  ButtonClick = async () => {
    var model = this.state.Model;
    model.Scroll = true;
    this.UpdateViewModel();
    MsgCounter = MsgCounter + 1;
    // if (model.SignalRConnected) {
    if (model.Message.trim() === '') {
      return;
    } else {
      var date = new Date();
      // const modifiedDate = new Date(date.getTime() - 19800000);
      console.log('Msg sent:', model.Message);
      model.InvokeMessage = model.Message;
      this.UpdateViewModel();
      var XyzIndex = model.NewChat.findIndex((i: AllChats) => {
        const itemDate = new Date();
        const iDate = new Date(i.date);
        return (
          itemDate.getFullYear() === iDate.getFullYear() &&
          itemDate.getMonth() === iDate.getMonth() &&
          itemDate.getDate() === iDate.getDate()
        );
      });
      var Xyz = model.NewChat.find((i: AllChats) => {
        const itemDate = new Date();
        const iDate = new Date(i.date);
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
      console.log('getTime: ', newDate);

      var offset = date.getTimezoneOffset() / 60;
      var hours = date.getHours();
      newDate.setHours(hours + offset);
      console.log('NewDate: ', newDate);

      var dt = new Date(newDate);

      sendMsg.dtMsg =
        dt.getFullYear().toString() +
        '-' +
        ('0' + (dt.getMonth() + 1)).slice(-2).toString() +
        '-' +
        ('0' + dt.getDate()).slice(-2).toString() +
        'T' +
        ('0' + dt.getHours()).slice(-2).toString() +
        ':' +
        ('0' + dt.getMinutes()).slice(-2).toString() +
        ':' +
        ('0' + dt.getSeconds()).slice(-2).toString() +
        '.000';
      console.log('SendDate', sendMsg.dtMsg);
      TodayDate =
        new Date().getFullYear() +
        '-' +
        ('0' + (new Date().getMonth() + 1)).slice(-2) +
        '-' +
        new Date().getDate();
      console.log('Today Date: ', TodayDate);
      var NewChatArray = new AllChats();
      console.log('Send MSg: ', sendMsg);
      // if (Xyz) {
      //   // console.log('indexavailable', model.NewChat[XyzIndex]);
      //   model.NewChat[XyzIndex].Chat.push(sendMsg);
      //   model.Message = '';
      //   this.UpdateViewModel();
      //   console.log('newChatsend: ', JSON.stringify(model.NewChat));
      // } else {
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
      console.log('indexnotavailable', NewChatArray);
      NewChatArray.Chat.push(sendMsg);
      model.NewChat.push(NewChatArray);
      MsgCounter = 0;
      console.log('newChat: ', JSON.stringify(model.NewChat));
      model.Message = '';
      this.UpdateViewModel();
      // }
      await model.Connection.invoke(
        'SendMessage',
        model.companyId,
        model.senderId,
        model.receiverId,
        model.InvokeMessage,
        model.msgflag,
        model.itype,
      )
        .then(() => {
          console.log('ok');
          model.Message = '';
          this.UpdateViewModel();
        })
        .catch((error: any) => {
          console.log('errorsssss');
          console.error('Error invoking SendMessage:', error);
        });
    }
    // }
    // if (!model.SignalRConnected) {
    //   model.SignalRConnected = false
    //   this.UpdateViewModel()
    //   var date = new Date();
    //   console.log('Msg sent:', model.Message);
    //   var XyzIndex = model.NewChat.findIndex((i: AllChats) => {
    //     const itemDate = new Date();
    //     const iDate = new Date(i.date);
    //     return (
    //       itemDate.getFullYear() === iDate.getFullYear() &&
    //       itemDate.getMonth() === iDate.getMonth() &&
    //       itemDate.getDate() === iDate.getDate()
    //     );
    //   });
    //   var Xyz = model.NewChat.find((i: AllChats) => {
    //     const itemDate = new Date();
    //     const iDate = new Date(i.date);
    //     return (
    //       itemDate.getFullYear() === iDate.getFullYear() &&
    //       itemDate.getMonth() === iDate.getMonth() &&
    //       itemDate.getDate() === iDate.getDate()
    //     );
    //   });
    //   console.log('index', XyzIndex);
    //   var sendMsg = new Chatss();
    //   sendMsg.sMsg = model.Message;
    //   sendMsg.lSenderId = model.senderId;
    //   var newDate = new Date(
    //     date.getTime() - date.getTimezoneOffset() * 60 * 1000,
    //   );
    //   var offset = date.getTimezoneOffset() / 60;
    //   var hours = date.getHours();
    //   newDate.setHours(hours + offset);
    //   sendMsg.dtMsg = new Date(newDate).toString();
    //   console.log('SendDate', sendMsg.dtMsg);
    //   console.log('Send MSg: ', sendMsg);
    //   if (Xyz) {
    //     console.log('indexavailable', model.NewChat[XyzIndex]);
    //     model.NewChat[XyzIndex].Chat.push(sendMsg);
    //     Alert.alert(
    //       'Connection Status',
    //       'No internet connection',
    //       [
    //         {
    //           text: 'OK',
    //           onPress: () => {
    //             var ChatLength = model.NewChat.length - 1;
    //             model.NewChat[ChatLength].Chat.pop();
    //             model.Message = '';
    //             this.UpdateViewModel();
    //             console.log('NewChat2: ', model.NewChat);
    //             console.log('OK Pressed');
    //           },
    //         },
    //       ],
    //       {cancelable: false},
    //     );
    //   } else {
    //     var NewChatArray = new AllChats();
    //     var date = new Date();
    //     if (
    //       date.getFullYear() === new Date(sendMsg.dtMsg).getFullYear() &&
    //       date.getMonth() === new Date(sendMsg.dtMsg).getMonth() &&
    //       date.getDate() === new Date(sendMsg.dtMsg).getDate()
    //     ) {
    //       NewChatArray.istoday = true;
    //     } else {
    //       NewChatArray.istoday = false;
    //     }
    //     console.log('sendMsg date', sendMsg.dtMsg);
    //     NewChatArray.date = sendMsg.dtMsg.toString();
    //     NewChatArray.Chat.push(sendMsg);
    //     console.log('indexnotavailable', NewChatArray);
    //     model.NewChat.push(NewChatArray);
    //     console.log('NewChat: ', model.NewChat);

    //     Alert.alert(
    //       'Connection Status',
    //       'No internet connection',
    //       [
    //         {
    //           text: 'OK',
    //           onPress: () => {
    //             var ChatLength = model.NewChat.length - 1;
    //             model.NewChat[ChatLength].Chat.pop();
    //             model.Message = '';
    //             this.UpdateViewModel();
    //             console.log('NewChat2: ', model.NewChat);
    //             console.log('OK Pressed');
    //           },
    //         },
    //       ],
    //       {cancelable: false},
    //     );
    //   }
    // }
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
        `https://wemessanger.azurewebsites.net/chatHub?UserId=${Model.senderId}`,
      )
      .build();
    Connection.start().then(() => {
      console.log('SignalR connected');
      Connection.invoke('DisconnectUser', Model.senderId)
        .then((res: any) => {
          console.log('resDisconnect: ', res);
        })
        .catch((err: any) => {
          console.log('ErrorDisconnect: ', err);
        });
    });
  };
  handleScroll = (event: any) => {
    // console.log("?Hiiii");

    var Model = this.state.Model;

    const {layoutMeasurement, contentOffset, contentSize} = event.nativeEvent;
    const paddingToBottom = 20;

    // Check if the current scroll position is less than the previous one
    if (contentOffset.y < Model.prevScrollY) {
      console.log('hiii');
      console.log('Scrolled up - Trigger loading more data');
      Model.PageNumber = Model.PageNumber + 1;
      Model.Scroll = false;
      this.UpdateViewModel();
      // this.loadMoreData();
      console.log('PageNo:', Model.PageNumber);

      axios
        .get(
          `https://wemessanger.azurewebsites.net/api/User/readmessage?companyId=${Model.companyId}&senderId=${Model.senderId}&receiverId=${Model.receiverId}&pageNo=${Model.PageNumber}`,
        )
        .then((res: any) => {
          console.log('AllChat: ', res.data);
          var ReverseData = res.data.reverse();
          console.log('ReverseData', ReverseData.length);
          Model.DataLength = ReverseData.length;
          this.UpdateViewModel();
          if (ReverseData.length == 0) {
            Model.NoMoreData = true;
            this.MakeConnection();
          }
          ReverseData.forEach((item: Chat) => {
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
              Model.NewChat[XyzIndex].Chat.unshift(item);
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
              NewChatArray.Chat.unshift(item);
              Model.NewChat.unshift(NewChatArray);
            }
            this.UpdateViewModel();
          });
        });

      // Update the previous scroll position
      // Model.prevScrollY = contentOffset.y;
      this.UpdateViewModel();
    }
  };
  LocationPage = () => {
    this.props.navigation.navigate('MapPage');
  };
  Approve = async(text: string) => {
    var value = await SessionHelper.GetSession();
    const headers = {
      'Content-Type': 'application/json',
      Cookie: `ASP.NET_SessionId=${value}`,
    };
    var Model = this.state.Model
    console.log('Approve: ', text);
    axios.get(`http://${Model.URL}/${text}`,{headers:headers}).then((res)=>{
      console.log(res.data);
      Alert.alert(JSON.stringify(res.data))
      
    }).catch((err)=>{
      console.log(err);
      Alert.alert(JSON.stringify(err))
    })
  };
  render() {
    // const { url } = this.state;
    const prefix = 'https://';
    var Model = this.state.Model;
    // console.log('Appstatus: ', Model.AppStatus);
    // console.log('SignalConnectionR: ', Model.SignalRConnected);
    // console.log('Chats:', JSON.stringify(Model.NewChat) );

    return (
      <View style={styles.container}>
        {/* {Model.IsShow == false && ( */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => {
              this.props.navigation.reset({
                index: 0,
                routes: [{name: 'Singlechatpage'}],
              });
            }}>
            <Image
              source={require('../../assets/backimg.png')}
              style={{height: 20, width: 20, marginLeft: 10}}
            />
          </TouchableOpacity>
          <View style={{flex: 1}}>
            <Text style={styles.title}>{Model.User.userFullName}</Text>
            {Model.User.isUserLive ? (
              <Text style={styles.subtitle1}>Online</Text>
            ) : (
              <Text style={styles.subtitle2}>Offline</Text>
            )}
          </View>
          <TouchableOpacity
            onPress={() => {
              this.LocationPage();
            }}>
            <Image
              source={require('../../assets/location.png')}
              style={{height: 30, width: 30, marginRight: 10}}
            />
          </TouchableOpacity>
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
                // marginTop: 10,
              }}>
              <Text
                style={{
                  color: 'black',
                  fontSize: 22,
                  fontWeight: '400',
                  fontFamily: 'OpenSans-Regular',
                }}>
                {Model.sender.toLocaleUpperCase().charAt(0)}
              </Text>
            </Badge>
          </TouchableOpacity>
          {/* <TouchableOpacity
            style={{width: 25,marginTop: 15, marginHorizontal:5}}
            onPress={() => {
              this.LocationPage();
            }}>
            <Image
              source={require('../../assets/location.png')}
              style={{height: 25, width: 25}}
            />
          </TouchableOpacity> */}
        </View>
        <SafeAreaView style={styles.body}>
          {Model.IsOpen == true && (
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
                        alignSelf: 'left',
                        fontSize: 12,
                      }}>
                      User:
                    </Text>
                    <Text
                      style={{
                        paddingLeft: 20,
                        color: 'black',
                        alignSelf: 'left',
                        fontSize: 12,
                        fontFamily: 'OpenSans-SemiBold',
                      }}>
                      {Model.sender}
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
                        alignSelf: 'left',
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
                        alignSelf: 'left',
                        fontSize: 12,
                      }}>
                      Connection Code:
                    </Text>
                    <Text
                      style={{
                        paddingLeft: 20,
                        color: 'black',
                        alignSelf: 'left',
                        fontSize: 12,
                        fontFamily: 'OpenSans-SemiBold',
                      }}>
                      {Model.ConnectionCode}
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
                        alignSelf: 'left',
                        fontSize: 12,
                      }}>
                      Version:
                    </Text>
                    <Text
                      style={{
                        paddingLeft: 20,
                        color: 'black',
                        alignSelf: 'left',
                        fontSize: 12,
                        fontFamily: 'OpenSans-SemiBold',
                      }}>
                      {Model.AppVersion}
                    </Text>
                  </View>
                  <View style={styles.divider}></View>

                  <TouchableOpacity onPress={() => this.Logout()}>
                    <Text
                      style={{
                        fontFamily: 'OpenSans-SemiBold',
                        marginTop: 15,
                        paddingLeft: 20,
                        color: '#0383FA',
                        alignSelf: 'left',
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

          <ScrollView
            onScroll={this.handleScroll}
            scrollEventThrottle={16}
            style={styles.scrollView}
            contentContainerStyle={{
              // flexGrow: 1,
              justifyContent: 'flex-end',
              flexDirection: 'column',
            }}
            ref="scrollView"
            onContentSizeChange={(width, height) => {
              console.log('Height: ', height);

              const yOffset = (Model.DataLength - 1) * 70;
              Model.Scroll == true
                ? this.refs.scrollView.scrollTo({y: height})
                : this.refs.scrollView.scrollTo({y: yOffset});
            }}>
            {Model.NoMoreData && (
              <View>
                <Text style={{alignSelf: 'center'}}>No More Conversation</Text>
              </View>
            )}
            {Model.SignalRConnected === false && (
              <ActivityIndicator size="large" color="#0000ff" />
            )}

            {Model.SignalRConnected === true &&
              Model.NewChat.map((item: AllChats) => {
                var pdate = false;
                var showdate = '';

                // console.log(typeof item?.date, );

                var doDate = typeof item?.date;
                if (doDate == 'string') {
                  CurDate = item?.date.toString().slice(0, 10);
                } else {
                  CurDate =
                    item?.date.getFullYear() +
                    '-' +
                    ('0' + (item?.date.getMonth() + 1)).slice(-2) +
                    '-' +
                    item?.date.getDate();
                }
                console.log('PntDate: ', PntDate);
                console.log('CurDate: ', CurDate);

                if (CurDate != PntDate) {
                  pdate = true;
                  PntDate = CurDate;
                  if (PntDate == TodayDate) {
                    showdate = 'Today';
                  } else {
                    showdate =
                      PntDate.slice(8, 10) +
                      '-' +
                      PntDate.slice(5, 7) +
                      '-' +
                      PntDate.slice(0, 4);
                  }
                } else {
                  pdate = false;
                }
                return (
                  <View style={{zIndex: 1}}>
                    {/* {item.istoday ? (
                    <Text style={styles.today}>Today</Text>
                  ) : (
                    <Text style={styles.today}>
                      {`${item?.date.slice(8, 10)}-${item?.date.slice(5,7)}-${item?.date.slice(0, 4)}`}
                    </Text>
                  )} */}
                    {pdate ? (
                      <Text style={styles.today}>{showdate}</Text>
                    ) : null}

                    {item.Chat.map((i: Chat) => {
                      var MsgSplit = i.sMsg.split('||');
                      console.log('MsgSplitlength: ', MsgSplit.length);

                      return `${Model.ConnectionCode}_${i.lSenderId}` ==
                        Model.senderId || i.lSenderId == Model.senderId ? (
                        <>
                          <View style={styles.messageto}>
                            <View style={styles.messagetomessage}>
                              <View style={styles.messagetotext}>
                                {MsgSplit.length == 2 ? (
                                  <><View style={{ flexDirection: 'row',gap:5 }}><Button
                                      onPress={() => this.Approve(MsgSplit[0])}
                                      style={styles.buttontest}>
                                      <Text
                                        style={{
                                          color: 'white',
                                          // fontWeight: '800',
                                          fontFamily: 'Poppins-Regular',
                                          fontSize: 12,
                                          margin:0
                                        }}>
                                        Approve
                                      </Text>
                                    </Button>
                                    <Button
                                      onPress={() => this.Approve(MsgSplit[1])}
                                      style={styles.rejectbuttontest}>
                                      <Text
                                        style={{
                                          color: 'white',
                                          // fontWeight: '800',
                                          fontFamily: 'Poppins-Regular',
                                          fontSize: 12,
                                        }}>
                                        Reject
                                      </Text>
                                    </Button>
                                    </View>
                                    </>
                                ) : (
                                  <Text style={styles.messagetotextcontent}>
                                    {i?.sMsg}
                                  </Text>
                                )}
                              </View>
                            </View>
                            <View style={styles.messagetotime}>
                              <Text style={styles.messagefromtimetext}>
                                {EntityHelperService.convertUTCDateToLocalDate(
                                  new Date(i?.dtMsg),
                                )}
                              </Text>
                              <Text>{item?.istoday}</Text>
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
                                {/* <Button
                                  // onPress={this.Login}
                                  // style={styles.buttontest}
                                  >
                                  <Text
                                    style={{
                                      color: 'white',
                                      // fontWeight: '800',
                                      fontFamily: 'Poppins-Bold',
                                    }}>
                                    Login
                                  </Text>
                                </Button> */}
                              </View>
                            </View>
                            <View style={styles.messagefromtime}>
                              <Text style={styles.messagefromtimetext}>
                                {EntityHelperService.convertUTCDateToLocalDate(
                                  new Date(i?.dtMsg),
                                )}
                              </Text>
                              <Text>{item?.istoday}</Text>
                            </View>
                          </View>
                        </>
                      );
                    })}
                  </View>
                );
              })}
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
                onPressIn={() => {
                  var Model = this.state.Model;
                  Model.Scroll = true;
                  this.UpdateViewModel();
                  console.log('Hi');
                }}
                style={
                  (styles.input,
                  {
                    width: Dimensions.get('window').width - 70,
                    fontFamily: 'OpenSans-Regular',
                  })
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
  divider: {
    height: 1,
    backgroundColor: 'gray',
    marginHorizontal: 20,
    marginTop: 12,
    opacity: 0.5,
  },
  icon: {
    color: '#fff', // White icons
  },
  dropdownContainer: {
    position: 'absolute',
    top: -20,
    right: 20,
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
    lineHeight: 20,
    fontSize: 18,
    // fontWeight: '700',
    fontFamily: 'Poppins-SemiBold',
    color: 'black', // Darker blue title
  },
  subtitle1: {
    fontSize: 12,
    // fontWeight: '700',
    fontFamily: 'OpenSans-Regular',
    color: '#0383FA',
    lineHeight: 13,
    // color: '#2196f3', // Darker blue title
  },
  subtitle2: {
    fontSize: 12,
    // fontWeight: '700',
    fontFamily: 'OpenSans-Regular',
    color: '#E4B27E',
    lineHeight: 13,
    // color: '#2196f3', // Darker blue title
  },
  online: {color: '#0383FA'},
  offline: {color: '#E4B27E'},
  today: {
    color: '#A6A6A6',
    textAlign: 'center',
    fontSize: 16,
    padding: 20,
    fontFamily: 'OpenSans-Regular',
  },
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
  messagefrom: {
    // flexDirection: 'column',
    paddingHorizontal: 15,
    // paddingVertical: 4,
    flexWrap: 'wrap',
  },
  messagefrommessage: {flexDirection: 'row'},
  messagefromicon: {
    backgroundColor: '#E9E9E9',
    width: 30,
    height: 30,
    borderRadius: 50,
    padding: 5,
    alignItems: 'center',
    flexDirection: 'row',
  },
  messagefromtext: {paddingLeft: 10, paddingRight: 30, paddingVertical: 0},
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
    // flexDirections: 'row-reverse',
    paddingRight: 30,
    paddingBottom: 6,
    // paddingTop:0,
    // marginTop:0
  },
  messagefromtimetext: {
    // flexShrink: 1,
    textAlign: 'right',
    fontSize: 12,
    fontFamily: 'OpenSans-Regular',
    // marginVertical:0
  },
  messageto: {
    flexDirection: 'column',
    paddingHorizontal: 15,
    paddingVertical: 4,
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
    // paddingVertical: 5,
  },
  messagetotimetext: {flexShrink: 1, textAlign: 'right'},
  input: {
    alignSelf: 'center',
    backgroundColor: '#F1F1F1',
    borderColor: '#F1F1F1',
    paddingHorizontal: 5,
    fontFamily: 'OpenSans-Regular',
  },
  buttontest: {
    alignSelf: 'center',
    // marginTop: '90%',
    height: 34,
    // textAlign: 'center',
    // justifyContent: 'center',
    backgroundColor: '#0383FA',
    color: 'white',
    borderRadius: 5,

    paddingHorizontal:10 ,
    paddingVertical:0
    // width: '95%',
  },
  rejectbuttontest: {
    alignSelf: 'center',
    // marginTop: '90%',
    height: 34,
    // textAlign: 'center',
    // justifyContent: 'center',
    backgroundColor: 'red',
    color: 'white',
    borderRadius: 5,

    paddingHorizontal:10 ,
    paddingVertical:0

    // width: '95%',
  },
});
