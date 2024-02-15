import React, { Component } from 'react';

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
import axios from 'axios';
import moment from 'moment';

import * as RNFS from 'react-native-fs';
import RNFetchBlob from 'rn-fetch-blob';
import * as signalR from '@microsoft/signalr';
import DocumentPicker from 'react-native-document-picker';
import { ActivityIndicator } from 'react-native';
import { GroupChat } from '../../../Entity/GroupChat';

import BaseComponent from '../../../Core/BaseComponent';
import BaseState from '../../../Core/BaseState';
import SessionHelper from '../../../Core/SessionHelper';
import { ShowPageLoader, ShowToastMessage } from '../../../Redux/Store';
import { SignalRHubConnection } from '../../../DataAccess/SignalRHubConnection';
import { UserProfileScreen } from '../../../Control/MHeader';
import SignalRApi from '../../../DataAccess/SignalRApi';
import { GroupDetails } from '../../../Entity/GroupDetails';
import ChatUserOptions from '../../../Redux/Reducer/ChatUserOptions';
import { useAppDispatch, useAppSelector } from '../../../Redux/Hooks';
import AppDBHelper from '../../../Core/AppDBHelper';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../../Root/AppStack';
import { NavigationProps } from '../../../Core/BaseProps';
import { useNavigation } from '@react-navigation/native';

const GroupChatPage = () => {
  const navigate = useNavigation<NavigationProps>();

  console.log('GroupDetails: ', Group);
  const chatRef = React.createRef<any>();
  const [UserInfo, setUserInfo] = useState<User>();
  const [SenderChatId, setSenderChatId] = useState<string>();
  const [BrnachId, setBranchId] = useState<number>();
  const [CompnanyId, setCompnanyId] = useState<string>();
  const [PageNumber, setPageNumber] = useState<number>(0);
  const [GroupDetailss, setGroupDetailss] = useState<GroupDetails>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [ShowSilentLoader, setShowSilentLoader] = useState<boolean>(false);
  const chatUserOptions = useAppSelector(i => i.ChatUserOptions);
  const dispatch = useAppDispatch();
  useEffect(() => {
    (async function () {
      await Initilize();
    })();

    // IniTilizeOnce();
    // CheckAppStatus();
    // IsTalking();
    // MarkRead();
  }, []);

  const Initilize = async () => {
    var chatId = await SessionHelper.GetChatId();
    var CompanyId = await SessionHelper.GetCompanyID();
    var Branch = await SessionHelper.GetBranch();
    var UserInfo = await SessionHelper.GetUserDetails();
    var ReceiverId = await SessionHelper.GetReceiverID();
    var GroupDetails = await SessionHelper.GetGroupDetailUpdateSession();
    console.log('GroupDetails: ', GroupDetails);
    Model.UserDetails = UserInfo;
    Model.ConnectionCode = ConnectionCode;
    Model.BranchID = Branch?.lId;
    Model.FCMToken = FCMToken;
    this.UpdateViewModel();
    this.MakeSignalRConnection();
    await this.GroupDetails();
    this.GetAllGroupMsg();
    console.log('Groupname: ', this.props.route);
    setInterval(this.AgainCallGroupdetails, 3000);
  }

  MakeSignalRConnection = async () => {
    var Model = this.state.Model;
    var UserDetails = await SessionHelper.GetUserDetails();
    var myId = `${Model.ConnectionCode}_${UserDetails?.lId}`;
    console.log('GroupId: ', Model.GroupID);
    console.log('GroupId: ', Model.GroupName);

  }







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
    var UserDetails = await SessionHelper.GetUserDetails();
    Model.SenderID = UserDetails?.lId;
    this.UpdateViewModel();
    var myId = `${Model.ConnectionCode}_${UserDetails?.lId}`;
    axios
      .get(
        `http://${Model.Url}/api/User/readgroupmessage?companyId=${Model.BranchID}&userId=${myId}&groupId=${Model.GroupID}&page=${Model.PageNo}`,
      )
      .then(res => {
        console.log('GroupMsgData:', res.data);
        if (res.data) {
          Model.GroupChats = res.data;


        }
      })
      .catch((err: any) => {
        console.log('GrpupmsgErr: ', err);
      });
  };
  SendGroupMsg = async () => {


    var SendMSgOption = JSON.stringify({
      companyId: Model.BranchID,
      fromUserId: myId,
      userName: Model.UserDetails?.userFullName,
      message: Model.GroupChat,
      groupName: Model.GroupName + '_' + Model.GroupID,
    });
    console.log('SendMsg: ', SendMSgOption);
    if (Model.GroupChat.trim() === '') {
      return;
    } else {
      var date = new Date();
      var newDate = new Date(
        date.getTime() - date.getTimezoneOffset() * 60 * 1000,
      );
      console.log('Msg sent:', Model.GroupChat);
      // Model.InvokeMessage = Model.GroupChat;
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
      GroupSendMsg.sMsg = Model.GroupChat;
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
        Model.GroupChat = '';
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
        Model.GroupChat = '';
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
            { headers: FileUploadheaders },
          )
          .then(res => {
            console.log('FileUpload1stREsponse: ', res.data);
            var FileUploadRaw = JSON.stringify({
              companyId: Model.BranchID,
              fromUserId: myId,
              userName: Model.UserDetails?.userFullName,
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
                  { headers: headers },
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
    var value = await SessionHelper.GetSessionId();
    const headers = {
      'Content-Type': 'application/json',
      Cookie: `ASP.NET_SessionId=${value}`,
    };
    var Model = this.state.Model;
    console.log('Approve: ', text);
    axios
      .get(`http://${Model.Url}/${text}`, { headers: headers })
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
      Model.GroupChat = result[0].name as string;
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
    var value = await SessionHelper.GetSessionId();
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
        // console.log('ResDownload Data: ', res.data.d.data.mAttch);

        const { config, fs } = RNFetchBlob;
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
    var UserDetails = await SessionHelper.GetUserDetails();
    var myId = `${Model.ConnectionCode}_${UserDetails?.lId}`;
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
          routes: [{ name: 'MainPage' }],
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
              this.props.navigation.navigate('MainPage');
            }}>
            <Image
              source={require('../../../assets/backimg.png')}
              style={{ height: 30, width: 30, marginLeft: 10 }}
            />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
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
                {Model.UserDetails?.userFullName.toLocaleUpperCase().charAt(0)}
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
                      {Model.UserDetails?.userFullName}
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
                            GroupID: Model.GroupID,
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
                            GroupID: Model.GroupID,
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
      )}
      </View>
    );
    const AllGroupMsg = async (chatId: string, BranchId: number) => {
      setShowSilentLoader(ShowSilentLoader == true && true)
      setShowSilentLoader(true);
      var tempIndexNo = currentIndex;
      var GroupChat = await SignalRApi.GetAllGroupMsg(
        chatId!,
        BranchId!,
        Group.groupId,
        PageNumber!,
      ).then(res => {
        var messageWithAttach = res.data?.filter(i => i.lAttchId)
        console.log("messageWithAttach", messageWithAttach?.length)
        if (res.data) {

          console.log(res.data.find(i => (i.lSrId = 1298)));
          setCurrentIndex(tempIndexNo);
          dispatch(
            ChatUserOptions.actions.LoadGroupChatList({
              messageList: res.data,
              GroupId: Group.groupId
            }),
          );

          AppDBHelper.SetGroups(chatUserOptions.AllGroups, Group.groupId.toString()!)
        }
        setShowSilentLoader(false);
      })
      console.log('GroupChat: ', GroupChat)
    };
    const GroupDetails = async (chatId: string) => {
      var GroupsDetails = await SignalRApi.GetGroupDetails(
        chatId!,
        Group.groupId,
      );
      setGroupDetailss(GroupsDetails.data as unknown as GroupDetails);
      console.log('GroupDetailsss: ', JSON.stringify(GroupsDetails));
    };
    var MessageList = chatUserOptions.AllGroups.find(
      i => i.groupId == Group.groupId,
    )?.AllGroupMsgList;
    return (


  }
}

