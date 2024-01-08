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
import {Button} from 'native-base';
import BaseComponent from '../../Core/BaseComponent';
import BaseState from '../../Core/BaseState';
import * as signalR from '@microsoft/signalr';
import SessionHelper from '../../Core/SessionHelper';
import axios from 'axios';
import {Chat} from '../../Entity/Chat';
import EntityHelperService from '../Service/EntityHelperService';
// import {HubConnectionBuilder} from '';
export class ChatdetailsViewModel {
  Message: string = '';
  senderId: number = 0;
  receiverId: string = '';
  companyId?: number = 18;
  Connection: any;
  Chats: Chat[] = [];
  User: any;
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
  lSenderId: number = 0;
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
    this.state.Model.senderId = props.route.params.SenderID;
  }
  componentDidMount(): void {
    var Model = this.state.Model;
    Model.receiverId = Model.User.lId.toString();
    this.MakeConnection();
    this.GetAllMsg();
    this.ReceiveMsg();
  }
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
          var date = new Date()
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
          // ReceiveMSg.dtMsg = new Date().toString()
          await Model.Chats.push(ReceiveMSg);
          console.log('REceiveMSG: ', ReceiveMSg.sMsg);

          this.UpdateViewModel();
        }
      },
    );
  };
  GetAllMsg = async () => {
    var Model = this.state.Model;
    axios
      .get(
        `https://wemessanger.azurewebsites.net/api/User/readmessage?companyId=${Model.companyId}&senderId=${Model.senderId}&receiverId=${Model.receiverId}`,
      )
      .then(res => {
        Model.Chats = res.data;
        this.UpdateViewModel();
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
      )
        .then(() => {
          var date = new Date();
          // const modifiedDate = new Date(date.getTime() - 19800000);
          console.log('Msg sent:', model.Message);
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

          //sendMsg.dtMsg = new Date().toString();
          console.log('SendDate', sendMsg.dtMsg);
          console.log('Send MSg: ', sendMsg);
          if (model.Message.trim() === '') {
            return;
          } else {
            model.Chats.push(sendMsg);
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
  render() {
    // const { url } = this.state;
    const prefix = 'https://';
    var Model = this.state.Model;
    // console.log('Chats:', Model.Chats);

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
            <Text style={styles.title}>{Model.User.userFullName}</Text>
            {/* <Text style={(styles.subtitle, styles.online)}>Online</Text> */}

            {/* <Text style={(styles.subtitle, styles.offline)}>Offline</Text> */}
          </View>

          <TouchableOpacity
            onPress={() => {
              /* Right icon action */
            }}>
            <Image
              source={require('../../assets/settings.png')}
              style={{height: 30, width: 30, marginRight: 10}}
            />
            <Icon name="bell" size={24} style={styles.icon} />
          </TouchableOpacity>
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
            <View>
              <Text style={styles.today}>Today</Text>
            </View>
            {Model.Chats.map((i: Chat) =>
              i.lSenderId === Model.senderId ? (
                <View style={styles.messageto}>
                  <View style={styles.messagetomessage}>
                    <View style={styles.messagetotext}>
                      <Text style={styles.messagetotextcontent}>{i?.sMsg}</Text>
                    </View>
                  </View>
                  <View style={styles.messagetotime}>
                    <Text style={styles.messagetotimetext}>
                      {/* {new Date(
                        new Date(i.dtMsg).getTime() + 19800000,
                      ).toLocaleTimeString()} */}
                      {EntityHelperService.convertUTCDateToLocalDate(
                        new Date(i?.dtMsg),
                      )}
                    </Text>
                  </View>
                </View>
              ) : (
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
                        A
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
              ),
            )}

            {/* <View style={styles.messagefrom}>
              <View style={styles.messagefrommessage}>
                <View style={styles.messagefromicon}>
                  <Text
                    style={{
                      color: '#000',
                      flex: 1,
                      fontSize: 15,
                      textAlign: 'center',
                    }}>
                    BS
                  </Text>
                </View>
                <View style={styles.messagefromtext}>
                  <Text style={styles.messagefromtextcontent}>Hi there!</Text>
                </View>
              </View>
              <View style={styles.messagefromtime}>
                <Text style={styles.messagefromtimetext}>10.45 AM</Text>
              </View>
            </View> */}

            {/* <View style={styles.messageto}>
              <View style={styles.messagetomessage}>
                <View style={styles.messagetotext}>
                  <Text style={styles.messagetotextcontent}>Hi there!</Text>
                </View>
              </View>
              <View style={styles.messagetotime}>
                <Text style={styles.messagetotimetext}>10.45 AM</Text>
              </View>
            </View>

            <View>
              <Text style={styles.unread}>Unread</Text>
            </View>

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
                    BS
                  </Text>
                </View>
                <View style={styles.messagefromtext}>
                  <Text style={styles.messagefromtextcontent}>Hi there!</Text>
                </View>
              </View>
              <View style={styles.messagefromtime}>
                <Text style={styles.messagefromtimetext}>10.45 AM</Text>
              </View>
            </View>

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
                    BS
                  </Text>
                </View>
                <View style={styles.messagefromtext}>
                  <Text style={styles.messagefromtextcontent}>
                    Hi there, are you available around 4PM today for meeting
                    with a new client?
                  </Text>
                </View>
              </View>
              <View style={styles.messagefromtime}>
                <Text style={styles.messagefromtimetext}>10.45 AM</Text>
              </View>
            </View> */}
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
  messagefromtext: {paddingLeft: 10, paddingRight: 30},
  messagefromtextcontent: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: '#E9E9E9',
    borderRadius: 5,
    fontSize: 15,
    color: '#000',
    lineHeight: 25,
  },
  messagefromtime: {
    flexDirections: 'row-reverse',
    paddingRight: 30,
    paddingVertical: 5,
  },
  messagefromtimetext: {flexShrink: 1, textAlign: 'right'},
  messageto: {
    flexDirection: 'column',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  messagetomessage: {flexDirection: 'row-reverse'},
  messagetotext: {paddingLeft: 10, paddingRight: 0},
  messagetotextcontent: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: '#fef0e1',
    borderRadius: 5,
    fontSize: 15,
    color: '#C66E12',
    lineHeight: 25,
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
