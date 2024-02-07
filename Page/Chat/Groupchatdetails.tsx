import React, {Component} from 'react';

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
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import BaseComponent from '../../Core/BaseComponent';
import BaseState from '../../Core/BaseState';
import SessionHelper from '../../Core/SessionHelper';
import axios from 'axios';
import {GroupChat} from '../../Entity/GroupChat';
import moment from 'moment';
import {Badge, Button} from 'native-base';
import * as RNFS from 'react-native-fs';
import RNFetchBlob from 'rn-fetch-blob';
import Snackbar from 'react-native-snackbar';
import * as signalR from '@microsoft/signalr';
import {GroupDetails} from '../../Entity/GroupDetails';
import DocumentPicker from 'react-native-document-picker';
import {ActivityIndicator} from 'react-native';
const memberStyles = [
  {backgroundColor: 'red'}, // Style for index 0
  {backgroundColor: 'blue'}, // Style for index 1
  {backgroundColor: 'green'}, // Style for index 2
  {backgroundColor: 'yellow'}, // Style for index 3
  // Add more styles for additional indices as needed
];
export class GroupchatdetailsViewModel {
  GroupName: string = '';
  GroupID: string = '';
  Url: string = 'wemessanger.azurewebsites.net';
  URL: string = 'eiplutm.eresourceerp.com/AzaaleaR';
  ConnectionCode: string = '';
  BranchID: string = '';
  FCMToken: string = '';
  BranchName: string = '';
  UserName: string = '';
  ReceiverId: string = '';
  PageNo: number = 0;
  GroupChats: GroupChat[] = [];
  NewChat: AllGroupChats[] = [];
  SenderID: any;
  GroupMsg: string = '';
  AttchId: number = 0;
  selectedFile: any;
  FileName: string = '';
  SenderDetails: any;
  IsOpen: boolean = false;
  AppVersion: string = '1.0.0';
  GroupMembers: any[] = [];
  SingleRConnection: any;
  Groupdetais!: GroupDetails;
  isAdmin: boolean = false;
}
export class AllGroupChats {
  date: any = new Date();
  Chat: GroupChatss[] = [];
  istoday: boolean = false;
}
export class GroupChatss {
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
  userName: string = '';
}

export default class Groupchatdetails extends BaseComponent<
  any,
  GroupchatdetailsViewModel
> {
  constructor(props: any) {
    super(props);
    this.state = new BaseState(new GroupchatdetailsViewModel());
    this.state.Model.GroupName = props.route.params?.GroupName;
    this.state.Model.GroupID = props.route.params?.GroupID;
    this.state.Model.GroupName = props.route?.GroupName;
    this.state.Model.GroupID = props.route?.GroupID;
  }
  async componentDidMount() {
    var Model = this.state.Model;
    console.log('GroupName: ', Model.GroupName);
    var ConnectionCode = await SessionHelper.GetCompanyIDSession();
    var FCMToken = await SessionHelper.GetFCMTokenSession();
    var BranchName = await SessionHelper.GetBranchNameSession();
    var UserName = await SessionHelper.GetUserNameSession();
    var BranchID = await SessionHelper.GetBranchIdSession();
    var ReceiverId = await SessionHelper.GetReceiverIDSession();
    var UserDetails = await SessionHelper.GetUserDetailsSession();
    console.log('SenderDetails: ', UserDetails);
    Model.SenderDetails = UserDetails;
    Model.ConnectionCode = ConnectionCode;
    Model.BranchID = BranchID;
    Model.FCMToken = FCMToken;
    Model.BranchName = BranchName;
    Model.UserName = UserName;
    Model.ReceiverId = ReceiverId;
    this.UpdateViewModel();
    this.GroupDetails();
    this.GetAllGroupMsg();
    this.MakeSignalRConnection();
    console.log('Groupname: ', this.props.route);
    // console.log("GroupId: ", Model.GroupID);
  }
  MakeSignalRConnection = async () => {
    var Model = this.state.Model;
    var UserDetails = await SessionHelper.GetUserDetailsSession();
    var myId = `${Model.ConnectionCode}_${UserDetails.lId}`;
    console.log('GroupId: ', Model.GroupID);
    console.log('GroupId: ', Model.GroupName);

    Model.SingleRConnection = new signalR.HubConnectionBuilder()
      .withUrl(
        `https://wemessanger.azurewebsites.net/chatHub?UserId=${
          Model.ConnectionCode
        }_${UserDetails.lId.toString()}`,
      )
      .build();
    this.UpdateViewModel();
    Model.SingleRConnection.start()
      .then(async () => {
        console.log('SignalR connected');
        await Model.SingleRConnection.invoke(
          'JoinChat',
          `${Model.GroupName}_${Model.GroupID}`,
        );
      })
      .catch((err: any) => {
        Model.SingleRConnection.start();
        console.error('SignalR connection error:', err);
      });
    await Model.SingleRConnection.on(
      'ReceiveGroupMessage',
      async (
        fromUserId: any,
        userName: any,
        groupName: any,
        AttachmentID: any,
        message: any,
      ) => {
        console.log(
          'receiveMsg: ',
          fromUserId,
          message,
          AttachmentID,
          groupName,
        );
        var ReceiveMSg = new GroupChatss();
        if (message && fromUserId !== myId) {
          var date = new Date();
          var newDate = new Date(
            date.getTime() - date.getTimezoneOffset() * 60 * 1000,
          );
          var date = new Date();
          ReceiveMSg.sMsg = message;
          ReceiveMSg.userName = userName;
          var newDate = new Date(
            date.getTime() - date.getTimezoneOffset() * 60 * 1000,
          );
          var dt = new Date(newDate);
          ReceiveMSg.dtMsg = dt;
          ReceiveMSg.lAttchId = AttachmentID;
          var XyzIndex = Model.NewChat.findIndex((i: AllGroupChats) => {
            const itemDate = new Date(newDate);
            const iDate = new Date(i.date);
            return (
              itemDate.getUTCFullYear() === iDate.getUTCFullYear() &&
              itemDate.getUTCMonth() === iDate.getUTCMonth() &&
              itemDate.getUTCDate() === iDate.getUTCDate()
            );
          });
          var Xyz = Model.NewChat.find((i: AllGroupChats) => {
            const itemDate = new Date(newDate);
            const iDate = new Date(i.date);
            return (
              itemDate.getUTCFullYear() === iDate.getUTCFullYear() &&
              itemDate.getUTCMonth() === iDate.getUTCMonth() &&
              itemDate.getUTCDate() === iDate.getUTCDate()
            );
          });
          var NewChatArray = new AllGroupChats();
          // this.GetAllMsg();
          if (Xyz) {
            // console.log('indexavailable', model.NewChat[XyzIndex]);
            Model.NewChat[XyzIndex].Chat.push(ReceiveMSg);
            Model.GroupMsg = '';
            this.UpdateViewModel();
            // console.log('newChatsend: ', JSON.stringify(Model.NewChat));
          } else {
            var NewChatArray = new AllGroupChats();
            // var date = new Date();
            console.log('ElseDate: ', newDate);

            if (
              newDate.getUTCFullYear() ===
                new Date(ReceiveMSg.dtMsg).getUTCFullYear() &&
              newDate.getUTCMonth() ===
                new Date(ReceiveMSg.dtMsg).getUTCMonth() &&
              newDate.getUTCDate() === new Date(ReceiveMSg.dtMsg).getUTCDate()
            ) {
              NewChatArray.istoday = true;
            } else {
              NewChatArray.istoday = false;
            }
            // console.log('ReceiveMSg date', ReceiveMSg.dtMsg);
            NewChatArray.date = ReceiveMSg.dtMsg;
            // console.log('indexnotavailable', NewChatArray);
            // console.log('ReceiveMSgNNNN date', NewChatArray.date);

            NewChatArray.Chat.push(ReceiveMSg);
            Model.NewChat.push(NewChatArray);
            // console.log('newChat: ', JSON.stringify(model.NewChat));
            Model.GroupMsg = '';
            this.UpdateViewModel();
          }
        }
      },
    );
  };
  // ReceiveGroupMsg = async () => {
  //   console.log('Hi');
  //   var Model = this.state.Model;
  //   await Model.SingleRConnection.on(
  //     'ReceiveGroupMessage',
  //     async (fromUserId: any,
  //       userName: any,
  //       groupName: any,
  //       AttachmentID:any,
  //       message: any,) => {
  //       console.log('receiveMsg: ', message);
  //       if(message){
  //         this.GetAllGroupMsg()
  //       }
  //     },
  //   );
  // };
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
  GroupDetails = async () => {
    var Model = this.state.Model;
    var UserDetails = await SessionHelper.GetUserDetailsSession();
    var myId = `${Model.ConnectionCode}_${UserDetails.lId}`;
    axios
      .get(
        `http://${Model.Url}/api/user/groupdetail?userId=${myId}&groupId=${Model.GroupID}`,
      )
      .then(res => {
        // console.log('GroupDetailsResponse: ', res.data);
        Model.Groupdetais = res.data;
        this.UpdateViewModel();
        console.log('GroupDetailsResponse: ', Model.Groupdetais);
        Model.Groupdetais?.members.forEach(i => {
          if (i.memberId == UserDetails.lId && i.isOwner == true) {
            Model.isAdmin = true;
          }
        });
      })
      .catch((err: any) => {
        console.log('GroupDetailsError: ', err);
      });
  };
  Snackbar = () => {
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
  GetAllGroupMsg = async () => {
    var Model = this.state.Model;
    var UserDetails = await SessionHelper.GetUserDetailsSession();
    Model.SenderID = UserDetails.lId;
    this.UpdateViewModel();
    var myId = `${Model.ConnectionCode}_${UserDetails.lId}`;
    axios
      .get(
        `http://${Model.Url}/api/User/readgroupmessage?companyId=${Model.BranchID}&userId=${myId}&groupId=${Model.GroupID}&page=${Model.PageNo}`,
      )
      .then(res => {
        console.log('GroupMsgData:', res.data);
        if (res.data) {
          Model.GroupChats = res.data;
          this.UpdateViewModel();
          Model.GroupChats.forEach((item: GroupChat) => {
            var Xyz = Model.NewChat.find((i: AllGroupChats) => {
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
            var XyzIndex = Model.NewChat.findIndex((i: AllGroupChats) => {
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
              var NewChatArray = new AllGroupChats();
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
              NewChatArray.Chat.push(item);
              Model.NewChat.push(NewChatArray);
            }
            this.UpdateViewModel();
          });
        }
      })
      .catch((err: any) => {
        console.log('GrpupmsgErr: ', err);
      });
  };
  SendGroupMsg = async () => {
    var Model = this.state.Model;
    var UserDetails = await SessionHelper.GetUserDetailsSession();
    var myId = `${Model.ConnectionCode}_${UserDetails.lId}`;
    var value = await SessionHelper.GetSession();
    console.log('SessionValue: ', `ASP.NET_SessionId=${value}`);
    var Headers = {
      'Content-Type': 'application/json',
    };
    const FileUploadheaders = {
      'Content-Type': 'multipart/form-data',
      Cookie: `ASP.NET_SessionId=${value}`,
    };

    var SendMSgOption = JSON.stringify({
      companyId: Model.BranchID,
      fromUserId: myId,
      userName: Model.SenderDetails?.userFullName,
      message: Model.GroupMsg,
      groupName: Model.GroupName + '_' + Model.GroupID,
    });
    console.log('SendMsg: ', SendMSgOption);
    if (Model.GroupMsg.trim() === '') {
      return;
    } else {
      var date = new Date();
      var newDate = new Date(
        date.getTime() - date.getTimezoneOffset() * 60 * 1000,
      );
      console.log('Msg sent:', Model.GroupMsg);
      // Model.InvokeMessage = Model.GroupMsg;
      this.UpdateViewModel();
      var XyzIndex = Model.NewChat.findIndex((i: AllGroupChats) => {
        const itemDate = new Date(newDate);
        const iDate = new Date(i.date);
        return (
          itemDate.getUTCFullYear() === iDate.getUTCFullYear() &&
          itemDate.getUTCMonth() === iDate.getUTCMonth() &&
          itemDate.getUTCDate() === iDate.getUTCDate()
        );
      });
      var Xyz = Model.NewChat.find((i: AllGroupChats) => {
        const itemDate = new Date(newDate);
        const iDate = new Date(i.date);
        return (
          itemDate.getUTCFullYear() === iDate.getUTCFullYear() &&
          itemDate.getUTCMonth() === iDate.getUTCMonth() &&
          itemDate.getUTCDate() === iDate.getUTCDate()
        );
      });
      console.log('Xyz:_____', Xyz);
      console.log('XyzIndex:_____', XyzIndex);

      var GroupSendMsg = new GroupChatss();
      GroupSendMsg.sMsg = Model.GroupMsg;
      GroupSendMsg.lSenderId = Model.SenderID;
      var newDate = new Date(
        date.getTime() - date.getTimezoneOffset() * 60 * 1000,
      );
      var dt = new Date(newDate);
      GroupSendMsg.dtMsg = dt;
      GroupSendMsg.lAttchId = Model.AttchId;
      console.log('GroupSendMsg:', GroupSendMsg);

      var NewChatArray = new AllGroupChats();
      if (Xyz) {
        console.log('indexavailable', Model.NewChat[XyzIndex]);
        Model.NewChat[XyzIndex].Chat.push(GroupSendMsg);
        Model.GroupMsg = '';
        this.UpdateViewModel();
        console.log('newChatsend: ', JSON.stringify(Model.NewChat));
      } else {
        var NewChatArray = new AllGroupChats();
        if (
          newDate.getUTCFullYear() ===
            new Date(GroupSendMsg.dtMsg).getUTCFullYear() &&
          newDate.getUTCMonth() ===
            new Date(GroupSendMsg.dtMsg).getUTCMonth() &&
          newDate.getUTCDate() === new Date(GroupSendMsg.dtMsg).getUTCDate()
        ) {
          NewChatArray.istoday = true;
        } else {
          NewChatArray.istoday = false;
        }
        NewChatArray.date = GroupSendMsg.dtMsg;
        NewChatArray.Chat.push(GroupSendMsg);
        Model.NewChat.push(NewChatArray);
        Model.GroupMsg = '';
        this.UpdateViewModel();
      }
      if (Model.selectedFile) {
        const headers = {
          'Content-Type': 'application/json',
        };

        var FileUploadData = new FormData();
        FileUploadData.append(Model.FileName, Model.selectedFile);
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
              companyId: Model.BranchID,
              fromUserId: myId,
              userName: Model.SenderDetails?.userFullName,
              AttachmentId: res.data.lAttchId,
              message: res.data.sFileName,
              groupName: Model.GroupName + '_' + Model.GroupID,
            });
            console.log('FileUploadRaw: ', FileUploadRaw);

            if (res.data) {
              axios
                .post(
                  `https://wemessanger.azurewebsites.net/api/user/sendgroupmessage`,
                  FileUploadRaw,
                  {headers: headers},
                )
                .then((res: any) => {
                  console.log('FileUploadData: ', res.data);
                  Model.selectedFile = null;
                  Model.AttchId = 0;
                  this.UpdateViewModel();
                })
                .catch((Err: any) => {
                  console.log('FlieUploadErr: ', Err);
                });
            }
          })
          .catch(err => {
            console.log('FileUpload1stError: ', err);
          });
      } else {
        axios
          .post(
            `https://${Model.Url}/api/user/sendgroupmessage`,
            SendMSgOption,
            {
              headers: Headers,
            },
          )
          .then(res => {
            console.log('SendMsgRes: ', res.data);
          })
          .catch((err: any) => {
            console.log('SendMsgErr: ', err);
            Alert.alert(err);
          });
      }
    }
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
      .get(`http://${Model.Url}/${text}`, {headers: headers})
      .then(res => {
        console.log(res.data);
        Alert.alert(JSON.stringify(res.data));
      })
      .catch(err => {
        console.log(err);
        Alert.alert(JSON.stringify(err));
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
      Model.GroupMsg = result[0].name as string;
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
  DropDownOpen = async () => {
    var Model = this.state.Model;
    Model.IsOpen = !Model.IsOpen;
    this.UpdateViewModel();
  };
  DeleteGroup = async () => {
    var Model = this.state.Model;
    console.log('MOdel.GroupId: ', Model.GroupID);
    var UserDetails = await SessionHelper.GetUserDetailsSession();
    var myId = `${Model.ConnectionCode}_${UserDetails.lId}`;
    axios
      .get(
        `http://${Model.Url}/api/user/deletegroup?userId=${myId}&groupId=${Model.GroupID}`,
      )
      .then(res => {
        console.log('DeleteResponse: ', res.data);
        if (!res.data) {
          return;
        }
        this.props.navigation.reset({
          routes: [{name: 'Singlechatpage'}],
        });
      })
      .catch((err: any) => {
        console.log('DeleteResponseError: ', err);
      });
  };

  render() {
    var Model = this.state.Model;
    // console.log('model,newChat: ', JSON.stringify(Model.NewChat));

    // const { url } = this.state;
    const prefix = 'https://';
    return (
      <View style={styles.container}>
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
            <Text style={styles.title}>Group Chat</Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              this.DropDownOpen();
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
                {Model.SenderDetails?.userFullName
                  .toLocaleUpperCase()
                  .charAt(0)}
              </Text>
            </Badge>
          </TouchableOpacity>
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
                        alignSelf: 'flex-start',
                        fontSize: 12,
                      }}>
                      User:
                    </Text>
                    <Text
                      style={{
                        paddingLeft: 20,
                        color: 'black',
                        alignSelf: 'flex-start',
                        fontSize: 12,
                        fontFamily: 'OpenSans-SemiBold',
                      }}>
                      {Model.UserName}
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
                        alignSelf: 'flex-start',
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
                        alignSelf: 'flex-start',
                        fontSize: 12,
                      }}>
                      Connection Code:
                    </Text>
                    <Text
                      style={{
                        paddingLeft: 20,
                        color: 'black',
                        alignSelf: 'flex-start',
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
                        alignSelf: 'flex-start',
                        fontSize: 12,
                      }}>
                      Version:
                    </Text>
                    <Text
                      style={{
                        paddingLeft: 20,
                        color: 'black',
                        alignSelf: 'flex-start',
                        fontSize: 12,
                        fontFamily: 'OpenSans-SemiBold',
                      }}>
                      {Model.AppVersion}
                    </Text>
                  </View>
                  {Model.isAdmin ? (
                    <>
                      <View style={styles.divider}></View>
                      <TouchableOpacity
                        onPress={() =>
                          this.props.navigation.navigate('CreateGroup', {
                            GroupId: Model.GroupID,
                          })
                        }>
                        <Text
                          style={{
                            fontFamily: 'OpenSans-SemiBold',
                            marginTop: 15,
                            paddingLeft: 20,
                            color: '#0383FA',
                            alignSelf: 'flex-start',
                            fontSize: 12,
                          }}>
                          Add Member
                        </Text>
                      </TouchableOpacity>
                      <View style={styles.divider}></View>
                      <TouchableOpacity
                        onPress={() =>
                          this.props.navigation.navigate('DeleteGroupMember', {
                            GroupId: Model.GroupID,
                          })
                        }>
                        <Text
                          style={{
                            fontFamily: 'OpenSans-SemiBold',
                            marginTop: 15,
                            paddingLeft: 20,
                            color: '#0383FA',
                            alignSelf: 'flex-start',
                            fontSize: 12,
                          }}>
                          Remove Member
                        </Text>
                      </TouchableOpacity>
                      <View style={styles.divider}></View>
                      <TouchableOpacity onPress={() => this.DeleteGroup()}>
                        <Text
                          style={{
                            fontFamily: 'OpenSans-SemiBold',
                            marginTop: 15,
                            paddingLeft: 20,
                            color: '#0383FA',
                            alignSelf: 'flex-start',
                            fontSize: 12,
                            marginBottom: 15,
                          }}>
                          Delete Group
                        </Text>
                      </TouchableOpacity>
                    </>
                  ) : null}
                </View>
              </View>
            </View>
          )}
        </View>
        {Model.NewChat.length<=0 && (
          <ActivityIndicator size="large" color="#0000ff" />
        )}
        {Model.NewChat.length>0 && (
          <>
            <View style={styles.groupcontainer}>
              <View>
                <View style={styles.groupheader}>
                  <Text style={styles.headerText}>{Model.GroupName}</Text>
                </View>
                <View style={styles.memberCount}>
                  <Text style={styles.memberCountText}>
                    {Model.Groupdetais?.members.length} Members
                  </Text>
                </View>
              </View>
              <View style={styles.avatarContainer}>
                {/* Top Layer */}
                <View style={styles.topLayer}>
                  <Badge
                    style={{
                      backgroundColor: '#404040',
                      width: 35,
                      height: 35,
                      borderRadius: 50,
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
                      {Model.Groupdetais?.members[0]?.fullName
                        .toLocaleUpperCase()
                        .charAt(0)}
                    </Text>
                  </Badge>
                </View>
                {Model.Groupdetais?.members[1] ? (
                  <View style={styles.bottomLayer}>
                    <Badge
                      style={{
                        backgroundColor: '#404040',
                        width: 35,
                        height: 35,
                        borderRadius: 50,
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
                        {Model.Groupdetais?.members[1]?.fullName
                          .toLocaleUpperCase()
                          .charAt(0)}
                      </Text>
                    </Badge>
                  </View>
                ) : null}
                {Model.Groupdetais?.members[2] ? (
                  <View style={styles.bottomLayer2}>
                    <Badge
                      style={{
                        backgroundColor: '#404040',
                        width: 35,
                        height: 35,
                        borderRadius: 50,
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
                        {Model.Groupdetais?.members[2]?.fullName
                          .toLocaleUpperCase()
                          .charAt(0)}
                      </Text>
                    </Badge>
                  </View>
                ) : null}
                {Model.Groupdetais?.members.length > 3 ? (
                  <View style={styles.bottomLayer3}>
                    <Badge
                      style={{
                        backgroundColor: '#404040',
                        width: 35,
                        height: 35,
                        borderRadius: 50,
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
                        +{Model.Groupdetais?.members.length - 3}
                      </Text>
                    </Badge>
                  </View>
                ) : null}
                {/* <View style={styles.bottomLayer}>
      <Image
        source={{
          uri: 'https://filmfare.wwmindia.com/content/2020/nov/hrithik-roshan-411605007858.jpg',
        }}
        style={styles.avatar3}
      />
    </View> */}
              </View>
            </View>
            <SafeAreaView style={styles.body}>
              <ScrollView
                style={styles.scrollView}
                contentContainerStyle={{
                  flexGrow: 1,
                  justifyContent: 'flex-end',
                  flexDirection: 'column',
                }}
                ref="scrollView"
                onContentSizeChange={(width, height) =>
                  this.refs.scrollView.scrollTo({y: height})
                }>
                {Model.NewChat.map((item: AllGroupChats) => (
                  <>
                    <View>
                      {item.istoday ? (
                        <Text style={styles.today}>Today</Text>
                      ) : (
                        <Text style={styles.today}>
                          {moment.utc(item.date).format('DD-MM-YYYY')}
                          {/* {`${item?.date.slice(8, 10)}-${item?.date.slice(5,7)}-${item?.date.slice(0, 4)}`} */}
                        </Text>
                      )}
                    </View>
                    {item.Chat.map((i: GroupChatss) => {
                      var MsgSplit = i.sMsg.split('||');
                      return `${Model.ConnectionCode}_${i.lSenderId}` ==
                        Model.SenderID || i.lSenderId == Model.SenderID ? (
                        <>
                          <View style={styles.messageto} key={i?.lSrId}>
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
                              <View style={styles.messagefromtext}>
                                {i.lAttchId == 0 ? (
                                  <View style={{flexDirection: 'row'}}>
                                    <Badge
                                      style={{
                                        backgroundColor: '#404040',
                                        width: 20,
                                        height: 20,
                                        borderRadius: 50,
                                        alignItems: 'center',
                                        display: 'flex',
                                        marginHorizontal: 5,
                                      }}>
                                      <Text
                                        style={{
                                          color: 'white',
                                          fontSize: 12,
                                          fontFamily: 'OpenSans_Condensed-Bold',
                                        }}>
                                        {i?.userName
                                          .toLocaleUpperCase()
                                          .charAt(0)}
                                      </Text>
                                    </Badge>
                                    <View style={styles.messagefromtextcontent}>
                                      <Text
                                        style={{
                                          color: 'green',
                                          fontSize: 12,
                                          fontFamily:
                                            'OpenSans-VariableFont_wdth,wght',
                                        }}>
                                        {i?.userName}
                                      </Text>
                                      <Text
                                        style={
                                          styles.messagefromtextcontenttext
                                        }>
                                        {' '}
                                        {i?.sMsg}
                                      </Text>
                                    </View>
                                  </View>
                                ) : (
                                  <View style={{flexDirection: 'row'}}>
                                    <Badge
                                      style={{
                                        backgroundColor: '#404040',
                                        width: 20,
                                        height: 20,
                                        borderRadius: 50,
                                        alignItems: 'center',
                                        display: 'flex',
                                        marginHorizontal: 5,
                                      }}>
                                      <Text
                                        style={{
                                          color: 'white',
                                          fontSize: 12,
                                          fontFamily: 'OpenSans_Condensed-Bold',
                                        }}>
                                        {i?.userName
                                          .toLocaleUpperCase()
                                          .charAt(0)}
                                      </Text>
                                    </Badge>
                                    <View style={styles.messagefromtextcontent}>
                                      <Text
                                        style={{
                                          color: 'green',
                                          fontSize: 12,
                                          fontFamily:
                                            'OpenSans-VariableFont_wdth,wght',
                                        }}>
                                        {i?.userName}
                                      </Text>
                                      <View style={{flexDirection: 'row'}}>
                                        <Text
                                          style={
                                            styles.messagefromtextcontenttext
                                          }>
                                          {i?.sMsg}
                                        </Text>
                                        <TouchableOpacity
                                          onPress={() =>
                                            this.DownloadFile(
                                              i?.lAttchId,
                                              i?.sMsg,
                                            )
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
                                    </View>
                                  </View>
                                )}
                              </View>
                            </View>
                            <View style={styles.messagefromtime}>
                              <Text style={styles.messagefromtimetext}>
                                {moment.utc(i.dtMsg).format('HH:mm')}
                                {/* {i?.dtMsg} */}
                              </Text>
                            </View>
                          </View>
                        </>
                      );
                    })}
                  </>
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
                    value={Model.GroupMsg}
                    onChangeText={text => {
                      Model.GroupMsg = text;
                      this.UpdateViewModel();
                    }}
                    style={
                      (styles.input,
                      {width: Dimensions.get('window').width - 100})
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
                    <TouchableOpacity onPress={this.SendGroupMsg}>
                      <Image
                        source={require('../../assets/send.png')}
                        style={{height: 25, width: 25}}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </SafeAreaView>
          </>
        )}
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
    zIndex: 999,
  },
  icon: {
    color: '#fff', // White icons
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
  scrollView: {},
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
    // flexWrap: 'wrap'
  },
  messagefromtextcontenttext: {
    fontSize: 15,
    color: '#000',
    lineHeight: 25,
    fontFamily: 'OpenSans-VariableFont_wdth,wght',
    // flexWrap: 'wrap'
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
    paddingVertical: 10,
  },
  messagetomessage: {flexDirection: 'row-reverse'},
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

  groupcontainer: {
    //  padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    flexDirection: 'row',

    height: 60,
    marginLeft: '5%',
    borderBottomWidth: 1,
    borderColor: '#d9eeff',
    // justifyContent:'space-between'
    // Adjust layout properties as needed (e.g., flexDirection, alignItems)
  },

  groupheader: {
    // marginBottom: 15,
  },

  headerText: {
    fontSize: 17,
    fontWeight: '700',
    color: 'black',
    // fontWeight: '200',
    fontFamily: 'Poppins-Regular',
    // fontSize: 12,
  },

  memberCount: {
    marginBottom: 10,
  },

  memberCountText: {
    fontSize: 14,
    color: '#888',
  },

  avatarContainer: {
    flexDirection: 'row',
    //marginRight:100
    width: 40,
    marginLeft: '30%', // Adjust layout properties as needed
  },

  topLayer: {
    position: 'absolute',
    top: 10,
    left: 5,
    flexDirection: 'row',
    // zIndex: 3,
  },

  // middleLayer: {
  //   position: 'absolute',
  //  // zIndex: 2,
  // },

  bottomLayer: {
    position: 'absolute',
    top: 10,
    left: 25,
    flexDirection: 'row',
    //   zIndex: 1,
  },
  bottomLayer2: {
    position: 'absolute',
    top: 10,
    left: 45,
    flexDirection: 'row',
    //   zIndex: 1,
  },
  bottomLayer3: {
    position: 'absolute',
    top: 10,
    left: 65,
    flexDirection: 'row',
    //   zIndex: 1,
  },

  topAvatar: {
    width: 45,
    height: 45,
    borderRadius: 30,
    right: 40,
    // top: 10, // Adjust vertical positioning
    // left: 20, // Adjust horizontal positioning
  },

  middleAvatar: {
    width: 45, // Adjust size for overlap
    height: 45,
    borderRadius: 30,
    left: 20,
    right: 40,
    // marginHorizontal: 5, // Adjust spacing
  },

  avatar: {
    width: 45,
    height: 45,
    borderRadius: 20,
    right: 60,
    //  left: 40,
  },
  avatar2: {
    width: 45,
    height: 45,
    borderRadius: 30,
    // left: 20,
    right: 80,
  },
  avatar3: {
    width: 45,
    height: 45,
    borderRadius: 30,
    // left: 20,
    right: 100,
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
});
