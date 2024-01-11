import React, {Component} from 'react';
import {Text, View} from 'react-native';

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
import BaseComponent from '../../Core/BaseComponent';
import BaseState from '../../Core/BaseState';
import {TouchableOpacity} from 'react-native-gesture-handler';
import axios from 'axios';
import alluser from '../../Entity/alluser';
import SessionHelper from '../../Core/SessionHelper';
import DeviceInfo from 'react-native-device-info';
import * as signalR from '@microsoft/signalr';
import messaging from '@react-native-firebase/messaging';
import {PermissionsAndroid} from 'react-native';
// const navigation = useNavigation();
export class allchatpageViewModel {
  alluser: alluser[] = [];
  UserName: string = '';
  SenderId?: number;
  Sender: any;
}

export default class Allmessage extends BaseComponent<
  any,
  allchatpageViewModel
> {
  constructor(props: any) {
    super(props);
    this.state = new BaseState(new allchatpageViewModel());
  }
  async componentDidMount() {
    PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
    this.Fetchmessage();
 
  }
  Fetchmessage = async () => {
    var model = this.state.Model;
    var UserName = await SessionHelper.GetUserNameSession();
    var UserDetails = await SessionHelper.GetUserDetailsSession();
    var myId = `u_${UserDetails.lId}`;
    const deviceId = DeviceInfo.getDeviceId();
    var Connection = new signalR.HubConnectionBuilder()
      .withUrl('https://wemessanger.azurewebsites.net/chatHub')
      .build();
    Connection.start().then(() => {
      console.log('SignalR connected');
      Connection.invoke('GetAllUser', myId, 0)
        .then(user => {
          // console.log(user);
          model.alluser = user;
          this.UpdateViewModel();
        })
        .catch((err: any) => {
          console.log('Error to invoke: ', err);
        });
    });
  };
  NextPage = (user: alluser) => {
    var Model = this.state.Model;
    this.props.navigation.navigate('Chatdetails', {
      User: user,
      // SenderID: Model.SenderId,
    });
    // console.log("ModelSenderID: ",Model.SenderId,);
  };
  render() {
    var model = this.state.Model;
    return (
      <Container>
        {/* <Header /> */}
        <Content>
          <List>
            {model.alluser.map((i: alluser) => (
              <TouchableOpacity onPress={() => this.NextPage(i)}>
                <ListItem avatar>
                  <Left>
                    {/* <Thumbnail
                    source={{
                      uri: 'https://filmfare.wwmindia.com/content/2020/nov/hrithik-roshan-411605007858.jpg',
                    }}
                    style={{height: 40, width: 40}}
                  /> */}
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
                        }}>
                        {i.userFullName.charAt(0)}
                      </Text>
                    </Badge>
                  </Left>
                  <Body>
                    <Text
                      style={{
                        color: 'black',
                        fontWeight: '600',
                        fontFamily: 'OpenSans-VariableFont_wdth,wght',
                        marginBottom: 5,
                      }}>
                      {i.userFullName}
                    </Text>
                    <Text
                      style={{
                        color: i.status ? '#0383FA' : '#a6a6a6',
                        fontWeight: '200',
                        fontFamily: 'OpenSans-VariableFont_wdth,wght',
                        fontSize: 12,
                      }}>
                      {i.message ? i.message : 'No message'}
                    </Text>
                  </Body>
                  <Right></Right>
                </ListItem>
              </TouchableOpacity>
            ))}

           
          </List>
        </Content>
      </Container>
    );
  }
}
