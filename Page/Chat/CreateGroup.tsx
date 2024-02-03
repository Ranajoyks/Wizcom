import React, {Component} from 'react';
import {ActivityIndicator, Dimensions, StyleSheet, Text, TextInput, View} from 'react-native';

import {
    Badge,
  Body,
  Container,
  Content,
  Left,
  List,
  ListItem,
  Right,
  Root,
  Thumbnail,
} from 'native-base';
import alluser from '../../Entity/alluser';
import BaseComponent from '../../Core/BaseComponent';
import BaseState from '../../Core/BaseState';
import {TouchableOpacity} from 'react-native-gesture-handler';
import { Image } from 'react-native';
import SessionHelper from '../../Core/SessionHelper';
import DeviceInfo from 'react-native-device-info';
import signalR from '@microsoft/signalr';
import axios from 'axios';

// const navigation = useNavigation();
export class CreateGroupViewModel {
    index: number = 0;
    FilterUser: alluser[] = [];
    SingleRConnection: any;
    ConnectionCode: any;
    OnlineUserLength: number = 0;
    alluser: alluser[] = [];
    SenderID: string = '';
}

export default class CreateGroup extends BaseComponent<any, CreateGroupViewModel> {
  constructor(props: any) {
    super(props);
    this.state = new BaseState(new CreateGroupViewModel());
  }
  async componentDidMount() {
    var Model = this.state.Model;
  
    // console.log('Appstate: ', AppState.currentState);
    // const deviceId = DeviceInfo.getDeviceId();
    // Model.DeviceId = deviceId;
    // this.UpdateViewModel();
    // console.log('deviceId: ', deviceId);
    var User = await SessionHelper.GetUserDetailsSession();
    var FCMToken = await SessionHelper.GetFCMTokenSession();
    var ConnectionCode = await SessionHelper.GetCompanyIDSession();
    var BranchName = await SessionHelper.GetBranchNameSession();
    var UserName = await SessionHelper.GetUserNameSession();
    var BranchID = await SessionHelper.GetBranchIdSession();
    var ReceicerId = await SessionHelper.GetReceiverIDSession();
   // this.UserList()
    // if (ReceicerId) {
    //   Model.ReceiverID = ReceicerId;
    // }
    // Model.BranchID = BranchID;
    // Model.UserName = UserName;
    // Model.BranchName = BranchName;
     Model.ConnectionCode = ConnectionCode;
    // Model.FCMToken = FCMToken;
    // this.GetLocation();
    // BackgroundTimer.setInterval(() => {
    //   this.GetLocation();
    // }, 60000);
    this.UpdateViewModel();
    this.FetchAllUser();
  
    // console.log('User: ', User);
    // console.log('User: ', Model.UserName);
    setInterval(this.UserList, 2000);
    // setInterval(this.CheckAppStatus, 2000);
    // console.log('Next AppState', Model.AppStatus);
    // Geolocation.getCurrentPosition(info => console.log("info:", info));
  }
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
  UserList = async () => {
    console.log("hii")
    var model = this.state.Model;
    var UserDetails = await SessionHelper.GetUserDetailsSession();
    var myId = `${model.ConnectionCode}_${UserDetails.lId}`;
    console.log(myId);
    var UserList = model.SingleRConnection.invoke('GetAllUser', myId, 0)
      .then((user: any) => {
        console.log(UserList);
         console.log('GetallUser: ', user);
        model.alluser = user;
        var UserOnline = user.filter((i: alluser) => i.isUserLive == true);
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
        console.log('Error to invoke: ', err);
      });
  };
  NextPage = () => {
    // console.log('Button Pressed!');
    this.props.navigation.navigate({
      name: 'Groupchatdetails',
    });
    // navigation.navigate('Chatdetails');
  };
  render() {
    var model = this.state.Model;
     console.log('prop', model.FilterUser);
    // const { navigation } = this.props;
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
            <Text style={styles.title}>Create Group</Text>
            </View>
            </View>
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
             //   value={Model.Message}
                onChangeText={text => {
                //   Model.Message = text;
                  this.UpdateViewModel();
                }}
               
                style={
                  (styles.input,
                  {
                    width: Dimensions.get('window').width - 100,
                    fontFamily: 'OpenSans-Regular',
                  })
                }
                placeholder="Enter group name"></TextInput>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  //paddingRight: 5,
                }}>
               <Text style={{fontSize:16,fontWeight:'bold'}}>Create</Text>
                {/* <TouchableOpacity onPress={this.ButtonClick}> */}
                  {/* <Image
                    source={require('../../assets/send.png')}
                    style={{height: 25, width: 25}}

                  /> */}
                {/* </TouchableOpacity> */}
              </View>
            </View>
            </View>
            <Content>
                <List>
                  {model.FilterUser.length <= 0 && (
                    <ActivityIndicator size="large" color="#0000ff" />
                  )}

                  {model.FilterUser.length > 0 &&
                    model.FilterUser.map((i: alluser, index) => (
                    //   <TouchableOpacity onPress={() => this.NextPage(i)}>
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
                    //   </TouchableOpacity>
                    ))}
                </List>
              </Content>
            
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
    title: {
        lineHeight: 20,
        fontSize: 18,
        // fontWeight: '700',
        fontFamily: 'Poppins-SemiBold',
        color: 'black', // Darker blue title
      },
      input: {
        alignSelf: 'center',
        backgroundColor: '#F1F1F1',
        borderColor: '#F1F1F1',
        paddingHorizontal: 5,
        fontFamily: 'OpenSans-Regular',
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