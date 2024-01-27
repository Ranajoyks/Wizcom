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
  SafeAreaView,
  ScrollView,
  Alert,
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
  Button,
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
import moment from 'moment';
import {Chat} from '../../Entity/Chat';

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
const OneToOneChatDetails = (props: any) => {
  const [Message, setMessage] = useState('');
  const [URL, setURL] = useState('eiplutm.eresourceerp.com/AzaaleaR');
  const [InvokeMessage, setInvokeMessage] = useState('');
  const [SenderId, setSenderId] = useState('');
  const [receiverId, setreceiverId] = useState('');
  const [Sender, setSender] = useState<User>();
  const [receiver, setreceiver] = useState<User>();
  const [companyId, setcompanyId] = useState();
  const [itype, setitype] = useState(0);
  const [PageNumber, setPageNumber] = useState(0);
  const [msgflag, setmsgflag] = useState('U');
  const [SignalRConnection, setSignalRConnection] = useState<any>();
  const [ConnectionCode, setConnectionCode] = useState();
  const [IsOpen, setIsOpen] = useState(false);
  const [appVersion, setAppVersion] = useState('1.0.0');
  const [AllChat, setAllChat] = useState<Chat[]>([]);
  const [NewChat, setNewChat] = useState<AllChats[]>([]);
  const [Scroll, setScroll] = useState(true);
  const [AppStatus, setAppStatus] = useState(AppState.currentState);

  const navigation = useNavigation<any>();
  useEffect(() => {
    setreceiver(props.route.params.User);
    MakeSingnalRConnection();
    IniTilizeOnce();
    CheckAppStatus();
    IsTalking();
    MarkRead();
  }, []);
  const MakeSingnalRConnection = async () => {
    IsTalking();
    var Connection = new signalR.HubConnectionBuilder()
      .withUrl(
        `https://wemessanger.azurewebsites.net/chatHub?UserId=${SenderId}`,
      )
      .build();
    await setSignalRConnection(Connection);
    Connection.start()
      .then(() => {
        console.log('SignalR connected');
        Connection.invoke('JoinChat', SenderId);
      })
      .catch((err: any) => {
        Connection.start();
        console.error('SignalR connection error:', err);
      });
    ReceiveMsg(Connection);
  };
  const IniTilizeOnce = async () => {
    var FCMToken = await SessionHelper.GetFCMTokenSession();
    var ConnectionCode = await SessionHelper.GetCompanyIDSession();
    var BranchID = await SessionHelper.GetBranchIdSession();
    var UserDetails = await SessionHelper.GetUserDetailsSession();
    console.log('UserDetails: ', UserDetails);
    var BranchID = BranchID;
    var SenderID = `${ConnectionCode}_${UserDetails.lId}`;
    var ReceiverID = `${ConnectionCode}_${props.route.params.User.lId}`;
    await setcompanyId(BranchID);
    await setSender(UserDetails);
    await setSenderId(`${ConnectionCode}_${UserDetails.lId}`);
    await setreceiverId(`${ConnectionCode}_${props.route.params.User.lId}`);
    await setConnectionCode(ConnectionCode);
    await GetAllMsg(BranchID, SenderID, ReceiverID);
  };
  const ReceiveMsg = async (Connection: any) => {
    Connection.on(
      'ReceiveMessage',
      async (sender: any, receiver: any, message: any) => {
        var ReceiveMSg = new Chatss();
        if (message) {
          var date = new Date();
          var newDate = new Date(
            date.getTime() - date.getTimezoneOffset() * 60 * 1000,
          );
          setScroll(true);
          var date = new Date();
          ReceiveMSg.sMsg = message;
          ReceiveMSg.lReceiverId = receiver;
          ReceiveMSg.lSenderId = sender;
          var newDate = new Date(
            date.getTime() - date.getTimezoneOffset() * 60 * 1000,
          );
          console.log('getTime: ', newDate);
          var dt = new Date(newDate);
          ReceiveMSg.dtMsg = dt;
          //   var XyzIndex = Model.NewChat.findIndex((i: AllChats) => {
          //     const itemDate = new Date(newDate);
          //     const iDate = new Date(i.date);
          //     return (
          //       itemDate.getUTCFullYear() === iDate.getUTCFullYear() &&
          //       itemDate.getUTCMonth() === iDate.getUTCMonth() &&
          //       itemDate.getUTCDate() === iDate.getUTCDate()
          //     );
          //   });
          //   var Xyz = Model.NewChat.find((i: AllChats) => {
          //     const itemDate = new Date(newDate);
          //     const iDate = new Date(i.date);
          //     return (
          //       itemDate.getUTCFullYear() === iDate.getUTCFullYear() &&
          //       itemDate.getUTCMonth() === iDate.getUTCMonth() &&
          //       itemDate.getUTCDate() === iDate.getUTCDate()
          //     );
          //   });
          console.log(' ReceiveMSg ', ReceiveMSg);
          AllChat.push(ReceiveMSg);
          var NewChatArray = new AllChats();
          //   this.GetAllMsg();
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
    MarkRead();
  };
  const GetAllMsg = async (
    BranchID: string,
    SenderID: string,
    ReceiverID: string,
  ) => {
    var date = new Date();
    var newDate = new Date(
      date.getTime() - date.getTimezoneOffset() * 60 * 1000,
    );
    axios
      .get(
        `https://wemessanger.azurewebsites.net/api/User/readmessage?companyId=${BranchID}&senderId=${SenderID}&receiverId=${ReceiverID}&pageNo=${PageNumber}`,
      )
      .then(async (res: any) => {
        await setAllChat(res.data);
        // res.data.forEach((item: Chat) => {
        //   var Xyz = NewChat.find((i: AllChats) => {
        //     const itemDate = new Date(item.dtMsg);
        //     const iDate = new Date(i.date);
        //     return (
        //       itemDate.getUTCFullYear() === iDate.getUTCFullYear() &&
        //       itemDate.getUTCMonth() === iDate.getUTCMonth() &&
        //       itemDate.getUTCDate() === iDate.getUTCDate()
        //     );
        //   });
        //   var XyzIndex = NewChat.findIndex((i: AllChats) => {
        //     const itemDate = new Date(item.dtMsg);
        //     const iDate = new Date(i.date);
        //     return (
        //       itemDate.getUTCFullYear() === iDate.getUTCFullYear() &&
        //       itemDate.getUTCMonth() === iDate.getUTCMonth() &&
        //       itemDate.getUTCDate() === iDate.getUTCDate()
        //     );
        //   });
        //   const itemDate = new Date(item.dtMsg);
        //   if (Xyz) {
        //     NewChat[XyzIndex].Chat.push(item);
        //   } else {
        //     var NewChatArray = new AllChats();
        //     var date = new Date();
        //     if (
        //       date.getUTCFullYear() === new Date(item.dtMsg).getUTCFullYear() &&
        //       date.getUTCMonth() === new Date(item.dtMsg).getUTCMonth() &&
        //       date.getUTCDate() === new Date(item.dtMsg).getUTCDate()
        //     ) {
        //       NewChatArray.istoday = true;
        //     } else {
        //       NewChatArray.istoday = false;
        //     }
        //     console.log('new date', item.dtMsg);
        //     NewChatArray.date = item.dtMsg.toString();
        //     NewChatArray.Chat.push(item);
        //     NewChat.push(NewChatArray);
        //   }
        // });
        // //     // Model.Chats = res.data;
        // //     // this.UpdateViewModel();
        // //     // console.log('MOdelNewChat: ', JSON.stringify(Model.NewChat));
      })
      .catch((err: any) => {
        console.log(err);
      });
  };
  const LocationPage = () => {
    navigation.navigate('MapPage');
  };
  const DropDownOpen = async () => {
    setIsOpen(!IsOpen);
  };
  const SendMsg = async () => {
    setScroll(true);
    // if (model.SignalRConnected) {
    if (Message.trim() === '') {
      return;
    } else {
      var date = new Date();
      var newDate = new Date(
        date.getTime() - date.getTimezoneOffset() * 60 * 1000,
      );
      await setInvokeMessage(Message);
      //   var XyzIndex = model.NewChat.findIndex((i: AllChats) => {
      //     const itemDate = new Date(newDate);
      //     const iDate = new Date(i.date);
      //     return (
      //       itemDate.getUTCFullYear() === iDate.getUTCFullYear() &&
      //       itemDate.getUTCMonth() === iDate.getUTCMonth() &&
      //       itemDate.getUTCDate() === iDate.getUTCDate()
      //     );
      //   });
      //   var Xyz = model.NewChat.find((i: AllChats) => {
      //     const itemDate = new Date(newDate);
      //     const iDate = new Date(i.date);
      //     console.log('xyzindexitemDate', itemDate);
      //     console.log('xyzindexiDate', iDate);
      //     return (
      //       itemDate.getUTCFullYear() === iDate.getUTCFullYear() &&
      //       itemDate.getUTCMonth() === iDate.getUTCMonth() &&
      //       itemDate.getUTCDate() === iDate.getUTCDate()
      //     );
      //   });
      // console.log('index', XyzIndex);
      // console.log('xyzindex', Xyz);
      var sendMsg = new Chatss();
      sendMsg.sMsg = Message;
      sendMsg.lSenderId = SenderId;
      var newDate = new Date(
        date.getTime() - date.getTimezoneOffset() * 60 * 1000,
      );
      console.log('getTime: ', newDate);
      var dt = new Date(newDate);
      sendMsg.dtMsg = dt;
      console.log('SendMSg: ', sendMsg);

      var NewChatArray = new AllChats();
      //   if (Xyz) {
      //     console.log('indexavailable', model.NewChat[XyzIndex]);
      //     model.NewChat[XyzIndex].Chat.push(sendMsg);
      //     model.Message = '';
      //     this.UpdateViewModel();
      //     console.log('newChatsend: ', JSON.stringify(model.NewChat));
      //   } else {
      //     var NewChatArray = new AllChats();
      //     // var date = new Date();
      //     console.log('ElseDate: ', newDate);

      //     if (
      //       newDate.getUTCFullYear() ===
      //         new Date(sendMsg.dtMsg).getUTCFullYear() &&
      //       newDate.getUTCMonth() === new Date(sendMsg.dtMsg).getUTCMonth() &&
      //       newDate.getUTCDate() === new Date(sendMsg.dtMsg).getUTCDate()
      //     ) {
      //       NewChatArray.istoday = true;
      //     } else {
      //       NewChatArray.istoday = false;
      //     }
      //     // console.log('sendMsg date', sendMsg.dtMsg);
      //     NewChatArray.date = sendMsg.dtMsg;
      //     // console.log('indexnotavailable', NewChatArray);
      //     // console.log('sendMsgNNNN date', NewChatArray.date);

      //     NewChatArray.Chat.push(sendMsg);
      //     model.NewChat.push(NewChatArray);
      //     // console.log('newChat: ', JSON.stringify(model.NewChat));
      //     model.Message = '';
      //   }
      console.log(
        'SendMessage',
        companyId,
        SenderId,
        receiverId,
        Message,
        msgflag,
        itype,
      );

      await SignalRConnection.invoke(
        'SendMessage',
        companyId,
        SenderId,
        receiverId,
        Message,
        msgflag,
        itype,
      )
        .then(() => {
          console.log('ok');
          setMessage('');
        })
        .catch((error: any) => {
          console.log('errorsssss');
          console.error('Error invoking SendMessage:', error);
        });
      MarkRead();
    }
  };
  const Approve = async (text: string) => {
    var value = await SessionHelper.GetSession();
    const headers = {
      'Content-Type': 'application/json',
      Cookie: `ASP.NET_SessionId=${value}`,
    };
    console.log('Approve: ', text);
    axios
      .get(`http://${URL}/${text}`, {headers: headers})
      .then(res => {
        console.log(res.data);
        Alert.alert(JSON.stringify(res.data));
      })
      .catch(err => {
        console.log(err);
        Alert.alert(JSON.stringify(err));
      });
  };
  const CheckAppStatus = async () => {
    const appStateListener = AppState.addEventListener(
      'change',
      nextAppState => {
        console.log('Next AppState is: ', nextAppState);
        setAppStatus(nextAppState);
        if (nextAppState == 'active') {
          console.log('hi');
          IsTalking();
          MakeSingnalRConnection();
        }
        if (nextAppState == 'background') {
          IsTalkingFlase();
          var Connection = new signalR.HubConnectionBuilder()
            .withUrl(
              `https://wemessanger.azurewebsites.net/chatHub?UserId=${SenderId}`,
            )
            .build();
          Connection.start().then(() => {
            console.log('SignalR connected');
            Connection.invoke('DisconnectUser', SenderId)
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
  const MarkRead = () => {
    const headers = {
      'Content-Type': 'application/json',
    };
    var Data = JSON.stringify({
      companyid: companyId,
      senderId: SenderId,
      receiverId: receiverId,
    });
    console.log('Markread: ', Data);

    axios
      .put(`https://wemessanger.azurewebsites.net/api/user`, Data, {headers})
      .then((res: any) => {
        console.log('ReadMSg: ', res.data);
      })
      .catch((err: any) => {
        console.log('ReadMSgERror: ', err);
      });
  };
  const IsTalking = () => {
    const headers = {
      'Content-Type': 'application/json',
    };
    var TalkingData = JSON.stringify({
      FromUserId: SenderId,
      ToUserId: receiverId,
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
  const IsTalkingFlase = () => {
    const headers = {
      'Content-Type': 'application/json',
    };
    var TalkingData = JSON.stringify({
      FromUserId: SenderId,
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
  return (
    <View style={MainStyle.container}>
      <View style={MainStyle.OTOheader}>
        <TouchableOpacity
          onPress={() => {
            navigation.reset({
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
          <Text style={styles.title}>{receiver?.userFullName}</Text>
          {receiver?.isUserLive ? (
            <Text style={styles.subtitle1}>Online</Text>
          ) : (
            <Text style={styles.subtitle2}>Offline</Text>
          )}
        </View>
        <TouchableOpacity onPress={LocationPage}>
          <Image
            source={require('../../assets/location.png')}
            style={{height: 30, width: 30, marginRight: 10}}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={DropDownOpen}>
          <Badge style={MainStyle.BadgeStyle}>
            <Text style={MainStyle.BadgeTextStyle}>
              {Sender?.userName.toLocaleUpperCase().charAt(0)}
            </Text>
          </Badge>
        </TouchableOpacity>
      </View>
      <SafeAreaView style={styles.body}>
        {IsOpen && (
          <View style={MainStyle.dropdownContainer}>
            <View style={MainStyle.dropdown}>
              <View>
                <View style={{}}>
                  <Text style={MainStyle.UseLabel}>User:</Text>
                  <Text style={MainStyle.UserInfo}>{Sender?.userName}</Text>
                </View>
                <View style={MainStyle.divider}></View>
                <View style={{}}>
                  <Text style={MainStyle.UseLabel}>Designation:</Text>
                </View>
                <View style={MainStyle.divider}></View>
                <View style={{}}>
                  <Text style={MainStyle.UseLabel}>Connection Code:</Text>
                  <Text style={MainStyle.UserInfo}>{ConnectionCode}</Text>
                </View>
                <View style={MainStyle.divider}></View>

                <View style={{}}>
                  <Text style={MainStyle.UseLabel}>Version:</Text>
                  <Text style={MainStyle.UserInfo}>{appVersion}</Text>
                </View>
                <View style={MainStyle.divider}></View>

                <TouchableOpacity>
                  <Text style={MainStyle.UseLabel}>Logout</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
        <ScrollView
          //   onScroll={handleScroll}
          scrollEventThrottle={16}
          style={styles.scrollView}
          contentContainerStyle={{
            // flexGrow: 1,
            justifyContent: 'flex-end',
            flexDirection: 'column',
          }}
          //   ref="scrollView"
        >
          {/* onContentSizeChange={(width, height) => {
          console.log('Height: ', height);

          const yOffset = (Model.DataLength - 1) * 70;
          Model.Scroll == true
            ? this.refs.scrollView.scrollTo({y: height})
            : this.refs.scrollView.scrollTo({y: yOffset});
        }}> */}
          {/* {Model.NoMoreData && (
          <View>
            <Text style={{alignSelf: 'center'}}>No More Conversation</Text>
          </View>
        )} */}
          {/* {Model.SignalRConnected === false && (
            <ActivityIndicator size="large" color="#0000ff" />
          )} */}

          {/* {Model.SignalRConnected === true && */}
          {/* {AllChat.map((item: Chat) => {
            return (
              <View style={{zIndex: 1}}>
                {item.istoday ? (
                  <Text style={styles.today}>Today</Text>
                ) : (
                  <Text style={styles.today}>
                    {moment.utc(item.date).format('DD-MM-YYYY')}
                  </Text>
                )} */}
          {AllChat.map((i: Chatss) => {
            var MsgSplit = i.sMsg.split('||');
            return `${ConnectionCode}_${i.lSenderId}` == SenderId ||
              i.lSenderId == Sender?.lId ? (
              <>
                <View style={styles.messageto}>
                  <View style={styles.messagetomessage}>
                    <View style={styles.messagetotext}>
                      {MsgSplit.length == 2 ? (
                        <>
                          <View style={{flexDirection: 'row', gap: 5}}>
                            <Button
                              onPress={() => Approve(MsgSplit[0])}
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
                              onPress={() => Approve(MsgSplit[1])}
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
                      {moment.utc(i.dtMsg).format('HH:mm')}
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
                        {receiver?.userFullName.toLocaleUpperCase().charAt(0)}
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
                      {moment.utc(i.dtMsg).format('HH:mm')}
                    </Text>
                  </View>
                </View>
              </>
            );
          })}
          {/* </View>
            );
          })} */}
        </ScrollView>
        <View style={{padding: 10}}>
          <View style={MainStyle.SendInputView}>
            <TextInput
              value={Message}
              onChangeText={text => {
                setMessage(text);
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
              onPress={SendMsg}
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
};
export default OneToOneChatDetails;
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
