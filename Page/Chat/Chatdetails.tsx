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
  PermissionsAndroid,
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
import moment from 'moment';
import DocumentPicker from 'react-native-document-picker';
import * as RNFS from 'react-native-fs';
import RNFetchBlob from 'rn-fetch-blob';
import PushNotification from 'react-native-push-notification';
import Snackbar from 'react-native-snackbar';
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
  selectedFile: any;
  FileName: string = '';
  AttchId: number = 0;
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
  chidtMsg?: Date;
  lAttchId: number = 0;
  lCompId: number = 0;
  lFromStatusId: number = 0;
  lId: number = 0;
  lRecCompId: number = 0;
  lReceiverId: any;
  lSenderId: any;
  lSrId: number = 0;
  lToStatusId: number = 0;
  lTypId: number = 0;
  sConnId: string = '';
  sMsg: string = '';
  dtMsg: any;
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
    var User = await SessionHelper.GetUserDetailsSession();
    var FCMToken = await SessionHelper.GetFCMTokenSession();
    var ConnectionCode = await SessionHelper.GetCompanyIDSession();
    var BranchID = await SessionHelper.GetBranchIdSession();
    var UserDetails = await SessionHelper.GetUserDetailsSession();
    // console.log('user: ', User);
    Model.BranchID = BranchID;
    Model.ConnectionCode = ConnectionCode;
    Model.FCMToken = FCMToken;
    Model.sender = User.userName;
    this.UpdateViewModel();
    // console.log('@Receiver', this.props.route.params.User);
    Model.senderId = `${ConnectionCode}_${UserDetails.lId.toString()}`;
    // console.log('UserDetails.lId', UserDetails);
    // console.log('UserDetails.lId', Model.senderId);
    this.UpdateViewModel();
    this.GetAllMsg();
    SessionHelper.SetReceiverIDSession(Model.receiverId);
    if (Platform.OS == 'android') {
      BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
    }
    this.MarkRead();
    this.IsTalking();
    this.CheckAppStatus();
    const hasPermission = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
    );
    console.log('hasPermission: ', hasPermission);
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
  showSnackbar = () => {
    Snackbar.show({
      text: 'Download Successfully',
      duration: 1000, // Or LENGTH_LONG, LENGTH_INDEFINITE
      // Optional:
      backgroundColor: '#4DB14F',
      // action: {
      //   text: 'Dismiss',
      //   onPress: () => { null },
      // },
    });
  };
  MarkRead = () => {
    var Model = this.state.Model;
    const headers = {
      'Content-Type': 'application/json',
    };
    var Data = JSON.stringify({
      companyid: Model.BranchID,
      senderId: Model.senderId,
      receiverId: Model.receiverId,
    });
    // console.log('Markread: ', Data);

    axios
      .put(`https://wemessanger.azurewebsites.net/api/user`, Data, {headers})
      .then((res: any) => {
        // console.log('ReadMSg: ', res.data);
      })
      .catch((err: any) => {
        // console.log('ReadMSgERror: ', err);
      });
  };
  IsTalking = () => {
    var Model = this.state.Model;
    const headers = {
      'Content-Type': 'application/json',
    };
    var TalkingData = JSON.stringify({
      FromUserId: Model.senderId,
      ToUserId: Model.receiverId,
      IsTaking: true,
    });
    // console.log('TalkingData: ', TalkingData);
    axios
      .post(
        `https://wemessanger.azurewebsites.net/api/user/taking`,
        TalkingData,
        {headers: headers},
      )
      .then(res => {
        // console.log('TalkingRes: ', res.data);
      })
      .catch(err => {
        // console.log('TalkingError: ', err);
      });
  };
  IsTalkingFlase = () => {
    var Model = this.state.Model;
    const headers = {
      'Content-Type': 'application/json',
    };
    var TalkingData = JSON.stringify({
      FromUserId: Model.senderId,
      ToUserId: '0',
      IsTaking: true,
    });
    // console.log('TalkingData: ', TalkingData);
    axios
      .post(
        `https://wemessanger.azurewebsites.net/api/user/taking`,
        TalkingData,
        {headers: headers},
      )
      .then(res => {
        // console.log('TalkingRes: ', res.data);
      })
      .catch(err => {
        // console.log('TalkingError: ', err);
      });
  };
  MakeConnection = async () => {
    this.IsTalking();
    var Model = this.state.Model;
    var BranchID = await SessionHelper.GetBranchIdSession();
    Model.companyId = BranchID;
    this.UpdateViewModel();
    Model.Connection = new signalR.HubConnectionBuilder()
      .withUrl(
        `https://wemessanger.azurewebsites.net/chatHub?UserId=${Model.senderId}`,
      )
      .build();
    this.UpdateViewModel();
    Model.Connection.start()
      .then(() => {
        console.log('SignalR connected');
        Model.SignalRConnected = true;
        this.UpdateViewModel();
        Model.Connection.invoke('JoinChat', Model.senderId);
      })
      .catch((err: any) => {
        Model.Connection.start();
        Model.SignalRConnected = false;
        this.UpdateViewModel();
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
          var newDate = new Date(
            date.getTime() - date.getTimezoneOffset() * 60 * 1000,
          );
          Model.Scroll = true;
          MsgCounter = MsgCounter + 1;
          var date = new Date();
          ReceiveMSg.sMsg = message;
          ReceiveMSg.lReceiverId = receiver;
          ReceiveMSg.lSenderId = sender;
          var newDate = new Date(
            date.getTime() - date.getTimezoneOffset() * 60 * 1000,
          );
          var dt = new Date(newDate);
          ReceiveMSg.dtMsg = dt;
          var XyzIndex = Model.NewChat.findIndex((i: AllChats) => {
            const itemDate = new Date(newDate);
            const iDate = new Date(i.date);
            return (
              itemDate.getUTCFullYear() === iDate.getUTCFullYear() &&
              itemDate.getUTCMonth() === iDate.getUTCMonth() &&
              itemDate.getUTCDate() === iDate.getUTCDate()
            );
          });
          var Xyz = Model.NewChat.find((i: AllChats) => {
            const itemDate = new Date(newDate);
            const iDate = new Date(i.date);
            return (
              itemDate.getUTCFullYear() === iDate.getUTCFullYear() &&
              itemDate.getUTCMonth() === iDate.getUTCMonth() &&
              itemDate.getUTCDate() === iDate.getUTCDate()
            );
          });
          var NewChatArray = new AllChats();
          this.GetAllMsg();
          // if (Xyz) {
          //   // console.log('indexavailable', model.NewChat[XyzIndex]);
          //   Model.NewChat[XyzIndex].Chat.push(ReceiveMSg);
          //   Model.Message = '';
          //   this.UpdateViewModel();
          //   // console.log('newChatsend: ', JSON.stringify(Model.NewChat));
          // } else {
          //   var NewChatArray = new AllChats();
          //   // var date = new Date();
          //   console.log('ElseDate: ', newDate);

          //   if (
          //     newDate.getUTCFullYear() ===
          //       new Date(ReceiveMSg.dtMsg).getUTCFullYear() &&
          //     newDate.getUTCMonth() ===
          //       new Date(ReceiveMSg.dtMsg).getUTCMonth() &&
          //     newDate.getUTCDate() === new Date(ReceiveMSg.dtMsg).getUTCDate()
          //   ) {
          //     NewChatArray.istoday = true;
          //   } else {
          //     NewChatArray.istoday = false;
          //   }
          //   // console.log('ReceiveMSg date', ReceiveMSg.dtMsg);
          //   NewChatArray.date = ReceiveMSg.dtMsg;
          //   // console.log('indexnotavailable', NewChatArray);
          //   // console.log('ReceiveMSgNNNN date', NewChatArray.date);

          //   NewChatArray.Chat.push(ReceiveMSg);
          //   Model.NewChat.push(NewChatArray);
          //   MsgCounter = 0;
          //   // console.log('newChat: ', JSON.stringify(model.NewChat));
          //   Model.Message = '';
          //   this.UpdateViewModel();
          // }
        }
      },
    );
    await Model.Connection.on(
      'ReceiveAttachment',
      async (
        sender: string,
        receiver: string,
        attId: number,
        fileName: string,
      ) => {
        console.log(attId);
        console.log(fileName);
        if (fileName) {
          this.GetAllMsg();
        }
      },
    );
    // this.UserLIve();
  };
  // REceiverLIve = () => {
  //   var Model = this.state.Model;

  //   console.log('IsUserLive: ', Model.receiverId);
  //   // console.log('SingleRConnection: ', Model.Connection);
  //   Model.Connection.start().then(() => {
  //     console.log('SignalR connected');

  //     Model.Connection.invoke('IsUserConnected', Model.receiverId)
  //       .then((isConnected: any) => {
  //         console.log('ConnectionReceiver', isConnected);

  //         if (isConnected) {
  //           console.log(`REceivere - ${Model.receiverId} is live`);
  //         } else {
  //           console.log(`REceivere - ${Model.receiverId} is not live`);
  //         }
  //       })
  //       .catch((error: any) => {
  //         console.log(error);
  //       });
  //   });
  // };
  CheckAppStatus = async () => {
    var Model = this.state.Model;
    const appStateListener = AppState.addEventListener(
      'change',
      nextAppState => {
        // console.log('Next AppState is: ', nextAppState);
        Model.AppStatus = nextAppState;
        this.UpdateViewModel();
        if (nextAppState == 'active') {
          this.IsTalking();
          this.MakeConnection();
        }
        if (nextAppState == 'background') {
          this.IsTalkingFlase();
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
    var date = new Date();
    var newDate = new Date(
      date.getTime() - date.getTimezoneOffset() * 60 * 1000,
    );
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
              itemDate.getUTCFullYear() === iDate.getUTCFullYear() &&
              itemDate.getUTCMonth() === iDate.getUTCMonth() &&
              itemDate.getUTCDate() === iDate.getUTCDate()
            );
          });

          var XyzIndex = Model.NewChat.findIndex((i: AllChats) => {
            // Create new Date objects with only the year, month, and day
            const itemDate = new Date(item.dtMsg);
            const iDate = new Date(i.date);
            // Compare only the date part
            return (
              itemDate.getUTCFullYear() === iDate.getUTCFullYear() &&
              itemDate.getUTCMonth() === iDate.getUTCMonth() &&
              itemDate.getUTCDate() === iDate.getUTCDate()
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
              date.getUTCFullYear() === new Date(item.dtMsg).getUTCFullYear() &&
              date.getUTCMonth() === new Date(item.dtMsg).getUTCMonth() &&
              date.getUTCDate() === new Date(item.dtMsg).getUTCDate()
            ) {
              NewChatArray.istoday = true;
            } else {
              NewChatArray.istoday = false;
            }
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
  UploadFile = async () => {
    var Model = this.state.Model;
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
      });
      console.log('FileRESultResult: ', result[0]);
      Model.selectedFile = result[0];
      Model.Message = result[0].name as string;
      Model.FileName = result[0].name as string;
      Model.AttchId = 1;
      this.UpdateViewModel();
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        console.log('Document picker cancelled');
      } else {
        console.error('Error picking document:', err);
      }
    }
  };
  DownloadFile = async (AttachmentId: number, FileName: string) => {
    console.log('FileName: ', FileName);

    var Model = this.state.Model;
    var value = await SessionHelper.GetSession();
    console.log('SessionValue: ', `ASP.NET_SessionId=${value}`);
    const FileUploadheaders = {
      'Content-Type': 'application/json',
      Cookie: `ASP.NET_SessionId=${value}`,
    };
    const FileUploadData = {
      lId: AttachmentId,
    };
    axios
      .post(`http://${Model.URL}/API/SYS/Sys.aspx/JGetAttch`, FileUploadData, {
        headers: FileUploadheaders,
      })
      .then(res => {
        console.log('ResDownload Data: ', res.data.d.data.mAttch);

        const {config, fs} = RNFetchBlob;
        const cacheDir = fs.dirs.DownloadDir;
        var binaryData = res.data.d.data.mAttch;

        // const filePath = RNFS.ExternalStorageDirectoryPath + FileName;
        const imagePath = `${cacheDir}/${FileName}`;
        RNFS.writeFile(imagePath, binaryData, 'base64')
          .then(() => {
            console.log('Filepath: ', imagePath);
            this.showSnackbar();
            console.log('File written successfully!');
          })
          .catch(err => {
            console.error(err.message);
          });
      })
      .catch(err => {
        console.log('DownloadREsponseErr: ', err);
      });
  };
  ButtonClick = async () => {
    var value = await SessionHelper.GetSession();
    console.log('SessionValue: ', `ASP.NET_SessionId=${value}`);
    const FileUploadheaders = {
      'Content-Type': 'multipart/form-data',
      Cookie: `ASP.NET_SessionId=${value}`,
    };
    var model = this.state.Model;
    model.Scroll = true;
    this.UpdateViewModel();
    MsgCounter = MsgCounter + 1;
    if (model.Message.trim() === '') {
      return;
    } else {
      var date = new Date();
      var newDate = new Date(
        date.getTime() - date.getTimezoneOffset() * 60 * 1000,
      );
      console.log('Msg sent:', model.Message);
      model.InvokeMessage = model.Message;
      this.UpdateViewModel();
      var XyzIndex = model.NewChat.findIndex((i: AllChats) => {
        const itemDate = new Date(newDate);
        const iDate = new Date(i.date);
        return (
          itemDate.getUTCFullYear() === iDate.getUTCFullYear() &&
          itemDate.getUTCMonth() === iDate.getUTCMonth() &&
          itemDate.getUTCDate() === iDate.getUTCDate()
        );
      });
      var Xyz = model.NewChat.find((i: AllChats) => {
        const itemDate = new Date(newDate);
        const iDate = new Date(i.date);
        return (
          itemDate.getUTCFullYear() === iDate.getUTCFullYear() &&
          itemDate.getUTCMonth() === iDate.getUTCMonth() &&
          itemDate.getUTCDate() === iDate.getUTCDate()
        );
      });
      var sendMsg = new Chatss();
      sendMsg.sMsg = model.Message;
      sendMsg.lSenderId = model.senderId;
      var newDate = new Date(
        date.getTime() - date.getTimezoneOffset() * 60 * 1000,
      );
      var dt = new Date(newDate);
      sendMsg.dtMsg = dt;
      sendMsg.lAttchId = model.AttchId;
      var NewChatArray = new AllChats();
      if (Xyz) {
        // console.log('indexavailable', model.NewChat[XyzIndex]);
        model.NewChat[XyzIndex].Chat.push(sendMsg);
        model.Message = '';
        this.UpdateViewModel();
        console.log('newChatsend: ', JSON.stringify(model.NewChat));
      } else {
        var NewChatArray = new AllChats();
        if (
          newDate.getUTCFullYear() ===
            new Date(sendMsg.dtMsg).getUTCFullYear() &&
          newDate.getUTCMonth() === new Date(sendMsg.dtMsg).getUTCMonth() &&
          newDate.getUTCDate() === new Date(sendMsg.dtMsg).getUTCDate()
        ) {
          NewChatArray.istoday = true;
        } else {
          NewChatArray.istoday = false;
        }
        NewChatArray.date = sendMsg.dtMsg;
        NewChatArray.Chat.push(sendMsg);
        model.NewChat.push(NewChatArray);
        MsgCounter = 0;
        model.Message = '';
        this.UpdateViewModel();
      }
      console.log(
        'SendMessage',
        model.companyId,
        model.senderId,
        model.receiverId,
        model.InvokeMessage,
        model.msgflag,
        model.itype,
      );
      if (model.selectedFile) {
        const headers = {
          'Content-Type': 'application/json',
        };

        var FileUploadData = new FormData();
        FileUploadData.append(model.FileName, model.selectedFile);
        // console.log('FileUploadData: ', JSON.stringify(FileUploadData));
        // console.log('FileUploadheaders: ', FileUploadheaders);
        axios
          .post(
            `http://eiplutm.eresourceerp.com/AzaaleaR/Sys/Handler2.ashx`,
            FileUploadData,
            {headers: FileUploadheaders},
          )
          .then(res => {
            console.log('FileUpload1stREsponse: ', res.data);
            var FileUploadRaw = JSON.stringify({
              CompanyId: model.BranchID,
              FromUserId: model.senderId,
              ToUserId: model.receiverId,
              ConnectionId: 'connectionId',
              AttachmentId: res.data.lAttchId,
              FileName: res.data.sFileName,
              Message: '',
            });
            console.log('FileUploadRaw: ', FileUploadRaw);
            console.log(
              'SendMessage',
              model.companyId,
              model.senderId,
              model.receiverId,
              model.InvokeMessage,
              model.msgflag,
              model.itype,
            );

            if (res.data) {
              axios
                .post(
                  `https://wemessanger.azurewebsites.net/api/user/sendfile`,
                  FileUploadRaw,
                  {headers: headers},
                )
                .then((res: any) => {
                  console.log('FileUploadData: ', res.data);
                  model.selectedFile = null;
                  model.AttchId = 0;
                  this.UpdateViewModel();
                })
                .catch((Err: any) => {
                  console.log('FlieUploadErr: ', Err);
                });
            }
          })
          .catch(err => {
            console.log('FlieUploadErr: ', err);
          });
      } else {
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
      this.MarkRead();
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
      // console.log('SignalR connected');
      Connection.invoke('DisconnectUser', Model.senderId)
        .then((res: any) => {
          // console.log('resDisconnect: ', res);
        })
        .catch((err: any) => {
          // console.log('ErrorDisconnect: ', err);
        });
    });
  };
  handleScroll = (event: any) => {
    var Model = this.state.Model;

    const {layoutMeasurement, contentOffset, contentSize} = event.nativeEvent;
    const paddingToBottom = 20;

    // Check if the current scroll position is less than the previous one
    if (contentOffset.y < Model.prevScrollY) {
      Model.PageNumber = Model.PageNumber + 1;
      Model.Scroll = false;
      this.UpdateViewModel();
      // this.loadMoreData();
      // console.log('PageNo:', Model.PageNumber);

      axios
        .get(
          `https://wemessanger.azurewebsites.net/api/User/readmessage?companyId=${Model.companyId}&senderId=${Model.senderId}&receiverId=${Model.receiverId}&pageNo=${Model.PageNumber}`,
        )
        .then((res: any) => {
          // console.log('AllChat: ', res.data);
          var ReverseData = res.data.reverse();
          // console.log('ReverseData', ReverseData.length);
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
                itemDate.getUTCFullYear() === iDate.getUTCFullYear() &&
                itemDate.getUTCMonth() === iDate.getUTCMonth() &&
                itemDate.getUTCDate() === iDate.getUTCDate()
              );
            });

            var XyzIndex = Model.NewChat.findIndex((i: AllChats) => {
              // Create new Date objects with only the year, month, and day
              const itemDate = new Date(item.dtMsg);
              const iDate = new Date(i.date);
              // Compare only the date part
              return (
                itemDate.getUTCFullYear() === iDate.getUTCFullYear() &&
                itemDate.getUTCMonth() === iDate.getUTCMonth() &&
                itemDate.getUTCDate() === iDate.getUTCDate()
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
                date.getUTCFullYear() ===
                  new Date(item.dtMsg).getUTCFullYear() &&
                date.getUTCMonth() === new Date(item.dtMsg).getUTCMonth() &&
                date.getUTCDate() === new Date(item.dtMsg).getUTCDate()
              ) {
                NewChatArray.istoday = true;
              } else {
                NewChatArray.istoday = false;
              }
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
  Approve = async (text: string) => {
    var value = await SessionHelper.GetSession();
    const headers = {
      'Content-Type': 'application/json',
      Cookie: `ASP.NET_SessionId=${value}`,
    };
    var Model = this.state.Model;
    console.log('Approve: ', text);
    axios
      .get(`http://${Model.URL}/${text}`, {headers: headers})
      .then(res => {
        console.log(res.data);
        Alert.alert(JSON.stringify(res.data));
      })
      .catch(err => {
        console.log(err);
        Alert.alert(JSON.stringify(err));
      });
  };
  render() {
    // const { url } = this.state;
    const prefix = 'https://';
    var Model = this.state.Model;

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
              style={{height: 30, width: 23.5, marginRight: 10}}
            />
          </TouchableOpacity>
          <TouchableOpacity
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
                // marginTop: 10,
              }}>
              <Text
                style={{
                  color: 'white',
                  fontSize: 22,
                  fontFamily: 'OpenSans_Condensed-Bold',
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
                return (
                  <View style={{zIndex: 1}}>
                    {item.istoday ? (
                      <Text style={styles.today}>Today</Text>
                    ) : (
                      <Text style={styles.today}>
                        {moment.utc(item.date).format('DD-MM-YYYY')}
                        {/* {`${item?.date.slice(8, 10)}-${item?.date.slice(5,7)}-${item?.date.slice(0, 4)}`} */}
                      </Text>
                    )}
                    {/* {pdate ? (
                      <Text style={styles.today}>{showdate}</Text>
                    ) : null} */}

                    {item.Chat.map((i: Chatss) => {
                      var MsgSplit = i.sMsg.split('||');
                      return `${Model.ConnectionCode}_${i.lSenderId}` ==
                        Model.senderId || i.lSenderId == Model.senderId ? (
                        <>
                          <View style={styles.messageto}>
                            <View style={styles.messagetomessage}>
                              <View style={styles.messagetotext}>
                                {i.lAttchId == 0 ? (
                                  MsgSplit.length == 2 ? (
                                    <>
                                      <View
                                        style={{flexDirection: 'row', gap: 5}}>
                                        <Button
                                          onPress={() =>
                                            this.Approve(MsgSplit[0])
                                          }
                                          style={styles.buttontest}>
                                          <Text
                                            style={{
                                              color: 'white',
                                              // fontWeight: '800',
                                              fontFamily: 'Poppins-Regular',
                                              fontSize: 12,
                                              margin: 0,
                                            }}>
                                            Approve
                                          </Text>
                                        </Button>
                                        <Button
                                          onPress={() =>
                                            this.Approve(MsgSplit[1])
                                          }
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
                                  )
                                ) : (
                                  <View style={styles.messagetotextcontent}>
                                    <TouchableOpacity
                                      onPress={() =>
                                        this.DownloadFile(i?.lAttchId, i?.sMsg)
                                      }>
                                      <Image
                                        source={require('../../assets/download.png')}
                                        style={{
                                          height: 20,
                                          width: 19.5,
                                          marginRight: 10,
                                        }}
                                      />
                                    </TouchableOpacity>
                                    <Text style={{color: '#C66E12'}}>
                                      {i?.sMsg}
                                    </Text>
                                  </View>
                                )}
                              </View>
                            </View>
                            <View style={styles.messagetotime}>
                              <Text style={styles.messagefromtimetext}>
                                {moment.utc(i.dtMsg).format('HH:mm')}
                                {/* {i.dtMsg.toString()} */}
                              </Text>
                              {/* <Text>{item?.istoday}</Text> */}
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
                                {i.lAttchId == 0 ? (
                                  <Text style={styles.messagefromtextcontent}>
                                    {i?.sMsg}
                                  </Text>
                                ) : (
                                  <View style={styles.messagefromtextcontent}>
                                    <Text>{i?.sMsg}</Text>
                                    <TouchableOpacity
                                      onPress={() =>
                                        this.DownloadFile(i?.lAttchId, i?.sMsg)
                                      }>
                                      <Image
                                        source={require('../../assets/download.png')}
                                        style={{
                                          height: 20,
                                          width: 19.5,
                                          marginLeft: 10,
                                        }}
                                      />
                                    </TouchableOpacity>
                                  </View>
                                )}
                              </View>
                            </View>
                            <View style={styles.messagefromtime}>
                              <Text style={styles.messagefromtimetext}>
                                {moment.utc(i.dtMsg).format('HH:mm')}
                                {/* {i?.dtMsg} */}
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
                // paddingHorizontal: 10,
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
                }}
                style={
                  (styles.input,
                  {
                    width: Dimensions.get('window').width - 100,
                    fontFamily: 'OpenSans-Regular',
                  })
                }
                placeholder="Write your message here"></TextInput>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingRight: 10,
                }}>
                <TouchableOpacity onPress={this.UploadFile}>
                  <Image
                    source={require('../../assets/attachment.png')}
                    style={{height: 25, width: 13, marginHorizontal: 10}}
                  />
                </TouchableOpacity>
                <TouchableOpacity onPress={this.ButtonClick}>
                  <Image
                    source={require('../../assets/send.png')}
                    style={{height: 25, width: 25}}
                  />
                </TouchableOpacity>
              </View>
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

    flexDirection: 'row',
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
    // lineHeight: 30,
    fontFamily: 'OpenSans-VariableFont_wdth,wght',
    // zIndex: 1,
    flexDirection: 'row',
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

    paddingHorizontal: 10,
    paddingVertical: 0,
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

    paddingHorizontal: 10,
    paddingVertical: 0,

    // width: '95%',
  },
});
