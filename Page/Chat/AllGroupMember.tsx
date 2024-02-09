import React, {Component} from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  Badge,
  Body,
  CheckBox,
  Container,
  Content,
  Left,
  List,
  ListItem,
  Right,
  Root,
  Thumbnail,
} from 'native-base';
import BaseComponent from '../../Core/BaseComponent';
import BaseState from '../../Core/BaseState';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {Image} from 'react-native';
import SessionHelper from '../../Core/SessionHelper';
import DeviceInfo from 'react-native-device-info';
import * as signalR from '@microsoft/signalr';
import axios from 'axios';
import User from '../../Entity/User';
import {GroupDetails} from '../../Entity/GroupDetails';

// const navigation = useNavigation();
export class AllGroupMemberViewModel {
  GroupName: string = '';
  index: number = 0;
  FilterUser: User[] = [];
  SingleRConnection: any;
  ConnectionCode: any;
  OnlineUserLength: number = 0;
  alluser: User[] = [];
  SenderID: string = '';
  GroupMembers: any[] = [];
  BranchName: string = '';
  BranchID: string = '';
  UserName: string = '';
  FCMToken: string = '';
  ReceiverId: string = '';
  URL: string = 'wemessanger.azurewebsites.net';
  GroupId: string = '';
  Groupdetais?: GroupDetails;
  SelectedUser: User[] = [];
}

export default class AllGroupMember extends BaseComponent<
  any,
  AllGroupMemberViewModel
> {
  constructor(props: any) {
    super(props);
    this.state = new BaseState(new AllGroupMemberViewModel());
    this.state.Model.GroupId = props.route.params?.GroupID;
    this.state.Model.GroupName = props.route.params?.GroupName;
  }
  async componentDidMount() {
    var Model = this.state.Model;
    var ConnectionCode = await SessionHelper.GetCompanyIDSession();
    var FCMToken = await SessionHelper.GetFCMTokenSession();
    var BranchName = await SessionHelper.GetBranchNameSession();
    var UserName = await SessionHelper.GetUserNameSession();
    var BranchID = await SessionHelper.GetBranchIdSession();
    var ReceiverId = await SessionHelper.GetReceiverIDSession();
    Model.ConnectionCode = ConnectionCode;
    Model.BranchID = BranchID;
    this.UpdateViewModel();
    await this.FetchAllUser();
    // this.GetGroupDetails()
    console.log('Model.GroupId: ', Model.GroupId);
  }
  FetchAllUser = async () => {
    console.log('GroupchatFetchUser');

    var model = this.state.Model;
    var UserName = await SessionHelper.GetUserNameSession();
    var UserDetails = await SessionHelper.GetUserDetailsSession();
    var myId = `${model.ConnectionCode}_${UserDetails.lId}`;
    model.SenderID = myId;
    console.log('MyId: ', myId);

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
      this.UserList();
    });
    // this.IsTalking();
  };
  UserList = async () => {
    console.log('hii');
    var model = this.state.Model;
    var UserDetails = await SessionHelper.GetUserDetailsSession();
    var myId = `${model.ConnectionCode}_${UserDetails.lId}`;
    console.log(myId);
    var UserList = model.SingleRConnection.invoke('GetAllUser', myId, 0)
      .then((user: any) => {
        console.log(UserList);
        // console.log('GetallUser: ', user);
        model.alluser = user;
        model.FilterUser = model.alluser;
        model.FilterUser.forEach(obj => {
          obj['IsSelected'] = false;
        });
        this.UpdateViewModel();
        // console.log('UserOnline', UserOnline.length);

        model.SingleRConnection.invoke(
          'IsUserConnected',
          `${model.ConnectionCode}_${UserDetails.lId.toString()}`,
        );
        this.GetGroupDetails();
      })
      .catch((err: any) => {
        model.SingleRConnection.start();
        console.log('Error to invoke: ', err);
      });
  };
  ChangeCheckboxValue = async (
    SelectedMember: User,
    SelectedMemberID: string,
  ) => {
    console.log('SelectedMemberID: ', SelectedMemberID);

    var Model = this.state.Model;
    var Members = {
      memberId: Model.ConnectionCode + '_' + SelectedMemberID.toString(),
    };
    var Model = this.state.Model;
    SelectedMember.IsSelected = !SelectedMember.IsSelected;

    var Checking = Model.GroupMembers.find(
      i =>
        i.memberId == Model.ConnectionCode + '_' + SelectedMemberID.toString(),
    );
    console.log('GroupMembers: ', Model.GroupMembers);
    console.log('Members: ', Members);
    console.log('Checking: ', Checking);

    if (!Checking) {
      Model.GroupMembers.push(Members);
      this.UpdateViewModel();
    }

    if (Checking) {
      Model.GroupMembers = Model.GroupMembers.filter(
        i =>
          i.memberId !=
          Model.ConnectionCode + '_' + SelectedMemberID.toString(),
      );
      this.UpdateViewModel();
    }
  };
  GetGroupDetails = async () => {
    var Model = this.state.Model;
    var UserDetails = await SessionHelper.GetUserDetailsSession();
    var myId = `${Model.ConnectionCode}_${UserDetails.lId}`;
    axios
      .get(
        `http://${Model.URL}/api/user/groupdetail?userId=${myId}&groupId=${Model.GroupId}`,
      )
      .then(res => {
        // console.log('GroupDetailsResponse: ', res.data);
        Model.Groupdetais = res.data;

        this.UpdateViewModel();
        console.log('GroupDetailsResponse: ', Model.Groupdetais);
        Model.GroupName = Model.Groupdetais!.group.groupName;
        this.UpdateViewModel();
        Model.FilterUser.forEach(i => {
          Model.Groupdetais?.members.forEach(j => {
            if (j.memberId == i.lId.toString()) {
              i.IsSelected = true;
              Model.SelectedUser.push(i);
            }
          });
        });
        this.UpdateViewModel();
      })
      .catch((err: any) => {
        console.log('GroupDetailsError: ', err);
      });
  };
  render() {
    var model = this.state.Model;
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => {
              SessionHelper.SetGroupDetailUpdateSession(1);
              this.props.navigation.navigate('Groupchatdetails', {
                GroupID: model.GroupId,
                GroupName: model.Groupdetais?.group.groupName,
              });
            }}>
            <Image
              source={require('../../assets/backimg.png')}
              style={{height: 20, width: 20, marginLeft: 10}}
            />
          </TouchableOpacity>
          <View style={{flex: 1}}>
            <Text style={styles.title}>All Member</Text>
          </View>
        </View>
        <View style={{padding: 10}}>
          <View
            style={{
              flexDirection: 'row',
              display: 'flex',
              justifyContent: 'space-between',
            }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: 'bold',
                  color: '#0383FA',
                  marginLeft: 20,
                }}>
                {model.GroupName}
              </Text>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                //paddingRight: 5,
              }}></View>
          </View>
        </View>
        <Content>
          <List>
            {model.SelectedUser.length <= 0 && (
              <ActivityIndicator size="large" color="#0000ff" />
            )}

            {model.SelectedUser.length > 0 &&
              model.SelectedUser.map((i: User, index) => (
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
                    </View>
                  </Body>
                </ListItem>
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
    fontFamily: 'OpenSans-Bold',
    color: 'black',
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
