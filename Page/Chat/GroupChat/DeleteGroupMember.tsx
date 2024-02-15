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

import {TouchableOpacity} from 'react-native-gesture-handler';
import {Image} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import * as signalR from '@microsoft/signalr';
import axios from 'axios';
import User from '../../../Entity/User';
import {GroupDetails} from '../../../Entity/GroupDetails';
import BaseComponent from '../../../Core/BaseComponent';
import BaseState from '../../../Core/BaseState';
import SessionHelper from '../../../Core/SessionHelper';
import {Branch} from '../../../Entity/Branch';
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
// const navigation = useNavigation();
export class DeleteGroupMemberViewModel {
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
  Branch?: Branch;
  UserName: string = '';
  FCMToken: string = '';
  ReceiverId: string = '';
  URL: string = 'wemessanger.azurewebsites.net';
  GroupId: string = '';
  Groupdetais?: GroupDetails;
  SelectedUser: User[] = [];
}

export default class DeleteGroupMember extends BaseComponent<
  any,
  DeleteGroupMemberViewModel
> {
  constructor(props: any) {
    super(props);
    this.state = new BaseState(new DeleteGroupMemberViewModel());
    this.state.Model.GroupId = props.route.params?.GroupID;
  }
  async componentDidMount() {
    var Model = this.state.Model;
    var ConnectionCode = await SessionHelper.GetCompanyID();
    var FCMToken = await SessionHelper.GetDeviceId();
    var Branch = await SessionHelper.GetBranch();
    var UserInfo = await SessionHelper.GetUserDetails();
    var ReceiverId = await SessionHelper.GetReceiverID();

    Model.ConnectionCode = ConnectionCode;
    Model.Branch = Branch;
    this.UpdateViewModel();
    await this.FetchAllUser();
    // this.GetGroupDetails()
    console.log('Model.GroupId: ', Model.GroupId);
  }
  FetchAllUser = async () => {
    console.log('GroupchatFetchUser');

    var model = this.state.Model;
    var UserDetails = await SessionHelper.GetUserDetails();
    var myId = `${model.ConnectionCode}_${UserDetails?.lId}`;
    model.SenderID = myId;
    console.log('MyId: ', myId);

    this.UpdateViewModel();
    // console.log('MYID: ', model.SenderID);
    const deviceId = DeviceInfo.getDeviceId();

    model.SingleRConnection = new signalR.HubConnectionBuilder()
      .withUrl(
        `https://wemessanger.azurewebsites.net/chatHub?UserId=${
          model.ConnectionCode
        }_${UserDetails?.lId.toString()}`,
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
    var UserDetails = await SessionHelper.GetUserDetails();
    var myId = `${model.ConnectionCode}_${UserDetails?.lId}`;
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
          `${model.ConnectionCode}_${UserDetails?.lId.toString()}`,
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
    var UserDetails = await SessionHelper.GetUserDetails();
    var myId = `${Model.ConnectionCode}_${UserDetails?.lId}`;
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
  DeleteGroupMember = async () => {
    var Model = this.state.Model;
    var UserDetails = await SessionHelper.GetUserDetails();
    var myId = `${Model.ConnectionCode}_${UserDetails?.lId}`;
    var Headers = {
      'Content-Type': 'application/json',
    };
    var GroupMemberDeleteRequest = JSON.stringify({
      userId: myId,
      groupId: Model.GroupId,
      members: Model.GroupMembers,
    });
    console.log('GroupCreateRequest: ', GroupMemberDeleteRequest);
    axios
      .post(
        `https://${Model.URL}/api/user/deletemember`,
        GroupMemberDeleteRequest,
        {
          headers: Headers,
        },
      )
      .then(async res => {
        console.log('DeleteGroupresponse: ', res.data);
        if (res.data) {
          this.props.navigation.pop();
          SessionHelper.SetGroupDetailUpdateSession(1);
          // this.props.navigation.reset({
          //   routes: [
          //     {
          //       name: 'Groupchatdetails',
          //       params: {
          //         GroupID: Model.GroupId,
          //         GroupName: Model.Groupdetais?.group.groupName,
          //       },
          //     },
          //   ],
          // });
        }
      })
      .catch((err: any) => {
        console.log('DeleteGroupCreateError: ', err);
        Alert.alert(err);
      });
  };
  render() {
    var model = this.state.Model;
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => {
              this.props.navigation.pop();
            }}>
            <Image
              source={require('../../../assets/backimg.png')}
              style={{height: 20, width: 20, marginLeft: 10}}
            />
          </TouchableOpacity>
          <View style={{flex: 1}}>
            <Text style={styles.title}>Delete Member</Text>
          </View>
        </View>
        <View style={{padding: 10}}>
          <View
            style={{
              flexDirection: 'row',
              display: 'flex',
              justifyContent: 'space-between',
            }}>
            {model.GroupName?.length <= 15 ? (
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: 'bold',
                  color: '#0383FA',
                  marginLeft: 20,
                }}>
                {model.GroupName}
              </Text>
            ) : (
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: 'bold',
                  color: '#0383FA',
                  marginLeft: 20,
                }}>
                {model.GroupName?.slice(0, 15)}...
              </Text>
            )}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                //paddingRight: 5,
              }}>
              <TouchableOpacity onPress={this.DeleteGroupMember}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: 'bold',
                    alignSelf: 'flex-end',
                  }}>
                  Update
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <View>
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
                    <CheckBox
                      checked={i?.IsSelected}
                      color="green"
                      onPress={() =>
                        this.ChangeCheckboxValue(i, i.lId.toString())
                      }
                      style={{
                        height: 15,
                        width: 15,
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginRight: 20,
                      }}
                    />
                  </View>
                </Body>
              </ListItem>
            ))}
        </View>
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
